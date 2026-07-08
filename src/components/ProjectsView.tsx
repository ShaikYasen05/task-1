import React, { useState } from "react";
import { 
  Project, 
  Sprint, 
  UserProfile, 
  ProjectStatus, 
  ProjectPriority,
  DEFAULT_AVATAR
} from "../types";
import { 
  Folder, 
  Plus, 
  Calendar, 
  DollarSign, 
  User, 
  Layers, 
  Compass, 
  Clock, 
  Bot,
  Sparkles,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface ProjectsViewProps {
  projects: Project[];
  sprints: Sprint[];
  users: UserProfile[];
  currentUser: UserProfile;
  onCreateProject: (project: Partial<Project>) => void;
  onCreateSprint: (sprint: Partial<Sprint>) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

export default function ProjectsView({
  projects,
  sprints,
  users,
  currentUser,
  onCreateProject,
  onCreateSprint,
  selectedProjectId,
  setSelectedProjectId
}: ProjectsViewProps) {
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddSprint, setShowAddSprint] = useState(false);

  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projPriority, setProjPriority] = useState<ProjectPriority>(ProjectPriority.MEDIUM);
  const [projBudget, setProjBudget] = useState(100000);
  const [projManagerId, setProjManagerId] = useState("");
  const [projStart, setProjStart] = useState("2026-07-01");
  const [projEnd, setProjEnd] = useState("2026-12-31");

  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [sprintStart, setSprintStart] = useState("2026-07-01");
  const [sprintEnd, setSprintEnd] = useState("2026-07-14");

  const [predicting, setPredicting] = useState(false);
  const [predictedTimeline, setPredictedTimeline] = useState<{ suggestedDays?: number; riskLevel?: string; mitigation?: string } | null>(null);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    onCreateProject({
      name: projName,
      description: projDesc,
      status: ProjectStatus.PLANNING,
      priority: projPriority,
      projectManagerId: projManagerId || currentUser.id,
      teamIds: ["team-omega"],
      memberIds: [currentUser.id, "user-developer"],
      budget: Number(projBudget),
      spent: 0,
      startDate: projStart,
      endDate: projEnd,
      milestones: []
    });

    setProjName("");
    setProjDesc("");
    setProjPriority(ProjectPriority.MEDIUM);
    setProjBudget(100000);
    setProjManagerId("");
    setShowAddProject(false);
  };

  const handleCreateSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintName.trim() || !selectedProjectId) return;

    onCreateSprint({
      projectId: selectedProjectId,
      name: sprintName,
      goal: sprintGoal,
      startDate: sprintStart,
      endDate: sprintEnd,
      status: "upcoming"
    });

    setSprintName("");
    setSprintGoal("");
    setShowAddSprint(false);
  };

  const predictProjectTimeline = async () => {
    if (!projName.trim()) return;
    setPredicting(true);
    try {
      const response = await fetch("/api/ai/predict-deadline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: projName, 
          description: projDesc, 
          estimatedHours: 120 
        })
      });
      const data = await response.json();
      setPredictedTimeline(data);
    } catch (e) {
      console.error(e);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div id="projects-view-root" className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      
      <div className="xl:col-span-2 space-y-3">
        <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-600" /> Active Enterprise Portfolio
            </h3>
            <button
              onClick={() => setShowAddProject(!showAddProject)}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Project
            </button>
          </div>

          {showAddProject && (
            <form onSubmit={handleCreateProject} className="p-3 border-b border-slate-200 bg-slate-50/50 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. Project Orion"
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Project Manager</label>
                  <select
                    value={projManagerId}
                    onChange={(e) => setProjManagerId(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="">Select Project Manager</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Description</label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Summarize objectives, targets, and expected ROI..."
                  rows={2}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Priority</label>
                  <select
                    value={projPriority}
                    onChange={(e) => setProjPriority(e.target.value as ProjectPriority)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                  >
                    <option value={ProjectPriority.LOW}>Low</option>
                    <option value={ProjectPriority.MEDIUM}>Medium</option>
                    <option value={ProjectPriority.HIGH}>High</option>
                    <option value={ProjectPriority.CRITICAL}>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Budget ($ USD)</label>
                  <input
                    type="number"
                    value={projBudget}
                    onChange={(e) => setProjBudget(Number(e.target.value))}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    value={projStart}
                    onChange={(e) => setProjStart(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-2 bg-slate-900 rounded text-slate-100 flex flex-col gap-1.5 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Gemini Delivery Estimator</span>
                  </div>
                  <button
                    type="button"
                    disabled={!projName.trim() || predicting}
                    onClick={predictProjectTimeline}
                    className="text-[10px] font-medium text-blue-400 hover:text-blue-300 disabled:text-slate-600 underline"
                  >
                    {predicting ? "Analysing ledger..." : "Predict Schedule Risks"}
                  </button>
                </div>
                {predictedTimeline && (
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-white">Suggested Duration:</span>
                      <span>{predictedTimeline.suggestedDays} Business Days</span>
                      <span className={`px-1 rounded text-[9px] font-bold uppercase ${
                        predictedTimeline.riskLevel === "High" ? "bg-rose-500/20 text-rose-300 border border-rose-500/20" :
                        predictedTimeline.riskLevel === "Medium" ? "bg-amber-500/20 text-amber-300 border border-amber-500/20" :
                        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                      }`}>{predictedTimeline.riskLevel} Risk</span>
                    </div>
                    <div>
                      <span className="font-semibold text-white">Mitigation Strategy:</span> {predictedTimeline.mitigation}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                >
                  Create Project
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  <th className="p-2 pl-3">Project Name</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Priority</th>
                  <th className="p-2">Project Manager</th>
                  <th className="p-2">Budget Allocation</th>
                  <th className="p-2 pr-3 text-right">Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs">
                {projects.map((proj) => {
                  const manager = users.find(u => u.id === proj.projectManagerId);
                  const isSelected = selectedProjectId === proj.id;
                  
                  return (
                    <tr 
                      key={proj.id} 
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`hover:bg-slate-50/70 cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50/30 font-medium" : ""
                      }`}
                    >
                      <td className="p-2 pl-3">
                        <div className="flex items-center gap-1.5">
                          {isSelected ? (
                            <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <div>
                            <span className="text-slate-900 block font-medium font-sans">
                              {proj.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block max-w-sm truncate">
                              {proj.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium font-mono border ${
                          proj.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          proj.status === "Planning" ? "bg-blue-50 text-blue-700 border-blue-100" :
                          proj.status === "On Hold" ? "bg-amber-50 text-amber-700 border-amber-100" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium font-sans border ${
                          proj.priority === "Critical" ? "bg-rose-50 text-rose-700 border-rose-100" :
                          proj.priority === "High" ? "bg-amber-50 text-amber-700 border-amber-100" :
                          "bg-slate-50 text-slate-600"
                        }`}>
                          {proj.priority}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <img 
                            src={manager?.photoURL || DEFAULT_AVATAR} 
                            alt={manager?.displayName}
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                          <span className="text-[11px] text-slate-700 truncate max-w-[100px]">
                            {manager?.displayName || "System"}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] text-slate-900">${proj.spent.toLocaleString()} / ${proj.budget.toLocaleString()}</span>
                          <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                            <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (proj.spent / proj.budget) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-2 pr-3 text-right">
                        <span className="font-mono text-[11px] text-slate-500 block">{proj.startDate}</span>
                        <span className="font-mono text-[10px] text-slate-400 block">to {proj.endDate}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {selectedProjectId ? (
          (() => {
            const selectedProj = projects.find(p => p.id === selectedProjectId);
            const projectSprints = sprints.filter(s => s.projectId === selectedProjectId);
            
            if (!selectedProj) return null;

            return (
              <div className="space-y-3">
                <div id="project-sprints" className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" /> Sprints ({projectSprints.length})
                    </h4>
                    <button
                      onClick={() => setShowAddSprint(!showAddSprint)}
                      className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium flex items-center gap-0.5 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> New Sprint
                    </button>
                  </div>

                  {showAddSprint && (
                    <form onSubmit={handleCreateSprint} className="p-3 border-b border-slate-200 bg-slate-50/30 space-y-2">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase">Sprint Name</label>
                        <input
                          type="text"
                          required
                          value={sprintName}
                          onChange={(e) => setSprintName(e.target.value)}
                          placeholder="e.g. Sprint 14: Core API Tuning"
                          className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase">Sprint Goal</label>
                        <input
                          type="text"
                          value={sprintGoal}
                          onChange={(e) => setSprintGoal(e.target.value)}
                          placeholder="Goal for this iteration..."
                          className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase">Start Date</label>
                          <input
                            type="date"
                            value={sprintStart}
                            onChange={(e) => setSprintStart(e.target.value)}
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase">End Date</label>
                          <input
                            type="date"
                            value={sprintEnd}
                            onChange={(e) => setSprintEnd(e.target.value)}
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddSprint(false)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                        >
                          Create Sprint
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="divide-y divide-slate-150 text-xs">
                    {projectSprints.length > 0 ? (
                      projectSprints.map((sprint) => (
                        <div key={sprint.id} className="p-2.5 hover:bg-slate-50/50 flex justify-between items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <h5 className="font-semibold text-slate-900 truncate">{sprint.name}</h5>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">Goal: {sprint.goal}</p>
                            <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                              {sprint.startDate} to {sprint.endDate}
                            </span>
                          </div>
                          <div>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium font-mono uppercase ${
                              sprint.status === "active" ? "bg-amber-100 text-amber-800" :
                              sprint.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                              "bg-slate-100 text-slate-700"
                            }`}>
                              {sprint.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No sprints mapped to this project yet.
                      </div>
                    )}
                  </div>
                </div>

                <div id="project-milestones" className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5 font-sans">
                    <Compass className="w-4 h-4 text-blue-600" /> Milestones & Targets
                  </h4>
                  <div className="space-y-3">
                    {selectedProj.milestones && selectedProj.milestones.length > 0 ? (
                      selectedProj.milestones.map((m) => (
                        <div key={m.id} className="p-2 bg-slate-50/50 rounded border border-slate-150 text-xs">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-slate-900 truncate block">{m.title}</span>
                            <span className={`shrink-0 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              m.status === "completed" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                              "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}>{m.status}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">{m.description}</p>
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono mt-2">
                            <Clock className="w-3 h-3" /> Due date: {m.dueDate}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No milestones created for this project yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs text-center text-xs text-slate-400 flex flex-col items-center justify-center py-12">
            <Folder className="w-8 h-8 text-slate-300 mb-2" />
            <span>Select a project from the portfolio table to inspect active sprints, timeline estimators, and engineering milestones.</span>
          </div>
        )}
      </div>

    </div>
  );
}
