// controllers/medicationController.js
import { sql } from '../config/db.js';
import notificationService from '../services/notificationService.js';

class MedicationController {
  // Récupérer tous les médicaments d'un utilisateur
  async getMedications(req, res) {
    try {
      const { id: userId } = req.user;
      
      const medications = await sql`
        SELECT * FROM medications WHERE user_id = ${userId} ORDER BY created_at DESC
      `;

      res.json(medications);
    } catch (error) {
      console.error('Error getting medications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Créer un nouveau médicament
  async createMedication(req, res) {
    try {
      const { id: userId } = req.user;
      const {
        name,
        dosage,
        times,
        startDate,
        duration,
        color,
        reminderEnabled,
        currentSupply,
        totalSupply,
        refillAt,
        refillReminder,
        lastRefillDate
      } = req.body;

      const medication = await sql`
        INSERT INTO medications (
          user_id, name, dosage, times, start_date, duration, color, 
          reminder_enabled, current_supply, total_supply, refill_at, 
          refill_reminder, last_refill_date
        ) VALUES (
          ${userId}, ${name}, ${dosage}, ${JSON.stringify(times)}, ${startDate}, 
          ${duration}, ${color}, ${reminderEnabled}, ${currentSupply}, 
          ${totalSupply}, ${refillAt}, ${refillReminder}, ${lastRefillDate}
        )
        RETURNING *
      `;

      const newMedication = medication[0];

      // Programmer les rappels si activés
      if (newMedication.reminder_enabled) {
        await this.scheduleMedicationReminders(userId, newMedication);
      }

      // Vérifier et envoyer une notification de réapprovisionnement si nécessaire
      if (newMedication.refill_reminder && newMedication.current_supply <= newMedication.refill_at) {
        await notificationService.sendRefillReminder(userId, newMedication);
      }

      res.status(201).json(newMedication);
    } catch (error) {
      console.error('Error creating medication:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Mettre à jour un médicament
  async updateMedication(req, res) {
    try {
      const { id: userId } = req.user;
      const { id: medicationId } = req.params;
      const updates = req.body;

      // Vérifier que le médicament appartient à l'utilisateur
      const medicationCheck = await sql`
        SELECT * FROM medications WHERE id = ${medicationId} AND user_id = ${userId}
      `;

      if (medicationCheck.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      const currentMedication = medicationCheck[0];

      // Construire la requête de mise à jour dynamique
      const setFields = [];
      const values = [];
      
      Object.keys(updates).forEach(key => {
        if (key === 'times') {
          setFields.push(`times = ${JSON.stringify(updates[key])}`);
        } else {
          setFields.push(`${key} = ${updates[key]}`);
        }
      });

      setFields.push('updated_at = CURRENT_TIMESTAMP');

      const updatedMedication = await sql`
        UPDATE medications 
        SET ${sql(setFields.join(', '))}
        WHERE id = ${medicationId} AND user_id = ${userId}
        RETURNING *
      `;

      const resultMedication = updatedMedication[0];

      // Mettre à jour les rappels
      await notificationService.cancelScheduledNotifications(userId, medicationId);
      
      if (resultMedication.reminder_enabled) {
        await this.scheduleMedicationReminders(userId, resultMedication);
      }

      res.json(resultMedication);
    } catch (error) {
      console.error('Error updating medication:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Supprimer un médicament
  async deleteMedication(req, res) {
    try {
      const { id: userId } = req.user;
      const { id: medicationId } = req.params;

      // Vérifier que le médicament appartient à l'utilisateur
      const medicationCheck = await sql`
        SELECT * FROM medications WHERE id = ${medicationId} AND user_id = ${userId}
      `;

      if (medicationCheck.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      // Supprimer les notifications programmées
      await notificationService.cancelScheduledNotifications(userId, medicationId);

      // Supprimer le médicament
      await sql`
        DELETE FROM medications WHERE id = ${medicationId} AND user_id = ${userId}
      `;

      res.json({ message: 'Medication deleted successfully' });
    } catch (error) {
      console.error('Error deleting medication:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Programmer les rappels de médicament
  async scheduleMedicationReminders(userId, medication) {
    try {
      for (const time of medication.times) {
        const notificationId = `medication_${medication.id}_${time}`;
        await notificationService.storeScheduledNotification(
          userId,
          medication.id,
          notificationId,
          'medication',
          time
        );
      }
    } catch (error) {
      console.error('Error scheduling medication reminders:', error);
    }
  }
}

export default new MedicationController();