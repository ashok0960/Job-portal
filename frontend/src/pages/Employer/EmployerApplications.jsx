import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchApplications,
  updateApplicationStatus,
} from "../../features/application/applicationSlice";

const EmployerApplications = () => {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  const handleAction = (id, status) => {
    let interview_date = null;
    let status_message = "";

    if (status === "interview") {
      interview_date = prompt(
        "Please enter Interview Date and time (YYYY-MM-DDTHH:MM, optional):"
      );
      status_message =
        prompt("Optional message for applicant:") || "Interview scheduled.";
    } else if (status === "accepted") {
      status_message =
        prompt("Enter message for applicant:") ||
        "Your application has been accepted.";
    } else if (status === "rejected") {
      status_message =
        prompt("Enter rejection reason (optional):") ||
        "Your application has been rejected.";
    }

    dispatch(
      updateApplicationStatus({ id, status, interview_date, status_message })
    );
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Received Applications</h2>
      
      {list.length === 0 ? (
        <p className="text-gray-500 italic text-center py-4">No applications found yet.</p>
      ) : (
        <div className="space-y-4">
          {list.map((app) => (
            <div key={app.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition">
              <div>
                <h3 className="font-bold text-lg text-blue-700">{app.full_name}</h3>
                <p className="text-sm text-gray-600 font-medium">Job: {app.job?.title}</p>
                <div className="mt-1 flex items-center gap-2">
                   <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
                   <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                     app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                     app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                     'bg-yellow-100 text-yellow-700'
                   }`}>{app.status}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleAction(app.id, "accepted")} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">Accept</button>
                <button onClick={() => handleAction(app.id, "interview")} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Interview</button>
                <button onClick={() => handleAction(app.id, "rejected")} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerApplications;