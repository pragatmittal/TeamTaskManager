import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

taskSchema.virtual('isOverdue').get(function isOverdueVirtual() {
  if (!this.dueDate || this.status === 'done') return false;
  return this.dueDate < new Date();
});

export const Task = mongoose.model('Task', taskSchema);
