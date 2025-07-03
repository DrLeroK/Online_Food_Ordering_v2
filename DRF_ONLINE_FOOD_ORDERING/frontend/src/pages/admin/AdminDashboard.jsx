import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Admin/Sidebar';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto lg:ml-0">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;