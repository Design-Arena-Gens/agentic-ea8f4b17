"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AutomationForm } from "@/components/automation-form";
import { AutomationResults } from "@/components/automation-results";
import {
  AutomationRequest,
  AutomationResponse,
} from "@/lib/schemas";

const getTimestamp = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function Home() {
  const [result, setResult] = useState<AutomationResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [nextRun, setNextRun] = useState<Date | null>(null);
  const [latestConfig, setLatestConfig] =
    useState<AutomationRequest | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestConfigRef = useRef<AutomationRequest | null>(null);

  const appendLog = useCallback((message: string) => {
    setLogs((prev) =>
      [...prev.slice(-98), `[${getTimestamp()}] ${message}`],
    );
  }, []);

  const clearIntervalRef = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const runAutomation = useCallback(
    async (payload: AutomationRequest) => {
      if (isLoading) {
        appendLog("Skipped run because previous cycle is still active");
        return;
      }

      setIsLoading(true);
      setError(null);
      appendLog("Starting automation cycle");

      try {
        const response = await fetch("/api/agent/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(
            errorBody.error || `Request failed with ${response.status}`,
          );
        }

        const data = (await response.json()) as AutomationResponse;
        setResult(data);
        appendLog("Generation complete, dispatching platform updates");
        data.platformResults.forEach((platform) => {
          appendLog(
            `${platform.platform} → ${
              platform.success ? "SUCCESS" : "SKIPPED/FAILED"
            } (${platform.message})`,
          );
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown automation failure";
        appendLog(`Automation failed: ${message}`);
        setError(message);
      } finally {
        setIsLoading(false);
        if (isRunning) {
          const activeConfig =
            latestConfigRef.current ?? payload;
          const ms = activeConfig.schedule.intervalMinutes * 60 * 1000;
          setNextRun(new Date(Date.now() + ms));
        }
      }
    },
    [appendLog, isLoading, isRunning],
  );

  const scheduleNextRun = useCallback(
    (config: AutomationRequest | null) => {
      if (!config || !isRunning) {
        setNextRun(null);
        clearIntervalRef();
        return;
      }

      const ms = config.schedule.intervalMinutes * 60 * 1000;
      const next = new Date(Date.now() + ms);
      setNextRun(next);

      clearIntervalRef();
      intervalRef.current = setInterval(() => {
        runAutomation({
          ...config,
          schedule: {
            ...config.schedule,
            runNow: false,
          },
        });
      }, ms);
    },
    [isRunning, runAutomation],
  );

  useEffect(() => {
    if (isRunning) {
      scheduleNextRun(latestConfig);
    }
  }, [isRunning, latestConfig, scheduleNextRun]);

  useEffect(() => {
    return () => {
      clearIntervalRef();
    };
  }, []);

  const updateConfig = useCallback((config: AutomationRequest) => {
    setLatestConfig(config);
    latestConfigRef.current = config;
  }, []);

  const handleSubmit = useCallback(
    async (payload: AutomationRequest) => {
      updateConfig(payload);
      await runAutomation(payload);
      if (isRunning) {
        scheduleNextRun(payload);
      }
    },
    [isRunning, runAutomation, scheduleNextRun, updateConfig],
  );

  const handleStart = useCallback(() => {
    const config = latestConfigRef.current;
    if (!config) {
      setError("Configure the agent before starting automation loop");
      return;
    }
    setIsRunning(true);
    appendLog("Automation loop engaged");
    runAutomation(config);
  }, [appendLog, runAutomation]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    clearIntervalRef();
    setNextRun(null);
    appendLog("Automation loop paused");
  }, [appendLog]);

  const heroStats = useMemo(
    () => [
      { label: "Multi-platform reach", value: "Meta • Instagram • LinkedIn" },
      { label: "Average deployment cycle", value: "≤ 90 seconds" },
      { label: "Autonomous cadence", value: "Configurable 15-1440 min" },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50 py-16 font-sans text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-indigo-950 dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <section className="grid gap-8 rounded-3xl border border-zinc-200 bg-white/80 p-10 shadow-xl shadow-indigo-100/30 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 dark:shadow-black/20 lg:grid-cols-[1.2fr,1fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300">
              Autonomous Publishing Agent
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
              Generate long-form blogs and syndicate them to every growth
              channel automatically.
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-300">
              Orchestrate topic research, AI content production, and native
              social posting for Meta, Instagram, and LinkedIn from a single
              control surface. Provide platform tokens once, and the agent will
              handle the rest on your cadence.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-100">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-indigo-200/50 bg-indigo-500/10 p-6 text-sm text-indigo-50 shadow-inner shadow-indigo-200/20 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100">
            <h2 className="text-lg font-semibold text-indigo-100">
              Launch checklist
            </h2>
            <ol className="space-y-3 text-indigo-100/90">
              <li>1. Configure topic, voice, and CTA for your campaign.</li>
              <li>
                2. Connect Meta, Instagram, and LinkedIn tokens with posting
                permissions.
              </li>
              <li>
                3. Trigger the agent once or set it on a recurring automation
                cycle.
              </li>
            </ol>
            <div className="rounded-2xl border border-indigo-100/50 bg-indigo-200/10 p-4 text-xs text-indigo-100/80 dark:border-indigo-500/40 dark:bg-indigo-500/10">
              Requires environment variable <code>OPENAI_API_KEY</code>{" "}
              server-side. Tokens remain local via browser storage.
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-6 py-4 text-sm text-rose-700 shadow-sm dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
            {error}
          </div>
        ) : null}

        <AutomationForm
          disabled={isLoading}
          onSubmit={handleSubmit}
          onConfigChange={updateConfig}
        />

        <AutomationResults
          data={result}
          logs={logs}
          nextRun={nextRun}
          isRunning={isRunning}
          onStop={handleStop}
          onStart={handleStart}
        />
      </main>
    </div>
  );
}
