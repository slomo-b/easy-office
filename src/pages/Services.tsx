import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button } from '@heroui/react';
import { ServiceData } from '../types';
import { getServices, deleteService } from '../services/serviceService';
import ServiceList from '../components/ServiceList';
import { Search, Plus, Briefcase } from 'lucide-react';

export type SortableServiceKeys = keyof Pick<ServiceData, 'name' | 'price' | 'unit'>;

const Services = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableServiceKeys; direction: 'ascending' | 'descending' } | null>({
    key: 'name',
    direction: 'ascending',
  });

  const loadServices = useCallback(async () => {
    setLoading(true);
    const fetchedServices = await getServices();
    setServices(fetchedServices);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Leistung löschen möchten? Bestehende Zeiteinträge verlieren ihre Verknüpfung.')) {
      await deleteService(id);
      await loadServices();
    }
  };

  const requestSort = (key: SortableServiceKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedServices = useMemo(() => {
    let processableServices = [...services];

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      processableServices = processableServices.filter(service =>
        Object.values(service).some(value =>
          String(value).toLowerCase().includes(lowercasedQuery)
        )
      );
    }

    if (sortConfig !== null) {
      processableServices.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        } else {
            const stringA = String(aValue).toLowerCase();
            const stringB = String(bValue).toLowerCase();
            if (stringA < stringB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (stringA > stringB) return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return processableServices;
  }, [services, searchQuery, sortConfig]);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1E2A36] rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-10 w-64 bg-[#16232B] rounded-xl animate-pulse" />
              <div className="h-5 w-80 bg-[#64748B]/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Controls Skeleton */}
        <div className="space-y-4">
          <div className="h-12 w-full bg-[#16232B] rounded-xl animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-full bg-[#16232B] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
            <Briefcase className="h-8 w-8 text-[#00E5FF]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-1" style={{
                background: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.1',
                display: 'inline-block',
                paddingBottom: '2px'
            }}>
              Leistungen
            </h1>
          </div>
        </div>

        <Button
          as={Link}
          to="/service/new"
          className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30 self-start sm:self-center"
          radius="lg"
          size="lg"
          startContent={<Plus className="h-5 w-5" />}
        >
          Neue Leistung anlegen
        </Button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent mb-8" />

      {/* Enhanced Search Controls */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Search Input Container */}
        <div className="flex-1 relative min-w-0 bg-[#16232B] border border-[#1E2A36] rounded-2xl shadow-xl h-full">
          <div className="relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />
            <Input
              label=" "
              placeholder="Leistungen durchsuchen..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <div className="flex items-center justify-center h-6 w-6 my-auto">
                  <Search className="h-4 w-4 text-[#94A3B8] group-hover:text-[#E2E8F0] transition-colors duration-300" />
                </div>
              }
              className="w-full"
              classNames={{
                input: "bg-[#16232B] border-[#1E2A36] text-[#E2E8F0] placeholder:text-[#64748B] h-[42px] py-0",
                inputWrapper: "bg-[#16232B] border-2 border-[#1E2A36] hover:border-[#00E5FF]/40 focus:border-[#00E5FF] hover:shadow-lg hover:shadow-[#00E5FF]/10 focus:shadow-none transition-all duration-300 rounded-[16px] h-[52px] py-0",
                label: "text-[#94A3B8]",
                base: "relative h-[52px]",
                innerWrapper: "items-center h-[42px]"
              }}
            />

            {/* Search Results Indicator */}
            {searchQuery && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                {filteredAndSortedServices.length}
              </div>
            )}
          </div>
        </div>
      </div>

      <ServiceList
        services={filteredAndSortedServices}
        onDelete={handleDelete}
        requestSort={requestSort}
        sortConfig={sortConfig}
      />
    </div>
  );
};

export default Services;
