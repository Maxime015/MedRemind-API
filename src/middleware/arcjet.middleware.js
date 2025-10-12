import { aj } from "../config/arcjet.js";
import requestIp from "request-ip";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    let clientIp = requestIp.getClientIp(req);

    // Chaîne de fallback améliorée
    if (!clientIp || clientIp === '') {
      clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
               || req.headers['x-real-ip']
               || req.connection?.remoteAddress
               || req.socket?.remoteAddress
               || req.connection?.socket?.remoteAddress
               || req.ip
               || "127.0.0.1"; // Fallback final
    }

    // Normalisation des adresses IP
    if (clientIp) {
      // Gestion des adresses IPv6 mappées en IPv4
      if (clientIp.startsWith("::ffff:")) {
        clientIp = clientIp.replace("::ffff:", "");
      }
      // Gestion du localhost IPv6
      if (clientIp === "::1") {
        clientIp = "127.0.0.1";
      }
    }

    // S'assurer d'avoir toujours une IP valide
    if (!clientIp || clientIp === '') {
      clientIp = "127.0.0.1";
      console.warn("Arcjet : Utilisation de l'IP fallback 127.0.0.1");
    }

    // Passer Arcjet pour les requêtes locales/internes
    const isLocal = clientIp === "127.0.0.1" || 
                   clientIp === "::1" || 
                   clientIp.startsWith("10.") || 
                   clientIp.startsWith("192.168.") || 
                   (clientIp.startsWith("172.") && 
                    parseInt(clientIp.split('.')[1]) >= 16 && 
                    parseInt(clientIp.split('.')[1]) <= 31) ||
                   clientIp === "localhost";

    if (isLocal) {
      console.log(`Arcjet : Requête locale ignorée depuis ${clientIp}`);
      return next();
    }

    // 🔧 CORRECTION : Vérifier que l'IP n'est pas vide avant d'appeler Arcjet
    if (!clientIp || clientIp.trim() === '') {
      console.warn("Arcjet : IP vide détectée, utilisation du fallback");
      clientIp = "127.0.0.1";
    }

    console.log(`Arcjet : Traitement de la requête depuis IP: ${clientIp}`);

    const decision = await aj.protect(req, {
      requested: 1,
      ip: clientIp, // 🔧 S'assurer que cette valeur n'est jamais vide
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ 
          error: "Trop de requêtes", 
          message: "La limite de requêtes a été dépassée." 
        });
      }
      if (decision.reason.isBot()) {
        return res.status(403).json({ 
          error: "Accès refusé au bot", 
          message: "Les requêtes automatisées ne sont pas autorisées." 
        });
      }
      return res.status(403).json({ 
        error: "Accès interdit", 
        message: "Accès refusé par la politique de sécurité." 
      });
    }

    next();
  } catch (error) {
    console.error("Erreur du middleware Arcjet :", error);
    // En production, autoriser les requêtes à continuer mais logger l'erreur
    console.error('Arcjet a échoué mais la requête continue');
    next();
  }
};