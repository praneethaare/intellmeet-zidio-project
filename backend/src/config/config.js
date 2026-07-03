import dotenv from 'dotenv'

dotenv.config()

const requiredVariables = ['MONGO_URL', 'PASSKEY', 'EMAIL_USER', 'SECRET_KEY']
const missingVariables = requiredVariables.filter((name) => !process.env[name])

if (missingVariables.length > 0) {
  throw new Error(`Missing environment variables: ${missingVariables.join(', ')}`)
}

const credentials = {
  port: Number(process.env.PORT) || 5000,
  mongo_url: process.env.MONGO_URL,
  passkey: process.env.PASSKEY,
  email_user: process.env.EMAIL_USER,
  secret_key: process.env.SECRET_KEY,
  redis_url: process.env.REDIS_URL || 'redis://localhost:6379',
  node_env: process.env.NODE_ENV || 'development',
  frontend_url: process.env.FRONTEND_URL || 'http://localhost:5173',
}

export default credentials
