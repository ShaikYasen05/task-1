import React, { useState } from "react";
import { 
  Project, 
  Task, 
  Sprint, 
  UserProfile, 
  Notification, 
  TaskStatus, 
  TaskPriority 
} from "../types";
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Bot, 
  Sparkles,
  ArrowRight,
  UserCheck
} from "lucide-react";

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  sprints: Sprint[];
  users: UserProfile[];
  currentUser: UserProfile;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  setActiveTab: (tab: string) => void;
  setSelectedProjectId: (id: string | null) => void;
}

export default function DashboardView({
  projects,
  tasks,
  sprints,
  users,
  currentUser,
  notifications,
  onMarkNotificationRead,
  onAddTask,
  setActiveTab,
  setSelectedProjectId
}: DashboardViewProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const activeProjects = projects.filter(p => p.status === "Active");
  const myTasks = tasks.filter(t => t.assigneeIds.includes(currentUser.id) && t.status !== TaskStatus.DONE);
  const urgentTasks = tasks.filter(t => t.priority === TaskPriority.URGENT && t.status !== TaskStatus.DONE);
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0);

  const activeSprint = sprints.find(s => s.status === "active");
  const sprintTasks = activeSprint ? tasks.filter(t => t.sprintId === activeSprint.id) : [];
  const completedSprintTasks = sprintTasks.filter(t => t.status === TaskStatus.DONE);
  const sprintProgress = sprintTasks.length > 0 
    ? Math.round((completedSprintTasks.length / sprintTasks.length) * 100) 
    : 0;

  const runWorkloadAnalysis = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch("/api/ai/workload-distribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users, tasks })
      });
      const data = await response.json();
      setAiAnalysis(data.analysis || "No analysis provided.");
    } catch (e) {
      console.error(e);
      setAiAnalysis("Failed to compile workload distribution reports from the AI Service.");
    } finally {
      setLoadingAi(false);
    }
  };

  const renderAiAnalysis = (text: string) => {
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-semibold text-slate-800 mt-3 mb-1 font-sans">{line.replace("###", "").trim()}</h4>;
      }
      if (line.startsWith("-") || line.startsWith("*")) {
        return (
          <li key={idx} className="text-xs text-slate-600 ml-4 list-disc py-0.5 leading-relaxed">
            {line.substring(1).trim().replace(/\*\*(.*?)\*\*/g, "$1")}
          </li>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <li key={idx} className="text-xs text-slate-600 ml-4 list-decimal py-0.5 leading-relaxed">
            {line.replace(/^\d+\./, "").trim().replace(/\*\*(.*?)\*\*/g, "$1")}
          </li>
        );
      }
      if (line.trim() === "") return null;
      return <p key={idx} className="text-xs text-slate-600 py-1 leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
    });
  };

  return (
    <div id="dashboard-view-root" className="space-y-4">
      <div id="dashboard-welcome-banner" className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 rounded border border-slate-200 shadow-xs gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 font-sans tracking-tight">
            Welcome back, {currentUser.displayName}
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            You are viewing Initech Solutions as an active <span className="font-semibold text-blue-600">{currentUser.role}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium font-mono bg-blue-50 text-blue-700 border border-blue-100">
            STABLE ENGINE
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium font-mono bg-emerald-50 text-emerald-700 border border-emerald-100">
            FIRESTORE ONLINE
          </span>
        </div>
      </div>

      <div id="dashboard-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">My Action Items</span>
            <h3 className="text-lg font-bold text-slate-950 mt-0.5 font-sans">{myTasks.length}</h3>
            <span className="text-[10px] text-slate-500 font-sans">Incomplete tasks</span>
          </div>
          <div className="p-2 bg-blue-50 rounded text-blue-600">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Urgent Blocks</span>
            <h3 className="text-lg font-bold text-rose-600 mt-0.5 font-sans">{urgentTasks.length}</h3>
            <span className="text-[10px] text-slate-500 font-sans">Needs prompt action</span>
          </div>
          <div className="p-2 bg-rose-50 rounded text-rose-600 animate-pulse">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Active Sprints</span>
            <h3 className="text-lg font-bold text-slate-950 mt-0.5 font-sans">
              {activeSprint ? "1 Active" : "0 Active"}
            </h3>
            <span className="text-[10px] text-slate-500 font-sans">
              {activeSprint ? `${sprintProgress}% complete` : "No active sprint"}
            </span>
          </div>
          <div className="p-2 bg-amber-50 rounded text-amber-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total SaaS Budget</span>
            <h3 className="text-lg font-bold text-slate-950 mt-0.5 font-sans">
              ${(totalBudget / 1000).toFixed(0)}k
            </h3>
            <span className="text-[10px] text-emerald-600 font-sans">
              ${((totalBudget - totalSpent) / 1000).toFixed(0)}k remaining
            </span>
          </div>
          <div className="p-2 bg-emerald-50 rounded text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div id="dashboard-main-content" className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        <div className="lg:col-span-2 space-y-3">
          
          {activeSprint ? (
            <div id="active-sprint-overview" className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    Active Sprint
                  </span>
                  <h3 className="text-sm font-semibold text-slate-950 mt-1 font-sans">
                    {activeSprint.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sprint Goal: {activeSprint.goal}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-500">
                    {activeSprint.startDate} to {activeSprint.endDate}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1.5 mt-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Task Velocity ({completedSprintTasks.length} of {sprintTasks.length} resolved)</span>
                  <span className="font-semibold">{sprintProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${sprintProgress}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs text-center py-6">
              <span className="text-xs text-slate-400 block font-mono">No Active Sprints Currently</span>
              <button 
                onClick={() => setActiveTab("projects")}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
              >
                Go to Projects & Sprints <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div id="my-tasks-panel" className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-sans">
                <UserCheck className="w-4 h-4 text-blue-600" /> My Action Items ({myTasks.length})
              </h3>
              <button 
                onClick={() => setActiveTab("kanban")}
                className="text-xs text-blue-600 hover:text-blue-800 font-sans font-medium"
              >
                View Kanban Board
              </button>
            </div>
            
            <div className="divide-y divide-slate-150">
              {myTasks.length > 0 ? (
                myTasks.map((task) => {
                  const proj = projects.find(p => p.id === task.projectId);
                  return (
                    <div key={task.id} className="p-2.5 hover:bg-slate-50/50 flex justify-between items-center gap-3 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {proj ? proj.name.split(":")[0] : "Project"}
                          </span>
                          <span className={`text-[10px] font-sans font-medium px-1.5 rounded ${
                            task.priority === TaskPriority.URGENT ? "bg-rose-50 text-rose-700 border border-rose-100" :
                            task.priority === TaskPriority.HIGH ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> Due {task.dueDate}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-medium text-slate-900 mt-1 truncate">
                          {task.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  🎉 Good job! You have no pending tasks assigned to you.
                </div>
              )}
            </div>
          </div>

          <div id="milestones-timeline-panel" className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 font-sans">
              Upcoming Project Milestones
            </h3>
            <div className="space-y-3">
              {projects.flatMap(p => p.milestones.map(m => ({ ...m, projectName: p.name }))).slice(0, 4).map((m, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="mt-1">
                    <span className={`w-2 h-2 rounded-full block ${m.status === "completed" ? "bg-emerald-500" : "bg-slate-300"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-medium text-slate-900 truncate">
                        {m.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">{m.dueDate}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{m.projectName} — {m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="space-y-3">
          
          <div id="ai-delivery-assistant" className="bg-slate-900 text-slate-100 p-3 rounded border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
                  AI Workload Analyzer
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                <Sparkles className="w-2.5 h-2.5" /> GEMINI 2.5
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Let Gemini analyze organizational task queues, detect developer bottlenecks, and suggest workload adjustments.
            </p>

            <button
              onClick={runWorkloadAnalysis}
              disabled={loadingAi}
              className="w-full mt-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-850 text-white rounded text-xs font-sans font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              {loadingAi ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" /> Compiling telemetry...
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" /> Analyze Capacity
                </>
              )}
            </button>

            {aiAnalysis && (
              <div id="ai-analysis-output" className="mt-3 p-2 bg-slate-950 rounded border border-slate-850 overflow-y-auto max-h-60 space-y-1 scrollbar-thin">
                {renderAiAnalysis(aiAnalysis)}
              </div>
            )}
          </div>

          <div id="dashboard-notifications" className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
                Notifications ({notifications.filter(n => !n.isRead).length})
              </h3>
            </div>
            <div className="divide-y divide-slate-150 max-h-72 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-2.5 hover:bg-slate-50 transition-colors flex items-start gap-2 ${
                      !n.isRead ? "bg-blue-50/20" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full block ${!n.isRead ? "bg-blue-600 animate-pulse" : "bg-transparent"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-[11px] font-medium text-slate-900 truncate">{n.title}</h4>
                        <span className="text-[9px] font-mono text-slate-400 shrink-0">
                          {n.createdAt.split("T")[0]}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                        {n.message}
                      </p>
                      {!n.isRead && (
                        <button
                          onClick={() => onMarkNotificationRead(n.id)}
                          className="text-[9px] text-blue-600 hover:text-blue-800 font-sans font-medium mt-1 inline-block"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Inbox clean. No unread alerts.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
