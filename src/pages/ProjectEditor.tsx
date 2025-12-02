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
import { Play, Square, PlusCircle, Trash2, Clock, ChevronDown, FolderOpen, Plus, X, Check, DollarSign, Save, Unlock, Zap, CheckCircle, FileText } from 'lucide-react';
import { Button, Input, Textarea, Chip, Select, SelectItem, Spinner } from '@heroui/react';
import { useConfirm } from '../context/ConfirmContext';
import PageHeader from '../components/PageHeader';

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
    const { confirm } = useConfirm();

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
            if (activeTask) {
                const runningLog = activeTask.timeLogs.find(l => l.endTime === null);
                if (runningLog) {
                    const alreadyTrackedMs = calculateTaskDuration(activeTask);
                    interval = window.setInterval(() => {
                        const elapsed = new Date().getTime() - new Date(runningLog.startTime).getTime();
                        setElapsedTime(alreadyTrackedMs + elapsed);
                    }, 1000);
                }
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

    const handleDeleteTask = async (taskId: string) => {
        if (project && await confirm("Aufgabe endgültig löschen?")) {
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
        if (project && id && await confirm("Sind Sie sicher, dass Sie dieses Projekt und alle zugehörigen Aufgaben löschen möchten?")) {
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
            const newInvoice = await createInvoiceFromProject(project, customer, services, projectExpenses, settings);
            navigate(`/invoice/edit/${newInvoice.id}`);
        } catch (error) {
            console.error("Failed to create invoice from project", error);
            alert("Rechnung konnte nicht erstellt werden.");
        } finally {
            setIsSaving(false);
        }
    };
    
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
        const allExpenses = await getExpenses();
        setProjectExpenses(allExpenses.filter(e => e.projectId === id));
    };
    
    const openManualTimeLogModal = (task: TaskData) => {
        if (project?.tasks.find(t => t.id === task.id)) {
            setSelectedTaskForTimeLog(task);
        }
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
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
        
        const newLog: TaskTimeLog = { startTime: startDate.toISOString(), endTime: endDate.toISOString() };
        const updatedTasks = project.tasks.map(task => 
            task.id === selectedTaskForTimeLog.id ? { ...task, timeLogs: [...task.timeLogs, newLog] } : task
        );
        setProject({ ...project, tasks: updatedTasks });
        setIsTimeLogModalOpen(false);
    };

    if (!project || !settings) {
      return (
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1E2A36] rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-10 w-64 bg-[#16232B] rounded-xl animate-pulse" />
                <div className="h-5 w-80 bg-[#64748B]/30 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <div className="h-96 bg-[#16232B] rounded-2xl animate-pulse" />
                <div className="h-64 bg-[#16232B] rounded-2xl animate-pulse" />
              </div>
              <div className="h-80 bg-[#16232B] rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      );
    }
    
    const totalProjectHours = project.tasks.reduce((sum, task) => sum + calculateTaskDuration(task), 0) / (1000 * 60 * 60);

    interface TaskCardProps { task: TaskData }
    const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
        const service = services.find(s => s.id === task.serviceId);
        const isRunning = activeTimerTaskId === task.id;
        const totalDurationMs = isRunning ? elapsedTime : calculateTaskDuration(task);

        return (
            <div 
                draggable 
                onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)} 
                className={`bg-[#16232B]/40 p-4 rounded-xl border border-[#2A3C4D]/50 hover:border-[#00E5FF]/30 transition-all duration-200 cursor-move group backdrop-blur-sm ${isRunning ? 'ring-1 ring-[#00E5FF]/50 border-[#00E5FF]/30 bg-[#00E5FF]/5' : ''}`}
            >
                <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-medium text-sm leading-snug ${isRunning ? 'text-[#00E5FF]' : 'text-[#E2E8F0]'}`}>{task.title}</h4>
                    <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-[#64748B] hover:text-[#EF4444] transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Aufgabe löschen"
                    >
                        <Trash2 size={14}/>
                    </button>
                </div>

                {task.description && (
                    <p className="text-xs text-[#94A3B8] mb-3 line-clamp-2">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-[#2A3C4D]/30 gap-2">
                    {service && (
                        <Chip size="sm" variant="flat" className="h-5 text-[10px] bg-[#1E2A36] border border-[#2A3C4D]/50 text-[#94A3B8]">
                            {service.name}
                        </Chip>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                        <span className={`text-xs font-mono ${isRunning ? 'text-[#00E5FF] font-bold' : 'text-[#94A3B8]'}`}>{formatDuration(totalDurationMs)}</span>
                        
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => openManualTimeLogModal(task)}
                                className="p-1 text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E2A36] rounded transition-colors"
                                title="Zeit erfassen"
                            >
                                <Clock size={14} />
                            </button>

                            <button
                                onClick={() => handleTimerToggle(task.id)}
                                className={`p-1 rounded transition-colors ${isRunning ? 'text-[#EF4444] hover:bg-[#EF4444]/10' : 'text-[#00E5FF] hover:bg-[#00E5FF]/10'}`}
                                title={isRunning ? 'Stop' : 'Start'}
                            >
                                {isRunning ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor"/>}
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
            {isExpenseModalOpen && newExpenseData && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                     <div className="bg-gradient-to-br from-[#111B22]/90 to-[#16232B]/90 p-8 rounded-3xl shadow-2xl border border-[#1E2A36] w-full max-w-2xl backdrop-blur-xl">
                         <div className="flex items-center gap-4 mb-6">
                             <div className="p-3 rounded-xl bg-gradient-to-br from-[#F87171]/20 to-[#EF4444]/10 border border-[#1E2A36]">
                                 <Plus className="h-6 w-6 text-[#F87171]" />
                             </div>
                             <h3 className="text-2xl font-bold text-[#E2E8F0]">Neue Projektausgabe</h3>
                         </div>
                         <ExpenseForm data={newExpenseData} onDataChange={(field, value) => setNewExpenseData(prev => prev ? { ...prev, [field]: value } : null)} />
                         <div className="flex justify-end gap-4 mt-8">
                            <Button
                                onClick={() => setIsExpenseModalOpen(false)}
                                variant="bordered"
                                className="border-[#64748B]/30 text-[#94A3B8] hover:border-[#00E5FF]/40 hover:text-[#E2E8F0] hover:bg-[#00E5FF]/10"
                            >
                                Abbrechen
                            </Button>
                            <Button
                                onClick={handleSaveExpense}
                                className="bg-gradient-to-r from-[#F87171] to-[#EF4444] text-white shadow-lg shadow-[#F87171]/25 hover:shadow-xl hover:shadow-[#F87171]/30"
                                radius="lg"
                            >
                                Speichern
                            </Button>
                         </div>
                     </div>
                </div>
            )}
            {isTimeLogModalOpen && selectedTaskForTimeLog && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#111B22]/90 to-[#16232B]/90 p-8 rounded-3xl shadow-2xl border border-[#1E2A36] w-full max-w-md backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                      <Clock className="h-6 w-6 text-[#00E5FF]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#E2E8F0]">Zeit manuell erfassen</h3>
                      <p className="text-[#94A3B8] text-sm">für: <span className="text-[#00E5FF]">{selectedTaskForTimeLog.title}</span></p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-[#94A3B8] mb-2 block">Startzeitpunkt</label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={manualLog.start}
                          onChange={e => setManualLog(prev => ({...prev, start: e.target.value}))}
                          className="w-full bg-[#16232B] border border-[#64748B]/30 rounded-xl px-4 py-3 text-[#E2E8F0] focus:outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#94A3B8] mb-2 block">Endzeitpunkt</label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={manualLog.end}
                          onChange={e => setManualLog(prev => ({...prev, end: e.target.value}))}
                          className="w-full bg-[#16232B] border border-[#64748B]/30 rounded-xl px-4 py-3 text-[#E2E8F0] focus:outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-8">
                    <Button
                      onClick={() => setIsTimeLogModalOpen(false)}
                      variant="bordered"
                      className="border-[#64748B]/30 text-[#94A3B8] hover:border-[#00E5FF]/40 hover:text-[#E2E8F0] hover:bg-[#00E5FF]/10"
                    >
                      Abbrechen
                    </Button>

                    <Button
                      onClick={handleSaveManualLog}
                      className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30"
                      radius="lg"
                    >
                      Speichern
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <PageHeader
                title={id ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}
                icon={<FolderOpen className="w-6 h-6" />}
                actions={
                    <div className="flex items-center gap-3">
                        {id && (
                            <>
                                <Button
                                    color="danger"
                                    variant="flat"
                                    onClick={handleDeleteProject}
                                    className="text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 hover:bg-[#EF4444]/20 hidden md:inline-flex"
                                    startContent={<Trash2 size={18} />}
                                >
                                    Löschen
                                </Button>
                                <Button
                                    color="danger"
                                    variant="flat"
                                    onClick={handleDeleteProject}
                                    className="text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 hover:bg-[#EF4444]/20 inline-flex md:hidden"
                                    isIconOnly
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={handleSave}
                            isLoading={isSaving}
                            className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium hidden md:inline-flex"
                            startContent={!isSaving && <Save size={18} />}
                        >
                            {!isSaving && (id ? 'Speichern' : 'Erstellen')}
                        </Button>
                        <Button
                            onClick={handleSave}
                            isLoading={isSaving}
                            className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium inline-flex md:hidden"
                            isIconOnly
                        >
                            {isSaving ? <Spinner size="sm" color="white" /> : <Save size={18} />}
                        </Button>
                    </div>
                }
            />

            <main className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-6 rounded-2xl backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                                <Play className="h-5 w-5 text-[#00E5FF]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#E2E8F0]">Aufgaben</h3>
                            <span className="text-sm text-[#94A3B8] bg-[#64748B]/20 px-2 py-1 rounded-full">{totalProjectHours.toFixed(2)}h Gesamtzeit</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {taskColumns.map(({ status, title }) => (
                               <div
                                   key={status}
                                   onDragOver={(e) => e.preventDefault()}
                                   onDrop={(e) => handleTaskDrop(e, status)}
                                   className="bg-[#111B22]/40 p-4 rounded-2xl border border-[#1E2A36] h-full flex flex-col min-h-[400px]"
                               >
                                   <div className="flex items-center justify-between mb-4 px-1">
                                       <h4 className="font-bold text-[#E2E8F0] text-sm">{title}</h4>
                                       <span className="text-xs bg-[#1E2A36] text-[#64748B] px-2 py-0.5 rounded-md border border-[#2A3C4D]">{project.tasks.filter(t => t.status === status).length}</span>
                                   </div>
                                   
                                   <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                                       {project.tasks.filter(t => t.status === status).map(task => <TaskCard key={task.id} task={task} />)}
                                   </div>

                                   {showNewTaskFormForStatus === status ? (
                                       <div className="mt-3 bg-[#16232B] p-4 rounded-xl border border-[#00E5FF]/30 shadow-lg shadow-[#00E5FF]/5 animate-in fade-in zoom-in-95 duration-200">
                                           <h5 className="text-xs font-semibold text-[#00E5FF] mb-3 uppercase tracking-wider">Neue Aufgabe</h5>
                                           <Input
                                               placeholder="Aufgabentitel"
                                               value={newTaskData.title}
                                               onValueChange={val => setNewTaskData({...newTaskData, title: val})}
                                               classNames={{
                                                   input: "bg-[#111B22] border-0 text-[#E2E8F0] placeholder:text-[#64748B]",
                                                   inputWrapper: "bg-[#111B22] border border-[#2A3C4D] hover:border-[#00E5FF]/50 focus-within:border-[#00E5FF] mb-3 shadow-none min-h-[36px] h-9 px-3",
                                               }}
                                               autoFocus
                                           />
                                           <Textarea
                                               placeholder="Beschreibung (optional)"
                                               value={newTaskData.description}
                                               onValueChange={val => setNewTaskData({...newTaskData, description: val})}
                                               classNames={{
                                                   input: "bg-[#111B22] border-0 text-[#E2E8F0] placeholder:text-[#64748B]",
                                                   inputWrapper: "bg-[#111B22] border border-[#2A3C4D] hover:border-[#00E5FF]/50 focus-within:border-[#00E5FF] mb-3 shadow-none py-2 px-3",
                                               }}
                                               minRows={2}
                                           />
                                           <div className="mb-4">
                                            <Select 
                                                placeholder="Leistung wählen" 
                                                selectedKeys={newTaskData.serviceId ? [newTaskData.serviceId] : []}
                                                onSelectionChange={(keys) => {
                                                    const val = Array.from(keys)[0] as string;
                                                    setNewTaskData({...newTaskData, serviceId: val})
                                                }}
                                                classNames={{
                                                    trigger: "bg-[#111B22] border border-[#2A3C4D] hover:border-[#00E5FF]/50 shadow-none min-h-[36px] h-9",
                                                    value: "text-[#E2E8F0] text-sm",
                                                    popoverContent: "bg-[#111B22] border border-[#2A3C4D] text-[#E2E8F0]"
                                                }}
                                                aria-label="Leistung wählen"
                                            >
                                                {services.map(s => <SelectItem key={s.id} classNames={{base: "text-[#E2E8F0] data-[hover=true]:bg-[#1E2A36] data-[hover=true]:text-[#00E5FF]"}}>{s.name}</SelectItem>)}
                                            </Select>
                                           </div>
                                           <div className="flex justify-end gap-2">
                                               <Button
                                                   onClick={() => setShowNewTaskFormForStatus(null)}
                                                   variant="light"
                                                   size="sm"
                                                   className="text-[#94A3B8] hover:text-[#E2E8F0] min-w-0 px-3"
                                               >
                                                   <X size={16} />
                                               </Button>
                                               <Button
                                                   onClick={handleCreateTask}
                                                   size="sm"
                                                   className="bg-[#00E5FF] text-black font-medium shadow-lg shadow-[#00E5FF]/20"
                                                   startContent={<Check size={14} />}
                                               >
                                                   Erstellen
                                               </Button>
                                           </div>
                                       </div>
                                   ) : (
                                       <button 
                                            onClick={() => setShowNewTaskFormForStatus(status)} 
                                            className="mt-3 flex items-center justify-center gap-2 text-[#64748B] hover:text-[#00E5FF] hover:bg-[#00E5FF]/5 border border-dashed border-[#2A3C4D] hover:border-[#00E5FF]/30 px-4 py-3 rounded-xl transition-all duration-200 w-full text-sm font-medium group"
                                       >
                                           <PlusCircle size={18} className="group-hover:scale-110 transition-transform"/>
                                           <span>Aufgabe hinzufügen</span>
                                       </button>
                                   )}
                               </div>
                           ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-6 rounded-2xl backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#F87171]/10 border border-[#F87171]/20">
                                    <PlusCircle className="h-5 w-5 text-[#F87171]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#E2E8F0]">Projektausgaben</h3>
                                <span className="text-sm text-[#94A3B8] bg-[#1E2A36] border border-[#2A3C4D] px-2 py-0.5 rounded-md">{projectExpenses.length} Ausgaben</span>
                            </div>

                            {id && (
                                <Button
                                    onClick={openNewExpenseModal}
                                    className="bg-[#F87171] text-white shadow-lg shadow-[#F87171]/20"
                                    size="md"
                                    radius="lg"
                                    startContent={<Plus className="w-4 h-4" />}
                                >
                                    Ausgabe
                                </Button>
                            )}
                        </div>

                        <div className="space-y-3">
                           {projectExpenses.map(expense => (
                               <div key={expense.id} className="bg-[#16232B]/40 p-4 rounded-xl border border-[#2A3C4D]/50 hover:border-[#F87171]/30 transition-all duration-200 group">
                                   <div className="flex justify-between items-center">
                                       <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-[#1E2A36] border border-[#2A3C4D]/50 text-[#F87171]">
                                                <DollarSign size={16} />
                                            </div>
                                            <div>
                                               <p className="font-medium text-[#E2E8F0] text-sm">{expense.vendor}</p>
                                               <p className="text-[#94A3B8] text-xs">{expense.description}</p>
                                            </div>
                                       </div>
                                       <div className="text-right">
                                           <p className="font-mono font-bold text-[#F87171] text-sm">{expense.currency} {Number(expense.amount).toFixed(2)}</p>
                                           <p className="text-[#64748B] text-[10px]">{new Date(expense.date).toLocaleDateString('de-CH')}</p>
                                       </div>
                                   </div>
                               </div>
                           ))}
                           {projectExpenses.length === 0 && (
                               <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#2A3C4D]/30 rounded-xl">
                                   <div className="w-12 h-12 rounded-full bg-[#16232B] flex items-center justify-center mb-3 text-[#64748B]">
                                       <FolderOpen size={24} />
                                   </div>
                                   <p className="text-[#94A3B8] text-sm font-medium">Keine Ausgaben erfasst</p>
                                   {id && (
                                        <button onClick={openNewExpenseModal} className="mt-2 text-xs text-[#F87171] hover:underline">
                                            Neue Ausgabe hinzufügen
                                        </button>
                                   )}
                               </div>
                           )}
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-6 rounded-2xl backdrop-blur-xl shadow-2xl border border-[#1E2A36] h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                            <FolderOpen className="h-5 w-5 text-[#00E5FF]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#E2E8F0]">Projektdetails</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 text-sm font-medium text-[#94A3B8] block">Projektname</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={project.name}
                                    onChange={e => handleProjectDataChange('name', e.target.value)}
                                    className="w-full bg-[#16232B] border border-[#64748B]/30 rounded-xl px-4 py-3 text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20 transition-all duration-200"
                                    placeholder="Projektname eingeben..."
                                />
                            </div>
                        </div>

                        <div>
                            <Select
                                label="Kunde"
                                placeholder="Kunde auswählen"
                                selectedKeys={project.customerId ? [project.customerId] : []}
                                onSelectionChange={(keys) => handleProjectDataChange('customerId', Array.from(keys)[0] as string)}
                                classNames={{
                                    label: "text-sm font-medium text-[#94A3B8]",
                                    trigger: "bg-[#16232B] border border-[#64748B]/30 hover:border-[#00E5FF]/50 text-[#E2E8F0]",
                                    value: "text-[#E2E8F0]",
                                    popoverContent: "bg-[#16232B] border border-[#2A3C4D] text-[#E2E8F0]"
                                }}
                                labelPlacement="outside"
                            >
                                {customers.map(c => <SelectItem key={c.id} classNames={{base: "text-[#E2E8F0] data-[hover=true]:bg-[#1E2A36] data-[hover=true]:text-[#00E5FF]"}}>{c.name}</SelectItem>)}
                            </Select>
                        </div>

                        <div>
                            <Select
                                label="Status"
                                selectedKeys={project.status ? [project.status] : []}
                                onSelectionChange={(keys) => handleProjectDataChange('status', Array.from(keys)[0] as string)}
                                classNames={{
                                    label: "text-sm font-medium text-[#94A3B8]",
                                    trigger: "bg-[#16232B] border border-[#64748B]/30 hover:border-[#00E5FF]/50 text-[#E2E8F0]",
                                    value: "text-[#E2E8F0]",
                                    popoverContent: "bg-[#16232B] border border-[#2A3C4D] text-[#E2E8F0]"
                                }}
                                labelPlacement="outside"
                            >
                                <SelectItem key="open" textValue="Offen" classNames={{base: "text-[#E2E8F0] data-[hover=true]:bg-[#1E2A36] data-[hover=true]:text-[#00E5FF]"}}>
                                    <div className="flex items-center gap-2">
                                        <Unlock size={16} />
                                        <span>Offen</span>
                                    </div>
                                </SelectItem>
                                <SelectItem key="in-progress" textValue="In Arbeit" classNames={{base: "text-[#E2E8F0] data-[hover=true]:bg-[#1E2A36] data-[hover=true]:text-[#00E5FF]"}}>
                                    <div className="flex items-center gap-2">
                                        <Zap size={16} />
                                        <span>In Arbeit</span>
                                    </div>
                                </SelectItem>
                                <SelectItem key="done" textValue="Erledigt" classNames={{base: "text-[#E2E8F0] data-[hover=true]:bg-[#1E2A36] data-[hover=true]:text-[#00E5FF]"}}>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        <span>Erledigt</span>
                                    </div>
                                </SelectItem>
                            </Select>
                        </div>

                        <div>
                            <label className="mb-2 text-sm font-medium text-[#94A3B8] block">Beschreibung</label>
                            <div className="relative">
                                <textarea
                                    value={project.description}
                                    onChange={e => handleProjectDataChange('description', e.target.value)}
                                    className="w-full bg-[#16232B] border border-[#64748B]/30 rounded-xl px-4 py-3 text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20 transition-all duration-200 resize-none"
                                    rows={4}
                                    placeholder="Projekt beschreiben..."
                                />
                            </div>
                        </div>

                        {id && (
                            <div className="pt-6 border-t border-[#64748B]/30">
                                <Button
                                    onClick={handleCreateInvoice}
                                    disabled={isSaving || project.tasks.length === 0}
                                    className="w-full bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    size="lg"
                                    radius="lg"
                                    startContent={<FileText size={20} />}
                                >
                                    Rechnung erstellen
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectEditor;

