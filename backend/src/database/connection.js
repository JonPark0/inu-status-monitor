// backend/src/database/connection.js
const { Pool } = require('pg')
const logger = require('../utils/logger')

class Database {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.pool.on('error', (err) => {
      logger.error('Database pool error:', err)
    })
  }

  async initialize() {
    try {
      await this.createTables()
      await this.seedServices()
      logger.info('Database initialization completed')
    } catch (error) {
      logger.error('Database initialization failed:', error)
      throw error
    }
  }

  async createTables() {
    const createServicesTable = `
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    const createChecksTable = `
      CREATE TABLE IF NOT EXISTS service_checks (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL,
        response_time INTEGER,
        error_message TEXT,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (service_id, checked_at)
      );
    `

    const createIncidentsTable = `
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        severity VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'open',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await this.pool.query(createServicesTable)
    await this.pool.query(createChecksTable)
    await this.pool.query(createIncidentsTable)
  }

  async seedServices() {
    const services = [
      { name: 'Main Portal', url: 'https://inu.ac.kr', description: 'University main website' },
      { name: 'SSO Login', url: 'https://portal.inu.ac.kr:444', description: 'Single Sign-On portal' },
      { name: 'E-Learning', url: 'https://cyber.inu.ac.kr', description: 'Online learning platform' },
      { name: 'Student Services', url: 'https://starinu.inu.ac.kr', description: 'Student service portal' },
      { name: 'Library', url: 'https://lib.inu.ac.kr', description: 'Digital library system' },
      { name: 'ERP System', url: 'https://erp.inu.ac.kr:8443', description: 'Student information system' },
      { name: 'Course Registration', url: 'https://sugang.inu.ac.kr', description: 'Course registration portal' }
    ]

    for (const service of services) {
      try {
        await this.pool.query(
          'INSERT INTO services (name, url, description) VALUES ($1, $2, $3) ON CONFLICT (url) DO NOTHING',
          [service.name, service.url, service.description]
        )
      } catch (error) {
        logger.warn(`Failed to seed service ${service.name}:`, error.message)
      }
    }
  }

  async query(text, params) {
    const start = Date.now()
    try {
      const res = await this.pool.query(text, params)
      const duration = Date.now() - start
      logger.debug('Query executed', { text, duration, rows: res.rowCount })
      return res
    } catch (error) {
      logger.error('Query error', { text, error: error.message })
      throw error
    }
  }

  async close() {
    await this.pool.end()
  }
}

module.exports = new Database()