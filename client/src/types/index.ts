export interface Dog {
  id: number;
  name: string;
  photo?: string;
  tag_number?: string;
  gender: 'Male' | 'Female' | 'Unknown';
  age?: number;
  date_of_birth?: string;
  health_notes?: string;
  behavior_notes?: string;
  assigned_volunteer_id?: number;
  volunteer_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Volunteer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface TaskType {
  id: number;
  name: string;
  default_frequency_type: FrequencyType;
  default_frequency_value?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface DogTask {
  id: number;
  dog_id: number;
  task_type_id: number;
  task_name: string;
  frequency_type: FrequencyType;
  frequency_value?: number;
  due_date?: string;
  last_completed?: string;
  status: TaskStatus;
  is_active: boolean;
  created_at: string;
}

export interface TaskCompletion {
  id: number;
  dog_task_id: number;
  completed_by_volunteer_id?: number;
  volunteer_name?: string;
  completed_at: string;
  notes?: string;
}

export interface DashboardDog {
  id: number;
  name: string;
  tag_number?: string;
  assigned_volunteer_id?: number;
  volunteer_name?: string;
  tasks: DogTask[];
}

export type FrequencyType = 'daily' | 'weekly' | 'custom_days' | 'fixed_date';

export type TaskStatus = 'done' | 'overdue' | 'not_due';

export interface CreateDogData {
  name: string;
  photo?: File;
  tag_number?: string;
  gender: 'Male' | 'Female' | 'Unknown';
  age?: number;
  date_of_birth?: string;
  health_notes?: string;
  behavior_notes?: string;
  assigned_volunteer_id?: number;
}

export interface CreateVolunteerData {
  name: string;
  email?: string;
  phone?: string;
}

export interface CreateTaskData {
  task_type_id: number;
  frequency_type: FrequencyType;
  frequency_value?: number;
  due_date?: string;
}

export interface CompleteTaskData {
  volunteer_id?: number;
  notes?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardFilters {
  volunteer_id?: number;
  task_filter?: TaskStatus;
  search?: string;
}