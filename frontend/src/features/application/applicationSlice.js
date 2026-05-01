import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// 1. Fetch applications for the logged-in employer/applicant
export const fetchApplications = createAsyncThunk(
  "applications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/jobs/applyjobs/");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch");
    }
  }
);

// 2. Update status (Accept/Reject/Interview) for a specific application
export const updateApplicationStatus = createAsyncThunk(
  "applications/updateStatus",
  async ({ id, status, interview_date, status_message }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/jobs/applyjobs/${id}/update_status/`, {
        status,
        interview_date,
        status_message,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Update failed");
    }
  }
);

// 3. Delete an application
export const deleteApplication = createAsyncThunk(
  "applications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/jobs/applyjobs/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Delete failed");
    }
  }
);

const applicationSlice = createSlice({
  name: "applications",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.list = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (app) => String(app.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (app) => String(app.id) !== String(action.payload)
        );
      });
  },
});

export default applicationSlice.reducer;
