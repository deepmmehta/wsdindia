import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Save, User, Mail, Phone } from 'lucide-react';
import { volunteerAPI } from '../../services/api';
import { Volunteer, CreateVolunteerData } from '../../types';
import toast from 'react-hot-toast';

const VolunteerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateVolunteerData>({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const loadVolunteer = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const response = await volunteerAPI.getById(Number(id));
          const volunteer = response.data;
          
          setFormData({
            name: volunteer.name,
            email: volunteer.email || '',
            phone: volunteer.phone || '',
          });
        } catch (error) {
          console.error('Error loading volunteer:', error);
          toast.error('Failed to load volunteer');
          navigate('/volunteers');
        } finally {
          setLoading(false);
        }
      }
    };

    loadVolunteer();
  }, [isEdit, id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Volunteer name is required');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      };

      if (isEdit && id) {
        await volunteerAPI.update(Number(id), submitData);
        toast.success('Volunteer updated successfully');
      } else {
        await volunteerAPI.create(submitData);
        toast.success('Volunteer created successfully');
      }
      
      navigate('/volunteers');
    } catch (error: any) {
      console.error('Error saving volunteer:', error);
      toast.error(error.response?.data?.error || 'Failed to save volunteer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading volunteer...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/volunteers')}>
          <ArrowLeft size={20} />
          Back to Volunteers
        </BackButton>
        <Title>{isEdit ? 'Edit Volunteer' : 'Add New Volunteer'}</Title>
      </Header>

      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Volunteer Information</SectionTitle>
            
            <FormGroup>
              <Label htmlFor="name">
                <User size={16} />
                Name <Required>*</Required>
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter volunteer's full name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">
                <Mail size={16} />
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address (optional)"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">
                <Phone size={16} />
                Phone Number
              </Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number (optional)"
              />
            </FormGroup>
          </FormSection>

          <ButtonGroup>
            <CancelButton type="button" onClick={() => navigate('/volunteers')}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={submitting}>
              <Save size={16} />
              {submitting ? 'Saving...' : (isEdit ? 'Update Volunteer' : 'Create Volunteer')}
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
  max-width: 600px;
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
  gap: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

export default VolunteerForm;