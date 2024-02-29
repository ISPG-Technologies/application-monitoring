import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import 'tailwindcss/tailwind.css';
import { RouteGuard } from '../components/auth/RouteGuard';
import '../styles/globals.css';
import '../styles/toast.css';
import { ToastContainer } from 'react-toastify';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <RouteGuard>
        <Component {...pageProps} />
      </RouteGuard>
      <ToastContainer
        position="top-right"
        autoClose={false}
        hideProgressBar={false}
        newestOnTop={false}
        draggable={false}
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

export default MyApp;
