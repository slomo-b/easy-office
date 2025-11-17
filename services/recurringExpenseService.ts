import { RecurringExpenseData } from '../types';
import * as fileSystem from './fileSystem';

const RECURRING_EXPENSES_DIR = 'recurring-expenses';

export const DEFAULT_RECURRING_EXPENSE_DATA: Omit<RecurringExpenseData, 'id'> = {
    vendor: '',
    description: '',
    amount: '',
    currency: 'CHF',
    category: 'Software',
    interval: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    nextDueDate: new Date().toISOString().split('T')[0],
};

export const getRecurringExpenses = async (): Promise<RecurringExpenseData[]> => {
  try {
    const fileNames = await fileSystem.readDirectory(RECURRING_EXPENSES_DIR);
    const expenses = await Promise.all(
      fileNames.map(fileName => fileSystem.readFile<RecurringExpenseData>(`${RECURRING_EXPENSES_DIR}/${fileName}`))
    );
    return expenses.sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
  } catch (error) {
    console.error('Error reading recurring expenses from file system', error);
    return [];
  }
};

export const getRecurringExpenseById = async (id: string): Promise<RecurringExpenseData | undefined> => {
  try {
    return await fileSystem.readFile<RecurringExpenseData>(`${RECURRING_EXPENSES_DIR}/${id}.json`);
  } catch (error) {
    console.error(`Error reading recurring expense ${id} from file system`, error);
    return undefined;
  }
};

export const saveRecurringExpense = async (expense: RecurringExpenseData): Promise<RecurringExpenseData> => {
   try {
    await fileSystem.writeFile(`${RECURRING_EXPENSES_DIR}/${expense.id}.json`, expense);
  } catch (error) {
    console.error('Error saving recurring expense to file system', error);
    throw error;
  }
  return expense;
};

export const createNewRecurringExpense = (): RecurringExpenseData => {
  const startDate = new Date().toISOString().split('T')[0];
  return {
    id: `recexp_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    ...DEFAULT_RECURRING_EXPENSE_DATA,
    startDate: startDate,
    nextDueDate: startDate,
  };
};

export const deleteRecurringExpense = async (id: string): Promise<void> => {
  try {
    await fileSystem.deleteFile(`${RECURRING_EXPENSES_DIR}/${id}.json`);
  } catch (error) {
    console.error('Error deleting recurring expense from file system', error);
    throw error;
  }
};

export const calculateNextDueDate = (currentDueDate: string, interval: 'monthly' | 'quarterly' | 'yearly'): string => {
    const date = new Date(currentDueDate);
    // Set time to noon to avoid timezone issues with date changes
    date.setHours(12, 0, 0, 0);

    switch (interval) {
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    return date.toISOString().split('T')[0];
};