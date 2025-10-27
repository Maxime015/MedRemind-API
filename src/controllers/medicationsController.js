import { sql } from '../config/db.js';

export class MedicationsController {
  // Récupérer tous les médicaments d'un utilisateur
  async getMedications(req, res) {
    try {
      const userId = req.user.id;
      
      const medications = await sql`
        SELECT 
          id,
          name,
          dosage,
          times,
          start_date as "startDate",
          duration,
          color,
          reminder_enabled as "reminderEnabled",
          current_supply as "currentSupply",
          total_supply as "totalSupply",
          refill_at as "refillAt",
          refill_reminder as "refillReminder",
          last_refill_date as "lastRefillDate",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM medications 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;

      res.json(medications);
    } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).json({ error: 'Failed to fetch medications' });
    }
  }

  // Créer un nouveau médicament
  async createMedication(req, res) {
    try {
      const userId = req.user.id;
      const {
        name,
        dosage,
        times,
        startDate,
        duration,
        color,
        reminderEnabled = true,
        currentSupply = 0,
        totalSupply = 0,
        refillAt = 0,
        refillReminder = false,
        lastRefillDate = null
      } = req.body;

      const medication = await sql`
        INSERT INTO medications (
          user_id, name, dosage, times, start_date, duration, color,
          reminder_enabled, current_supply, total_supply, refill_at,
          refill_reminder, last_refill_date
        ) VALUES (
          ${userId}, ${name}, ${dosage}, ${times}, ${startDate}, ${duration}, ${color},
          ${reminderEnabled}, ${currentSupply}, ${totalSupply}, ${refillAt},
          ${refillReminder}, ${lastRefillDate}
        )
        RETURNING 
          id,
          name,
          dosage,
          times,
          start_date as "startDate",
          duration,
          color,
          reminder_enabled as "reminderEnabled",
          current_supply as "currentSupply",
          total_supply as "totalSupply",
          refill_at as "refillAt",
          refill_reminder as "refillReminder",
          last_refill_date as "lastRefillDate"
      `;

      res.status(201).json(medication[0]);
    } catch (error) {
      console.error('Error creating medication:', error);
      res.status(500).json({ error: 'Failed to create medication' });
    }
  }

  // Mettre à jour un médicament
  async updateMedication(req, res) {
    try {
      const userId = req.user.id;
      const medicationId = req.params.id;
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
        UPDATE medications 
        SET 
          name = ${name},
          dosage = ${dosage},
          times = ${times},
          start_date = ${startDate},
          duration = ${duration},
          color = ${color},
          reminder_enabled = ${reminderEnabled},
          current_supply = ${currentSupply},
          total_supply = ${totalSupply},
          refill_at = ${refillAt},
          refill_reminder = ${refillReminder},
          last_refill_date = ${lastRefillDate},
          updated_at = NOW()
        WHERE id = ${medicationId} AND user_id = ${userId}
        RETURNING 
          id,
          name,
          dosage,
          times,
          start_date as "startDate",
          duration,
          color,
          reminder_enabled as "reminderEnabled",
          current_supply as "currentSupply",
          total_supply as "totalSupply",
          refill_at as "refillAt",
          refill_reminder as "refillReminder",
          last_refill_date as "lastRefillDate"
      `;

      if (medication.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      res.json(medication[0]);
    } catch (error) {
      console.error('Error updating medication:', error);
      res.status(500).json({ error: 'Failed to update medication' });
    }
  }

  // Supprimer un médicament
  async deleteMedication(req, res) {
    try {
      const userId = req.user.id;
      const medicationId = req.params.id;

      const result = await sql`
        DELETE FROM medications 
        WHERE id = ${medicationId} AND user_id = ${userId}
      `;

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting medication:', error);
      res.status(500).json({ error: 'Failed to delete medication' });
    }
  }

  // Mettre à jour le stock d'un médicament
  async updateSupply(req, res) {
    try {
      const userId = req.user.id;
      const medicationId = req.params.id;
      const { currentSupply, lastRefillDate } = req.body;

      const medication = await sql`
        UPDATE medications 
        SET 
          current_supply = ${currentSupply},
          last_refill_date = ${lastRefillDate},
          updated_at = NOW()
        WHERE id = ${medicationId} AND user_id = ${userId}
        RETURNING 
          id,
          name,
          current_supply as "currentSupply",
          total_supply as "totalSupply",
          last_refill_date as "lastRefillDate"
      `;

      if (medication.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      res.json(medication[0]);
    } catch (error) {
      console.error('Error updating medication supply:', error);
      res.status(500).json({ error: 'Failed to update medication supply' });
    }
  }
}

export default new MedicationsController();