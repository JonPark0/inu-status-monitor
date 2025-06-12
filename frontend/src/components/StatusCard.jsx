// src/components/StatusCard.jsx
import React from 'react'
import { Clock, ExternalLink, AlertTriangle, CheckCircle, Timer } from 'lucide-react'

const StatusCard = ({ service }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'slow':
        return <Timer className="h-5 w-5 text-yellow-600" />
      case 'down':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'slow':
        return 'Slow Response'
      case 'down':
        return 'Down'
      default:
        return 'Checking...'
    }
  }

  const getResponseTimeColor = (responseTime) => {
    if (responseTime < 1000) return 'text-green-600'
    if (responseTime < 3000) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`status-card status-${service.status} p-6 animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`status-indicator ${service.status}`}></div>
          <div>
            <h3 className="text-lg font-semibold text-navy-900">{service.name}</h3>
            <p className="text-sm text-gray-600">{service.description}</p>
          </div>
        </div>
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-primary-600 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(service.status)}
            <span className={`text-sm font-medium ${
              service.status === 'online' ? 'text-green-600' :
              service.status === 'slow' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {getStatusText(service.status)}
            </span>
          </div>
        </div>

        {service.responseTime && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Response Time:</span>
            <span className={`text-sm font-medium ${getResponseTimeColor(service.responseTime)}`}>
              {service.responseTime}ms
            </span>
          </div>
        )}

        {service.uptime && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Uptime (24h):</span>
            <span className="text-sm font-medium text-gray-900">
              {service.uptime.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {service.lastChecked && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default StatusCard