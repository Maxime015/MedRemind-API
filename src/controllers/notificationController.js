// controllers/notificationController.js
import notificationService from '../services/notificationService.js';
import { sql } from '../config/db.js';

class NotificationController {
  // Enregistrer un token Expo
  async registerPushToken(req, res) {
    try {
      const { id: userId } = req.user;
      const { expoPushToken } = req.body;

      if (!expoPushToken) {
        return res.status(400).json({ error: 'Expo push token is required' });
      }

      const result = await notificationService.registerPushToken(userId, expoPushToken);
      res.json(result);
    } catch (error) {
      console.error('Error registering push token:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Tester une notification
  async testNotification(req, res) {
    try {
      const { id: userId } = req.user;
      const { medicationId } = req.body;

      // Récupérer le médicament avec la syntaxe Neon
      const medicationResult = await sql`
        SELECT * FROM medications WHERE id = ${medicationId} AND user_id = ${userId}
      `;

      if (medicationResult.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      const medication = medicationResult[0];
      const result = await notificationService.sendMedicationReminder(userId, medication);

      res.json(result);
    } catch (error) {
      console.error('Error testing notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new NotificationController();