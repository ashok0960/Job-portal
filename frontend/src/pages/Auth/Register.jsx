import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "applicant",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) {
      newErrors.username = "username is required";
    } else if (form.username.length < 3) {
      newErrors.username = "username must be atleast 3 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "please enter a valid email";
    }


    if (!form.password) {
      newErrors.password = "password is required";
    } else if (form.password.includes(form.username)) {
      newErrors.password = "password must not be same as username";
    } else if (form.password.length < 8) {
      newErrors.password = "password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "passwords must match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setLoading(true);

    const validationErrors = validateForm();
    console.log(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirmPassword,
        role: form.role,
      };

      const { data } = await axios.post(
        "http://127.0.0.1:8000/api/users/register/",
        payload
      );
      console.log(data);

      setMessage("Registered Successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      if (err.response && err.response.data) {
        const resData = err.response.data;
        console.log(resData);
        if (resData.non_field_errors) {
          setErrors({ common: resData.non_field_errors.join(" ") });
        } else if (resData.detail) {
          setErrors({ common: resData.detail });
        } else if (typeof resData === "object") {
          const formattedErrors = Object.entries(resData).reduce(
            (acc, [key, value]) => {
              acc[key] = Array.isArray(value) ? value.join(" ") : value;
              return acc;
            },
            {}
          );
          setErrors(formattedErrors);
        } else {
          setErrors({ common: "Registration failed. Please try again." });
        }
      } else {
        setErrors({ common: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4">
      {message && (
        <p className="text-green-600 text-center text-sm font-medium mb-4">
          ✅ {message}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-6 mb-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          Create Your Account
        </h2>
        <div className="mb-3">
          <input
            type="text"
            name="username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
          {errors.username && (
            <p className="text-red-500 text-xs">*{errors.username}</p>
          )}
        </div>
        <div className="mb-3">
          <input
            type="email"
            name="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">*{errors.email}</p>
          )}
        </div>
        <div className="mb-3">
          <input
            type="password"
            name="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">*{errors.password}</p>
          )}
        </div>
        <div className="mb-3">
          <input
            type="password"
            name="confirmPassword"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              *{errors.confirmPassword}
            </p>
          )}
        </div>
        <div className="mb-3">
          <select
            value={form.role}
            onChange={handleChange}
            name="role"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="applicant">Applicant</option>
            <option value="employer">Employer</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">*{errors.role}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 w-full rounded text-white cursor-pointer transition border-2 
    ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 border-blue-500"
            }`}
        >
          {loading ? "Please wait..." : "Sign Up"}
        </button>

        {errors.common && (
          <p className="text-red-500 text-xs mt-1">*{errors.common}</p>
        )}
      </form>
      <p className="text-sm text-gray-700">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 hover:underline">
          Sign In
        </Link>
      </p>
    </main>
  );
};

export default Register;