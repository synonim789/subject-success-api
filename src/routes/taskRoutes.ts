import { Router } from 'express';
import {
   addTask,
   getCompletedCount,
   getRecommendedTasks,
   getTask,
   getTaskDates,
   getTasks,
   removeTask,
   updateTaskCompleted,
   updateTaskTitle,
} from '../controllers/taskController';
import { verifyJwt } from '../middleware/verifyJWT';

const router = Router();

router.get('/', verifyJwt, getTasks);
router.post('/', verifyJwt, addTask);
router.get('/dates', verifyJwt, getTaskDates);
router.get('/completed', verifyJwt, getCompletedCount);
router.get('/recommended', verifyJwt, getRecommendedTasks);
router.get('/:taskId', verifyJwt, getTask);
router.put('/title/:taskId', verifyJwt, updateTaskTitle);
router.put('/completed/:taskId', verifyJwt, updateTaskCompleted);
router.delete('/:taskId', verifyJwt, removeTask);

export default router;
