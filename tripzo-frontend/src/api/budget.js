import client from './client';

export const getBudgetRecommendations = (destination, durationDays, budgetType) =>
  client.get('/budget/recommendations', { 
    params: { destination, duration_days: durationDays, budget_type: budgetType } 
  });
export const saveBudgetPreference = (data) => client.post('/budget/save', data);