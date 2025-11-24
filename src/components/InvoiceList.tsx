import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, Link as HeroLink, Card, CardBody, User } from '@heroui/react';
import { InvoiceData } from '../types';
import { ArrowUp, ArrowDown, CheckCircle, CircleDollarSign, FileText, Plus } from 'lucide-react';
import { SortableInvoiceKeys } from '../pages/Dashboard';

interface InvoiceListProps {
  invoices: InvoiceData[];
  onDelete: (id: string) => void;
  onStatusToggle: (id: string) => void;
  requestSort: (key: SortableInvoiceKeys) => void;
  sortConfig: { key: SortableInvoiceKeys; direction: 'ascending' | 'descending' } | null;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onDelete, onStatusToggle, requestSort, sortConfig }) => {
  if (invoices.length === 0) {
    return (
      <Card className="border-none bg-content1">
        <CardBody className="flex flex-col items-center justify-center py-20 px-6">
          <div className="mb-6 p-4 rounded-full bg-default-100">
            <FileText className="h-8 w-8 text-default-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Keine Rechnungen gefunden</h3>
          <p className="text-default-400 text-sm mb-8 text-center max-w-md">
            Erstelle deine erste Rechnung, um zu beginnen.
          </p>
          <Button 
            as={Link} 
            to="/invoice/new" 
            className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg"
            radius="full"
            size="md"
            startContent={<Plus className="h-4 w-4 font-bold" />}
          >
            Erste Rechnung erstellen
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-content1">
      <Table 
        aria-label="Rechnungen Tabelle"
        selectionMode="none"
        removeWrapper
      >
        <TableHeader>
          <TableColumn>
            <button onClick={() => requestSort('status')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Status
              {sortConfig?.key === 'status' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn>
            <button onClick={() => requestSort('createdAt')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Datum
              {sortConfig?.key === 'createdAt' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn>
            <button onClick={() => requestSort('debtorName')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Debitor
              {sortConfig?.key === 'debtorName' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn>
            <button onClick={() => requestSort('total')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Betrag
              {sortConfig?.key === 'total' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn>
            <button onClick={() => requestSort('unstructuredMessage')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Referenz
              {sortConfig?.key === 'unstructuredMessage' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn className="text-right">Aktionen</TableColumn>
        </TableHeader>
        <TableBody>
          {invoices.map(invoice => {
            const isPaid = invoice.status === 'paid';
            return (
              <TableRow key={invoice.id} className={isPaid ? 'opacity-60' : ''}>
                <TableCell>
                  <Chip 
                    color={isPaid ? 'success' : 'warning'} 
                    variant="flat" 
                    size="sm"
                  >
                    {isPaid ? 'Bezahlt' : 'Offen'}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-foreground">{new Date(invoice.createdAt).toLocaleDateString('de-CH')}</span>
                    {invoice.paidAt && (
                      <span className="text-xs text-default-400">
                        Bezahlt: {new Date(invoice.paidAt).toLocaleDateString('de-CH')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-foreground">{invoice.debtorName}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-foreground">
                    {invoice.currency} {Number(invoice.total).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-default-500">{invoice.unstructuredMessage}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      color={isPaid ? 'warning' : 'success'}
                      onClick={() => onStatusToggle(invoice.id)}
                      title={isPaid ? 'Als offen markieren' : 'Als bezahlt markieren'}
                    >
                      {isPaid ? <CircleDollarSign size={16} /> : <CheckCircle size={16} />}
                    </Button>
                    <HeroLink as={Link} to={`/invoice/edit/${invoice.id}`} color="primary" size="sm">
                      Bearbeiten
                    </HeroLink>
                    <Button
                      variant="light"
                      color="danger"
                      size="sm"
                      onClick={() => onDelete(invoice.id)}
                    >
                      Löschen
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default InvoiceList;
