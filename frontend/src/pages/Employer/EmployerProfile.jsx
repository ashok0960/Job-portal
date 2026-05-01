import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {clearMessage,fetchEmployerProfile,saveEmployerProfile,} from "../../features/profile/employerProfileSlice";

const EmployerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { username, email } = useSelector((state) => state.user);
  console.log(username, email);

  const { profile, loading, saving, message } = useSelector(
    (state) => state.employer
  );
  const [formData, setFormData] = useState({
    employer_name: username || "",
    employer_email: email || "",
    company_name: "",
    company_location: "",
    company_description: "",
    employer_contact: "",
    company_website_url: "",
    company_startdate: "",
    company_linkedin: "",
    company_size: "",
    employer_image: null,
    company_logo: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (username && email) {
      dispatch(fetchEmployerProfile());
    }
  }, [dispatch, username, email]);

  useEffect(() => {
    if (profile) {
      console.log(profile)
      setFormData((prev) => ({
        ...prev,
        employer_name: profile.username || "",
        employer_email: profile.employer_email || "",
        company_name: profile.company_name || "",
        company_location: profile.company_location || "",
        company_description: profile.company_description || "",
        employer_contact: profile.employer_contact || "",
        company_website_url: profile.company_website_url || "",
        company_startdate: profile.company_startdate || "",
        company_linkedin: profile.company_linkedin || "",
        company_size:
          profile.company_size?.replace(" employees", "").trim() || "",
        employer_image: null,
        company_logo: null,
      }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];

      if (name === "employer_image" || name === "company_logo") {
        const allowedExtensions = ["jpg", "jpeg", "png"];
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
          setErrors((prev) => ({
            ...prev,
            [name]: "Only JPG, JPEG, PNG images are allowed",
          }));
          return;
        }
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }

    if (!formData.company_location.trim()) {
      newErrors.company_location = "Company location is required";
    }

    if (!formData.company_description.trim()) {
      newErrors.company_description = "Company description is required";
    }

    if (!formData.employer_contact.trim()) {
      newErrors.employer_contact = "Contact information is required";
    }

    if (!formData.employer_image && !profile?.employer_image) {
      newErrors.employer_image = "Profile picture is required";
    }

    if (!formData.company_logo && !profile?.company_logo) {
      newErrors.company_logo = "Company logo is required";
    }

    if (formData.company_website_url.trim()) {
      try {
        new URL(formData.company_website_url);
      } catch {
        newErrors.company_website_url = "Please enter a valid website URL";
      }
    }

    if (formData.company_linkedin.trim()) {
      try {
        const linkedInUrl = new URL(formData.company_linkedin);
        if (!linkedInUrl.hostname.includes("linkedin.com")) {
          newErrors.company_linkedin = "Please enter a valid LinkedIn URL";
        }
      } catch {
        newErrors.company_linkedin = "Please enter a valid LinkedIn URL";
      }
    }

    if (formData.company_startdate.trim()) {
      const date = new Date(formData.company_startdate);
      if (isNaN(date.getTime())) {
        newErrors.company_startdate = "Please enter a valid date";
      }
    }

    const allowedSizes = [
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1000+",
    ];
    if (
      formData.company_size.trim() &&
      !allowedSizes.includes(formData.company_size)
    ) {
      newErrors.company_size = "Please select a valid company size";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("company_name", formData.company_name);
    formDataToSend.append("company_location", formData.company_location);
    formDataToSend.append("company_description", formData.company_description);
    formDataToSend.append("employer_contact", formData.employer_contact);
    formDataToSend.append(
      "company_website_url",
      formData.company_website_url || ""
    );
    formDataToSend.append(
      "company_startdate",
      formData.company_startdate || ""
    );
    formDataToSend.append("company_linkedin", formData.company_linkedin || "");
    formDataToSend.append("company_size", formData.company_size || "");

    if (formData.employer_image) {
      formDataToSend.append("employer_image", formData.employer_image);
    }
    if (formData.company_logo) {
      formDataToSend.append("company_logo", formData.company_logo);
    }

    const isUpdate = !!profile;

    dispatch(saveEmployerProfile({ formData: formDataToSend, isUpdate }));
  };

  useEffect(() => {
    if (message.includes("✅")) {
      setTimeout(() => {
        dispatch(clearMessage());
        navigate("/employer-details");
      }, 1500);
    }
  }, [message, navigate, dispatch]);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="pt-5 w-full max-w-md">
        {message && (
          <div
            className={`mb-4 text-sm px-4 py-2 rounded ${message.includes("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-6 mb-4 space-y-4"
        >
          <h2 className="text-2xl font-bold text-center mb-4">
            {loading
              ? "Loading profile..."
              : profile
                ? "Update Your Profile"
                : "Complete Your Profile"}
          </h2>

          {[
            {
              label: "Name",
              name: "employer_name",
              type: "text",
              disabled: true,
            },
            {
              label: "Email",
              name: "employer_email",
              type: "email",
              disabled: true,
            },
            { label: "Company Name", name: "company_name", type: "text" },
            {
              label: "Company Description",
              name: "company_description",
              type: "textarea",
            },
            {
              label: "Company Location",
              name: "company_location",
              type: "text",
            },
            {
              label: "Employer Contact",
              name: "employer_contact",
              type: "text",
            },
            {
              label: "Company Website URL",
              name: "company_website_url",
              type: "text",
            },
            {
              label: "Company StartDate",
              name: "company_startdate",
              type: "date",
            },
            {
              label: "Company Linkedin URL",
              name: "company_linkedin",
              type: "text",
            },
            {
              label: "Company Size",
              name: "company_size",
              type: "select",
              options: [
                "1-10",
                "11-50",
                "51-200",
                "201-500",
                "501-1000",
                "1000+",
              ],
            },
          ].map(({ label, name, type, ...rest }) => (
            <div key={name}>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                {label}
              </label>
              {type === "textarea" ? (
                <textarea
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : type === "select" ? (
                <select
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select size</option>
                  {rest.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${rest.disabled ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  {...rest}
                />
              )}
              {errors[name] && (
                <p className="text-red-500 text-xs mt-1">*{errors[name]}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">
              Profile Picture
            </label>
            {profile?.employer_image && (
              <p className="text-sm text-gray-600 mb-2">
                Current: {profile.employer_image}
              </p>
            )}
            <input
              type="file"
              name="employer_image"
              accept="image/png, image/jpeg"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500
        file:me-4 file:py-2 file:px-4
        file:rounded-lg file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-600 file:text-white
        hover:file:bg-blue-700
        file:disabled:opacity-50 file:disabled:pointer-events-none
        dark:text-neutral-500
        dark:file:bg-blue-500
        dark:hover:file:bg-blue-400"
            />
            {errors.employer_image && (
              <p className="text-red-500 text-xs mt-1">
                *{errors.employer_image}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">
              CompanyLogo
            </label>
            {profile?.company_logo && (
              <p className="text-sm text-gray-600 mb-2">
                Current: {profile.company_logo}
              </p>
            )}
            <input
              type="file"
              name="company_logo"
              accept="image/png, image/jpeg"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500
        file:me-4 file:py-2 file:px-4
        file:rounded-lg file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-600 file:text-white
        hover:file:bg-blue-700
        file:disabled:opacity-50 file:disabled:pointer-events-none
        dark:text-neutral-500
        dark:file:bg-blue-500
        dark:hover:file:bg-blue-400"
            />
            {errors.company_logo && (
              <p className="text-red-500 text-xs mt-1">
                *{errors.company_logo}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition"
          >
            {saving
              ? "Processing..."
              : profile
                ? "Update Profile"
                : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default EmployerProfile;
