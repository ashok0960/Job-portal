import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/auth/userSlice'
import profileReducer from '../features/profile/applicantProfileSlice'
import employerReducer from '../features/profile/employerProfileSlice'
import jobReducer from '../features/job/jobSlice'
import applicationReducer from '../features/application/applicationSlice';


export const store = configureStore({
    reducer: {
        user: userReducer,
        profile: profileReducer,
        employer: employerReducer,
        jobs: jobReducer,
        applications: applicationReducer,

    }
})