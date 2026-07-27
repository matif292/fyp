// import axios from 'axios';

// const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// const client = axios.create({
//   baseURL: BASE_URL,
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor
// client.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('tripzo_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     if (config.data instanceof FormData) {
//       delete config.headers['Content-Type'];
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// client.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('tripzo_token');
//       localStorage.removeItem('tripzo_user');
//       if (!window.location.pathname.startsWith('/login')) {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export function apiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
//   return err?.response?.data?.message || err?.message || fallback;
// }

// const BACKEND_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');
// export function resolveUploadUrl(path) {
//   if (!path) return null;
//   if (/^https?:\/\//.test(path)) return path;
//   return `${BACKEND_ORIGIN}/${path.replace(/^\/+/, '')}`;
// }

// export default client;


import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tripzo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tripzo_token');
      localStorage.removeItem('tripzo_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || err?.message || fallback;
}

// ✅ FIXED: Correct image URL resolution
const BACKEND_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');
console.log('🔗 Backend Origin:', BACKEND_ORIGIN);

export function resolveUploadUrl(path) {
  if (!path) {
    return null;
  }

  // If it's already a full URL, return it
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  // Normalize Windows-style backslashes before building the URL, and
  // remove leading slashes.
  const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  
  // If it starts with 'uploads/', prepend the backend origin
  if (cleanPath.startsWith('uploads/')) {
    return `${BACKEND_ORIGIN}/${cleanPath}`;
  }
  
  // Default: prepend backend origin
  return `${BACKEND_ORIGIN}/${cleanPath}`;
}

export default client;