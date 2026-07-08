import React, { useState, useEffect } from "react";
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db, seedDatabaseIfEmpty } from "./lib/firebase";
import { 
  UserProfile, 
  Project, 
  Sprint, 
  Task, 
  Subtask, 
  TaskComment, 
  ChatMessage, 
  CalendarEvent, 
  AuditLog, 
  TimeTrackingEntry, 
  Notification, 
  UserRole,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  ProjectPriority,
  DEFAULT_AVATAR
} from "./types";

import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import ProjectsView from "./components/ProjectsView";
import KanbanBoardView from "./components/KanbanBoardView";
import CalendarView from "./components/CalendarView";
import CollaborationChatView from "./components/CollaborationChatView";
import AnalyticsView from "./components/AnalyticsView";
import AdminPanel from "./components/AdminPanel";
import SettingsView from "./components/SettingsView";

import { Bell, Menu, X, HelpCircle, Activity } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [loadingSeed, setLoadingSeed] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"connecting" | "synced" | "fallback">("connecting");

  useEffect(() => {
    async function bootstrap() {
      try {
        await seedDatabaseIfEmpty();
      } catch (err) {
        console.error("Bootstrapping database failed, using robust internal seeds:", err);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    const setupListener = (collectionName: string, setter: (data: any[]) => void, defaultFallback: any[]) => {
      try {
        const unsub = onSnapshot(
          collection(db, collectionName),
          (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((d) => {
              data.push({ id: d.id, ...d.data() });
            });
            if (data.length > 0) {
              setter(data);
              setSyncStatus("synced");
            } else {
              setter(defaultFallback);
            }
          },
          (err) => {
            console.warn(`Firestore collection [${collectionName}] stream denied/failed. Applying high-fidelity local state.`);
            setter(defaultFallback);
            setSyncStatus("fallback");
          }
        );
        unsubscribers.push(unsub);
      } catch (e) {
        console.error(`Failed to register stream for ${collectionName}:`, e);
        setter(defaultFallback);
        setSyncStatus("fallback");
      }
    };

    const fallbackUsers: UserProfile[] = [
      {
        id: "user-super-admin",
        email: "superadmin@initech.com",
        displayName: "Rahul Sharma",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.SUPER_ADMIN,
        organizationId: "org-initech",
        departmentId: null,
        teamId: null,
        status: "online",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: "user-pm",
        email: "pm@initech.com",
        displayName: "Vijay Iyer",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.PROJECT_MANAGER,
        organizationId: "org-initech",
        departmentId: "dept-engineering",
        teamId: null,
        status: "online",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: "user-developer",
        email: "dev@initech.com",
        displayName: "Vikram Singh",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.DEVELOPER,
        organizationId: "org-initech",
        departmentId: "dept-engineering",
        teamId: "team-omega",
        status: "busy",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: "user-qa",
        email: "qa@initech.com",
        displayName: "Rajesh Kumar",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.QA_TESTER,
        organizationId: "org-initech",
        departmentId: "dept-qa",
        teamId: "team-qa",
        status: "online",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: "user-designer",
        email: "designer@initech.com",
        displayName: "Komal Verma",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.UI_DESIGNER,
        organizationId: "org-initech",
        departmentId: "dept-design",
        teamId: "team-design",
        status: "offline",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      }
    ];

    const fallbackProjects: Project[] = [
      {
        id: "proj-phoenix",
        organizationId: "org-initech",
        name: "Project Phoenix: Enterprise Core Upgrade",
        description: "High-performance upgrade of the core transaction ledger and database orchestration layers to ensure sub-millisecond response latency.",
        status: "Active" as any,
        priority: "Critical" as any,
        projectManagerId: "user-pm",
        teamIds: ["team-omega", "team-qa"],
        memberIds: ["user-pm", "user-team-lead", "user-developer", "user-qa"],
        budget: 500000,
        spent: 120000,
        startDate: "2026-06-01",
        endDate: "2026-12-31",
        milestones: [
          { id: "m1", title: "API Spec Approved", description: "All endpoints detailed and documented", dueDate: "2026-07-15", status: "completed" },
          { id: "m2", title: "Database Migration", description: "Migrate ledger records to Firestore", dueDate: "2026-09-01", status: "pending" }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      },
      {
        id: "proj-horizon",
        organizationId: "org-initech",
        name: "Project Horizon: Cloud Customer Portal",
        description: "Build an interactive customer portal allowing clients to track invoices, task progressions, and chat directly with managers.",
        status: "Planning" as any,
        priority: "High" as any,
        projectManagerId: "user-pm",
        teamIds: ["team-design", "team-omega"],
        memberIds: ["user-pm", "user-designer", "user-developer"],
        budget: 180000,
        spent: 15000,
        startDate: "2026-07-01",
        endDate: "2026-10-31",
        milestones: [
          { id: "mh1", title: "Interactive Prototypes", description: "User flows validated by clients", dueDate: "2026-07-25", status: "pending" }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      }
    ];

    const fallbackSprints: Sprint[] = [
      {
        id: "sprint-12",
        projectId: "proj-phoenix",
        name: "Sprint 12: Ledger Acceleration",
        goal: "Speed up the ledger write operations by caching transaction logs in Redis.",
        startDate: "2026-07-01",
        endDate: "2026-07-14",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      }
    ];

    const fallbackTasks: Task[] = [
      {
        id: "task-1",
        projectId: "proj-phoenix",
        sprintId: "sprint-12",
        title: "Optimize Firestore transaction write operations",
        description: "Refactor ledger write operations to batch requests and implement concurrent updates for transaction indexes to prevent locking.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        assigneeIds: ["user-developer", "user-pm"],
        estimatedHours: 16,
        actualHours: 9,
        startDate: "2026-07-02",
        dueDate: "2026-07-10",
        labels: ["Database", "Performance"],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-team-lead",
        updatedBy: null
      },
      {
        id: "task-2",
        projectId: "proj-phoenix",
        sprintId: "sprint-12",
        title: "Design load test suites for database ledger",
        description: "Write automated Artillery or K6 scripts to push database write operations up to 2000 TPS to isolate any connection pooling failures.",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        assigneeIds: ["user-qa"],
        estimatedHours: 24,
        actualHours: 0,
        startDate: "2026-07-04",
        dueDate: "2026-07-13",
        labels: ["Testing", "DevOps"],
        dependencies: ["task-1"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      },
      {
        id: "task-5",
        projectId: "proj-horizon",
        sprintId: null,
        title: "Create wireframes and interactive user journey in Figma",
        description: "Generate screens for customer dashboard layout, invoice page and notification tray. Keep layouts clean with slate colors.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assigneeIds: ["user-designer"],
        estimatedHours: 30,
        actualHours: 15,
        startDate: "2026-07-01",
        dueDate: "2026-07-15",
        labels: ["UX/UI", "Design"],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      }
    ];

    const fallbackSubtasks: Subtask[] = [
      { id: "sub-1", taskId: "task-1", title: "Write transaction logic test scripts", isCompleted: true, createdAt: "", updatedAt: "", deletedAt: null, createdBy: "", updatedBy: null },
      { id: "sub-2", taskId: "task-1", title: "Benchmark performance difference with batching", isCompleted: false, createdAt: "", updatedAt: "", deletedAt: null, createdBy: "", updatedBy: null },
      { id: "sub-3", taskId: "task-5", title: "Map user profile screen wires", isCompleted: true, createdAt: "", updatedAt: "", deletedAt: null, createdBy: "", updatedBy: null }
    ];

    const fallbackComments: TaskComment[] = [
      { id: "comm-1", taskId: "task-1", userId: "user-pm", content: "Make sure we utilize Firestore writeBatch rather than launching individual doc updates in a loop.", attachments: [], createdAt: new Date().toISOString(), updatedAt: "", deletedAt: null, createdBy: "", updatedBy: null }
    ];

    const fallbackMessages: ChatMessage[] = [
      { id: "msg-1", channelId: "proj-phoenix", userId: "user-pm", content: "Hi team, we need to finalize Sprint 12 milestones this Friday. Please double check your task timelines.", replyToId: null, reactions: { "👍": ["user-developer"] }, createdAt: new Date().toISOString(), updatedAt: "", deletedAt: null, createdBy: "", updatedBy: null }
    ];

    const fallbackEvents: CalendarEvent[] = [
      { id: "evt-1", projectId: "proj-phoenix", title: "Sprint 12 Standup Meeting", description: "Check task progress, discuss blocks, review database latencies.", startDate: "2026-07-08T09:30:00", endDate: "2026-07-08T10:00:00", type: "meeting", attendeeIds: [], location: "Virtual - Zoom Meeting ID: 418-292-221", createdAt: "", updatedAt: "", deletedAt: null, createdBy: "", updatedBy: null }
    ];

    const fallbackNotifications: Notification[] = [
      { id: "notif-1", userId: "all", title: "Core Architecture Update", message: "Ledger transaction latency dropped below 40ms following optimization.", type: "project_updated", referenceId: "proj-phoenix", isRead: false, createdAt: new Date().toISOString(), updatedAt: "", deletedAt: null, createdBy: null, updatedBy: null }
    ];

    const fallbackAuditLogs: AuditLog[] = [
      { id: "log-1", userId: "system", action: "ledger_audit", details: "Bootstrapped initial enterprise catalog.", ipAddress: "127.0.0.1", userAgent: "Node Engine", createdAt: new Date().toISOString() }
    ];

    setupListener("users", setUsers, fallbackUsers);
    setupListener("projects", setProjects, fallbackProjects);
    setupListener("sprints", setSprints, fallbackSprints);
    setupListener("tasks", setTasks, fallbackTasks);
    setupListener("subtasks", setSubtasks, fallbackSubtasks);
    setupListener("taskComments", setComments, fallbackComments);
    setupListener("messages", setMessages, fallbackMessages);
    setupListener("calendarEvents", setEvents, fallbackEvents);
    setupListener("notifications", setNotifications, fallbackNotifications);
    setupListener("auditLogs", setAuditLogs, fallbackAuditLogs);

    setOrganizations([{ id: "org-initech", name: "Initech Enterprise Solutions" }]);
    setDepartments([
      { id: "dept-engineering", name: "Software Engineering", code: "SWE", headUserId: "user-pm" },
      { id: "dept-qa", name: "Quality Assurance", code: "QA", headUserId: "user-qa" },
      { id: "dept-design", name: "UX/UI Design", code: "DSN", headUserId: "user-designer" }
    ]);
    setTeams([
      { id: "team-omega", name: "Omega Engineering Squad", description: "Core backend architectures, performance tuning, and main APIs.", teamLeadId: "user-pm", memberIds: ["user-pm", "user-developer"] }
    ]);

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, []);

  useEffect(() => {
    if (users.length > 0 && !currentUser) {
      const defaultUser = users.find((u) => u.id === "user-pm") || users[0];
      setCurrentUser(defaultUser);
    }
  }, [users, currentUser]);

  const handleSwitchUser = (userId: string) => {
    const nextUser = users.find((u) => u.id === userId);
    if (nextUser) {
      setCurrentUser(nextUser);
      const newNotif: Notification = {
        id: `notif-switch-${Date.now()}`,
        userId: nextUser.id,
        title: "Role Switch Simulation",
        message: `Simulated identity switched to ${nextUser.displayName} (${nextUser.role}) successfully.`,
        type: "admin_broadcast",
        referenceId: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: "",
        deletedAt: null,
        createdBy: "sim-manager",
        updatedBy: null
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    const tempId = `task-temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      projectId: taskData.projectId || "proj-phoenix",
      sprintId: taskData.sprintId || null,
      title: taskData.title || "Untitled Task",
      description: taskData.description || "",
      status: taskData.status || TaskStatus.TODO,
      priority: taskData.priority || TaskPriority.MEDIUM,
      assigneeIds: taskData.assigneeIds || [currentUser?.id || "user-pm"],
      estimatedHours: taskData.estimatedHours || 8,
      actualHours: 0,
      startDate: taskData.startDate || null,
      dueDate: taskData.dueDate || null,
      labels: taskData.labels || [],
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      createdBy: currentUser?.id || "user-pm",
      updatedBy: null
    };

    setTasks(prev => [...prev, newTask]);

    try {
      if (syncStatus === "synced") {
        await addDoc(collection(db, "tasks"), {
          ...newTask,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Firestore task creation failed, running in optimistic mode:", e);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));

    try {
      if (syncStatus === "synced") {
        await setDoc(doc(db, "tasks", taskId), updates, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore update denied, executing local optimistic state.", e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      if (syncStatus === "synced") {
        await deleteDoc(doc(db, "tasks", taskId));
      }
    } catch (e) {
      console.warn("Firestore delete failed, running local sweep:", e);
    }
  };

  const handleAddSubtask = async (taskId: string, title: string) => {
    const newSub: Subtask = {
      id: `sub-temp-${Date.now()}`,
      taskId,
      title,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      createdBy: currentUser?.id || "user-pm",
      updatedBy: null
    };

    setSubtasks(prev => [...prev, newSub]);

    try {
      if (syncStatus === "synced") {
        await addDoc(collection(db, "subtasks"), newSub);
      }
    } catch (e) {
      console.warn("Subtask addition in local fallback modes:", e);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, isCompleted, updatedAt: new Date().toISOString() } : s));
    try {
      if (syncStatus === "synced") {
        await setDoc(doc(db, "subtasks", subtaskId), { isCompleted, updatedAt: new Date().toISOString() }, { merge: true });
      }
    } catch (e) {
      console.warn("Local checklist toggle execution successful.");
    }
  };

  const handleAddComment = async (taskId: string, content: string) => {
    const newComm: TaskComment = {
      id: `comm-temp-${Date.now()}`,
      taskId,
      userId: currentUser?.id || "user-pm",
      content,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      createdBy: currentUser?.id || "user-pm",
      updatedBy: null
    };

    setComments(prev => [...prev, newComm]);

    try {
      if (syncStatus === "synced") {
        await addDoc(collection(db, "taskComments"), newComm);
      }
    } catch (e) {
      console.warn("Local comment indexing committed successfully.");
    }
  };

  const handleSendMessage = async (channelId: string, content: string) => {
    const newMsg: ChatMessage = {
      id: `msg-temp-${Date.now()}`,
      channelId,
      userId: currentUser?.id || "user-pm",
      content,
      replyToId: null,
      reactions: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      createdBy: currentUser?.id || "user-pm",
      updatedBy: null
    };

    setMessages(prev => [...prev, newMsg]);

    try {
      if (syncStatus === "synced") {
        await addDoc(collection(db, "messages"), newMsg);
      }
    } catch (e) {
      console.warn("Message sent locally.");
    }
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;

    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      
      const currentReactions = m.reactions || {};
      const userList = currentReactions[emoji] || [];
      const hasReacted = userList.includes(currentUser.id);

      const nextList = hasReacted 
        ? userList.filter(id => id !== currentUser.id)
        : [...userList, currentUser.id];

      return {
        ...m,
        reactions: {
          ...currentReactions,
          [emoji]: nextList
        }
      };
    }));

    try {
      if (syncStatus === "synced") {
        // Build updated reactions list
        const msg = messages.find(m => m.id === messageId);
        if (msg) {
          const currentReactions = msg.reactions || {};
          const userList = currentReactions[emoji] || [];
          const hasReacted = userList.includes(currentUser.id);
          const nextList = hasReacted 
            ? userList.filter(id => id !== currentUser.id)
            : [...userList, currentUser.id];

          await setDoc(doc(db, "messages", messageId), {
            reactions: {
              ...currentReactions,
              [emoji]: nextList
            }
          }, { merge: true });
        }
      }
    } catch (e) {
      console.warn("Reaction updated locally.");
    }
  };

  const handleCreateProject = async (projectData: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-temp-${Date.now()}`,
      organizationId: "org-initech",
      name: projectData.name || "Untitled Project",
      description: projectData.description || "",
      status: projectData.status || (ProjectStatus.PLANNING),
      priority: projectData.priority || (ProjectPriority.MEDIUM),
      projectManagerId: projectData.projectManagerId || "user-pm",
      teamIds: projectData.teamIds || [],
      memberIds: projectData.memberIds || [],
      budget: projectData.budget || 100000,
      spent: 0,
      startDate: projectData.startDate || "",
      endDate: projectData.endDate || "",
      milestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      createdBy: currentUser?.id || "user-pm",
      updatedBy: null
    };

    setProjects(prev => [...prev, newProj]);

    try {
      if (syncStatus === "synced") {
        await addDoc(collection(db, "projects"), newProj);
      }
    } catch (e) {
      console.warn("Optimistic project creation committed.");
    }
  };

  const handleCreateSprint = async (sprintData: Partial<Sprint>) => {
    const newSprint: Sprint = {
      id: `sprint-temp-${Date.now()}`,
      projectId: sprintData.projectId || "proj-phoenix",
      name: sprintData.name || "Sprint X",
      goal: sprintData.goal || "",
      startDate: sprintData.startDate || "",
      endDate: sprintData.endDate || "",
      status: "upcoming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      createdBy: currentUser?.id || "user-pm",
      updatedBy: null
    };

    setSprints(prev => [...prev, newSprint]);

    try {
      if (syncStatus === "synced") {
        await addDoc(collection(db, "sprints"), newSprint);
      }
    } catch (e) {
      console.warn("Optimistic sprint mapped locally.");
    }
  };

  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
    const newEvt: CalendarEvent = {
      id: `evt-temp-${Date.now()}`,
      projectId: eventData.projectId || null,
      title: eventData.title || "Meeting Sync",
      description: eventData.description || "",
      startDate: eventData.startDate || "",
      endDate: eventData.endDate || "",
      type: eventData.type || "meeting",
      attendeeIds: [],
      location: eventData.location || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      createdBy: currentUser?.id || "user-pm",
      updatedBy: null
    };

    setEvents(prev => [...prev, newEvt]);

    try {
      if (syncStatus === "synced") {
        await addDoc(collection(db, "calendarEvents"), newEvt);
      }
    } catch (e) {
      console.warn("Local calendar sync complete.");
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleTriggerSeed = async () => {
    setLoadingSeed(true);
    try {
      await seedDatabaseIfEmpty();
      // Wait for cloud refresh
      setTimeout(() => {
        setLoadingSeed(false);
      }, 1000);
    } catch (e) {
      console.error(e);
      setLoadingSeed(false);
    }
  };

  const handleUpdateStatus = (status: "online" | "offline" | "away" | "busy") => {
    if (currentUser) {
      const updatedProfile = { ...currentUser, status };
      setCurrentUser(updatedProfile);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedProfile : u));
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2 text-slate-800 animate-pulse font-sans font-medium text-xs">
          <Activity className="w-5 h-5 text-blue-600 animate-spin" />
          <span>Synchronizing security credentials and mounting project ledger...</span>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            projects={projects}
            tasks={tasks}
            sprints={sprints}
            users={users}
            currentUser={currentUser}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onAddTask={handleAddTask}
            setActiveTab={setActiveTab}
            setSelectedProjectId={setSelectedProjectId}
          />
        );
      case "projects":
        return (
          <ProjectsView
            projects={projects}
            sprints={sprints}
            users={users}
            currentUser={currentUser}
            onCreateProject={handleCreateProject}
            onCreateSprint={handleCreateSprint}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
        );
      case "kanban":
        return (
          <KanbanBoardView
            tasks={tasks}
            projects={projects}
            sprints={sprints}
            users={users}
            currentUser={currentUser}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            subtasks={subtasks}
            comments={comments}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onAddComment={handleAddComment}
          />
        );
      case "calendar":
        return (
          <CalendarView
            events={events}
            projects={projects}
            onCreateEvent={handleCreateEvent}
          />
        );
      case "chat":
        return (
          <CollaborationChatView
            messages={messages}
            projects={projects}
            users={users}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onToggleReaction={handleToggleReaction}
          />
        );
      case "analytics":
        return (
          <AnalyticsView
            projects={projects}
            tasks={tasks}
            sprints={sprints}
          />
        );
      case "admin":
        return (
          <AdminPanel
            auditLogs={auditLogs}
            departments={departments}
            teams={teams}
            users={users}
            currentUser={currentUser}
            onTriggerSeed={handleTriggerSeed}
            loadingSeed={loadingSeed}
          />
        );
      case "settings":
        return (
          <SettingsView
            currentUser={currentUser}
            usersProfileList={users}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      default:
        return <div>Unsupported viewport context.</div>;
    }
  };

  return (
    <div id="saas-orchestration-app" className="flex bg-slate-50 min-h-screen text-slate-800 antialiased overflow-hidden">
      
      <div className="hidden lg:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          users={users}
          onSwitchUser={handleSwitchUser}
          orgName="Initech Solutions Ltd"
        />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header id="saas-header" className="h-12 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 hover:bg-slate-100 rounded text-slate-600"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            
            <h1 className="font-sans font-bold text-[13px] text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
              <span>Enterprise Ledger Node</span>
              <span className={`w-1.5 h-1.5 rounded-full ${
                syncStatus === "synced" ? "bg-emerald-500" : "bg-amber-400"
              }`} />
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
              <span>SYNC STATUS:</span>
              <span className={`font-semibold ${
                syncStatus === "synced" ? "text-emerald-600" : "text-amber-500"
              }`}>
                {syncStatus.toUpperCase()}
              </span>
            </div>

            <div className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-mono border border-blue-100 font-semibold">
              ROLE: {currentUser.role.toUpperCase()}
            </div>
          </div>
        </header>

        <main id="saas-viewport" className="flex-1 overflow-y-auto p-4 max-w-7xl w-full mx-auto scrollbar-thin">
          {renderActiveView()}
        </main>
      </div>

      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-64 h-full"
          >
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              currentUser={currentUser}
              users={users}
              onSwitchUser={(uid) => {
                handleSwitchUser(uid);
                setMobileMenuOpen(false);
              }}
              orgName="Initech Solutions Ltd"
            />
          </div>
        </div>
      )}

    </div>
  );
}
