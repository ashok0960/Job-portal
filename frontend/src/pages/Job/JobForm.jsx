import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addJobs, editJobs } from "../../features/job/jobSlice";
import { useNavigate } from "react-router-dom";

const JobForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    work_mode: "",
    role: "",
    experience: "",
    application_deadline: "",
    number_of_openings: 1,
    job_skills: "",
    status: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { status, editJob } = useSelector((state) => state.jobs);
  console.log(editJob);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Salary will now be a free numeric input (single value)

  const workModeOptions = [
    { value: "WFO", label: "Work from Office" },
    { value: "hybrid", label: "Hybrid" },
    { value: "remote", label: "Remote" },
  ];

  const experienceOptions = [
    { value: "0-1", label: "0-1 years" },
    { value: "1-3", label: "1-3 years" },
    { value: "3-5", label: "3-5 years" },
    { value: "5-7", label: "5-7 years" },
    { value: "7-10", label: "7-10 years" },
    { value: "10+", label: "10+ years" },
  ];

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
    { value: "filled", label: "Filled" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5 || formData.title.length > 255) {
      newErrors.title = "Title must be between 5-255 characters";
    }

    if (!formData.description) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.location) {
      newErrors.location = "Location is required";
    } else if (formData.location.length < 2 || formData.location.length > 200) {
      newErrors.location = "Location must be between 2-200 characters";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    } else if (formData.role.length < 2 || formData.role.length > 255) {
      newErrors.role = "Role must be between 2-255 characters";
    }

    if (!formData.salary) {
      newErrors.salary = "Salary is required";
    } else if (
      isNaN(parseFloat(formData.salary)) ||
      parseFloat(formData.salary) <= 0
    ) {
      newErrors.salary = "Enter a valid positive salary amount";
    }

    if (!formData.work_mode) {
      newErrors.work_mode = "Work mode is required";
    }

    if (!formData.experience) {
      newErrors.experience = "Experience is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.application_deadline) {
      newErrors.application_deadline = "Application deadline is required";
    } else {
      const deadlineDate = new Date(formData.application_deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        newErrors.application_deadline = "Deadline cannot be in the past";
      }
    }

    if (!formData.number_of_openings) {
      newErrors.number_of_openings = "Number of openings is required";
    } else if (formData.number_of_openings < 1) {
      newErrors.number_of_openings = "Must have at least 1 opening";
    }

    if (!formData.job_skills) {
      newErrors.job_skills = "Skills are required";
    } else {
      const skills = formData.job_skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill);
      if (skills.length < 3) {
        newErrors.job_skills =
          "Please provide at least 3 skills separated by commas";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (editJob) {
      setFormData({
        ...editJob,
        salary:
          editJob.salary ||
          editJob.min_salary ||
          "",
        work_mode: editJob.work_mode || "",
        experience: editJob.experience || "",
        status: editJob.status || "",
        application_deadline: editJob.application_deadline
          ? editJob.application_deadline.split("T")[0]
          : "",
        number_of_openings: editJob.number_of_openings || 1,
        job_skills: Array.isArray(editJob.job_skills)
          ? editJob.job_skills.join(", ")
          : editJob.job_skills || "",
      });
    }
  }, [editJob]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (isSubmitting) {
    console.log("⏳ Your request is being processed. Please wait...");
    return;
  }

  const isValid = validateForm();
  if (!isValid) {
    return;
  }

  const data = {
    ...formData,
    number_of_openings: parseInt(formData.number_of_openings, 10),
  };

  setIsSubmitting(true);
  setMessage("");

  try {
    if (editJob && editJob.id) {
      await dispatch(editJobs({ id: editJob.id, ...data })).unwrap();
      setMessage("✅ Job updated successfully");
    } else {
      await dispatch(addJobs(data)).unwrap();
      setMessage("✅ Job posted successfully");
      
      setFormData({
        title: "",
        description: "",
        location: "",
        salary: "",
        work_mode: "",
        role: "",
        experience: "",
        application_deadline: "",
        number_of_openings: 1,
        job_skills: "",
        status: "",
      });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
    
  } catch (err) {
    setMessage("❌ Failed to create job");
    if (typeof err === "string") {
      setErrors({ general: err });
    } else if (err && typeof err === "object") {
      setErrors(err);
      if (err.detail) setMessage(`❌ ${err.detail}`);
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-lg my-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {editJob ? "Edit Job" : "Post a New Job"}
      </h1>
      {message && (
        <div
          className={`mb-4 text-sm px-4 py-2 rounded ${
            message.includes("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6"
      >
        {[
          {
            label: "Job Title",
            name: "title",
            type: "text",
            placeholder: "e.g. Software Developer",
          },
          {
            label: "Job Location",
            name: "location",
            type: "text",
            placeholder: "e.g., kathmandu, Lalitpur and others",
          },
          {
            label: "Job Description",
            name: "description",
            type: "textarea",
            placeholder:
              "Describe the responsibilities, requirements, and expectations for this job role...",
          },
          {
            label: "Role/Position",
            name: "role",
            type: "text",
            placeholder: "e.g., Frontend Developer, Data Scientist",
          },
          {
            label: "Salary",
            name: "salary",
            type: "number",
            placeholder: "e.g., 50000",
            min: "0",
            step: "0.01",
          },
          {
            label: "Work Mode",
            name: "work_mode",
            type: "select",
            options: workModeOptions,
          },
          {
            label: "Experience Required",
            name: "experience",
            type: "select",
            options: experienceOptions,
          },
          {
            label: "Application Deadline",
            name: "application_deadline",
            type: "date",
            min: new Date().toISOString().split("T")[0],
          },
          {
            label: "Number of Openings",
            name: "number_of_openings",
            type: "number",
            min: "1",
            max: "100",
          },
          {
            label: "Job Status",
            name: "status",
            type: "select",
            options: statusOptions,
          },
          {
            label: "Required Skills",
            name: "job_skills",
            type: "text",
            placeholder: "e.g., React, Node.js, AWS",
          },
        ].map(({ label, name, type, ...rest }) => (
          <div
            key={name}
            className={
              "description".includes(name) ||
              "application_deadline".includes(name) ||
              "job_skills".includes(name)
                ? "md:col-span-2"
                : ""
            }
          >
            <label className="block text-gray-700 text-sm font-bold mb-1">
              {label} *
            </label>
            {type === "textarea" ? (
              <textarea
                name={name}
                value={formData[name]}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors[name] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={rest.placeholder}
              />
            ) : type === "select" ? (
              <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors[name] ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select an option</option>
                {Array.isArray(rest.options) &&
                  rest.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            ) : (
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  rest.disabled ? "bg-gray-100 cursor-not-allowed" : ""
                } ${errors[name] ? "border-red-500" : "border-gray-300"}`}
                {...rest}
              />
            )}
            {errors[name] && (
              <p className="text-red-600 text-sm mt-1">{errors[name]}</p>
            )}
          </div>
        ))}

        <div className="md:col-span-2">
          <button
            type="submit"
            className="px-6 py-2 m-2 w-full bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={isSubmitting || status === "loading"}
          >
            {isSubmitting || status === "loading"
              ? "Processing..."
              : editJob
              ? "Update Job"
              : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
