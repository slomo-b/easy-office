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
} from 'lucide-react';

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
          isActive ? 'bg-emerald-500 text-white' : ''
        }`
      }
    >
        {icon}
        {label}
    </NavLink>
);

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 shadow-lg flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-emerald-400">easy office</h1>
        <p className="text-sm text-gray-400">für Freelancer</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <NavItem 
            to="/" 
            label="Übersicht" 
            icon={<LayoutDashboard className="h-5 w-5 mr-3" />} 
        />
         <NavItem 
            to="/projects" 
            label="Projekte" 
            icon={<KanbanSquare className="h-5 w-5 mr-3" />}
        />
        <NavItem 
            to="/invoices" 
            label="Einnahmen" 
            icon={<TrendingUp className="h-5 w-5 mr-3" />} 
        />
        <NavItem 
            to="/expenses" 
            label="Ausgaben" 
            icon={<TrendingDown className="h-5 w-5 mr-3" />}
        />
        <NavItem 
            to="/customers" 
            label="Kunden" 
            icon={<Users className="h-5 w-5 mr-3" />}
        />
         <NavItem 
            to="/services" 
            label="Leistungen" 
            icon={<ClipboardList className="h-5 w-5 mr-3" />}
        />
      </nav>
      <div className="px-2 py-4 border-t border-gray-700">
         <NavItem 
            to="/settings" 
            label="Einstellungen" 
            icon={<Settings className="h-5 w-5 mr-3" />}
        />
      </div>
    </div>
  );
};

export default Sidebar;