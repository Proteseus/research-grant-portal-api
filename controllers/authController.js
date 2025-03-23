import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendNotification, sendVerificationEmail } from '../utils/notificationService.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

// Register new user
export const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        role: role || 'RESEARCHER'
      }
    });

    // Send welcome notification
    await sendNotification(user.id, 'Welcome to the Research Grant Portal!');

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send verification email
    await sendVerificationEmail(user.id, verificationToken);

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// User login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    // Generate new access token
    const token = jwt.sign(
      { id: decoded.id, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// User logout
export const logout = async (req, res) => {
  try {
    // Invalidate token (implementation depends on token storage strategy)
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    // Verify token (this would typically be a JWT or similar)
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Update user's verified status
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { verified: true }
    });
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ error: 'Email verification failed' });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create or update password reset record
    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: { token: resetToken, expiresAt: new Date(Date.now() + 3600000) },
      create: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000)
      }
    });

    // TODO: Send email with reset token
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if reset token exists and is valid
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        userId: decoded.userId,
        token: token,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash: hashedPassword }
    });

    // Delete reset token
    await prisma.passwordReset.delete({
      where: { id: resetRecord.id }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};
