import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart, 
  BrainCircuit, 
  ShieldAlert, 
  CloudLightning, 
  Bot, 
  History, 
  Bookmark, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { ActivePage } from '../../types';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
}) => {
  const navItems: Array<{ id: ActivePage; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
    { id: 'risk', label: 'Risk', icon: ShieldAlert },
    { id: 'weather', label: 'Weather', icon: CloudLightning },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'events', label: 'Events', icon: History },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-[#08090e] border-r border-[#1e2333] transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header Logo */}
      <div>
        <div className="flex items-center justify-between p-3.5 border-b border-[#1e2333]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-[#0f1524] border border-[#00f0ff]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
              <span className="font-mono-data font-bold text-xs text-[#00f0ff] tracking-tighter">FIT</span>
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-[11px] font-bold tracking-wider text-slate-100 uppercase">
                  FINANCIAL
                </div>
                <div className="text-[10px] tracking-widest text-[#00f0ff] uppercase font-mono-data">
                  INTELLIGENCE
                </div>
                <div className="text-[9px] tracking-widest text-slate-400 uppercase font-mono-data">
                  TERMINAL
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-[#141824] rounded border border-transparent hover:border-[#1e2333] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded text-left transition-all text-xs font-medium group ${
                  isActive
                    ? 'bg-[#101422] text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.08)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0d101a] border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#00f0ff]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate tracking-wide font-sans">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-2.5 border-t border-[#1e2333] bg-[#06070b]">
        {!collapsed ? (
          <div className="space-y-2 text-[10px] font-mono-data">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot inline-block" />
                SYSTEM STATUS
              </span>
              <span className="text-emerald-400 font-semibold">ONLINE</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-cyan-400" />
                API LATENCY
              </span>
              <span className="text-slate-200">14ms</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>LAST SYNC</span>
              <span className="text-slate-300">09:42:15 UTC</span>
            </div>

            <div className="pt-2 border-t border-[#1a1f2e] flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#131826] border border-[#2b334a] flex items-center justify-center text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="overflow-hidden leading-tight">
                <div className="text-[11px] font-bold text-slate-200 truncate font-sans">QUANT ANALYST</div>
                <div className="text-[9px] text-slate-400 truncate">HEDGE FUND DEMO</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" title="System Status: ONLINE" />
            <span title="API Status: 14ms">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
