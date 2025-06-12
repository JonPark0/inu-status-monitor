// src/components/IncidentTimeline.jsx
import React from 'react'
import { Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const IncidentTimeline = ({ incidents }) => {
  // Mock incidents for demonstration
  const mockIncidents = [
    {
      id: '1',
      service: 'Course Registration',
      type: 'outage',
      title: 'Course Registration System Maintenance',
      description: 'Scheduled maintenance window for course registration system upgrades.',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: 'resolved',
      severity: 'medium'
    },
    {
      id: '2',
      service: 'Library',
      type: 'slowdown',
      title: 'Library System Performance Degradation',
      description: 'Users experiencing slower response times when accessing digital resources.',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      endTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      status: 'resolved',
      severity: 'low'
    },
    {
      id: '3',
      service: 'SSO Login',
      type: 'outage',
      title: 'SSO Authentication Issues',
      description: 'Some users unable to authenticate through the SSO portal. Issue has been identified and resolved.',
      startTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      endTime: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
      status: 'resolved',
      severity: 'high'
    }
  ]

  const displayIncidents = incidents.length > 0 ? incidents : mockIncidents

  const getIncidentIcon = (type, status) => {
    if (status === 'resolved') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    
    switch (type) {
      case 'outage':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'slowdown':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'maintenance':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDuration = (start, end) => {
    const duration = end - start
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-navy-900 mb-6">Recent Incidents</h3>
      
      {displayIncidents.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">No recent incidents to report</p>
          <p className="text-sm text-gray-500 mt-1">All services are running normally</p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayIncidents.map((incident, index) => (
            <div key={incident.id} className="relative">
              {/* Timeline line */}
              {index < displayIncidents.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <div className="flex space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getIncidentIcon(incident.type, incident.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-navy-900">
                        {incident.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {incident.service} • {incident.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        incident.status === 'resolved' 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500 space-y-1">
                    <div className="flex items-center space-x-4">
                      <span>
                        Started: {incident.startTime.toLocaleString()}
                      </span>
                      {incident.endTime && (
                        <>
                          <span>•</span>
                          <span>
                            Resolved: {incident.endTime.toLocaleString()}
                          </span>
                          <span>•</span>
                          <span>
                            Duration: {formatDuration(incident.startTime, incident.endTime)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default IncidentTimeline