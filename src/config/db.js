// db.js
import { neon } from "@neondatabase/serverless";
import 'dotenv/config';

// Connexion à la base de données
export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    // Table des médicaments
    await sql`
      CREATE TABLE IF NOT EXISTS medications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        times TEXT[] NOT NULL,
        start_date DATE NOT NULL,
        duration VARCHAR(50) NOT NULL,
        color VARCHAR(7) NOT NULL,
        reminder_enabled BOOLEAN DEFAULT true,
        current_supply INTEGER DEFAULT 0,
        total_supply INTEGER DEFAULT 0,
        refill_at INTEGER DEFAULT 0,
        refill_reminder BOOLEAN DEFAULT false,
        last_refill_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Table de l'historique des prises
    await sql`
      CREATE TABLE IF NOT EXISTS dose_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL,
        taken BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Index pour améliorer les performances
    await sql`CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dose_history_user_id ON dose_history(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dose_history_medication_id ON dose_history(medication_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dose_history_timestamp ON dose_history(timestamp)`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
}







