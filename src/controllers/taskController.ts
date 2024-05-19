import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import SubjectModel from '../models/Subject.model';
import TaskModel from '../models/Task.model';
import UserModel from '../models/User.model';

export const getTasks: RequestHandler = async (req, res, next) => {
   const userId = req.user?.userId;
   try {
      if (!userId) {
         throw createHttpError(400, 'Invalid token');
      }

      const user = await UserModel.findById(userId);
      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const tasks = await TaskModel.find({ user: userId });

      res.status(200).json(tasks);
   } catch (error) {
      next(error);
   }
};

export const getTask: RequestHandler = async (req, res, next) => {
   const userId = req.user?.userId;
   const taskId = req.params.taskId;
   try {
      if (!mongoose.isValidObjectId(taskId)) {
         throw createHttpError(400, 'Invalid taskId');
      }

      if (!userId) {
         throw createHttpError(400, 'Invalid token');
      }

      const user = await UserModel.findById(userId);

      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const task = await TaskModel.findById(taskId);

      if (!task) {
         throw createHttpError(404, 'Task not found');
      }

      if (task.user?.toString() !== user._id.toString()) {
         throw createHttpError(403, 'No permission to access this task');
      }

      res.status(200).json(task);
   } catch (error) {
      next(error);
   }
};

interface AddTaskRequest {
   title?: string;
   subjectId?: string;
   date?: string;
}

export const addTask: RequestHandler<
   unknown,
   unknown,
   AddTaskRequest,
   unknown
> = async (req, res, next) => {
   const title = req.body.title;
   const subjectId = req.body.subjectId;
   const userId = req.user?.userId;
   const date = req.body.date;
   try {
      if (!subjectId || !title) {
         throw createHttpError(400, 'subjectId, title and are required');
      }

      if (!mongoose.isValidObjectId(subjectId)) {
         throw createHttpError(400, 'Invalid Subject Id');
      }

      if (!userId) {
         throw createHttpError(400, 'Invalid Token');
      }

      const user = await UserModel.findById(userId);

      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const subject = await SubjectModel.findById(subjectId);

      if (!subject) {
         throw createHttpError(404, 'Task not found');
      }

      const task = await TaskModel.create({
         title: title,
         completed: false,
         user: user._id,
         subject: subject._id,
         date: date || null,
      });

      subject.tasks.push(task._id);
      await subject.save();
      res.status(200).json(task);
   } catch (error) {
      next(error);
   }
};

interface UpdateTaskTitle {
   title?: string;
   date?: string;
}

export const updateTaskTitle: RequestHandler<
   ParamsDictionary,
   unknown,
   UpdateTaskTitle,
   unknown
> = async (req, res, next) => {
   const title = req.body.title;
   const taskId = req.params.taskId;
   const userId = req.user?.userId;
   const date = req.body.date;
   try {
      if (!mongoose.isValidObjectId(taskId)) {
         throw createHttpError(400, 'Invalid Task Id');
      }

      if (!userId) {
         throw createHttpError(400, 'Invalid Token');
      }

      const user = await UserModel.findById(userId);
      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const task = await TaskModel.findById(taskId).exec();
      if (!task) {
         throw createHttpError(404, 'Task Not found');
      }

      if (task.user?.toString() !== user._id.toString()) {
         throw createHttpError(403, 'No permission to edit this task');
      }

      if (!title) {
         throw createHttpError(400, 'Title is required');
      }

      task.title = title;
      task.date = date;

      await task.save();

      res.status(200).json(task);
   } catch (error) {
      next(error);
   }
};

interface UpdateTaskCompleted {
   completed?: boolean;
}

export const updateTaskCompleted: RequestHandler<
   ParamsDictionary,
   unknown,
   UpdateTaskCompleted,
   unknown
> = async (req, res, next) => {
   const taskId = req.params.taskId;
   const completed = req.body.completed;
   const userId = req.user?.userId;
   try {
      if (!mongoose.isValidObjectId(taskId)) {
         throw createHttpError(400, 'Invalid Task Id');
      }

      if (!userId) {
         throw createHttpError(400, 'Invalid Token');
      }

      const user = await UserModel.findById(userId);
      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const task = await TaskModel.findById(taskId);

      if (!task) {
         throw createHttpError(404, 'Task not found');
      }

      if (task.user?.toString() !== user._id.toString()) {
         throw createHttpError(403, 'No permission to edit this task');
      }

      if (completed === null || completed === undefined) {
         throw createHttpError(400, 'Completed is required');
      }

      task.completed = completed;
      await task.save();

      res.status(200).json(task);
   } catch (error) {
      next(error);
   }
};

export const removeTask: RequestHandler = async (req, res, next) => {
   const taskId = req.params.taskId;
   const userId = req.user?.userId;
   try {
      if (!mongoose.isValidObjectId(taskId)) {
         throw createHttpError(400, 'Invalid token id');
      }

      if (!userId) {
         throw createHttpError(400, 'Invalid token');
      }

      const user = await UserModel.findById(userId);

      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const task = await TaskModel.findById(taskId);

      if (!task) {
         throw createHttpError(404, 'Task not found');
      }

      if (task.user?.toString() !== user.id.toString()) {
         throw createHttpError(403, 'No permission to delete this task');
      }

      await SubjectModel.updateOne(
         { _id: task.subject },
         { $pull: { tasks: taskId } },
      );

      await task.deleteOne();

      res.status(200).json({ message: 'Task removed successfully' });
   } catch (error) {
      next(error);
   }
};

export const getTaskDates: RequestHandler = async (req, res, next) => {
   const userId = req.user?.userId;
   try {
      if (!userId) {
         throw createHttpError(400, 'Invalid token');
      }

      const user = await UserModel.findById(userId);

      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const taskWithDates = await TaskModel.find({
         $and: [{ user: userId }, { date: { $ne: null } }],
      }).populate('subject');

      res.status(200).json(taskWithDates);
   } catch (error) {
      next(error);
   }
};
