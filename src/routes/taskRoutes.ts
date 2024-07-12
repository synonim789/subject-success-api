import { Router } from 'express';
import {
   addTask,
   getCompletedCount,
   getRecommendedTasks,
   getTask,
   getTaskDates,
   getTasks,
   removeAllTasks,
   removeTask,
   updateTaskCompleted,
   updateTaskTitle,
} from '../controllers/taskController';
import { authorization } from '../middleware/authorization';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

router.get('/', authorization, asyncWrapper(getTasks));
router.post('/', authorization, asyncWrapper(addTask));
router.get('/dates', authorization, asyncWrapper(getTaskDates));
router.get('/completed', authorization, asyncWrapper(getCompletedCount));
router.get('/recommended', authorization, asyncWrapper(getRecommendedTasks));
router.get('/:taskId', authorization, asyncWrapper(getTask));
router.put('/title/:taskId', authorization, asyncWrapper(updateTaskTitle));
router.put(
   '/completed/:taskId',
   authorization,
   asyncWrapper(updateTaskCompleted),
);
router.delete('/all', authorization, asyncWrapper(removeAllTasks));
router.delete('/:taskId', authorization, asyncWrapper(removeTask));

export default router;
