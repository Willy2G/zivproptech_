import { Router } from 'express';
import { listFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faqsController.js';
const router = Router();
router.get('/', listFaqs);
router.post('/', createFaq);
router.put('/:id', updateFaq);
router.delete('/:id', deleteFaq);
export default router;
