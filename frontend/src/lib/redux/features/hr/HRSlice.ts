"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getHRCurrentUser, getJobs } from "@/services/hrApiClient";
import { HRUser, Job } from "@/types/hr";

interface HRState {
  currentUser: HRUser | null;
  currentUserStatus: "idle" | "loading" | "succeeded" | "failed";
  currentUserError: string | null;
  jobs: Job[];
  jobsStatus: "idle" | "loading" | "succeeded" | "failed";
  jobsError: string | null;
}

const initialState: HRState = {
  currentUser: null,
  currentUserStatus: "idle",
  currentUserError: null,
  jobs: [],
  jobsStatus: "idle",
  jobsError: null,
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export const fetchCurrentHRUser = createAsyncThunk<HRUser, void, { rejectValue: string }>(
  "hr/fetchCurrentHRUser",
  async (_, { rejectWithValue }) => {
    try {
      return await getHRCurrentUser();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch current user."));
    }
  }
);

export const fetchHRJobs = createAsyncThunk<Job[], void, { rejectValue: string }>(
  "hr/fetchHRJobs",
  async (_, { rejectWithValue }) => {
    try {
      return await getJobs();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch jobs."));
    }
  }
);

const hrSlice = createSlice({
  name: "hr",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentHRUser.pending, (state) => {
        state.currentUserStatus = "loading";
        state.currentUserError = null;
      })
      .addCase(fetchCurrentHRUser.fulfilled, (state, action) => {
        state.currentUserStatus = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentHRUser.rejected, (state, action) => {
        state.currentUserStatus = "failed";
        state.currentUserError = action.payload || "Failed to fetch current user.";
      })
      .addCase(fetchHRJobs.pending, (state) => {
        state.jobsStatus = "loading";
        state.jobsError = null;
      })
      .addCase(fetchHRJobs.fulfilled, (state, action) => {
        state.jobsStatus = "succeeded";
        state.jobs = action.payload;
      })
      .addCase(fetchHRJobs.rejected, (state, action) => {
        state.jobsStatus = "failed";
        state.jobsError = action.payload || "Failed to fetch jobs.";
      });
  },
});

export default hrSlice.reducer;
