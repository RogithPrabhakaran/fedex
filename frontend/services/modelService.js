import { api } from './api';

export const modelService = {
  async predict(input) {
    return api.post('/model/predict', input);
  }
};
