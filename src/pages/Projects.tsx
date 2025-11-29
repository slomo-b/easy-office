import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Spinner, Card, CardBody, CardHeader, CardFooter, Chip, Avatar } from '@heroui/react';
import { Plus, Clock, MoreHorizontal, FolderKanban, User, ArrowRight } from 'lucide-react';
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
            className={`relative overflow-hidden mb-3 w-full cursor-pointer border border-[#1E2A36] ${statusColors.bg} backdrop-blur-xl hover:shadow-2xl hover:shadow-[#00E5FF]/5 transition-all duration-300 group`}
            shadow="sm"
        >
            {/* Gradient border on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${statusColors.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

            <CardHeader className="flex justify-between items-start pb-3 px-6 pt-6 relative z-10">
                <div className="flex flex-col items-start gap-2">
                    <h4 className="font-bold bg-gradient-to-r from-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent text-left text-medium line-clamp-1">
                        {project.name}
                    </h4>
                    <span className="text-tiny bg-[#1E2A36] text-[#64748B] uppercase font-bold tracking-wider px-2 py-1 rounded-full border border-[#1E2A36]">
                        #{project.id.slice(-4)}
                    </span>
                </div>
                <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 bg-[#16232B] border border-[#1E2A36] text-[#94A3B8] hover:text-[#E2E8F0] hover:border-[#00E5FF]/30 transition-all duration-300"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardBody className="py-3 px-6 relative z-10">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#16232B]/40 border border-[#1E2A36] hover:border-[#00E5FF]/30 transition-all duration-300">
                    <Avatar
                        name={customerName}
                        size="sm"
                        isBordered
                        className="border-[#1E2A36] transition-all duration-300"
                        color={statusColorMap[project.status] as any}
                    />
                    <div className="flex flex-col">
                        <span className={`text-xs text-[#64748B] uppercase tracking-wider ${statusColors.text}`}>Kunde</span>
                        <span className="text-[#E2E8F0] font-medium text-sm line-clamp-1">{customerName}</span>
                    </div>
                </div>
            </CardBody>

            <CardFooter className="justify-between pt-3 pb-6 px-6 items-center relative z-10">
                <div className="flex items-center gap-2">
                    <Chip
                        size="sm"
                        variant="flat"
                        className={`font-medium bg-gradient-to-r ${statusColors.gradient}/20 ${statusColors.text} border ${statusColors.gradient.replace('/20', '')}/30 border-opacity-30`}
                    >
                        {statusMap[project.status]}
                    </Chip>
                </div>
                <div className="flex items-center gap-2 bg-[#16232B]/60 border border-[#1E2A36] px-3 py-1.5 rounded-xl text-[#94A3B8] transition-all duration-300 group-hover:border-[#00E5FF]/30">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono font-medium text-xs">{totalHours.toFixed(1)}h</span>
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
    const baseStyles = 'rounded-2xl border-2 border-dashed border-[#1E2A36] p-6 transition-all duration-300 bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl';

    if (dragOverColumn === status) {
      return `${baseStyles} border-[#00E5FF]/50 bg-gradient-to-br from-[#00E5FF]/5 to-[#34F0B1]/5 shadow-2xl shadow-[#00E5FF]/10`;
    }

    switch (status) {
      case 'open':
        return `${baseStyles} border-[#00E5FF]/20`;
      case 'in-progress':
        return `${baseStyles} border-[#FBBF24]/20`;
      case 'done':
        return `${baseStyles} border-[#34F0B1]/20`;
      default:
        return `${baseStyles}`;
    }
  };

  const getColumnHeaderStyles = (status: ProjectData['status']) => {
    switch (status) {
      case 'open':
        return 'bg-gradient-to-r from-[#00E5FF]/20 to-[#34F0B1]/10 border-[#00E5FF]/30';
      case 'in-progress':
        return 'bg-gradient-to-r from-[#FCD34D]/20 to-[#FBBF24]/10 border-[#FBBF24]/30';
      case 'done':
        return 'bg-gradient-to-r from-[#A7F3D0]/20 to-[#34F0B1]/10 border-[#34F0B1]/30';
      default:
        return 'bg-gradient-to-r from-[#94A3B8]/20 to-[#64748B]/10 border-[#94A3B8]/30';
    }
  };

  return (
    <div>
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
            <FolderKanban className="h-8 w-8 text-[#00E5FF]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-1" style={{
                background: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.1',
                display: 'inline-block',
                paddingBottom: '2px'
            }}>
              Projekte
            </h1>
          </div>
        </div>

        <Button
          as={Link}
          to="/project/new"
          className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30 self-start sm:self-center"
          radius="lg"
          size="lg"
          startContent={<Plus className="h-5 w-5" />}
        >
          Neues Projekt
        </Button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent mb-8" />

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
                <div className={`flex items-center justify-between mb-6 p-4 rounded-xl border ${getColumnHeaderStyles(status)}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'open' ? 'bg-[#00E5FF]' :
                        status === 'in-progress' ? 'bg-[#FBBF24]' :
                        'bg-[#34F0B1]'
                      } shadow-lg`} />
                      <h3 className={`text-lg font-semibold ${
                        status === 'open' ? 'bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] bg-clip-text text-transparent' :
                        status === 'in-progress' ? 'text-[#FBBF24]' :
                        'bg-gradient-to-r from-[#34F0B1] to-[#A7F3D0] bg-clip-text text-transparent'
                      }`}>{statusMap[status]}</h3>
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      className={`font-medium bg-[#16232B] border border-[#1E2A36] text-[#E2E8F0]`}
                    >
                      {projectsByStatus[status].length}
                    </Chip>
                </div>

                <div className={`space-y-3 ${projectsByStatus[status].length === 0 ? 'min-h-[120px]' : 'min-h-[auto]'} transition-all duration-300`}>
                    {projectsByStatus[status].map(project => (
                        <ProjectCard key={project.id} project={project} customerName={customerMap[project.customerId] || 'Unbekannt'} />
                    ))}

                    {projectsByStatus[status].length === 0 && (
                        <div className="text-center py-12">
                            <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#1E2A36]/80 to-[#16232B]/60 border-2 border-dashed border-[#1E2A36] flex items-center justify-center mb-4`}>
                                <User className={`h-7 w-7 ${
                                  status === 'open' ? 'text-[#00E5FF]/40' :
                                  status === 'in-progress' ? 'text-[#FBBF24]/40' :
                                  'text-[#34F0B1]/40'
                                }`} />
                            </div>
                            <p className={`text-base font-medium ${
                              status === 'open' ? 'text-[#00E5FF]/70' :
                              status === 'in-progress' ? 'text-[#FBBF24]/70' :
                              'text-[#34F0B1]/70'
                            }`}>Keine Projekte in diesem Status</p>
                            <p className="text-[#64748B] text-sm mt-1">
                              {status === 'open' ? 'Ziehe Projekte hierher' :
                               status === 'in-progress' ? 'In Arbeit' :
                               'Für abgeschlossene Projekte'}
                            </p>
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
