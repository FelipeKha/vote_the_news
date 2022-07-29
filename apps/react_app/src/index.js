import React from 'react';
import ReactDOM from 'react-dom';

import MainGrid from './components/MainGrid';
import { UserProvider } from './context/UserContext';


ReactDOM.render(
  <UserProvider>
    <MainGrid />
  </UserProvider>,
  document.getElementById('root')
);
