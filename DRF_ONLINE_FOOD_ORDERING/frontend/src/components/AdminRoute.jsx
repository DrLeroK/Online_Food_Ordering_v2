import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '../constants';

const AdminRoute = ({ isAuthenticated, isAdmin }) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (!decoded.is_admin) {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;
