import mongoose from 'mongoose';
import { Project } from '../models/Project.model.js';
import { Task } from '../models/Task.model.js';
import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateProject = [
  { path: 'owner', select: 'name email' },
  { path: 'members', select: 'name email' },
];

function isMember(project, userId) {
  const id = userId.toString();
  const ownerId = (project.owner?._id ?? project.owner).toString();
  if (ownerId === id) return true;
  return project.members.some((m) => (m._id ?? m).toString() === id);
}

export const createProject = asyncHandler(async (req, res) => {
  const { title, description = '' } = req.body;
  const ownerId = req.user._id;
  const project = await Project.create({
    title,
    description,
    owner: ownerId,
    members: [ownerId],
  });
  const populated = await Project.findById(project._id).populate(populateProject);
  return res.status(201).json({ data: populated });
});

export const getProjects = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role !== 'admin') {
    query = { members: req.user._id };
  }
  const projects = await Project.find(query).sort({ createdAt: -1 }).populate(populateProject);
  return res.json({ data: projects });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Validation failed', details: ['Invalid project id'] });
  }
  const project = await Project.findById(id).populate(populateProject);
  if (!project) {
    return res.status(404).json({ error: 'Not found', details: ['Project not found'] });
  }
  if (req.user.role !== 'admin' && !isMember(project, req.user._id)) {
    return res.status(403).json({ error: 'Forbidden', details: ['Not a member of this project'] });
  }
  return res.json({ data: project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Validation failed', details: ['Invalid project id'] });
  }
  const { title, description } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  const project = await Project.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate(
    populateProject
  );
  if (!project) {
    return res.status(404).json({ error: 'Not found', details: ['Project not found'] });
  }
  return res.json({ data: project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Validation failed', details: ['Invalid project id'] });
  }
  const project = await Project.findById(id);
  if (!project) {
    return res.status(404).json({ error: 'Not found', details: ['Project not found'] });
  }
  await Task.deleteMany({ project: id });
  await Project.findByIdAndDelete(id);
  return res.json({ data: { message: 'Project deleted' } });
});

export const addMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Validation failed', details: ['Invalid id'] });
  }
  const user = await User.findById(userId).select('-password');
  if (!user) {
    return res.status(404).json({ error: 'Not found', details: ['User not found'] });
  }
  const project = await Project.findById(id);
  if (!project) {
    return res.status(404).json({ error: 'Not found', details: ['Project not found'] });
  }
  if (!project.members.map((m) => m.toString()).includes(userId)) {
    project.members.push(userId);
    await project.save();
  }
  const populated = await Project.findById(id).populate(populateProject);
  return res.json({ data: populated });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Validation failed', details: ['Invalid id'] });
  }
  const project = await Project.findById(id);
  if (!project) {
    return res.status(404).json({ error: 'Not found', details: ['Project not found'] });
  }
  if (project.owner.toString() === userId) {
    return res.status(400).json({ error: 'Validation failed', details: ['Cannot remove project owner'] });
  }
  project.members = project.members.filter((m) => m.toString() !== userId);
  await project.save();
  const populated = await Project.findById(id).populate(populateProject);
  return res.json({ data: populated });
});
