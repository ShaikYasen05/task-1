import React from "react";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Layers, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  ShieldAlert, 
  Settings as SettingsIcon, 
  User, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { UserRole, UserProfile } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  users: UserProfile[];
  onSwitchUser: (userId: string) => void;
  orgName: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  onSwitchUser,
  orgName
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects & Sprints", icon: FolderKanban },
    { id: "kanban", label: "Kanban Board", icon: Layers },
    { id: "calendar", label: "Calendar & Schedule", icon: Calendar },
    { id: "chat", label: "Realtime Collaboration", icon: MessageSquare },
    { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
    { id: "admin", label: "Admin Panel", icon: ShieldAlert },
    { id: "settings", label: "System Settings", icon: SettingsIcon },
  ];

  return (
    <aside id="sidebar-container" className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800">
      <div id="sidebar-branding" className="p-5 border-b border-slate-800 flex flex-col gap-1 bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-sans font-semibold tracking-tight text-lg text-white">
            Initech SaaS
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono pl-8">{orgName}</span>
      </div>

      <div id="identity-switcher-container" className="p-3 bg-slate-800/40 border-b border-slate-800 flex flex-col gap-1.5">
        <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase flex items-center justify-between">
          <span>Active Persona Sim</span>
          <span className="flex items-center gap-0.5 text-blue-400 font-sans font-medium">
            <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> Demo Mode
          </span>
        </label>
        <select
          id="role-switch-dropdown"
          value={currentUser.id}
          onChange={(e) => onSwitchUser(e.target.value)}
          className="w-full bg-slate-950 text-slate-200 text-xs rounded border border-slate-700 py-1.5 px-2 outline-none focus:border-blue-500 font-sans font-medium cursor-pointer"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.displayName} ({u.role})
            </option>
          ))}
        </select>
      </div>

      <nav id="sidebar-navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.id === "admin" && 
              currentUser.role !== UserRole.SUPER_ADMIN && 
              currentUser.role !== UserRole.ADMIN && 
              currentUser.role !== UserRole.ORGANIZATION_OWNER) {
            return null;
          }

          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium tracking-tight transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div id="sidebar-user-profile" className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
        <div className="relative">
          <img
            id="user-avatar-image"
            src={currentUser.photoURL}
            alt={currentUser.displayName}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full border border-slate-700 object-cover"
          />
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
            currentUser.status === "online" ? "bg-green-500" :
            currentUser.status === "busy" ? "bg-red-500" :
            currentUser.status === "away" ? "bg-amber-500" : "bg-slate-500"
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium font-sans text-white truncate">
            {currentUser.displayName}
          </h4>
          <span className="text-xs text-blue-400 font-mono font-medium truncate block">
            {currentUser.role}
          </span>
        </div>
      </div>
    </aside>
  );
}
