// routes/index.js
import express from 'express';
const router = express.Router();

// Import des contrôleurs
import medicationController from '../controllers/medicationController.js';
import doseHistoryController from '../controllers/doseHistoryController.js';
import notificationController from '../controllers/notificationController.js';

// Import du middleware d'authentification
import { requireAuth, getUserFromDb } from '../middleware/auth.js';

// Appliquer l'authentification à toutes les routes
router.use(requireAuth);
router.use(getUserFromDb);

// Routes des médicaments
router.get('/medications', medicationController.getMedications);
router.post('/medications', medicationController.createMedication);
router.put('/medications/:id', medicationController.updateMedication);
router.delete('/medications/:id', medicationController.deleteMedication);

// Routes de l'historique des prises
router.get('/dose-history', doseHistoryController.getDoseHistory);
router.post('/dose-history', doseHistoryController.recordDose);
router.get('/dose-history/today', doseHistoryController.getTodaysDoses);

// Routes des notifications
router.post('/notifications/register-token', notificationController.registerPushToken);
router.post('/notifications/test', notificationController.testNotification);

export default router;