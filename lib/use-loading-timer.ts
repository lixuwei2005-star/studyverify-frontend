"use client";

import { useEffect, useState } from "react";

export interface LoadingStage {
  untilSeconds: number;
  label: string;
}

export function useLoadingTimer(
  loading: boolean,
  stages: LoadingStage[],
): { elapsed: number; stage: string } {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  const stage =
    stages.find((s) => elapsed < s.untilSeconds)?.label ??
    stages[stages.length - 1].label;

  return { elapsed, stage };
}
