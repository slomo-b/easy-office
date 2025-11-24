import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Spinner, Card, CardBody, CardHeader, CardFooter, Chip, Avatar } from '@heroui/react';
import { Plus, Clock, MoreHorizontal } from 'lucide-react';
import { ProjectData, CustomerData, TaskData } from '../types';
import { getProjects, saveProject } from '../services/projectService';
import { getCustomers } from '../services/customerService';

const statusMap: Record<ProjectData['status'], string> = {
  open: 'Offen',
  'in-progress': 'In Arbeit',
  done: 'Erledigt',
};

const statusColorMap: Record<ProjectData['status'], "primary" | "warning" | "success" | "default" | "secondary" | "danger"> = {
  open: 'primary',
  'in-progress': 'warning',
  done: 'success',
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

// FIX: Explicitly type ProjectCard as a React.FC to correctly handle the 'key' prop.
interface ProjectCardProps {
    project: ProjectData;
    customerName: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, customerName }) => {
    const navigate = useNavigate();
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('projectId', project.id);
    };

    const totalHours = calculateTotalHours(project.tasks);

    return (
        <Card 
            isPressable
            onPress={() => navigate(`/project/edit/${project.id}`)}
            draggable 
            onDragStart={handleDragStart}
            className="mb-3 w-full hover:scale-[1.02] transition-transform duration-200"
            shadow="sm"
        >
            <CardHeader className="flex justify-between items-start pb-2">
                <div className="flex flex-col items-start gap-1">
                    <h4 className="font-bold text-foreground text-left text-medium line-clamp-1">{project.name}</h4>
                    <span className="text-tiny text-default-400 uppercase font-bold tracking-wider">
                        #{project.id.slice(-4)}
                    </span>
                </div>
                <Button isIconOnly variant="light" size="sm" className="-mr-2 -mt-2 text-default-400">
                    <MoreHorizontal size={16} />
                </Button>
            </CardHeader>
            
            <CardBody className="py-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-default-50 border border-default-100">
                    <Avatar 
                        name={customerName} 
                        size="sm" 
                        isBordered 
                        className="transition-transform"
                        color={statusColorMap[project.status]}
                    />
                    <div className="flex flex-col">
                        <span className="text-tiny text-default-500">Kunde</span>
                        <span className="text-sm font-medium text-foreground line-clamp-1">{customerName}</span>
                    </div>
                </div>
            </CardBody>

            <CardFooter className="justify-between pt-2">
                <div className="flex items-center gap-2">
                    <Chip size="sm" variant="dot" color={statusColorMap[project.status]} className="border-none pl-1">
                        {statusMap[project.status]}
                    </Chip>
                </div>
                <div className="flex items-center text-tiny text-default-400 gap-1 bg-default-100 px-2 py-1 rounded-full">
                    <Clock size={12} />
                    <span className="font-mono font-medium">{totalHours.toFixed(1)}h</span>
                </div>
            </CardFooter>
        </Card>
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const projectsByStatus = {
    open: projects.filter(p => p.status === 'open'),
    'in-progress': projects.filter(p => p.status === 'in-progress'),
    done: projects.filter(p => p.status === 'done'),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Projekte</h2>
          <p className="text-default-500">Verwalte deine Projekte und Zeitaufzeichnungen</p>
        </div>
        <Button
          as={Link}
          to="/project/new"
          className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg"
          radius="full"
          size="lg"
          startContent={<Plus className="h-6 w-6 font-bold" />}
          variant="shadow"
        >
          Neues Projekt
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(statusMap) as Array<ProjectData['status']>).map(status => (
            <div 
                key={status}
                onDrop={(e) => handleDrop(e, status)}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                className={`rounded-2xl p-4 transition-colors duration-300 ${dragOverColumn === status ? 'bg-default-100' : 'bg-default-50/50'}`}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-default-700">{statusMap[status]}</h3>
                    <Chip size="sm" variant="flat" color="default">{projectsByStatus[status].length}</Chip>
                </div>
                <div className="space-y-3 min-h-[200px]">
                    {projectsByStatus[status].map(project => (
                        <ProjectCard key={project.id} project={project} customerName={customerMap[project.customerId] || 'Unbekannt'} />
                    ))}
                    {projectsByStatus[status].length === 0 && (
                        <div className="text-center text-default-400 pt-10">
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
