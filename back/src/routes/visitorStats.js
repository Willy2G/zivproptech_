import { Router } from 'express';
import { getVisitorStats, trackVisitor } from '../controllers/visitorStatsController.js';
const router = Router();
router.get('/', getVisitorStats);
router.post('/track', trackVisitor);
export default router;
