import React from 'react';
import { StatCard } from '../../components/admin/StatCard';
import { ChartCard } from '../../components/admin/ChartCard';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const MOCK_SCANS_DATA = [
  { name: 'Mar 21', value: 420 },
  { name: 'Mar 22', value: 580 },
  { name: 'Mar 23', value: 490 },
  { name: 'Mar 24', value: 710 },
  { name: 'Mar 25', value: 850 },
  { name: 'Mar 26', value: 1020 },
  { name: 'Mar 27', value: 920 },
];

const MOCK_INSTALLS_DATA = [
  { name: 'Mar 21', installs: 85, ideas: 45 },
  { name: 'Mar 22', installs: 120, ideas: 60 },
  { name: 'Mar 23', installs: 95, ideas: 55 },
  { name: 'Mar 24', installs: 150, ideas: 90 },
  { name: 'Mar 25', installs: 180, ideas: 110 },
  { name: 'Mar 26', installs: 210, ideas: 140 },
  { name: 'Mar 27', installs: 195, ideas: 125 },
];

const MOCK_TOP_BRICKS = [
  { type: '3001 (2x4)', count: 2450 },
  { type: '3003 (2x2)', count: 1820 },
  { type: '3023 (1x2 Plate)', count: 1640 },
  { type: '3010 (1x4)', count: 1120 },
  { type: '3622 (1x3)', count: 980 },
];

const COLORS = ['#FFD600', '#F97316', '#FFFFFF20', '#FFFFFF10', '#FFFFFF05'];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Total Installs" 
          value="12,480" 
          trend={{ value: 12, isPositive: true }} 
          subtitle="+195 today"
        />
        <StatCard 
          title="Daily Active Users" 
          value="1,842" 
          trend={{ value: 8, isPositive: true }} 
          subtitle="Record peak at 11am"
        />
        <StatCard 
          title="Scans Today" 
          value="920" 
          trend={{ value: 15, isPositive: true }} 
          subtitle="84% confidence avg"
        />
        <StatCard 
          title="Avg Bricks / Scan" 
          value="14.2" 
          trend={{ value: 2, isPositive: false }} 
          subtitle="Stable last 7 days"
        />
        <StatCard 
          title="Ideas Generated" 
          value="456" 
          trend={{ value: 24, isPositive: true }} 
          subtitle="50% CR (Scan -> Idea)"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard 
            title="Scan Activity (Last 7 Days)" 
            data={MOCK_SCANS_DATA} 
            dataKey="value" 
            xAxisKey="name" 
            type="area"
            color="#FFD600"
          />
        </div>
        <div className="space-y-6">
          <ChartCard 
            title="Installs vs. Ideas" 
            data={MOCK_INSTALLS_DATA} 
            dataKey="installs" 
            xAxisKey="name" 
            color="#F97316"
            height={130}
          />
          <ChartCard 
            title="Retention Index" 
            data={MOCK_INSTALLS_DATA} 
            dataKey="ideas" 
            xAxisKey="name" 
            color="#FFF"
            height={130}
          />
        </div>
      </div>

      {/* Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Bricks Intelligence */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h3 className="text-[14px] font-bold text-white mb-8 tracking-tight">Brick Intelligence (Top 5)</h3>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={MOCK_TOP_BRICKS} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="type" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 11, fontWeight: 700 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {MOCK_TOP_BRICKS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Analytics */}
        <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-2xl p-6">
          <h3 className="text-[14px] font-bold text-white mb-8 tracking-tight">Growth Funnel</h3>
          <div className="flex items-center justify-between h-[240px] px-8 relative">
            {[
              { label: 'Install', value: '100%', sub: '2.4k' },
              { label: 'Open', value: '85%', sub: '2.0k', color: '#F97316' },
              { label: 'Scan', value: '42%', sub: '1.0k', color: '#FFD600' },
              { label: 'Idea', value: '21%', sub: '0.5k', color: '#FFF' },
              { label: 'Repeat', value: '12%', sub: '0.3k', color: '#888' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div 
                  className="w-16 rounded-2xl mb-4 border border-white/5 flex items-center justify-center font-black transition-all group-hover:scale-110"
                  style={{ 
                    height: `${parseInt(step.value) * 1.5 + 40}px`,
                    backgroundColor: step.color || '#33333330',
                    color: i === 0 || i === 3 || i === 4 ? '#fff' : '#000'
                  }}
                >
                  {step.value}
                </div>
                <span className="text-[11px] font-bold text-white mb-1 uppercase tracking-wider">{step.label}</span>
                <span className="text-[10px] font-medium text-brand-text-dim">{step.sub}</span>
              </div>
            ))}
            
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -z-10" />
          </div>
        </div>
      </div>
    </div>
  );
};
