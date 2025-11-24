import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Link as HeroLink, Card, CardBody } from '@heroui/react';
import { CustomerData } from '../types';
import { ArrowUp, ArrowDown, Users, Plus } from 'lucide-react';
import { SortableCustomerKeys } from '../pages/Customers';

interface CustomerListProps {
  customers: CustomerData[];
  onDelete: (id: string) => void;
  requestSort: (key: SortableCustomerKeys) => void;
  sortConfig: { key: SortableCustomerKeys; direction: 'ascending' | 'descending' } | null;
}


const CustomerList: React.FC<CustomerListProps> = ({ customers, onDelete, requestSort, sortConfig }) => {
  if (customers.length === 0) {
    return (
      <Card className="border-none bg-content1">
        <CardBody className="flex flex-col items-center justify-center py-20 px-6">
          <div className="mb-6 p-4 rounded-full bg-default-100">
            <Users className="h-8 w-8 text-default-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Keine Kunden gefunden</h3>
          <p className="text-default-400 text-sm mb-8 text-center max-w-md">
            Lege deinen ersten Kunden an, um zu beginnen.
          </p>
          <Button 
            as={Link} 
            to="/customer/new" 
            color="primary"
            size="md"
            className="w-fit"
            startContent={<Plus className="h-4 w-4" />}
          >
            Ersten Kunden anlegen
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-content1">
      <Table 
        aria-label="Kunden Tabelle"
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
          <TableColumn>Adresse</TableColumn>
          <TableColumn>
            <button onClick={() => requestSort('city')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Ort
              {sortConfig?.key === 'city' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn className="text-right">Aktionen</TableColumn>
        </TableHeader>
        <TableBody>
          {customers.map(customer => (
            <TableRow key={customer.id}>
              <TableCell>
                <span className="text-foreground font-medium">{customer.name}</span>
              </TableCell>
              <TableCell>
                <span className="text-default-500">
                  {customer.street} {customer.houseNr}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-default-500">
                  {customer.zip} {customer.city}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <HeroLink as={Link} to={`/customer/edit/${customer.id}`} color="primary" size="sm">
                    Bearbeiten
                  </HeroLink>
                  <Button
                      variant="light"
                      color="danger"
                      size="sm"
                      onClick={() => onDelete(customer.id)}
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

export default CustomerList;
