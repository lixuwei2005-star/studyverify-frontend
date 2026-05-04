"use client";

import { useState } from "react";

import { CodeEditor } from "./CodeEditor";
import { DEFAULT_BUGGY_CODE } from "@/lib/demo-problem";

export function DemoApp() {
  const [code, setCode] = useState(DEFAULT_BUGGY_CODE);

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <CodeEditor code={code} onChange={setCode} />
    </section>
  );
}
