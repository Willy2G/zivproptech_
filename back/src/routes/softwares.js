import { Router } from 'express';
import { listSoftwares, updateSoftware, createSoftware, deleteSoftware } from '../controllers/softwaresController.js';
const router = Router();
router.get('/', listSoftwares);
router.post('/', createSoftware);
router.put('/:id', updateSoftware);
router.delete('/:id', deleteSoftware);
export default router;
