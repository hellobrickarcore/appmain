import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ChartCard } from '../../components/admin/ChartCard';
import { StatCard } from '../../components/admin/StatCard';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

const BRICK_DISTRIBUTION = [
  { name: 'Bricks', value: 45 },
  { name: 'Plates', value: 25 },
  { name: 'Technic', value: 15 },
  { name: 'Slopes', value: 10 },
  { name: 'Others', value: 5 },
];

const COLOR_DISTRIBUTION = [
  { name: 'White', count: 1240, color: '#FFFFFF' },
  { name: 'Black', count: 980, color: '#000000' },
  { name: 'Red', count: 850, color: '#EF4444' },
  { name: 'Blue', count: 720, color: '#3B82F6' },
  { name: 'Yellow', count: 640, color: '#FFD600' },
];

const RETENTION_DATA = [
  { name: 'Day 1', value: 65 },
  { name: 'Day 3', value: 45 },
  { name: 'Day 7', value: 32 },
  { name: 'Day 14', value: 24 },
  { name: 'Day 30', value: 18 },
];

export const Analytics: React.FC = () => {
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
                {COLOR_DISTRIBUTION.map((color, i) => (
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
                          style={{ width: `${(color.count / 1240) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#111] border border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center">
              <h3 className="text-[14px] font-bold text-white mb-8 tracking-tight uppercase self-start">Parts Hierarchy</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={BRICK_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {BRICK_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#FFD600', '#F97316', '#FFF', '#333', '#111'][index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-4 mt-4 w-full px-8">
                {BRICK_DISTRIBUTION.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#FFD600', '#F97316', '#FFF', '#333', '#111'][i] }} />
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
                  data={RETENTION_DATA} 
                  dataKey="value" 
                  xAxisKey="name" 
                  type="area" 
                  color="#F97316"
                  height={240}
                />
              </div>
              <div className="space-y-4">
                <StatCard title="Avg Session Length" value="8.4m" subtitle="+12% from previous week" />
                <StatCard title="Scans / Session" value="4.2" subtitle="Stabilizing after v1.5" />
              </div>
            </div>
        </section>

        {/* Section 3: Collection Behavior */}
        <section className="bg-[#111] border border-white/5 rounded-[40px] p-10 overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h2 className="text-3xl font-black text-white tracking-tighter leading-none">The collection <br/><span className="text-brand-yellow">network effect</span></h2>
              <p className="text-brand-text-dim text-lg leading-relaxed max-w-md font-medium">
                As users add more bricks to their digital vault, the recommendation engine for "Build Ideas" becomes <span className="text-white">exponentially</span> more accurate.
              </p>
              <div className="flex justify-center md:justify-start gap-8">
                <div>
                  <div className="text-2xl font-black text-white leading-none mb-1">1.2M</div>
                  <div className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest leading-none">Total Bricks Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white leading-none mb-1">142</div>
                  <div className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest leading-none">Avg Collection Size</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-96 aspect-square bg-white/5 rounded-full border border-white/10 flex items-center justify-center p-12 relative">
               <div className="absolute inset-0 bg-brand-yellow/5 animate-pulse rounded-full" />
               <div className="text-center">
                  <span className="text-5xl font-black text-brand-yellow">+24%</span>
                  <p className="text-[11px] font-black text-brand-text-dim uppercase tracking-[.2em] mt-2 leading-none whitespace-nowrap">Monthly Growth Rate</p>
               </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};
