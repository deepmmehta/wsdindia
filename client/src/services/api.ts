import axios from 'axios';
import { 
  Dog, 
  Volunteer, 
  TaskType, 
  DogTask, 
  TaskCompletion, 
  DashboardDog,
  CreateDogData,
  CreateVolunteerData,
  CreateTaskData,
  CompleteTaskData,
  DashboardFilters
} from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Dog API
export const dogAPI = {
  // Get all dogs with optional filters
  getAll: (filters?: { search?: string; volunteer_id?: number; active_only?: boolean }) => 
    api.get<Dog[]>('/dogs', { params: filters }),

  // Get single dog by ID
  getById: (id: number) => 
    api.get<Dog>(`/dogs/${id}`),

  // Create new dog (with FormData for photo upload)
  create: (data: CreateDogData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('gender', data.gender);
    
    if (data.photo) formData.append('photo', data.photo);
    if (data.tag_number) formData.append('tag_number', data.tag_number);
    if (data.age) formData.append('age', data.age.toString());
    if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth);
    if (data.health_notes) formData.append('health_notes', data.health_notes);
    if (data.behavior_notes) formData.append('behavior_notes', data.behavior_notes);
    if (data.assigned_volunteer_id) formData.append('assigned_volunteer_id', data.assigned_volunteer_id.toString());

    return api.post('/dogs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update existing dog
  update: (id: number, data: CreateDogData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('gender', data.gender);
    
    if (data.photo) formData.append('photo', data.photo);
    if (data.tag_number) formData.append('tag_number', data.tag_number);
    if (data.age) formData.append('age', data.age.toString());
    if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth);
    if (data.health_notes) formData.append('health_notes', data.health_notes);
    if (data.behavior_notes) formData.append('behavior_notes', data.behavior_notes);
    if (data.assigned_volunteer_id) formData.append('assigned_volunteer_id', data.assigned_volunteer_id.toString());

    return api.put(`/dogs/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Deactivate dog
  deactivate: (id: number) => 
    api.patch(`/dogs/${id}/deactivate`),

  // Reactivate dog
  reactivate: (id: number) => 
    api.patch(`/dogs/${id}/reactivate`),
};

// Volunteer API
export const volunteerAPI = {
  // Get all volunteers
  getAll: () => 
    api.get<Volunteer[]>('/volunteers'),

  // Get single volunteer by ID
  getById: (id: number) => 
    api.get<Volunteer>(`/volunteers/${id}`),

  // Create new volunteer
  create: (data: CreateVolunteerData) => 
    api.post('/volunteers', data),

  // Update existing volunteer
  update: (id: number, data: CreateVolunteerData) => 
    api.put(`/volunteers/${id}`, data),

  // Delete volunteer
  delete: (id: number) => 
    api.delete(`/volunteers/${id}`),

  // Get volunteer's assigned dogs
  getDogs: (id: number) => 
    api.get<Dog[]>(`/volunteers/${id}/dogs`),
};

// Task API
export const taskAPI = {
  // Get all task types
  getTypes: () => 
    api.get<TaskType[]>('/tasks/types'),

  // Get tasks for a specific dog
  getByDogId: (dogId: number) => 
    api.get<DogTask[]>(`/tasks/dog/${dogId}`),

  // Get dashboard data
  getDashboard: (filters?: DashboardFilters) => 
    api.get<DashboardDog[]>('/tasks/dashboard', { params: filters }),

  // Create task for a dog
  create: (dogId: number, data: CreateTaskData) => 
    api.post(`/tasks/dog/${dogId}`, data),

  // Complete a task
  complete: (taskId: number, data: CompleteTaskData) => 
    api.post(`/tasks/${taskId}/complete`, data),

  // Get task completion history
  getCompletions: (taskId: number) => 
    api.get<TaskCompletion[]>(`/tasks/${taskId}/completions`),

  // Update task
  update: (taskId: number, data: Partial<CreateTaskData>) => 
    api.put(`/tasks/${taskId}`, data),

  // Delete task
  delete: (taskId: number) => 
    api.delete(`/tasks/${taskId}`),
};

// Health check
export const healthAPI = {
  check: () => 
    api.get('/health'),
};

export default api;