import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Edit, Calendar, User, AlertCircle, Clock, Check, Plus } from 'lucide-react';
import { dogAPI, taskAPI, volunteerAPI } from '../../services/api';
import { Dog, DogTask, Volunteer, TaskType } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import TaskCompletionModal from '../Dashboard/TaskCompletionModal';

const DogDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [dog, setDog] = useState<Dog | null>(null);
  const [tasks, setTasks] = useState<DogTask[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [dogResponse, tasksResponse, volunteersResponse, taskTypesResponse] = await Promise.all([
        dogAPI.getById(Number(id)),
        taskAPI.getByDogId(Number(id)),
        volunteerAPI.getAll(),
        taskAPI.getTypes()
      ]);

      setDog(dogResponse.data);
      setTasks(tasksResponse.data);
      setVolunteers(volunteersResponse.data);
      setTaskTypes(taskTypesResponse.data);
    } catch (error) {
      console.error('Error loading dog details:', error);
      toast.error('Failed to load dog details');
      navigate('/dogs');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (dogId: number, taskId: number, data: { volunteer_id?: number; notes?: string }) => {
    try {
      await taskAPI.complete(taskId, data);
      toast.success('Task completed successfully!');
      setSelectedTask(null);
      await loadData();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const getStatusStyle = (status: string) => {
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

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading dog details...</LoadingSpinner>
      </Container>
    );
  }

  if (!dog) {
    return (
      <Container>
        <EmptyState>
          <h3>Dog not found</h3>
          <Link to="/dogs">Back to Dogs</Link>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/dogs')}>
          <ArrowLeft size={20} />
          Back to Dogs
        </BackButton>
        
        <HeaderContent>
          <DogInfo>
            <DogName>{dog.name}</DogName>
            {dog.tag_number && <DogTag>#{dog.tag_number}</DogTag>}
            {!dog.is_active && <InactiveBadge>Inactive</InactiveBadge>}
          </DogInfo>
          
          <EditButton as={Link} to={`/dogs/${dog.id}/edit`}>
            <Edit size={16} />
            Edit
          </EditButton>
        </HeaderContent>
      </Header>

      <ContentGrid>
        {/* Dog Profile */}
        <ProfileCard>
          <ProfileImage>
            {dog.photo ? (
              <img src={dog.photo} alt={dog.name} />
            ) : (
              <PlaceholderImage>
                <User size={48} />
              </PlaceholderImage>
            )}
          </ProfileImage>

          <ProfileDetails>
            <DetailGroup>
              <DetailLabel>Basic Information</DetailLabel>
              <DetailItem>
                <strong>Gender:</strong> {dog.gender}
              </DetailItem>
              {dog.age && (
                <DetailItem>
                  <strong>Age:</strong> {dog.age} years
                </DetailItem>
              )}
              {dog.date_of_birth && (
                <DetailItem>
                  <strong>Date of Birth:</strong> {format(new Date(dog.date_of_birth), 'MMM d, yyyy')}
                </DetailItem>
              )}
              {dog.volunteer_name ? (
                <DetailItem>
                  <strong>Assigned Volunteer:</strong> {dog.volunteer_name}
                </DetailItem>
              ) : (
                <DetailItem>
                  <strong>Assigned Volunteer:</strong> <em>None</em>
                </DetailItem>
              )}
            </DetailGroup>

            {dog.health_notes && (
              <DetailGroup>
                <DetailLabel>Health Notes</DetailLabel>
                <DetailText>{dog.health_notes}</DetailText>
              </DetailGroup>
            )}

            {dog.behavior_notes && (
              <DetailGroup>
                <DetailLabel>Behavior Notes</DetailLabel>
                <DetailText>{dog.behavior_notes}</DetailText>
              </DetailGroup>
            )}
          </ProfileDetails>
        </ProfileCard>

        {/* Tasks */}
        <TasksCard>
          <TasksHeader>
            <TasksTitle>Care Tasks</TasksTitle>
            <TaskStats>
              {tasks.filter(t => t.status === 'done').length} / {tasks.length} completed today
            </TaskStats>
          </TasksHeader>

          <TasksList>
            {tasks.map(task => {
              const statusStyle = getStatusStyle(task.status);
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
                          Last completed: {format(new Date(task.last_completed), 'MMM d, h:mm a')}
                        </LastCompleted>
                      )}
                      <TaskFrequency>
                        {task.frequency_type === 'daily' && 'Daily'}
                        {task.frequency_type === 'weekly' && 'Weekly'}
                        {task.frequency_type === 'custom_days' && `Every ${task.frequency_value} days`}
                        {task.frequency_type === 'fixed_date' && task.due_date && 
                          `Due: ${format(new Date(task.due_date), 'MMM d, yyyy')}`
                        }
                      </TaskFrequency>
                    </TaskDetails>
                  </TaskContent>

                  {task.status !== 'done' && (
                    <CompleteButton
                      onClick={() => setSelectedTask(task.id)}
                      $status={task.status}
                    >
                      <Check size={16} />
                    </CompleteButton>
                  )}
                </TaskItem>
              );
            })}

            {tasks.length === 0 && (
              <EmptyTasks>
                <Clock size={24} />
                <span>No tasks assigned to this dog</span>
              </EmptyTasks>
            )}
          </TasksList>
        </TasksCard>
      </ContentGrid>

      {/* Task Completion Modal */}
      {selectedTask && (
        <TaskCompletionModal
          dogId={dog.id}
          taskId={selectedTask}
          volunteers={volunteers}
          onComplete={handleTaskComplete}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #64748b;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  color: #64748b;

  h3 {
    margin: 0 0 1rem 0;
  }

  a {
    color: #2563eb;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 0.875rem;
  transition: color 0.2s;
  align-self: flex-start;

  &:hover {
    color: #334155;
  }
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

const DogInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DogName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const DogTag = styled.span`
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const InactiveBadge = styled.span`
  background: #fee2e2;
  color: #dc2626;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const ProfileCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const ProfileImage = styled.div`
  height: 300px;
  background: #f8fafc;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`;

const ProfileDetails = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DetailGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DetailLabel = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

const DetailItem = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  
  strong {
    color: #374151;
  }
`;

const DetailText = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
`;

const TasksCard = styled(Card)``;

const TasksHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TasksTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const TaskStats = styled.span`
  font-size: 0.875rem;
  color: #64748b;
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
  padding: 1rem;
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

const TaskIcon = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
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
  gap: 0.25rem;
  flex: 1;
`;

const TaskName = styled.span`
  font-weight: 500;
  color: #1e293b;
`;

const LastCompleted = styled.span`
  font-size: 0.75rem;
  color: #64748b;
`;

const TaskFrequency = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const CompleteButton = styled.button<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.$status === 'overdue' ? '#fee2e2' : '#f1f5f9'};
  color: ${props => props.$status === 'overdue' ? '#dc2626' : '#64748b'};

  &:hover {
    background-color: ${props => props.$status === 'overdue' ? '#fecaca' : '#e2e8f0'};
    transform: scale(1.05);
  }
`;

const EmptyTasks = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: #9ca3af;
  text-align: center;
`;

export default DogDetail;