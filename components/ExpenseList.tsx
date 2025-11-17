
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, ChevronsUpDown, CheckCircle, CircleDollarSign, CreditCard } from 'lucide-react';
import { CombinedExpense, SortableExpenseKeys } from '../pages/Expenses';

interface ExpenseListProps {
  expenses: CombinedExpense[];
  onDelete: (id: string, type: 'one-time' | 'recurring') => void;
  onStatusToggle: (id: string, type: 'one-time' | 'recurring') => void;
  requestSort: (key: SortableExpenseKeys) => void;
  sortConfig: { key: SortableExpenseKeys; direction: 'ascending' | 'descending' } | null;
}

const SortableHeader: React.FC<{
    sortKey: SortableExpenseKeys;
    title: string;
    requestSort: (key: SortableExpenseKeys) => void;
    sortConfig: ExpenseListProps['sortConfig'];
    className?: string;
}> = ({ sortKey, title, requestSort, sortConfig, className = '' }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction;
    const Icon = isSorted ? (direction === 'ascending' ? ArrowUp : ArrowDown) : ChevronsUpDown;

    return (
        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${className}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 hover:text-white transition-colors">
                {title}
                <Icon size={14} className={isSorted ? 'text-white' : 'text-gray-500'}/>
            </button>
        </th>
    );
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onStatusToggle, requestSort, sortConfig }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Keine Ausgaben für Ihre Suche gefunden.</p>
         <Link to="/expense/new" className="mt-4 inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
          Erste Ausgabe erfassen
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-700">
          <tr>
            <SortableHeader sortKey="status" title="Status" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="sortDate" title="Datum" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="vendor" title="Anbieter" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="amount" title="Betrag" requestSort={requestSort} sortConfig={sortConfig} />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Typ</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {expenses.map(item => {
            const isRecurring = item.type === 'recurring';
            const isPaid = !isRecurring && item.status === 'paid';
            const isDue = item.status === 'due';
            const isPlanned = isRecurring && item.status === 'planned';

            let statusBadge;
            if (isPaid) {
                statusBadge = <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">Bezahlt</span>;
            } else if (isDue) {
                statusBadge = <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">Fällig</span>;
            } else { // planned
                statusBadge = <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300">Geplant</span>;
            }
            
            return (
              <tr key={item.id} className={`transition-opacity ${isPaid ? 'opacity-60' : ''} ${isPlanned ? 'opacity-80' : ''} hover:opacity-100 hover:bg-gray-700/50`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{statusBadge}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex flex-col">
                        <span>{new Date(item.sortDate).toLocaleDateString('de-CH')}</span>
                        {item.type === 'one-time' && item.paidAt && <span className="text-xs text-gray-500">Bezahlt: {new Date(item.paidAt).toLocaleDateString('de-CH')}</span>}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.vendor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">{item.currency} {Number(item.amount).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {isRecurring 
                    ? <span className="capitalize">{item.interval === 'monthly' ? 'Monatlich' : item.interval === 'quarterly' ? 'Quartalsweise' : 'Jährlich'}</span>
                    : 'Einmalig'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  { (isDue || isPaid) && 
                      <button 
                          onClick={() => onStatusToggle(item.id, item.type)} 
                          className={`p-2 rounded-lg transition-colors ${
                              isRecurring && isDue ? 'text-blue-400 hover:bg-blue-500/20' : 
                              isPaid ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-green-400 hover:bg-green-500/20'
                          }`}
                          title={
                              isRecurring && isDue ? 'Jetzt bezahlen & verbuchen' : 
                              isPaid ? 'Als fällig markieren' : 'Als bezahlt markieren'
                          }
                      >
                        {isRecurring && isDue ? <CreditCard size={16} /> : isPaid ? <CircleDollarSign size={16} /> : <CheckCircle size={16} />}
                      </button>
                  }
                  <Link to={isRecurring ? `/recurring-expense/edit/${item.id}` : `/expense/edit/${item.id}`} className="text-emerald-400 hover:text-emerald-300 p-2 rounded-lg hover:bg-emerald-500/20">
                    Bearbeiten
                  </Link>
                  <button onClick={() => onDelete(item.id, item.type)} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/20">
                    Löschen
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;