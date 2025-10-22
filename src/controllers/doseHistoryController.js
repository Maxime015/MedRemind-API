// controllers/doseHistoryController.js
import { sql } from '../config/db.js';

class DoseHistoryController {
  // Récupérer l'historique des prises
  async getDoseHistory(req, res) {
    try {
      const { id: userId } = req.user;
      const { startDate, endDate, medicationId } = req.query;

      let query = sql`
        SELECT dh.*, m.name as medication_name, m.dosage, m.color
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

      const result = await query;
      res.json(result);
    } catch (error) {
      console.error('Error getting dose history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Enregistrer une prise
  async recordDose(req, res) {
    try {
      const { id: userId } = req.user;
      const { medicationId, taken, timestamp } = req.body;

      // Vérifier que le médicament appartient à l'utilisateur
      const medicationCheck = await sql`
        SELECT * FROM medications WHERE id = ${medicationId} AND user_id = ${userId}
      `;

      if (medicationCheck.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      const medication = medicationCheck[0];

      // Enregistrer la prise
      const doseResult = await sql`
        INSERT INTO dose_history (user_id, medication_id, timestamp, taken)
        VALUES (${userId}, ${medicationId}, ${timestamp}, ${taken})
        RETURNING *
      `;

      // Mettre à jour le stock si la prise a été effectuée
      if (taken && medication.current_supply > 0) {
        await sql`
          UPDATE medications 
          SET current_supply = current_supply - 1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${medicationId}
        `;

        // Vérifier si un réapprovisionnement est nécessaire
        const updatedMedication = await sql`
          SELECT * FROM medications WHERE id = ${medicationId}
        `;

        const currentMedication = updatedMedication[0];
        if (currentMedication.refill_reminder && currentMedication.current_supply <= currentMedication.refill_at) {
          console.log('Refill needed for medication:', currentMedication.name);
        }
      }

      res.status(201).json(doseResult[0]);
    } catch (error) {
      console.error('Error recording dose:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Récupérer les prises du jour
  async getTodaysDoses(req, res) {
    try {
      const { id: userId } = req.user;
      const today = new Date().toISOString().split('T')[0];

      const result = await sql`
        SELECT dh.*, m.name as medication_name, m.dosage, m.color
        FROM dose_history dh
        JOIN medications m ON dh.medication_id = m.id
        WHERE dh.user_id = ${userId} AND DATE(dh.timestamp) = ${today}
        ORDER BY dh.timestamp DESC
      `;

      res.json(result);
    } catch (error) {
      console.error('Error getting today\'s doses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new DoseHistoryController();