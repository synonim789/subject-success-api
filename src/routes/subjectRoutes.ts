import { Router } from 'express';
import {
   addSubject,
   deleteSubject,
   getSubject,
   getSubjects,
   updateSubject,
} from '../controllers/subjectController';
import { verifyJwt } from '../middleware/verifyJWT';

const router = Router();

router.get('/', verifyJwt, getSubjects);
router.post('/', verifyJwt, addSubject);
router.get('/:subjectId', verifyJwt, getSubject);
router.put('/:subjectId', verifyJwt, updateSubject);
router.delete('/:subjectId', verifyJwt, deleteSubject);

export default router;
