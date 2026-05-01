import { useSelector } from "react-redux";
import jobhireimage from "../../assets/jobhire.jpg";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  const { role } = useSelector((state) => state.user);
  console.log(role);
  const navigate = useNavigate();

  const handleProfileCreation = () => {
    if (role === "applicant") {
      navigate("/applicant-profile");
    } else {
      navigate("/employer-profile");
    }
  };

  const handleProfileView = () => {
    if (role === "applicant") {
      navigate("/applicant-details");
    } else {
      navigate("/employer-details");
    }
  };

  return (
    <main className="home-container pt-5 pb-5 md:pt-0 md:pb-0 flex flex-col md:flex-row justify-between items-center gap-10 min-h-screen px-[5%]">
      <div className="card max-w-md flex-1">
        <h1 className="text-3xl font-semibold">
          Step into your future with<br/>
          <span className="uppercase font-bold text-blue-600"> Gig's Nepal</span>
        </h1>
        <p className="text-lg mt-2">Find your dream job now</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={handleProfileCreation}
            className="flex items-center gap-2 px-2 py-2 md:px-4 md:py-2 text-sm rounded text-white cursor-pointer home-btn transition hover:bg-blue-600 border-1 border-blue-500"
          >
            <i className="fas fa-user-circle"></i> Update Profile
          </button>
          <Link to="/dashboard">
            <button className="flex items-center gap-2 px-2 py-2 md:px-4 md:py-2 text-sm rounded text-white cursor-pointer home-btn transition hover:bg-blue-600 border-1 border-blue-500">
              <i className="fas fa-chart-line"></i> Dashboard
            </button>
          </Link>
          <button
            onClick={handleProfileView}
            className="flex items-center gap-2 px-2 py-2 md:px-4 md:py-2 text-sm rounded text-white cursor-pointer home-btn transition hover:bg-blue-600 border-1 border-blue-500"
          >
            <i className="fa fa-eye"></i> View Profile
          </button>
        </div>
      </div>
      <div className="flex-5 md:flex-1">
        <img
          src={jobhireimage}
          alt="jobhire"
          className="rounded-xl w-full h-auto max-w-md mx-auto"
        />
      </div>
    </main>
  );
};

export default HomePage;
