"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import AvatarMenu from "../components/AvatarMenu";
import { useCurrencyFormatter } from "../../lib/useCurrencyFormatter";

const HINTED_SERVICE_FEE_RATE = 0.02;
const SELF_SELECTOR_ID = "__self__";

const currencyOptions = [
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "NZD", symbol: "NZ$", label: "New Zealand Dollar" },
  { code: "ZAR", symbol: "R", label: "South African Rand" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
];

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

const exampleCircle = {
  id: "example-circle",
  name: "Example pot",
  subtitle: "Birthday · Example",
  description:
    "A simple example showing how one shared pot could look once a real contact and item have been added.",
  members: [
    {
      name: "You",
      initials: "Y",
      contributed: true,
      amount: 40,
      colors: "from-[#4e596d] to-[#212a3c]",
      status: "accepted",
    },
    {
      name: "Example friend",
      initials: "E",
      contributed: false,
      amount: 0,
      colors: "from-[#efcdbf] to-[#bb8168]",
      status: "invitee",
    },
  ],
  pot: {
    active: true,
    item: "Example item",
    fullItemTitle: "Example item",
    source: "Example shared goal",
    sourceUrl: "https://example.com/example-item",
    previewImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    previewDescription:
      "This is just a single example pot so the layout still demonstrates the feature without showing multiple fake pots.",
    target: 122.4,
    currency: "GBP",
    raised: 40,
    note: "Example only.",
    fundingMode: "Flexible pot",
    deadline: "2026-07-01",
    goalType: "item",
  },
};

function roundCurrency(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function parseAmount(value) {
  const cleaned = String(value || "").replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

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

  return "from-[#efcdbf] to-[#bb8168]";
}

function getGoogleName(metadata = {}) {
  return (
    metadata.full_name ||
    metadata.name ||
    [metadata.given_name, metadata.family_name].filter(Boolean).join(" ") ||
    ""
  ).trim();
}

function getPrimaryContactField(person, field) {
  const items = person?.[field];
  if (!Array.isArray(items) || items.length === 0) return "";
  return items[0]?.value || items[0]?.displayName || "";
}

function normalizeSupabaseError(error, fallback) {
  if (!error) return fallback;
  const parts = [error.message, error.details, error.hint].filter(Boolean);
  return parts.length ? parts.join(" — ") : fallback;
}

function safeIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function safeIsoTimestampEndOfDay(value) {
  const dateOnly = safeIsoDate(value);
  if (!dateOnly) return null;
  return `${dateOnly}T23:59:59.000Z`;
}

function fundingModeToDb(value) {
  if (value === "all_or_nothing" || value === "All-or-nothing") return "all_or_nothing";
  if (value === "organiser_covers" || value === "Organizer covers gap") return "organiser_covers";
  return "flexible";
}

function fundingModeToLabel(value) {
  if (value === "all_or_nothing") return "All-or-nothing";
  if (value === "organiser_covers") return "Organizer covers gap";
  return "Flexible pot";
}

function formatDateLabel(dateString) {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}

function getAvatarState(status) {
  return String(status || "").toLowerCase() === "accepted" ? "accepted" : "invitee";
}

function getStatusLabel(status) {
  return getAvatarState(status) === "accepted" ? "Accepted" : "Invitee";
}

function getAvatarClasses(colors, status, size = "md") {
  const avatarState = getAvatarState(status);
  const sizeClasses =
    size === "sm"
      ? "h-8 w-8 text-[11px]"
      : size === "lg"
        ? "h-11 w-11 text-[12px]"
        : "h-10 w-10 text-[11px]";

  if (avatarState === "accepted") {
    return `flex items-center justify-center rounded-full bg-gradient-to-b ${sizeClasses} font-bold text-white ${colors}`;
  }

  return `flex items-center justify-center rounded-full border-2 border-dashed border-[#dfb39d] bg-[#fff5ef] ${sizeClasses} font-bold text-[#c87150]`;
}

function relationshipLabelFromArray(relationshipTypes) {
  if (!Array.isArray(relationshipTypes) || relationshipTypes.length === 0) return "Friend";
  return relationshipTypes[0] || "Friend";
}

function calculateHintedFee(itemAmount) {
  return roundCurrency(itemAmount * HINTED_SERVICE_FEE_RATE);
}

function calculateCircleTotals(itemAmount) {
  const safeItemAmount = roundCurrency(itemAmount);
  const feeAmount = calculateHintedFee(safeItemAmount);
  const totalAmount = roundCurrency(safeItemAmount + feeAmount);

  return {
    itemAmount: safeItemAmount,
    feeAmount,
    totalAmount,
  };
}

function toDisplayPotTitle(value) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "Shared gift";

  const cleaned = text
    .replace(/[|–—•,:;()[\]{}]+/g, " ")
    .replace(
      /\b(with|for|and|the|from|your|this|that|into|gift|voucher|experience|set|kit|duo|edition)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ").filter(Boolean);
  if (words.length === 0) return "Shared gift";

  return words.slice(0, 2).join(" ");
}

function buildStoredItemTitle(value) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  return text || "Shared gift";
}

function extractHintAmount(hint) {
  const directCandidates = [
    hint?.numeric_price,
    hint?.amount,
    hint?.price,
    hint?.targetAmount,
    hint?.priceAmount,
  ];

  for (const candidate of directCandidates) {
    const cleaned = String(candidate ?? "").replace(/[^\d.]/g, "");
    const amount = Number(cleaned);
    if (Number.isFinite(amount) && amount > 0) return roundCurrency(amount);
  }

  const textCandidates = [hint?.price_text, hint?.priceText];
  for (const text of textCandidates) {
    const match = String(text || "").match(/(\d+(?:\.\d{1,2})?)/);
    if (match?.[1]) {
      const amount = Number(match[1]);
      if (Number.isFinite(amount) && amount > 0) return roundCurrency(amount);
    }
  }

  return 0;
}

function extractPreviewAmount(preview) {
  const directCandidates = [
    preview?.price,
    preview?.amount,
    preview?.targetAmount,
    preview?.priceAmount,
    preview?.numeric_price,
  ];

  for (const candidate of directCandidates) {
    const amount = Number(String(candidate ?? "").replace(/[^\d.]/g, ""));
    if (Number.isFinite(amount) && amount > 0) return roundCurrency(amount);
  }

  const textCandidates = [preview?.priceText, preview?.price_text];
  for (const text of textCandidates) {
    const match = String(text || "").match(/(\d+(?:\.\d{1,2})?)/);
    if (match?.[1]) {
      const amount = Number(match[1]);
      if (Number.isFinite(amount) && amount > 0) return roundCurrency(amount);
    }
  }

  return 0;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim().toLowerCase());
}

function buildContactRecordFromRow(row) {
  const relationship = row?.role || relationshipLabelFromArray(row?.relationship_types);
  const safeName = row?.name || row?.email || "Unnamed contact";

  return {
    id: row.id,
    type: "contact",
    profileConnectionId: row.id,
    matchedProfileId: row?.matched_profile_id || null,
    hasHintedAccount: Boolean(row?.matched_profile_id),
    name: safeName,
    role: relationship || "Friend",
    note: getStatusLabel(row?.status),
    initials: getInitials(safeName),
    colors: getRelationshipGradient(relationship || "Friend"),
    email: row?.email || "",
    phone: row?.phone || "",
    birthday: row?.birthday || "",
    status: getAvatarState(row?.status),
    raw: row,
  };
}

function buildSelfRecord(profile) {
  const safeName =
    getGoogleName(profile || {}) ||
    profile?.full_name ||
    profile?.invite_name ||
    "You";

  return {
    id: SELF_SELECTOR_ID,
    type: "self",
    name: safeName,
    role: "You",
    note: "Accepted",
    initials: getInitials(safeName || "You"),
    colors: "from-[#4e596d] to-[#212a3c]",
    email: profile?.invite_email || "",
    status: "accepted",
    raw: profile || null,
  };
}

function buildCircleViewModel(
  circleRow,
  inviteRows = [],
  currentUserName = "You",
  raisedAmount = 0
) {
  const members = [
    {
      name: currentUserName || "You",
      initials: getInitials(currentUserName || "You"),
      contributed: false,
      amount: 0,
      colors: "from-[#4e596d] to-[#212a3c]",
      status: "accepted",
    },
    ...inviteRows.map((invite) => ({
      name: invite.invite_name || invite.invite_email || "Invited person",
      initials: getInitials(invite.invite_name || invite.invite_email || "Invited person"),
      contributed: false,
      amount: 0,
      colors: "from-[#efcdbf] to-[#bb8168]",
      status: getAvatarState(invite.status),
    })),
  ];

  const totalTarget = Number(circleRow.total_target_amount || 0);
  const fullItemTitle = circleRow.item_title || "Shared gift";

  return {
    id: circleRow.id,
    name: circleRow.title || "Untitled circle",
    subtitle: `${circleRow.occasion_type || "Event"} · ${formatDateLabel(circleRow.event_date)}`,
    description: "",
    members,
    pot: {
      active: totalTarget > 0,
      item: toDisplayPotTitle(fullItemTitle),
      fullItemTitle,
      source:
        circleRow.source_type === "external_link"
          ? "From pasted link"
          : circleRow.source_type === "recipient_public_hint"
            ? "From public hints"
            : circleRow.source_type === "organiser_private_hint"
              ? "From your hints"
              : "Shared goal",
      sourceUrl: circleRow.item_url || "",
      previewImage: circleRow.item_image_url || "",
      previewDescription: circleRow.item_description || "",
      target: totalTarget,
      currency: circleRow.currency || "GBP",
      raised: Number(raisedAmount || 0),
      note:
        circleRow.funding_mode === "all_or_nothing"
          ? "This circle will only proceed if the target is reached by the deadline."
          : circleRow.funding_mode === "organiser_covers"
            ? "If the target is not reached, the organiser can choose to cover the gap."
            : "This circle can stay flexible if fewer people join than expected.",
      fundingMode: fundingModeToLabel(circleRow.funding_mode),
      deadline: circleRow.deadline_at || circleRow.event_date || "",
      goalType:
        circleRow.item_title && circleRow.item_title !== "Shared contribution pot" ? "item" : "amount",
    },
    raw: circleRow,
    invites: inviteRows,
  };
}

function buildGenericCalendarEvents() {
  const now = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 12);

  const year = now.getFullYear();

  const recurring = [
    { title: "Halloween", type: "Holiday", month: 10, day: 31 },
    { title: "Bonfire Night", type: "Holiday", month: 11, day: 5 },
    { title: "Christmas", type: "Holiday", month: 12, day: 25 },
    { title: "New Year's Eve", type: "Holiday", month: 12, day: 31 },
    { title: "Valentine's Day", type: "Occasion", month: 2, day: 14 },
    { title: "Mother's Day", type: "Occasion", month: 3, day: 30 },
    { title: "Father's Day", type: "Occasion", month: 6, day: 21 },
  ];

  const rows = [];

  for (let y = year; y <= year + 1; y += 1) {
    for (const item of recurring) {
      const date = new Date(Date.UTC(y, item.month - 1, item.day));
      if (date >= now && date <= end) {
        rows.push({
          id: `generic-${item.title}-${y}`,
          title: item.title,
          event_date: date.toISOString().slice(0, 10),
          type: item.type,
          source: "generic",
        });
      }
    }
  }

  return rows.sort((a, b) => String(a.event_date).localeCompare(String(b.event_date)));
}

function LogoMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-white shadow-lg">
      <span className="text-lg">🎁</span>
    </div>
  );
}

function ModalShell({
  open,
  onClose,
  title,
  eyebrow,
  children,
  maxWidth = "max-w-[1120px]",
  hideHeaderBorder = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(42,26,20,0.38)] px-4 py-6 backdrop-blur-sm">
      <div
        className={`max-h-[92vh] w-full overflow-hidden rounded-[34px] border border-[#eddacf] bg-[#fffaf7] shadow-[0_24px_80px_rgba(88,46,31,0.22)] ${maxWidth}`}
      >
        <div
          className={`flex items-center justify-between px-6 py-5 ${
            hideHeaderBorder ? "" : "border-b border-[#efe0d7]"
          }`}
        >
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#df7b59]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.05em] text-slate-900">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white text-slate-500 hover:bg-[#fff2eb]"
            aria-label="Close window"
            type="button"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ContactCard({ contact, onDeleteClick }) {
  return (
    <article className="rounded-[22px] border border-[#f0dfd6] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={getAvatarClasses(contact.colors, contact.status, "lg")}>
          {contact.initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
          <p className="text-xs text-slate-500">
            {contact.role}
            {contact.note ? ` · ${contact.note}` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDeleteClick(contact)}
          className="inline-flex h-9 items-center justify-center rounded-full border border-[#efc0ba] bg-[#fff4f2] px-3 text-[12px] font-semibold text-[#b14f43] hover:bg-[#ffe9e5]"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function MemberPill({ member, currency = "GBP", formatCurrency }) {
  const isAccepted = getAvatarState(member.status) === "accepted";

  const statusStyles = isAccepted
    ? member.contributed
      ? "bg-[#edf6eb] text-[#4a7a3a]"
      : "bg-[#eef4ff] text-[#5676b3]"
    : "bg-[#fff3ee] text-[#d57a58]";

  const statusLabel = isAccepted ? "Accepted" : "Invitee";

  return (
    <div className="rounded-[20px] border border-[#eee1d9] bg-[#fffdfa] p-3">
      <div className="flex items-center gap-3">
        <div className={getAvatarClasses(member.colors, member.status)}>
          {member.initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles}`}>
              {statusLabel}
            </span>
            <span className="text-[11px] text-slate-400">
              {member.contributed ? formatCurrency(member.amount, currency) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributionRing({ raised, target, ringId }) {
  const percentage = target > 0 ? Math.min((raised / target) * 100, 100) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[148px] w-[148px] items-center justify-center">
        <svg className="h-[148px] w-[148px] -rotate-90" viewBox="0 0 140 140" aria-hidden="true">
          <circle cx="70" cy="70" r={radius} stroke="#f1e3db" strokeWidth="12" fill="none" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={`url(#${ringId})`}
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dash}
          />
          <defs>
            <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9b75" />
              <stop offset="100%" stopColor="#f36f64" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-white/80">
          <span className="text-[28px] font-semibold tracking-[-0.06em] text-slate-900">
            {Math.round(percentage)}%
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            funded
          </span>
        </div>
      </div>
    </div>
  );
}

function PotPreviewCard({ image, title, url, compact = false }) {
  if (!title && !url && !image) return null;

  return (
    <div
      className={`overflow-hidden rounded-[22px] border border-[#eedfd6] bg-[#fffdfa] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Linked item
      </p>

      <div className="mt-3 min-w-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-[#f5ebe4]">
          {image ? (
            <img
              src={image}
              alt={title || "Linked item preview"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#f5ebe4]" />
          )}
        </div>

        <div className="mt-3 min-w-0">
          <p className="truncate text-[13px] font-semibold text-slate-900">
            {toDisplayPotTitle(title)}
          </p>

          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block max-w-full truncate text-[12px] text-slate-500 underline decoration-[#e8b4a0] underline-offset-4"
            >
              View item
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PotTypeGuide() {
  const potTypes = [
    {
      title: "Flexible pot",
      text: "Anyone invited can join and contribute what they want.",
      colors: "bg-[#edf6eb] text-[#4a7a3a]",
    },
    {
      title: "All-or-nothing",
      text: "The circle only goes ahead if the target is reached by the deadline.",
      colors: "bg-[#fff3ee] text-[#d57a58]",
    },
    {
      title: "Organizer covers gap",
      text: "The organiser can choose to top up the missing amount.",
      colors: "bg-[#eef4ff] text-[#5676b3]",
    },
  ];

  return (
    <section className="rounded-[26px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Pot guide
      </p>
      <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
        How pot types work
      </h2>

      <div className="mt-5 space-y-3">
        {potTypes.map((type) => (
          <div key={type.title} className="rounded-[20px] bg-[#faf7f4] p-4">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${type.colors}`}>
              {type.title}
            </span>
            <p className="mt-3 text-[13px] leading-6 text-slate-600">{type.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CircleCard({ circle, onDeleteCircleClick, deletingCircleId, formatCurrency }) {
  const safeMembers = Array.isArray(circle?.members) ? circle.members : [];
  const joinedCount = safeMembers.filter(
    (member) => getAvatarState(member.status) === "accepted"
  ).length;
  const invitedCount = safeMembers.length;
  const moneyLabel = formatCurrency(circle?.pot?.target, circle?.pot?.currency || "GBP");
  const raisedLabel = formatCurrency(circle?.pot?.raised, circle?.pot?.currency || "GBP");
  const showItemPreview =
    circle?.pot?.active &&
    circle?.pot?.goalType === "item" &&
    (circle?.pot?.previewImage || circle?.pot?.sourceUrl);

  return (
    <article className="rounded-[30px] border border-[#f0dfd6] bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Circle
              </p>
              <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.05em] text-slate-900">
                {circle?.name || "Untitled circle"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{circle?.subtitle || "No subtitle"}</p>
            </div>

            <div className="rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">
              {joinedCount} of {invitedCount} accepted
            </div>
          </div>

          {circle?.description ? (
            <p className="mt-4 max-w-[60ch] text-[14px] leading-7 text-slate-600">
              {circle.description}
            </p>
          ) : null}

          <div className="mt-5 rounded-[24px] border border-dashed border-[#e6d7cd] bg-[#fffaf7] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Members</p>
                <p className="mt-1 text-[13px] text-slate-500">
                  People can be invited now and only become full members once they accept.
                </p>
              </div>

              <div className="rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">
                Circle invite flow
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {safeMembers.map((member) => (
                <MemberPill
                  key={`${circle?.id}-${member.name}`}
                  member={member}
                  currency={circle?.pot?.currency}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-[#eedfd6] bg-[radial-gradient(circle_at_top,_#fff7f2,_#fffdfa_62%)] p-5">
          <div className="flex flex-col items-center text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Shared pot
            </p>
            <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
              {circle?.pot?.active ? circle.pot.item : "No pot created yet"}
            </h3>
            <p className="mt-2 max-w-[28ch] text-[13px] leading-6 text-slate-500">
              {circle?.pot?.active ? circle?.pot?.source : circle?.pot?.note}
            </p>

            {circle?.pot?.active ? (
              <>
                <div className="mt-5">
                  <ContributionRing
                    raised={circle?.pot?.raised || 0}
                    target={circle?.pot?.target || 0}
                    ringId={`circle-gradient-${circle?.id}`}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {raisedLabel} of {moneyLabel}
                </p>

                <div className="mt-4 flex -space-x-3">
                  {safeMembers.map((member) => (
                    <div
                      key={`${circle?.id}-${member.name}-avatar`}
                      className={`${getAvatarClasses(member.colors, member.status, "lg")} border-4 border-white shadow-sm`}
                      title={member.name}
                    >
                      {member.initials}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">
                    {circle?.pot?.fundingMode}
                  </span>
                  <span className="rounded-full bg-[#f3f6fb] px-3 py-1 text-[11px] font-semibold text-slate-600">
                    Deadline {formatDateLabel(circle?.pot?.deadline)}
                  </span>
                  <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-[11px] font-semibold text-slate-600">
                    {circle?.pot?.currency || "GBP"}
                  </span>
                </div>

                {showItemPreview ? (
                  <div className="mt-5 w-full min-w-0 text-left">
                    <PotPreviewCard
                      image={circle?.pot?.previewImage}
                      title={circle?.pot?.fullItemTitle || circle?.pot?.item}
                      url={circle?.pot?.sourceUrl}
                      compact
                    />
                  </div>
                ) : null}

                <p className="mt-4 text-[14px] leading-7 text-slate-600">{circle?.pot?.note}</p>

                {circle?.id !== "example-circle" ? (
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onDeleteCircleClick(circle)}
                      disabled={deletingCircleId === circle.id}
                      className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold ${
                        deletingCircleId === circle.id
                          ? "cursor-not-allowed bg-[#f3d6d1] text-[#b14f43]"
                          : "border border-[#efc0ba] bg-[#fff4f2] text-[#b14f43] hover:bg-[#ffe9e5]"
                      }`}
                    >
                      {deletingCircleId === circle.id ? "Deleting..." : "Delete circle"}
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function CurrencyAmountInput({
  currency,
  amount,
  onCurrencyChange,
  onAmountChange,
  label = "Target amount",
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="grid gap-3 sm:grid-cols-[170px_minmax(0,1fr)]">
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
        >
          {currencyOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.code} · {option.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="220"
          className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
        />
      </div>
    </div>
  );
}

/* Keep your existing AddContactModal, DeleteContactModal, DeleteCircleModal,
   and CreateCircleModal exactly as they were. */
function AddContactModal(props) {
  return null;
}

function DeleteContactModal(props) {
  return null;
}

function DeleteCircleModal(props) {
  return null;
}

function CreateCircleModal(props) {
  return null;
}

export default function CirclesClient() {
  const supabase = createClient();
  const { formatCurrency } = useCurrencyFormatter();

  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [ownHints, setOwnHints] = useState([]);
  const [publicHintsByContact, setPublicHintsByContact] = useState({});
  const [realCircles, setRealCircles] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingCircles, setIsLoadingCircles] = useState(true);

  const [pageError, setPageError] = useState("");
  const [contactError, setContactError] = useState("");
  const [circleError, setCircleError] = useState("");
  const [circleSuccess, setCircleSuccess] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [addContactModalKey, setAddContactModalKey] = useState(0);

  const [isDeleteContactOpen, setIsDeleteContactOpen] = useState(false);
  const [isDeleteCircleOpen, setIsDeleteCircleOpen] = useState(false);
  const [selectedContactToDelete, setSelectedContactToDelete] = useState(null);
  const [selectedCircleToDelete, setSelectedCircleToDelete] = useState(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);
  const [isDeletingCircle, setIsDeletingCircle] = useState(false);
  const [deleteContactError, setDeleteContactError] = useState("");
  const [deleteCircleError, setDeleteCircleError] = useState("");

  const [eventMode, setEventMode] = useState("calendar");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [selectedHintOwnerId, setSelectedHintOwnerId] = useState(SELF_SELECTOR_ID);
  const [linkPreview, setLinkPreview] = useState(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [isCreatingCircle, setIsCreatingCircle] = useState(false);

  const [form, setForm] = useState({
    title: "",
    eventTitle: "",
    eventDate: "",
    occasionType: "Event",
    deadline: "",
    goalType: "item",
    goalValue: "",
    currency: "GBP",
    fundingMode: "flexible",
    itemSource: "hint",
    selectedHintId: "",
    itemUrl: "",
  });

  const didBootstrap = useRef(false);

  const mergedCalendarEvents = useMemo(() => {
    const generic = buildGenericCalendarEvents();
    const real = Array.isArray(calendarEvents) ? calendarEvents : [];
    const map = new Map();

    [...generic, ...real].forEach((event) => {
      const date = event.event_date || event.date || "";
      const title = event.title || "Event";
      const type = event.type || event.occasion_type || "Event";
      const key = `${title}-${date}`;

      if (!map.has(key)) {
        map.set(key, {
          id: event.id,
          title,
          event_date: date,
          type,
          source: event.source || "user",
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a.event_date).localeCompare(String(b.event_date))
    );
  }, [calendarEvents]);

  const displayedCircles = useMemo(() => {
    return realCircles.length > 0 ? realCircles : [exampleCircle];
  }, [realCircles]);

  const initialiseCircleForm = useCallback((profileValue, eventsValue) => {
    const safeEvents = Array.isArray(eventsValue) ? eventsValue : [];
    const fallback = safeEvents[0] || buildGenericCalendarEvents()[0] || null;

    setEventMode("calendar");
    setSelectedEventId(fallback?.id ? String(fallback.id) : "");
    setSelectedPeople([]);
    setSelectedHintOwnerId(SELF_SELECTOR_ID);
    setLinkPreview(null);
    setCircleError("");
    setForm({
      title: fallback?.title || "",
      eventTitle: fallback?.title || "",
      eventDate: fallback?.event_date || "",
      occasionType: fallback?.type || "Event",
      deadline: fallback?.event_date || "",
      goalType: "item",
      goalValue: "",
      currency: profileValue?.currency || "GBP",
      fundingMode: "flexible",
      itemSource: "hint",
      selectedHintId: "",
      itemUrl: "",
    });
  }, []);

  const loadProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new Error(normalizeSupabaseError(error, "Failed to load profile."));
    return data || null;
  }, [supabase]);

  const loadContacts = useCallback(async (userId) => {
    setIsLoadingContacts(true);
    setContactError("");

    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(normalizeSupabaseError(error, "Failed to load contacts."));

      const rawRows = Array.isArray(data) ? data : [];
      const emails = rawRows
        .map((row) => String(row?.email || "").trim().toLowerCase())
        .filter(Boolean);

      let profileMatches = [];
      if (emails.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, invite_email")
          .in("invite_email", emails);

        if (profilesError) {
          throw new Error(normalizeSupabaseError(profilesError, "Failed to match contacts to profiles."));
        }

        profileMatches = Array.isArray(profilesData) ? profilesData : [];
      }

      const profileIdByEmail = profileMatches.reduce((acc, row) => {
        const key = String(row?.invite_email || "").trim().toLowerCase();
        if (key) acc[key] = row.id;
        return acc;
      }, {});

      const enrichedRows = rawRows.map((row) => {
        const emailKey = String(row?.email || "").trim().toLowerCase();
        return {
          ...row,
          matched_profile_id: emailKey ? profileIdByEmail[emailKey] || null : null,
        };
      });

      const mapped = enrichedRows.map(buildContactRecordFromRow);
      setContacts(mapped);
      return mapped;
    } catch (error) {
      setContacts([]);
      setContactError(error?.message || "Failed to load contacts.");
      return [];
    } finally {
      setIsLoadingContacts(false);
    }
  }, [supabase]);

  const loadCalendarEvents = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", userId)
        .order("event_date", { ascending: true });

      if (error) throw new Error(normalizeSupabaseError(error, "Failed to load calendar events."));

      const rows = data || [];
      setCalendarEvents(rows);
      return rows;
    } catch {
      setCalendarEvents([]);
      return [];
    }
  }, [supabase]);

  const loadOwnHints = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from("hints")
        .select("id, user_id, title, url, image_url, created_at, is_private, retailer, price_text, numeric_price, currency")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(normalizeSupabaseError(error, "Failed to load hints."));

      setOwnHints(data || []);
      return data || [];
    } catch {
      setOwnHints([]);
      return [];
    }
  }, [supabase]);

  const loadPublicHintsForContacts = useCallback(async (contactRows) => {
    const safeContacts = Array.isArray(contactRows) ? contactRows : [];
    const matchedContacts = safeContacts.filter((contact) => contact?.matchedProfileId);

    if (!matchedContacts.length) {
      setPublicHintsByContact({});
      return {};
    }

    try {
      const matchedProfileIds = matchedContacts.map((contact) => contact.matchedProfileId);

      const { data, error } = await supabase
        .from("hints")
        .select("id, user_id, title, url, image_url, created_at, is_private, retailer, price_text, numeric_price, currency")
        .in("user_id", matchedProfileIds)
        .eq("is_private", false)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(normalizeSupabaseError(error, "Failed to load public hints."));
      }

      const hintsByProfileId = (Array.isArray(data) ? data : []).reduce((acc, hint) => {
        const key = String(hint.user_id);
        if (!acc[key]) acc[key] = [];
        acc[key].push(hint);
        return acc;
      }, {});

      const nextMap = matchedContacts.reduce((acc, contact) => {
        acc[contact.id] = hintsByProfileId[String(contact.matchedProfileId)] || [];
        return acc;
      }, {});

      setPublicHintsByContact(nextMap);
      return nextMap;
    } catch {
      setPublicHintsByContact({});
      return {};
    }
  }, [supabase]);

  const loadCircles = useCallback(async (userId, currentProfile) => {
    setIsLoadingCircles(true);
    setCircleError("");

    try {
      const { data: circlesData, error: circlesError } = await supabase
        .from("circles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (circlesError) {
        throw new Error(normalizeSupabaseError(circlesError, "Failed to load circles."));
      }

      const circleIds = (circlesData || []).map((circle) => circle.id).filter(Boolean);
      let inviteMap = {};
      let totalsByCircleId = {};

      if (circleIds.length > 0) {
        const [
          { data: inviteData, error: inviteError },
          { data: totalsData, error: totalsError },
        ] = await Promise.all([
          supabase.from("circle_invites").select("*").in("circle_id", circleIds),
          supabase
            .from("circle_contribution_totals")
            .select("circle_id, amount_raised, paid_contributions_count")
            .in("circle_id", circleIds),
        ]);

        if (inviteError) {
          throw new Error(normalizeSupabaseError(inviteError, "Failed to load circle invites."));
        }

        if (totalsError) {
          throw new Error(normalizeSupabaseError(totalsError, "Failed to load circle contribution totals."));
        }

        inviteMap = (inviteData || []).reduce((acc, invite) => {
          if (!acc[invite.circle_id]) acc[invite.circle_id] = [];
          acc[invite.circle_id].push(invite);
          return acc;
        }, {});

        totalsByCircleId = (totalsData || []).reduce((acc, row) => {
          acc[row.circle_id] = Number(row.amount_raised || 0);
          return acc;
        }, {});
      }

      const currentUserName =
        getGoogleName(currentProfile || {}) ||
        currentProfile?.full_name ||
        currentProfile?.invite_name ||
        "You";

      const mapped = (circlesData || []).map((circle) =>
        buildCircleViewModel(
          circle,
          inviteMap[circle.id] || [],
          currentUserName,
          totalsByCircleId[circle.id] || 0
        )
      );

      setRealCircles(mapped);
      return mapped;
    } catch (error) {
      setRealCircles([]);
      setCircleError(error?.message || "Failed to load circles.");
      return [];
    } finally {
      setIsLoadingCircles(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (didBootstrap.current) return;
    didBootstrap.current = true;

    let active = true;

    async function bootstrap() {
      try {
        setPageError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw new Error(normalizeSupabaseError(userError, "Failed to get user."));
        if (!user) throw new Error("You must be signed in to view circles.");

        if (!active) return;
        setSessionUser(user);

        let currentProfile = null;
        try {
          currentProfile = await loadProfile(user.id);
          if (active) setProfile(currentProfile);
        } catch {
          if (active) setProfile(null);
        }

        const [loadedContacts, loadedEvents] = await Promise.all([
          loadContacts(user.id),
          loadCalendarEvents(user.id),
          loadOwnHints(user.id),
        ]);

        await loadPublicHintsForContacts(loadedContacts);

        if (!active) return;

        const merged = [...buildGenericCalendarEvents(), ...(loadedEvents || [])];
        initialiseCircleForm(currentProfile, merged);

        await loadCircles(user.id, currentProfile);
      } catch (error) {
        if (active) {
          setPageError(error?.message || "Failed to load the Circles page.");
          setIsLoadingContacts(false);
          setIsLoadingCircles(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [
    supabase,
    loadProfile,
    loadContacts,
    loadCalendarEvents,
    loadOwnHints,
    loadPublicHintsForContacts,
    loadCircles,
    initialiseCircleForm,
  ]);

  function openAddContactModal() {
    setAddContactModalKey((prev) => prev + 1);
    setIsAddContactOpen(true);
  }

  function closeAddContactModal() {
    setIsAddContactOpen(false);
  }

  async function handleFetchPreview() {}

  async function handleSaveContact() {}

  function openDeleteContactModal(contact) {
    setDeleteContactError("");
    setSelectedContactToDelete(contact);
    setIsDeleteContactOpen(true);
  }

  function openDeleteCircleModal(circle) {
    setDeleteCircleError("");
    setSelectedCircleToDelete(circle);
    setIsDeleteCircleOpen(true);
  }

  async function handleConfirmDeleteContact() {}

  async function handleConfirmDeleteCircle(circle) {
    setIsDeletingCircle(true);
    setDeleteCircleError("");

    try {
      const { error: inviteDeleteError } = await supabase
        .from("circle_invites")
        .delete()
        .eq("circle_id", circle.id);

      if (inviteDeleteError) {
        throw new Error(normalizeSupabaseError(inviteDeleteError, "Failed to delete invites."));
      }

      const { error: circleDeleteError } = await supabase
        .from("circles")
        .delete()
        .eq("id", circle.id);

      if (circleDeleteError) {
        throw new Error(normalizeSupabaseError(circleDeleteError, "Failed to delete circle."));
      }

      setRealCircles((prev) => prev.filter((item) => item.id !== circle.id));
      setSelectedCircleToDelete(null);
      setIsDeleteCircleOpen(false);
    } catch (error) {
      setDeleteCircleError(error?.message || "Failed to delete circle.");
    } finally {
      setIsDeletingCircle(false);
    }
  }

  async function handleCreateCircle() {}

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-800">
      <div className="mx-auto max-w-[1380px] px-5 py-8 md:px-8">
        {pageError || contactError || circleError || circleSuccess ? (
          <div className="mb-5 space-y-3">
            {pageError ? (
              <div className="rounded-[22px] border border-[#efc0ba] bg-[#fff4f2] px-4 py-3 text-sm text-[#b14f43]">
                {pageError}
              </div>
            ) : null}

            {contactError ? (
              <div className="rounded-[22px] border border-[#efc0ba] bg-[#fff4f2] px-4 py-3 text-sm text-[#b14f43]">
                {contactError}
              </div>
            ) : null}

            {circleError ? (
              <div className="rounded-[22px] border border-[#efc0ba] bg-[#fff4f2] px-4 py-3 text-sm text-[#b14f43]">
                {circleError}
              </div>
            ) : null}

            {circleSuccess ? (
              <div className="rounded-[22px] border border-[#d8e8d3] bg-[#f3fbf1] px-4 py-3 text-sm text-[#4a7a3a]">
                {circleSuccess}
              </div>
            ) : null}
          </div>
        ) : null}

        <section className="rounded-[34px] border border-[#eeddd3] bg-[#fff7f2] p-4 shadow-[0_18px_60px_rgba(173,101,72,0.1)] sm:p-5">
          <div className="rounded-[28px] border border-[#f1dfd6] bg-white p-5 sm:p-6">
            <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <div className="rounded-[26px] border border-[#f0dfd6] bg-[#fffdfa] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Contacts
                  </p>
                  <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
                    People you can add
                  </h1>
                  <p className="mt-2 text-[14px] leading-7 text-slate-600">
                    Invite people into shared circles, then track who has joined and who is still pending.
                  </p>

                  <div className="mt-5 space-y-3">
                    {isLoadingContacts ? (
                      <div className="rounded-[22px] border border-dashed border-[#e5d8cf] bg-[#fffaf7] p-4 text-[13px] leading-6 text-slate-500">
                        Loading contacts...
                      </div>
                    ) : contacts.length ? (
                      contacts.map((contact) => (
                        <ContactCard
                          key={contact.id}
                          contact={contact}
                          onDeleteClick={openDeleteContactModal}
                        />
                      ))
                    ) : (
                      <div className="rounded-[22px] border border-dashed border-[#e5d8cf] bg-[#fffaf7] p-4 text-[13px] leading-6 text-slate-500">
                        No contacts added yet.
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={openAddContactModal}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] px-4 text-sm font-semibold text-white shadow-lg"
                  >
                    Add new contact
                  </button>
                </div>

                <PotTypeGuide />
              </aside>

              <section className="min-w-0">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e37b57]">
                      Shared gifting
                    </div>
                    <h2 className="mt-3 text-[34px] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[40px]">
                      Build circles around the people and moments that matter.
                    </h2>
                    <p className="mt-3 max-w-[760px] text-[15px] leading-7 text-slate-600">
                      Create a circle around an event, invite people, choose a hint or paste a product link, and keep the pot warm and flexible.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      initialiseCircleForm(profile, mergedCalendarEvents);
                      setIsCreateOpen(true);
                    }}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg"
                  >
                    Create new circle
                  </button>
                </div>

                <div className="space-y-5">
                  {isLoadingCircles ? (
                    <div className="rounded-[24px] border border-[#f0dfd6] bg-white p-5 text-sm text-slate-500">
                      Loading circles...
                    </div>
                  ) : (
                    displayedCircles.map((circle) => (
                      <CircleCard
                        key={circle.id}
                        circle={circle}
                        onDeleteCircleClick={openDeleteCircleModal}
                        deletingCircleId={isDeletingCircle ? selectedCircleToDelete?.id : null}
                        formatCurrency={formatCurrency}
                      />
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>

      <CreateCircleModal
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          initialiseCircleForm(profile, mergedCalendarEvents);
        }}
        onSubmit={handleCreateCircle}
        contacts={contacts}
        calendarEvents={mergedCalendarEvents}
        selectedPeople={selectedPeople}
        setSelectedPeople={setSelectedPeople}
        eventMode={eventMode}
        setEventMode={setEventMode}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        form={form}
        setForm={setForm}
        linkPreview={linkPreview}
        setLinkPreview={setLinkPreview}
        isFetchingPreview={isFetchingPreview}
        handleFetchPreview={handleFetchPreview}
        selectedHintOwnerId={selectedHintOwnerId}
        setSelectedHintOwnerId={setSelectedHintOwnerId}
        errorMessage={circleError}
        isSubmitting={isCreatingCircle}
        ownHints={ownHints}
        publicHintsByContact={publicHintsByContact}
        selfProfile={profile}
        formatCurrency={formatCurrency}
      />

      <AddContactModal
        key={addContactModalKey}
        modalKey={addContactModalKey}
        open={isAddContactOpen}
        onClose={closeAddContactModal}
        onSave={handleSaveContact}
        supabase={supabase}
      />

      <DeleteContactModal
        open={isDeleteContactOpen}
        onClose={() => {
          setIsDeleteContactOpen(false);
          setSelectedContactToDelete(null);
          setDeleteContactError("");
        }}
        onConfirm={handleConfirmDeleteContact}
        contact={selectedContactToDelete}
        isDeleting={isDeletingContact}
        errorMessage={deleteContactError}
      />

      <DeleteCircleModal
        open={isDeleteCircleOpen}
        onClose={() => {
          setIsDeleteCircleOpen(false);
          setSelectedCircleToDelete(null);
          setDeleteCircleError("");
        }}
        onConfirm={handleConfirmDeleteCircle}
        circle={selectedCircleToDelete}
        isDeleting={isDeletingCircle}
        errorMessage={deleteCircleError}
      />
    </main>
  );
}
