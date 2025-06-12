// backend/src/services/monitoringService.js
const cron = require('node-cron')
const axios = require('axios')
const database = require('../database/connection')
const logger = require('../utils/logger')
const { classifyStatus, createIncidentIfNeeded } = require('../utils/helpers')

class MonitoringService {
  constructor() {
    this.isRunning = false
    this.checkInterval = process.env.CHECK_INTERVAL || 30000 // 30 seconds
  }

  startMonitoring() {
    if (this.isRunning) {
      logger.warn('Monitoring service is already running')
      return
    }

    // Schedule monitoring every 30 seconds (or configured interval)
    const cronExpression = this.intervalToCron(this.checkInterval)
    
    cron.schedule(cronExpression, async () => {
      await this.checkAllServices()
    })

    this.isRunning = true
    logger.info(`Monitoring service started with ${this.checkInterval}ms interval`)

    // Run initial check
    this.checkAllServices()
  }

  intervalToCron(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000)
    if (seconds < 60) {
      return `*/${seconds} * * * * *`
    } else {
      const minutes = Math.floor(seconds / 60)
      return `*/${minutes} * * * *`
    }
  }

  async checkAllServices() {
    try {
      const result = await database.query('SELECT * FROM services')
      const services = result.rows

      const checkPromises = services.map(service => this.checkService(service))
      await Promise.allSettled(checkPromises)

      logger.info(`Completed health check for ${services.length} services`)
    } catch (error) {
      logger.error('Error in checkAllServices:', error)
    }
  }

  async checkService(service) {
    const startTime = Date.now()
    let status = 'down'
    let responseTime = null
    let errorMessage = null

    try {
      const response = await axios.get(service.url, {
        timeout: 10000,
        validateStatus: () => true, // Accept any status code
        headers: {
          'User-Agent': 'INU-Status-Monitor/1.0'
        }
      })

      responseTime = Date.now() - startTime
      status = classifyStatus(response.status, responseTime)

      if (response.status >= 400) {
        errorMessage = `HTTP ${response.status}`
      }

    } catch (error) {
      responseTime = Date.now() - startTime
      status = 'down'
      errorMessage = error.message

      logger.warn(`Service check failed for ${service.name}:`, {
        url: service.url,
        error: error.message,
        responseTime
      })
    }

    // Save check result
    try {
      await database.query(
        'INSERT INTO service_checks (service_id, status, response_time, error_message) VALUES ($1, $2, $3, $4)',
        [service.id, status, responseTime, errorMessage]
      )

      // Check if we need to create an incident
      await createIncidentIfNeeded(service, status)

    } catch (error) {
      logger.error(`Failed to save check result for ${service.name}:`, error)
    }

    return { service, status, responseTime, errorMessage }
  }

  async getServiceStatus(serviceId, hours = 24) {
    try {
      const result = await database.query(`
        SELECT status, response_time, checked_at, error_message
        FROM service_checks 
        WHERE service_id = $1 AND checked_at > NOW() - INTERVAL '${hours} hours'
        ORDER BY checked_at DESC
      `, [serviceId])

      return result.rows
    } catch (error) {
      logger.error('Error getting service status:', error)
      return []
    }
  }

  async getAllServicesCurrentStatus() {
    try {
      const result = await database.query(`
        SELECT 
          s.id,
          s.name,
          s.url,
          s.description,
          COALESCE(latest.status, 'unknown') as status,
          latest.response_time,
          latest.checked_at as last_checked,
          COALESCE(uptime.uptime_percentage, 0) as uptime
        FROM services s
        LEFT JOIN LATERAL (
          SELECT status, response_time, checked_at
          FROM service_checks sc
          WHERE sc.service_id = s.id
          ORDER BY checked_at DESC
          LIMIT 1
        ) latest ON true
        LEFT JOIN LATERAL (
          SELECT 
            ROUND(
              (COUNT(CASE WHEN status IN ('online', 'slow') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 
              2
            ) as uptime_percentage
          FROM service_checks sc
          WHERE sc.service_id = s.id 
            AND sc.checked_at > NOW() - INTERVAL '24 hours'
        ) uptime ON true
        ORDER BY s.id
      `)

      return result.rows
    } catch (error) {
      logger.error('Error getting all services status:', error)
      return []
    }
  }
}

module.exports = new MonitoringService()