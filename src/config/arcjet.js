import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";
import { ENV } from "./env.js";

// Initialisation de la sécurité Arcjet avec des règles de protection
export const aj = arcjet({
  key: ENV.ARCJET_KEY,
  characteristics: [
    // ✅ Caractéristique IP (ne nécessite plus d'import séparé)
    // Arcjet détecte automatiquement l'IP
  ],
  rules: [
    // 🛡️ "shield" protège l'application contre les attaques courantes 
    shield({ mode: "LIVE" }),

    // 🤖 Détection des bots
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),

    // ⚡ Limitation du nombre de requêtes
    tokenBucket({
      mode: "LIVE",
      refillRate: 10,
      interval: 10,
      capacity: 15,
    }),
  ],
});