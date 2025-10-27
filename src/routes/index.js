import express from 'express';
import medicationsController from '../controllers/medicationsController.js';
import doseHistoryController from '../controllers/doseHistoryController.js';
import remindersController from '../controllers/remindersController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes des médicaments
router.get('/medications', medicationsController.getMedications);
router.post('/medications', medicationsController.createMedication);
router.put('/medications/:id', medicationsController.updateMedication);
router.delete('/medications/:id', medicationsController.deleteMedication);
router.patch('/medications/:id/supply', medicationsController.updateSupply);

// Routes de l'historique des prises
router.get('/dose-history', doseHistoryController.getDoseHistory);
router.get('/dose-history/today', doseHistoryController.getTodaysDoses);
router.post('/dose-history', doseHistoryController.recordDose);
router.delete('/dose-history/medication/:medicationId', doseHistoryController.deleteMedicationHistory);

// Routes des rappels
router.get('/reminders/refill', remindersController.getRefillReminders);
router.get('/reminders/today', remindersController.getTodaysMedications);
router.get('/stats', remindersController.getMedicationStats);

// Route de santé de l'API
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    user: req.user.id 
  });
});

export default router;