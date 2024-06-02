import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import SubjectModel from '../models/Subject.model';
import TaskModel from '../models/Task.model';
import {
   AddTaskSchema,
   UpdateTaskCompletedSchema,
   UpdateTaskTitleSchema,
} from '../schemas/task';

export const getTasks: RequestHandler = async (req, res) => {
   const userId = req.user.userId;

   const tasks = await TaskModel.find({ user: userId }).populate('subject');

   res.status(200).json(tasks);
};

export const getTask: RequestHandler = async (req, res) => {
   const userId = req.user.userId;
   const taskId = req.params.taskId;
   if (!mongoose.isValidObjectId(taskId)) {
      throw createHttpError(400, 'Invalid taskId');
   }

   const task = await TaskModel.findById(taskId).populate('subject');

   if (!task) {
      throw createHttpError(404, 'Task not found');
   }

   if (task.user?.toString() !== userId) {
      throw createHttpError(403, 'No permission to access this task');
   }

   res.status(200).json(task);
};

export const addTask: RequestHandler = async (req, res) => {
   const { date, subjectId, title } = AddTaskSchema.parse(req.body);
   const userId = req.user.userId;
   if (!subjectId || !title) {
      throw createHttpError(400, 'subjectId, title and are required');
   }

   if (!mongoose.isValidObjectId(subjectId)) {
      throw createHttpError(400, 'Invalid Subject Id');
   }

   const subject = await SubjectModel.findById(subjectId);

   if (!subject) {
      throw createHttpError(404, 'Task not found');
   }

   const task = await TaskModel.create({
      title: title,
      completed: false,
      user: userId,
      subject: subject._id,
      date: date || null,
   });

   subject.tasks.push(task._id);
   await subject.save();
   res.status(200).json(task);
};

export const updateTaskTitle: RequestHandler = async (req, res) => {
   const { title, date } = UpdateTaskTitleSchema.parse(req.body);
   const taskId = req.params.taskId;
   const userId = req.user.userId;
   if (!mongoose.isValidObjectId(taskId)) {
      throw createHttpError(400, 'Invalid Task Id');
   }

   const task = await TaskModel.findById(taskId).exec();
   if (!task) {
      throw createHttpError(404, 'Task Not found');
   }

   if (task.user?.toString() !== userId) {
      throw createHttpError(403, 'No permission to edit this task');
   }

   if (!title) {
      throw createHttpError(400, 'Title is required');
   }

   task.title = title;
   task.date = date;

   await task.save();

   res.status(200).json(task);
};

export const updateTaskCompleted: RequestHandler = async (req, res) => {
   const { completed } = UpdateTaskCompletedSchema.parse(req.body);
   const taskId = req.params.taskId;
   const userId = req.user.userId;
   if (!mongoose.isValidObjectId(taskId)) {
      throw createHttpError(400, 'Invalid Task Id');
   }

   const task = await TaskModel.findById(taskId);

   if (!task) {
      throw createHttpError(404, 'Task not found');
   }

   if (task.user?.toString() !== userId) {
      throw createHttpError(403, 'No permission to edit this task');
   }

   if (completed === null || completed === undefined) {
      throw createHttpError(400, 'Completed is required');
   }

   task.completed = completed;
   await task.save();

   res.status(200).json(task);
};

export const removeTask: RequestHandler = async (req, res) => {
   const taskId = req.params.taskId;
   const userId = req.user.userId;
   if (!mongoose.isValidObjectId(taskId)) {
      throw createHttpError(400, 'Invalid token id');
   }

   const task = await TaskModel.findById(taskId);

   if (!task) {
      throw createHttpError(404, 'Task not found');
   }

   if (task.user?.toString() !== userId) {
      throw createHttpError(403, 'No permission to delete this task');
   }

   await SubjectModel.updateOne(
      { _id: task.subject },
      { $pull: { tasks: taskId } },
   );

   await task.deleteOne();

   res.status(200).json({ message: 'Task removed successfully' });
};

export const getTaskDates: RequestHandler = async (req, res) => {
   const userId = req.user?.userId;

   const taskWithDates = await TaskModel.find({
      $and: [{ user: userId }, { date: { $ne: null } }],
   }).populate('subject');

   res.status(200).json(taskWithDates);
};

export const getCompletedCount: RequestHandler = async (req, res) => {
   const userId = req.user.userId;

   const tasks = await TaskModel.find({ user: userId });
   const taskCount = tasks.length;

   const completedTasks = await TaskModel.find({
      completed: true,
      user: userId,
   });
   const completedTaskCount = completedTasks.length;

   res.status(200).json({
      taskAmount: taskCount,
      completedTasks: completedTaskCount,
   });
};

export const getRecommendedTasks: RequestHandler = async (req, res) => {
   const userId = req.user?.userId;

   const recommendedTasks = await TaskModel.find({
      completed: false,
      user: userId,
   })
      .populate('subject')
      .sort({ date: -1 })
      .limit(3);
   res.status(200).json(recommendedTasks);
};
