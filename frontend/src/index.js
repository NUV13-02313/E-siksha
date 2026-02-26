import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './index.css';

// Direct imports instead of lazy loading
import Home from './Home';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import AddContent from './AddContent';
import List from './List';
import Login from './Login';
import Registration from './Registation';
import Pdf from './Pdf';
import About from './About';
import CourseDetail from './CourseDetail';
import BuiltInVideoPlayer from './BuiltInVideoPlayer';
import GoogleDrivePDFViewer from './GoogleDrivePDFViewer';

// Loading component (can be removed or kept for initial load)
const LoadingFallback = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p>Loading E Siksha...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Suspense removed since we're not lazy loading anymore */}
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/list' element={<List />} />
        <Route path='/pdf' element={<Pdf />} />
        <Route path='/about' element={<About />} />
        <Route path='/course/:id' element={<CourseDetail />} />
        
        {/* AUTH ROUTES */}
        <Route path='/login' element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path='/reg' element={
          <PublicRoute>
            <Registration />
          </PublicRoute>
        } />

        {/* PROTECTED ROUTES */}
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/add-content/:type?" element={
          <ProtectedRoute>
            <AddContent />
          </ProtectedRoute>
        } />
        
        <Route path='/pdf/viewer/:id' element={
          <ProtectedRoute>
            <GoogleDrivePDFViewer />
          </ProtectedRoute>
        } />
        
        <Route path='/course/:id/learn' element={
          <ProtectedRoute>
            <BuiltInVideoPlayer />
          </ProtectedRoute>
        } />

        {/* ADMIN ROUTES */}
        <Route path='/admin' element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        {/* 404 Page */}
        <Route path='*' element={
          <div className="not-found-page">
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <button onClick={() => window.location.href = '/'}>
              Go Home
            </button>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);