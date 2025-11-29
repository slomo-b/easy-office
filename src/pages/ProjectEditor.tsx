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
import { Play, Square, PlusCircle, Trash2, Clock, ChevronDown, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@heroui/react';

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
            <div draggable onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)} className={`bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-4 rounded-2xl shadow-2xl border border-[#1E2A36] space-y-3 relative backdrop-blur-xl hover:shadow-[#00E5FF]/10 transition-all duration-300 cursor-move group ${isRunning ? 'ring-2 ring-[#00E5FF]/50' : ''}`}>
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[#E2E8F0] text-sm pr-8 leading-tight">{task.title}</h4>
                    <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-[#64748B] rounded-lg hover:text-[#F87171] hover:bg-[#F87171]/10 transition-all duration-200 opacity-60 hover:opacity-100"
                        title="Aufgabe löschen"
                    >
                        <Trash2 size={14}/>
                    </button>
                </div>

                {task.description && (
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{task.description}</p>
                )}

                <div className="pt-3 border-t border-[#64748B]/30 space-y-3">
                    {service && (
                        <div className="inline-flex">
                            <span className="text-xs font-medium bg-gradient-to-r from-[#00E5FF]/20 to-[#34F0B1]/10 text-[#00E5FF] px-3 py-1 rounded-full border border-[#00E5FF]/30">
                                {service.name}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[#64748B]" />
                            <span className="text-sm font-mono font-medium text-[#E2E8F0]">{formatDuration(totalDurationMs)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => openManualTimeLogModal(task)}
                                className="p-1.5 text-[#64748B] rounded-lg hover:text-[#94A3B8] hover:bg-[#94A3B8]/10 transition-all duration-200"
                                title="Zeit manuell erfassen"
                            >
                                <Clock size={14} />
                            </button>

                            <button
                                onClick={() => handleTimerToggle(task.id)}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${isRunning ? 'text-white bg-gradient-to-r from-[#F87171] to-[#EF4444]' : 'text-[#34F0B1] bg-gradient-to-r from-[#34F0B1]/20 to-[#A7F3D0]/10 hover:from-[#34F0B1]/30 hover:to-[#A7F3D0]/20'}`}
                                title={isRunning ? 'Timer stoppen' : 'Timer starten'}
                            >
                                {isRunning ? <Square size={14} fill="white" /> : <Play size={14} className="ml-0.5"/>}
                            </button>
                        </div>
                    </div>
                </div>

                {isRunning && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] rounded-full animate-pulse border-2 border-[#0B141A]" />
                )}
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

            {/* Header with Title and Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                  <FolderOpen className="h-8 w-8 text-[#00E5FF]" />
                </div>
                    <h1 className="text-4xl font-bold mb-1" style={{
                        background: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: '1.1',
                        display: 'inline-block',
                        paddingBottom: '2px'
                    }}>
                    {id ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}
                    </h1>
              </div>

              <div className="flex gap-3">
                {id && (
                  <Button
                    color="danger"
                    variant="solid"
                    onClick={handleDeleteProject}
                    className="bg-gradient-to-r from-[#F87171] to-[#EF4444] text-white"
                  >
                    Löschen
                  </Button>
                )}
                <Button
                  as={"button" as any}
                  onClick={handleSave}
                  isLoading={isSaving}
                  className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30"
                  radius="lg"
                  size="lg"
                >
                  {!isSaving && (id ? 'Speichern' : 'Erstellen')}
                </Button>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent mb-8" />

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
                                   className="bg-gradient-to-br from-[#16232B]/60 to-[#1E2A36]/40 p-4 rounded-xl border border-[#64748B]/30 backdrop-blur-xl hover:border-[#00E5FF]/30 transition-all duration-300 min-h-[300px]"
                               >
                                   <h4 className="text-center font-bold text-[#E2E8F0] mb-4 text-lg">{title}</h4>
                                   <div className="space-y-3 mb-4">
                                       {project.tasks.filter(t => t.status === status).map(task => <TaskCard key={task.id} task={task} />)}
                                   </div>

                                   {showNewTaskFormForStatus === status ? (
                                       <div className="bg-gradient-to-br from-[#64748B]/20 to-[#64748B]/10 p-4 rounded-xl border border-[#64748B]/20 backdrop-blur-xl">
                                           <input
                                               type="text"
                                               placeholder="Aufgabentitel"
                                               value={newTaskData.title}
                                               onChange={e => setNewTaskData({...newTaskData, title: e.target.value})}
                                               className="w-full bg-[#16232B] border border-[#64748B]/30 rounded-lg px-3 py-2 text-[#E2E8F0] mb-3 focus:outline-none focus:border-[#00E5FF]/50 transition-all duration-200"
                                           />
                                           <textarea
                                               placeholder="Beschreibung (optional)"
                                               value={newTaskData.description}
                                               onChange={e => setNewTaskData({...newTaskData, description: e.target.value})}
                                               className="w-full bg-[#16232B] border border-[#64748B]/30 rounded-lg px-3 py-2 text-[#E2E8F0] mb-3 focus:outline-none focus:border-[#00E5FF]/50 transition-all duration-200"
                                               rows={2}
                                           />
                                           <div className="relative mb-3">
                                            <select
                                                value={newTaskData.serviceId}
                                                onChange={e => setNewTaskData({...newTaskData, serviceId: e.target.value})}
                                                className="w-full appearance-none bg-[#16232B] border border-[#64748B]/30 rounded-lg px-3 py-2 pr-10 text-[#E2E8F0] focus:outline-none focus:border-[#00E5FF]/50 transition-all duration-200"
                                            >
                                                <option value="">-- Leistung --</option>
                                                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#64748B]"><ChevronDown size={16} /></div>
                                           </div>
                                           <div className="flex justify-end gap-2">
                                               <Button
                                                   onClick={() => setShowNewTaskFormForStatus(null)}
                                                   variant="bordered"
                                                   size="sm"
                                                   className="border-[#64748B]/30 text-[#94A3B8] hover:border-[#00E5FF]/40 hover:text-[#E2E8F0]"
                                               >
                                                   Abbrechen
                                               </Button>
                                               <Button
                                                   onClick={handleCreateTask}
                                                   size="sm"
                                                   className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25"
                                               >
                                                   Speichern
                                               </Button>
                                           </div>
                                       </div>
                                   ) : (
                                       <button onClick={() => setShowNewTaskFormForStatus(status)} className="flex items-center justify-center gap-2 text-[#94A3B8] hover:text-[#00E5FF] p-3 rounded-xl border-2 border-dashed border-[#64748B]/30 hover:border-[#00E5FF]/50 transition-all duration-200 group w-full">
                                           <PlusCircle size={16} className="group-hover:scale-110 transition-transform duration-200"/>
                                           <span className="font-medium">Neue Aufgabe</span>
                                       </button>
                                   )}
                               </div>
                           ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-6 rounded-2xl backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#F87171]/20 to-[#EF4444]/10 border border-[#1E2A36]">
                                    <PlusCircle className="h-5 w-5 text-[#F87171]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#E2E8F0]">Projektausgaben</h3>
                                <span className="text-sm text-[#94A3B8] bg-[#64748B]/20 px-2 py-1 rounded-full">{projectExpenses.length} Ausgaben</span>
                            </div>

                            {id && (
                                <Button
                                    onClick={openNewExpenseModal}
                                    className="bg-gradient-to-r from-[#F87171] to-[#EF4444] text-white shadow-lg shadow-[#F87171]/25 hover:shadow-xl hover:shadow-[#F87171]/30"
                                    size="lg"
                                >
                                    Neue Ausgabe
                                </Button>
                            )}
                        </div>

                        <div className="space-y-3">
                           {projectExpenses.map(expense => (
                               <div key={expense.id} className="bg-gradient-to-br from-[#16232B]/60 to-[#1E2A36]/40 p-4 rounded-xl border border-[#64748B]/30 backdrop-blur-xl hover:border-[#F87171]/30 transition-all duration-300">
                                   <div className="flex justify-between items-start">
                                       <div className="flex-1">
                                           <p className="font-bold text-[#E2E8F0] text-sm mb-1">{expense.vendor}</p>
                                           <p className="text-[#94A3B8] text-xs leading-relaxed">{expense.description}</p>
                                       </div>
                                       <div className="text-right ml-4">
                                           <p className="font-mono font-bold text-[#F87171] text-lg">{expense.currency} {Number(expense.amount).toFixed(2)}</p>
                                           <p className="text-[#64748B] text-xs mt-1">{new Date(expense.date).toLocaleDateString('de-CH')}</p>
                                       </div>
                                   </div>
                               </div>
                           ))}
                           {projectExpenses.length === 0 && (
                               <div className="text-center py-12">
                                   <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-br from-[#64748B]/20 to-[#64748B]/10 border-2 border-dashed border-[#64748B]/30 flex items-center justify-center mb-4">
                                       <PlusCircle className="h-8 w-8 text-[#64748B]" />
                                   </div>
                                   <p className="text-[#64748B] text-sm font-medium">Keine Ausgaben für dieses Projekt erfasst</p>
                                   <p className="text-[#64748B]/60 text-xs mt-1">Erstelle deine erste Ausgabe</p>
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
                            <label className="mb-2 text-sm font-medium text-[#94A3B8] block">Kunde</label>
                            <div className="relative">
                              <select
                                  value={project.customerId}
                                  onChange={e => handleProjectDataChange('customerId', e.target.value)}
                                  className="w-full appearance-none bg-[#16232B] border border-[#64748B]/30 rounded-xl px-4 py-3 pr-10 text-[#E2E8F0] focus:outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20 transition-all duration-200"
                              >
                                  <option value="">-- Kunde auswählen --</option>
                                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#64748B]"><ChevronDown size={20} /></div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 text-sm font-medium text-[#94A3B8] block">Status</label>
                            <div className="relative">
                              <select
                                  value={project.status}
                                  onChange={e => handleProjectDataChange('status', e.target.value as ProjectData['status'])}
                                  className="w-full appearance-none bg-[#16232B] border border-[#64748B]/30 rounded-xl px-4 py-3 pr-10 text-[#E2E8F0] focus:outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20 transition-all duration-200"
                              >
                                  <option value="open">🔓 Offen</option>
                                  <option value="in-progress">⚡ In Arbeit</option>
                                  <option value="done">✅ Erledigt</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#64748B]"><ChevronDown size={20} /></div>
                            </div>
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
                                    className="w-full bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    size="lg"
                                    radius="lg"
                                >
                                    📄 Rechnung erstellen
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
