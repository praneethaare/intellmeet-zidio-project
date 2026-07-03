import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import credentials from '../config/config.js'
import authUser from '../model/userAuth.model.js'
import sendVerificationEmail from '../services/mail.service.js'
import { client } from '../utils/redis.js'
import {
  normalizeEmail,
  requireFields,
  validateEmail,
  validatePassword,
} from '../utils/validation.js'

const cookieOptions = {
  httpOnly: true,
  secure: credentials.node_env === 'production',
  sameSite: credentials.node_env === 'production' ? 'none' : 'lax',
  maxAge: 60 * 60 * 1000,
}

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  verified: user.verified,
})

const createSession = async (user, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    credentials.secret_key,
    { expiresIn: '1h' },
  )

  await client.setEx(`token:${user._id}`, 3600, token)
  res.cookie('token', token, cookieOptions)
  return token
}

const createOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

const registerUser = async (req, res, next) => {
  try {
    const missingFields = requireFields(req.body, ['username', 'email', 'password'])
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
      })
    }

    const username = req.body.username.trim()
    const email = normalizeEmail(req.body.email)
    const { password } = req.body

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' })
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters',
      })
    }

    const existingUser = await authUser.findOne({
      $or: [{ username }, { email }],
    })
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await authUser.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      verified: false,
    })

    const otp = createOtp()
    await client.setEx(`verify:${email}`, 300, otp)
    try {
      await sendVerificationEmail(email, otp)
    } catch (mailError) {
      console.error('Failed to send verification email:', mailError.message)

      if (credentials.node_env !== 'production') {
        return res.status(201).json({
          message:
            'User created. Email could not be sent in development, so use the devOtp to verify.',
          devOtp: otp,
        })
      }

      throw mailError
    }

    res.status(201).json({
      message: 'User created. Check your email for the verification OTP.',
    })
  } catch (error) {
    next(error)
  }
}

const verifyUser = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email)
    const otp = String(req.body.otp || '')

    if (!validateEmail(email) || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    const storedOtp = await client.get(`verify:${email}`)
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    const user = await authUser.findOneAndUpdate(
      { email },
      { verified: true },
      { new: true },
    )
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await client.del(`verify:${email}`)
    const token = await createSession(user, res)

    res.status(200).json({
      message: 'Email verified successfully',
      user: sanitizeUser(user),
      token,
    })
  } catch (error) {
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email)
    const { password } = req.body

    if (!validateEmail(email) || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await authUser.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (!user.verified) {
      return res.status(403).json({ message: 'Verify your email before logging in' })
    }

    const token = await createSession(user, res)
    res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token,
    })
  } catch (error) {
    next(error)
  }
}

const logoutUser = async (req, res, next) => {
  try {
    await client.del(`token:${req.user._id}`)
    res.clearCookie('token', cookieOptions)
    res.status(200).json({ message: 'Logout successful' })
  } catch (error) {
    next(error)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email)
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' })
    }

    const user = await authUser.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const otp = createOtp()
    await client.setEx(`reset:${email}`, 300, otp)
    try {
      await sendVerificationEmail(email, otp)
    } catch (mailError) {
      console.error('Failed to send password reset email:', mailError.message)

      if (credentials.node_env !== 'production') {
        return res.status(200).json({
          message:
            'Password reset OTP created. Email could not be sent in development, so use the devOtp.',
          devOtp: otp,
        })
      }

      throw mailError
    }
    res.status(200).json({ message: 'Password reset OTP sent successfully' })
  } catch (error) {
    next(error)
  }
}

const validateForgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email)
    const otp = String(req.body.otp || '')
    const storedOtp = await client.get(`reset:${email}`)

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    const user = await authUser.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await client.del(`reset:${email}`)
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      credentials.secret_key,
      { expiresIn: '10m' },
    )

    res.status(200).json({ message: 'OTP verified successfully', resetToken })
  } catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, password } = req.body
    if (!resetToken || !validatePassword(password)) {
      return res.status(400).json({
        message: 'A valid reset token and an 8-character password are required',
      })
    }

    const decoded = jwt.verify(resetToken, credentials.secret_key)
    if (decoded.purpose !== 'password-reset') {
      return res.status(401).json({ message: 'Invalid reset token' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await authUser.findByIdAndUpdate(
      decoded.id,
      { password: hashedPassword },
      { new: true },
    )
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await client.del(`token:${user._id}`)
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired reset token' })
    }
    next(error)
  }
}

const me = async (req, res) => {
  res.status(200).json({ user: sanitizeUser(req.user) })
}

export {
  forgotPassword,
  loginUser,
  logoutUser,
  me,
  registerUser,
  resetPassword,
  validateForgotPassword,
  verifyUser,
}
