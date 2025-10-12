// arcjet.middleware.js — robust IP extraction + fallback
import { aj } from "../config/arcjet.js";
import requestIp from "request-ip";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    // Prefer x-forwarded-for (trust proxy must be enabled), puis d'autres sources
    let clientIp = requestIp.getClientIp(req);

    // try common fallbacks
    if (!clientIp) {
      clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
               || req.connection?.remoteAddress
               || req.socket?.remoteAddress
               || req.ip;
    }

    // Normalize IPv4 mapped addresses like ::ffff:127.0.0.1
    if (clientIp && clientIp.startsWith("::ffff:")) {
      clientIp = clientIp.replace("::ffff:", "");
    }

    // If still empty, use a safe fallback (must NOT be empty string)
    if (!clientIp) {
      clientIp = "127.0.0.1";
      console.warn("Arcjet: client IP was missing — using fallback 127.0.0.1");
    }

    // Optionally skip Arcjet checks for local/internal requests (useful for health checks)
    const isLocal = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp.startsWith("10.") || clientIp.startsWith("192.168.") || clientIp.startsWith("172.");
    if (isLocal) {
      // If you prefer, skip aj.protect for local/internal requests to avoid noise
      return next();
    }

    const decision = await aj.protect(req, {
      requested: 1,
      ip: clientIp,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ error: "Trop de requêtes", message: "La limite de requêtes a été dépassée." });
      }
      if (decision.reason.isBot()) {
        return res.status(403).json({ error: "Accès refusé au bot", message: "Les requêtes automatisées ne sont pas autorisées." });
      }
      return res.status(403).json({ error: "Accès interdit", message: "Accès refusé par la politique de sécurité." });
    }

    next();
  } catch (error) {
    console.error("Erreur du middleware Arcjet :", error);
    next(); // en doute, ne bloquez pas le service
  }
};
