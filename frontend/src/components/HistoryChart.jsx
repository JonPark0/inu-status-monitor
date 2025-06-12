// src/components/HistoryChart.jsx
import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const HistoryChart = ({ services }) => {
  // Generate mock historical data for demonstration
  const generateHistoryData = () => {
    const data = []
    const now = new Date()
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      const entry = {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: time.getTime()
      }
      
      services.forEach(service => {
        // Generate realistic response times with some variation
        const baseTime = service.status === 'online' ? 800 : service.status === 'slow' ? 5000 : 0
        const variation = Math.random() * 500
        entry[service.name] = service.status === 'down' ? null : baseTime + variation
      })
      
      data.push(entry)
    }
    
    return data
  }

  const data = generateHistoryData()
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-navy-900 mb-4">Response Time History (24 Hours)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`${Math.round(value)}ms`, 'Response Time']}
            />
            <Legend />
            {services.map((service, index) => (
              <Line
                key={service.name}
                type="monotone"
                dataKey={service.name}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default HistoryChart