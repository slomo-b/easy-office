import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Spinner } from '@heroui/react';
import { ServiceData } from '../types';
import { getServices, deleteService } from '../services/serviceService';
import ServiceList from '../components/ServiceList';
import { Search, Plus } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Leistungen / Kostenstellen</h2>
          <p className="text-default-500">Verwalte deine Leistungen und Kostenstellen</p>
        </div>
        <Button
          as={Link}
          to="/service/new"
          color="primary"
          size="lg"
          startContent={<Plus className="h-5 w-5" />}
        >
          Neue Leistung anlegen
        </Button>
      </div>
      
      <div className="max-w-sm">
        <Input
          type="text"
          placeholder="Leistungen durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="h-4 w-4 text-default-400" />}
          variant="bordered"
        />
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
