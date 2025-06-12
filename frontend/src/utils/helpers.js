// src/utils/helpers.js
export const formatResponseTime = (ms) => {
  if (!ms) return 'N/A'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'online':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        indicator: 'bg-green-500'
      }
    case 'slow':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-600',
        indicator: 'bg-yellow-500'
      }
    case 'down':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-600',
        indicator: 'bg-red-500'
      }
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600',
        indicator: 'bg-gray-400'
      }
  }
}

export const calculateUptime = (checks) => {
  if (!checks || checks.length === 0) return 0
  
  const successfulChecks = checks.filter(check => check.status !== 'down').length
  return (successfulChecks / checks.length) * 100
}

export const classifyResponseTime = (responseTime) => {
  if (!responseTime) return 'down'
  if (responseTime < 3000) return 'online'
  if (responseTime < 10000) return 'slow'
  return 'down'
}

export const formatDuration = (startTime, endTime) => {
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

export const getRelativeTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now - time) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}