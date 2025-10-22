// middleware/auth.js
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { sql } from '../config/db.js';

// Middleware Clerk pour vérifier l'authentification
export const requireAuth = ClerkExpressRequireAuth();

// Middleware pour récupérer l'utilisateur depuis la base de données
export const getUserFromDb = async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;
    
    if (!clerkUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Récupérer ou créer l'utilisateur dans notre base de données
    const user = await sql`
      INSERT INTO users (clerk_user_id, email) 
      VALUES (${clerkUserId}, ${req.auth.sessionClaims?.email || ''}) 
      ON CONFLICT (clerk_user_id) 
      DO UPDATE SET updated_at = CURRENT_TIMESTAMP 
      RETURNING *
    `;

    req.user = user[0];
    next();
  } catch (error) {
    console.error('Error in getUserFromDb:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};