"use client";

import * as React from "react";
import { Provider } from "react-redux";
import { AppStore, makeStore } from "./redux";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = React.useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
