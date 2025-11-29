import React from 'react';
import { Link } from 'react-router-dom';
import { ServiceData } from '../types';
import { ArrowUp, ArrowDown, ChevronsUpDown, Plus, Trash2, Pencil, ClipboardList } from 'lucide-react';
import { SortableServiceKeys } from '../pages/Services';

const SortableHeader: React.FC<{
  sortKey: SortableServiceKeys;
  title: string;
  requestSort: (key: SortableServiceKeys) => void;
  sortConfig: ServiceListProps['sortConfig'];
  className?: string;
}> = ({ sortKey, title, requestSort, sortConfig, className = '' }) => {
  const isSorted = sortConfig?.key === sortKey;
  const direction = sortConfig?.direction;
  const Icon = isSorted ? (direction === 'ascending' ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <th className={`px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider ${className}`}>
      <button
        onClick={() => requestSort(sortKey)}
        className="flex items-center gap-2 hover:text-[#E2E8F0] transition-colors group"
      >
        {title}
        <Icon
          size={12}
          className={`transition-colors ${
            isSorted
              ? `text-[#00E5FF] group-hover:text-[#34F0B1]`
              : 'text-[#64748B] group-hover:text-[#94A3B8]'
          }`}
        />
      </button>
    </th>
  );
};

interface ServiceListProps {
  services: ServiceData[];
  onDelete: (id: string) => void;
  requestSort: (key: SortableServiceKeys) => void;
  sortConfig: { key: SortableServiceKeys; direction: 'ascending' | 'descending' } | null;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, onDelete, requestSort, sortConfig }) => {
  if (services.length === 0) {
    return (
      <div className="relative overflow-hidden border border-[#1E2A36] bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 rounded-2xl p-12 backdrop-blur-xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 to-[#34F0B1]/5" />

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#64748B]/50 to-[#1E2A36]/50 border-2 border-dashed border-[#64748B] flex items-center justify-center">
            <ClipboardList className="h-8 w-8 text-[#64748B]" />
          </div>
          <h3 className="text-xl font-semibold text-[#E2E8F0] mb-2">Keine Leistungen gefunden</h3>
          <p className="text-[#94A3B8] mb-6">Lege deine erste Leistung an, um zu beginnen.</p>

          <Link
            to="/service/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30 transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Erste Leistung anlegen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-[#1E2A36] bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl rounded-2xl shadow-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#1E2A36]">
              <SortableHeader sortKey="name" title="Name" requestSort={requestSort} sortConfig={sortConfig} />
              <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Preis</th>
              <SortableHeader sortKey="unit" title="Einheit" requestSort={requestSort} sortConfig={sortConfig} />
              <th className="px-4 py-3 text-right text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2A36]">
            {services.map(service => (
              <tr key={service.id} className="group hover:bg-[#16232B]/50 transition-all duration-300">
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-[#E2E8F0]">{service.name}</span>
                </td>

                <td className="px-4 py-4">
                  <span className="text-sm font-mono font-medium text-[#34F0B1]">
                    CHF {Number(service.price).toFixed(2)}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className="text-sm text-[#64748B]">{service.unit}</span>
                </td>

                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/service/edit/${service.id}`}
                      className="p-2 text-[#94A3B8] hover:text-[#00E5FF] rounded-lg hover:bg-[#00E5FF]/10 hover:border hover:border-[#00E5FF]/30 transition-all duration-300"
                      title="Bearbeiten"
                    >
                      <Pencil size={16} />
                    </Link>

                    <button
                      onClick={() => onDelete(service.id)}
                      className="p-2 text-[#94A3B8] hover:text-[#EF4444] rounded-lg hover:bg-[#EF4444]/10 hover:border hover:border-[#EF4444]/30 transition-all duration-300"
                      title="Löschen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceList;
