import ProblemCard from "@/app/components/ProblemCard";
import { DEMO_PROBLEM } from "@/lib/demo-problem";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProblemCard problem={DEMO_PROBLEM} />
        <section className="bg-white rounded-lg shadow p-6 min-h-[400px] flex items-center justify-center text-gray-400 text-sm">
          Code editor coming Phase 3
        </section>
      </div>
      <section className="bg-white rounded-lg shadow p-6 mt-6 flex items-center justify-center text-gray-400 text-sm">
        Hint panel coming Phase 6
      </section>
    </main>
  );
}
