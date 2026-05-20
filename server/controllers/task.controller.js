import mongoose from 'mongoose';
import { Project } from '../models/Project.model.js';
import { Task } from '../models/Task.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateTask = [
  { path: 'assignedTo', select: 'name email' },
  { path: 'project', select: 'title' },
  { path: 'createdBy', select: 'name email' },
];

async function userProjectIds(userId) {
  const projects = await Project.find({ members: userId }).select('_id');
  return projects.map((p) => p._id);
}

function memberTaskScope(userId, projectIds) {
  return {
    $or: [{ assignedTo: userId }, { project: { $in: projectIds } }],
  };
}

async function canAccessTask(task, user) {
  if (user.role === 'admin') return true;
  const assignee = task.assignedTo?._id?.toString() || task.assignedTo?.toString();
  if (assignee && assignee === user._id.toString()) return true;
  const projectId = task.project?._id?.toString() || task.project?.toString();
  if (!projectId) return false;
  const project = await Project.findById(projectId);
  if (!project) return false;
  const memberIds = project.members.map((m) => m.toString());
  return memberIds.includes(user._id.toString());
}

export const createTask = asyncHandler(async (req, res) => {
  const { title, description = '', project: projectId, assignedTo, priority, dueDate } = req.body;
  if (!mongoose.isValidObjectId(projectId)) {
    return res.status(400).json({ error: 'Validation failed', details: ['Invalid project id'] });
  }
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ error: 'Not found', details: ['Project not found'] });
  }
  if (assignedTo) {
    if (!mongoose.isValidObjectId(assignedTo)) {
      return res.status(400).json({ error: 'Validation failed', details: ['Invalid assignee id'] });
    }
    const memberIds = project.members.map((m) => m.toString());
    if (!memberIds.includes(assignedTo)) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['Assignee must be a member of the project'],
      });
    }
  }
  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    priority,
    dueDate: dueDate ? new Date(dueDate) : null,
  });
  const populated = await Task.findById(task._id).populate(populateTask);
  return res.status(201).json({ data: populated });
});

export const getTasks = asyncHandler(async (req, res) => {
  const { project: projectFilter, status, assignedTo } = req.query;
  const filter = {};

  if (projectFilter) {
    if (!mongoose.isValidObjectId(projectFilter)) {
      return res.status(400).json({ error: 'Validation failed', details: ['Invalid project filter'] });
    }
    filter.project = projectFilter;
  }
  if (status) {
    if (!['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Validation failed', details: ['Invalid status'] });
    }
    filter.status = status;
  }
  if (assignedTo) {
    if (!mongoose.isValidObjectId(assignedTo)) {
      return res.status(400).json({ error: 'Validation failed', details: ['Invalid assignedTo filter'] });
    }
    filter.assignedTo = assignedTo;
  }

  if (req.user.role !== 'admin') {
    const projectIds = await userProjectIds(req.user._id);
    const scope = memberTaskScope(req.user._id, projectIds);
    const combined = { $and: [scope, filter] };
    const tasks = await Task.find(combined).sort({ createdAt: -1 }).populate(populateTask);
    return res.json({ data: tasks });
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1 }).populate(populateTask);
  return res.json({ data: tasks });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Validation failed', details: ['Invalid task id'] });
  }
  const task = await Task.findById(id).populate(populateTask);
  if (!task) {
    return res.status(404).json({ error: 'Not found', details: ['Task not found'] });
  }
  const allowed = await canAccessTask(task, req.user);
  if (!allowed) {
    return res.status(403).json({ error: 'Forbidden', details: ['Access denied'] });
  }
  return res.json({ data: task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Validation failed', details: ['Invalid task id'] });
  }
  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ error: 'Not found', details: ['Task not found'] });
  }

  if (req.user.role === 'admin') {
    const { title, description, assignedTo, priority, dueDate, status } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) {
      if (!['todo', 'in-progress', 'done'].includes(status)) {
        return res.status(400).json({ error: 'Validation failed', details: ['Invalid status'] });
      }
      task.status = status;
    }
    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === '') {
        task.assignedTo = null;
      } else {
        if (!mongoose.isValidObjectId(assignedTo)) {
          return res.status(400).json({ error: 'Validation failed', details: ['Invalid assignee id'] });
        }
        const project = await Project.findById(task.project);
        const memberIds = project.members.map((m) => m.toString());
        if (!memberIds.includes(assignedTo)) {
          return res.status(400).json({
            error: 'Validation failed',
            details: ['Assignee must be a member of the project'],
          });
        }
        task.assignedTo = assignedTo;
      }
    }
    await task.save();
    const populated = await Task.findById(task._id).populate(populateTask);
    return res.json({ data: populated });
  }

  // Member: only status on assigned tasks
  const assignee = task.assignedTo?.toString();
  if (!assignee || assignee !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Forbidden', details: ['Can only update tasks assigned to you'] });
  }
  const { status } = req.body;
  const otherKeys = Object.keys(req.body).filter((k) => k !== 'status' && req.body[k] !== undefined);
  if (otherKeys.length > 0) {
    return res.status(403).json({ error: 'Forbidden', details: ['Members may only update status'] });
  }
  if (status === undefined) {
    return res.status(400).json({ error: 'Validation failed', details: ['Status is required'] });
  }
  if (!['todo', 'in-progress', 'done'].includes(status)) {
    return res.status(400).json({ error: 'Validation failed', details: ['Invalid status'] });
  }
  task.status = status;
  await task.save();
  const populated = await Task.findById(task._id).populate(populateTask);
  return res.json({ data: populated });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Validation failed', details: ['Invalid task id'] });
  }
  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    return res.status(404).json({ error: 'Not found', details: ['Task not found'] });
  }
  return res.json({ data: { message: 'Task deleted' } });
});
