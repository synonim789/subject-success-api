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
import { authorization } from '../middleware/authorization';

const router = Router();

router.get('/', authorization, getTasks);
router.post('/', authorization, addTask);
router.get('/dates', authorization, getTaskDates);
router.get('/completed', authorization, getCompletedCount);
router.get('/recommended', authorization, getRecommendedTasks);
router.get('/:taskId', authorization, getTask);
router.put('/title/:taskId', authorization, updateTaskTitle);
router.put('/completed/:taskId', authorization, updateTaskCompleted);
router.delete('/:taskId', authorization, removeTask);

export default router;
