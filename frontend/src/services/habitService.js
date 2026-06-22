import axios from './api';

const habitService = {
  getHabits: async () => {
    const response = await axios.get('/api/habits');
    return response.data;
  },

  createHabit: async (habitData) => {
    const response = await axios.post('/api/habits', habitData);
    return response.data;
  },

  markComplete: async (habitId) => {
    const response = await axios.put(`/api/habits/${habitId}/complete`);
    return response.data;
  },

  getHabitAnalysis: async () => {
    const response = await axios.get('/api/habits/analysis');
    return response.data.analysis;
  }
};

export default habitService;
