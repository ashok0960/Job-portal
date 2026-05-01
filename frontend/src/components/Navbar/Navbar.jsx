import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { clearUser } from "../../features/auth/userSlice";
import { fetchApplications } from "../../features/application/applicationSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const user = JSON.parse(localStorage.getItem("user")); // stored after login
  const { list: applications = [] } = useSelector(
    (state) => state.applications || { list: [] }
  );
  // const [showNotifications, setShowNotifications] = useState(false);

  // Initial load for applicant
  useEffect(() => {
    if (isLoggedIn && user?.role === "applicant") {
      dispatch(fetchApplications());
    }
  }, [dispatch, isLoggedIn, user?.role]);

  // Always refresh applications when opening the notification dropdown
  // useEffect(() => {
  //   if (showNotifications && isLoggedIn && user?.role === "applicant") {
  //     dispatch(fetchApplications());
  //   }
  // }, [showNotifications, dispatch, isLoggedIn, user?.role]);

  // const notifications = applications.filter(
  //   (app) => app.status && app.status !== "pending"
  // );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("username");

    dispatch(clearUser());
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar-bg flex flex-col md:flex-row md:justify-between items-center gap-2 md:gap-0 px-3 py-2">
      <div className="text-2xl font-bold">
        <h1 className="text-white">Gig's Nepal</h1>
      </div>

      <div className="flex gap-2 items-center">
        <Link to="/">
          <button className="flex items-center gap-2 px-2 py-1 rounded text-white cursor-pointer home-btn transition hover:bg-blue-600 border-1 border-blue-500">
            <i className="fas fa-laptop-house"></i> Home
          </button>
        </Link>

        {isLoggedIn && (
          <div className="flex items-center gap-3">
            {/* {user?.role === "applicant" && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="flex items-center gap-2 px-2 py-1 rounded text-white cursor-pointer home-btn transition hover:bg-blue-600 border border-blue-500"
                >
                  <i className="fas fa-bell"></i>
                  Notifications
                  {notifications.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded shadow-lg max-h-80 overflow-y-auto z-50">
                    <div className="px-4 py-2 border-b flex justify-between items-center">
                      <span className="font-semibold text-sm">
                        Employer Messages
                      </span>
                      <button
                        className="text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => setShowNotifications(false)}
                      >
                        Close
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No messages yet. Apply for a job and wait for employer
                        response.
                      </div>
                    ) : (
                      notifications.map((app) => (
                        <div
                          key={app.id}
                          className="px-4 py-3 border-b last:border-b-0 text-sm"
                        >
                          <p className="font-semibold text-gray-900">
                            {app.job_title ||
                              (app.job ? `Job #${app.job}` : "Job")}
                          </p>
                          <p className="text-xs text-gray-600 mb-1">
                            Decision:{" "}
                            <span className="font-semibold capitalize">
                              {app.status}
                            </span>
                          </p>
                          <p className="text-xs text-gray-700">
                            {app.status_message ||
                              (app.status === "accepted"
                                ? "Your application has been accepted."
                                : "Your application has been rejected.")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )} */}

            <button
              onClick={() =>
                navigate(
                  user?.role === "applicant"
                    ? "/applicant-details"
                    : "/employer-details"
                )
              }
              className="text-white font-medium rounded home-btn px-3 py-1 bg-blue-500 hover:bg-blue-600 transition"
            >
              {user?.username || user?.name || "Profile"}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-2 py-1 rounded text-white cursor-pointer home-btn transition hover:bg-blue-600 border border-blue-500"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;