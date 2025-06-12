// backend/src/routes/status.js
const express = require('express')
const router = express.Router()
const database = require('../database/connection')
const monitoringService = require('../services/monitoringService')
const logger = require('../utils/logger')

// Get current status of all services
router.get('/', async (req, res) => {
  try {
    const services = await monitoringService.getAllServicesCurrentStatus()
    res.json(services)
  } catch (error) {
    logger.error('Error getting service status:', error)
    res.status(500).json({ error: 'Failed to get service status' })
  }
})

// Get detailed history for a specific service
router.get('/:serviceId/history', async (req, res) => {
  try {
    const { serviceId } = req.params
    const { hours = 24 } = req.query
    
    const checks = await monitoringService.getServiceStatus(serviceId, hours)
    res.json(checks)
  } catch (error) {
    logger.error('Error getting service history:', error)
    res.status(500).json({ error: 'Failed to get service history' })
  }
})

// Manual service check endpoint
router.post('/check-service', async (req, res) => {
  try {
    const { url } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    // Find service by URL
    const serviceResult = await database.query('SELECT * FROM services WHERE url = $1', [url])
    
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' })
    }

    const service = serviceResult.rows[0]
    const result = await monitoringService.checkService(service)
    
    res.json({
      status: result.status,
      responseTime: result.responseTime,
      timestamp: new Date().toISOString(),
      uptime: await calculateUptime(service.id)
    })
  } catch (error) {
    logger.error('Error in manual service check:', error)
    res.status(500).json({ error: 'Failed to check service' })
  }
})

// Get uptime statistics
router.get('/:serviceId/uptime', async (req, res) => {
  try {
    const { serviceId } = req.params
    const { days = 7 } = req.query
    
    const result = await database.query(`
      SELECT 
        DATE(checked_at) as date,
        COUNT(*) as total_checks,
        COUNT(CASE WHEN status IN ('online', 'slow') THEN 1 END) as successful_checks,
        ROUND(
          (COUNT(CASE WHEN status IN ('online', 'slow') THEN 1 END) * 100.0 / COUNT(*)), 
          2
        ) as uptime_percentage,
        AVG(CASE WHEN response_time IS NOT NULL THEN response_time END) as avg_response_time
      FROM service_checks 
      WHERE service_id = $1 
        AND checked_at > NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY DATE(checked_at)
      ORDER BY date DESC
    `, [serviceId])

    res.json(result.rows)
  } catch (error) {
    logger.error('Error getting uptime statistics:', error)
    res.status(500).json({ error: 'Failed to get uptime statistics' })
  }
})

async function calculateUptime(serviceId, hours = 24) {
  try {
    const result = await database.query(`
      SELECT 
        ROUND(
          (COUNT(CASE WHEN status IN ('online', 'slow') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 
          2
        ) as uptime_percentage
      FROM service_checks 
      WHERE service_id = $1 
        AND checked_at > NOW() - INTERVAL '${hours} hours'
    `, [serviceId])

    return result.rows[0]?.uptime_percentage || 0
  } catch (error) {
    logger.error('Error calculating uptime:', error)
    return 0
  }
}

module.exports = router