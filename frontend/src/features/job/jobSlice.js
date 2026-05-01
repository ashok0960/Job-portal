import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api.js";
console.log(api);




export const addJobs = createAsyncThunk(
  "jobs/addJobs",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/jobs/create/", data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Request failed");
    }
  }
);

export const fetchJobs = createAsyncThunk("jobs/fetchJobs", async () => {
  const response = await api.get("/jobs/dashboard-api/");
  console.log(response.data);
  return response.data.jobs || [];
});

export const editJobs = createAsyncThunk(
  "jobs/editJobs",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/jobs/update/${id}/`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Request failed");
    }
  }
);

export const deleteJobs = createAsyncThunk("jobs/deleteJobs", async (id) => {
  await api.delete(`/jobs/delete/${id}/`);
  return id; 
});

export const searchJobs = createAsyncThunk(
  "jobs/searchJobs",
  async (searchParams) => {
    const response = await api.get("/jobs/dashboard-api/", {
      params: searchParams,
    });
    return response.data.jobs || [];
  }
);

const initialState = {
  jobs: [],
  status: "idle",
  error: null,
  editJob: null,
  currentPage: 1,
  jobsPerPage: 6,
  totalJobs: 0,
  totalPages: 1,
  filters: {
    searchQuery: "",
    experience: null,
    salaryRange: [0, 100],
    location: [],
    workMode: null,
    jobStatus: null,
    freshness: null,
    skills: [],
  },
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setEditJob: (state, action) => {
      state.editJob = action.payload;
    },
    clearEditJob: (state) => {
      state.editJob = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addJobs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.jobs.unshift(action.payload);
      })
      .addCase(addJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(fetchJobs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.jobs = action.payload;
        state.totalJobs = action.payload.length;
        state.totalPages = Math.ceil(action.payload.length / state.jobsPerPage);
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(editJobs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.jobs.findIndex(
          (job) => job.id === action.payload.id
        );
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(editJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })




      .addCase(deleteJobs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteJobs.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.jobs = state.jobs.filter((job) => String(job.id) !== String(deletedId));
        state.status = "succeeded";
      })
      .addCase(deleteJobs.rejected, (state, action) => {
        state.status = "failed"; 
        state.error = action.error.message;
      })







      .addCase(searchJobs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.jobs = action.payload;
        state.totalJobs = action.payload.length;
        state.totalPages = Math.ceil(action.payload.length / state.jobsPerPage);
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("Search jobs error:", action.error);
      });
  },
});

export const selectFilteredJobs = createSelector(
  [(state) => state.jobs.jobs || [], (state) => state.jobs.filters],
  (jobs, filters) => {
    if (!Array.isArray(jobs)) return [];

    return jobs.filter((job) => {
      if (filters.searchQuery) {
        const searchTerm = filters.searchQuery.toLowerCase();
        const jobTitle = job.title?.toLowerCase() || "";
        const jobDescription = job.description?.toLowerCase() || "";
        const jobLocation = job.location?.toLowerCase() || "";
        const jobSkills = job.job_skills?.toLowerCase() || "";
        const companyName = job.company_name?.toLowerCase() || "";

        if (
          !jobTitle.includes(searchTerm) &&
          !jobDescription.includes(searchTerm) &&
          !jobLocation.includes(searchTerm) &&
          !jobSkills.includes(searchTerm) &&
          !companyName.includes(searchTerm)
        ) {
          return false;
        }
      }

      if (filters.experience && filters.experience !== "all") {
        const jobExp = job.experience || "0-1";
        if (jobExp !== filters.experience) return false;
      }

      if (filters.salaryRange && Array.isArray(filters.salaryRange)) {
        const [min, max] = filters.salaryRange;
        const jobSalary = job.min_salary || job.salary || 0;
        if (jobSalary < min) return false;
        if (max !== 100 && jobSalary > max) return false;
      }

      if (
        filters.location &&
        filters.location.length > 0 &&
        !filters.location.includes("all")
      ) {
        const jobLocation = job.location?.toLowerCase() || "";
        const hasMatchingLocation = filters.location.some((loc) =>
          jobLocation.includes(loc.toLowerCase())
        );
        if (!hasMatchingLocation) return false;
      }

      if (filters.workMode && filters.workMode !== "all") {
        const jobWorkMode = (job.work_mode || "").toLowerCase();
        const filterWorkMode = filters.workMode.toLowerCase();

        const workModeMapping = ["remote", "wfo", "hybrid"]

        const matchesWorkMode = workModeMapping[filterWorkMode]
          ? workModeMapping.some((mode) =>
            jobWorkMode.includes(mode)
          )
          : jobWorkMode.includes(filterWorkMode);

        if (!matchesWorkMode) return false;
      }

      if (filters.jobStatus && filters.jobStatus !== "all") {
        const jobStatus = (job.status || "").toLowerCase();
        if (jobStatus !== filters.jobStatus.toLowerCase()) return false;
      }

      if (filters.freshness && filters.freshness !== "all") {
        const data =
          job.created_at ||
          job.posted_time ||
          job.date_posted ||
          job.posted_date ||
          job.created_date;

        if (!data) return false;

        const jobDate = new Date(data);
        if (isNaN(jobDate.getTime())) {
          return false;
        }

        const now = new Date();
        const diffHours = (now - jobDate) / (1000 * 60 * 60);

        const thresholds = {
          1: 24,
          3: 72,
          7: 168,
          15: 360,
          30: 720,
        };

        const threshold = thresholds[filters.freshness];
        if (diffHours > threshold) {
          return false;
        }
      }

      if (filters.skills && filters.skills.length > 0) {
        const jobSkillsArray = Array.isArray(job.job_skills)
          ? job.job_skills.map((s) => s.toLowerCase())
          : (job.job_skills || "")
            .split(",")
            .map((s) => s.trim().toLowerCase());

        const hasSkill = filters.skills.some((skill) =>
          jobSkillsArray.includes(skill.toLowerCase())
        );

        if (!hasSkill) return false;
      }

      return true;
    });
  }
);

export const {
  setEditJob,
  clearEditJob,
  setCurrentPage,
  setFilters,
  resetFilters,
} = jobSlice.actions;

export default jobSlice.reducer;
