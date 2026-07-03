const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeEmail = (email) => email?.trim().toLowerCase()

const validateEmail = (email) => emailPattern.test(email || '')

const validatePassword = (password) =>
  typeof password === 'string' && password.length >= 8

const requireFields = (body, fields) =>
  fields.filter((field) => {
    const value = body[field]
    return value === undefined || value === null || value === ''
  })

export { normalizeEmail, requireFields, validateEmail, validatePassword }
