import axios from './api';

const aiService = {
  chat: async (message, userContext) => {
    const response = await axios.post('/api/ai/chat', { message, userContext });
    return response.data;
  },

  getBriefing: async () => {
    const response = await axios.get('/api/ai/briefing');
    return response.data.briefing;
  },

  prioritizeTasks: async () => {
    const response = await axios.get('/api/ai/prioritize');
    return response.data;
  }
};

export default aiService;
