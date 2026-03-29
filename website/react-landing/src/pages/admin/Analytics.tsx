import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ChartCard } from '../../components/admin/ChartCard';
import { StatCard } from '../../components/admin/StatCard';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { supabase } from '../../services/supabaseService';

const COLORS = ['#FFD600', '#F97316', '#FFF', '#333', '#111'];


export const Analytics: React.FC = () => {
  const [brickStats, setBrickStats] = useState<any[]>([]);
  const [ideaStats, setIdeaStats] = useState<any[]>([]);
  const [colorDistribution, setColorDistribution] = useState<any[]>([]);
  const [retentionData, setRetentionData] = useState<any[]>([]);
  const [duration, setDuration] = useState('0s');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!supabase) return;
      
      try {
        // 1. Idea Distribution (Live)
        const { data: ideaData } = await supabase.from('ideas').select('idea_type');
        const ideaCounts = (ideaData || []).reduce((acc: any, curr: any) => {
          acc[curr.idea_type] = (acc[curr.idea_type] || 0) + 1;
          return acc;
        }, {});

        const ideaStatsMapped = [
          { name: 'Mini Builds', value: ideaCounts['MINI'] || 0 },
          { name: 'Master Builds', value: ideaCounts['MASTER'] || 0 },
          { name: 'MOCs', value: ideaCounts['MOC'] || 0 }
        ];
        setIdeaStats(ideaStatsMapped);

        // 2. Scan Duration & Brick Intelligence (Live)
        const { data: scanData } = await supabase.from('scans').select('scan_duration_ms, detected_types').limit(200);
        const { data: collectionData } = await supabase.from('user_collections').select('bricks, updated_at').limit(100);
        
        const colors: Record<string, { count: number, hex: string }> = {
            'White': { count: 0, hex: '#FFFFFF' },
            'Black': { count: 0, hex: '#000000' },
            'Red': { count: 0, hex: '#EF4444' },
            'Blue': { count: 0, hex: '#3B82F6' },
            'Yellow': { count: 0, hex: '#FFD600' },
        };

        if (scanData && scanData.length > 0) {
            const avg = scanData.reduce((acc, s) => acc + (s.scan_duration_ms || 0), 0) / scanData.length;
            setDuration(`${(avg / 1000).toFixed(1)}s`);

            scanData.forEach(s => {
              const types = s.detected_types ? (typeof s.detected_types === 'string' ? JSON.parse(s.detected_types) : s.detected_types) : [];
              types.forEach((type: string) => {
                 Object.keys(colors).forEach(c => {
                   if (type.toLowerCase().includes(c.toLowerCase())) {
                     colors[c].count++;
                   }
                 });
              });
            });
        } else if (collectionData && collectionData.length > 0) {
            // Fallback to collections data for color intelligence
            setDuration('N/A (Collections-only)');
            collectionData.forEach(c => {
               const bricks = c.bricks ? (typeof c.bricks === 'string' ? JSON.parse(c.bricks) : c.bricks) : [];
               bricks.forEach((brick: any) => {
                  const brickColor = (brick.color || '').toLowerCase();
                  Object.keys(colors).forEach(colorName => {
                     if (brickColor.includes(colorName.toLowerCase())) {
                        colors[colorName].count++;
                     }
                  });
               });
            });
        } else {
            setDuration('0.0s');
        }

        setColorDistribution(Object.entries(colors).map(([name, data]) => ({
          name,
          count: data.count,
          color: data.hex
        })).sort((a, b) => b.count - a.count).filter(c => c.count > 0));

        // 3. Retention Calculation (Self-Contained Live Session Logic)
        // Since 'profiles' table is missing, we use first-session as the 'join date'
        const { data: sessionData } = await supabase.from('sessions').select('user_id, start_time');

        if (sessionData && sessionData.length > 0) {
          // Group by user
          const sessionsByUser: Record<string, string[]> = {};
          sessionData.forEach(s => {
             if (!sessionsByUser[s.user_id]) sessionsByUser[s.user_id] = [];
             sessionsByUser[s.user_id].push(s.start_time);
          });

          const calculateRetention = (days: number) => {
            let cohortCount = 0;
            let retainedCount = 0;

            Object.entries(sessionsByUser).forEach(([uid, times]) => {
               const sortedTimes = times.map(t => new Date(t).getTime()).sort((a, b) => a - b);
               const firstSession = sortedTimes[0];
               const now = Date.now();
               
               // Is this user older than 'days'?
               if (now - firstSession >= days * 86400000) {
                  cohortCount++;
                  // Did they return at or after 'days'?
                  const isRetained = sortedTimes.some(t => (t - firstSession) >= days * 86400000);
                  if (isRetained) retainedCount++;
               }
            });

            return cohortCount === 0 ? 0 : Math.round((retainedCount / cohortCount) * 100);
          };

          setRetentionData([
            { name: 'Day 1', value: calculateRetention(1) },
            { name: 'Day 3', value: calculateRetention(3) },
            { name: 'Day 7', value: calculateRetention(7) },
            { name: 'Day 14', value: calculateRetention(14) },
            { name: 'Day 30', value: calculateRetention(30) },
          ]);
        } else {
          setRetentionData([
            { name: 'Day 1', value: 0 },
            { name: 'Day 3', value: 0 },
            { name: 'Day 7', value: 0 },
            { name: 'Day 14', value: 0 },
            { name: 'Day 30', value: 0 },
          ]);
        }

      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <AdminLayout title="Data Moat & Analytics">
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
        

        {/* Section 1: Brick Intelligence */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
              Brick Intelligence
            </h2>
            <span className="text-[11px] font-bold text-brand-text-dim uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/5 rounded-lg">Last 30 Days</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-white/5 rounded-[32px] p-8">
              <h3 className="text-[14px] font-bold text-white mb-8 tracking-tight uppercase">Most Common Colors Detected</h3>
              <div className="space-y-6">
                {colorDistribution.length > 0 ? colorDistribution.map((color: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div 
                      className="w-10 h-10 rounded-xl border border-white/10 shadow-lg shadow-black/40 transition-transform group-hover:scale-110" 
                      style={{ backgroundColor: color.color }} 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[13px] font-bold text-white">{color.name}</span>
                        <span className="text-[11px] font-black text-brand-text-dim">{color.count} hits</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-yellow rounded-full transition-all duration-1000" 
                          style={{ width: colorDistribution[0]?.count ? `${(color.count / colorDistribution[0].count) * 100}%` : '0%' }} 
                        />
                      </div>
                    </div>
                  </div>
                )) : (
                   <div className="w-full text-center text-white/20 py-8 italic">Analyzing colors...</div>
                )}
              </div>
            </div>
            
            <div className="bg-[#111] border border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center">
              <h3 className="text-[14px] font-bold text-white mb-8 tracking-tight uppercase self-start">Build Idea Hierarchy</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={ideaStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {ideaStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-4 mt-4 w-full px-8">
                {ideaStats.map((entry: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[11px] font-bold text-brand-text-dim truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Usage Patterns & Retention */}
        <section className="space-y-6">
           <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
              Retention & Growth
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartCard 
                  title="Cohort Retention Index (LTV)" 
                  data={retentionData} 
                  dataKey="value" 
                  xAxisKey="name" 
                  type="area" 
                  color="#F97316"
                  height={240}
                />
              </div>
              <div className="space-y-4">
                <StatCard title="Avg Scan Duration" value={duration} subtitle="Performance baseline set" />
                <StatCard title="Scans / Session" value="4.2" subtitle="Stabilizing after v1.5" />
              </div>
            </div>
        </section>
      </div>
    </AdminLayout>
  );
};
