import { Router } from 'express';
import {
   addSubject,
   deleteSubject,
   getRecommendedSubject,
   getSubject,
   getSubjects,
   updateSubject,
} from '../controllers/subjectController';
import { verifyJwt } from '../middleware/verifyJWT';

const router = Router();

router.get('/', verifyJwt, getSubjects);
router.post('/', verifyJwt, addSubject);
router.get('/recommended', verifyJwt, getRecommendedSubject);
router.get('/:subjectId', verifyJwt, getSubject);
router.put('/:subjectId', verifyJwt, updateSubject);
router.delete('/:subjectId', verifyJwt, deleteSubject);

export default router;
