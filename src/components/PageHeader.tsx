import React from 'react';

interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, actions, description, children }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6 bg-gradient-to-br from-[#111B22]/90 to-[#16232B]/90 p-6 rounded-2xl border border-[#1E2A36] shadow-xl backdrop-blur-xl relative overflow-hidden group">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#34F0B1]/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10 shrink-0">
          <div className="p-3.5 rounded-2xl bg-[#1E2A36]/50 border border-[#2A3C4D]/50 text-[#00E5FF] shadow-lg shadow-[#00E5FF]/10 backdrop-blur-md group-hover:scale-105 transition-transform duration-300">
            <div className="h-8 w-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                {icon}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent tracking-tight">
              {title}
            </h1>
            {description && (
                <p className="text-[#64748B] text-sm mt-1 font-medium">
                    {description}
                </p>
            )}
          </div>
        </div>

        {children && (
            <div className="flex-1 w-full md:px-4 relative z-10 order-3 md:order-2">
                {children}
            </div>
        )}

        {actions && (
          <div className="flex flex-wrap items-center gap-3 relative z-10 mt-4 md:mt-0 md:ml-auto shrink-0 order-2 md:order-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
