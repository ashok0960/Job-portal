import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Spinner from "../Spinner/Spinner";


const AuthorizedRoute = ({ children }) => {
  const { role, email, loading } = useSelector((state) => state.user);
  const token = localStorage.getItem("token");


  if (loading) {
    return <Spinner />;
  }

 if ((role && email) || token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthorizedRoute;
