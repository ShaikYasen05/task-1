import React, { useState } from "react";
import { AuditLog, Department, Team, UserProfile, UserRole } from "../types";
import { 
  ShieldAlert, 
  Database, 
  Terminal, 
  History, 
  Settings, 
  Users, 
  Layers, 
  Activity, 
  ArrowRight,
  Sparkles,
  AlertOctagon
} from "lucide-react";

interface AdminPanelProps {
  auditLogs: AuditLog[];
  departments: Department[];
  teams: Team[];
  users: UserProfile[];
  currentUser: UserProfile;
  onTriggerSeed: () => void;
  loadingSeed: boolean;
}

export default function AdminPanel({
  auditLogs,
  departments,
  teams,
  users,
  currentUser,
  onTriggerSeed,
  loadingSeed
}: AdminPanelProps) {
  const [filterLogsAction, setFilterLogsAction] = useState("");

  const hasAccess = 
    currentUser.role === UserRole.SUPER_ADMIN || 
    currentUser.role === UserRole.ADMIN || 
    currentUser.role === UserRole.ORGANIZATION_OWNER;

  const filteredLogs = filterLogsAction 
    ? auditLogs.filter(log => log.action.toLowerCase().includes(filterLogsAction.toLowerCase()))
    : auditLogs;

  if (!hasAccess) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-6 text-center max-w-xl mx-auto my-12 space-y-3">
        <AlertOctagon className="w-12 h-12 text-red-600 mx-auto animate-bounce" />
        <h3 className="text-sm font-bold text-red-800 uppercase font-sans">Permission Revoked (RBAC Error)</h3>
        <p className="text-xs text-red-700 font-sans leading-relaxed">
          Your active persona ({currentUser.displayName}, Role: <span className="font-semibold">{currentUser.role}</span>) does not possess administrative credentials to access raw ledger databases and audit tracking records.
        </p>
        <p className="text-xs text-slate-500 font-sans">
          Use the **Active Persona Sim** switcher in the sidebar to simulate a Super Admin or Org Owner.
        </p>
      </div>
    );
  }

  return (
    <div id="admin-panel-root" className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      
      <div className="xl:col-span-2 space-y-3">
        <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-sans">
              <Layers className="w-4 h-4 text-blue-600" /> Enterprise Corporate Divisions ({departments.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-150 text-xs">
            {departments.map((dept) => {
              const headUser = users.find(u => u.id === dept.headUserId);
              const deptMembers = users.filter(u => u.departmentId === dept.id);
              
              return (
                <div key={dept.id} className="p-3 flex justify-between items-center gap-4 hover:bg-slate-50/50">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 font-sans text-sm">{dept.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">Division Code: {dept.code}</span>
                  </div>
                  <div className="text-right text-[11px] space-y-1">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-slate-400">Division Head:</span>
                      <span className="font-medium text-slate-800 font-sans">{headUser?.displayName || "System"}</span>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.2 rounded border border-blue-100 font-bold">{deptMembers.length} active engineers</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-sans">
              <Users className="w-4 h-4 text-blue-600" /> Operational Engineering Squads ({teams.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-150 text-xs">
            {teams.map((team) => {
              const teamLead = users.find(u => u.id === team.teamLeadId);
              return (
                <div key={team.id} className="p-3 hover:bg-slate-50/50 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-900 font-sans text-sm">{team.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">Lead: {teamLead?.displayName || "System"}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] font-sans">{team.description}</p>
                  <div className="flex gap-1 items-center flex-wrap pt-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Roster:</span>
                    {users.filter(u => team.memberIds.includes(u.id)).map(memb => (
                      <span key={memb.id} className="bg-slate-100 border border-slate-150 px-2 py-0.2 rounded-full text-[10px] font-sans">
                        {memb.displayName}
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
        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-600" /> Administrative Telemetry
          </h3>

          <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
            Perform enterprise seeder actions to reset project ledgers, seed initial users, reset task sprints, and wipe transaction locks.
          </p>

          <button
            onClick={onTriggerSeed}
            disabled={loadingSeed}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded text-xs font-medium font-sans flex items-center justify-center gap-1.5 transition-colors"
          >
            {loadingSeed ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" /> Provisioning cluster...
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5" /> Reseed & Refresh Database
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded border border-slate-800 shadow-md flex flex-col h-[60vh] overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
                Audit Trail Telemetry
              </h4>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> MONITORED
            </span>
          </div>

          <div className="p-2 border-b border-slate-850 bg-slate-950/60 shrink-0">
            <input
              type="text"
              value={filterLogsAction}
              onChange={(e) => setFilterLogsAction(e.target.value)}
              placeholder="Filter actions (e.g. seed)..."
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2.5 font-mono text-[10px] bg-slate-950">
            {filteredLogs.map((log) => {
              const u = users.find(usr => usr.id === log.userId);
              return (
                <div key={log.id} className="p-2 bg-slate-900/60 rounded border border-slate-850 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span className="text-emerald-400 font-bold">[{log.action}]</span>
                    <span>{log.createdAt.split("T")[1]?.slice(0, 8) || log.createdAt}</span>
                  </div>
                  <p className="text-slate-300 leading-normal">{log.details}</p>
                  <div className="flex justify-between text-slate-500 text-[9px] pt-1">
                    <span>IP: {log.ipAddress}</span>
                    <span>User: {u ? u.displayName : log.userId}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
