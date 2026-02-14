import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
const GoogleDrivePDFViewer = lazy(() => import('./GoogleDrivePDFViewer')); // ✅ NEW

// Loading component
const LoadingFallback = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p>Loading E Siksha...</p>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/admin' element={<AdminDashboard />} />
          <Route path="/add-content/:type?" element={<AddContent />} />
          <Route path='/list' element={<List />} />
          <Route path='/login' element={<Login />} />
          <Route path='/reg' element={<Registration />} />
          <Route path='/pdf' element={<Pdf />} />
          <Route path='/about' element={<About />} />
          <Route path='/course/:id' element={<CourseDetail />} />
          
          <Route path='/pdf/viewer/:id' element={<GoogleDrivePDFViewer />} /> {/* ✅ NEW ROUTE */}
          <Route path='/course/:id/learn' element={<BuiltInVideoPlayer />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
