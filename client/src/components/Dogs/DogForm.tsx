import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { dogAPI, volunteerAPI } from '../../services/api';
import { Dog, Volunteer, CreateDogData } from '../../types';
import toast from 'react-hot-toast';

const DogForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateDogData>({
    name: '',
    gender: 'Unknown',
    photo: undefined,
    tag_number: '',
    age: undefined,
    date_of_birth: '',
    health_notes: '',
    behavior_notes: '',
    assigned_volunteer_id: undefined,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const volunteersResponse = await volunteerAPI.getAll();
        setVolunteers(volunteersResponse.data);

        if (isEdit && id) {
          const dogResponse = await dogAPI.getById(Number(id));
          const dog = dogResponse.data;
          
          setFormData({
            name: dog.name,
            gender: dog.gender,
            tag_number: dog.tag_number || '',
            age: dog.age,
            date_of_birth: dog.date_of_birth || '',
            health_notes: dog.health_notes || '',
            behavior_notes: dog.behavior_notes || '',
            assigned_volunteer_id: dog.assigned_volunteer_id,
          });

          if (dog.photo) {
            setPhotoPreview(dog.photo);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isEdit, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'assigned_volunteer_id' 
        ? (value ? Number(value) : undefined)
        : value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: undefined }));
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Dog name is required');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit && id) {
        await dogAPI.update(Number(id), formData);
        toast.success('Dog updated successfully');
      } else {
        await dogAPI.create(formData);
        toast.success('Dog created successfully');
      }
      
      navigate('/dogs');
    } catch (error: any) {
      console.error('Error saving dog:', error);
      toast.error(error.response?.data?.error || 'Failed to save dog');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading...</LoadingSpinner>
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
        <Title>{isEdit ? 'Edit Dog' : 'Add New Dog'}</Title>
      </Header>

      <FormContainer>
        <Form onSubmit={handleSubmit}>
          {/* Photo Upload */}
          <FormSection>
            <SectionTitle>Photo</SectionTitle>
            <PhotoUploadContainer>
              {photoPreview ? (
                <PhotoPreview>
                  <img src={photoPreview} alt="Dog preview" />
                  <RemovePhotoButton type="button" onClick={removePhoto}>
                    <X size={16} />
                  </RemovePhotoButton>
                </PhotoPreview>
              ) : (
                <PhotoUploadArea>
                  <Upload size={24} />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </PhotoUploadArea>
              )}
            </PhotoUploadContainer>
          </FormSection>

          {/* Basic Information */}
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="name">
                  Dog Name <Required>*</Required>
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter dog's name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="tag_number">Tag Number</Label>
                <Input
                  type="text"
                  id="tag_number"
                  name="tag_number"
                  value={formData.tag_number}
                  onChange={handleInputChange}
                  placeholder="Enter tag number"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unknown">Unknown</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                  placeholder="Enter age in years"
                  min="0"
                  max="20"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="date_of_birth">Date of Birth (if known)</Label>
                <Input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="assigned_volunteer_id">Assigned Volunteer</Label>
                <Select
                  id="assigned_volunteer_id"
                  name="assigned_volunteer_id"
                  value={formData.assigned_volunteer_id || ''}
                  onChange={handleInputChange}
                >
                  <option value="">No volunteer assigned</option>
                  {volunteers.map(volunteer => (
                    <option key={volunteer.id} value={volunteer.id}>
                      {volunteer.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Health & Behavior Notes */}
          <FormSection>
            <SectionTitle>Health & Behavior</SectionTitle>
            <FormGroup>
              <Label htmlFor="health_notes">Health Notes</Label>
              <TextArea
                id="health_notes"
                name="health_notes"
                value={formData.health_notes}
                onChange={handleInputChange}
                placeholder="Enter any health conditions, medications, or medical history..."
                rows={4}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="behavior_notes">Behavior Notes</Label>
              <TextArea
                id="behavior_notes"
                name="behavior_notes"
                value={formData.behavior_notes}
                onChange={handleInputChange}
                placeholder="Enter temperament, special needs, fear triggers, or behavioral notes..."
                rows={4}
              />
            </FormGroup>
          </FormSection>

          {/* Submit Buttons */}
          <ButtonGroup>
            <CancelButton type="button" onClick={() => navigate('/dogs')}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={submitting}>
              <Save size={16} />
              {submitting ? 'Saving...' : (isEdit ? 'Update Dog' : 'Create Dog')}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #64748b;
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

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const Form = styled.form`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 640px) {
    padding: 1.5rem;
    gap: 1.5rem;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const Required = styled.span`
  color: #dc2626;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const PhotoUploadContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const PhotoUploadArea = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 200px;
  height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  position: relative;

  &:hover {
    border-color: #2563eb;
    color: #2563eb;
  }

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
`;

const PhotoPreview = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 0.5rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemovePhotoButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;

  &:hover:not(:disabled) {
    background-color: #f1f5f9;
    color: #334155;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #2563eb;
  color: white;

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }

  &:disabled {
    background-color: #9ca3af;
  }
`;

export default DogForm;