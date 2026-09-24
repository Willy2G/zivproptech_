import { Router } from 'express';
import { getSettings, getCalendlyUrl, updateSettings, getSmsBalance } from '../controllers/settingsController.js';
const router = Router();
router.get('/', getSettings);
router.get('/sms-balance', getSmsBalance);
router.get('/calendly', getCalendlyUrl);
router.put('/', updateSettings);
export default router;
