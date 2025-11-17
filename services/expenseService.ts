import { ExpenseData } from '../types';
import { DEFAULT_EXPENSE_DATA } from '../constants';
import * as fileSystem from './fileSystem';

const EXPENSES_DIR = 'expenses';

export const getExpenses = async (): Promise<ExpenseData[]> => {
  try {
    const fileNames = await fileSystem.readDirectory(EXPENSES_DIR);
    const expenses = await Promise.all(
      fileNames.map(fileName => fileSystem.readFile<ExpenseData>(`${EXPENSES_DIR}/${fileName}`))
    );
    return expenses.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error reading expenses from file system', error);
    return [];
  }
};

export const getExpenseById = async (id: string): Promise<ExpenseData | undefined> => {
  try {
    return await fileSystem.readFile<ExpenseData>(`${EXPENSES_DIR}/${id}.json`);
  } catch (error) {
    console.error(`Error reading expense ${id} from file system`, error);
    return undefined;
  }
};

export const saveExpense = async (expense: ExpenseData): Promise<ExpenseData> => {
   try {
    await fileSystem.writeFile(`${EXPENSES_DIR}/${expense.id}.json`, expense);
  } catch (error) {
    console.error('Error saving expense to file system', error);
    throw error;
  }
  return expense;
};

export const createNewExpense = (projectId?: string): ExpenseData => {
  const newExpense: ExpenseData = {
    id: `exp_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    ...DEFAULT_EXPENSE_DATA,
  };
  if (projectId) {
    newExpense.projectId = projectId;
  }
  return newExpense;
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await fileSystem.deleteFile(`${EXPENSES_DIR}/${id}.json`);
  } catch (error) {
    console.error('Error deleting expense from file system', error);
    throw error;
  }
};