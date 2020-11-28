import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from './store';

interface PingState {
  message: string
}

const initialState: PingState = { message: 'ping' }

const pingSlice = createSlice({
  name: 'ping',
  initialState,
  reducers: {
    update(state: PingState, action: PayloadAction<string>) {
      return {...state, message: action.payload};
    }
  }
})

export const { update } = pingSlice.actions;

export const ping = (): AppThunk => dispatch => {
  fetch('/ping')
    .then(response => response.json())
    .then(result => dispatch(update(result)));
}

export const selectMessage = (state: RootState) => state.ping.message;

export default pingSlice.reducer;