import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import pingReducer from './pingSlice';

export const store = configureStore({
  reducer: {
    ping: pingReducer
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
