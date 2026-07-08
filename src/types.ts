export enum UserRole {
  SUPER_ADMIN = "Super Admin",
  ADMIN = "Admin",
  ORGANIZATION_OWNER = "Organization Owner",
  PROJECT_MANAGER = "Project Manager",
  TEAM_LEAD = "Team Lead",
  DEVELOPER = "Developer",
  QA_TESTER = "QA Tester",
  UI_DESIGNER = "UI Designer",
  BUSINESS_ANALYST = "Business Analyst",
  CLIENT = "Client",
  VIEWER = "Viewer"
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  organizationId: string | null;
  departmentId: string | null;
  teamId: string | null;
  status: "online" | "offline" | "away" | "busy";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  logoUrl: string | null;
  branding: {
    primaryColor: string;
    accentColor: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  headUserId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface Team {
  id: string;
  organizationId: string;
  departmentId: string;
  name: string;
  description: string;
  teamLeadId: string; // User ID
  memberIds: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export enum ProjectStatus {
  PLANNING = "Planning",
  ACTIVE = "Active",
  ON_HOLD = "On Hold",
  ARCHIVED = "Archived",
  COMPLETED = "Completed"
}

export enum ProjectPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  projectManagerId: string; // User ID
  teamIds: string[];
  memberIds: string[];
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "completed";
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export enum TaskStatus {
  BACKLOG = "Backlog",
  TODO = "To Do",
  IN_PROGRESS = "In Progress",
  IN_REVIEW = "In Review",
  DONE = "Done"
}

export enum TaskPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  URGENT = "Urgent"
}

export interface Task {
  id: string;
  projectId: string;
  sprintId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[]; // Multiple Assignees
  estimatedHours: number;
  actualHours: number;
  startDate: string | null;
  dueDate: string | null;
  labels: string[];
  dependencies: string[]; // Task IDs that this task depends on
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  attachments: string[]; // Attachment URLs
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface Attachment {
  id: string;
  taskId: string | null;
  projectId: string | null;
  name: string;
  url: string;
  size: number; // in bytes
  type: string; // mime-type
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "task_assigned" | "task_completed" | "project_updated" | "comment_added" | "deadline_reminder" | "meeting_reminder" | "admin_broadcast";
  referenceId: string; // Task ID or Project ID
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface ChatMessage {
  id: string;
  channelId: string; // Project ID, Task ID, or "global"
  userId: string;
  content: string;
  replyToId: string | null;
  reactions: { [emoji: string]: string[] }; // emoji -> list of userIds
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface CalendarEvent {
  id: string;
  projectId: string | null;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: "task_deadline" | "meeting" | "sprint" | "milestone";
  attendeeIds: string[];
  location: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string; // "login", "logout", "task_update", "project_delete", etc.
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface TimeTrackingEntry {
  id: string;
  taskId: string;
  userId: string;
  hours: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><circle cx='50' cy='50' r='50' fill='%23cbd5e1'/><circle cx='50' cy='40' r='20' fill='%2364748b'/><path d='M20 85c0-15 15-25 30-25s30 10 30 25' stroke='%2364748b' stroke-width='8' stroke-linecap='round'/></svg>";

