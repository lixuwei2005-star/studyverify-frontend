"use client";

import dynamic from "next/dynamic";

// Monaco's bundle references `window` and `document` at module load, so it
// must not be evaluated during SSR. Importing dynamically with ssr:false is
// only valid inside a Client Component, which is why this file is "use client".
const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-gray-100 text-sm text-gray-500">
      Loading editor...
    </div>
  ),
});

type Props = {
  code: string;
  onChange: (newCode: string) => void;
};

export function CodeEditor({ code, onChange }: Props) {
  return (
    <div data-testid="code-editor" className="border border-gray-300 rounded-lg overflow-hidden">
      <Monaco
        height="400px"
        defaultLanguage="python"
        value={code}
        onChange={(value) => onChange(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
