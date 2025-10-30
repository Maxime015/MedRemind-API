// middleware/auth.js
import { verifyToken } from '@clerk/backend';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // Vérifie le token avec Clerk - version corrigée
    const result = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!result || !result.sub) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Ajoute les infos utilisateur dans la requête
    req.user = {
      id: result.sub,
      email: result.email,
      firstName: result.first_name,
      lastName: result.last_name,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    // Messages d'erreur plus spécifiques
    if (error.message.includes('jwt expired')) {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.message.includes('invalid token')) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(401).json({ error: 'Authentication failed' });
  }
}