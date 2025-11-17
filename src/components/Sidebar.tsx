import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  TrendingUp,
  TrendingDown,
  Users,
  ClipboardList,
  Settings,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const NavItem = ({ to, icon, label, isCollapsed }: { to: string, icon: React.ReactNode, label: string, isCollapsed: boolean }) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
          isActive ? 'bg-emerald-500 text-white' : ''
        } ${isCollapsed ? 'justify-center' : ''}`
      }
    >
        {icon}
        {!isCollapsed && <span className="ml-3 whitespace-nowrap">{label}</span>}
    </NavLink>
);

const Sidebar = ({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (isCollapsed: boolean) => void }) => {
  return (
    <div className={`bg-gray-800 shadow-lg flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center border-b border-gray-700 transition-all duration-300 h-[69px] ${isCollapsed ? 'justify-center' : 'px-4'}`}>
        <img src="/src/logo.svg" alt="easy office Logo" className="h-9 w-9 flex-shrink-0" />
        {!isCollapsed && (
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-emerald-400 whitespace-nowrap">easy office</h1>
            <p className="text-sm text-gray-400 whitespace-nowrap">für Freelancer</p>
          </div>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <NavItem 
            isCollapsed={isCollapsed}
            to="/" 
            label="Übersicht" 
            icon={<LayoutDashboard className="h-5 w-5 flex-shrink-0" />} 
        />
         <NavItem 
            isCollapsed={isCollapsed}
            to="/projects" 
            label="Projekte" 
            icon={<KanbanSquare className="h-5 w-5 flex-shrink-0" />}
        />
        <NavItem 
            isCollapsed={isCollapsed}
            to="/invoices" 
            label="Einnahmen" 
            icon={<TrendingUp className="h-5 w-5 flex-shrink-0" />} 
        />
        <NavItem 
            isCollapsed={isCollapsed}
            to="/expenses" 
            label="Ausgaben" 
            icon={<TrendingDown className="h-5 w-5 flex-shrink-0" />}
        />
        <NavItem 
            isCollapsed={isCollapsed}
            to="/customers" 
            label="Kunden" 
            icon={<Users className="h-5 w-5 flex-shrink-0" />}
        />
         <NavItem 
            isCollapsed={isCollapsed}
            to="/services" 
            label="Leistungen" 
            icon={<ClipboardList className="h-5 w-5 flex-shrink-0" />}
        />
      </nav>
      <div className="px-2 py-4 border-t border-gray-700 space-y-2">
         <NavItem 
            isCollapsed={isCollapsed}
            to="/settings" 
            label="Einstellungen" 
            icon={<Settings className="h-5 w-5 flex-shrink-0" />}
        />
        <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full px-4 py-2 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200"
            aria-label={isCollapsed ? "Seitenleiste ausklappen" : "Seitenleiste einklappen"}
        >
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;