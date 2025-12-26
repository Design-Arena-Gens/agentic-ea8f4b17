"use client";

import { useMemo } from "react";
import { AutomationResponse } from "@/lib/schemas";

type Props = {
  data: AutomationResponse | null;
  logs: string[];
  nextRun?: Date | null;
  isRunning: boolean;
  onStop: () => void;
  onStart: () => void;
};

export function AutomationResults({
  data,
  logs,
  nextRun,
  isRunning,
  onStop,
  onStart,
}: Props) {
  const formattedNextRun = useMemo(() => {
    if (!nextRun) return null;
    return nextRun.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [nextRun]);

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Agent Output
          </h2>
          <button
            onClick={isRunning ? onStop : onStart}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
              isRunning
                ? "bg-rose-500 text-white hover:bg-rose-400"
                : "bg-emerald-500 text-white hover:bg-emerald-400"
            }`}
          >
            {isRunning ? "Stop Automation" : "Start Automation Loop"}
          </button>
        </div>
        {formattedNextRun ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Next scheduled run at {formattedNextRun}
          </p>
        ) : null}
        {data ? (
          <article className="space-y-6 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
            <header className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-wide text-indigo-500">
                Blog Title
              </p>
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                {data.generation.title}
              </h3>
            </header>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-indigo-500">
                  Executive Summary
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {data.generation.summary}
                </p>
              </div>

              <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/60">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  SEO Keywords
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.generation.seoKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-indigo-500">
                  Blog Draft
                </p>
                <pre className="whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-800 shadow-inner dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100">
                  {data.generation.blogPost}
                </pre>
              </div>
            </div>
          </article>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
            Run the agent to generate your first orchestration log.
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Platform Status
          </h3>
          <div className="mt-4 space-y-3">
            {data ? (
              data.platformResults.map((result) => (
                <div
                  key={result.platform}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize text-zinc-800 dark:text-zinc-100">
                      {result.platform}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        result.success
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    >
                      {result.success ? "Published" : "Pending"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {result.message}
                  </p>
                  {result.referenceId ? (
                    <p className="mt-1 text-xs text-indigo-500 dark:text-indigo-300">
                      Ref: {result.referenceId}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Enable a platform to view live delivery telemetry.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Automation Log
          </h3>
          <div className="mt-3 h-60 overflow-y-auto rounded-xl bg-zinc-950/5 p-3 text-xs font-mono text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
            {logs.length > 0 ? (
              logs.map((entry, index) => (
                <p key={index} className="mb-1">
                  {entry}
                </p>
              ))
            ) : (
              <p>Awaiting first run…</p>
            )}
          </div>
        </div>
      </aside>
    </section>
  );
}
