const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('adminToken');
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Une erreur est survenue.');
  }
  return res.status === 204 ? null : res.json();
}

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return request('/upload', { method: 'POST', body: formData });
};

// Leads
export const createLead = (payload) => request('/leads', { method: 'POST', body: JSON.stringify(payload) });
export const fetchLeads = () => request('/leads');
export const updateLeadStatus = (id, status) => request(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteLead = (id) => request(`/leads/${id}`, { method: 'DELETE' });

// Softwares
export const fetchSoftwares = () => request('/softwares');
export const updateSoftware = (id, data) => request(`/softwares/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Blog
export const fetchPosts = () => request('/blog');
export const fetchPostBySlug = (slug) => request(`/blog/slug/${slug}`);
export const createPost = (data) => request('/blog', { method: 'POST', body: JSON.stringify(data) });
export const updatePost = (id, data) => request(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePost = (id) => request(`/blog/${id}`, { method: 'DELETE' });

// Testimonials
export const fetchTestimonials = () => request('/testimonials');
export const createTestimonial = (data) => request('/testimonials', { method: 'POST', body: JSON.stringify(data) });
export const updateTestimonial = (id, data) => request(`/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTestimonial = (id) => request(`/testimonials/${id}`, { method: 'DELETE' });

// FAQs
export const fetchFaqs = () => request('/faqs');
export const createFaq = (data) => request('/faqs', { method: 'POST', body: JSON.stringify(data) });
export const updateFaq = (id, data) => request(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteFaq = (id) => request(`/faqs/${id}`, { method: 'DELETE' });

// Settings
export const fetchSettings = () => request('/settings');
export const updateSettings = (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) });

// Visitor Stats
export const fetchVisitorStats = (from, to) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return request(`/visitor-stats${qs ? '?' + qs : ''}`);
};
