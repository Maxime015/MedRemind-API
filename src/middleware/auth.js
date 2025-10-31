// middleware/auth.js
import { createClerkClient } from "@clerk/clerk-sdk-node";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn("⚠️ No Authorization header provided");
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // ✅ Vérification correcte du token Clerk
    const session = await clerk.verifyToken(token);

    if (!session || !session.sub) {
      console.warn("⚠️ Invalid or expired Clerk token");
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // ✅ Ajouter les infos utilisateur à la requête
    req.user = {
      id: session.sub,
      email: session.email || session.email_address || null,
      firstName: session.first_name || null,
      lastName: session.last_name || null,
    };

    // ✅ Log utilisateur authentifié
    console.log("✅ Authenticated user:", {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      path: req.path,
      method: req.method,
    });

    next();
  } catch (error) {
    console.error("❌ Authentication error:", error.message);

    if (error.message.includes("jwt expired")) {
      return res.status(401).json({ error: "Token expired" });
    } else if (error.message.includes("invalid token")) {
      return res.status(401).json({ error: "Invalid token" });
    } else if (error.message.includes("missing")) {
      return res.status(401).json({ error: "Missing authentication token" });
    }

    return res.status(500).json({ error: "Authentication failed" });
  }
}
