import clerk from '@clerk/clerk-sdk-node';

export async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Vérifier le token JWT avec Clerk
    const decoded = await clerk.verifyToken(token);
    const user = await clerk.users.getUser(decoded.sub);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    req.user = {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}