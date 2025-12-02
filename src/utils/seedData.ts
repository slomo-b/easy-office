import { saveCustomer, createNewCustomer } from '../services/customerService';
import { saveService, createNewService } from '../services/serviceService';
import { saveProject, createNewProject } from '../services/projectService';
import { saveInvoice, createNewInvoice } from '../services/invoiceService';
import { saveExpense, createNewExpense } from '../services/expenseService';
import { saveRecurringExpense, createNewRecurringExpense } from '../services/recurringExpenseService';
import { getSettings } from '../services/settingsService';
import { CustomerData, ServiceData, ProjectData, TaskData, InvoiceData, ExpenseData, RecurringExpenseData } from '../types';

// Helper to get random date in last X days
const getDateDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
};

const getDateStringDaysAgo = (days: number) => {
    return getDateDaysAgo(days).split('T')[0];
};

export const seedMockData = async () => {
    const settings = await getSettings();
    if (!settings) {
        console.error("No settings found, cannot seed data.");
        return;
    }

    console.log("Starting seed...");

    // 1. Customers
    const cust1 = createNewCustomer();
    cust1.name = "TechStart GmbH";
    cust1.street = "Innovationsweg 1";
    cust1.zip = "8005";
    cust1.city = "Zürich";
    await saveCustomer(cust1);

    const cust2 = createNewCustomer();
    cust2.name = "Bäckerei Müller";
    cust2.street = "Dorfstrasse 12";
    cust2.zip = "3000";
    cust2.city = "Bern";
    await saveCustomer(cust2);

    const cust3 = createNewCustomer();
    cust3.name = "Consulting AG";
    cust3.street = "Finanzplatz 99";
    cust3.zip = "8001";
    cust3.city = "Zürich";
    await saveCustomer(cust3);

    // 2. Services
    const serv1 = createNewService();
    serv1.name = "Webentwicklung";
    serv1.price = 140;
    serv1.unit = 'Stunden';
    await saveService(serv1);

    const serv2 = createNewService();
    serv2.name = "Hosting Basic";
    serv2.price = 29;
    serv2.unit = 'Pauschal'; // Or generic unit
    await saveService(serv2);

    const serv3 = createNewService();
    serv3.name = "SEO Optimierung";
    serv3.price = 160;
    serv3.unit = 'Stunden';
    await saveService(serv3);

    // 3. Projects
    const proj1 = createNewProject();
    proj1.name = "Website Relaunch";
    proj1.customerId = cust1.id;
    proj1.status = 'in-progress';
    proj1.createdAt = getDateDaysAgo(30);
    
    // Tasks for proj1
    const task1: TaskData = {
        id: `task_${Date.now()}_1`,
        title: "Design Konzept",
        description: "Figma Mockups erstellen",
        status: 'done',
        serviceId: serv1.id,
        timeLogs: [{ startTime: getDateDaysAgo(25), endTime: getDateDaysAgo(25) }] // Simplified logs
    };
    // Add fake duration by manipulating logs if needed, but simple is fine
    task1.timeLogs = [
        { startTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), endTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() } // 3 hours
    ];
    
    const task2: TaskData = {
        id: `task_${Date.now()}_2`,
        title: "Frontend Entwicklung",
        description: "React Setup",
        status: 'in-progress',
        serviceId: serv1.id,
        timeLogs: []
    };
    proj1.tasks = [task1, task2];
    await saveProject(proj1);

    const proj2 = createNewProject();
    proj2.name = "Webshop Setup";
    proj2.customerId = cust2.id;
    proj2.status = 'done';
    proj2.createdAt = getDateDaysAgo(60);
    await saveProject(proj2);

    // 4. Invoices
    // Invoice 1: Paid, TechStart
    const inv1 = await createNewInvoice(settings);
    inv1.debtorName = cust1.name;
    inv1.debtorStreet = cust1.street;
    inv1.debtorZip = cust1.zip;
    inv1.debtorCity = cust1.city;
    inv1.status = 'paid';
    inv1.paidAt = getDateDaysAgo(5);
    inv1.items = [
        { description: "Anzahlung Website Relaunch", quantity: 1, unit: 'Pauschal', price: 2500, vatRate: 8.1 }
    ];
    await saveInvoice(inv1); // saveInvoice calculates totals

    // Invoice 2: Paid, Bäckerei Müller
    const inv2 = await createNewInvoice(settings);
    inv2.debtorName = cust2.name;
    inv2.debtorStreet = cust2.street;
    inv2.debtorZip = cust2.zip;
    inv2.debtorCity = cust2.city;
    inv2.status = 'paid';
    inv2.paidAt = getDateDaysAgo(40);
    inv2.items = [
        { description: "Shopify Setup", quantity: 10, unit: 'Stunden', price: 120, vatRate: 8.1 },
        { description: "Hosting Setup", quantity: 1, unit: 'Pauschal', price: 150, vatRate: 8.1 }
    ];
    // Force older date
    inv2.createdAt = getDateDaysAgo(45); 
    inv2.unstructuredMessage = `${new Date().getFullYear()}-0001`; // Fake number
    await saveInvoice(inv2);

    // Invoice 3: Open, Consulting AG
    const inv3 = await createNewInvoice(settings);
    inv3.debtorName = cust3.name;
    inv3.debtorStreet = cust3.street;
    inv3.debtorZip = cust3.zip;
    inv3.debtorCity = cust3.city;
    inv3.status = 'open';
    inv3.items = [
        { description: "Beratung Q3", quantity: 5, unit: 'Stunden', price: 200, vatRate: 8.1 }
    ];
    await saveInvoice(inv3);

    // 5. Expenses
    const exp1 = createNewExpense();
    exp1.vendor = "Digitec Galaxus";
    exp1.description = "Monitor";
    exp1.amount = 350;
    exp1.category = "Hardware";
    exp1.date = getDateStringDaysAgo(10);
    exp1.status = 'paid';
    exp1.paidAt = getDateStringDaysAgo(10);
    await saveExpense(exp1);

    const exp2 = createNewExpense();
    exp2.vendor = "SBB";
    exp2.description = "Halbtax";
    exp2.amount = 185;
    exp2.category = "Transport";
    exp2.date = getDateStringDaysAgo(100);
    exp2.status = 'paid';
    exp2.paidAt = getDateStringDaysAgo(100);
    await saveExpense(exp2);

    // 6. Recurring Expenses
    const rec1 = createNewRecurringExpense();
    rec1.vendor = "Adobe";
    rec1.description = "Creative Cloud";
    rec1.amount = 65.90;
    rec1.interval = 'monthly';
    rec1.startDate = getDateStringDaysAgo(365);
    await saveRecurringExpense(rec1);

    const rec2 = createNewRecurringExpense();
    rec2.vendor = "Vercel";
    rec2.description = "Hosting Pro";
    rec2.amount = 20;
    rec2.currency = 'CHF'; // Simplified
    rec2.interval = 'monthly';
    rec2.startDate = getDateStringDaysAgo(200);
    await saveRecurringExpense(rec2);

    const rec3 = createNewRecurringExpense();
    rec3.vendor = "GitHub";
    rec3.description = "Copilot";
    rec3.amount = 10;
    rec3.interval = 'monthly';
    rec3.startDate = getDateStringDaysAgo(150);
    await saveRecurringExpense(rec3);

    console.log("Seed complete!");
};
