const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  console.error(error)

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.values(error.errors).map((item) => item.message),
    })
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'value'
    return res.status(409).json({ message: `${field} already exists` })
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource identifier' })
  }

  res.status(error.status || 500).json({
    message:
      error.status || process.env.NODE_ENV === 'development'
        ? error.message
        : 'Internal server error',
  })
}

export { errorHandler, notFoundHandler }
