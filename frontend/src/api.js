import axios from 'axios';
// Current (problematic)

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://e-siksha-mljg.onrender.com/api'  // ✅ Add /api here
  : 'http://localhost:5000/api';

// Create axios instance for JSON requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 🔐 AUTH APIs
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Registration failed' };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/user/me');
    return response.data;
  } catch (error) {
    console.error('Get user error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to get user' };
  }
};

export const updateProfile = async (profileData) => {
  try {
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (key === 'skills' && Array.isArray(profileData[key])) {
        formData.append(key, JSON.stringify(profileData[key]));
      } else if (key === 'avatar' && profileData[key] instanceof File) {
        formData.append(key, profileData[key]);
      } else {
        formData.append(key, profileData[key]);
      }
    });

    // Use fetch for multipart/form-data
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw data;
    }

    // Update local storage
    if (data.user) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...data.user
      }));
    }

    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error.response?.data || { success: false, message: 'Failed to update profile' };
  }
};

// 📊 DASHBOARD APIs
export const getDashboardData = async () => {
  try {
    const response = await api.get('/user/dashboard');
    return response.data;
  } catch (error) {
    console.error('Dashboard error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to load dashboard' };
  }
};

// 📚 COURSE APIs
export const getCourses = async (params = {}) => {
  try {
    const response = await api.get('/courses', { params });
    return response.data;
  } catch (error) {
    console.error('Get courses error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to load courses' };
  }
};

export const getCourse = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get course error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to load course' };
  }
};

export const enrollInCourse = async (courseId) => {
  try {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  } catch (error) {
    console.error('Enroll error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to enroll in course' };
  }
};

export const updateCourseProgress = async (courseId, progressData) => {
  try {
    const response = await api.post(`/courses/${courseId}/progress`, progressData);
    return response.data;
  } catch (error) {
    console.error('Progress error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to update progress' };
  }
};

// 📤 CONTENT SUBMISSION APIs
export const submitCourse = async (courseData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/courses/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: courseData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    console.error('Submit course error:', error);
    throw error;
  }
};

export const submitNotes = async (notesData) => {
  try {
    // No need to manually create FormData again here
    // The notesData passed from AddContent.js is already a FormData object
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/notes/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type header when sending FormData
        // The browser will set it automatically with proper boundary
      },
      body: notesData, // notesData is already FormData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw data;
    }
    
    return data;
  } catch (error) {
    console.error('Error submitting notes:', error);
    throw error;
  }
};
export const downloadNotes = async (notesId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/notes/${notesId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    
    // For files, we need to handle the blob
    if (response.headers.get('content-type').includes('application/json')) {
      return await response.json();
    } else {
      // For file downloads, create blob and download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-${notesId}.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true, message: 'Download started' };
    }
  } catch (error) {
    console.error('Download notes error:', error);
    throw error;
  }
};
// 📝 NOTES APIs
export const getNotes = async (params = {}) => {
  try {
    const response = await api.get('/notes', { params });
    return response.data;
  } catch (error) {
    console.error('Get notes error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to load notes' };
  }
};

export const getNote = async (id) => {
  try {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get note error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to load note' };
  }
};




// 👨‍💼 ADMIN APIs
export const getPendingContent = async () => {
  try {
    const response = await api.get('/admin/pending');
    return response.data;
  } catch (error) {
    console.error('Pending content error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to load pending content' };
  }
};

export const approveContent = async (type, id, action, reason = '') => {
  try {
    const response = await api.post(`/admin/content/${type}/${id}/approve`, {
      action,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Approve content error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to process content' };
  }
};

export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Admin stats error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to load stats' };
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Get users error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to load users' };
  }
};



export { api };