import rateLimit from 'express-rate-limit'

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
});


export { registerLimiter, loginLimiter, otpLimiter }