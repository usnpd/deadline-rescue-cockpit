import axios from './api';

const taskService = {
  getTasks: async () => {
    const response = await axios.get('/api/tasks');
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await axios.post('/api/tasks', taskData);
    return response.data;
  },

  extractTasks: async (text) => {
    const response = await axios.post('/api/tasks/ai-extract', { text });
    return response.data;
  },

  getSchedule: async () => {
    const response = await axios.get('/api/tasks/schedule');
    return response.data.schedule;
  },

  getRescueMode: async (taskId) => {
    const response = await axios.get(`/api/tasks/rescue/${taskId}`);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await axios.put(`/api/tasks/${taskId}`, taskData);
    return response.data;
  },

  updateTaskStatus: async (taskId, status) => {
    const response = await axios.put(`/api/tasks/${taskId}/status`, { status });
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await axios.delete(`/api/tasks/${taskId}`);
    return response.data;
  },

  getMorningBriefing: async () => {
    const response = await axios.get('/api/tasks/briefing');
    return response.data.briefing;
  }
};

export default taskService;
