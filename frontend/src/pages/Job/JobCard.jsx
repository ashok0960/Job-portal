import React from "react";
import { Link } from "react-router-dom"; // Add this

const JobCard = ({ job, isEmployer, handleEdit, handleDelete }) => {
  const getDaysAgo = () => {
    if (!job.created_at) return "recently";

    const postedDate = new Date(job.created_at);
    if (isNaN(postedDate.getTime())) return "recently";

    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - postedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const daysAgo = getDaysAgo();



  const formatSalary = () => {
    if (job.min_salary !== undefined && job.max_salary !== undefined) {
      if (Number(job.max_salary) >= 100) {
        return `Rs.${job.min_salary}`;
      }
      return `Rs.${job.min_salary} - Rs.${job.max_salary}`;
    }
    return job.salary_range ? `${job.salary_range.replace("-", " - ")} ` : "Salary not specified";
  };

  const companyName = job.company_name || job.employer?.company_name || "Company not specified";
  const companyLogo = job.company_logo || job.employer?.company_logo;
 
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500 flex flex-col justify-between">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h2>
            <p className="text-gray-600 text-sm">{companyName}</p>
          </div>

          {/* Logo Logic */}
          <div className="flex items-center justify-center w-10 h-10 rounded-md overflow-hidden bg-blue-600">
            {companyLogo ? (
              <img
                src={`http://127.0.0.1:8000${companyLogo}`}
                alt={companyName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="text-white font-bold">${companyName.charAt(0)}</span>`;
                }}
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {companyName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            {job.experience || "0-1 years"}
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            {job.location || "Location not specified"}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.work_mode === "remote" ? "bg-purple-100 text-purple-800" :
            job.work_mode === "hybrid" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
            }`}>
            {job.work_mode ? job.work_mode.toUpperCase() : "OFFICE"}
          </span>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3 text-sm leading-relaxed">
          {job.description || "No description provided"}
        </p>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="font-semibold text-blue-600 text-sm">Expected Salary:{formatSalary()}</p>
            <p className="text-xs text-gray-500 font-medium">Posted {daysAgo}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${job.status === "open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
            {job.status || "OPEN"}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-xs text-gray-500 italic">
            Skills: {job.job_skills || "General"}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        {!isEmployer ? (
          job.status === "open" ? (
            <Link
              to={`/apply-job/${job.id}`}
              className="block text-center font-bold bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors"
            >
              Apply Now
            </Link>
          ) : (
            <div className="block text-center font-bold bg-gray-200 text-gray-500 rounded-lg py-2 cursor-not-allowed">
              Applications Closed
            </div>
          )
        ) : (
          <div className="flex justify-between gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleEdit}
              className="flex-1 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm transition"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(JobCard);