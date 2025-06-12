// src/utils/api.js
import axios from 'axios'

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

export const checkServiceStatus = async (url) => {
  try {
    const response = await api.post('/check-service', { url })
    return response.data
  } catch (error) {
    // Fallback: simulate checking for development
    if (process.env.NODE_ENV === 'development') {
      return simulateServiceCheck(url)
    }
    throw error
  }
}

export const getServiceHistory = async (serviceId, hours = 24) => {
  try {
    const response = await api.get(`/services/${serviceId}/history?hours=${hours}`)
    return response.data
  } catch (error) {
    console.error('Error fetching service history:', error)
    return []
  }
}

export const getIncidents = async () => {
  try {
    const response = await api.get('/incidents')
    return response.data
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return []
  }
}

export const createIncident = async (incident) => {
  try {
    const response = await api.post('/incidents', incident)
    return response.data
  } catch (error) {
    console.error('Error creating incident:', error)
    throw error
  }
}

export const updateIncident = async (incidentId, updates) => {
  try {
    const response = await api.put(`/incidents/${incidentId}`, updates)
    return response.data
  } catch (error) {
    console.error('Error updating incident:', error)
    throw error
  }
}

// Development simulation function
const simulateServiceCheck = (url) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate different response times and statuses
      const random = Math.random()
      let status, responseTime

      if (random < 0.7) {
        // 70% chance of being online
        status = 'online'
        responseTime = Math.floor(Math.random() * 2000) + 200 // 200-2200ms
      } else if (random < 0.9) {
        // 20% chance of being slow
        status = 'slow'
        responseTime = Math.floor(Math.random() * 8000) + 3000 // 3000-11000ms
      } else {
        // 10% chance of being down
        status = 'down'
        responseTime = null
      }

      // Calculate uptime (simulate 95-99.9% uptime)
      const uptime = 95 + Math.random() * 4.9

      resolve({
        status,
        responseTime,
        uptime: parseFloat(uptime.toFixed(2)),
        timestamp: new Date().toISOString()
      })
    }, Math.random() * 1000 + 500) // 500-1500ms delay
  })
}
