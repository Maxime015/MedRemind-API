// db.js
import { neon } from "@neondatabase/serverless";
import 'dotenv/config';

// Connexion à la base de données
export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    // Table des utilisateurs (liée à Clerk)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        expo_push_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Table des médicaments
    await sql`
      CREATE TABLE IF NOT EXISTS medications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        times JSONB NOT NULL,
        start_date DATE NOT NULL,
        duration VARCHAR(50) NOT NULL,
        color VARCHAR(7) NOT NULL,
        reminder_enabled BOOLEAN DEFAULT true,
        current_supply INTEGER DEFAULT 0,
        total_supply INTEGER DEFAULT 0,
        refill_at INTEGER DEFAULT 0,
        refill_reminder BOOLEAN DEFAULT false,
        last_refill_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Table de l'historique des prises
    await sql`
      CREATE TABLE IF NOT EXISTS dose_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        medication_id INTEGER REFERENCES medications(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL,
        taken BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Table des notifications programmées
    await sql`
      CREATE TABLE IF NOT EXISTS scheduled_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        medication_id INTEGER REFERENCES medications(id) ON DELETE CASCADE,
        notification_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        scheduled_time TIME,
        repeats BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
}