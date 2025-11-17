import React from 'react';
import { NavLink } from 'react-router-dom';

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
        <h1 className="text-2xl font-bold text-emerald-400">Mini ERP</h1>
        <p className="text-sm text-gray-400">für Freelancer</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <NavItem 
            to="/" 
            label="Übersicht" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a1 1 0 011-1h1a1 1 0 010 2H5a1 1 0 01-1-1zm12 0a1 1 0 00-1-1h-1a1 1 0 000 2h1a1 1 0 001-1zM4 10a1 1 0 011-1h1a1 1 0 010 2H5a1 1 0 01-1-1zm12 0a1 1 0 00-1-1h-1a1 1 0 000 2h1a1 1 0 001-1zM10 16a1 1 0 011-1h1a1 1 0 010 2h-1a1 1 0 01-1-1zM4 16a1 1 0 011-1h1a1 1 0 010 2H5a1 1 0 01-1-1zm12 0a1 1 0 00-1-1h-1a1 1 0 000 2h1a1 1 0 001-1z" /></svg>} 
        />
        <NavItem 
            to="/invoices" 
            label="Einnahmen" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.134 0V7.418zM12.5 9.75a2.5 2.5 0 01-1.134 0v-1.698c.22.07.412.164.567.267a2.5 2.5 0 01.567 1.431zM11 17a8 8 0 100-16 8 8 0 000 16z" /></svg>} 
        />
        <NavItem 
            to="/expenses" 
            label="Ausgaben" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h12v6a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 6a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 00-2-2H4z" clipRule="evenodd" /></svg>}
        />
      </nav>
    </div>
  );
};

export default Sidebar;