import { Router } from 'express';
import { getVisitorStats } from '../controllers/visitorStatsController.js';
const router = Router();
router.get('/', getVisitorStats);
export default router;
