import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import DogsPage from './components/Dogs/DogsPage';
import DogDetail from './components/Dogs/DogDetail';
import DogForm from './components/Dogs/DogForm';
import VolunteersPage from './components/Volunteers/VolunteersPage';
import VolunteerForm from './components/Volunteers/VolunteerForm';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Dogs */}
          <Route path="/dogs" element={<DogsPage />} />
          <Route path="/dogs/new" element={<DogForm />} />
          <Route path="/dogs/:id" element={<DogDetail />} />
          <Route path="/dogs/:id/edit" element={<DogForm />} />
          
          {/* Volunteers */}
          <Route path="/volunteers" element={<VolunteersPage />} />
          <Route path="/volunteers/new" element={<VolunteerForm />} />
          <Route path="/volunteers/:id/edit" element={<VolunteerForm />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
    </Router>
  );
}

export default App;