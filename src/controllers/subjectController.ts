import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import SubjectModel from '../models/Subject.model';
import TaskModel from '../models/Task.model';
import UserModel from '../models/User.model';

export const getSubjects: RequestHandler = async (req, res, next) => {
   try {
      const userId = req.user?.userId;

      if (!userId) {
         throw createHttpError(400, 'Invalid token');
      }

      const user = await UserModel.findById(userId);

      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const subjects = await SubjectModel.find({ user: userId }).populate(
         'tasks',
      );

      res.status(200).json(subjects);
   } catch (error) {
      next(error);
   }
};

export const getSubject: RequestHandler = async (req, res, next) => {
   const subjectId = req.params.subjectId;
   const userId = req.user?.userId;
   try {
      if (!mongoose.isValidObjectId(subjectId)) {
         throw createHttpError(400, 'Invalid subject id');
      }

      if (!userId) {
         throw createHttpError(400, 'Invalid token');
      }

      const user = await UserModel.findById(userId);
      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const subject = await SubjectModel.findById(subjectId);

      if (!subject) {
         throw createHttpError(404, 'Subject not found');
      }

      if (subject.user?.toString() !== user._id.toString()) {
         throw createHttpError(403, 'No permission to get task');
      }

      res.status(200).json(subject);
   } catch (error) {
      next(error);
   }
};

interface AddSubjectRequest {
   name?: string;
   type?: 'grade' | 'completion';
}

export const addSubject: RequestHandler<
   unknown,
   unknown,
   AddSubjectRequest,
   unknown
> = async (req, res, next) => {
   const name = req.body.name;
   const type = req.body.type;
   const userId = req.user?.userId;
   try {
      if (!name || !type) {
         throw createHttpError(400, 'name and type are required');
      }

      if (!userId) {
         throw createHttpError(400, 'Invalid token');
      }

      const user = await UserModel.findById(userId);

      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const subject = new SubjectModel();

      subject.name = name;
      subject.status = 'noTasks';
      subject.user = user._id;

      if (type === 'completion') {
         subject.type = 'completion';
         subject.completed = false;
      } else if (type === 'grade') {
         subject.type = 'grade';
         subject.grade = 0;
      }
      await subject.save();
      res.status(200).json(subject);
   } catch (error) {
      next(error);
   }
};

interface UpdateSubjectRequest {
   name?: string;
   type?: 'grade' | 'completion';
   grade?: number;
   completed?: boolean;
}

export const updateSubject: RequestHandler<
   ParamsDictionary,
   unknown,
   UpdateSubjectRequest,
   unknown
> = async (req, res, next) => {
   const subjectId = req.params.subjectId;
   const name = req.body.name;
   const type = req.body.type;
   const completed = req.body.completed;
   const userId = req.user?.userId;
   try {
      if (!mongoose.isValidObjectId(subjectId)) {
         throw createHttpError(400, 'Invalid Subject Id');
      }

      if (!userId) {
         throw createHttpError(400, 'Invalid token');
      }

      const user = await UserModel.findById(userId);

      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const subject = await SubjectModel.findById(subjectId);

      if (!subject) {
         throw createHttpError(404, 'Subject not found');
      }

      if (subject.user?.toString() !== user._id.toString()) {
         throw createHttpError(403, 'No Permission to update this subject');
      }

      subject.name = name || subject.name;

      if (type === 'completion') {
         subject.type = 'completion';
         subject.grade = null;
         subject.completed = completed || false;
      } else if (type === 'grade') {
         subject.type = 'grade';
         subject.grade = 0;
         subject.completed = null;
      }

      await subject.save();

      res.status(200).json(subject);
   } catch (error) {
      next(error);
   }
};

export const deleteSubject: RequestHandler = async (req, res, next) => {
   const subjectId = req.params.subjectId;
   const userId = req.user?.userId;

   try {
      if (!mongoose.isValidObjectId(subjectId)) {
         throw createHttpError(400, 'Invalid subject');
      }

      if (!userId) {
         throw createHttpError(400, 'invalid token');
      }

      const user = await UserModel.findById(userId);

      if (!user) {
         throw createHttpError(404, 'User not found');
      }

      const subject = await SubjectModel.findById(subjectId);
      if (!subject) {
         throw createHttpError(404, 'Subject not found');
      }

      if (subject.user?.toString() !== user._id.toString()) {
         throw createHttpError(403, 'No Permission to delete this subject');
      }

      await TaskModel.deleteMany({ subject: subjectId });

      await subject.deleteOne();

      res.status(200).json({ message: 'Task removed successfully' });
   } catch (error) {
      next(error);
   }
};
