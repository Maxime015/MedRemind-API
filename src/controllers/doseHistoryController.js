import { sql } from '../config/db.js';

export class DoseHistoryController {
  // Récupérer l'historique des prises
  async getDoseHistory(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, medicationId } = req.query;

      let query = sql`
        SELECT 
          dh.id,
          dh.medication_id as "medicationId",
          dh.timestamp,
          dh.taken,
          dh.created_at as "createdAt",
          m.name as "medicationName",
          m.dosage as "medicationDosage",
          m.color as "medicationColor"
        FROM dose_history dh
        JOIN medications m ON dh.medication_id = m.id
        WHERE dh.user_id = ${userId}
      `;

      if (medicationId) {
        query = sql`${query} AND dh.medication_id = ${medicationId}`;
      }

      if (startDate && endDate) {
        query = sql`${query} AND dh.timestamp BETWEEN ${startDate} AND ${endDate}`;
      }

      query = sql`${query} ORDER BY dh.timestamp DESC`;

      const doseHistory = await query;

      res.json(doseHistory);
    } catch (error) {
      console.error('Error fetching dose history:', error);
      res.status(500).json({ error: 'Failed to fetch dose history' });
    }
  }

  // Récupérer les prises du jour
  async getTodaysDoses(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0];

      const doses = await sql`
        SELECT 
          dh.id,
          dh.medication_id as "medicationId",
          dh.timestamp,
          dh.taken,
          m.name as "medicationName",
          m.dosage as "medicationDosage",
          m.color as "medicationColor"
        FROM dose_history dh
        JOIN medications m ON dh.medication_id = m.id
        WHERE dh.user_id = ${userId} 
          AND DATE(dh.timestamp) = ${today}
        ORDER BY dh.timestamp DESC
      `;

      res.json(doses);
    } catch (error) {
      console.error('Error fetching today\'s doses:', error);
      res.status(500).json({ error: 'Failed to fetch today\'s doses' });
    }
  }

  // Enregistrer une prise
  async recordDose(req, res) {
    try {
      const userId = req.user.id;
      const { medicationId, taken, timestamp } = req.body;

      // Vérifier que le médicament appartient à l'utilisateur
      const medication = await sql`
        SELECT id FROM medications 
        WHERE id = ${medicationId} AND user_id = ${userId}
      `;

      if (medication.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      const dose = await sql`
        INSERT INTO dose_history (user_id, medication_id, timestamp, taken)
        VALUES (${userId}, ${medicationId}, ${timestamp}, ${taken})
        RETURNING 
          id,
          medication_id as "medicationId",
          timestamp,
          taken,
          created_at as "createdAt"
      `;

      // Mettre à jour le stock si la dose a été prise
      if (taken) {
        await sql`
          UPDATE medications 
          SET current_supply = GREATEST(0, current_supply - 1),
              updated_at = NOW()
          WHERE id = ${medicationId} AND user_id = ${userId}
        `;
      }

      res.status(201).json(dose[0]);
    } catch (error) {
      console.error('Error recording dose:', error);
      res.status(500).json({ error: 'Failed to record dose' });
    }
  }

  // Supprimer l'historique d'un médicament
  async deleteMedicationHistory(req, res) {
    try {
      const userId = req.user.id;
      const medicationId = req.params.medicationId;

      await sql`
        DELETE FROM dose_history 
        WHERE medication_id = ${medicationId} AND user_id = ${userId}
      `;

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting medication history:', error);
      res.status(500).json({ error: 'Failed to delete medication history' });
    }
  }
}

export default new DoseHistoryController();