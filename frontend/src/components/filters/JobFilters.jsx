import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, resetFilters } from "../../features/job/jobSlice";

const JobFilters = ({ onClose }) => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.jobs.filters);
  const jobs = useSelector((state) => state.jobs.jobs);

  const allSkills = [
    ...new Set(
      jobs
        .flatMap((job) =>
          job.job_skills
            ? job.job_skills.split(",").map((s) => s.trim().toLowerCase())
            : []
        )
        .filter(Boolean)
    ),
  ];

  const allLocations = [
    ...new Set(
      jobs
        .map((job) => job.location?.split(",")[0]?.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  const experienceOptions = [
    { value: "", label: "All Experience Levels" },
    { value: "0-1", label: "0-1 years" },
    { value: "1-3", label: "1-3 years" },
    { value: "3-5", label: "3-5 years" },
    { value: "5-7", label: "5-7 years" },
    { value: "7-10", label: "7-10 years" },
    { value: "10+", label: "10+ years" },
  ];

  const [localFilters, setLocalFilters] = useState({
    ...filters,
    skills: filters.skills || [],
    location: filters.location || [],
    jobStatus: filters.jobStatus || "all",
    freshness: filters.freshness || "all",
  });

  const updateLocal = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
    onClose();
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setLocalFilters({
      searchQuery: "",
      experience: "",
      salaryRange: [30, 100],
      location: [],
      skills: [],
      workMode: "all",
      jobStatus: "all",
      freshness: "all",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-lg my-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Filter Jobs</h1>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">
            Search Jobs
          </label>
          <input
            type="text"
            placeholder="Job title or company"
            value={localFilters.searchQuery}
            onChange={(e) => updateLocal("searchQuery", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">
            Work Mode
          </label>
          <select
            value={localFilters.workMode}
            onChange={(e) => updateLocal("workMode", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Work Modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="wfo">Work from Office</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">
            Experience
          </label>
          <select
            value={localFilters.experience || ""}
            onChange={(e) => updateLocal("experience", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {experienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">
            Salary Range (thounsand): {localFilters.salaryRange[0]} - {localFilters.salaryRange[1]}
          </label>
          <div className="flex flex-col gap-4 mt-2">
            <input
              type="range"
              min="30"
              max="100"
              value={localFilters.salaryRange[0]}
              onChange={(e) =>
                updateLocal("salaryRange", [
                  Number(e.target.value),
                  localFilters.salaryRange[1],
                ])
              }
              className="w-full"
            />
            <input
              type="range"
              min="30"
              max="100"
              value={localFilters.salaryRange[1]}
              onChange={(e) =>
                updateLocal("salaryRange", [
                  localFilters.salaryRange[0],
                  Number(e.target.value),
                ])
              }
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">
            Job Status
          </label>
          <select
            value={localFilters.jobStatus}
            onChange={(e) => updateLocal("jobStatus", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="filled">Filled</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">
            Freshness (days)
          </label>
          <select
            value={localFilters.freshness}
            onChange={(e) => updateLocal("freshness", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Any Time</option>
            <option value="1">Last 1 day</option>
            <option value="3">Last 3 days</option>
            <option value="7">Last 7 days</option>
            <option value="15">Last 15 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">
            Locations
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
            {allLocations.length > 0 ? (
              allLocations.map((loc) => (
                <div key={loc} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`location-${loc}`}
                    checked={localFilters.location.includes(loc)}
                    onChange={() => toggleArrayValue("location", loc)}
                    className="mr-2"
                  />
                  <label htmlFor={`location-${loc}`} className="text-sm">
                    {loc.charAt(0).toUpperCase() + loc.slice(1)}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No locations found</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">
            Skills
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
            {allSkills.length > 0 ? (
              allSkills.map((skill) => (
                <div key={skill} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`skill-${skill}`}
                    checked={
                      Array.isArray(localFilters.skills) &&
                      localFilters.skills.includes(skill)
                    }
                    onChange={() => toggleArrayValue("skills", skill)}
                    className="mr-2"
                  />
                  <label htmlFor={`skill-${skill}`} className="text-sm">
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No skills found</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 flex gap-4 mt-4">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition flex-1"
          >
            Reset Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex-1"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;