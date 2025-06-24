import React from 'react';
import { NavLink } from 'react-router-dom';


const Sidebar = () => {

  // const location = useLocation();
  // console.log('Current path:', location.pathname);


  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <ul className="space-y-2">
        <li>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => 
              `block px-4 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/sales-analytics"
            className={({ isActive }) => 
              `block px-4 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            Sales Analytics
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/items"
            className={({ isActive }) => 
              `block px-4 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            Manage Items
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/top-items"
            className={({ isActive }) => 
              `block px-4 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            Top Selling Items
          </NavLink>
        </li>
        
        {/* <li>
          <NavLink
            to="/admin/sales"
            className={({ isActive }) => 
              `block px-4 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            Sales Analytics
          </NavLink>
        </li> */}
        

      </ul>
    </div>
  );
};

export default Sidebar;