// backend/src/routes/incidents.js
const express = require('express')
const router = express.Router()
const database = require('../database/connection')
const logger = require('../utils/logger')

// Get all incidents
router.get('/', async (req, res) => {
  try {
    const { status, severity, limit = 50, offset = 0 } = req.query
    
    let query = `
      SELECT 
        i.*,
        s.name as service_name,
        s.url as service_url
      FROM incidents i
      LEFT JOIN services s ON i.service_id = s.id
      WHERE 1=1
    `
    const params = []
    let paramCount = 0

    if (status) {
      query += ` AND i.status = $${++paramCount}`
      params.push(status)
    }

    if (severity) {
      query += ` AND i.severity = $${++paramCount}`
      params.push(severity)
    }

    query += ` ORDER BY i.started_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`
    params.push(limit, offset)

    const result = await database.query(query, params)
    res.json(result.rows)
  } catch (error) {
    logger.error('Error getting incidents:', error)
    res.status(500).json({ error: 'Failed to get incidents' })
  }
})

// Get incident by ID
router.get('/:incidentId', async (req, res) => {
  try {
    const { incidentId } = req.params
    
    const result = await database.query(`
      SELECT 
        i.*,
        s.name as service_name,
        s.url as service_url
      FROM incidents i
      LEFT JOIN services s ON i.service_id = s.id
      WHERE i.id = $1
    `, [incidentId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    logger.error('Error getting incident:', error)
    res.status(500).json({ error: 'Failed to get incident' })
  }
})

// Create new incident
router.post('/', async (req, res) => {
  try {
    const { service_id, title, description, severity = 'medium', created_by } = req.body

    if (!service_id || !title) {
      return res.status(400).json({ error: 'service_id and title are required' })
    }

    const result = await database.query(`
      INSERT INTO incidents (service_id, title, description, severity, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [service_id, title, description, severity, created_by])

    logger.info('Incident created:', { id: result.rows[0].id, title })
    res.status(201).json(result.rows[0])
  } catch (error) {
    logger.error('Error creating incident:', error)
    res.status(500).json({ error: 'Failed to create incident' })
  }
})

// Update incident
router.put('/:incidentId', async (req, res) => {
  try {
    const { incidentId } = req.params
    const { title, description, severity, status, resolved_at } = req.body

    const updates = []
    const params = []
    let paramCount = 0

    if (title !== undefined) {
      updates.push(`title = $${++paramCount}`)
      params.push(title)
    }
    if (description !== undefined) {
      updates.push(`description = $${++paramCount}`)
      params.push(description)
    }
    if (severity !== undefined) {
      updates.push(`severity = $${++paramCount}`)
      params.push(severity)
    }
    if (status !== undefined) {
      updates.push(`status = $${++paramCount}`)
      params.push(status)
      
      // If status is being set to resolved, set resolved_at timestamp
      if (status === 'resolved' && !resolved_at) {
        updates.push(`resolved_at = CURRENT_TIMESTAMP`)
      }
    }
    if (resolved_at !== undefined) {
      updates.push(`resolved_at = $${++paramCount}`)
      params.push(resolved_at)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    params.push(incidentId)

    const query = `
      UPDATE incidents 
      SET ${updates.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING *
    `

    const result = await database.query(query, params)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' })
    }

    logger.info('Incident updated:', { id: incidentId, updates: Object.keys(req.body) })
    res.json(result.rows[0])
  } catch (error) {
    logger.error('Error updating incident:', error)
    res.status(500).json({ error: 'Failed to update incident' })
  }
})

// Delete incident
router.delete('/:incidentId', async (req, res) => {
  try {
    const { incidentId } = req.params
    
    const result = await database.query('DELETE FROM incidents WHERE id = $1 RETURNING *', [incidentId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' })
    }

    logger.info('Incident deleted:', { id: incidentId })
    res.json({ message: 'Incident deleted successfully' })
  } catch (error) {
    logger.error('Error deleting incident:', error)
    res.status(500).json({ error: 'Failed to delete incident' })
  }
})

// Get incident statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { days = 30 } = req.query
    
    const result = await database.query(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_incidents,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_incidents,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity,
        AVG(EXTRACT(EPOCH FROM (resolved_at - started_at))/3600) as avg_resolution_hours
      FROM incidents 
      WHERE started_at > NOW() - INTERVAL '${parseInt(days)} days'
    `)

    res.json(result.rows[0])
  } catch (error) {
    logger.error('Error getting incident statistics:', error)
    res.status(500).json({ error: 'Failed to get incident statistics' })
  }
})

module.exports = router