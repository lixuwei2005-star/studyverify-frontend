"use client";

type Props = {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  stage?: string;
  elapsed?: number;
};

export function VerifyButton({ onClick, loading, disabled, stage, elapsed }: Props) {
  const loadingLabel =
    stage !== undefined && elapsed !== undefined
      ? `${stage}... (${elapsed}s)`
      : "Verifying...";
  return (
    <button
      type="button"
      data-testid="verify-button"
      onClick={onClick}
      disabled={loading || disabled}
      className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading ? loadingLabel : "Submit"}
    </button>
  );
}
