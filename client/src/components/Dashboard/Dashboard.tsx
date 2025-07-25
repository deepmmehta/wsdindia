import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, Check, AlertCircle, Clock, RefreshCw, Plus } from 'lucide-react';
import { taskAPI, volunteerAPI } from '../../services/api';
import { DashboardDog, Volunteer, TaskStatus, DashboardFilters } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import TaskCompletionModal from './TaskCompletionModal';

const Dashboard: React.FC = () => {
  const [dogs, setDogs] = useState<DashboardDog[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [selectedTask, setSelectedTask] = useState<{ dogId: number; taskId: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboard = async (newFilters?: DashboardFilters) => {
    try {
      setLoading(true);
      const [dogsResponse, volunteersResponse] = await Promise.all([
        taskAPI.getDashboard(newFilters || filters),
        volunteerAPI.getAll()
      ]);

      setDogs(dogsResponse.data);
      setVolunteers(volunteersResponse.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard
  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadDashboard(updatedFilters);
  };

  // Handle task completion
  const handleTaskComplete = async (dogId: number, taskId: number, data: { volunteer_id?: number; notes?: string }) => {
    try {
      await taskAPI.complete(taskId, data);
      toast.success('Task completed successfully!');
      setSelectedTask(null);
      await loadDashboard();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  // Get task status color and icon
  const getTaskStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return { color: '#059669', bgColor: '#d1fae5', icon: Check };
      case 'overdue':
        return { color: '#dc2626', bgColor: '#fee2e2', icon: AlertCircle };
      case 'not_due':
        return { color: '#6b7280', bgColor: '#f3f4f6', icon: Clock };
      default:
        return { color: '#6b7280', bgColor: '#f3f4f6', icon: Clock };
    }
  };

  // Calculate summary stats
  const calculateStats = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;

    dogs.forEach(dog => {
      dog.tasks.forEach(task => {
        totalTasks++;
        if (task.status === 'done') completedTasks++;
        if (task.status === 'overdue') overdueTasks++;
      });
    });

    return { totalTasks, completedTasks, overdueTasks };
  };

  const stats = calculateStats();

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <RefreshCw className="animate-spin" size={32} />
          <span>Loading dashboard...</span>
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <div>
            <Title>Daily Care Dashboard</Title>
            <Subtitle>Track and manage care tasks for all dogs</Subtitle>
          </div>
          <RefreshButton onClick={refreshDashboard} disabled={refreshing}>
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </RefreshButton>
        </HeaderContent>

        {/* Summary Stats */}
        <StatsGrid>
          <StatCard>
            <StatValue>{dogs.length}</StatValue>
            <StatLabel>Active Dogs</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.completedTasks}</StatValue>
            <StatLabel>Completed Today</StatLabel>
          </StatCard>
          <StatCard $status="overdue">
            <StatValue>{stats.overdueTasks}</StatValue>
            <StatLabel>Overdue Tasks</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%</StatValue>
            <StatLabel>Completion Rate</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Filters */}
        <FiltersContainer>
          <SearchInput>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search dogs by name or tag..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
          </SearchInput>

          <FilterSelect
            value={filters.volunteer_id || ''}
            onChange={(e) => handleFilterChange({ volunteer_id: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">All Volunteers</option>
            {volunteers.map(volunteer => (
              <option key={volunteer.id} value={volunteer.id}>
                {volunteer.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={filters.task_filter || ''}
            onChange={(e) => handleFilterChange({ task_filter: e.target.value as TaskStatus || undefined })}
          >
            <option value="">All Tasks</option>
            <option value="overdue">Overdue Only</option>
            <option value="done">Completed Today</option>
            <option value="not_due">Not Due Yet</option>
          </FilterSelect>
        </FiltersContainer>
      </Header>

      {/* Dashboard Grid */}
      {dogs.length === 0 ? (
        <EmptyState>
          <Dog size={48} />
          <h3>No dogs found</h3>
          <p>No dogs match your current filters.</p>
        </EmptyState>
      ) : (
        <DashboardGrid>
          {dogs.map(dog => (
            <DogCard key={dog.id}>
              <DogHeader>
                <DogInfo>
                  <DogName>{dog.name}</DogName>
                  {dog.tag_number && <DogTag>#{dog.tag_number}</DogTag>}
                  {dog.volunteer_name && <VolunteerName>👤 {dog.volunteer_name}</VolunteerName>}
                </DogInfo>
              </DogHeader>

              <TasksList>
                {dog.tasks.map(task => {
                  const statusStyle = getTaskStatusStyle(task.status);
                  const StatusIcon = statusStyle.icon;

                  return (
                    <TaskItem key={task.id}>
                      <TaskContent>
                        <TaskIcon $status={task.status}>
                          <StatusIcon size={16} />
                        </TaskIcon>
                        <TaskDetails>
                          <TaskName>{task.task_name}</TaskName>
                          {task.last_completed && (
                            <LastCompleted>
                              Last: {format(new Date(task.last_completed), 'MMM d, h:mm a')}
                            </LastCompleted>
                          )}
                        </TaskDetails>
                      </TaskContent>

                      {task.status !== 'done' && (
                        <CompleteButton
                          onClick={() => setSelectedTask({ dogId: dog.id, taskId: task.id })}
                          $status={task.status}
                        >
                          <Check size={16} />
                        </CompleteButton>
                      )}
                    </TaskItem>
                  );
                })}

                {dog.tasks.length === 0 && (
                  <EmptyTasks>
                    <Clock size={20} />
                    <span>No tasks assigned</span>
                  </EmptyTasks>
                )}
              </TasksList>
            </DogCard>
          ))}
        </DashboardGrid>
      )}

      {/* Task Completion Modal */}
      {selectedTask && (
        <TaskCompletionModal
          dogId={selectedTask.dogId}
          taskId={selectedTask.taskId}
          volunteers={volunteers}
          onComplete={handleTaskComplete}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem;
  color: #64748b;

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: #64748b;
  margin: 0.25rem 0 0 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div<{ $status?: string }>`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  text-align: center;
  
  ${props => props.$status === 'overdue' && `
    border-color: #fecaca;
    background-color: #fef2f2;
  `}
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  flex: 1;
  min-width: 200px;

  input {
    border: none;
    outline: none;
    flex: 1;
    font-size: 0.875rem;

    &::placeholder {
      color: #9ca3af;
    }
  }

  svg {
    color: #9ca3af;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const DogCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DogHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
`;

const DogInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DogName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const DogTag = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
`;

const VolunteerName = styled.span`
  font-size: 0.75rem;
  color: #2563eb;
  font-weight: 500;
`;

const TasksList = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

const TaskContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const TaskIcon = styled.div<{ $status: TaskStatus }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.$status) {
      case 'done': return '#d1fae5';
      case 'overdue': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'done': return '#059669';
      case 'overdue': return '#dc2626';
      default: return '#6b7280';
    }
  }};
`;

const TaskDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
`;

const TaskName = styled.span`
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
`;

const LastCompleted = styled.span`
  font-size: 0.75rem;
  color: #64748b;
`;

const CompleteButton = styled.button<{ $status: TaskStatus }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.$status === 'overdue' ? '#fee2e2' : '#f1f5f9'};
  color: ${props => props.$status === 'overdue' ? '#dc2626' : '#64748b'};

  &:hover {
    background-color: ${props => props.$status === 'overdue' ? '#fecaca' : '#e2e8f0'};
    transform: scale(1.1);
  }
`;

const EmptyTasks = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #9ca3af;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #9ca3af;

  h3 {
    margin: 1rem 0 0.5rem 0;
    color: #64748b;
  }

  p {
    margin: 0;
  }
`;

export default Dashboard;