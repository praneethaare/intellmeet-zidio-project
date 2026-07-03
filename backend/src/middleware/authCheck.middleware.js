import  authUser from '../model/userAuth.model.js'
import jwt  from 'jsonwebtoken'
import credentials from '../config/config.js'
import {client} from '../utils/redis.js'

const checkAuth = async (req, res, next) => {
  try {
    const authorization = req.get('authorization')
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null
    const token = req.cookies.token || bearerToken

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, credentials.secret_key)
    const activeToken = await client.get(`token:${decoded.id}`)
    if (!activeToken || activeToken !== token) {
      return res.status(401).json({ message: 'Session expired or logged out' })
    }

    const user = await authUser.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
    next(error)
  }
}

export default checkAuth
