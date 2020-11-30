import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import moment from 'moment';
import { Item } from '../shared/types';
import { AppThunk } from './store';

interface DataSlice {
  items: Item[];
  timestamp: string;
  isLoading: boolean;
}

const initialState: DataSlice = { items: [], timestamp: '', isLoading: false };

const dataSlice = createSlice({
  name: 'items',
  initialState,
  // Apparently you're allowed to mutate state with slice reducers
  reducers: {
    setItems(state: DataSlice, action: PayloadAction<Item[]>) {
      state.items = action.payload;
    },
    updateTimestamp(state: DataSlice) {
      state.timestamp = moment().toISOString();
    },
    setLoad(state: DataSlice, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    }
  }
})

export const { setItems, updateTimestamp, setLoad } = dataSlice.actions;

export const updateItems = (): AppThunk => dispatch => {
  dispatch(setLoad(true));
  fetch('/api')
    .then(response => response.json())
    .then(obj => {
      const items = obj as Item[];
      dispatch(setItems(items));
      dispatch(updateTimestamp());
      dispatch(setLoad(false));
    });
}

export default dataSlice.reducer;