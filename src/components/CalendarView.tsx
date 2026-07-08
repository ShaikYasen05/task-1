import React, { useState } from "react";
import { CalendarEvent, Project } from "../types";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Users, 
  Tag, 
  FolderKanban,
  X 
} from "lucide-react";

interface CalendarViewProps {
  events: CalendarEvent[];
  projects: Project[];
  onCreateEvent: (event: Partial<CalendarEvent>) => void;
}

export default function CalendarView({
  events,
  projects,
  onCreateEvent
}: CalendarViewProps) {
  const [showAddEvent, setShowAddEvent] = useState(false);
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("2026-07-08T09:00");
  const [end, setEnd] = useState("2026-07-08T10:00");
  const [type, setType] = useState<"meeting" | "task_deadline" | "sprint" | "milestone">("meeting");
  const [projId, setProjId] = useState("");
  const [loc, setLoc] = useState("");

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateEvent({
      projectId: projId || null,
      title,
      description: desc,
      startDate: start,
      endDate: end,
      type,
      location: loc || null,
      attendeeIds: []
    });

    setTitle("");
    setDesc("");
    setLoc("");
    setShowAddEvent(false);
  };

  const daysInMonth = 31;
  const startDayOfWeek = 3;
  const calendarDays = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getDayEvents = (dayNum: number) => {
    const dateStr = `2026-07-${dayNum.toString().padStart(2, "0")}`;
    return events.filter(evt => evt.startDate.startsWith(dateStr));
  };

  return (
    <div id="calendar-view-root" className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      
      <div className="lg:col-span-2 space-y-3">
        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
                Enterprise Ledger Schedule — July 2026
              </h3>
            </div>
            <button
              onClick={() => setShowAddEvent(true)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Book Event
            </button>
          </div>

          <div className="grid grid-cols-7 text-center font-mono text-[10px] uppercase text-slate-400 pb-2 border-b border-slate-100 font-bold">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-2 text-xs">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="bg-slate-50 border border-slate-100 min-h-[70px] rounded opacity-40" />;
              }
              const dayEvts = getDayEvents(day);
              
              return (
                <div 
                  key={`day-${day}`} 
                  className="bg-white border border-slate-200 min-h-[70px] p-1 rounded hover:bg-slate-50/50 flex flex-col justify-between"
                >
                  <span className="font-mono text-[11px] text-slate-400 font-semibold">{day}</span>
                  <div className="space-y-0.5 mt-1 overflow-y-auto max-h-[45px] scrollbar-none">
                    {dayEvts.map(evt => (
                      <span 
                        key={evt.id} 
                        title={evt.title}
                        className={`block text-[8px] px-1 py-0.2 rounded truncate font-medium border ${
                          evt.type === "meeting" ? "bg-blue-50 text-blue-700 border-blue-100" :
                          evt.type === "task_deadline" ? "bg-rose-50 text-rose-700 border-rose-100" :
                          evt.type === "milestone" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {evt.title}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
              Chronological Agenda
            </h3>
          </div>
          
          <div className="divide-y divide-slate-150 p-2 space-y-2 max-h-[80vh] overflow-y-auto">
            {events.map((evt) => {
              const proj = projects.find(p => p.id === evt.projectId);
              return (
                <div key={evt.id} className="p-2.5 bg-slate-50/40 rounded border border-slate-150 space-y-1.5 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      evt.type === "meeting" ? "bg-blue-50 text-blue-700 border-blue-100" :
                      evt.type === "task_deadline" ? "bg-rose-50 text-rose-700 border-rose-100" :
                      evt.type === "milestone" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>{evt.type.replace("_", " ")}</span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-slate-400" /> {evt.startDate.replace("T", " ")}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal">{evt.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                    {evt.location && (
                      <span className="flex items-center gap-0.5 max-w-[150px] truncate">
                        <MapPin className="w-3 h-3 text-slate-400" /> {evt.location}
                      </span>
                    )}
                    {proj && (
                      <span className="flex items-center gap-0.5 truncate">
                        <FolderKanban className="w-3 h-3 text-slate-400" /> {proj.name.split(":")[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAddEvent && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-md w-full p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" /> Book Enterprise Schedule
              </h3>
              <button onClick={() => setShowAddEvent(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ledgers load test review"
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Event Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Provide meeting purpose, links, and attendees..."
                  rows={2}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Start Timestamp</label>
                  <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">End Timestamp</label>
                  <input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Type of Event</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                  >
                    <option value="meeting">Meeting Sync</option>
                    <option value="task_deadline">Task Deadline</option>
                    <option value="milestone">Project Milestone</option>
                    <option value="sprint">Sprint Timeline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Associated Project</label>
                  <select
                    value={projId}
                    onChange={(e) => setProjId(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                  >
                    <option value="">No Project Affiliation</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Location / Meeting URL</label>
                <input
                  type="text"
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  placeholder="e.g. Zoom Link ID or Room 402"
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
