// backend/src/server.js
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const cron = require('node-cron')
require('dotenv').config()

const logger = require('./utils/logger')
const database = require('./database/connection')
const monitoringService = require('./services/monitoringService')
const statusRoutes = require('./routes/status')
const incidentRoutes = require('./routes/incidents')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  })
  next()
})

// Routes
app.use('/api/status', statusRoutes)
app.use('/api/incidents', incidentRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Initialize database and start server
async function startServer() {
  try {
    await database.initialize()
    logger.info('Database initialized successfully')

    // Start the monitoring service
    monitoringService.startMonitoring()
    logger.info('Monitoring service started')

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  await database.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  await database.close()
  process.exit(0)
})

startServer()