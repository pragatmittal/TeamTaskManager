import { Project } from '../models/Project.model.js';
import { Task } from '../models/Task.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function memberProjectIds(userId) {
  const projects = await Project.find({ members: userId }).select('_id');
  return projects.map((p) => p._id);
}

function memberTaskScope(userId, projectIds) {
  return {
    $or: [{ assignedTo: userId }, { project: { $in: projectIds } }],
  };
}

const taskPopulate = [
  { path: 'assignedTo', select: 'name email' },
  { path: 'project', select: 'title' },
  { path: 'createdBy', select: 'name email' },
];

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const overdueQuery = { dueDate: { $lt: now }, status: { $ne: 'done' } };

  if (req.user.role === 'admin') {
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    const tasksByStatusAgg = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const tasksByStatus = { todo: 0, 'in-progress': 0, done: 0 };
    tasksByStatusAgg.forEach((row) => {
      if (row._id && tasksByStatus[row._id] !== undefined) {
        tasksByStatus[row._id] = row.count;
      }
    });
    const overdueTasks = await Task.find(overdueQuery).sort({ dueDate: 1 }).populate(taskPopulate).limit(50);
    const myTasks = await Task.find({ assignedTo: req.user._id })
      .sort({ dueDate: 1, createdAt: -1 })
      .populate(taskPopulate);
    const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(5).populate([
      { path: 'owner', select: 'name email' },
      { path: 'members', select: 'name email' },
    ]);
    return res.json({
      data: {
        totalProjects,
        totalTasks,
        tasksByStatus,
        overdueTasks,
        myTasks,
        recentProjects,
      },
    });
  }

  const projectIds = await memberProjectIds(req.user._id);
  const scope = memberTaskScope(req.user._id, projectIds);

  const totalProjects = await Project.countDocuments({ members: req.user._id });
  const totalTasks = await Task.countDocuments(scope);
  const tasksByStatusAgg = await Task.aggregate([
    { $match: scope },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const tasksByStatus = { todo: 0, 'in-progress': 0, done: 0 };
  tasksByStatusAgg.forEach((row) => {
    if (row._id && tasksByStatus[row._id] !== undefined) {
      tasksByStatus[row._id] = row.count;
    }
  });
  const overdueTasks = await Task.find({ $and: [scope, overdueQuery] })
    .sort({ dueDate: 1 })
    .populate(taskPopulate)
    .limit(50);
  const myTasks = await Task.find({ assignedTo: req.user._id })
    .sort({ dueDate: 1, createdAt: -1 })
    .populate(taskPopulate);
  const recentProjects = await Project.find({ members: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate([
      { path: 'owner', select: 'name email' },
      { path: 'members', select: 'name email' },
    ]);

  return res.json({
    data: {
      totalProjects,
      totalTasks,
      tasksByStatus,
      overdueTasks,
      myTasks,
      recentProjects,
    },
  });
});
