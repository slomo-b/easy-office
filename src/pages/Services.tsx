import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button } from '@heroui/react';
import { ServiceData } from '../types';
import { getServices, deleteService } from '../services/serviceService';
import ServiceList from '../components/ServiceList';
import { Search, Plus, Briefcase } from 'lucide-react';
import { useConfirm } from '../context/ConfirmContext';
import PageHeader from '../components/PageHeader';

export type SortableServiceKeys = keyof Pick<ServiceData, 'name' | 'price' | 'unit'>;

const Services = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableServiceKeys; direction: 'ascending' | 'descending' } | null>({
    key: 'name',
    direction: 'ascending',
  });
  const { confirm } = useConfirm();

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
    if (await confirm('Sind Sie sicher, dass Sie diese Leistung löschen möchten? Bestehende Zeiteinträge verlieren ihre Verknüpfung.')) {
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
      <PageHeader
        title="Leistungen"
        icon={<Briefcase className="h-6 w-6" />}
        actions={
          <Button
            as={Link}
            to="/service/new"
            className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium"
            startContent={<Plus size={18} />}
          >
            Neue Leistung anlegen
          </Button>
        }
      >
        <div className="relative max-w-md w-full mx-auto">
            <Input
              placeholder="Leistungen durchsuchen..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                  <Search className="h-4 w-4 text-[#94A3B8]" />
              }
              classNames={{
                input: "bg-[#16232B] text-[#E2E8F0] placeholder:text-[#64748B]",
                inputWrapper: "bg-[#16232B] border border-[#2A3C4D] hover:border-[#00E5FF]/50 focus-within:border-[#00E5FF] h-10",
              }}
            />
            {searchQuery && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium shadow-lg pointer-events-none">
                {filteredAndSortedServices.length}
              </div>
            )}
        </div>
      </PageHeader>

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
