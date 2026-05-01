import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../../features/auth/userSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPasword] = useState("");
  const [error, setError] = useState("");
  const [loading,setLoading] = useState(false)
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("please fill in both email and password");
      setLoading(false);
      return;
    }

    try {
      const { data, status } = await axios.post(
        "http://127.0.0.1:8000/api/users/login/",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(data);
      console.log(status);

      if (status !== 200) {
        const errorMsg =
          data.message ||
          (data.errors ? JSON.stringify(data.errors) : "Login failed");
        throw new Error(errorMsg);
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("username", data.user.username);

      dispatch(
        setUser({
          token: data.token,
          role: data.user.role,
          email: data.user.email,
          username: data.user.username,
        })
      );

      navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        const resData = err.response.data;
        console.log(resData)
        if (resData.non_field_errors) {
          setError(resData.non_field_errors.join(" "));
        } else if (resData.detail) {
          setError(resData.detail);
        } else if (typeof resData === "object") {
          const formatted = Object.entries(resData)
            .map(([, value]) => (Array.isArray(value) ? value.join(" ") : value))
            .join(" ");
          setError(formatted);
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    }finally{
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded px-8 pt-6 pb-6 mb-4 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          Login to Your Account
        </h2>
        {error && <p className="text-red-500 text-xs">*{error}</p>}
        <input
          type="email"
          name="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          name="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Password"
          value={password}
          onChange={(e) => setPasword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 w-full rounded text-white cursor-pointer transition border-2 
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600 border-blue-500"
    }`}
        >
          {loading ? "Please wait..." : "Sign In"}
        </button>
      </form>
      <p className="text-sm text-gray-700">
        Need an account?{" "}
        <Link to="/register" className="text-blue-500 hover:underline">
          Sign Up
        </Link>
      </p>
    </main>
  );
};

export default Login;
