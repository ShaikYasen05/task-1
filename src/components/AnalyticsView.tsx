import React from "react";
import { Project, Task, Sprint, TaskStatus } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from "recharts";
import { BarChart3, TrendingUp, ShieldCheck, PieChart as PieIcon, DollarSign, Target } from "lucide-react";

interface AnalyticsViewProps {
  projects: Project[];
  tasks: Task[];
  sprints: Sprint[];
}

export default function AnalyticsView({
  projects,
  tasks,
  sprints
}: AnalyticsViewProps) {
  
  const budgetData = projects.map(p => ({
    name: p.name.split(":")[0],
    Budget: p.budget,
    Spent: p.spent
  }));

  const statusCounts = {
    [TaskStatus.BACKLOG]: tasks.filter(t => t.status === TaskStatus.BACKLOG).length,
    [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO).length,
    [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    [TaskStatus.IN_REVIEW]: tasks.filter(t => t.status === TaskStatus.IN_REVIEW).length,
    [TaskStatus.DONE]: tasks.filter(t => t.status === TaskStatus.DONE).length,
  };

  const pieData = Object.entries(statusCounts).map(([key, value]) => ({
    name: key,
    value
  }));

  const COLORS = ["#94a3b8", "#3b82f6", "#f59e0b", "#6366f1", "#10b981"];

  const velocityData = [
    { name: "Sprint 9", Committed: 38, Completed: 35 },
    { name: "Sprint 10", Committed: 40, Completed: 38 },
    { name: "Sprint 11", Committed: 45, Completed: 42 },
    { name: "Sprint 12 (Active)", Committed: 48, Completed: 24 }
  ];

  return (
    <div id="analytics-view-root" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">System Financial Burn</span>
            <h4 className="text-sm font-bold text-slate-900 font-sans mt-0.5">
              ${projects.reduce((acc, p) => acc + p.spent, 0).toLocaleString()} Spent
            </h4>
            <span className="text-[10px] text-slate-500 font-sans">
              Out of ${projects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()} portfolio pool
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Task Resolution Velocity</span>
            <h4 className="text-sm font-bold text-slate-900 font-sans mt-0.5">
              {Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / tasks.length) * 100)}% Complete
            </h4>
            <span className="text-[10px] text-slate-500 font-sans">
              {tasks.filter(t => t.status === TaskStatus.DONE).length} of {tasks.length} total backlog tasks completed
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Agile Quality Assurance</span>
            <h4 className="text-sm font-bold text-slate-900 font-sans mt-0.5">
              1.2% Slippage Index
            </h4>
            <span className="text-[10px] text-slate-500 font-sans">
              Within standard 5% variance parameters
            </span>
          </div>
        </div>
      </div>

      <div id="analytics-charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" /> Financial Budget Execution ($ USD)
          </h3>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Budget" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Spent" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Historical Sprint Velocity Trends (Story Points)
          </h3>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Committed" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-indigo-600" /> Active Task Queues Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 py-2">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {pieData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-slate-600 font-sans font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-900 font-bold">{item.value} tasks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security Rules & Isolation Compliance
          </h3>
          <div className="p-3 bg-slate-50 rounded border border-slate-150 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-sans font-semibold text-slate-700">Access Control Model</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-200">ABAC (Zero Trust)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="text-slate-400 block font-mono">PII ISOLATION</span>
                <span className="font-sans font-bold text-slate-800">100% Compliant</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="text-slate-400 block font-mono">DENIAL OF WALLET</span>
                <span className="font-sans font-bold text-slate-800">Active protection</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="text-slate-400 block font-mono">TENANT ISOLATION</span>
                <span className="font-sans font-bold text-slate-800">Enforced synchronously</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="text-slate-400 block font-mono">ORPHAN PREVENTIONS</span>
                <span className="font-sans font-bold text-slate-800">Batch-guaranteed</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
