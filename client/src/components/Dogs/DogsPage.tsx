import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Search, Plus, Dog, Edit, Eye, UserX, User } from 'lucide-react';
import { dogAPI, volunteerAPI } from '../../services/api';
import { Dog as DogType, Volunteer } from '../../types';
import toast from 'react-hot-toast';

const DogsPage: React.FC = () => {
  const [dogs, setDogs] = useState<DogType[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [volunteerFilter, setVolunteerFilter] = useState<number | undefined>();
  const [showInactive, setShowInactive] = useState(false);

  const loadDogs = async () => {
    try {
      const [dogsResponse, volunteersResponse] = await Promise.all([
        dogAPI.getAll({ 
          search: search || undefined, 
          volunteer_id: volunteerFilter,
          active_only: !showInactive 
        }),
        volunteerAPI.getAll()
      ]);

      setDogs(dogsResponse.data);
      setVolunteers(volunteersResponse.data);
    } catch (error) {
      console.error('Error loading dogs:', error);
      toast.error('Failed to load dogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (dogId: number) => {
    if (!window.confirm('Are you sure you want to deactivate this dog?')) {
      return;
    }

    try {
      await dogAPI.deactivate(dogId);
      toast.success('Dog deactivated successfully');
      loadDogs();
    } catch (error) {
      console.error('Error deactivating dog:', error);
      toast.error('Failed to deactivate dog');
    }
  };

  const handleReactivate = async (dogId: number) => {
    try {
      await dogAPI.reactivate(dogId);
      toast.success('Dog reactivated successfully');
      loadDogs();
    } catch (error) {
      console.error('Error reactivating dog:', error);
      toast.error('Failed to reactivate dog');
    }
  };

  useEffect(() => {
    loadDogs();
  }, [search, volunteerFilter, showInactive]);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <Dog className="animate-bounce" size={32} />
          <span>Loading dogs...</span>
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <div>
            <Title>Dogs</Title>
            <Subtitle>Manage dog profiles and information</Subtitle>
          </div>
          <AddButton as={Link} to="/dogs/new">
            <Plus size={20} />
            Add Dog
          </AddButton>
        </HeaderContent>

        <FiltersContainer>
          <SearchInput>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name or tag number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchInput>

          <FilterSelect
            value={volunteerFilter || ''}
            onChange={(e) => setVolunteerFilter(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Volunteers</option>
            {volunteers.map(volunteer => (
              <option key={volunteer.id} value={volunteer.id}>
                {volunteer.name}
              </option>
            ))}
          </FilterSelect>

          <ToggleContainer>
            <ToggleInput
              type="checkbox"
              id="show-inactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            <ToggleLabel htmlFor="show-inactive">
              Show deactivated dogs
            </ToggleLabel>
          </ToggleContainer>
        </FiltersContainer>
      </Header>

      {dogs.length === 0 ? (
        <EmptyState>
          <Dog size={48} />
          <h3>No dogs found</h3>
          <p>
            {search || volunteerFilter 
              ? 'No dogs match your search criteria.' 
              : 'Get started by adding your first dog profile.'
            }
          </p>
          <AddButton as={Link} to="/dogs/new">
            <Plus size={20} />
            Add First Dog
          </AddButton>
        </EmptyState>
      ) : (
        <DogsGrid>
          {dogs.map(dog => (
            <DogCard key={dog.id} $isInactive={!dog.is_active}>
              <DogImage>
                {dog.photo ? (
                  <img src={dog.photo} alt={dog.name} />
                ) : (
                  <PlaceholderImage>
                    <Dog size={32} />
                  </PlaceholderImage>
                )}
                {!dog.is_active && <InactiveBadge>Inactive</InactiveBadge>}
              </DogImage>

              <DogInfo>
                <DogName>{dog.name}</DogName>
                {dog.tag_number && <DogTag>#{dog.tag_number}</DogTag>}
                
                <DogDetails>
                  <DetailItem>
                    <strong>Gender:</strong> {dog.gender}
                  </DetailItem>
                  {dog.age && (
                    <DetailItem>
                      <strong>Age:</strong> {dog.age} years
                    </DetailItem>
                  )}
                  {dog.volunteer_name ? (
                    <DetailItem>
                      <User size={14} />
                      {dog.volunteer_name}
                    </DetailItem>
                  ) : (
                    <DetailItem>
                      <UserX size={14} />
                      No volunteer assigned
                    </DetailItem>
                  )}
                </DogDetails>

                <DogActions>
                  <ActionButton as={Link} to={`/dogs/${dog.id}`} $variant="view">
                    <Eye size={16} />
                    View
                  </ActionButton>
                  <ActionButton as={Link} to={`/dogs/${dog.id}/edit`} $variant="edit">
                    <Edit size={16} />
                    Edit
                  </ActionButton>
                  {dog.is_active ? (
                    <ActionButton 
                      as="button" 
                      onClick={() => handleDeactivate(dog.id)}
                      $variant="deactivate"
                    >
                      Deactivate
                    </ActionButton>
                  ) : (
                    <ActionButton 
                      as="button" 
                      onClick={() => handleReactivate(dog.id)}
                      $variant="activate"
                    >
                      Reactivate
                    </ActionButton>
                  )}
                </DogActions>
              </DogInfo>
            </DogCard>
          ))}
        </DogsGrid>
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

  .animate-bounce {
    animation: bounce 1s infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
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

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
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

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToggleInput = styled.input`
  cursor: pointer;
`;

const ToggleLabel = styled.label`
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
`;

const DogsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const DogCard = styled.div<{ $isInactive?: boolean }>`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s;
  opacity: ${props => props.$isInactive ? 0.7 : 1};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DogImage = styled.div`
  position: relative;
  height: 200px;
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

const InactiveBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #dc2626;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const DogInfo = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DogName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const DogTag = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const DogDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;

  strong {
    color: #374151;
  }
`;

const DogActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $variant: string }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  ${props => {
    switch (props.$variant) {
      case 'view':
        return `
          background-color: #f1f5f9;
          color: #64748b;
          &:hover { background-color: #e2e8f0; color: #334155; }
        `;
      case 'edit':
        return `
          background-color: #dbeafe;
          color: #2563eb;
          &:hover { background-color: #bfdbfe; color: #1d4ed8; }
        `;
      case 'deactivate':
        return `
          background-color: #fee2e2;
          color: #dc2626;
          &:hover { background-color: #fecaca; color: #b91c1c; }
        `;
      case 'activate':
        return `
          background-color: #d1fae5;
          color: #059669;
          &:hover { background-color: #a7f3d0; color: #047857; }
        `;
      default:
        return '';
    }
  }}
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

export default DogsPage;