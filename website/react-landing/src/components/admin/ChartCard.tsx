import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface ChartCardProps {
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
  type?: 'line' | 'area';
}

export const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  data, 
  dataKey, 
  xAxisKey, 
  color = "#F97316", 
  height = 300,
  type = 'line'
}) => {
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 transition-all hover:border-white/10 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[14px] font-bold text-white tracking-tight">{title}</h3>
        <div className="flex items-center gap-4 text-[11px] font-bold text-brand-text-dim uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {dataKey}
          </div>
        </div>
      </div>
      
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
              <XAxis 
                dataKey={xAxisKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111', 
                  border: '1px solid #333',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                fillOpacity={1} 
                fill={`url(#gradient-${dataKey})`} 
                strokeWidth={2.5}
                dot={{ r: 0 }}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
              <XAxis 
                dataKey={xAxisKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111', 
                  border: '1px solid #333',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2.5}
                dot={{ r: 0 }}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
