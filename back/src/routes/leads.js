import { Router } from 'express';
import {
  createLead,
  listLeads,
  updateLeadStatus,
  deleteLead,
  updateLead,
} from '../controllers/leadsController.js';

const router = Router();

// POST   /api/leads      -> creation d'une demande de devis/demo (site public)
router.post('/', createLead);

// GET    /api/leads      -> liste (back-office CRM ; a proteger)
router.get('/', listLeads);

// PATCH  /api/leads/:id  -> mise a jour du statut (back-office CRM)
router.patch('/:id', updateLeadStatus);

// PUT    /api/leads/:id  -> mise a jour du lead complet (back-office CRM)
router.put('/:id', updateLead);

// DELETE /api/leads/:id  -> suppression (back-office CRM)
router.delete('/:id', deleteLead);

export default router;
