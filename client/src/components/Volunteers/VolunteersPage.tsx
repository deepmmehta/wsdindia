import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Search, Plus, Users, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { volunteerAPI } from '../../services/api';
import { Volunteer } from '../../types';
import toast from 'react-hot-toast';

const VolunteersPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadVolunteers = async () => {
    try {
      const response = await volunteerAPI.getAll();
      setVolunteers(response.data);
    } catch (error) {
      console.error('Error loading volunteers:', error);
      toast.error('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (volunteerId: number, volunteerName: string) => {
    if (!window.confirm(`Are you sure you want to delete volunteer "${volunteerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await volunteerAPI.delete(volunteerId);
      toast.success('Volunteer deleted successfully');
      loadVolunteers();
    } catch (error: any) {
      console.error('Error deleting volunteer:', error);
      toast.error(error.response?.data?.error || 'Failed to delete volunteer');
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer =>
    volunteer.name.toLowerCase().includes(search.toLowerCase()) ||
    (volunteer.email && volunteer.email.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    loadVolunteers();
  }, []);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <Users className="animate-pulse" size={32} />
          <span>Loading volunteers...</span>
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <div>
            <Title>Volunteers</Title>
            <Subtitle>Manage volunteer information and assignments</Subtitle>
          </div>
          <AddButton as={Link} to="/volunteers/new">
            <Plus size={20} />
            Add Volunteer
          </AddButton>
        </HeaderContent>

        <SearchContainer>
          <SearchInput>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search volunteers by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchInput>
        </SearchContainer>
      </Header>

      {filteredVolunteers.length === 0 ? (
        <EmptyState>
          <Users size={48} />
          <h3>No volunteers found</h3>
          <p>
            {search 
              ? 'No volunteers match your search criteria.' 
              : 'Get started by adding your first volunteer.'
            }
          </p>
          <AddButton as={Link} to="/volunteers/new">
            <Plus size={20} />
            Add First Volunteer
          </AddButton>
        </EmptyState>
      ) : (
        <VolunteersGrid>
          {filteredVolunteers.map(volunteer => (
            <VolunteerCard key={volunteer.id}>
              <VolunteerHeader>
                <VolunteerName>{volunteer.name}</VolunteerName>
                <VolunteerActions>
                  <ActionButton 
                    as={Link} 
                    to={`/volunteers/${volunteer.id}/edit`}
                    $variant="edit"
                  >
                    <Edit size={16} />
                  </ActionButton>
                  <ActionButton 
                    as="button"
                    onClick={() => handleDelete(volunteer.id, volunteer.name)}
                    $variant="delete"
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </VolunteerActions>
              </VolunteerHeader>

              <VolunteerDetails>
                {volunteer.email && (
                  <DetailItem>
                    <Mail size={16} />
                    <a href={`mailto:${volunteer.email}`}>{volunteer.email}</a>
                  </DetailItem>
                )}
                {volunteer.phone && (
                  <DetailItem>
                    <Phone size={16} />
                    <a href={`tel:${volunteer.phone}`}>{volunteer.phone}</a>
                  </DetailItem>
                )}
                {!volunteer.email && !volunteer.phone && (
                  <DetailItem>
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                      No contact information
                    </span>
                  </DetailItem>
                )}
              </VolunteerDetails>

              <VolunteerFooter>
                <JoinDate>
                  Joined {new Date(volunteer.created_at).toLocaleDateString()}
                </JoinDate>
              </VolunteerFooter>
            </VolunteerCard>
          ))}
        </VolunteersGrid>
      )}
    </Container>
  );
};

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

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
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

const AddButton = styled.button`
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

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
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
  max-width: 400px;

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

const VolunteersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const VolunteerCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const VolunteerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const VolunteerName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
`;

const VolunteerActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;

  ${props => {
    switch (props.$variant) {
      case 'edit':
        return `
          background-color: #dbeafe;
          color: #2563eb;
          &:hover { background-color: #bfdbfe; color: #1d4ed8; }
        `;
      case 'delete':
        return `
          background-color: #fee2e2;
          color: #dc2626;
          &:hover { background-color: #fecaca; color: #b91c1c; }
        `;
      default:
        return '';
    }
  }}
`;

const VolunteerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;

  svg {
    flex-shrink: 0;
  }

  a {
    color: #2563eb;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const VolunteerFooter = styled.div`
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
`;

const JoinDate = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
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
    margin: 0 0 2rem 0;
    max-width: 400px;
  }
`;

export default VolunteersPage;