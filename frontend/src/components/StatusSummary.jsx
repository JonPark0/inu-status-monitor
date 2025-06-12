// src/components/StatusSummary.jsx
import React from 'react'
import { CheckCircle, AlertTriangle, Timer } from 'lucide-react'

const StatusSummary = ({ status, counts }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'slow':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4" />
      case 'slow':
        return <Timer className="h-4 w-4" />
      case 'down':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'All Systems Operational'
      case 'slow':
        return 'Some Services Slow'
      case 'down':
        return 'Service Disruption'
      default:
        return 'Checking Services'
    }
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-md border ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span className="text-sm font-medium">{getStatusText(status)}</span>
      <div className="hidden sm:flex items-center space-x-3 ml-2 pl-2 border-l border-current border-opacity-30">
        <span className="text-xs">
          {counts.online} Online
        </span>
        {counts.slow > 0 && (
          <span className="text-xs">
            {counts.slow} Slow
          </span>
        )}
        {counts.down > 0 && (
          <span className="text-xs">
            {counts.down} Down
          </span>
        )}
      </div>
    </div>
  )
}

export default StatusSummary