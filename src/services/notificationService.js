// services/notificationService.js
import { Expo } from 'expo-server-sdk';
import { sql } from '../config/db.js';

const expo = new Expo();

class NotificationService {
  // Enregistrer un token Expo pour un utilisateur
  async registerPushToken(userId, expoPushToken) {
    try {
      await sql`
        UPDATE users 
        SET expo_push_token = ${expoPushToken}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${userId}
      `;
      return { success: true };
    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }

  // Envoyer une notification de rappel de médicament
  async sendMedicationReminder(userId, medication) {
    try {
      const user = await sql`
        SELECT expo_push_token FROM users WHERE id = ${userId}
      `;

      if (!user[0] || !user[0].expo_push_token) {
        return { success: false, error: 'No push token registered' };
      }

      const message = {
        to: user[0].expo_push_token,
        sound: 'default',
        title: 'Medication Reminder',
        body: `Time to take ${medication.name} (${medication.dosage})`,
        data: { 
          medicationId: medication.id,
          type: 'medication_reminder'
        },
      };

      const ticket = await expo.sendPushNotificationsAsync([message]);
      return { success: true, ticket };
    } catch (error) {
      console.error('Error sending medication reminder:', error);
      throw error;
    }
  }

  // Envoyer une notification de réapprovisionnement
  async sendRefillReminder(userId, medication) {
    try {
      const user = await sql`
        SELECT expo_push_token FROM users WHERE id = ${userId}
      `;

      if (!user[0] || !user[0].expo_push_token) {
        return { success: false, error: 'No push token registered' };
      }

      const message = {
        to: user[0].expo_push_token,
        sound: 'default',
        title: 'Refill Reminder',
        body: `Your ${medication.name} supply is running low. Current supply: ${medication.current_supply}`,
        data: { 
          medicationId: medication.id,
          type: 'refill_reminder'
        },
      };

      const ticket = await expo.sendPushNotificationsAsync([message]);
      return { success: true, ticket };
    } catch (error) {
      console.error('Error sending refill reminder:', error);
      throw error;
    }
  }

  // Stocker une notification programmée
  async storeScheduledNotification(userId, medicationId, notificationId, type, scheduledTime = null) {
    try {
      await sql`
        INSERT INTO scheduled_notifications (user_id, medication_id, notification_id, type, scheduled_time)
        VALUES (${userId}, ${medicationId}, ${notificationId}, ${type}, ${scheduledTime})
      `;
    } catch (error) {
      console.error('Error storing scheduled notification:', error);
      throw error;
    }
  }

  // Supprimer les notifications programmées pour un médicament
  async cancelScheduledNotifications(userId, medicationId) {
    try {
      await sql`
        DELETE FROM scheduled_notifications 
        WHERE user_id = ${userId} AND medication_id = ${medicationId}
      `;
    } catch (error) {
      console.error('Error canceling scheduled notifications:', error);
      throw error;
    }
  }
}

export default new NotificationService();