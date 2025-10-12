import { aj } from "../config/arcjet.js";
import requestIp from "request-ip";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    // ✅ 1) Récupération de l’IP du client
    const clientIp = requestIp.getClientIp(req);

    // ✅ 2) Vérification stricte (fail-closed)
    if (!clientIp) {
      console.warn("Impossible de déterminer l'IP du client, requête rejetée");
      return res.status(400).json({
        error: "Bad Request",
        message: "Impossible de déterminer l'adresse IP du client.",
      });
    }

    // ✅ 3) Protection Arcjet (limitation, bot, sécurité)
    const decision = await aj.protect(req, {
      requested: 1,   // chaque requête consomme 1 jeton
      ip: clientIp,   // IP explicite
    });

    // ✅ 4) Décision Arcjet
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

    // ✅ 5) Continuer si tout est OK
    next();
  } catch (error) {
    console.error("Erreur du middleware Arcjet :", error);

    // ✅ 6) Sécurité absolue : fail-closed (on BLOQUE)
    return res.status(503).json({
      error: "Service temporairement indisponible",
      message: "Le service de sécurité est momentanément indisponible. Veuillez réessayer.",
    });

    // 🔄 Alternative si tu préfères remonter l’erreur :
    // next(error);
  }
};
