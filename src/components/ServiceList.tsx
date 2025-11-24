import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Link as HeroLink, Card, CardBody } from '@heroui/react';
import { ServiceData } from '../types';
import { ArrowUp, ArrowDown, ClipboardList, Plus } from 'lucide-react';
import { SortableServiceKeys } from '../pages/Services';

interface ServiceListProps {
  services: ServiceData[];
  onDelete: (id: string) => void;
  requestSort: (key: SortableServiceKeys) => void;
  sortConfig: { key: SortableServiceKeys; direction: 'ascending' | 'descending' } | null;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, onDelete, requestSort, sortConfig }) => {
  if (services.length === 0) {
    return (
      <Card className="border-none bg-content1">
        <CardBody className="flex flex-col items-center justify-center py-20 px-6">
          <div className="mb-6 p-4 rounded-full bg-default-100">
            <ClipboardList className="h-8 w-8 text-default-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Keine Leistungen gefunden</h3>
          <p className="text-default-400 text-sm mb-8 text-center max-w-md">
            Lege deine erste Leistung an, um zu beginnen.
          </p>
          <Button 
            as={Link} 
            to="/service/new" 
            color="primary"
            size="md"
            className="w-fit"
            startContent={<Plus className="h-4 w-4" />}
          >
            Erste Leistung anlegen
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-content1">
      <Table 
        aria-label="Leistungen Tabelle"
        selectionMode="none"
        removeWrapper
      >
        <TableHeader>
          <TableColumn>
            <button onClick={() => requestSort('name')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Name
              {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn>
            <button onClick={() => requestSort('price')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Preis
              {sortConfig?.key === 'price' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn>
            <button onClick={() => requestSort('unit')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Einheit
              {sortConfig?.key === 'unit' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn className="text-right">Aktionen</TableColumn>
        </TableHeader>
        <TableBody>
          {services.map(service => (
            <TableRow key={service.id}>
              <TableCell>
                <span className="text-foreground font-medium">{service.name}</span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-foreground">
                  CHF {Number(service.price).toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-default-500">{service.unit}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <HeroLink as={Link} to={`/service/edit/${service.id}`} color="primary" size="sm">
                    Bearbeiten
                  </HeroLink>
                  <Button
                      variant="light"
                      color="danger"
                      size="sm"
                      onClick={() => onDelete(service.id)}
                  >
                    Löschen
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ServiceList;
