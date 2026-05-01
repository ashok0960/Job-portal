import { useEffect } from "react";
import Spinner from "../../components/Spinner/Spinner";
import { useDispatch, useSelector } from "react-redux";
import profileImage from "../../assets/user.png";
import { fetchApplicantProfile } from "../../features/profile/applicantProfileSlice";

const ApplicantDetails = () => {
  const { token, username, email } = useSelector((state) => state.user);
  const { profile,loading,error } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

 useEffect(() => {
    if (token) {
      dispatch(fetchApplicantProfile());
    }
  }, [dispatch, token]);

  if (loading) return <Spinner />;
  if (error)
    return <p className="text-center text-lg text-red-500 py-4">{error}</p>;
  if (!profile)
    return (
      <p className="text-center text-lg text-red-500 py-4">
        No applicant profile found. Please create one.
      </p>
    );

  const profilePicUrl = profile.profile_pic_url || profileImage;
  const resumeUrl = profile.resume_url;

  const displaySkills = () => {
    if (!profile.user_skills_list && !profile.user_skills) return "N/A";

    if (Array.isArray(profile.user_skills_list)) {
      return profile.user_skills_list.join(", ");
    }

    if (typeof profile.user_skills === "string") {
      return profile.user_skills;
    }

    return "N/A";
  };

  return (
    <div className="max-w-4xl mx-auto mt-5 mb-5 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Applicant Details</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center">
          <img
            src={profilePicUrl}
            alt="Profile"
            className="w-40 h-40 rounded-full object-cover border-4 border-blue-100"
            onError={(e) => {
              e.target.src = profileImage;
            }}
          />
          {resumeUrl && (
            <a
              href={resumeUrl}
              download
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
            View Resume
            </a>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-600">Name</h3>
              <p className="mt-1">{profile.username || username || "N/A"}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-600">Email</h3>
              <p className="mt-1">{email || "N/A"}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">Location</h3>
            <p className="mt-1">{profile.user_location || "N/A"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">Bio</h3>
            <p className="mt-1 whitespace-pre-line">
              {profile.user_bio || "N/A"}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">Education</h3>
            <p className="mt-1">{profile.user_education || "N/A"}</p>
          </div>

          {/* <div>
            <h3 className="font-semibold text-gray-600">CGPA</h3>
            <p className="mt-1">{profile.user_cgpa || "N/A"}</p>
          </div> */}

          <div>
            <h3 className="font-semibold text-gray-600">Work Experience</h3>
            <p className="mt-1">{profile.work_experience || "N/A"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">Skills</h3>
            <p className="mt-1">{displaySkills()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetails;
