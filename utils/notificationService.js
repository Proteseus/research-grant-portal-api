import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendEmailNotification = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email notification');
  }
};

export const createInAppNotification = async (userId, message) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message
      }
    });
  } catch (error) {
    console.error('Error creating in-app notification:', error);
    throw new Error('Failed to create in-app notification');
  }
};

export const sendVerificationEmail = async (userId, token) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    await sendEmailNotification(
      user.email,
      'Verify your email address',
      `Please click the following link to verify your email: ${verificationLink}`
    );
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendNotification = async (userId, message) => {
  try {
    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Send email notification
    await sendEmailNotification(user.email, 'Research Grant Portal Notification', message);

    // Create in-app notification
    await createInAppNotification(userId, message);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
