import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Check, User, MessageSquare } from 'lucide-react';
import { Volunteer } from '../../types';

interface TaskCompletionModalProps {
  dogId: number;
  taskId: number;
  volunteers: Volunteer[];
  onComplete: (dogId: number, taskId: number, data: { volunteer_id?: number; notes?: string }) => void;
  onClose: () => void;
}

const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  dogId,
  taskId,
  volunteers,
  onComplete,
  onClose
}) => {
  const [selectedVolunteer, setSelectedVolunteer] = useState<number | undefined>();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onComplete(dogId, taskId, {
        volunteer_id: selectedVolunteer,
        notes: notes.trim() || undefined
      });
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleBackdropClick}>
      <Modal>
        <Header>
          <Title>Complete Task</Title>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <User size={16} />
              Completed by (optional)
            </Label>
            <Select
              value={selectedVolunteer || ''}
              onChange={(e) => setSelectedVolunteer(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Select volunteer...</option>
              {volunteers.map(volunteer => (
                <option key={volunteer.id} value={volunteer.id}>
                  {volunteer.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>
              <MessageSquare size={16} />
              Notes (optional)
            </Label>
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this task completion..."
              rows={3}
            />
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={submitting}>
              <Check size={16} />
              {submitting ? 'Completing...' : 'Mark Complete'}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: #f1f5f9;
    color: #334155;
  }
`;

const Form = styled.form`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
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
  min-height: 80px;
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
  gap: 0.75rem;
  justify-content: flex-end;

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

  @media (max-width: 640px) {
    justify-content: center;
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
  background-color: #059669;
  color: white;

  &:hover:not(:disabled) {
    background-color: #047857;
  }

  &:disabled {
    background-color: #9ca3af;
  }
`;

export default TaskCompletionModal;