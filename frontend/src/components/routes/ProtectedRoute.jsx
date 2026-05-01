import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const role = useSelector((state) => state.user.role);
  const email = useSelector((state) => state.user.email);

  const token = localStorage.getItem("token");

  if ((!role || !email) && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
