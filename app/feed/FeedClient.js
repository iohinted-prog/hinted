"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import AvatarMenu from "../components/AvatarMenu";

const demoMode = true;

const relationshipOptions = [
  "Partner",
  "Spouse",
  "Family",
  "Friend",
  "Parent",
  "Child",
  "Sibling",
  "Cousin",
  "Colleague",
  "Roommate",
  "Best friend",
  "Other",
];

const initialFilters = [
  { key: "all", label: "All activity" },
  { key: "friend_added", label: "Friends" },
  { key: "hint_added", label: "Hints" },
  { key: "circle_joined", label: "Circle joins" },
  { key: "circle_top_up", label: "Top ups" },
  { key: "circle_milestone", label: "Milestones" },
  { key: "reminder", label: "Urgent reminders" },
];

const onboardingSteps = [
  {
    id: 1,
    title: "Add your people",
    text: "Start by adding contacts so Hinted can turn birthdays, plans, and gift moments into useful updates.",
  },
  {
    id: 2,
    title: "Save hints as you go",
    text: "Hints you save for friends and family will begin to shape this feed automatically.",
  },
  {
    id: 3,
    title: "Watch the feed fill itself",
    text: "Once contacts are added, demo activity is replaced by real reminders, shared circle updates, and reactions.",
  },
];

const demoContacts = [
  {
    id: "demo-1",
    name: "Maya",
    role: "Friend",
    note: "On Hinted",
    initials: "M",
    colors: "from-[#efc3af] to-[#ae6e57]",
  },
  {
    id: "demo-2",
    name: "James",
    role: "Brother",
    note: "Not on Hinted yet",
    initials: "J",
    colors: "from-[#4e596d] to-[#212a3c]",
  },
  {
    id: "demo-3",
    name: "Fiona",
    role: "Friend",
    note: "On Hinted",
    initials: "F",
    colors: "from-[#809168] to-[#41512e]",
  },
];

const demoFeedItems = [
  {
    id: "demo-feed-1",
    event_type: "friend_added",
    actor_name: "Maya",
    title: "was added as a friend",
    body: "You’ve started building your gifting network.",
    created_at: new Date().toISOString(),
    comments: [],
    reactions: [],
    isDemo: true,
  },
];

const eventTypeConfig = {
  friend_added: {
    chip: "bg-[#fff3ee] text-[#e07c54]",
    border: "border-[#f6ddd2]",
    icon: "👋",
    badge: "Friend",
    actionText: "View hints",
    actionHref: "/hints",
    avatarColors: "from-[#efcdbf] to-[#c88c73]",
  },
  hint_added: {
    chip: "bg-[#f5f3ff] text-[#7c5cbf]",
    border: "border-[#e5defa]",
    icon: "🎁",
    badge: "Hint",
    actionText: "View hint",
    actionHref: "/shop",
    avatarColors: "from-[#e7cab8] to-[#b97d66]",
  },
  circle_joined: {
    chip: "bg-[#edf6eb] text-[#4a7a3a]",
    border: "border-[#deebda]",
    icon: "💍",
    badge: "Circle",
    actionText: "Open circle",
    actionHref: "/circles",
    avatarColors: "from-[#98a47d] to-[#5f7046]",
  },
  circle_top_up: {
    chip: "bg-[#eef6ea] text-[#5b7a3c]",
    border: "border-[#dcead4]",
    icon: "💸",
    badge: "Top up",
    actionText: "Open circle",
    actionHref: "/circles",
    avatarColors: "from-[#aab88f] to-[#687a4e]",
  },
  circle_milestone: {
    chip: "bg-[#fff7e8] text-[#af7b14]",
    border: "border-[#f3e3b8]",
    icon: "⭐",
    badge: "Milestone",
    actionText: "Open circle",
    actionHref: "/circles",
    avatarColors: "from-[#dcc4b5] to-[#b78972]",
  },
  reminder: {
    chip: "bg-[#fff3ee] text-[#e07c54]",
    border: "border-[#f6ddd2]",
    icon: "🗓️",
    badge: "Reminder",
    actionText: "Shop",
    actionHref: "/shop",
    avatarColors: "from-[#efcdbf] to-[#c88c73]",
  },
};

const reactionOptions = ["❤️", "🎉", "👏"];

const eventTypeStyles = {
  birthday: {
    dot: "bg-[#efb39a]",
    pill: "bg-[#fff1ea] text-[#c96d4f]",
    label: "Birthday",
  },
  christmas: {
    dot: "bg-[#cf6a6a]",
    pill: "bg-[#fff0f0] text-[#b04a4a]",
    label: "Christmas",
  },
  anniversary: {
    dot: "bg-[#d69aae]",
    pill: "bg-[#fff2f6] text-[#b85c79]",
    label: "Anniversary",
  },
  celebration: {
    dot: "bg-[#e6aa54]",
    pill: "bg-[#fff7e8] text-[#af7b14]",
    label: "Celebration",
  },
  reminder: {
    dot: "bg-[#bca7de]",
    pill: "bg-[#f5f0ff] text-[#7f62b2]",
    label: "Reminder",
  },
  circle: {
    dot: "bg-[#87986f]",
    pill: "bg-[#eef5ea] text-[#5d7243]",
    label: "Circle",
  },
};

function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getRelationshipGradient(role) {
  const normalized = String(role || "").toLowerCase();

  if (normalized.includes("partner") || normalized.includes("spouse")) {
    return "from-[#e8b9a7] to-[#bf755f]";
  }
  if (
    normalized.includes("family") ||
    normalized.includes("parent") ||
    normalized.includes("child") ||
    normalized.includes("sibling") ||
    normalized.includes("cousin")
  ) {
    return "from-[#eac8b8] to-[#9d6957]";
  }
  if (normalized.includes("colleague")) {
    return "from-[#b7c8db] to-[#6b88a7]";
  }
  if (normalized.includes("brother")) {
    return "from-[#4e596d] to-[#212a3c]";
  }

  return "from-[#efcdbf] to-[#bb8168]";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim().toLowerCase());
}

function normalizeSupabaseError(error, fallback) {
  if (!error) return fallback;
  const parts = [error.message, error.details, error.hint].filter(Boolean);
  return parts.length ? parts.join(" — ") : fallback;
}

function relationshipLabelFromArray(relationshipTypes) {
  if (!Array.isArray(relationshipTypes) || relationshipTypes.length === 0) return "Friend";
  return relationshipTypes[0] || "Friend";
}

function buildContactRecordFromRow(row) {
  const relationship = relationshipLabelFromArray(row?.relationship_types);
  const safeName = row?.name || row?.email || "Unnamed contact";

  return {
    id: row.id,
    name: safeName,
    role: relationship,
    note: "Not on Hinted yet",
    initials: getInitials(safeName),
    colors: getRelationshipGradient(relationship),
    email: row?.email || "",
  };
}

function formatRelativeFromDate(dateString) {
  if (!dateString) return "Recently";

  const now = new Date();
  const value = new Date(dateString);
  const diffMs = now.getTime() - value.getTime();

  if (Number.isNaN(diffMs)) return "Recently";

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 7) return `${days}d ago`;

  return value.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function parseDateOnly(dateString) {
  if (!dateString) return null;
  const [year, month, day] = String(dateString).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function diffInDaysFromToday(dateString) {
  const target = parseDateOnly(dateString);
  if (!target) return null;

  const today = startOfDay(new Date());
  const targetDay = startOfDay(target);
  const diffMs = targetDay.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function formatReminderDistance(diffDays) {
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays === 7) return "In 1 week";

  if (diffDays < 31) {
    const weeks = Math.round(diffDays / 7);
    return `In ${weeks} week${weeks === 1 ? "" : "s"}`;
  }

  const months = Math.round(diffDays / 30);
  return `In ${months} month${months === 1 ? "" : "s"}`;
}

function getMonthData(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < startDay; i++) {
    const day = daysInPrevMonth - startDay + i + 1;
    cells.push({
      key: `prev-${day}`,
      day,
      currentMonth: false,
      date: new Date(year, month - 1, day),
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      key: `current-${day}`,
      day,
      currentMonth: true,
      date: new Date(year, month, day),
    });
  }

  while (cells.length < 35) {
    const day = cells.length - (startDay + daysInMonth) + 1;
    cells.push({
      key: `next-${day}`,
      day,
      currentMonth: false,
      date: new Date(year, month + 1, day),
    });
  }

  return cells;
}

function LogoMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-white shadow-lg">
      <span className="text-lg">🎁</span>
    </div>
  );
}

function FeedAction({ text, href, disabled = false }) {
  if (href && !disabled) {
    return (
      <Link
        href={href}
        className="inline-flex h-10 items-center justify-center rounded-full border border-[#ebdfd8] bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        {text}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium ${
        disabled
          ? "cursor-not-allowed border-[#efe6e1] bg-[#faf7f5] text-slate-400"
          : "border-[#ebdfd8] bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {text}
    </button>
  );
}

function ContactCard({ contact, onDeleteClick, demo = false }) {
  return (
    <article className="rounded-[22px] border border-[#f0dfd6] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b text-[12px] font-bold text-white ${contact.colors}`}
        >
          {contact.initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
          <p className="text-xs text-slate-500">
            {contact.role}
            {contact.note ? ` · ${contact.note}` : ""}
          </p>
        </div>

        {!demo ? (
          <button
            type="button"
            onClick={() => onDeleteClick(contact)}
            className="inline-flex h-9 items-center justify-center rounded-full border border-[#efc0ba] bg-[#fff4f2] px-3 text-[12px] font-semibold text-[#b14f43]"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}

function FeedItem({
  item,
  activeComposerId,
  setActiveComposerId,
  draftComment,
  setDraftComment,
  onSubmitComment,
  onReact,
}) {
  const config = eventTypeConfig[item.event_type] || eventTypeConfig.friend_added;
  const reactionCounts = item.reactionCounts || {};
  const viewerReaction = item.viewerReaction || null;
  const allowEngagement = item.allowEngagement;
  const isDemo = Boolean(item.isDemo);

  return (
    <article className={`rounded-[28px] border bg-white p-5 shadow-sm ${config.border}`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b text-[12px] font-bold text-white ${config.avatarColors}`}
        >
          {getInitials(item.actor_name || item.title || "H")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.chip}`}>
                  {config.icon} {config.badge}
                </span>
                {isDemo ? (
                  <span className="rounded-full border border-[#eadfd7] bg-[#fffaf7] px-2.5 py-1 text-[11px] font-medium text-slate-500">
                    Demo data
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-[15px] leading-7 text-slate-700">
                <span className="font-semibold text-slate-900">{item.actor_name || "Activity"}</span>{" "}
                {item.title}
              </p>

              {item.body ? (
                <p className="mt-1 text-[14px] leading-6 text-slate-500">{item.body}</p>
              ) : null}
            </div>

            <span className="shrink-0 text-[12px] text-slate-400">
              {item.event_type === "reminder" && item.reminderLabel
                ? item.reminderLabel
                : formatRelativeFromDate(item.created_at)}
            </span>
          </div>

          {allowEngagement ? (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {reactionOptions.map((emoji) => {
                  const count = reactionCounts[emoji] || 0;
                  const active = viewerReaction?.emoji === emoji;

                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onReact(item, emoji)}
                      className={`inline-flex h-10 items-center justify-center rounded-full border px-3 text-sm ${
                        active
                          ? "border-[#ee8d69] bg-[#fff1ea] text-[#d96d4f]"
                          : "border-[#ebdfd8] bg-[#fffaf7] text-slate-700 hover:bg-[#fff2eb]"
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="ml-1 text-xs">{count}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setActiveComposerId((current) => (current === item.id ? null : item.id))
                  }
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#ebdfd8] bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Comment
                </button>

                <FeedAction text={config.actionText} href={config.actionHref} />
              </div>

              {(item.comments || []).length > 0 ? (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  {item.comments.map((comment) => (
                    <div key={comment.id} className="rounded-[18px] bg-[#faf7f4] px-4 py-3">
                      <p className="text-[13px] leading-6 text-slate-600">
                        <span className="font-semibold text-slate-900">
                          {comment.author_name || "Someone"}
                        </span>{" "}
                        {comment.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeComposerId === item.id ? (
                <div className="mt-4 flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#efcdbf] to-[#bb8168] text-[11px] font-bold text-white">
                    Y
                  </div>

                  <div className="flex w-full gap-2">
                    <input
                      type="text"
                      value={draftComment}
                      onChange={(e) => setDraftComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="h-11 w-full rounded-full border border-[#e9ddd6] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19a78]/60 focus:ring-4 focus:ring-[#f19a78]/10"
                    />
                    <button
                      type="button"
                      onClick={() => onSubmitComment(item)}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#2f3b2d] px-4 text-sm font-semibold text-white"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <FeedAction
                text={isDemo ? "Live interactions unlock once real activity begins" : config.actionText}
                href={isDemo ? null : config.actionHref}
                disabled={isDemo}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function FeedClient() {
  const supabase = createClient();

  const [activeFilter, setActiveFilter] = useState("all");
  const [sessionUser, setSessionUser] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState("");

  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);

  const [pendingInvites, setPendingInvites] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(true);

  const [activeComposerId, setActiveComposerId] = useState(null);
  const [draftComment, setDraftComment] = useState("");

  const loadContacts = useCallback(
    async (userId) => {
      setIsLoadingContacts(true);

      const { data, error } = await supabase
        .from("profile_connections")
        .select("*")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        setContacts([]);
        setIsLoadingContacts(false);
        throw new Error(
          normalizeSupabaseError(error, "Failed to load contacts from profile_connections.")
        );
      }

      const mapped = Array.isArray(data) ? data.map(buildContactRecordFromRow) : [];
      setContacts(mapped);
      setIsLoadingContacts(false);
      return mapped;
    },
    [supabase]
  );

  const transformFeedItem = useCallback((item, userId) => {
    const comments = Array.isArray(item.feed_comments) ? item.feed_comments : [];
    const reactions = Array.isArray(item.feed_reactions) ? item.feed_reactions : [];

    const reactionCounts = reactions.reduce((acc, reaction) => {
      const key = reaction.emoji;
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const viewerReaction = reactions.find((reaction) => reaction.user_id === userId) || null;

    const allowEngagement =
      !item.isDemo &&
      ["friend_added", "hint_added", "circle_joined", "circle_top_up", "circle_milestone"].includes(
        item.event_type
      );

    return {
      ...item,
      comments,
      reactions,
      reactionCounts,
      viewerReaction,
      allowEngagement,
    };
  }, []);

  const loadFeed = useCallback(
    async (userId) => {
      setFeedLoading(true);
      setFeedError("");

      const { data: events, error: eventsError } = await supabase
        .from("feed_events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (eventsError) {
        setFeedItems([]);
        setFeedLoading(false);
        throw new Error(eventsError.message || "Could not load feed events.");
      }

      const eventIds = Array.isArray(events) ? events.map((item) => item.id).filter(Boolean) : [];

      let comments = [];
      let reactions = [];

      if (eventIds.length > 0) {
        const { data: commentsData } = await supabase
          .from("feed_comments")
          .select("id, feed_item_id, user_id, body, created_at")
          .in("feed_item_id", eventIds)
          .order("created_at", { ascending: true });

        const { data: reactionsData } = await supabase
          .from("feed_reactions")
          .select("id, feed_item_id, user_id, emoji, created_at")
          .in("feed_item_id", eventIds);

        comments = commentsData || [];
        reactions = reactionsData || [];
      }

      const commentsByItem = comments.reduce((acc, comment) => {
        if (!acc[comment.feed_item_id]) acc[comment.feed_item_id] = [];
        acc[comment.feed_item_id].push(comment);
        return acc;
      }, {});

      const reactionsByItem = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.feed_item_id]) acc[reaction.feed_item_id] = [];
        acc[reaction.feed_item_id].push(reaction);
        return acc;
      }, {});

      const mapped = (events || []).map((item) =>
        transformFeedItem(
          {
            ...item,
            feed_comments: commentsByItem[item.id] || [],
            feed_reactions: reactionsByItem[item.id] || [],
          },
          userId
        )
      );

      setFeedItems(mapped);
      setFeedLoading(false);
      return mapped;
    },
    [supabase, transformFeedItem]
  );

  const loadCalendarEvents = useCallback(
    async (userId) => {
      setCalendarLoading(true);

      const { data } = await supabase
        .from("calendar_events")
        .select("id, user_id, title, event_date, event_time, type, source, created_at")
        .or(`source.eq.system,user_id.eq.${userId}`)
        .order("event_date", { ascending: true });

      setCalendarEvents(data || []);
      setCalendarLoading(false);
    },
    [supabase]
  );

  const loadPendingInvites = useCallback(async () => {
    setInvitesLoading(true);

    const { data } = await supabase
      .from("circle_invites")
      .select("id, circle_id, invite_name, invite_email, status, created_at")
      .in("status", ["pending", "viewed"])
      .order("created_at", { ascending: false });

    setPendingInvites(data || []);
    setInvitesLoading(false);
  }, [supabase]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(normalizeSupabaseError(userError, "Failed to get logged-in user."));
        }

        if (!user) {
          throw new Error("You must be signed in to view the feed.");
        }

        if (!active) return;
        setSessionUser(user);

        await Promise.all([
          loadContacts(user.id),
          loadFeed(user.id),
          loadCalendarEvents(user.id),
          loadPendingInvites(),
        ]);
      } catch (error) {
        if (active) {
          setFeedError(error?.message || "Failed to load the feed page.");
          setIsLoadingContacts(false);
          setFeedLoading(false);
          setCalendarLoading(false);
          setInvitesLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [supabase, loadContacts, loadFeed, loadCalendarEvents, loadPendingInvites]);

  async function createFeedEvent(payload) {
    if (!sessionUser?.id) return;

    const insertPayload = {
      user_id: sessionUser.id,
      event_type: payload.event_type,
      actor_name: payload.actor_name,
      title: payload.title,
      body: payload.body,
      entity_type: payload.entity_type || null,
      entity_id: payload.entity_id || null,
      metadata: payload.metadata || {},
    };

    const { error } = await supabase.from("feed_events").insert(insertPayload);

    if (error) {
      throw new Error(error.message || "Could not create feed activity.");
    }
  }

  async function handleAddContact() {
    if (!sessionUser?.id) return;

    const fallbackName = "New contact";
    const email = `contact-${Date.now()}@example.com`;

    const { data, error } = await supabase
      .from("profile_connections")
      .insert({
        profile_id: sessionUser.id,
        name: fallbackName,
        email,
        relationship_types: ["Friend"],
      })
      .select()
      .single();

    if (error) {
      setFeedError(error.message || "Could not save contact.");
      return;
    }

    await createFeedEvent({
      event_type: "friend_added",
      actor_name: fallbackName,
      title: "was added as a friend",
      body: email,
      entity_type: "profile_connection",
      entity_id: data?.id || null,
    });

    await Promise.all([loadContacts(sessionUser.id), loadFeed(sessionUser.id)]);
  }

  async function handleDeleteContact(contact) {
    const { error } = await supabase
      .from("profile_connections")
      .delete()
      .eq("id", contact.id);

    if (error) {
      setFeedError(error.message || "Could not delete contact.");
      return;
    }

    setContacts((prev) => prev.filter((item) => item.id !== contact.id));
  }

  async function handleSubmitComment(item) {
    if (!sessionUser?.id) return;
    if (!draftComment.trim()) return;
    if (item.isDemo) return;

    const { data, error } = await supabase
      .from("feed_comments")
      .insert({
        feed_item_id: item.id,
        user_id: sessionUser.id,
        body: draftComment.trim(),
      })
      .select()
      .single();

    if (error) {
      setFeedError(error.message || "Could not save comment.");
      return;
    }

    const newComment = {
      ...data,
      author_name: "You",
    };

    setFeedItems((prev) =>
      prev.map((feedItem) =>
        feedItem.id === item.id
          ? {
              ...feedItem,
              comments: [...(feedItem.comments || []), newComment],
            }
          : feedItem
      )
    );

    setDraftComment("");
    setActiveComposerId(null);
  }

  async function handleReact(item, emoji) {
    if (!sessionUser?.id) return;
    if (!item.allowEngagement || item.isDemo) return;

    const existing = item.viewerReaction || null;

    if (existing && existing.emoji === emoji) {
      const { error } = await supabase
        .from("feed_reactions")
        .delete()
        .eq("id", existing.id)
        .eq("user_id", sessionUser.id);

      if (error) {
        setFeedError(error.message || "Could not remove reaction.");
        return;
      }
    } else if (existing) {
      const { error } = await supabase
        .from("feed_reactions")
        .update({ emoji })
        .eq("id", existing.id)
        .eq("user_id", sessionUser.id);

      if (error) {
        setFeedError(error.message || "Could not update reaction.");
        return;
      }
    } else {
      const { error } = await supabase
        .from("feed_reactions")
        .insert({
          feed_item_id: item.id,
          user_id: sessionUser.id,
          emoji,
        });

      if (error) {
        setFeedError(error.message || "Could not save reaction.");
        return;
      }
    }

    await loadFeed(sessionUser.id);
  }

  const sidebarReminders = useMemo(() => {
    return (calendarEvents || [])
      .map((event) => {
        const diffDays = diffInDaysFromToday(event.event_date);
        if (diffDays === null || diffDays < 0) return null;

        const eventDate = parseDateOnly(event.event_date);
        if (!eventDate) return null;

        return {
          id: `sidebar-reminder-${event.id}`,
          title: event.title,
          prettyDate: eventDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          }),
          distanceLabel: formatReminderDistance(diffDays),
          diffDays,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.diffDays - b.diffDays)
      .slice(0, 3);
  }, [calendarEvents]);

  const feedReminderItems = useMemo(() => {
    return (calendarEvents || [])
      .map((event) => {
        const diffDays = diffInDaysFromToday(event.event_date);
        if (diffDays === null || diffDays < 0 || diffDays > 7) return null;

        const eventDate = parseDateOnly(event.event_date);
        if (!eventDate) return null;

        return {
          id: `feed-reminder-${event.id}`,
          event_type: "reminder",
          actor_name: event.title,
          title:
            diffDays === 0
              ? "is happening today"
              : diffDays === 1
                ? "is tomorrow"
                : "is coming up soon",
          body: `${eventDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          })} · ${formatReminderDistance(diffDays)}`,
          created_at: event.created_at || new Date().toISOString(),
          comments: [],
          reactions: [],
          reactionCounts: {},
          viewerReaction: null,
          allowEngagement: false,
          reminderLabel: formatReminderDistance(diffDays),
          reminderDiffDays: diffDays,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.reminderDiffDays - b.reminderDiffDays);
  }, [calendarEvents]);

  const hasRealContacts = contacts.length > 0;
  const hasLiveSocialFeedContent = feedItems.length > 0;

  const shouldShowFirstLook = demoMode && !hasRealContacts;
  const shouldShowSingleDemoFeedCard = demoMode && !hasLiveSocialFeedContent;
  const shouldUseDemoContacts = demoMode && !hasRealContacts;

  const displayContacts = hasRealContacts ? contacts : demoContacts;

  const singleDemoFeedCard = useMemo(() => {
    const demoItem = demoFeedItems[0];
    return demoItem ? transformFeedItem(demoItem, sessionUser?.id || "demo") : null;
  }, [sessionUser?.id, transformFeedItem]);

  const combinedFeedItems = useMemo(() => {
    const socialItems = [...feedItems];
    const reminderItems = [...feedReminderItems];

    if (shouldShowSingleDemoFeedCard && singleDemoFeedCard) {
      socialItems.unshift(singleDemoFeedCard);
    }

    return [...socialItems, ...reminderItems].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [feedItems, feedReminderItems, shouldShowSingleDemoFeedCard, singleDemoFeedCard]);

  const visibleFeedItems = useMemo(() => {
    if (activeFilter === "all") return combinedFeedItems;

    return combinedFeedItems.filter((item) => {
      if (item.isDemo) return false;
      return item.event_type === activeFilter;
    });
  }, [activeFilter, combinedFeedItems]);

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-800">
      <header className="border-b border-[#efe0d7] bg-[#fffaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 md:px-8">
          <Link href="/feed" className="flex items-center gap-3.5">
            <LogoMark />
            <div className="text-[22px] font-extrabold tracking-[-0.05em] text-slate-900">
              Hinted<span className="text-[#f36f64]">.io</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="flex items-center gap-2 sm:gap-3">
              <Link href="/feed" className="inline-flex h-11 items-center justify-center rounded-full bg-[#2f3b2d] px-4 text-[14px] font-semibold text-white sm:px-5">
                Feed
              </Link>
              <Link href="/hints" className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-[14px] font-semibold text-slate-700 sm:px-5">
                Hints
              </Link>
              <Link href="/circles" className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-[14px] font-semibold text-slate-700 sm:px-5">
                Circles
              </Link>
              <Link href="/shop" className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-[14px] font-semibold text-slate-700 sm:px-5">
                Shop
              </Link>
            </nav>

            <AvatarMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1380px] px-5 py-8 md:px-8">
        {feedError ? (
          <div className="mb-5 rounded-[22px] border border-[#efc0ba] bg-[#fff4f2] px-4 py-3 text-sm text-[#b14f43]">
            {feedError}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
          <aside className="space-y-5">
            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Filters
                  </p>
                  <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
                    Activity
                  </h1>
                </div>

                {shouldShowSingleDemoFeedCard || shouldShowFirstLook ? (
                  <span className="rounded-full bg-[#fff2ea] px-3 py-1 text-[11px] font-semibold text-[#e77756]">
                    Demo
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {initialFilters.map((filter) => {
                  const selected = activeFilter === filter.key;

                  return (
                    <button
                      key={filter.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setActiveFilter(filter.key)}
                      className={`rounded-[18px] px-4 py-3 text-left text-sm font-medium ${
                        selected
                          ? "bg-[#2f3b2d] text-white shadow-sm"
                          : "border border-[#efe4dd] bg-[#fffdfa] text-slate-600"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {shouldShowFirstLook ? (
              <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  First look
                </p>
                <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.04em] text-slate-900">
                  How this feed will work
                </h2>

                <div className="mt-5 space-y-3">
                  {onboardingSteps.map((step) => (
                    <div key={step.id} className="rounded-[20px] bg-[#faf7f4] p-4">
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2f3b2d] text-[12px] font-semibold text-white">
                          {step.id}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                          <p className="mt-1 text-[13px] leading-6 text-slate-600">{step.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Contacts</h2>
                  <p className="mt-1 text-xs text-slate-500">People you track.</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {isLoadingContacts ? (
                  <div className="rounded-[22px] border border-dashed border-[#e5d8cf] bg-[#fffaf7] p-4 text-[13px] text-slate-500">
                    Loading contacts...
                  </div>
                ) : displayContacts.length ? (
                  displayContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onDeleteClick={handleDeleteContact}
                      demo={shouldUseDemoContacts}
                    />
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[#e5d8cf] bg-[#fffaf7] p-4 text-[13px] text-slate-500">
                    No contacts added yet.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddContact}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] px-4 text-sm font-semibold text-white shadow-lg"
              >
                Add contact
              </button>
            </section>
          </aside>

          <section className="min-w-0">
            <div className="rounded-[32px] border border-[#eeddd3] bg-[#fff7f2] p-4 shadow-[0_18px_60px_rgba(173,101,72,0.1)] sm:p-5">
              <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="inline-flex rounded-full bg-[#fff5ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e07c54]">
                      Activity stream
                    </div>
                    <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-900">
                      Your people, moments, and nudges.
                    </h2>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {feedLoading ? (
                    <div className="rounded-[24px] border border-[#f0dfd6] bg-[#fffdfa] p-5 text-sm text-slate-500">
                      Loading feed...
                    </div>
                  ) : visibleFeedItems.length > 0 ? (
                    visibleFeedItems.map((item) => (
                      <FeedItem
                        key={item.id}
                        item={item}
                        activeComposerId={activeComposerId}
                        setActiveComposerId={setActiveComposerId}
                        draftComment={draftComment}
                        setDraftComment={setDraftComment}
                        onSubmitComment={handleSubmitComment}
                        onReact={handleReact}
                      />
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-[#f0dfd6] bg-[#fffdfa] p-5 text-sm text-slate-500">
                      No activity matches this filter yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Pending invites
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-slate-900">
                    Invites waiting for you
                  </h2>
                </div>

                <span className="rounded-full bg-[#fff5ef] px-2.5 py-1 text-[11px] font-semibold text-[#e77756]">
                  {pendingInvites.length}
                </span>
              </div>

              {invitesLoading ? (
                <p className="mt-4 text-sm text-slate-500">Loading invites...</p>
              ) : pendingInvites.length === 0 ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-[#ecd9cf] bg-[#fcf8f5] px-4 py-5">
                  <p className="text-sm font-medium text-slate-700">
                    No invites need a response right now.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {pendingInvites.map((invite) => (
                    <article
                      key={invite.id}
                      className="rounded-[22px] border border-[#ecd9cf] bg-[#fcf8f5] p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {invite.invite_name || invite.invite_email || "Circle invite"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {invite.invite_email || "No email attached"}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Upcoming reminders
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-slate-900">
                    Your next 3 reminders
                  </h2>
                </div>

                <span className="rounded-full bg-[#fff5ef] px-2.5 py-1 text-[11px] font-semibold text-[#e77756]">
                  {calendarLoading ? "…" : sidebarReminders.length}
                </span>
              </div>

              {calendarLoading ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-[#ecd9cf] bg-[#fcf8f5] px-4 py-5">
                  <p className="text-sm text-slate-500">Loading reminders...</p>
                </div>
              ) : sidebarReminders.length === 0 ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-[#ecd9cf] bg-[#fcf8f5] px-4 py-5">
                  <p className="text-sm font-medium text-slate-700">
                    No upcoming reminders yet.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {sidebarReminders.map((reminder) => (
                    <article
                      key={reminder.id}
                      className="rounded-[22px] border border-[#ecd9cf] bg-[#fcf8f5] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{reminder.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{reminder.prettyDate}</p>
                        </div>

                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#e77756]">
                          {reminder.distanceLabel}
                        </span>
                      </div>

                      <div className="mt-4">
                        <Link
                          href="/shop"
                          className="inline-flex items-center justify-center rounded-full border border-[#ead7cd] bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          Shop
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
