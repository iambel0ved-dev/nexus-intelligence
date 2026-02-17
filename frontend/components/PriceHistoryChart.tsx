"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PriceHistoryChart({ data }: { data: any[] }) {
  // PHASE 3: Mapping from price_snapshots table data
  const chartData = data.map(item => ({
    date: new Date(item.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: item.price_value || item.new_price, // Fallback for flexibility
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fill: '#64748b'}} 
          />
          <YAxis 
            hide 
            domain={['auto', 'auto']} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.05)', 
              color: '#fff',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#3b82f6' }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={{ r: 0 }} // Clean line, dots on hover only
            activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}