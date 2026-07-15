import { Router } from 'express';
import { listPosts, createPost, updatePost, deletePost, getPostBySlug } from '../controllers/blogController.js';
const router = Router();
router.get('/', listPosts);
router.get('/slug/:slug', getPostBySlug);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
export default router;
