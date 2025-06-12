# INU Service Status Monitor

Real-time status monitoring dashboard for Incheon National University services.

## Features

- ✅ **Real-time Monitoring**: Automatic health checks every 30 seconds (configurable)
- ✅ **Smart Status Classification**: Response time-based status (Online/Slow/Down)  
- ✅ **Historical Data**: 24-hour uptime tracking and response time history
- ✅ **Incident Management**: Automatic incident creation and manual management
- ✅ **Mobile Responsive**: Optimized for both desktop and mobile devices
- ✅ **Docker Deployment**: Complete containerized setup with PostgreSQL
- ✅ **INU Branding**: University color scheme and professional design

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inu-status-monitor
   ```

2. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose up --build -d
   ```

4. **Access the dashboard**
   - Frontend: http://localhost
   - Backend API: http://localhost:3001
   - Database: localhost:5432

## Architecture

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + PostgreSQL  
- **Monitoring**: Automated health checks with incident tracking
- **Deployment**: Docker Compose with health checks

## Monitored Services

- Main Portal (inu.ac.kr)
- SSO Login (portal.inu.ac.kr:444)
- E-Learning Platform (cyber.inu.ac.kr)
- Student Services (starinu.inu.ac.kr)  
- Digital Library (lib.inu.ac.kr)
- ERP System (erp.inu.ac.kr:8443)
- Course Registration (sugang.inu.ac.kr)

## Status Classification

- 🟢 **Online**: Response time < 3 seconds
- 🟡 **Slow**: Response time 3-10 seconds
- 🔴 **Down**: Response time > 10 seconds or connection error

## API Endpoints

- `GET /api/status` - Current status of all services
- `GET /api/status/:id/history` - Historical data for a service
- `GET /api/incidents` - Recent incidents
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:id` - Update incident

## Configuration

Adjust monitoring interval and other settings in `docker-compose.yml`:

```yaml
environment:
  - CHECK_INTERVAL=30000  # 30 seconds
  - LOG_LEVEL=info
```

## Development

1. **Backend Development**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Development**  
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## License

© 2025 Incheon National University