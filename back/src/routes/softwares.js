import { Router } from 'express';
import { listSoftwares, updateSoftware } from '../controllers/softwaresController.js';
const router = Router();
router.get('/', listSoftwares);
router.put('/:id', updateSoftware);
export default router;
