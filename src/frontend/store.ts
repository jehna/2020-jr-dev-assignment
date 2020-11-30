import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import data from './data';

export const store = configureStore({
  reducer: {
    data,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
