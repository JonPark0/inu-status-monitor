// backend/src/utils/helpers.js
const database = require('../database/connection')
const logger = require('./logger')

function classifyStatus(httpStatus, responseTime) {
  // If HTTP status indicates an error
  if (httpStatus >= 500) {
    return 'down'
  }
  
  if (httpStatus >= 400) {
    return 'slow' // Client errors might indicate service issues
  }

  // Classify based on response time
  if (responseTime > 10000) {
    return 'down' // Over 10 seconds is considered down
  } else if (responseTime > 3000) {
    return 'slow' // 3-10 seconds is slow
  } else {
    return 'online' // Under 3 seconds is good
  }
}

async function createIncidentIfNeeded(service, currentStatus) {
  try {
    // Only create incidents for 'down' status
    if (currentStatus !== 'down') {
      return
    }

    // Check if there's already an open incident for this service
    const existingIncident = await database.query(`
      SELECT id FROM incidents 
      WHERE service_id = $1 AND status = 'open' 
      ORDER BY started_at DESC 
      LIMIT 1
    `, [service.id])

    if (existingIncident.rows.length > 0) {
      // Incident already exists
      return
    }

    // Check how long the service has been down
    const recentChecks = await database.query(`
      SELECT status FROM service_checks 
      WHERE service_id = $1 
      ORDER BY checked_at DESC 
      LIMIT 3
    `, [service.id])

    // Only create incident if service has been down for multiple consecutive checks
    const allDown = recentChecks.rows.every(check => check.status === 'down')
    
    if (allDown && recentChecks.rows.length >= 2) {
      await database.query(`
        INSERT INTO incidents (service_id, title, description, severity, created_by)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        service.id,
        `${service.name} Service Outage`,
        `Automatic incident created due to service unavailability detected by monitoring system.`,
        'high',
        'system'
      ])

      logger.info(`Auto-created incident for ${service.name} due to service outage`)
    }
  } catch (error) {
    logger.error('Error creating auto-incident:', error)
  }
}

async function resolveIncidentIfNeeded(service, currentStatus) {
  try {
    // Only resolve incidents when service is back online
    if (currentStatus === 'down') {
      return
    }

    // Find open incidents for this service
    const openIncidents = await database.query(`
      SELECT id FROM incidents 
      WHERE service_id = $1 AND status = 'open'
    `, [service.id])

    // Auto-resolve incidents when service is back up
    for (const incident of openIncidents.rows) {
      await database.query(`
        UPDATE incidents 
        SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [incident.id])

      logger.info(`Auto-resolved incident ${incident.id} for ${service.name}`)
    }
  } catch (error) {
    logger.error('Error auto-resolving incident:', error)
  }
}

function formatDuration(startTime, endTime) {
  const duration = new Date(endTime) - new Date(startTime)
  const minutes = Math.floor(duration / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else {
    return `${minutes}m`
  }
}

module.exports = {
  classifyStatus,
  createIncidentIfNeeded,
  resolveIncidentIfNeeded,
  formatDuration
}