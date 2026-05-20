import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import { connectDB } from './config/db.js';
import { User } from './models/User.model.js';
import { Project } from './models/Project.model.js';
import { Task } from './models/Task.model.js';

const PASSWORD = 'password123';

const PROJECT_TITLES = [
  { title: 'Website Relaunch', description: 'Marketing site redesign and launch checklist.' },
  { title: 'Mobile App v2', description: 'iOS and Android feature parity release.' },
  { title: 'Internal Tools', description: 'Admin dashboards and automation scripts.' },
  { title: 'Customer Onboarding', description: 'Signup funnel and welcome email flows.' },
  { title: 'Data Migration', description: 'Legacy CRM to new platform cutover.' },
  { title: 'Security Audit', description: 'Pen test fixes and compliance checklist.' },
  { title: 'API Platform', description: 'Public REST API and developer docs.' },
  { title: 'Design System', description: 'Shared UI components and Figma library.' },
  { title: 'Sales Enablement', description: 'Decks, demos, and battle cards for Q3.' },
  { title: 'Support Portal', description: 'Help center articles and ticket routing.' },
];

const TASK_TEMPLATES = [
  { title: 'Draft hero copy', description: 'Homepage headline and subcopy.', status: 'done', priority: 'medium', daysOffset: -3 },
  { title: 'Implement auth screens', description: 'Login and signup flows.', status: 'in-progress', priority: 'high', daysOffset: 7 },
  { title: 'QA smoke tests', description: 'Cross-browser regression pass.', status: 'todo', priority: 'low', daysOffset: 14 },
  { title: 'Overdue analytics export', description: 'Weekly metrics CSV for leadership.', status: 'todo', priority: 'high', daysOffset: -5 },
  { title: 'Provision staging DB', description: 'Clone prod schema to staging.', status: 'in-progress', priority: 'medium', daysOffset: 3 },
  { title: 'Wireframe checkout flow', description: 'Cart and payment screens.', status: 'todo', priority: 'medium', daysOffset: 10 },
  { title: 'Set up CI pipeline', description: 'GitHub Actions for lint and test.', status: 'done', priority: 'low', daysOffset: -1 },
  { title: 'Write API rate limits', description: 'Document quotas per tier.', status: 'in-progress', priority: 'high', daysOffset: 5 },
  { title: 'Migrate user avatars', description: 'S3 bucket move and CDN URLs.', status: 'todo', priority: 'medium', daysOffset: 21 },
  { title: 'Fix XSS in comments', description: 'Sanitize rich text input.', status: 'in-progress', priority: 'high', daysOffset: 2 },
  { title: 'Onboarding email sequence', description: 'Day 1, 3, 7 drip campaign.', status: 'todo', priority: 'low', daysOffset: null },
  { title: 'Load test checkout', description: 'k6 script for Black Friday peak.', status: 'todo', priority: 'high', daysOffset: 12 },
  { title: 'Update privacy policy', description: 'Legal review for GDPR section.', status: 'done', priority: 'medium', daysOffset: -7 },
  { title: 'Build role permissions matrix', description: 'RBAC table for admin vs member.', status: 'done', priority: 'high', daysOffset: -2 },
  { title: 'Slack alert integration', description: 'Notify #eng on failed deploys.', status: 'in-progress', priority: 'low', daysOffset: 8 },
  { title: 'Refactor task service', description: 'Split monolith controller layer.', status: 'todo', priority: 'medium', daysOffset: 18 },
  { title: 'Customer interview synthesis', description: 'Summarize 8 onboarding calls.', status: 'in-progress', priority: 'low', daysOffset: 6 },
  { title: 'Dark mode tokens', description: 'Tailwind theme extension.', status: 'todo', priority: 'medium', daysOffset: 15 },
  { title: 'Backup verification drill', description: 'Restore test from nightly snapshot.', status: 'todo', priority: 'high', daysOffset: -4 },
  { title: 'Release notes v1.4', description: 'Changelog for app store submission.', status: 'done', priority: 'low', daysOffset: 4 },
];

function addDays(base, days) {
  if (days === null || days === undefined) return null;
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

async function seed() {
  await connectDB();

  await Task.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});

  const admin = await User.create({
    name: 'Alex Admin',
    email: 'admin@example.com',
    password: PASSWORD,
    role: 'admin',
  });

  const memberDocs = [
    {
      name: 'Morgan Member',
      email: 'member@example.com',
      password: PASSWORD,
      role: 'member',
    },
  ];

  const firstNames = [
    'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Blake', 'Drew',
    'Jamie', 'Skyler', 'Reese', 'Parker', 'Hayden', 'Emerson', 'Finley', 'Rowan',
    'Sage', 'River', 'Phoenix', 'Dakota', 'Alex', 'Sam', 'Chris', 'Pat',
    'Robin', 'Lee', 'Kim', 'Ash', 'Max', 'Jules', 'Charlie', 'Frankie', 'Remy',
    'Noel', 'Shawn', 'Dana', 'Kai', 'Nico', 'Morgan', 'Logan', 'Harper',
    'Ellis', 'Cameron', 'Devon', 'Jesse', 'Kerry', 'Lane', 'Marley', 'Oakley',
  ];

  for (let i = 2; i <= 50; i++) {
    const first = firstNames[(i - 2) % firstNames.length];
    memberDocs.push({
      name: `${first} Member`,
      email: `member${i}@example.com`,
      password: PASSWORD,
      role: 'member',
    });
  }

  const members = await User.insertMany(memberDocs);
  const allMemberIds = members.map((m) => m._id);
  const primaryMember = members[0];

  const projects = [];
  for (let i = 0; i < PROJECT_TITLES.length; i++) {
    const { title, description } = PROJECT_TITLES[i];
    const memberCount = 3 + (i % 5);
    const projectMembers = pickN(allMemberIds, memberCount);
    const memberSet = new Set([admin._id.toString(), ...projectMembers.map((id) => id.toString())]);
    projects.push(
      await Project.create({
        title,
        description,
        owner: admin._id,
        members: [...memberSet].map((id) => new mongoose.Types.ObjectId(id)),
      })
    );
  }

  const now = new Date();
  const tasks = TASK_TEMPLATES.map((tpl, index) => {
    const project = projects[index % projects.length];
    const projectMemberIds = project.members.filter((m) => m.toString() !== admin._id.toString());
    const assignee =
      index % 4 === 2 ? null : pickRandom(projectMemberIds.length ? projectMemberIds : allMemberIds);

    return {
      title: tpl.title,
      description: tpl.description,
      project: project._id,
      assignedTo: assignee,
      createdBy: admin._id,
      status: tpl.status,
      priority: tpl.priority,
      dueDate: addDays(now, tpl.daysOffset),
    };
  });

  await Task.insertMany(tasks);

  console.log('\n--- Seed complete ---');
  console.log(`Users:    1 admin + ${members.length} members (${members.length + 1} total)`);
  console.log(`Projects: ${projects.length}`);
  console.log(`Tasks:    ${tasks.length}`);
  console.log('');
  console.log('Primary logins (all passwords: password123):');
  console.log('  Admin:  admin@example.com');
  console.log('  Member: member@example.com');
  console.log('  More:   member2@example.com … member50@example.com');
  console.log('---------------------\n');

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
