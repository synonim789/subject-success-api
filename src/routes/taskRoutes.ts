import { Router } from 'express';
import {
   addTask,
   getTask,
   getTasks,
   removeTask,
   updateTask,
} from '../controllers/taskController';
import { verifyJwt } from '../middleware/verifyJWT';

const router = Router();

router.get('/', verifyJwt, getTasks);
router.post('/', verifyJwt, addTask);
router.get('/:taskId', verifyJwt, getTask);
router.put('/:taskId', verifyJwt, updateTask);
router.delete('/:taskId', verifyJwt, removeTask);

export default router;
