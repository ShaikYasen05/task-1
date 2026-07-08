import React from "react";
import { UserProfile } from "../types";
import { Settings, ShieldCheck, Mail, Users, Landmark, Clock } from "lucide-react";

interface SettingsViewProps {
  currentUser: UserProfile;
  usersProfileList: UserProfile[];
  onUpdateStatus: (status: "online" | "offline" | "away" | "busy") => void;
}

export default function SettingsView({
  currentUser,
  usersProfileList,
  onUpdateStatus
}: SettingsViewProps) {
  return (
    <div id="settings-view-root" className="max-w-3xl mx-auto space-y-3">
      
      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
            Personal Identity Config
          </h3>
        </div>

        <div className="p-4 space-y-4 text-xs">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover border border-slate-300 shadow-3xs" 
            />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900 font-sans">{currentUser.displayName}</h4>
              <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded text-[10px] font-mono border border-blue-100">
                {currentUser.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 block">Personal Email</label>
              <div className="flex items-center gap-1.5 text-slate-700 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 block">System Identifier</label>
              <div className="flex items-center gap-1.5 text-slate-700 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.id}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 block">Organization affiliation</label>
              <div className="flex items-center gap-1.5 text-slate-700 font-sans bg-slate-50 p-2 rounded border border-slate-200">
                <Landmark className="w-3.5 h-3.5 text-slate-400" />
                <span>Initech Enterprise Solutions</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 block">Active Status State</label>
              <select
                value={currentUser.status}
                onChange={(e) => onUpdateStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 focus:border-blue-500 font-sans font-medium"
              >
                <option value="online">Online & Active</option>
                <option value="offline">Offline / Standby</option>
                <option value="busy">Busy / Deep Work</option>
                <option value="away">Away / Idle</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
            Enterprise Directory ({usersProfileList.length})
          </h3>
        </div>

        <div className="p-2 divide-y divide-slate-100 max-h-60 overflow-y-auto">
          {usersProfileList.map((user) => (
            <div key={user.id} className="py-2 px-1 hover:bg-slate-50/50 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div>
                  <span className="font-semibold text-slate-900 block font-sans">{user.displayName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{user.email}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-medium text-blue-600 block">{user.role}</span>
                <span className={`inline-block w-2 h-2 rounded-full border-2 border-white ${
                  user.status === "online" ? "bg-green-500" :
                  user.status === "away" ? "bg-amber-500" :
                  user.status === "busy" ? "bg-red-500" : "bg-slate-400"
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
