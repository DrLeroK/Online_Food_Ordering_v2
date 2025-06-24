import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constants";


function ProtectedRoute({ isAuthenticated }) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // Verify token is valid (not expired)
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        
        if (isExpired) {
            localStorage.removeItem(ACCESS_TOKEN);
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        localStorage.removeItem(ACCESS_TOKEN);
        return <Navigate to="/login" replace />;
    }

    // If parent component thinks we're authenticated, proceed
    if (isAuthenticated) {
        return <Outlet />;
    }

    // Otherwise show loading state while verifying
    return <div>Loading...</div>;
}

export default ProtectedRoute;