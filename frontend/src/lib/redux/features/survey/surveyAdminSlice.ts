"use client";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getAdminSurveyById,
  getAdminSurveys,
  getSurveyAnalytics,
  publishAdminSurvey,
} from "@/services/hrApiClient";
import {
  SurveyAdminFilters,
  SurveyAggregatedData,
  SurveyAnalyticsData,
  SurveyDraft,
  SurveyIndividualResponse,
  SurveySummary,
  SURVEY_K_ANONYMITY_THRESHOLD,
  buildEmptySurveyDraft,
  toSurveyPublishPayload,
} from "@/types/survey";

interface SurveyAdminState {
  surveys: SurveySummary[];
  currentDraft: SurveyDraft | null;
  filters: SurveyAdminFilters;
  activeSurvey: SurveySummary | null;
  aggregatedData: SurveyAggregatedData | null;
  individualResponses: SurveyIndividualResponse[];
  responseCount: number;
  minimumResponseThreshold: number;
  fetchStatus: "idle" | "loading" | "succeeded" | "failed";
  publishStatus: "idle" | "loading" | "succeeded" | "failed";
  analyticsStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SurveyAdminState = {
  surveys: [],
  currentDraft: null,
  filters: {
    status: "ALL",
    type: "ALL",
  },
  activeSurvey: null,
  aggregatedData: null,
  individualResponses: [],
  responseCount: 0,
  minimumResponseThreshold: SURVEY_K_ANONYMITY_THRESHOLD,
  fetchStatus: "idle",
  publishStatus: "idle",
  analyticsStatus: "idle",
  error: null,
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export const fetchAdminSurveys = createAsyncThunk<
  SurveySummary[],
  void,
  { state: { surveyAdmin: SurveyAdminState }; rejectValue: string }
>("surveyAdmin/fetchAdminSurveys", async (_, { getState, rejectWithValue }) => {
  try {
    return await getAdminSurveys(getState().surveyAdmin.filters);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Failed to fetch surveys."));
  }
});

export const createSurveyDraft = createAsyncThunk<SurveyDraft>(
  "surveyAdmin/createSurveyDraft",
  async () => buildEmptySurveyDraft()
);

export const updateSurveyDraft = createAsyncThunk<
  Partial<SurveyDraft>,
  Partial<SurveyDraft>
>("surveyAdmin/updateSurveyDraft", async (updates) => updates);

export const publishSurvey = createAsyncThunk<
  SurveySummary,
  void,
  { state: { surveyAdmin: SurveyAdminState }; rejectValue: string }
>("surveyAdmin/publishSurvey", async (_, { getState, rejectWithValue }) => {
  try {
    const draft = getState().surveyAdmin.currentDraft;

    if (!draft) {
      throw new Error("Create a survey draft before publishing.");
    }

    if (!draft.title.trim()) {
      throw new Error("Survey title is required.");
    }

    if (!draft.startAt || !draft.endAt) {
      throw new Error("Start and end dates are required.");
    }

    if (!draft.isForAllDepartments && draft.departmentIds.length === 0) {
      throw new Error("Choose at least one department or target the whole company.");
    }

    if (draft.questions.length === 0) {
      throw new Error("Add at least one question before publishing.");
    }

    return await publishAdminSurvey(toSurveyPublishPayload(draft));
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Failed to publish survey."));
  }
});

export const fetchSurveyAnalytics = createAsyncThunk<
  SurveyAnalyticsData,
  string,
  { rejectValue: string }
>("surveyAdmin/fetchSurveyAnalytics", async (surveyId, { rejectWithValue }) => {
  try {
    const [survey, analytics] = await Promise.all([
      getAdminSurveyById(surveyId),
      getSurveyAnalytics(surveyId),
    ]);

    return {
      survey,
      aggregatedData: analytics.aggregatedData,
      individualResponses: analytics.individualResponses,
      responseCount: analytics.responseCount,
      minimumResponseThreshold: analytics.minimumResponseThreshold,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Failed to fetch survey analytics."));
  }
});

const surveyAdminSlice = createSlice({
  name: "surveyAdmin",
  initialState,
  reducers: {
    setSurveyAdminFilters(state, action: PayloadAction<Partial<SurveyAdminFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearSurveyDraft(state) {
      state.currentDraft = null;
      state.publishStatus = "idle";
      state.error = null;
    },
    clearActiveAnalytics(state) {
      state.activeSurvey = null;
      state.aggregatedData = null;
      state.individualResponses = [];
      state.responseCount = 0;
      state.minimumResponseThreshold = SURVEY_K_ANONYMITY_THRESHOLD;
      state.analyticsStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminSurveys.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchAdminSurveys.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.surveys = action.payload;
      })
      .addCase(fetchAdminSurveys.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || "Failed to fetch surveys.";
      })
      .addCase(createSurveyDraft.fulfilled, (state, action) => {
        state.currentDraft = action.payload;
        state.publishStatus = "idle";
        state.error = null;
      })
      .addCase(updateSurveyDraft.fulfilled, (state, action) => {
        if (!state.currentDraft) {
          state.currentDraft = buildEmptySurveyDraft();
        }

        state.currentDraft = {
          ...state.currentDraft,
          ...action.payload,
        };
      })
      .addCase(publishSurvey.pending, (state) => {
        state.publishStatus = "loading";
        state.error = null;
      })
      .addCase(publishSurvey.fulfilled, (state, action) => {
        state.publishStatus = "succeeded";
        state.surveys = [action.payload, ...state.surveys];
        state.currentDraft = null;
      })
      .addCase(publishSurvey.rejected, (state, action) => {
        state.publishStatus = "failed";
        state.error = action.payload || "Failed to publish survey.";
      })
      .addCase(fetchSurveyAnalytics.pending, (state) => {
        state.analyticsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchSurveyAnalytics.fulfilled, (state, action) => {
        state.analyticsStatus = "succeeded";
        state.activeSurvey = action.payload.survey;
        state.aggregatedData = action.payload.aggregatedData;
        state.individualResponses = action.payload.individualResponses;
        state.responseCount = action.payload.responseCount;
        state.minimumResponseThreshold = action.payload.minimumResponseThreshold;
      })
      .addCase(fetchSurveyAnalytics.rejected, (state, action) => {
        state.analyticsStatus = "failed";
        state.error = action.payload || "Failed to fetch survey analytics.";
      });
  },
});

export const { setSurveyAdminFilters, clearSurveyDraft, clearActiveAnalytics } =
  surveyAdminSlice.actions;

export default surveyAdminSlice.reducer;
