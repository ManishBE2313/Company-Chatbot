"use client";

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import hrReducer from "./features/hr/HRSlice";
import surveyAdminReducer from "./features/survey/surveyAdminSlice";
import surveyEmployeeReducer from "./features/survey/surveyEmployeeSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      hr: hrReducer,
      surveyAdmin: surveyAdminReducer,
      surveyEmployee: surveyEmployeeReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();


