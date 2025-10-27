import { sql } from '../config/db.js';

export class RemindersController {
  // Récupérer les médicaments nécessitant un rappel de renouvellement
  async getRefillReminders(req, res) {
    try {
      const userId = req.user.id;

      const reminders = await sql`
        SELECT 
          id,
          name,
          dosage,
          current_supply as "currentSupply",
          total_supply as "totalSupply",
          refill_at as "refillAt",
          last_refill_date as "lastRefillDate"
        FROM medications 
        WHERE user_id = ${userId} 
          AND refill_reminder = true
          AND current_supply <= refill_at
        ORDER BY current_supply ASC
      `;

      res.json(reminders);
    } catch (error) {
      console.error('Error fetching refill reminders:', error);
      res.status(500).json({ error: 'Failed to fetch refill reminders' });
    }
  }

  // Récupérer les médicaments pour aujourd'hui avec rappels
  async getTodaysMedications(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0];

      const medications = await sql`
        SELECT 
          m.id,
          m.name,
          m.dosage,
          m.times,
          m.color,
          m.reminder_enabled as "reminderEnabled",
          (
            SELECT COUNT(*) 
            FROM dose_history dh 
            WHERE dh.medication_id = m.id 
              AND DATE(dh.timestamp) = ${today}
              AND dh.taken = true
          ) as "takenToday"
        FROM medications m
        WHERE m.user_id = ${userId}
          AND m.reminder_enabled = true
          AND (
            m.duration = 'Ongoing' OR
            (m.start_date <= ${today}::DATE AND 
             m.start_date + (SPLIT_PART(m.duration, ' ', 1) || ' days')::INTERVAL >= ${today}::DATE)
          )
        ORDER BY m.times[1] ASC
      `;

      res.json(medications);
    } catch (error) {
      console.error('Error fetching today\'s medications:', error);
      res.status(500).json({ error: 'Failed to fetch today\'s medications' });
    }
  }

  // Statistiques des prises
  async getMedicationStats(req, res) {
    try {
      const userId = req.user.id;
      const { days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const stats = await sql`
        SELECT 
          m.id,
          m.name,
          m.dosage,
          m.color,
          COUNT(dh.id) as "totalDoses",
          COUNT(CASE WHEN dh.taken = true THEN 1 END) as "takenDoses",
          COUNT(CASE WHEN dh.taken = false THEN 1 END) as "missedDoses",
          ROUND(
            COUNT(CASE WHEN dh.taken = true THEN 1 END) * 100.0 / NULLIF(COUNT(dh.id), 0),
            2
          ) as "adherenceRate"
        FROM medications m
        LEFT JOIN dose_history dh ON m.id = dh.medication_id 
          AND dh.timestamp >= ${startDate.toISOString()}
        WHERE m.user_id = ${userId}
        GROUP BY m.id, m.name, m.dosage, m.color
        ORDER BY m.name
      `;

      res.json(stats);
    } catch (error) {
      console.error('Error fetching medication stats:', error);
      res.status(500).json({ error: 'Failed to fetch medication stats' });
    }
  }
}

export default new RemindersController();