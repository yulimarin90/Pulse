import React from 'react'
import ReactDOM from 'react-dom/client';
import  BlogApp  from './BlogApp'
import { BrowserRouter } from 'react-router-dom'
// import './blog/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BlogApp />
    </BrowserRouter>
  </React.StrictMode>,
);
