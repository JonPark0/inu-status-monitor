// src/hooks/useServiceStatus.js
import { useState, useEffect, useCallback } from 'react'
import { checkServiceStatus, getServiceHistory, getIncidents } from '../utils/api'

const useServiceStatus = (initialServices) => {
  const [services, setServices] = useState(
    initialServices.map(service => ({
      ...service,
      status: 'checking',
      responseTime: null,
      lastChecked: null,
      uptime: null
    }))
  )
  const [incidents, setIncidents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  const checkAllServices = useCallback(async () => {
    try {
      setIsLoading(true)
      const results = await Promise.allSettled(
        services.map(service => checkServiceStatus(service.url))
      )

      const updatedServices = services.map((service, index) => {
        const result = results[index]
        if (result.status === 'fulfilled') {
          const { status, responseTime, uptime } = result.value
          return {
            ...service,
            status,
            responseTime,
            uptime,
            lastChecked: new Date().toISOString()
          }
        } else {
          return {
            ...service,
            status: 'down',
            responseTime: null,
            lastChecked: new Date().toISOString()
          }
        }
      })

      setServices(updatedServices)
      setLastUpdate(new Date().toISOString())
    } catch (error) {
      console.error('Error checking services:', error)
    } finally {
      setIsLoading(false)
    }
  }, [services])

  const loadIncidents = useCallback(async () => {
    try {
      const incidentData = await getIncidents()
      setIncidents(incidentData)
    } catch (error) {
      console.error('Error loading incidents:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    checkAllServices()
    loadIncidents()
  }, [])

  // Set up interval for automatic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      checkAllServices()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [checkAllServices, refreshInterval])

  return {
    services,
    incidents,
    isLoading,
    lastUpdate,
    refreshInterval,
    setRefreshInterval,
    checkAllServices,
    loadIncidents
  }
}

export default useServiceStatus