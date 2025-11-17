import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProjectData, CustomerData, ServiceData, TimeEntryData, ExpenseData } from '../types';
import { getProjectById, saveProject, createNewProject, deleteProject } from '../services/projectService';
import { getCustomers } from '../services/customerService';
import { getServices } from '../services/serviceService';
import { getExpenses } from '../services/expenseService';

const ProjectEditor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Main project data
    const [project, setProject] = useState<ProjectData | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Related data
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [services, setServices] = useState<ServiceData[]>([]);
    const [projectExpenses, setProjectExpenses] = useState<ExpenseData[]>([]);
    
    // Time entry form state
    const [newTimeEntry, setNewTimeEntry] = useState<Omit<TimeEntryData, 'id'>>({
        date: new Date().toISOString().split('T')[0],
        duration: '',
        serviceId: '',
        description: '',
    });

    const loadData = useCallback(async () => {
        const [fetchedCustomers, fetchedServices, allExpenses] = await Promise.all([getCustomers(), getServices(), getExpenses()]);
        setCustomers(fetchedCustomers);
        setServices(fetchedServices);

        if (id) {
            const existingProject = await getProjectById(id);
            if (existingProject) {
                setProject(existingProject);
                setProjectExpenses(allExpenses.filter(e => e.projectId === id));
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
    
    const handleProjectDataChange = (field: keyof Omit<ProjectData, 'timeEntries'>, value: string) => {
        setProject(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleTimeEntryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTimeEntry(prev => ({ ...prev, [name]: name === 'duration' ? parseFloat(value) || '' : value }));
    };

    const handleAddTimeEntry = () => {
        if (!project || !newTimeEntry.serviceId || !newTimeEntry.duration) {
            alert("Bitte Leistung und Dauer angeben.");
            return;
        }

        const newEntry: TimeEntryData = {
            id: `time_${new Date().getTime()}`,
            ...newTimeEntry,
            duration: Number(newTimeEntry.duration)
        };
        
        const updatedProject = {
            ...project,
            timeEntries: [...project.timeEntries, newEntry]
        };
        setProject(updatedProject);
        
        // Reset form
        setNewTimeEntry({
            date: new Date().toISOString().split('T')[0],
            duration: '',
            serviceId: '',
            description: '',
        });
    };
    
    const handleDeleteTimeEntry = (entryId: string) => {
        if(!project) return;
        const updatedEntries = project.timeEntries.filter(entry => entry.id !== entryId);
        setProject({...project, timeEntries: updatedEntries});
    };

    const handleSave = async () => {
        if (project) {
            if(!project.name || !project.customerId) {
                alert("Bitte Projektname und Kunde angeben.");
                return;
            }
            setIsSaving(true);
            await saveProject(project);
            setIsSaving(false);
            navigate('/projects');
        }
    };
    
    const handleDelete = async () => {
        if (project && id && window.confirm("Sind Sie sicher, dass Sie dieses Projekt und alle zugehörigen Zeiteinträge löschen möchten? Zugeordnete Ausgaben bleiben erhalten, verlieren aber ihre Zuordnung.")) {
            // Note: We are not deleting associated expenses, just the project.
            await deleteProject(id);
            navigate('/projects');
        }
    };

    if (!project) return <div className="text-center p-10">Lade Projektdaten...</div>;

    const totalHours = project.timeEntries.reduce((sum, entry) => sum + Number(entry.duration), 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">{id ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}</h2>
                <div>
                    {id && <button onClick={handleDelete} className="text-red-500 hover:text-red-400 font-bold py-2 px-4 rounded-lg mr-4">Löschen</button>}
                    <button onClick={handleSave} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500">
                        {isSaving ? 'Speichern...' : 'Speichern & Schliessen'}
                    </button>
                </div>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Time Tracking */}
                    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">Zeiterfassung ({totalHours.toFixed(2)}h)</h3>
                        {/* New Entry Form */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-900/50 rounded-md">
                             <select name="serviceId" value={newTimeEntry.serviceId} onChange={handleTimeEntryFormChange} className="md:col-span-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm">
                                <option value="">-- Leistung auswählen --</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price} / {s.unit})</option>)}
                            </select>
                             <input type="number" name="duration" placeholder="Stunden (z.B. 1.5)" value={newTimeEntry.duration} onChange={handleTimeEntryFormChange} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm" />
                             <input type="date" name="date" value={newTimeEntry.date} onChange={handleTimeEntryFormChange} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm" />
                             <input type="text" name="description" placeholder="Optionale Beschreibung" value={newTimeEntry.description} onChange={handleTimeEntryFormChange} className="md:col-span-4 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm" />
                             <div className="md:col-span-4 text-right">
                                <button onClick={handleAddTimeEntry} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-3 rounded-md text-sm">Hinzufügen</button>
                             </div>
                        </div>
                        {/* Entries List */}
                        <ul className="space-y-2">
                           {project.timeEntries.slice().reverse().map(entry => {
                               const service = services.find(s => s.id === entry.serviceId);
                               return (
                                   <li key={entry.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm">
                                       <div>
                                           <p className="font-semibold text-white">{service?.name || 'Unbekannte Leistung'}</p>
                                           <p className="text-gray-400 text-xs">{entry.description}</p>
                                       </div>
                                       <div className="text-right">
                                            <p className="font-mono text-white">{Number(entry.duration).toFixed(2)} h</p>
                                            <p className="text-gray-400 text-xs">{new Date(entry.date).toLocaleDateString('de-CH')}</p>
                                       </div>
                                       <button onClick={() => handleDeleteTimeEntry(entry.id)} className="text-red-500 hover:text-red-400 ml-4 text-xs">X</button>
                                   </li>
                               )
                           })}
                        </ul>
                    </div>

                    {/* Expenses */}
                     <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
                            <h3 className="text-lg font-semibold text-emerald-400">Projektausgaben</h3>
                            <Link to={`/expense/new?projectId=${project.id}`} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-3 rounded-md text-sm">Neue Ausgabe</Link>
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
                {/* Project Details Form */}
                <div className="bg-gray-800 p-4 rounded-lg shadow-md h-fit">
                    <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">Projektdetails</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 text-sm font-medium text-gray-400 block">Projektname</label>
                            <input type="text" value={project.name} onChange={e => handleProjectDataChange('name', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"/>
                        </div>
                        <div>
                            <label className="mb-1 text-sm font-medium text-gray-400 block">Kunde</label>
                            <select value={project.customerId} onChange={e => handleProjectDataChange('customerId', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                                <option value="">-- Kunde auswählen --</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="mb-1 text-sm font-medium text-gray-400 block">Status</label>
                            <select value={project.status} onChange={e => handleProjectDataChange('status', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                                <option value="open">Offen</option>
                                <option value="in-progress">In Arbeit</option>
                                <option value="done">Erledigt</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 text-sm font-medium text-gray-400 block">Beschreibung</label>
                            <textarea value={project.description} onChange={e => handleProjectDataChange('description', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white" rows={4}></textarea>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectEditor;