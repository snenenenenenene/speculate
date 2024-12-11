import { create } from 'zustand';
import createChartSlice from './chartSlice';

export const useChartStore = create(createChartSlice);
