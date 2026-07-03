import {createClient}  from 'redis'
import credentials from '../config/config.js'

const client =  createClient({
    url : credentials.redis_url
})

client.on('error', (error) => {
  console.error('Redis error:', error.message)
})

const connectRedis = async ()=>{
  if (!client.isOpen) {
    await client.connect()
  }
  console.log('Connected to Redis successfully')
}

export {client,connectRedis}
