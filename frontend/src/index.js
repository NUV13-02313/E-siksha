import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './index.css';

// Lazy load components
const Home = lazy(() => import('./Home'));
const Dashboard = lazy(() => import('./Dashboard'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AddContent = lazy(() => import('./AddContent'));
const List = lazy(() => import('./List'));
const Login = lazy(() => import('./Login'));
const Registration = lazy(() => import('./Registation'));
const Pdf = lazy(() => import('./Pdf'));
const About = lazy(() => import('./About'));
const CourseDetail = lazy(() => import('./CourseDetail'));
const BuiltInVideoPlayer = lazy(() => import('./BuiltInVideoPlayer'));
const GoogleDrivePDFViewer = lazy(() => import('./GoogleDrivePDFViewer'));

// Loading component
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
    // Redirect to login if not authenticated
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

// Public Route Component (redirects to home if already logged in)
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
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* 🟢 PUBLIC ROUTES - Always accessible */}
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
          <Route path='/list' element={<List />} />
          <Route path='/pdf' element={<Pdf />} />
          <Route path='/about' element={<About />} />
          <Route path='/course/:id' element={<CourseDetail />} />
          
          {/* 🟡 AUTH ROUTES - Redirect to home if already logged in */}
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

          {/* 🔒 PROTECTED ROUTES - Require login */}
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

          {/* 🔐 ADMIN ONLY ROUTES */}
          <Route path='/admin' element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* 404 Page - Catch all unmatched routes */}
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
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);