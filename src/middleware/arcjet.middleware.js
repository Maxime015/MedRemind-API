import { aj } from "../config/arcjet.js";
import requestIp from "request-ip";

// 🛡️ Middleware Arcjet pour la sécurité, la détection de bots et la limitation de requêtes
export const arcjetMiddleware = async (req, res, next) => {
  try {
    // ✅ Récupération de l’IP du client
    const clientIp = requestIp.getClientIp(req) || "127.0.0.1";

    if (!clientIp) {
      console.warn("Impossible de déterminer l'IP du client, requête rejetée");
      return res.status(400).json({
        error: "Bad Request",
        message: "Impossible de déterminer l'adresse IP du client.",
      });
    }

    // ✅ Chaque requête consomme 1 jeton (pour la limitation de fréquence)
    const decision = await aj.protect(req, {
      requested: 1,
      ip: clientIp, // Fournir explicitement l'IP client
    });

    // 🚫 Gérer les requêtes refusées par Arcjet
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        // Trop de requêtes envoyées en peu de temps
        return res.status(429).json({
          error: "Trop de requêtes",
          message: "La limite de requêtes a été dépassée. Veuillez réessayer plus tard.",
        });
      }

      if (decision.reason.isBot()) {
        // Accès bloqué pour les robots non autorisés
        return res.status(403).json({
          error: "Accès refusé au bot",
          message: "Les requêtes automatisées ne sont pas autorisées.",
        });
      }

      // Autres blocages (politique de sécurité)
      return res.status(403).json({
        error: "Accès interdit",
        message: "Accès refusé par la politique de sécurité.",
      });
    }

    // ✅ Continuer la requête si tout est valide
    next();
  } catch (error) {
    console.error("Erreur du middleware Arcjet :", error);
    // En cas d'erreur interne d'Arcjet, laisser la requête continuer
    next();
  }
};
