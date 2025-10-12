import { aj } from "../config/arcjet.js";
import requestIp from "request-ip";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    // ✅ 1) Récupération de l’IP SANS fallback
    const clientIp = requestIp.getClientIp(req);

    // ✅ 2) Vérification stricte de l’IP (fail-closed)
    // Ici, on considère que ne pas connaître l’IP = violation de politique de sécurité.
    if (!clientIp) {
      console.warn("Impossible de déterminer l'IP du client, requête rejetée");
      return res.status(403).json({
        error: "Forbidden",
        message: "Impossible de déterminer l'adresse IP du client.",
      });
    }

    // ✅ 3) Protection Arcjet (rate limit, bot, sécurité)
    const decision = await aj.protect(req, {
      requested: 1,   // chaque requête consomme 1 jeton
      ip: clientIp,   // on fournit explicitement l'IP
    });

    // ✅ 4) Gestion des blocages Arcjet
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

    // ✅ 5) Continuer si la requête est autorisée
    next();

  } catch (error) {
    console.error("Erreur du middleware Arcjet :", error);

    // ✅ 6) Fail-closed : on bloque si Arcjet est indisponible
    return res.status(503).json({
      error: "Service temporairement indisponible",
      message: "Le service de sécurité est momentanément indisponible. Veuillez réessayer.",
    });


  }
};
