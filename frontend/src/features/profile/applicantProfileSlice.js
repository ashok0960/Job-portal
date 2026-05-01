import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchApplicantProfile = createAsyncThunk(
  "profile/fetchApplicantProfile",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().user.token;
    console.log(token);
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/users/applicant-profile/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      console.log(response.data)
      return response.data.profile || response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to load profile"
      );
    }
  }
);

export const saveApplicantProfile = createAsyncThunk(
  "profile/saveApplicantProfile",
  async ({ formData, isUpdate }, { getState, rejectWithValue }) => {
    const token = getState().user.token;
    console.log(token)
    const url = isUpdate
      ? "http://127.0.0.1:8000/api/users/applicant-profile/"
      : "http://127.0.0.1:8000/api/users/applicant-profile/create/";
    const method = isUpdate ? "patch" : "post";
    console.log(isUpdate)
    try {
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      });
    console.log(response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to save profile");
      
    }
  }
);

const applicantProfileSlice = createSlice({
  name: "profile",
  initialState: {
    profile: null,
    loading: false,
    saving: false,
    error: null,
    saveErrors: null,
    message: "",
  },
  reducers: {
    clearMessage: (state) => {
      state.message = "";
      state.saveErrors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicantProfile.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(fetchApplicantProfile.fulfilled, (state, action) => {
        (state.loading = false), (state.profile = action.payload);
      })
      .addCase(fetchApplicantProfile.rejected, (state, action) => {
        (state.loading = false), (state.error = action.payload);
      })
      .addCase(saveApplicantProfile.pending, (state) => {
        state.saving = true;
        state.saveErrors = null;
        state.message = "";
      })
      .addCase(saveApplicantProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload.profile || action.payload;
        state.message = "✅ Profile saved successfully!";
      })
      .addCase(saveApplicantProfile.rejected, (state, action) => {
        state.saving = false;
        state.saveErrors = action.payload;
        state.message = "❌ Failed to save profile";
      });
  },
});

export const { clearMessage } = applicantProfileSlice.actions;
export default applicantProfileSlice.reducer;
