import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchApplicantProfile,
  saveApplicantProfile,
  clearMessage,
} from "../../features/profile/applicantProfileSlice";
import { useNavigate } from "react-router-dom";

const ApplicantProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { username, email } = useSelector((state) => state.user);
  const { profile, loading, saving, message } = useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    name: username || "",
    email: email || "",
    address: "",
    bio: "",
    skills: "",
    experience: "",
    education: "",
    profilePic: null,
    resume: null,
  });

  const [errors, setErrors] = useState({});

  // Fetch profile on mount
  useEffect(() => {
    if (username && email) {
      dispatch(fetchApplicantProfile());
    }
  }, [dispatch, username, email]);

  // Sync profile data to form when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: username || "",
        email: email || "",
        address: profile.user_location || "",
        bio: profile.user_bio || "",
        skills: profile.user_skills_list?.join(", ") || "",
        experience: profile.work_experience || "",
        education: profile.user_education || "",
      }));
    }
  }, [profile, username, email]);

  // FIXED: Handle typing and file selection
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear specific error when user interacts
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // FIXED: Validation logic for updates
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.education?.trim()) newErrors.education = "Education is required";
    if (!formData.bio?.trim()) newErrors.bio = "Bio is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.experience?.trim()) newErrors.experience = "Experience is required";

    const skillCount = formData.skills.split(",").filter(s => s.trim().length > 0).length;
    if (skillCount < 3) newErrors.skills = "At least 3 skills are required";

    // Only require files if they don't already exist in the profile
    if (!profile?.user_image && !formData.profilePic) {
      newErrors.profilePic = "Profile picture is required";
    }
    if (!profile?.user_resume && !formData.resume) {
      newErrors.resume = "Resume is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("user_bio", formData.bio);
    formDataToSend.append("user_education", formData.education);
    formDataToSend.append("work_experience", formData.experience);
    formDataToSend.append("user_location", formData.address);
    formDataToSend.append("user_skills", formData.skills);

    if (formData.profilePic) {
      formDataToSend.append("user_image", formData.profilePic);
    }
    if (formData.resume) {
      formDataToSend.append("user_resume", formData.resume);
    }

    const isUpdate = !!profile;
    dispatch(saveApplicantProfile({ formData: formDataToSend, isUpdate }));
  };

  useEffect(() => {
    if (message && message.includes("✅")) {
      const timer = setTimeout(() => {
        dispatch(clearMessage());
        navigate("/applicant-details");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [message, navigate, dispatch]);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="pt-5 w-full max-w-md">
        {message && (
          <div className={`mb-4 text-sm px-4 py-2 rounded ${
            message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-6 mb-4 space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            {loading ? "Loading..." : profile ? "Update Your Profile" : "Complete Your Profile"}
          </h2>

          {[
            { label: "Name", name: "name", type: "text", disabled: true },
            { label: "Email", name: "email", type: "email", disabled: true },
            { label: "Address", name: "address", type: "text" },
            { label: "Bio", name: "bio", type: "textarea" },
            { label: "Education", name: "education", type: "text" },
            { label: "Skills (comma separated)", name: "skills", type: "text", placeholder: "e.g., Java, React, SQL" },
            { label: "Work Experience", name: "experience", type: "text" },
          ].map(({ label, name, type, ...rest }) => (
            <div key={name}>
              <label className="block text-gray-700 text-sm font-bold mb-1">{label}</label>
              {type === "textarea" ? (
                <textarea
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    rest.disabled ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  {...rest}
                />
              )}
              {errors[name] && <p className="text-red-500 text-xs mt-1">*{errors[name]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Profile Picture</label>
            {profile?.user_image && <p className="text-xs text-gray-500 mb-1 italic">Existing: {profile.user_image.split('/').pop()}</p>}
            <input type="file" name="profilePic" accept="image/*" onChange={handleChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
            {errors.profilePic && <p className="text-red-500 text-xs mt-1">*{errors.profilePic}</p>}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Resume</label>
            {profile?.user_resume && <p className="text-xs text-gray-500 mb-1 italic">Existing: {profile.user_resume.split('/').pop()}</p>}
            <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
            {errors.resume && <p className="text-red-500 text-xs mt-1">*{errors.resume}</p>}
          </div>

          <button type="submit" disabled={saving} className="w-full py-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition disabled:bg-blue-300">
            {saving ? "Processing..." : profile ? "Update Profile" : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ApplicantProfile;