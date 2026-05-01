import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ApplyJobForm = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null,
  });

  const [errors, setErrors] = useState({}); // Field errors
  const [message, setMessage] = useState(""); // Success or general error
  const [loading, setLoading] = useState(false); // Loading state

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] })); // File input
    } else {
      setFormData((prev) => ({ ...prev, [name]: value })); // Text input
    }

    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear field error
  };

  // Frontend validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.resume) newErrors.resume = "Resume is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("resume", formData.resume);
    if (jobId) {
      data.append("job", jobId);
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/apply-job/", // Django endpoint
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message); // Show success message
      setFormData({ name: "", email: "", phone: "", resume: null }); // Reset form
      setTimeout(() => {
        navigate("/dashboard"); // Adjust this path to match your App.js routes
      }, 400);
      setErrors({});
    } catch (err) {
      console.log(err.response.data);

      const backendMessage =
        err.response?.data?.message || "❌ Error applying for job";
      const backendErrors = err.response?.data?.errors || {};

      setMessage(backendMessage); // Show backend general error
      setErrors(backendErrors); // Show backend field-specific errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center px-4 py-6 bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Apply for Job</h2>

        {message && (
          <div
            className={`mb-4 px-4 py-2 rounded text-sm ${message.includes("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
              }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.phone ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Resume */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Resume</label>
            <input
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className={`w-full text-gray-500 file:py-2 file:px-4 file:bg-blue-600 file:text-white rounded-md ${errors.resume ? "border-red-500" : ""
                }`}
            />
            {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
          >
            {loading ? "Submitting..." : "Apply Now"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ApplyJobForm;
