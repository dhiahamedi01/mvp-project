import * as admin from 'firebase-admin';
import { Logger } from '@nestjs/common';

const logger = new Logger('FirebaseConfig');

export const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      // To use Firebase push notifications, you need to:
      // 1. Create a Firebase project at https://console.firebase.google.com/
      // 2. Generate a service account key from Project Settings > Service Accounts
      // 3. Download the JSON file and add it to your project
      // 4. Set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable with the path to the JSON file
      // 5. Uncomment and configure the code below:

      const serviceAccount = require('./../../deputy-project-66b15-firebase-adminsdk-fbsvc-650dff959c.json');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Optional: Add your Firebase project configuration
      });

      logger.log('Firebase Admin SDK initialized successfully');

      logger.warn(
        'Firebase Admin SDK not configured. Please follow the setup instructions in src/config/firebase.ts',
      );
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
  }
};

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>,
) => {
  try {
    if (!admin.apps.length) {
      logger.warn('Firebase not initialized. Cannot send push notification.');
      return;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    };

    const response = await admin.messaging().send(message);
    logger.log('Push notification sent successfully:', response);
    return response;
  } catch (error) {
    logger.error('Failed to send push notification:', error);
    throw error;
  }
};
