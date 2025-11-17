import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectData, CustomerData, TaskData } from '../types';
import { getProjects, saveProject } from '../services/projectService';
import { getCustomers } from '../services/customerService';

const statusMap: Record<ProjectData['status'], string> = {
  open: 'Offen',
  'in-progress': 'In Arbeit',
  done: 'Erledigt',
};

const statusColors: Record<ProjectData['status'], string> = {
  open: 'border-l-blue-500',
  'in-progress': 'border-l-yellow-500',
  done: 'border-l-green-500',
};

const calculateTotalHours = (tasks: TaskData[]): number => {
    let totalMilliseconds = 0;
    tasks.forEach(task => {
        task.timeLogs.forEach(log => {
            if (log.endTime) {
                totalMilliseconds += new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
            }
        });
    });
    return totalMilliseconds / (1000 * 60 * 60);
};

const ProjectCard = ({ project, customerName }: { project: ProjectData; customerName: string }) => {
    const navigate = useNavigate();
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('projectId', project.id);
    };

    const totalHours = calculateTotalHours(project.tasks);

    return (
        <div 
            draggable 
            onDragStart={handleDragStart}
            onClick={() => navigate(`/project/edit/${project.id}`)}
            className={`bg-gray-800 p-4 rounded-lg shadow-md mb-3 border-l-4 ${statusColors[project.status]} cursor-pointer hover:bg-gray-700/50 transition-colors duration-200`}
        >
            <h4 className="font-bold text-white">{project.name}</h4>
            <p className="text-sm text-gray-400">{customerName}</p>
            <div className="mt-2 text-xs text-gray-500">
                <span>{totalHours.toFixed(2)}h erfasst</span>
            </div>
        </div>
    );
};

const Projects = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectData['status'] | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [fetchedProjects, fetchedCustomers] = await Promise.all([getProjects(), getCustomers()]);
    setProjects(fetchedProjects);
    setCustomers(fetchedCustomers);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const customerMap = customers.reduce((acc, customer) => {
      acc[customer.id] = customer.name;
      return acc;
  }, {} as Record<string, string>);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: ProjectData['status']) => {
    e.preventDefault();
    setDragOverColumn(null);
    const projectId = e.dataTransfer.getData('projectId');
    const projectToMove = projects.find(p => p.id === projectId);
    
    if (projectToMove && projectToMove.status !== status) {
        const updatedProject = { ...projectToMove, status };
        await saveProject(updatedProject);
        // Optimistic UI update
        setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? updatedProject : p));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: ProjectData['status']) => {
    e.preventDefault();
    setDragOverColumn(status);
  };
  
  const handleDragLeave = () => {
      setDragOverColumn(null);
  };

  if (loading) {
    return <div className="text-center p-10">Lade Projekte...</div>;
  }

  const projectsByStatus = {
    open: projects.filter(p => p.status === 'open'),
    'in-progress': projects.filter(p => p.status === 'in-progress'),
    done: projects.filter(p => p.status === 'done'),
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Projekte</h2>
        <Link to="/project/new" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Neues Projekt
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(statusMap) as Array<ProjectData['status']>).map(status => (
            <div 
                key={status}
                onDrop={(e) => handleDrop(e, status)}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                className={`bg-gray-900 rounded-lg p-4 transition-colors duration-300 ${dragOverColumn === status ? 'bg-gray-700/50' : ''}`}
            >
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">{statusMap[status]} ({projectsByStatus[status].length})</h3>
                <div className="space-y-3 min-h-[200px]">
                    {projectsByStatus[status].map(project => (
                        <ProjectCard key={project.id} project={project} customerName={customerMap[project.customerId] || 'Unbekannt'} />
                    ))}
                    {projectsByStatus[status].length === 0 && (
                        <div className="text-center text-gray-500 pt-10">
                            <p>Keine Projekte in diesem Status.</p>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;