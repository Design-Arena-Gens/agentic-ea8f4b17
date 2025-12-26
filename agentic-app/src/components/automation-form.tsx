"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AutomationRequest } from "@/lib/schemas";

type PlatformState = {
  enabled: boolean;
  token: string;
  pageId?: string;
  instagramBusinessId?: string;
  linkedinAuthorUrn?: string;
  mediaUrl?: string;
};

const defaultMediaUrl = process.env.NEXT_PUBLIC_DEFAULT_MEDIA_URL ?? "";

type FormState = {
  topic: string;
  targetAudience: string;
  keywords: string;
  tone: string;
  callToAction: string;
  scheduleMinutes: number;
  meta: PlatformState;
  instagram: PlatformState;
  linkedin: PlatformState;
};

const defaultState: FormState = {
  topic: "AI-powered content marketing strategies",
  targetAudience: "Growth-stage SaaS marketing teams",
  keywords: "AI marketing, content automation, growth marketing",
  tone: "Insightful, optimistic, expert",
  callToAction: "Book a strategy call to automate your editorial pipeline",
  scheduleMinutes: 360,
  meta: {
    enabled: false,
    token: "",
    pageId: "",
  },
  instagram: {
    enabled: false,
    token: "",
    instagramBusinessId: "",
    mediaUrl: defaultMediaUrl,
  },
  linkedin: {
    enabled: false,
    token: "",
    linkedinAuthorUrn: "",
  },
};

const STORAGE_KEY = "automation-form-state-v1";

type Props = {
  disabled?: boolean;
  onSubmit: (payload: AutomationRequest) => Promise<void>;
  onConfigChange?: (payload: AutomationRequest) => void;
};

export function AutomationForm({
  disabled,
  onSubmit,
  onConfigChange,
}: Props) {
  const isMounted = useRef(false);
  const [state, setState] = useState<FormState>(() => {
    if (typeof window === "undefined") {
      return defaultState;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<FormState>;
        return {
          ...defaultState,
          ...parsed,
          meta: { ...defaultState.meta, ...parsed.meta },
          instagram: { ...defaultState.instagram, ...parsed.instagram },
          linkedin: { ...defaultState.linkedin, ...parsed.linkedin },
        };
      }
    } catch (error) {
      console.error("Failed to restore form state", error);
    }
    return defaultState;
  });

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to persist form state", error);
      }
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [state]);

  const payload = useMemo<AutomationRequest>(() => {
    const keywordList = state.keywords
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    return {
      topic: state.topic,
      targetAudience: state.targetAudience,
      keywords: keywordList,
      tone: state.tone,
      callToAction: state.callToAction,
      platforms: {
        meta: {
          enabled: state.meta.enabled,
          token: state.meta.token || undefined,
          pageId: state.meta.pageId || undefined,
        },
        instagram: {
          enabled: state.instagram.enabled,
          token: state.instagram.token || undefined,
          instagramBusinessId:
            state.instagram.instagramBusinessId || undefined,
          mediaUrl: state.instagram.mediaUrl || undefined,
        },
        linkedin: {
          enabled: state.linkedin.enabled,
          token: state.linkedin.token || undefined,
          linkedinAuthorUrn:
            state.linkedin.linkedinAuthorUrn || undefined,
        },
      },
      schedule: {
        intervalMinutes: Math.max(15, state.scheduleMinutes),
        runNow: true,
      },
    };
  }, [state]);

  useEffect(() => {
    onConfigChange?.(payload);
  }, [payload, onConfigChange]);

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlatformChange = (
    platform: "meta" | "instagram" | "linkedin",
    key: keyof PlatformState,
    value: string | boolean,
  ) => {
    setState((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [key]: value,
      },
    }));
  };

  return (
    <form
      className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:items-start"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(payload);
      }}
    >
      <section className="space-y-6 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/60">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Content Brief
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Define the strategy for each automated publication cycle.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Core Topic
          </span>
          <input
            value={state.topic}
            onChange={(event) =>
              handleChange("topic", event.target.value)
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="SaaS content automation"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Target Audience
          </span>
          <input
            value={state.targetAudience}
            onChange={(event) =>
              handleChange("targetAudience", event.target.value)
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="Marketing leaders in SaaS"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Keywords (comma separated)
          </span>
          <input
            value={state.keywords}
            onChange={(event) =>
              handleChange("keywords", event.target.value)
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="AI marketing, automation"
            required
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Tone
            </span>
            <input
              value={state.tone}
              onChange={(event) =>
                handleChange("tone", event.target.value)
              }
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="Confident, expert, warm"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Call to Action
            </span>
            <input
              value={state.callToAction}
              onChange={(event) =>
                handleChange("callToAction", event.target.value)
              }
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="Start your automation pilot"
              required
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Automation cadence (minutes)
          </span>
          <input
            value={state.scheduleMinutes}
            type="number"
            min={15}
            onChange={(event) =>
              handleChange("scheduleMinutes", Number(event.target.value))
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-indigo-200/50 bg-indigo-50/80 p-5 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
            Automations
          </h3>
          <p className="mt-2 text-sm text-indigo-900/80 dark:text-indigo-100/80">
            Supply platform credentials to auto-publish.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.meta.enabled}
                onChange={(event) =>
                  handlePlatformChange("meta", "enabled", event.target.checked)
                }
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Meta (Facebook)
              </span>
            </label>
          </div>
          <input
            placeholder="Page Access Token"
            value={state.meta.token}
            onChange={(event) =>
              handlePlatformChange("meta", "token", event.target.value)
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            placeholder="Page ID"
            value={state.meta.pageId}
            onChange={(event) =>
              handlePlatformChange("meta", "pageId", event.target.value)
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.instagram.enabled}
                onChange={(event) =>
                  handlePlatformChange(
                    "instagram",
                    "enabled",
                    event.target.checked,
                  )
                }
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Instagram
              </span>
            </label>
          </div>
          <input
            placeholder="Instagram Graph API Token"
            value={state.instagram.token}
            onChange={(event) =>
              handlePlatformChange("instagram", "token", event.target.value)
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            placeholder="Instagram Business Account ID"
            value={state.instagram.instagramBusinessId}
            onChange={(event) =>
              handlePlatformChange(
                "instagram",
                "instagramBusinessId",
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            placeholder="Image URL (publicly accessible)"
            value={state.instagram.mediaUrl}
            onChange={(event) =>
              handlePlatformChange("instagram", "mediaUrl", event.target.value)
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.linkedin.enabled}
                onChange={(event) =>
                  handlePlatformChange(
                    "linkedin",
                    "enabled",
                    event.target.checked,
                  )
                }
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                LinkedIn
              </span>
            </label>
          </div>
          <input
            placeholder="LinkedIn OAuth Token"
            value={state.linkedin.token}
            onChange={(event) =>
              handlePlatformChange("linkedin", "token", event.target.value)
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            placeholder="Author URN (e.g. urn:li:person:...)"
            value={state.linkedin.linkedinAuthorUrn}
            onChange={(event) =>
              handlePlatformChange(
                "linkedin",
                "linkedinAuthorUrn",
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400/60"
        >
          {disabled ? "Automating..." : "Run Automation"}
        </button>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Credentials stay in your browser only.
        </p>
      </section>
    </form>
  );
}
