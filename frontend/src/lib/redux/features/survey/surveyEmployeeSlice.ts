"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getEmployeeSurveyById,
  getEmployeeSurveys,
  submitEmployeeSurveyResponse,
} from "@/services/apiClient";
import { SurveyAnswerInput, SurveySummary } from "@/types/survey";

interface SurveyEmployeeState {
  mySurveys: SurveySummary[];
  activeSurvey: SurveySummary | null;
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  detailStatus: "idle" | "loading" | "succeeded" | "failed";
  submitStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SurveyEmployeeState = {
  mySurveys: [],
  activeSurvey: null,
  listStatus: "idle",
  detailStatus: "idle",
  submitStatus: "idle",
  error: null,
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export const fetchEmployeeSurveys = createAsyncThunk<
  SurveySummary[],
  void,
  { rejectValue: string }
>("surveyEmployee/fetchEmployeeSurveys", async (_, { rejectWithValue }) => {
  try {
    return await getEmployeeSurveys();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Failed to fetch surveys."));
  }
});

export const fetchActiveSurvey = createAsyncThunk<
  SurveySummary,
  string,
  { rejectValue: string }
>("surveyEmployee/fetchActiveSurvey", async (surveyId, { rejectWithValue }) => {
  try {
    return await getEmployeeSurveyById(surveyId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Failed to fetch survey."));
  }
});

export const submitSurveyResponse = createAsyncThunk<
  { surveyId: string; answers: SurveyAnswerInput[] },
  { surveyId: string; answers: SurveyAnswerInput[] },
  { rejectValue: string }
>(
  "surveyEmployee/submitSurveyResponse",
  async ({ surveyId, answers }, { rejectWithValue }) => {
    try {
      await submitEmployeeSurveyResponse(surveyId, answers);
      return { surveyId, answers };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to submit survey response.")
      );
    }
  }
);

const surveyEmployeeSlice = createSlice({
  name: "surveyEmployee",
  initialState,
  reducers: {
    clearActiveSurvey(state) {
      state.activeSurvey = null;
      state.detailStatus = "idle";
      state.submitStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeSurveys.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(fetchEmployeeSurveys.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.mySurveys = action.payload;
      })
      .addCase(fetchEmployeeSurveys.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload || "Failed to fetch surveys.";
      })
      .addCase(fetchActiveSurvey.pending, (state) => {
        state.detailStatus = "loading";
        state.error = null;
      })
      .addCase(fetchActiveSurvey.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.activeSurvey = action.payload;
      })
      .addCase(fetchActiveSurvey.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.error = action.payload || "Failed to fetch survey.";
      })
      .addCase(submitSurveyResponse.pending, (state) => {
        state.submitStatus = "loading";
        state.error = null;
      })
      .addCase(submitSurveyResponse.fulfilled, (state, action) => {
        state.submitStatus = "succeeded";

        state.mySurveys = state.mySurveys.map((survey) =>
          survey.id === action.payload.surveyId
            ? {
                ...survey,
                status: "Submitted",
              }
            : survey
        );

        if (state.activeSurvey?.id === action.payload.surveyId) {
          state.activeSurvey = {
            ...state.activeSurvey,
            status: "Submitted",
            alreadySubmitted: true,
          };
        }
      })
      .addCase(submitSurveyResponse.rejected, (state, action) => {
        state.submitStatus = "failed";
        state.error = action.payload || "Failed to submit survey response.";
      });
  },
});

export const { clearActiveSurvey } = surveyEmployeeSlice.actions;

export default surveyEmployeeSlice.reducer;
