import { Link } from 'react-router-dom';
// ... existing code ...
<Link to="/forgot-password" className="font-medium text-red-600 hover:text-red-500">
  Forgot your password?
</Link>





import ForgotPassword from './pages/ForgotPassword';
// ... existing code ...
<Route path="/forgot-password" element={<ForgotPassword />} />