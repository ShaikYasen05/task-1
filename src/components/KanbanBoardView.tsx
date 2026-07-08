import React, { useState } from "react";
import { 
  Task, 
  Project, 
  Sprint, 
  UserProfile, 
  TaskStatus, 
  TaskPriority,
  Subtask,
  TaskComment,
  DEFAULT_AVATAR
} from "../types";
import { 
  Layers, 
  Plus, 
  Clock, 
  UserPlus, 
  AlertCircle, 
  Bot, 
  Sparkles, 
  CheckSquare, 
  Paperclip, 
  MessageSquare, 
  ArrowRight, 
  ArrowLeft,
  X,
  User,
  Trash2
} from "lucide-react";

interface KanbanBoardViewProps {
  tasks: Task[];
  projects: Project[];
  sprints: Sprint[];
  users: UserProfile[];
  currentUser: UserProfile;
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  subtasks: Subtask[];
  comments: TaskComment[];
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (subtaskId: string, isCompleted: boolean) => void;
  onAddComment: (taskId: string, content: string) => void;
}

export default function KanbanBoardView({
  tasks,
  projects,
  sprints,
  users,
  currentUser,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  subtasks,
  comments,
  onAddSubtask,
  onToggleSubtask,
  onAddComment
}: KanbanBoardViewProps) {
  const statuses = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE
  ];

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskProjId, setTaskProjId] = useState("");
  const [taskSprintId, setTaskSprintId] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [taskAssignees, setTaskAssignees] = useState<string[]>([]);
  const [taskEst, setTaskEst] = useState(8);
  const [taskDueDate, setTaskDueDate] = useState("2026-07-15");
  const [taskLabels, setTaskLabels] = useState("");

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");

  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiResult, setAiResult] = useState<{ priority?: string; reason?: string } | null>(null);

  const handleAiSuggestPriority = async () => {
    if (!taskTitle.trim()) return;
    setAiSuggesting(true);
    setAiResult(null);
    try {
      const response = await fetch("/api/ai/suggest-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, description: taskDesc })
      });
      const data = await response.json();
      setAiResult(data);
      if (data.priority) {
        setTaskPriority(data.priority as TaskPriority);
      }
    } catch (e) {
      console.error("AI Priority recommendation failure:", e);
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskProjId) return;

    onAddTask({
      projectId: taskProjId,
      sprintId: taskSprintId || null,
      title: taskTitle,
      description: taskDesc,
      status: TaskStatus.TODO,
      priority: taskPriority,
      assigneeIds: taskAssignees.length > 0 ? taskAssignees : [currentUser.id],
      estimatedHours: Number(taskEst),
      actualHours: 0,
      startDate: new Date().toISOString().split("T")[0],
      dueDate: taskDueDate || null,
      labels: taskLabels.split(",").map(l => l.trim()).filter(Boolean),
      dependencies: [],
      createdBy: currentUser.id
    });

    setTaskTitle("");
    setTaskDesc("");
    setTaskProjId("");
    setTaskSprintId("");
    setTaskPriority(TaskPriority.MEDIUM);
    setTaskAssignees([]);
    setTaskEst(8);
    setTaskLabels("");
    setAiResult(null);
    setShowAddTaskModal(false);
  };

  const moveTaskStatus = (taskId: string, currentStatus: TaskStatus, direction: "next" | "prev") => {
    const currentIdx = statuses.indexOf(currentStatus);
    let targetIdx = currentIdx;
    if (direction === "next" && currentIdx < statuses.length - 1) {
      targetIdx++;
    } else if (direction === "prev" && currentIdx > 0) {
      targetIdx--;
    }
    if (targetIdx !== currentIdx) {
      onUpdateTask(taskId, { status: statuses[targetIdx] });
    }
  };

  return (
    <div id="kanban-board-root" className="flex flex-col h-full space-y-3">
      
      <div id="kanban-actions-bar" className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-900 font-sans">Active Sprint Scrumboard</h2>
        </div>
        <button
          onClick={() => {
            if (projects.length > 0) setTaskProjId(projects[0].id);
            setShowAddTaskModal(true);
          }}
          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Backlog Task
        </button>
      </div>

      <div id="kanban-columns-container" className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start overflow-x-auto pb-4">
        {statuses.map((colStatus) => {
          const columnTasks = tasks.filter(t => t.status === colStatus);
          
          return (
            <div 
              key={colStatus} 
              id={`kanban-col-${colStatus.toLowerCase().replace(" ", "-")}`} 
              className="bg-slate-100 rounded border border-slate-200 p-2 space-y-2 flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-sans uppercase text-slate-700 tracking-wide">
                  {colStatus}
                </span>
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[70vh] pr-1 scrollbar-thin">
                {columnTasks.map((task) => {
                  const taskProj = projects.find(p => p.id === task.projectId);
                  const firstAssignee = users.find(u => u.id === task.assigneeIds[0]);
                  const taskSubs = subtasks.filter(s => s.taskId === task.id);
                  const doneSubs = taskSubs.filter(s => s.isCompleted);
                  const taskComms = comments.filter(c => c.taskId === task.id);

                  return (
                    <div
                      key={task.id}
                      id={`kanban-card-${task.id}`}
                      className="bg-white p-2.5 rounded border border-slate-250 shadow-3xs hover:shadow-2xs cursor-pointer transition-all space-y-2 border-l-3 group relative hover:border-l-blue-600"
                      style={{ borderLeftColor: 
                        task.priority === TaskPriority.URGENT ? "#ef4444" : 
                        task.priority === TaskPriority.HIGH ? "#f59e0b" : "#cbd5e1" 
                      }}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] font-mono font-semibold text-slate-400 block truncate max-w-[85px]">
                          {taskProj ? taskProj.name.split(":")[0] : "Project"}
                        </span>
                        <span className={`text-[8px] font-sans font-bold uppercase tracking-wide px-1.5 rounded-full ${
                          task.priority === TaskPriority.URGENT ? "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse" :
                          task.priority === TaskPriority.HIGH ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-slate-50 text-slate-500"
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="text-[11px] font-semibold text-slate-900 leading-tight font-sans">
                        {task.title}
                      </h4>

                      {taskSubs.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-sans">
                          <CheckSquare className="w-3 h-3 text-emerald-600" />
                          <span>{doneSubs.length}/{taskSubs.length} subtasks</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center gap-2 pt-1 border-t border-slate-100">
                        <div className="flex gap-1 flex-wrap">
                          {task.labels.slice(0, 2).map((lbl, idx) => (
                            <span key={idx} className="text-[8px] px-1 bg-slate-100 text-slate-600 rounded">
                              {lbl}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {taskComms.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px] text-slate-400 font-mono">
                              <MessageSquare className="w-2.5 h-2.5" /> {taskComms.length}
                            </span>
                          )}
                          <img
                            src={firstAssignee?.photoURL || DEFAULT_AVATAR}
                            alt={firstAssignee?.displayName}
                            referrerPolicy="no-referrer"
                            className="w-4.5 h-4.5 rounded-full object-cover border border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="absolute right-1 top-1 flex items-center bg-slate-900/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity p-0.5 gap-0.5" onClick={(e) => e.stopPropagation()}>
                        {colStatus !== TaskStatus.BACKLOG && (
                          <button 
                            title="Move left"
                            onClick={() => moveTaskStatus(task.id, task.status, "prev")}
                            className="p-0.5 hover:bg-slate-800 rounded"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {colStatus !== TaskStatus.DONE && (
                          <button 
                            title="Move right"
                            onClick={() => moveTaskStatus(task.id, task.status, "next")}
                            className="p-0.5 hover:bg-slate-800 rounded"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {columnTasks.length === 0 && (
                  <div className="text-center py-6 border border-dashed border-slate-300 rounded text-slate-400 text-[10px]">
                    No items in this queue
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddTaskModal && (
        <div id="add-task-modal-backdrop" className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div id="add-task-modal-content" className="bg-white rounded border border-slate-300 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-sans">
                <Plus className="w-4 h-4 text-blue-600" /> Create Sprint Backlog Task
              </h3>
              <button onClick={() => setShowAddTaskModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Summarize core engineering task..."
                  className="w-full bg-white text-slate-900 border border-slate-250 rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Parent Project</label>
                  <select
                    required
                    value={taskProjId}
                    onChange={(e) => setTaskProjId(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-250 rounded px-2 py-1 outline-none focus:border-blue-500"
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Target Sprint</label>
                  <select
                    value={taskSprintId}
                    onChange={(e) => setTaskSprintId(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-250 rounded px-2 py-1 outline-none focus:border-blue-500"
                  >
                    <option value="">No Sprint Assigned</option>
                    {sprints.filter(s => s.projectId === taskProjId).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Task Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Enumerate prerequisites, implementation guides, and technical bounds..."
                  rows={3}
                  className="w-full bg-white text-slate-900 border border-slate-250 rounded px-2.5 py-1.5 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="p-2.5 bg-slate-900 text-slate-100 rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Gemini Priority Suggester</span>
                  </div>
                  <button
                    type="button"
                    disabled={!taskTitle.trim() || aiSuggesting}
                    onClick={handleAiSuggestPriority}
                    className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 disabled:text-slate-600 underline"
                  >
                    {aiSuggesting ? "Analyzing complexity..." : "Analyze with AI"}
                  </button>
                </div>
                {aiResult && (
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">Suggested:</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">{aiResult.priority}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-white">Justification:</span> {aiResult.reason}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Priority State</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-white text-slate-900 border border-slate-250 rounded px-2 py-1 outline-none focus:border-blue-500"
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                    <option value={TaskPriority.URGENT}>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Est. Hours</label>
                  <input
                    type="number"
                    value={taskEst}
                    onChange={(e) => setTaskEst(Number(e.target.value))}
                    className="w-full bg-white text-slate-900 border border-slate-250 rounded px-2 py-1 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-250 rounded px-2 py-1 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Assignee(s)</label>
                <select
                  multiple
                  value={taskAssignees}
                  onChange={(e) => setTaskAssignees(Array.from(e.target.selectedOptions, (option: any) => option.value))}
                  className="w-full bg-white text-slate-900 border border-slate-250 rounded px-2 py-1.5 outline-none focus:border-blue-500 h-20"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Hold Ctrl (Cmd) to select multiple assignees</span>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Labels / Tags</label>
                <input
                  type="text"
                  value={taskLabels}
                  onChange={(e) => setTaskLabels(e.target.value)}
                  placeholder="e.g. Performance, Frontend, Database"
                  className="w-full bg-white text-slate-900 border border-slate-250 rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                >
                  Add to Backlog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTask && (
        (() => {
          const taskProj = projects.find(p => p.id === selectedTask.projectId);
          const taskAssigneesList = users.filter(u => selectedTask.assigneeIds.includes(u.id));
          const taskSubs = subtasks.filter(s => s.taskId === selectedTask.id);
          const taskComms = comments.filter(c => c.taskId === selectedTask.id);

          return (
            <div id="task-side-sheet-backdrop" className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex justify-end z-50">
              <div id="task-side-sheet-content" className="bg-white w-full max-w-lg h-full border-l border-slate-250 shadow-xl flex flex-col p-4 space-y-4 overflow-y-auto">
                
                <div className="flex justify-between items-start border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      {taskProj ? taskProj.name : "Project Task"}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-950 font-sans tracking-tight mt-0.5">
                      {selectedTask.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTaskId(null)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-150 pb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Status Queue</span>
                    <select
                      value={selectedTask.status}
                      onChange={(e) => onUpdateTask(selectedTask.id, { status: e.target.value as TaskStatus })}
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800"
                    >
                      {statuses.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Priority</span>
                    <select
                      value={selectedTask.priority}
                      onChange={(e) => onUpdateTask(selectedTask.id, { priority: e.target.value as TaskPriority })}
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800"
                    >
                      <option value={TaskPriority.LOW}>Low</option>
                      <option value={TaskPriority.MEDIUM}>Medium</option>
                      <option value={TaskPriority.HIGH}>High</option>
                      <option value={TaskPriority.URGENT}>Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Estimated Hours</span>
                    <input
                      type="number"
                      value={selectedTask.estimatedHours}
                      onChange={(e) => onUpdateTask(selectedTask.id, { estimatedHours: Number(e.target.value) })}
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800 w-16 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Due Deadline</span>
                    <input
                      type="date"
                      value={selectedTask.dueDate || ""}
                      onChange={(e) => onUpdateTask(selectedTask.id, { dueDate: e.target.value || null })}
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Description Summary</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-150 leading-relaxed font-sans">
                    {selectedTask.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Assigned Engineers</span>
                  <div className="flex flex-wrap gap-1.5">
                    {taskAssigneesList.map(a => (
                      <div key={a.id} className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full py-0.5 px-2">
                        <img 
                          src={a.photoURL} 
                          alt={a.displayName} 
                          referrerPolicy="no-referrer"
                          className="w-4.5 h-4.5 rounded-full object-cover" 
                        />
                        <span className="text-[11px] font-medium text-slate-700">{a.displayName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-150 pt-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Engineering checklist ({taskSubs.filter(s => s.isCompleted).length} / {taskSubs.length})</span>
                  <div className="space-y-1">
                    {taskSubs.map(sub => (
                      <label key={sub.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors border border-slate-100">
                        <input
                          type="checkbox"
                          checked={sub.isCompleted}
                          onChange={(e) => onToggleSubtask(sub.id, e.target.checked)}
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={`text-[11px] ${sub.isCompleted ? "line-through text-slate-400 font-sans" : "text-slate-800 font-sans font-medium"}`}>
                          {sub.title}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add checkbox item..."
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!newSubtaskTitle.trim()) return;
                        onAddSubtask(selectedTask.id, newSubtaskTitle);
                        setNewSubtaskTitle("");
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-150 pt-3 flex-1 flex flex-col min-h-0">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Activity Log & Comments ({taskComms.length})</span>
                  <div className="space-y-2 overflow-y-auto max-h-48 pr-1 flex-1 space-y-2 border-b border-slate-100 pb-2">
                    {taskComms.length > 0 ? (
                      taskComms.map(comm => {
                        const author = users.find(u => u.id === comm.userId);
                        return (
                          <div key={comm.id} className="p-2 bg-slate-50 rounded border border-slate-150 space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <img 
                                  src={author?.photoURL} 
                                  alt={author?.displayName} 
                                  referrerPolicy="no-referrer"
                                  className="w-4 h-4 rounded-full object-cover" 
                                />
                                <span className="font-semibold text-slate-700">{author?.displayName || "System"}</span>
                              </div>
                              <span className="text-slate-400 font-mono">{comm.createdAt.split("T")[1]?.slice(0,5) || comm.createdAt}</span>
                            </div>
                            <p className="text-slate-600 pl-5 leading-normal">{comm.content}</p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-slate-400 text-[11px]">
                        No comments recorded. Establish review comments below.
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      placeholder="Comment on task progress..."
                      className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!newCommentContent.trim()) return;
                        onAddComment(selectedTask.id, newCommentContent);
                        setNewCommentContent("");
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                    >
                      Post
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-150 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Task Ref: {selectedTask.id}</span>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this backlog task?")) {
                        onDeleteTask(selectedTask.id);
                        setSelectedTaskId(null);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purge Task
                  </button>
                </div>

              </div>
            </div>
          );
        })()
      )}

    </div>
  );
}
