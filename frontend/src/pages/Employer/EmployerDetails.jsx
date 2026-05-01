import { useEffect } from "react";
import Spinner from "../../components/Spinner/Spinner";
import { useDispatch, useSelector } from "react-redux";
import profileImage from "../../assets/user.png";
import companyLogoImage from "../../assets/logo.png";
import { fetchEmployerProfile } from "../../features/profile/employerProfileSlice";

const EmployerDetails = () => {
  const { token, username } = useSelector((state) => state.user);
  const { profile,loading,error } = useSelector((state) => state.employer)
  const dispatch = useDispatch()
  console.log(profile)

 useEffect(() => {
    if (token) {
      dispatch(fetchEmployerProfile());
    }
  }, [dispatch, token]);

  if (loading) return <Spinner />;
  if (error)
    return <p className="text-center text-lg text-red-500 py-4">{error}</p>;
  if (!profile)
    return (
      <p className="text-center text-lg text-red-500 py-4">
        No employer profile found. Please create one.
      </p>
    );

  const profilePicUrl = profile.employer_image_url || profileImage;
  const companyLogoUrl = profile.company_logo_url || companyLogoImage

  return (
    <div className="max-w-4xl mx-auto mt-5 mb-5 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Employer Details</h1>

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
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-600">Name</h3>
              <p className="mt-1">{profile.username || username || "N/A"}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-600">Email</h3>
              <p className="mt-1">{profile.employer_email || "N/A"}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-600">Contact</h3>
              <p className="mt-1">{profile.employer_contact || "N/A"}</p>
            </div>

          </div>

          <div>
            <h3 className="font-semibold text-gray-600">CompanyName</h3>
            <p className="mt-1">{profile.company_name || "N/A"}</p>
          </div>  

          <div>
            <h3 className="font-semibold text-gray-600">CompanyLocation</h3>
            <p className="mt-1">{profile.company_location || "N/A"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">CompanyDescription</h3>
            <p className="mt-1">{profile.company_description || "N/A"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">Company Website URL</h3>
            <p className="mt-1 whitespace-pre-line">
              {profile.company_website_url || "N/A"}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">Company Linkedin URL</h3>
            <p className="mt-1 whitespace-pre-line">
              {profile.company_linkedin || "N/A"}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">CompanySize</h3>
            <p className="mt-1">{profile.company_size || "N/A"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">Company StartDate</h3>
            <p className="mt-1">{profile.company_startdate || "N/A"}</p>
          </div>

           <div>
            <h3 className="font-semibold text-gray-600">Company Logo</h3>
            {companyLogoUrl ? (
              <img
                src={companyLogoUrl}
                alt="Company Logo"
                className="mt-3 h-24"
                 onError={(e) => {
              e.target.src = companyLogoImage;
            }}
              />
            ) : (
              <p className="mt-2 text-gray-500">No logo uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDetails;
