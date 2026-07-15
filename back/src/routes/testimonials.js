import { Router } from 'express';
import { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialsController.js';
const router = Router();
router.get('/', listTestimonials);
router.post('/', createTestimonial);
router.put('/:id', updateTestimonial);
router.delete('/:id', deleteTestimonial);
export default router;
