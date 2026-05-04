import { DemoApp } from "@/app/components/DemoApp";
import ProblemCard from "@/app/components/ProblemCard";
import { DEMO_PROBLEM } from "@/lib/demo-problem";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProblemCard problem={DEMO_PROBLEM} />
        <DemoApp />
      </div>
    </main>
  );
}
