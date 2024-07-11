import { Router } from 'express';
import {
   addSubject,
   deleteSubject,
   getRecommendedSubject,
   getSubject,
   getSubjects,
   removeAllSubjects,
   updateSubject,
} from '../controllers/subjectController';
import { authorization } from '../middleware/authorization';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

router.get('/', authorization, asyncWrapper(getSubjects));
router.post('/', authorization, asyncWrapper(addSubject));
router.get('/recommended', authorization, asyncWrapper(getRecommendedSubject));
router.get('/:subjectId', authorization, asyncWrapper(getSubject));
router.put('/:subjectId', authorization, asyncWrapper(updateSubject));
router.delete('/all', authorization, asyncWrapper(removeAllSubjects));
router.delete('/:subjectId', authorization, asyncWrapper(deleteSubject));

export default router;
