import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import SubjectModel from '../models/Subject.model';
import TaskModel from '../models/Task.model';

export const getSubjects: RequestHandler = async (req, res, next) => {
   const userId = req.user?.userId;

   const subjects = await SubjectModel.find({ user: userId }).populate('tasks');

   res.status(200).json(subjects);
};

export const getSubject: RequestHandler = async (req, res, next) => {
   const subjectId = req.params.subjectId;
   const userId = req.user?.userId;
   if (!mongoose.isValidObjectId(subjectId)) {
      throw createHttpError(400, 'Invalid subject id');
   }

   const subject = await SubjectModel.findById(subjectId);

   if (!subject) {
      throw createHttpError(404, 'Subject not found');
   }

   if (subject.user?.toString() !== userId) {
      throw createHttpError(403, 'No permission to get task');
   }

   res.status(200).json(subject);
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
   if (!name || !type) {
      throw createHttpError(400, 'name and type are required');
   }

   const subject = new SubjectModel();

   subject.name = name;
   subject.status = 'noTasks';
   subject.user = new mongoose.Types.ObjectId(userId);

   if (type === 'completion') {
      subject.type = 'completion';
      subject.completed = false;
   } else if (type === 'grade') {
      subject.type = 'grade';
      subject.grade = 0;
   }
   await subject.save();
   res.status(200).json(subject);
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
   const grade = req.body.grade;
   if (!mongoose.isValidObjectId(subjectId)) {
      throw createHttpError(400, 'Invalid Subject Id');
   }

   const subject = await SubjectModel.findById(subjectId);

   if (!subject) {
      throw createHttpError(404, 'Subject not found');
   }

   if (subject.user?.toString() !== userId) {
      throw createHttpError(403, 'No Permission to update this subject');
   }

   subject.name = name || subject.name;

   if (type === 'completion') {
      subject.type = 'completion';
      subject.grade = null;
      subject.completed = completed || false;
   } else if (type === 'grade') {
      subject.type = 'grade';
      subject.grade = grade || 0;
      subject.completed = null;
   }

   await subject.save();

   res.status(200).json(subject);
};

export const deleteSubject: RequestHandler = async (req, res, next) => {
   const subjectId = req.params.subjectId;
   const userId = req.user?.userId;

   if (!mongoose.isValidObjectId(subjectId)) {
      throw createHttpError(400, 'Invalid subject');
   }

   const subject = await SubjectModel.findById(subjectId);
   if (!subject) {
      throw createHttpError(404, 'Subject not found');
   }

   if (subject.user?.toString() !== userId) {
      throw createHttpError(403, 'No Permission to delete this subject');
   }

   await TaskModel.deleteMany({ subject: subjectId });

   await subject.deleteOne();

   res.status(200).json({ message: 'Task removed successfully' });
};

export const getRecommendedSubject: RequestHandler = async (req, res, next) => {
   const userId = req.user.userId;

   const subjects = await SubjectModel.aggregate([
      {
         $match: {
            user: new mongoose.Types.ObjectId(userId),
         },
      },
      {
         $lookup: {
            from: 'tasks',
            localField: 'tasks',
            foreignField: '_id',
            as: 'taskDetails',
         },
      },
      {
         $project: {
            _id: 1,
            name: 1,
            totalTask: { $size: '$taskDetails' },
            completedTasks: {
               $size: {
                  $filter: {
                     input: '$taskDetails',
                     as: 'task',
                     cond: { $eq: ['$$task.completed', true] },
                  },
               },
            },
         },
      },
      {
         $limit: 3,
      },
   ]);

   res.status(200).json(subjects);
};
