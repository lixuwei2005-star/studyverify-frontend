import type { Problem } from "@/lib/types";

type Props = {
  problem: Problem;
};

export default function ProblemCard({ problem }: Props) {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-2">Problem</h2>
      <p className="text-gray-800 mb-6 leading-relaxed">{problem.problem_text}</p>

      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-2">
        Test Cases
      </h3>
      <ul className="font-mono text-sm space-y-1">
        {problem.test_cases.map((tc, i) => (
          <li key={i} className="text-gray-800">
            <code className="bg-gray-100 px-2 py-0.5 rounded">{tc.input}</code>
            <span className="mx-2 text-gray-500">&rarr;</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded">{tc.expected}</code>
            {tc.description && (
              <span className="ml-2 text-xs text-gray-500 font-sans">({tc.description})</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
