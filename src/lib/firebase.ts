import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  writeBatch, 
  query, 
  limit 
} from "firebase/firestore";
import { UserRole, DEFAULT_AVATAR } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyBVR9rNCA7CT5jiRadMjenz0SpKG2plJYM",
  authDomain: "golden-host-53bk6.firebaseapp.com",
  projectId: "golden-host-53bk6",
  storageBucket: "golden-host-53bk6.firebasestorage.app",
  messagingSenderId: "859042391799",
  appId: "1:859042391799:web:fc0a7e9cede335dc9215f2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-0e02b94b-479e-4ce1-bcc0-41ad8f49fe91");

export async function seedDatabaseIfEmpty() {
  try {
    const usersRef = collection(db, "users");
    const testQuery = query(usersRef, limit(1));
    const querySnapshot = await getDocs(testQuery);
    
    if (!querySnapshot.empty) {
      return;
    }

    const batch = writeBatch(db);

    const orgId = "org-initech";
    const organization = {
      id: orgId,
      name: "Initech Enterprise Solutions",
      domain: "initech.com",
      logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&h=150&fit=crop",
      branding: {
        primaryColor: "#0f172a",
        accentColor: "#3b82f6"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      createdBy: "system",
      updatedBy: null
    };
    batch.set(doc(db, "organizations", orgId), organization);

    const dept1 = "dept-engineering";
    const dept2 = "dept-qa";
    const dept3 = "dept-design";
    
    const departments = [
      {
        id: dept1,
        organizationId: orgId,
        name: "Software Engineering",
        code: "SWE",
        headUserId: "user-team-lead",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: dept2,
        organizationId: orgId,
        name: "Quality Assurance",
        code: "QA",
        headUserId: "user-qa",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: dept3,
        organizationId: orgId,
        name: "UX/UI Design",
        code: "DSN",
        headUserId: "user-designer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      }
    ];

    departments.forEach(dept => {
      batch.set(doc(db, "departments", dept.id), dept);
    });

    const users = [
      {
        id: "user-super-admin",
        email: "superadmin@initech.com",
        displayName: "Rahul Sharma",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.SUPER_ADMIN,
        organizationId: orgId,
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
        id: "user-admin",
        email: "admin@initech.com",
        displayName: "Amit Patel",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.ADMIN,
        organizationId: orgId,
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
        id: "user-org-owner",
        email: "owner@initech.com",
        displayName: "Yasen Khan",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.ORGANIZATION_OWNER,
        organizationId: orgId,
        departmentId: null,
        teamId: null,
        status: "away",
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
        organizationId: orgId,
        departmentId: dept1,
        teamId: null,
        status: "online",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: "user-team-lead",
        email: "lead@initech.com",
        displayName: "Priya Patel",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.TEAM_LEAD,
        organizationId: orgId,
        departmentId: dept1,
        teamId: "team-omega",
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
        organizationId: orgId,
        departmentId: dept1,
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
        organizationId: orgId,
        departmentId: dept2,
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
        organizationId: orgId,
        departmentId: dept3,
        teamId: "team-design",
        status: "offline",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: "user-ba",
        email: "ba@initech.com",
        displayName: "Sanjay Mehta",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.BUSINESS_ANALYST,
        organizationId: orgId,
        departmentId: dept1,
        teamId: null,
        status: "away",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: "user-client",
        email: "client@dundermifflin.com",
        displayName: "Arjun Nair",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.CLIENT,
        organizationId: orgId,
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
        id: "user-viewer",
        email: "viewer@initech.com",
        displayName: "Harish Rao",
        photoURL: DEFAULT_AVATAR,
        role: UserRole.VIEWER,
        organizationId: orgId,
        departmentId: null,
        teamId: null,
        status: "offline",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      }
    ];

    users.forEach(user => {
      batch.set(doc(db, "users", user.id), user);
    });

    const teams = [
      {
        id: "team-omega",
        organizationId: orgId,
        departmentId: dept1,
        name: "Omega Engineering Squad",
        description: "Core backend architectures, performance tuning, and main APIs.",
        teamLeadId: "user-team-lead",
        memberIds: ["user-team-lead", "user-developer"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: "team-design",
        organizationId: orgId,
        departmentId: dept3,
        name: "Creative Design Squad",
        description: "Focuses on user journey, wireframing, high fidelity mockups, and client experiences.",
        teamLeadId: "user-designer",
        memberIds: ["user-designer"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      },
      {
        id: "team-qa",
        organizationId: orgId,
        departmentId: dept2,
        name: "QA Avengers",
        description: "System tests, security checking, and end-to-end regression validation.",
        teamLeadId: "user-qa",
        memberIds: ["user-qa"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "system",
        updatedBy: null
      }
    ];

    teams.forEach(team => {
      batch.set(doc(db, "teams", team.id), team);
    });

    const projects = [
      {
        id: "proj-phoenix",
        organizationId: orgId,
        name: "Project Phoenix: Enterprise Core Upgrade",
        description: "High-performance upgrade of the core transaction ledger and database orchestration layers to ensure sub-millisecond response latency.",
        status: "Active",
        priority: "Critical",
        projectManagerId: "user-pm",
        teamIds: ["team-omega", "team-qa"],
        memberIds: ["user-pm", "user-team-lead", "user-developer", "user-qa"],
        budget: 500000,
        spent: 120000,
        startDate: "2026-06-01",
        endDate: "2026-12-31",
        milestones: [
          { id: "m1", title: "API Spec Approved", description: "All endpoints detailed and documented", dueDate: "2026-07-15", status: "completed" },
          { id: "m2", title: "Database Migration", description: "Migrate ledger records to Firestore", dueDate: "2026-09-01", status: "pending" },
          { id: "m3", title: "QA Testing Phase 1", description: "Validation of transactional integrity", dueDate: "2026-11-15", status: "pending" }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      },
      {
        id: "proj-horizon",
        organizationId: orgId,
        name: "Project Horizon: Cloud Customer Portal",
        description: "Build an interactive customer portal allowing clients to track invoices, task progressions, and chat directly with managers.",
        status: "Planning",
        priority: "High",
        projectManagerId: "user-pm",
        teamIds: ["team-design", "team-omega"],
        memberIds: ["user-pm", "user-designer", "user-developer", "user-client"],
        budget: 180000,
        spent: 15000,
        startDate: "2026-07-01",
        endDate: "2026-10-31",
        milestones: [
          { id: "mh1", title: "Interactive Prototypes", description: "User flows validated by clients", dueDate: "2026-07-25", status: "pending" },
          { id: "mh2", title: "Beta Launch", description: "Deploy draft app to Cloud Run", dueDate: "2026-09-15", status: "pending" }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      }
    ];

    projects.forEach(project => {
      batch.set(doc(db, "projects", project.id), project);
    });

    const sprints = [
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
      },
      {
        id: "sprint-13",
        projectId: "proj-phoenix",
        name: "Sprint 13: Dashboard Analytics",
        goal: "Provide managers with real-time graphs displaying project expenses and velocity charts.",
        startDate: "2026-07-15",
        endDate: "2026-07-28",
        status: "upcoming",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      }
    ];

    sprints.forEach(sprint => {
      batch.set(doc(db, "sprints", sprint.id), sprint);
    });

    const tasks = [
      {
        id: "task-1",
        projectId: "proj-phoenix",
        sprintId: "sprint-12",
        title: "Optimize Firestore transaction write operations",
        description: "Refactor ledger write operations to batch requests and implement concurrent updates for transaction indexes to prevent locking.",
        status: "In Progress",
        priority: "Urgent",
        assigneeIds: ["user-developer", "user-team-lead"],
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
        status: "To Do",
        priority: "High",
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
        id: "task-3",
        projectId: "proj-phoenix",
        sprintId: "sprint-12",
        title: "Create Swagger spec & Redoc portal",
        description: "Document all endpoints detailed in the system blueprint. Host on standard API routing specs.",
        status: "Done",
        priority: "Medium",
        assigneeIds: ["user-developer"],
        estimatedHours: 12,
        actualHours: 14,
        startDate: "2026-06-25",
        dueDate: "2026-07-03",
        labels: ["Documentation", "API"],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      },
      {
        id: "task-4",
        projectId: "proj-phoenix",
        sprintId: "sprint-12",
        title: "Audit database security rules",
        description: "Strictly verify that organization and tenant isolations are bulletproof, preventing external users from querying unauthorized documents.",
        status: "In Review",
        priority: "High",
        assigneeIds: ["user-team-lead"],
        estimatedHours: 8,
        actualHours: 7,
        startDate: "2026-07-05",
        dueDate: "2026-07-10",
        labels: ["Security"],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-super-admin",
        updatedBy: null
      },
      {
        id: "task-5",
        projectId: "proj-horizon",
        sprintId: null,
        title: "Create wireframes and interactive user journey in Figma",
        description: "Generate screens for customer dashboard layout, invoice page and notification tray. Keep layouts clean with slate colors.",
        status: "In Progress",
        priority: "High",
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
      },
      {
        id: "task-6",
        projectId: "proj-horizon",
        sprintId: null,
        title: "Draft database model for Client Invoice links",
        description: "Specify table parameters and links to track payments, status alerts, and historical logs.",
        status: "To Do",
        priority: "Medium",
        assigneeIds: ["user-ba", "user-developer"],
        estimatedHours: 10,
        actualHours: 0,
        startDate: "2026-07-06",
        dueDate: "2026-07-18",
        labels: ["Architecture", "Database"],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      }
    ];

    tasks.forEach(task => {
      batch.set(doc(db, "tasks", task.id), task);
    });

    const subtasks = [
      { id: "sub-1", taskId: "task-1", title: "Write transaction logic test scripts", isCompleted: true },
      { id: "sub-2", taskId: "task-1", title: "Benchmark performance difference with batching", isCompleted: false },
      { id: "sub-3", taskId: "task-5", title: "Map user profile screen wires", isCompleted: true },
      { id: "sub-4", taskId: "task-5", title: "Review typography scale with Priya", isCompleted: false }
    ];
    subtasks.forEach(sub => {
      batch.set(doc(db, "subtasks", sub.id), {
        ...sub,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-team-lead",
        updatedBy: null
      });
    });

    const comments: any[] = [];
    comments.forEach(comm => {
      batch.set(doc(db, "taskComments", comm.id), comm);
    });

    const messages = [
      {
        id: "msg-1",
        channelId: "proj-phoenix",
        userId: "user-pm",
        content: "Hi team, we need to finalize Sprint 12 milestones this Friday. Please double check your task timelines.",
        replyToId: null,
        reactions: { "👍": ["user-team-lead", "user-developer"] },
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      },
      {
        id: "msg-2",
        channelId: "proj-phoenix",
        userId: "user-team-lead",
        content: "Sure Vijay, task-1 is well underway. Vikram is actively batching our database rules now.",
        replyToId: null,
        reactions: { "🚀": ["user-developer"] },
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        deletedAt: null,
        createdBy: "user-team-lead",
        updatedBy: null
      },
      {
        id: "msg-3",
        channelId: "proj-phoenix",
        userId: "user-developer",
        content: "I will crush these transaction rules. Expecting complete rule deployment within an hour.",
        replyToId: null,
        reactions: { "💪": ["user-team-lead"] },
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        deletedAt: null,
        createdBy: "user-developer",
        updatedBy: null
      }
    ];
    messages.forEach(msg => {
      batch.set(doc(db, "messages", msg.id), msg);
    });

    const events = [
      {
        id: "evt-1",
        projectId: "proj-phoenix",
        title: "Sprint 12 Standup Meeting",
        description: "Check task progress, discuss blocks, review database latencies.",
        startDate: new Date().toISOString().split("T")[0] + "T09:30:00",
        endDate: new Date().toISOString().split("T")[0] + "T10:00:00",
        type: "meeting",
        attendeeIds: ["user-pm", "user-team-lead", "user-developer", "user-qa"],
        location: "Virtual - Zoom Meeting ID: 418-292-221",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      },
      {
        id: "evt-2",
        projectId: "proj-horizon",
        title: "Horizon Client Review Sync",
        description: "Walk Arjun Nair through the interactive portal layout drafts.",
        startDate: new Date().toISOString().split("T")[0] + "T14:00:00",
        endDate: new Date().toISOString().split("T")[0] + "T15:00:00",
        type: "meeting",
        attendeeIds: ["user-pm", "user-designer", "user-client"],
        location: "Virtual - Teams Meeting Room",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: "user-pm",
        updatedBy: null
      }
    ];
    events.forEach(evt => {
      batch.set(doc(db, "calendarEvents", evt.id), evt);
    });

    const logs = [
      { id: "log-1", userId: "user-super-admin", action: "database_seed", details: "Bootstrapped initial enterprise catalog and user tables.", ipAddress: "192.168.1.1", userAgent: "Chrome 124.0.0", createdAt: new Date(Date.now() - 3600000 * 10).toISOString() },
      { id: "log-2", userId: "user-pm", action: "project_create", details: "Created Project Phoenix and configured base sprints.", ipAddress: "192.168.1.4", userAgent: "Firefox Developer Edition", createdAt: new Date(Date.now() - 3600000 * 9).toISOString() }
    ];
    logs.forEach(lg => {
      batch.set(doc(db, "auditLogs", lg.id), lg);
    });

    const times = [
      { id: "time-1", taskId: "task-1", userId: "user-developer", hours: 5, description: "Debugged indexing delays and structured concurrently nested rule filters", date: "2026-07-06" },
      { id: "time-2", taskId: "task-1", userId: "user-team-lead", hours: 4, description: "Reviewed database design pattern and verified rule safety parameters", date: "2026-07-06" }
    ];
    times.forEach(tm => {
      batch.set(doc(db, "timeTracking", tm.id), {
        ...tm,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: tm.userId,
        updatedBy: null
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
