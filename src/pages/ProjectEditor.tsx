
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectData, CustomerData, ServiceData, TaskData, ExpenseData, TaskStatus, TaskTimeLog, SettingsData } from '../types';
import { getProjectById, saveProject, createNewProject, deleteProject } from '../services/projectService';
import { getCustomers } from '../services/customerService';
import { getServices } from '../services/serviceService';
import { getSettings } from '../services/settingsService';
import { getExpenses, createNewExpense, saveExpense } from '../services/expenseService';
import ExpenseForm from '../components/ExpenseForm';
import { createInvoiceFromProject } from '../services/invoiceService';
import { Play, Square, PlusCircle, Trash2, Clock, ChevronDown } from 'lucide-react';

const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const calculateTaskDuration = (task: TaskData): number => {
    return task.timeLogs.reduce((sum, log) => {
        if (log.endTime) {
            return sum + (new Date(log.endTime).getTime() - new Date(log.startTime).getTime());
        }
        return sum;
    }, 0);
};

const ProjectEditor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [project, setProject] = useState<ProjectData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [services, setServices] = useState<ServiceData[]>([]);
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [projectExpenses, setProjectExpenses] = useState<ExpenseData[]>([]);
    
    // Task management state
    const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showNewTaskFormForStatus, setShowNewTaskFormForStatus] = useState<TaskStatus | null>(null);
    const [newTaskData, setNewTaskData] = useState({ title: '', description: '', serviceId: '' });

    // Modal states
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [newExpenseData, setNewExpenseData] = useState<ExpenseData | null>(null);
    const [isTimeLogModalOpen, setIsTimeLogModalOpen] = useState(false);
    const [selectedTaskForTimeLog, setSelectedTaskForTimeLog] = useState<TaskData | null>(null);
    const [manualLog, setManualLog] = useState({ start: '', end: '' });

    const loadData = useCallback(async () => {
        const [fetchedCustomers, fetchedServices, allExpenses, fetchedSettings] = await Promise.all([getCustomers(), getServices(), getExpenses(), getSettings()]);
        setCustomers(fetchedCustomers);
        setServices(fetchedServices);
        setSettings(fetchedSettings);

        if (id) {
            const existingProject = await getProjectById(id);
            if (existingProject) {
                setProject(existingProject);
                setProjectExpenses(allExpenses.filter(e => e.projectId === id));
                // Check for a running timer on load
                for (const task of existingProject.tasks) {
                    if (task.timeLogs.some(log => log.endTime === null)) {
                        setActiveTimerTaskId(task.id);
                        break;
                    }
                }
            } else {
                navigate('/projects');
            }
        } else {
            setProject(createNewProject());
        }
    }, [id, navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        let interval: number | undefined;
        if (activeTimerTaskId && project) {
            const activeTask = project.tasks.find(t => t.id === activeTimerTaskId);
            const runningLog = activeTask?.timeLogs.find(l => l.endTime === null);
            if (runningLog) {
                const alreadyTrackedMs = calculateTaskDuration(activeTask);
                interval = window.setInterval(() => {
                    const elapsed = new Date().getTime() - new Date(runningLog.startTime).getTime();
                    setElapsedTime(alreadyTrackedMs + elapsed);
                }, 1000);
            }
        }
        return () => clearInterval(interval);
    }, [activeTimerTaskId, project]);
    
    const handleProjectDataChange = (field: keyof Omit<ProjectData, 'tasks'>, value: string) => {
        setProject(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleTimerToggle = (taskId: string) => {
        if (!project) return;
        
        const now = new Date().toISOString();
        let updatedTasks = [...project.tasks];
        let newActiveTimerTaskId = activeTimerTaskId;

        // Stop currently running timer if there is one
        if (activeTimerTaskId) {
            const previouslyActiveTaskIndex = updatedTasks.findIndex(t => t.id === activeTimerTaskId);
            if (previouslyActiveTaskIndex !== -1) {
                const logs = updatedTasks[previouslyActiveTaskIndex].timeLogs;
                const runningLogIndex = logs.findIndex(l => l.endTime === null);
                if (runningLogIndex !== -1) {
                    logs[runningLogIndex].endTime = now;
                }
            }
            newActiveTimerTaskId = null;
        }

        // If the clicked timer wasn't the active one, start it
        if (activeTimerTaskId !== taskId) {
            const currentTaskIndex = updatedTasks.findIndex(t => t.id === taskId);
            if (currentTaskIndex !== -1) {
                updatedTasks[currentTaskIndex].timeLogs.push({ startTime: now, endTime: null });
                newActiveTimerTaskId = taskId;
            }
        }

        setProject({ ...project, tasks: updatedTasks });
        setActiveTimerTaskId(newActiveTimerTaskId);
        if (newActiveTimerTaskId === null) {
            setElapsedTime(0);
        }
    };
    
    const handleTaskDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
        e.preventDefault();
        if(!project) return;
        
        const taskId = e.dataTransfer.getData('taskId');
        const taskIndex = project.tasks.findIndex(t => t.id === taskId);

        if(taskIndex > -1 && project.tasks[taskIndex].status !== newStatus) {
            const updatedTasks = [...project.tasks];
            updatedTasks[taskIndex].status = newStatus;
            setProject({...project, tasks: updatedTasks});
        }
    };

    const handleCreateTask = () => {
        if (!project || !showNewTaskFormForStatus || !newTaskData.title || !newTaskData.serviceId) {
            alert("Bitte Titel und Leistung angeben.");
            return;
        }
        const newTask: TaskData = {
            id: `task_${new Date().getTime()}`,
            status: showNewTaskFormForStatus,
            timeLogs: [],
            ...newTaskData
        };
        setProject({ ...project, tasks: [...project.tasks, newTask] });
        setShowNewTaskFormForStatus(null);
        setNewTaskData({ title: '', description: '', serviceId: '' });
    };

    const handleDeleteTask = (taskId: string) => {
        if (project && window.confirm("Aufgabe endgültig löschen?")) {
            if (activeTimerTaskId === taskId) {
                setActiveTimerTaskId(null);
                setElapsedTime(0);
            }
            const updatedTasks = project.tasks.filter(t => t.id !== taskId);
            setProject({ ...project, tasks: updatedTasks });
        }
    };

    const handleSave = async () => {
        if (project) {
            if(!project.name || !project.customerId) {
                alert("Bitte Projektname und Kunde angeben.");
                return;
            }
            setIsSaving(true);
            // Ensure no timers are left running when saving and closing
            let projectToSave = project;
            if (activeTimerTaskId) {
                const activeTask = projectToSave.tasks.find(t => t.id === activeTimerTaskId);
                const runningLog = activeTask?.timeLogs.find(l => l.endTime === null);
                if (runningLog) {
                    runningLog.endTime = new Date().toISOString();
                }
            }
            await saveProject(projectToSave);
            setIsSaving(false);
            navigate('/projects');
        }
    };
    
    const handleDeleteProject = async () => {
        if (project && id && window.confirm("Sind Sie sicher, dass Sie dieses Projekt und alle zugehörigen Aufgaben löschen möchten?")) {
            await deleteProject(id);
            navigate('/projects');
        }
    };

    const handleCreateInvoice = async () => {
        if (!project || !settings) return;
        const customer = customers.find(c => c.id === project.customerId);
        if (!customer) {
            alert("Kunde nicht gefunden. Rechnung kann nicht erstellt werden.");
            return;
        }

        setIsSaving(true);
        try {
            // FIX: Pass the required 'settings' object to the service function.
            const newInvoice = await createInvoiceFromProject(project, customer, services, projectExpenses, settings);
            navigate(`/invoice/edit/${newInvoice.id}`);
        } catch (error) {
            console.error("Failed to create invoice from project", error);
            alert("Rechnung konnte nicht erstellt werden.");
        } finally {
            setIsSaving(false);
        }
    };
    
    // --- Modal Handlers ---

    const openNewExpenseModal = () => {
        if (!project) return;
        setNewExpenseData(createNewExpense(project.id));
        setIsExpenseModalOpen(true);
    };

    const handleSaveExpense = async () => {
        if (!newExpenseData) return;
        await saveExpense(newExpenseData);
        setIsExpenseModalOpen(false);
        setNewExpenseData(null);
        // Reload expenses
        const allExpenses = await getExpenses();
        setProjectExpenses(allExpenses.filter(e => e.projectId === id));
    };
    
    const openManualTimeLogModal = (task: TaskData) => {
        setSelectedTaskForTimeLog(task);
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        // Format for datetime-local input: YYYY-MM-DDTHH:mm
        const formatForInput = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setManualLog({ start: formatForInput(oneHourAgo), end: formatForInput(now) });
        setIsTimeLogModalOpen(true);
    };

    const handleSaveManualLog = () => {
        if (!project || !selectedTaskForTimeLog || !manualLog.start || !manualLog.end) return;
        
        const startDate = new Date(manualLog.start);
        const endDate = new Date(manualLog.end);

        if (endDate <= startDate) {
            alert("Endzeitpunkt muss nach dem Startzeitpunkt liegen.");
            return;
        }
        
        const newLog: TaskTimeLog = {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
        };
        
        const updatedTasks = project.tasks.map(task => {
            if (task.id === selectedTaskForTimeLog.id) {
                return { ...task, timeLogs: [...task.timeLogs, newLog] };
            }
            return task;
        });
        
        setProject({ ...project, tasks: updatedTasks });
        setIsTimeLogModalOpen(false);
    };


    if (!project || !settings) return <div className="text-center p-10">Lade Projektdaten...</div>;
    
    const totalProjectHours = project.tasks.reduce((sum, task) => sum + calculateTaskDuration(task), 0) / (1000 * 60 * 60);

    // FIX: Explicitly type TaskCard as a React.FC to correctly handle the 'key' prop.
    interface TaskCardProps {
        task: TaskData;
    }
    const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
        const service = services.find(s => s.id === task.serviceId);
        const isRunning = activeTimerTaskId === task.id;
        const totalDurationMs = isRunning ? elapsedTime : calculateTaskDuration(task);

        return (
            <div 
                draggable 
                onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                className={`bg-gray-700 p-3 rounded-md shadow-lg space-y-2 relative ${isRunning ? 'ring-2 ring-emerald-500' : ''}`}
            >
                <div className="flex justify-between items-start">
                    <p className="font-bold text-white text-sm pr-10">{task.title}</p>
                    <button onClick={() => handleDeleteTask(task.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400"><Trash2 size={14}/></button>
                </div>
                
                <p className="text-xs text-gray-400">{task.description}</p>
                <div className="mt-3 pt-3 border-t border-gray-600/50 space-y-2">
                    <div>
                        <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">{service?.name || '...'}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                        <span className="text-base font-mono text-white">{formatDuration(totalDurationMs)}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => openManualTimeLogModal(task)} className="p-1 text-gray-400 hover:text-white" title="Zeit manuell erfassen">
                                <Clock size={16} />
                            </button>
                            <button 
                                onClick={() => handleTimerToggle(task.id)} 
                                className={`flex items-center justify-center h-7 w-7 rounded-full ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`} 
                                title={isRunning ? 'Timer stoppen' : 'Timer starten'}
                            >
                                {isRunning ? <Square size={14} fill="white" /> : <Play size={14} fill="white" className="ml-0.5"/>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const taskColumns: { status: TaskStatus, title: string }[] = [
        { status: 'todo', title: 'To Do' },
        { status: 'in-progress', title: 'In Arbeit' },
        { status: 'done', title: 'Erledigt' }
    ];

    return (
        <div>
            {/* --- Modals --- */}
            {isExpenseModalOpen && newExpenseData && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                     <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
                         <h3 className="text-xl font-bold mb-4 text-white">Neue Projektausgabe</h3>
                         <ExpenseForm 
                             data={newExpenseData}
                             onDataChange={(field, value) => setNewExpenseData(prev => prev ? { ...prev, [field]: value } : null)}
                         />
                         <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setIsExpenseModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Abbrechen</button>
                            <button onClick={handleSaveExpense} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg">Speichern</button>
                         </div>
                     </div>
                </div>
            )}
            {isTimeLogModalOpen && selectedTaskForTimeLog && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4 text-white">Zeit manuell erfassen für: <span className="text-emerald-400">{selectedTaskForTimeLog.title}</span></h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-sm text-gray-400 mb-1 block">Startzeitpunkt</label>
                          <input type="datetime-local" value={manualLog.start} onChange={e => setManualLog(prev => ({...prev, start: e.target.value}))} className="w-full bg-gray-700 border-gray-600 rounded px-3 py-2 text-white"/>
                      </div>
                      <div>
                          <label className="text-sm text-gray-400 mb-1 block">Endzeitpunkt</label>
                          <input type="datetime-local" value={manualLog.end} onChange={e => setManualLog(prev => ({...prev, end: e.target.value}))} className="w-full bg-gray-700 border-gray-600 rounded px-3 py-2 text-white"/>
                      </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setIsTimeLogModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Abbrechen</button>
                    <button onClick={handleSaveManualLog} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg">Speichern</button>
                 </div>
                </div>
              </div>
            )}

            {/* --- Page Content --- */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">{id ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}</h2>
                <div className="flex items-center gap-4">
                    {id && <button onClick={handleDeleteProject} className="text-red-500 hover:text-red-400 font-bold py-2 px-4 rounded-lg">Löschen</button>}
                    <button onClick={handleSave} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500">
                        {isSaving ? 'Speichern...' : 'Speichern & Schliessen'}
                    </button>
                </div>
            </div>

            <main className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">Aufgaben ({totalProjectHours.toFixed(2)}h)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {taskColumns.map(({ status, title }) => (
                               <div key={status} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleTaskDrop(e, status)} className="bg-gray-900/50 p-3 rounded-lg flex flex-col gap-3">
                                   <h4 className="text-center font-semibold text-gray-300 mb-2">{title}</h4>
                                   {project.tasks.filter(t => t.status === status).map(task => <TaskCard key={task.id} task={task} />)}
                                   
                                   {showNewTaskFormForStatus === status ? (
                                       <div className="bg-gray-700 p-3 rounded-md space-y-2">
                                           <input type="text" placeholder="Aufgabentitel" value={newTaskData.title} onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} className="w-full bg-gray-600 border-gray-500 rounded px-2 py-1 text-sm"/>
                                           <textarea placeholder="Beschreibung (optional)" value={newTaskData.description} onChange={e => setNewTaskData({...newTaskData, description: e.target.value})} className="w-full bg-gray-600 border-gray-500 rounded px-2 py-1 text-sm" rows={2}></textarea>
                                           <div className="relative">
                                            <select value={newTaskData.serviceId} onChange={e => setNewTaskData({...newTaskData, serviceId: e.target.value})} className="w-full appearance-none bg-gray-600 border-gray-500 rounded px-2 py-1 pr-8 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition">
                                                <option value="">-- Leistung --</option>
                                                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                <ChevronDown size={16} />
                                            </div>
                                           </div>
                                           <div className="flex justify-end gap-2">
                                               <button onClick={() => setShowNewTaskFormForStatus(null)} className="text-gray-400 text-xs">Abbrechen</button>
                                               <button onClick={handleCreateTask} className="bg-emerald-500 text-white px-2 py-1 text-xs rounded">Speichern</button>
                                           </div>
                                       </div>
                                   ) : (
                                       <button onClick={() => setShowNewTaskFormForStatus(status)} className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-emerald-400 p-2 rounded-lg border-2 border-dashed border-gray-600 hover:border-emerald-500 transition-colors">
                                           <PlusCircle size={16}/> Neue Aufgabe
                                       </button>
                                   )}
                               </div>
                           ))}
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
                            <h3 className="text-lg font-semibold text-emerald-400">Projektausgaben</h3>
                            {id && <button onClick={openNewExpenseModal} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-3 rounded-md text-sm">Neue Ausgabe</button>}
                        </div>
                        <ul className="space-y-2">
                           {projectExpenses.map(expense => (
                               <li key={expense.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm">
                                   <div>
                                       <p className="font-semibold text-white">{expense.vendor}</p>
                                       <p className="text-gray-400 text-xs">{expense.description}</p>
                                   </div>
                                   <div className="text-right">
                                        <p className="font-mono text-white">{expense.currency} {Number(expense.amount).toFixed(2)}</p>
                                        <p className="text-gray-400 text-xs">{new Date(expense.date).toLocaleDateString('de-CH')}</p>
                                   </div>
                               </li>
                           ))}
                           {projectExpenses.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Keine Ausgaben für dieses Projekt erfasst.</p>}
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg shadow-md h-fit">
                    <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">Projektdetails</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 text-sm font-medium text-gray-400 block">Projektname</label>
                            <input type="text" value={project.name} onChange={e => handleProjectDataChange('name', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"/>
                        </div>
                        <div>
                            <label className="mb-1 text-sm font-medium text-gray-400 block">Kunde</label>
                            <div className="relative">
                              <select value={project.customerId} onChange={e => handleProjectDataChange('customerId', e.target.value)} className="w-full appearance-none bg-gray-700 border border-gray-600 rounded-md px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
                                  <option value="">-- Kunde auswählen --</option>
                                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                  <ChevronDown size={20} />
                              </div>
                            </div>
                        </div>
                         <div>
                            <label className="mb-1 text-sm font-medium text-gray-400 block">Status</label>
                            <div className="relative">
                              <select value={project.status} onChange={e => handleProjectDataChange('status', e.target.value as ProjectData['status'])} className="w-full appearance-none bg-gray-700 border border-gray-600 rounded-md px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
                                  <option value="open">Offen</option>
                                  <option value="in-progress">In Arbeit</option>
                                  <option value="done">Erledigt</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                  <ChevronDown size={20} />
                              </div>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 text-sm font-medium text-gray-400 block">Beschreibung</label>
                            <textarea value={project.description} onChange={e => handleProjectDataChange('description', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" rows={4}></textarea>
                        </div>
                         {id && (
                            <div className="border-t border-gray-700 pt-4">
                                <button onClick={handleCreateInvoice} disabled={isSaving || project.tasks.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    Rechnung erstellen
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectEditor;
