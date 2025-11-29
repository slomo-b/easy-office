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

const NavItem = ({ to, icon, label, isCollapsed }: { to: string, icon: React.ReactNode, label: string, isCollapsed: boolean }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div className="relative">
      <NavLink
        to={to}
        end={to === '/'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
            isActive 
              ? 'bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25' 
              : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#16232B]'
          } ${isCollapsed ? 'justify-center' : ''}`
        }
      >
          <div className="relative z-10">
            {icon}
          </div>
          
          {!isCollapsed && (
            <span className="ml-3 whitespace-nowrap font-medium relative z-10">
              {label}
            </span>
          )}
      </NavLink>
      
      {isCollapsed && isHovered && (
        <div className="absolute left-16 bg-[#111B22] text-[#E2E8F0] px-3 py-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50 border border-[#1E2A36]">
          {label}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#111B22] rotate-45 border-l border-b border-[#1E2A36]" />
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (isCollapsed: boolean) => void }) => {
  return (
    <div className={`bg-[#111B22] shadow-2xl flex flex-col transition-all duration-300 rounded-l-2xl border-r border-[#1E2A36] backdrop-blur-xl h-full ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo Header - feste Höhe */}
      <div className={`flex items-center p-4 border-b border-[#1E2A36] relative transition-all duration-300 ${
        isCollapsed ? 'justify-center h-20' : 'justify-start h-24'
      }`}>
        {/* Gradient Hintergrund */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#34F0B1]/5 via-[#00E5FF]/5 to-[#00D4FF]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/10 to-[#34F0B1]/5" />
        
        <div className={`relative z-10 flex items-center ${isCollapsed ? '' : 'gap-3 w-full'}`}>
          {isCollapsed ? (
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Easy Office Logo"
                width={40}
                height={40}
                className="rounded-lg shadow-lg"
                radius="lg"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/20 rounded-lg blur-sm opacity-50" />
            </div>
          ) : (
            <>
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Easy Office Logo"
                  width={48}
                  height={48}
                  className="rounded-lg shadow-lg"
                  radius="lg"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/20 rounded-lg blur-sm opacity-50" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] bg-clip-text text-transparent whitespace-nowrap">
                  easy office
                </h1>
                <p className="text-sm text-[#94A3B8] whitespace-nowrap">für Freelancer</p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Navigation - flexible Höhe mit Scrollbar */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
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
      
      {/* Footer - feste Höhe am unteren Rand */}
      <div className="px-3 py-4 border-t border-[#1E2A36] space-y-3 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent" />
        
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
            className="w-full justify-center bg-[#16232B] hover:bg-[#1E2A36] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E2A36] hover:border-[#00E5FF]/30 transition-all duration-300"
            aria-label={isCollapsed ? "Seitenleiste ausklappen" : "Seitenleiste einklappen"}
        >
            <div className="relative">
              {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/20 to-[#34F0B1]/20 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 blur-sm" />
            </div>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
