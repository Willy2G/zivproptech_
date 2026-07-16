import { Router } from 'express';
import { getSettings, getCalendlyUrl, updateSettings } from '../controllers/settingsController.js';
const router = Router();
router.get('/', getSettings);
router.get('/calendly', getCalendlyUrl);
router.put('/', updateSettings);
export default router;
