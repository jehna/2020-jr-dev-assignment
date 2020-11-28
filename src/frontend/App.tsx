import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ping, selectMessage } from './pingSlice';

function App() {
  const state = useSelector(selectMessage);
  const dispatch = useDispatch();
  return (
    <div>
      <h1>
        {state}
      </h1>
      <button
        onClick={() => dispatch(ping())}
      >
        Click
      </button>
    </div>
  );
}

export default App;
