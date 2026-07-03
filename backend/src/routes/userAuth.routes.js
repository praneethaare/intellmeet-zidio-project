import {Router} from 'express'
import {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  forgotPassword,
  validateForgotPassword,
  resetPassword,
  me,
} from '../controller/userAuth.controller.js'
import { registerLimiter, loginLimiter, otpLimiter } from '../middleware/limiter.middleware.js'
import checkAuth from '../middleware/authCheck.middleware.js'
const authUserRoutes  = Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 default: user
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Error creating user
 */
authUserRoutes.post('/register', registerLimiter, registerUser)

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify user email using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Error verifying email
 */
authUserRoutes.post('/verify', otpLimiter, verifyUser)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Error logging in
 */
authUserRoutes.post('/login', loginLimiter, loginUser)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: No token provided
 *       500:
 *         description: Error logging out
 */
authUserRoutes.post('/logout', checkAuth, logoutUser)

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: User not found
 *       500:
 *         description: Error sending OTP
 */
authUserRoutes.post('/forgot-password', forgotPassword)

/**
 * @swagger
 * /auth/validate-forgot-password:
 *   post:
 *     summary: Validate password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       404:
 *         description: User not found or Invalid/expired OTP
 *       500:
 *         description: Error validating OTP
 */
authUserRoutes.post('/validate-forgot-password', validateForgotPassword)

authUserRoutes.post('/reset-password', resetPassword)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user details
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       500:
 *         description: Error fetching user
 */
authUserRoutes.get('/me', checkAuth, me)


export default authUserRoutes
