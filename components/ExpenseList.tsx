
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, ChevronsUpDown, CheckCircle, CircleDollarSign, CreditCard, Plus, Trash2, Pencil } from 'lucide-react';
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
                            ? `text-[#FC5445] group-hover:text-[#00E5FF]`
                            : 'text-[#64748B] group-hover:text-[#94A3B8]'
                    }`}
                />
            </button>
        </th>
    );
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onStatusToggle, requestSort, sortConfig }) => {
  if (expenses.length === 0) {
    return (
      <div className="relative overflow-hidden border border-[#1E2A36] bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 rounded-2xl p-12 backdrop-blur-xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FC5445]/5 to-[#F97316]/5" />

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#64748B]/50 to-[#1E2A36]/50 border-2 border-dashed border-[#64748B] flex items-center justify-center">
            <CircleDollarSign className="h-8 w-8 text-[#64748B]" />
          </div>
          <h3 className="text-xl font-semibold text-[#E2E8F0] mb-2">Keine Ausgaben gefunden</h3>
          <p className="text-[#94A3B8] mb-6">Erstellen Sie Ihre erste Ausgabe, um Ihre Kosten zu verfolgen.</p>

          <Link
            to="/expense/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30 transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Erste Ausgabe erfassen
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
              <SortableHeader sortKey="status" title="Status" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader sortKey="sortDate" title="Datum" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader sortKey="vendor" title="Anbieter" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader sortKey="amount" title="Betrag" requestSort={requestSort} sortConfig={sortConfig} />
              <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Typ</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2A36]">
            {expenses.map(item => {
              const isRecurring = item.type === 'recurring';
              const isPaid = !isRecurring && item.status === 'paid';
              const isDue = item.status === 'due';
              const isPlanned = isRecurring && item.status === 'planned';

              return (
                <tr key={item.id} className={`group hover:bg-[#16232B]/50 transition-all duration-300 ${isPaid ? 'opacity-75' : isPlanned ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      isPaid
                        ? 'bg-gradient-to-r from-[#A7F3D0]/10 to-[#34F0B1]/5 text-[#34F0B1] border-[#34F0B1]/30'
                        : isDue
                        ? 'bg-gradient-to-r from-[#F9174A]/10 to-[#FC5445]/5 text-[#FC5445] border-[#FC5445]/30'
                        : 'bg-gradient-to-r from-[#64748B]/10 to-[#64748B]/5 text-[#64748B] border-[#64748B]/30'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isPaid ? 'bg-[#34F0B1]' : isDue ? 'bg-[#FC5445]' : 'bg-[#64748B]'
                      }`} />
                      {isPaid ? 'Bezahlt' : isDue ? 'Fällig' : 'Geplant'}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#E2E8F0]">{new Date(item.sortDate).toLocaleDateString('de-CH')}</span>
                      {item.type === 'one-time' && item.paidAt && (
                        <span className="text-xs text-[#34F0B1]">
                          Bezahlt: {new Date(item.paidAt).toLocaleDateString('de-CH')}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-[#E2E8F0]">{item.vendor}</span>
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-lg font-mono font-bold bg-gradient-to-r from-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent">
                      {item.currency} {Number(item.amount).toFixed(2)}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium ${
                      isRecurring
                        ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30'
                        : 'bg-[#64748B]/10 text-[#64748B] border border-[#64748B]/30'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isRecurring ? 'bg-[#F97316]' : 'bg-[#64748B]'
                      }`} />
                      {isRecurring
                        ? (item.interval === 'monthly' ? 'Monatlich' : item.interval === 'quarterly' ? 'Quartalsweise' : 'Jährlich')
                        : 'Einmalig'
                      }
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      { (isDue || isPaid) &&
                          <button
                              onClick={() => onStatusToggle(item.id, item.type)}
                              className={`p-2 rounded-lg transition-all duration-300 ${
                                  isRecurring && isDue ? 'text-[#0066FF] hover:bg-[#0066FF]/10 hover:border-[#0066FF]/30 border border-transparent' :
                                  isPaid ? 'text-[#FBBF24] hover:bg-[#FBBF24]/10 hover:border-[#FBBF24]/30 border border-transparent' : 'text-[#34F0B1] hover:bg-[#34F0B1]/10 hover:border-[#34F0B1]/30 border border-transparent'
                              }`}
                              title={
                                  isRecurring && isDue ? 'Jetzt bezahlen & verbuchen' :
                                  isPaid ? 'Als fällig markieren' : 'Als bezahlt markieren'
                              }
                          >
                            {isRecurring && isDue ? <CreditCard size={16} /> : isPaid ? <CircleDollarSign size={16} /> : <CheckCircle size={16} />}
                          </button>
                      }
                      <Link
                        to={isRecurring ? `/recurring-expense/edit/${item.id}` : `/expense/edit/${item.id}`}
                        className="p-2 text-[#94A3B8] hover:text-[#00E5FF] rounded-lg hover:bg-[#00E5FF]/10 hover:border hover:border-[#00E5FF]/30 transition-all duration-300"
                        title="Bearbeiten"
                      >
                        <Pencil size={16} />
                      </Link>

                      <button
                        onClick={() => onDelete(item.id, item.type)}
                        className="p-2 text-[#94A3B8] hover:text-[#EF4444] rounded-lg hover:bg-[#EF4444]/10 hover:border hover:border-[#EF4444]/30 transition-all duration-300"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
