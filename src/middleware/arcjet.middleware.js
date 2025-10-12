import { aj } from "../config/arcjet.js";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    // ✅ Protection Arcjet (rate limit, bot, sécurité)
    // Arcjet détecte automatiquement l'IP
    const decision = await aj.protect(req, {
      requested: 1,   // chaque requête consomme 1 jeton
    });

    // ✅ Gestion des blocages Arcjet
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

    // ✅ Continuer si la requête est autorisée
    next();

  } catch (error) {
    console.error("Erreur du middleware Arcjet :", error);

    // ✅ Fail-closed : on bloque si Arcjet est indisponible
    return res.status(503).json({
      error: "Service temporairement indisponible",
      message: "Le service de sécurité est momentanément indisponible. Veuillez réessayer.",
    });
  }
};