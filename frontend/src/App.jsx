// src/App.jsx
import React, { useState, useEffect } from 'react'
import { Monitor, Clock, Activity, AlertCircle, Settings, RefreshCw } from 'lucide-react'
import StatusCard from './components/StatusCard'
import HistoryChart from './components/HistoryChart'
import IncidentTimeline from './components/IncidentTimeline'
import StatusSummary from './components/StatusSummary'
import useServiceStatus from './hooks/useServiceStatus'

const SERVICES = [
  { id: 'main', name: 'Main Portal', url: 'https://inu.ac.kr', description: 'University main website' },
  { id: 'sso', name: 'SSO Login', url: 'https://portal.inu.ac.kr:444', description: 'Single Sign-On portal' },
  { id: 'cyber', name: 'E-Learning', url: 'https://cyber.inu.ac.kr', description: 'Online learning platform' },
  { id: 'starinu', name: 'Student Services', url: 'https://starinu.inu.ac.kr', description: 'Student service portal' },
  { id: 'library', name: 'Library', url: 'https://lib.inu.ac.kr', description: 'Digital library system' },
  { id: 'erp', name: 'ERP System', url: 'https://erp.inu.ac.kr:8443', description: 'Student information system' },
  { id: 'sugang', name: 'Course Registration', url: 'https://sugang.inu.ac.kr', description: 'Course registration portal' }
]

function App() {
  const { services, incidents, isLoading, lastUpdate, refreshInterval, setRefreshInterval } = useServiceStatus(SERVICES)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSettings, setShowSettings] = useState(false)

  const getStatusCounts = () => {
    const counts = { online: 0, slow: 0, down: 0 }
    services.forEach(service => {
      counts[service.status]++
    })
    return counts
  }

  const statusCounts = getStatusCounts()
  const overallStatus = statusCounts.down > 0 ? 'down' : statusCounts.slow > 0 ? 'slow' : 'online'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Monitor className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-navy-900">INU Service Status</h1>
                <p className="text-sm text-gray-600">Incheon National University</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <StatusSummary status={overallStatus} counts={statusCounts} />
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Refresh Interval:
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={15000}>15 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={300000}>5 minutes</option>
              </select>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Monitor },
              { id: 'history', name: 'History', icon: Activity },
              { id: 'incidents', name: 'Incidents', icon: AlertCircle }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">Loading status...</span>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <StatusCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <HistoryChart services={services} />
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <IncidentTimeline incidents={incidents} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 Incheon National University - Service Status Monitor
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Auto-refresh every {refreshInterval / 1000}s</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App