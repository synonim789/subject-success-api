import { Router } from 'express';
import {
   addSubject,
   deleteSubject,
   getRecommendedSubject,
   getSubject,
   getSubjects,
   updateSubject,
} from '../controllers/subjectController';
import { authorization } from '../middleware/authorization';

const router = Router();

router.get('/', authorization, getSubjects);
router.post('/', authorization, addSubject);
router.get('/recommended', authorization, getRecommendedSubject);
router.get('/:subjectId', authorization, getSubject);
router.put('/:subjectId', authorization, updateSubject);
router.delete('/:subjectId', authorization, deleteSubject);

export default router;
