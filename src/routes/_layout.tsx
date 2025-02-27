import React from 'react';
import { Outlet } from 'react-router-dom';
import FloatingMenu from '../components/FloatingMenu';
import { GlobalConfigProvider } from '../context/GlobalConfigContext';

const Layout = () => {
  return (
    <GlobalConfigProvider>
      <div id="wrapper" className="flex flex-col min-h-screen overflow-auto">
        {/* Setting Menu */}
        <FloatingMenu />
        
        {/* Main Content */}
        <main className="flex-1 w-full h-full min-h-0 flex">
          <Outlet />
        </main>
      </div>
    </GlobalConfigProvider>
  );
};

export default Layout;
