import { aj } from "../config/arcjet.js";
import requestIp from "request-ip";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    // ✅ On récupère l'IP SANS fallback immédiat
    const clientIp = requestIp.getClientIp(req);

    if (!clientIp) {
      // ✅ Si aucune IP détectée, on REJETTE (bonne pratique sécurité)
      console.warn("Impossible de déterminer l'IP du client, requête rejetée");
      return res.status(400).json({
        error: "Bad Request",
        message: "Impossible de déterminer l'adresse IP du client.",
      });
    }

    // ✅ Limitation de requêtes + sécurité ARCJET
    const decision = await aj.protect(req, {
      requested: 1,
      ip: clientIp,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Trop de requêtes",
          message: "La limite de requêtes a été dépassée. Veuillez réessayer plus tard.",
        });
      }

      if (decision.reason.isBot()) {
        return res.status(403).json({
          error: "Accès refusé au bot",
          message: "Les requêtes automatisées ne sont pas autorisées.",
        });
      }

      return res.status(403).json({
        error: "Accès interdit",
        message: "Accès refusé par la politique de sécurité.",
      });
    }

    next();
  } catch (error) {
    console.error("Erreur du middleware Arcjet :", error);
    next(); // on laisse passer pour éviter de planter toute l’app
  }
};
