import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, Link as HeroLink, Card, CardBody } from '@heroui/react';
import { ArrowUp, ArrowDown, CheckCircle, CircleDollarSign, CreditCard, TrendingDown, Plus } from 'lucide-react';
import { CombinedExpense, SortableExpenseKeys } from '../pages/Expenses';

interface ExpenseListProps {
  expenses: CombinedExpense[];
  onDelete: (id: string, type: 'one-time' | 'recurring') => void;
  onStatusToggle: (id: string, type: 'one-time' | 'recurring') => void;
  requestSort: (key: SortableExpenseKeys) => void;
  sortConfig: { key: SortableExpenseKeys; direction: 'ascending' | 'descending' } | null;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onStatusToggle, requestSort, sortConfig }) => {
  if (expenses.length === 0) {
    return (
      <Card className="border-none bg-content1">
        <CardBody className="flex flex-col items-center justify-center py-20 px-6">
          <div className="mb-6 p-4 rounded-full bg-default-100">
            <TrendingDown className="h-8 w-8 text-default-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Keine Ausgaben gefunden</h3>
          <p className="text-default-400 text-sm mb-8 text-center max-w-md">
            Erfasse deine erste Ausgabe, um zu beginnen.
          </p>
          <Button 
            as={Link} 
            to="/expense/new" 
            color="primary"
            size="md"
            className="w-fit"
            startContent={<Plus className="h-4 w-4" />}
          >
            Erste Ausgabe erfassen
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-content1">
      <Table 
        aria-label="Ausgaben Tabelle"
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
            <button onClick={() => requestSort('sortDate')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Datum
              {sortConfig?.key === 'sortDate' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn>
            <button onClick={() => requestSort('vendor')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Anbieter
              {sortConfig?.key === 'vendor' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn>
            <button onClick={() => requestSort('amount')} className="flex items-center gap-2 hover:text-foreground transition-colors text-default-500">
              Betrag
              {sortConfig?.key === 'amount' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </TableColumn>
          <TableColumn>Typ</TableColumn>
          <TableColumn className="text-right">Aktionen</TableColumn>
        </TableHeader>
        <TableBody>
          {expenses.map(item => {
            const isRecurring = item.type === 'recurring';
            const isPaid = !isRecurring && item.status === 'paid';
            const isDue = item.status === 'due';
            const isPlanned = isRecurring && item.status === 'planned';

            let statusColor: 'success' | 'warning' | 'default' = 'default';
            let statusText = 'Geplant';
            if (isPaid) {
              statusColor = 'success';
              statusText = 'Bezahlt';
            } else if (isDue) {
              statusColor = 'warning';
              statusText = 'Fällig';
            }
            
            return (
              <TableRow key={item.id} className={`${isPaid ? 'opacity-60' : ''} ${isPlanned ? 'opacity-80' : ''}`}>
                <TableCell>
                  <Chip color={statusColor} variant="flat" size="sm">
                    {statusText}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-foreground">{new Date(item.sortDate).toLocaleDateString('de-CH')}</span>
                    {item.type === 'one-time' && item.paidAt && (
                      <span className="text-xs text-default-400">
                        Bezahlt: {new Date(item.paidAt).toLocaleDateString('de-CH')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-foreground">{item.vendor}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-foreground">
                    {item.currency} {Number(item.amount).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-default-500 capitalize">
                    {isRecurring 
                      ? (item.interval === 'monthly' ? 'Monatlich' : item.interval === 'quarterly' ? 'Quartalsweise' : 'Jährlich')
                      : 'Einmalig'
                    }
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    { (isDue || isPaid) && 
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            color={isPaid ? 'warning' : 'success'}
                            onClick={() => onStatusToggle(item.id, item.type)}
                            title={
                                isRecurring && isDue ? 'Jetzt bezahlen & verbuchen' : 
                                isPaid ? 'Als fällig markieren' : 'Als bezahlt markieren'
                            }
                        >
                          {isRecurring && isDue ? <CreditCard size={16} /> : isPaid ? <CircleDollarSign size={16} /> : <CheckCircle size={16} />}
                        </Button>
                    }
                    <HeroLink as={Link} to={isRecurring ? `/recurring-expense/edit/${item.id}` : `/expense/edit/${item.id}`} color="primary" size="sm">
                      Bearbeiten
                    </HeroLink>
                    <Button
                        variant="light"
                        color="danger"
                        size="sm"
                        onClick={() => onDelete(item.id, item.type)}
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

export default ExpenseList;
