import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  clearEditJob,
  deleteJobs,
  fetchJobs,
  resetFilters,
  selectFilteredJobs,
  setCurrentPage,
  setEditJob,
} from "../../features/job/jobSlice";
import JobCard from "./JobCard";
import ConfirmationDialog from "../../components/dialog/ConfirmationDialog";
import Pagination from "../../components/Pagination/Pagination";
import JobFilters from "../../components/filters/JobFilters";
import {
  fetchApplications,
  updateApplicationStatus,
  deleteApplication,
} from "../../features/application/applicationSlice";

const EmployerApplications = () => {
  const dispatch = useDispatch();
  const { list, status } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  const handleStatusChange = (app, status) => {
    const promptText = status === "accepted" ? "Enter message to applicant for interview date:" : "Enter rejection reason:";
    const input = window.prompt(promptText);
    const status_message = (input && input.trim()) || `Application${status}.`;
    if (input === null) return;

    dispatch(updateApplicationStatus({ id: app.id, status, status_message }));
  };

  const handleDelete = (app) => {
    if (window.confirm(`Delete application from ${app.name}?`)) {
      dispatch(deleteApplication(app.id));
    }
  };

  if (status === "loading") return <p className="text-gray-500 italic text-center">Loading Applications...</p>;

  return (
    <div className="mt-10 border-t pt-8 px-2 sm:px-0">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-center sm:text-left">
        Received Applications
      </h2>
      {list && list.length > 0 ? (
        <div className="space-y-4">
          {list.map((app) => (
            <div key={app.id} className="border p-4 rounded-xl bg-white shadow-sm flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-lg text-gray-900 ">{app.name}</p>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-sm text-blue-600 font-medium mb-1">{app.job_title || "Job Listing"}</p>
                <p className="text-xs text-gray-500 truncate">• {app.email} <br />• {app.phone}</p>
                {app.resume && (
                  <a
                    href={`http://127.0.0.1:8000${app.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600  mt-1  hover:bg-blue-50 rounded px-2 py-1 border border-transparent transition"
                  >
                    View Resume
                  </a>
                )}
              </div>

              <div className="flex flex-row sm:flex-col lg:flex-row gap-2 items-center justify-start sm:justify-center">
                {app.status === "pending" && (
                  <>
                    <button onClick={() => handleStatusChange(app, "accepted")} className="flex-1 sm:w-full lg:w-auto px-4 py-2 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold">Accept For Interview</button>
                    <button onClick={() => handleStatusChange(app, "rejected")} className="flex-1 sm:w-full lg:w-auto px-4 py-2 text-xs rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold">Reject</button>
                  </>
                )}
                <button onClick={() => handleDelete(app)} className="flex-1 sm:w-auto lg:w-auto px-4 py-2 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-gray-400 border-2 border-dashed rounded-xl">No applications yet.</div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { role, token } = useSelector((state) => state.user);
  const { status, currentPage, jobsPerPage, filters } = useSelector((state) => state.jobs);
  const filteredJobs = useSelector(selectFilteredJobs);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch, token]);

  const handlePageChange = useCallback((page) => {
    dispatch(setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch]);

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await dispatch(deleteJobs(jobToDelete.id)).unwrap();
      setDialogOpen(false);
      setJobToDelete(null);
    } catch (err) {
      alert("Error: " + (err.detail || "Delete failed"));
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8">Dashboard</h1>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex w-full sm:w-auto gap-2">
          {role === "employer" && (
            <button
              onClick={() => { dispatch(clearEditJob()); navigate("/job-form"); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-400 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              <i className="fas fa-plus"></i> <span className=" xs:inline">Post Job</span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm"
          >
            <i className="fas fa-filter"></i> Filters
          </button>
        </div>

        {Object.keys(filters).length > 0 && (
          <button onClick={() => dispatch(resetFilters())} className="text-sm font-semibold text-red-500 hover:text-red-700 underline underline-offset-4">
            Reset All
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <JobFilters onClose={() => setShowFilters(false)} currentFilters={filters} />
        </div>
      )}

      {status === "loading" ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {currentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isEmployer={role === "employer"}
                handleEdit={() => { dispatch(setEditJob(job)); navigate("/job-form"); }}
                handleDelete={() => handleDeleteClick(job)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 overflow-x-auto pb-2 flex justify-center">
              <Pagination currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} />
            </div>
          )}
        </>
      )}

      {role === "employer" && <EmployerApplications />}

      <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Job?"
        message={`Are you sure you want to remove ${jobToDelete?.title}?`}
      />
    </div>
  );
};

export default Dashboard;