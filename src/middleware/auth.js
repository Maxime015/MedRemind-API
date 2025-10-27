import clerk from '@clerk/clerk-sdk-node';

export async function authMiddleware(req, res, next) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Vérifier le token avec Clerk
    const session = await clerk.sessions.verifySession(sessionToken, process.env.CLERK_SECRET_KEY);
    const user = await clerk.users.getUser(session.userId);
    
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