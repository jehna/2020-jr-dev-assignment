import React from 'react';
import ReactDOM from 'react-dom';
import App from './frontend/App';
import { store } from './frontend/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './frontend/serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();
