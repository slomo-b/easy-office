import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Spinner, Card, CardBody, CardHeader, CardFooter, Chip, Avatar } from '@heroui/react';
import { Plus, Clock, MoreHorizontal, FolderKanban, User, ArrowRight } from 'lucide-react';
import { ProjectData, CustomerData, TaskData } from '../types';
import { getProjects, saveProject } from '../services/projectService';
import { getCustomers } from '../services/customerService';
import PageHeader from '../components/PageHeader';

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

    const getStatusGradient = (status: ProjectData['status']) => {
        switch (status) {
            case 'open':
                return 'from-[#00E5FF]/20 to-[#34F0B1]/15';
            case 'in-progress':
                return 'from-[#FCD34D]/20 to-[#FBBF24]/15';
            case 'done':
                return 'from-[#A7F3D0]/20 to-[#34F0B1]/15';
            default:
                return 'from-[#94A3B8]/20 to-[#64748B]/15';
        }
    };

    const getStatusColors = (status: ProjectData['status']) => {
        switch (status) {
            case 'open':
                return {
                    gradient: 'from-[#00E5FF] to-[#34F0B1]',
                    bg: 'bg-gradient-to-br from-[#00E5FF]/10 to-[#34F0B1]/5',
                    text: 'text-[#00E5FF]'
                };
            case 'in-progress':
                return {
                    gradient: 'from-[#FCD34D] to-[#FBBF24]',
                    bg: 'bg-gradient-to-br from-[#FCD34D]/10 to-[#FBBF24]/5',
                    text: 'text-[#FBBF24]'
                };
            case 'done':
                return {
                    gradient: 'from-[#A7F3D0] to-[#34F0B1]',
                    bg: 'bg-gradient-to-br from-[#A7F3D0]/10 to-[#34F0B1]/5',
                    text: 'text-[#34F0B1]'
                };
            default:
                return {
                    gradient: 'from-[#94A3B8] to-[#64748B]',
                    bg: 'bg-gradient-to-br from-[#94A3B8]/10 to-[#64748B]/5',
                    text: 'text-[#94A3B8]'
                };
        }
    };

    const statusColors = getStatusColors(project.status);

    return (
        <Card
            isPressable
            onPress={() => navigate(`/project/edit/${project.id}`)}
            draggable
            onDragStart={handleDragStart}
            className={`relative overflow-hidden mb-3 w-full cursor-pointer border border-[#1E2A36] bg-[#16232B]/40 backdrop-blur-xl hover:shadow-lg hover:border-[#00E5FF]/30 transition-all duration-300 group`}
            shadow="sm"
        >
            <CardHeader className="flex justify-between items-start pb-0 pt-4 px-4 relative z-10">
                <div className="flex flex-col items-start gap-1">
                    <h4 className="font-bold text-[#E2E8F0] text-left text-medium line-clamp-1 group-hover:text-[#00E5FF] transition-colors">
                        {project.name}
                    </h4>
                    <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
                        #{project.id.slice(-4)}
                    </span>
                </div>
            </CardHeader>

            <CardBody className="py-3 px-4 relative z-10">
                <div className="flex items-center gap-3">
                    <Avatar
                        name={customerName}
                        size="sm"
                        isBordered
                        className="border-[#1E2A36]"
                    />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-[#64748B] uppercase tracking-wider">Kunde</span>
                        <span className="text-[#E2E8F0] font-medium text-xs line-clamp-1">{customerName}</span>
                    </div>
                </div>
            </CardBody>

            <CardFooter className="justify-between pt-0 pb-4 px-4 items-center relative z-10">
                <Chip
                    size="sm"
                    variant="flat"
                    className={`h-6 text-xs border border-white/10 ${
                        project.status === 'open' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' :
                        project.status === 'in-progress' ? 'bg-[#FBBF24]/10 text-[#FBBF24]' :
                        'bg-[#34F0B1]/10 text-[#34F0B1]'
                    }`}
                >
                    {statusMap[project.status]}
                </Chip>
                <div className="flex items-center gap-1.5 text-[#94A3B8]">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono text-xs">{totalHours.toFixed(1)}h</span>
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
        <Card className="relative overflow-hidden border border-[#1E2A36] bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl p-8">
          <CardBody className="text-center">
            <div className="w-16 h-16 border-4 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#94A3B8] text-lg">Projekte laden...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const projectsByStatus = {
    open: projects.filter(p => p.status === 'open'),
    'in-progress': projects.filter(p => p.status === 'in-progress'),
    done: projects.filter(p => p.status === 'done'),
  };

  const getColumnStyles = (status: ProjectData['status']) => {
    const baseStyles = 'rounded-3xl p-4 transition-all duration-300 bg-[#111B22]/40 border border-[#1E2A36] backdrop-blur-xl h-full flex flex-col';

    if (dragOverColumn === status) {
      return `${baseStyles} ring-2 ring-[#00E5FF]/50 bg-[#00E5FF]/5`;
    }

    return baseStyles;
  };

  return (
    <div>
      <PageHeader
        title="Projekte"
        icon={<FolderKanban className="h-6 w-6" />}
        actions={
          <Button
            as={Link}
            to="/project/new"
            className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium"
            startContent={<Plus size={18} />}
          >
            Neues Projekt
          </Button>
        }
      />

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(statusMap) as Array<ProjectData['status']>).map(status => (
            <div
                key={status}
                onDrop={(e) => handleDrop(e, status)}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                className={getColumnStyles(status)}
            >
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        status === 'open' ? 'bg-[#00E5FF]' :
                        status === 'in-progress' ? 'bg-[#FBBF24]' :
                        'bg-[#34F0B1]'
                      }`} />
                      <h3 className="text-lg font-bold text-[#E2E8F0] tracking-tight">{statusMap[status]}</h3>
                    </div>
                    <span className="text-xs font-medium text-[#94A3B8] bg-[#1E2A36] px-2.5 py-1 rounded-full border border-[#2A3C4D]">
                      {projectsByStatus[status].length}
                    </span>
                </div>

                <div className={`space-y-3 flex-1 ${projectsByStatus[status].length === 0 ? 'min-h-[120px] flex flex-col justify-center' : ''} transition-all duration-300`}>
                    {projectsByStatus[status].map(project => (
                        <ProjectCard key={project.id} project={project} customerName={customerMap[project.customerId] || 'Unbekannt'} />
                    ))}

                    {projectsByStatus[status].length === 0 && (
                        <div className="text-center py-8 opacity-50">
                            <div className="mx-auto w-12 h-12 rounded-full bg-[#16232B] flex items-center justify-center mb-3">
                                <FolderKanban className="h-5 w-5 text-[#94A3B8]" />
                            </div>
                            <p className="text-sm text-[#94A3B8]">Leer</p>
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
