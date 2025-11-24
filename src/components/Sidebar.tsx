import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Image } from '@heroui/react';
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
        `flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-primary text-primary-foreground shadow-lg' 
            : 'text-default-600 hover:bg-default-100 hover:text-default-foreground'
        } ${isCollapsed ? 'justify-center' : ''}`
      }
    >
        {icon}
        {!isCollapsed && <span className="ml-3 whitespace-nowrap font-medium">{label}</span>}
    </NavLink>
);

const Sidebar = ({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (isCollapsed: boolean) => void }) => {
  return (
    <div className={`bg-content1 shadow-lg flex flex-col transition-all duration-300 rounded-l-2xl border-r border-divider ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header mit Logo */}
      <div className={`flex items-center p-4 border-b border-divider transition-all duration-300 ${isCollapsed ? 'h-28 justify-center' : 'h-32'}`}>
        {isCollapsed ? (
          <Image
            src="/logo.png"
            alt="Easy Office Logo"
            width={40}
            height={40}
            className="rounded-lg"
            radius="lg"
          />
        ) : (
          <div className="flex items-center gap-3 w-full">
            <Image
              src="/logo.png"
              alt="Easy Office Logo"
              width={48}
              height={48}
              className="rounded-lg"
              radius="lg"
            />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-primary whitespace-nowrap">easy office</h1>
              <p className="text-sm text-default-500 whitespace-nowrap">für Freelancer</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
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
      
      {/* Footer */}
      <div className="px-2 py-4 border-t border-divider space-y-2">
         <NavItem 
            isCollapsed={isCollapsed}
            to="/settings" 
            label="Einstellungen" 
            icon={<Settings className="h-5 w-5 flex-shrink-0" />}
        />
        <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            isIconOnly
            variant="light"
            className="w-full justify-center"
            aria-label={isCollapsed ? "Seitenleiste ausklappen" : "Seitenleiste einklappen"}
        >
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;