"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import AvatarMenu from "../components/AvatarMenu";

const supabase = createClient();

const currencyOptions = [
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "NZD", symbol: "NZ$", label: "New Zealand Dollar" },
  { code: "ZAR", symbol: "R", label: "South African Rand" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
];

const calendarEvents = [
  { id: 1, title: "Birthday", date: "2026-06-29", type: "Birthday" },
  { id: 2, title: "Anniversary", date: "2026-07-10", type: "Anniversary" },
  { id: 3, title: "Milestone", date: "2026-07-16", type: "Milestone" },
];

const demoCircle = {
  id: "demo-circle",
  isDemo: true,
  title: "Sarah's birthday",
  occasion_type: "Birthday",
  event_date: "2026-06-29",
  deadline_at: "2026-06-27T18:00:00.000Z",
  source_type: "recipient_public_hint",
  item_title: "Weekend cabin stay",
  item_url: "https://example.com/weekend-cabin-stay",
  item_image_url:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  item_description:
    "An example circle built around one saved hint so everyone can contribute toward the same gift.",
  currency: "GBP",
  item_target_amount: 220,
  organising_fee_amount: 8,
  total_target_amount: 228,
  funding_mode: "flexible",
  status: "active",
  invites: [
    { id: "demo-1", invite_name: "You", status: "viewed" },
    { id: "demo-2", invite_name: "Maya", status: "pending" },
    { id: "demo-3", invite_name: "James", status: "pending" },
  ],
};

function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getContactGradient(role) {
  if (role === "Family") return "from-[#eac8b8] to-[#9d6957]";
  if (role === "Partner") return "from-[#e8b9a7] to-[#bf755f]";
  if (role === "Brother" || role === "Sister") return "from-[#4e596d] to-[#212a3c]";
  return "from-[#efcdbf] to-[#bb8168]";
}

function formatDateLabel(dateString) {
  if (!dateString) return "No date";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}

function formatDateWithYear(dateString) {
  if (!dateString) return "No date";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getCurrencyMeta(code) {
  return currencyOptions.find((currency) => currency.code === code) || currencyOptions[0];
}

function formatMoney(amount, currency = "GBP") {
  const safeAmount = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    }).format(safeAmount);
  } catch {
    const fallback = getCurrencyMeta(currency);
    return `${fallback.symbol}${safeAmount}`;
  }
}

function parseAmount(value) {
  const cleaned = String(value || "").replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function LogoMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-white shadow-lg">
      <span className="text-lg">v</span>
    </div>
  );
}

function ModalShell({ open, onClose, title, eyebrow, children, maxWidth = "max-w-[1120px]" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(42,26,20,0.38)] px-4 py-6 backdrop-blur-sm">
      <div
        className={`max-h-[92vh] w-full overflow-hidden rounded-[34px] border border-[#eddacf] bg-[#fffaf7] shadow-[0_24px_80px_rgba(88,46,31,0.22)] ${maxWidth}`}
      >
        <div className="flex items-center justify-between border-b border-[#efe0d7] px-6 py-5">
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

function EmptyContacts({ onAdd }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#e7d7ce] bg-[#fffdfa] p-5 text-center">
      <p className="text-sm font-semibold text-slate-900">No contacts yet</p>
      <p className="mt-2 text-[13px] leading-6 text-slate-500">
        Add a contact first so you can start building circles around real people.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg"
      >
        Add first contact
      </button>
    </div>
  );
}

function ContactCard({ contact, onAdd }) {
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
            {contact.role || "Contact"}
            {contact.note ? ` · ${contact.note}` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAdd(contact)}
          className="inline-flex h-9 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-3 text-[12px] font-semibold text-slate-700 hover:bg-[#fff5f0]"
        >
          Add
        </button>
      </div>
    </article>
  );
}

function InvitePill({ invite }) {
  const label = invite.status === "paid" ? "Paid" : invite.status === "viewed" ? "Viewed" : "Invited";
  const styles =
    invite.status === "paid"
      ? "bg-[#edf6eb] text-[#4a7a3a]"
      : invite.status === "viewed"
        ? "bg-[#eef4ff] text-[#5676b3]"
        : "bg-[#fff3ee] text-[#d57a58]";

  const displayName = invite.invite_name || invite.contact_name || invite.invite_email || "Invite";
  const initials = getInitials(displayName);
  const colors = invite.contact_colors || "from-[#efcdbf] to-[#bb8168]";

  return (
    <div className="rounded-[20px] border border-[#eee1d9] bg-[#fffdfa] p-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b text-[11px] font-bold text-white ${colors}`}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}>
              {label}
            </span>
            {invite.invite_email ? <span className="truncate text-[11px] text-slate-400">{invite.invite_email}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function PotPreviewCard({ image, title, description, url, sourceLabel, compact = false }) {
  if (!title && !description && !url && !image) return null;

  return (
    <div className={`rounded-[22px] border border-[#eedfd6] bg-[#fffdfa] ${compact ? "p-3" : "p-4"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Linked item</p>

      <div className={`mt-3 flex ${compact ? "gap-3" : "gap-4"}`}>
        {image ? (
          <img
            src={image}
            alt={title || "Linked item preview"}
            className={`${compact ? "h-16 w-16 rounded-[16px]" : "h-20 w-20 rounded-[18px]"} object-cover`}
          />
        ) : (
          <div className={`${compact ? "h-16 w-16 rounded-[16px]" : "h-20 w-20 rounded-[18px]"} bg-[#f5ebe4]`} />
        )}

        <div className="min-w-0 flex-1">
          <p className={`${compact ? "text-[13px]" : "text-sm"} font-semibold text-slate-900`}>
            {title || "Untitled item"}
          </p>

          {description ? (
            <p className={`mt-1 ${compact ? "text-[12px] leading-5" : "text-[13px] leading-6"} text-slate-500`}>
              {description}
            </p>
          ) : null}

          {sourceLabel ? <p className="mt-2 text-[12px] font-medium text-[#df7b59]">{sourceLabel}</p> : null}

          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block truncate text-[12px] text-slate-500 underline decoration-[#e8b4a0] underline-offset-4"
            >
              {url}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CircleCard({ circle, onOpenInviteModal }) {
  const inviteCount = circle.invites?.length || 0;
  const viewedCount = circle.invites?.filter((invite) => invite.status === "viewed" || invite.status === "paid").length || 0;
  const targetLabel = formatMoney(circle.total_target_amount, circle.currency);
  const itemLabel = formatMoney(circle.item_target_amount, circle.currency);
  const feeLabel = formatMoney(circle.organising_fee_amount, circle.currency);
  const sourceLabelMap = {
    recipient_public_hint: "From recipient's public hints",
    organiser_private_hint: "Saved privately by organiser",
    shop_item: "From Hinted Shop",
    external_link: "From an external link",
  };

  return (
    <article className="rounded-[30px] border border-[#f0dfd6] bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Circle</p>
                {circle.isDemo ? (
                  <span className="rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">
                    Demo example
                  </span>
                ) : null}
              </div>
              <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.05em] text-slate-900">{circle.title}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {(circle.occasion_type || "Occasion") + " · " + formatDateWithYear(circle.event_date)}
              </p>
            </div>

            <div className="rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">
              {inviteCount} invited · {viewedCount} opened
            </div>
          </div>

          <p className="mt-4 max-w-[60ch] text-[14px] leading-7 text-slate-600">
            {circle.isDemo
              ? "A simple example of how one shared item can turn into one calm group plan. Your real circles will appear here once you create one."
              : "Keep one gift, one target, and one invite list in one place so the organiser does not have to chase everyone manually."}
          </p>

          <div className="mt-5 rounded-[24px] border border-dashed border-[#e6d7cd] bg-[#fffaf7] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Invite list</p>
                <p className="mt-1 text-[13px] text-slate-500">
                  Invitees stay simple for now: invited, viewed, and later paid once contributions are live.
                </p>
              </div>

              {!circle.isDemo ? (
                <button
                  type="button"
                  onClick={() => onOpenInviteModal(circle)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]"
                >
                  Add people
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {circle.invites?.length ? (
                circle.invites.map((invite) => <InvitePill key={invite.id} invite={invite} />)
              ) : (
                <div className="rounded-[20px] bg-white p-4 text-sm text-slate-500">
                  No invites added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-[#eedfd6] bg-[radial-gradient(circle_at_top,_#fff7f2,_#fffdfa_62%)] p-5">
          <div className="flex flex-col text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Shared target</p>
            <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">{circle.item_title}</h3>
            <p className="mt-2 text-[13px] leading-6 text-slate-500">
              {sourceLabelMap[circle.source_type] || "Chosen item for this circle"}
            </p>

            <div className="mt-5 rounded-[24px] border border-[#f0e0d7] bg-white p-4 text-left">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Target</p>
                  <p className="mt-1 text-[28px] font-semibold tracking-[-0.05em] text-slate-900">{targetLabel}</p>
                </div>
                <div className="rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold text-[#df7b59] capitalize">
                  {String(circle.status || "draft").replaceAll("_", " ")}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] bg-[#faf7f4] p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Item amount</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{itemLabel}</p>
                </div>
                <div className="rounded-[18px] bg-[#faf7f4] p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Hinted fee</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{feeLabel}</p>
                </div>
                <div className="rounded-[18px] bg-[#faf7f4] p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Deadline</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateLabel(circle.deadline_at)}</p>
                </div>
                <div className="rounded-[18px] bg-[#faf7f4] p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Funding mode</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                    {String(circle.funding_mode || "flexible").replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 text-left">
              <PotPreviewCard
                image={circle.item_image_url}
                title={circle.item_title}
                description={circle.item_description}
                url={circle.item_url}
                sourceLabel={sourceLabelMap[circle.source_type] || "Chosen item"}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function AddContactModal({ open, onClose, onSave, form, setForm, isSaving }) {
  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Contact" title="Add a new contact" maxWidth="max-w-[720px]">
      <div className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
              placeholder="Maya"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Relationship</span>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
              placeholder="Friend"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Birthday</span>
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm((prev) => ({ ...prev, birthday: e.target.value }))}
              className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
              placeholder="maya@example.com"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
              placeholder="Optional"
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Note</span>
            <textarea
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              className="min-h-[110px] w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
              placeholder="Optional note"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save contact"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function CreateCircleModal({
  open,
  onClose,
  onSubmit,
  contacts,
  calendarEvents,
  selectedPeople,
  setSelectedPeople,
  eventMode,
  setEventMode,
  selectedEventId,
  setSelectedEventId,
  form,
  setForm,
}) {
  if (!open) return null;

  const amountLabel = useMemo(() => {
    const amount = parseAmount(form.itemTargetAmount);
    return formatMoney(amount, form.currency || "GBP");
  }, [form.itemTargetAmount, form.currency]);

  const feeLabel = useMemo(() => {
    const fee = parseAmount(form.organisingFeeAmount);
    return formatMoney(fee, form.currency || "GBP");
  }, [form.organisingFeeAmount, form.currency]);

  const totalLabel = useMemo(() => {
    const total = parseAmount(form.itemTargetAmount) + parseAmount(form.organisingFeeAmount);
    return formatMoney(total, form.currency || "GBP");
  }, [form.itemTargetAmount, form.organisingFeeAmount, form.currency]);

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="New circle" title="Create a circle around an item">
      <div className="grid gap-0 lg:grid-cols-[1.06fr_0.94fr]">
        <div className="max-h-[calc(92vh-90px)] space-y-6 overflow-y-auto p-6">
          <div className="rounded-[24px] border border-[#eedfd6] bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">1. Choose the event</p>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setEventMode("calendar")}
                className={`inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold ${
                  eventMode === "calendar"
                    ? "bg-[#2f3b2d] text-white"
                    : "border border-[#ead8ce] bg-white text-slate-700"
                }`}
              >
                Suggested
              </button>
              <button
                type="button"
                onClick={() => setEventMode("new")}
                className={`inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold ${
                  eventMode === "new"
                    ? "bg-[#2f3b2d] text-white"
                    : "border border-[#ead8ce] bg-white text-slate-700"
                }`}
              >
                New event
              </button>
            </div>

            {eventMode === "calendar" ? (
              <div className="mt-4 space-y-3">
                {calendarEvents.map((event) => (
                  <label
                    key={event.id}
                    className={`flex cursor-pointer items-center justify-between rounded-[20px] border p-4 ${
                      String(event.id) === selectedEventId
                        ? "border-[#f0a384] bg-[#fff4ee]"
                        : "border-[#efe1d9] bg-[#fffdfa]"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                      <p className="mt-1 text-[13px] text-slate-500">
                        {event.type} · {event.date}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="calendarEvent"
                      className="h-4 w-4 accent-[#f36f64]"
                      checked={String(event.id) === selectedEventId}
                      onChange={() => {
                        setSelectedEventId(String(event.id));
                        setForm((prev) => ({
                          ...prev,
                          title: prev.title || event.title,
                          occasionType: event.type,
                          eventDate: event.date,
                          deadline: event.date,
                        }));
                      }}
                    />
                  </label>
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Circle title</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                    placeholder="Sarah's birthday gift"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Occasion</span>
                  <input
                    type="text"
                    value={form.occasionType}
                    onChange={(e) => setForm((prev) => ({ ...prev, occasionType: e.target.value }))}
                    className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                    placeholder="Birthday"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Event date</span>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        eventDate: e.target.value,
                        deadline: prev.deadline || e.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-[#eedfd6] bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">2. Circle details</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                  placeholder="Sarah's birthday gift"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Contribution deadline</span>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                  className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">If people do not join</span>
                <select
                  value={form.fundingMode}
                  onChange={(e) => setForm((prev) => ({ ...prev, fundingMode: e.target.value }))}
                  className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                >
                  <option value="flexible">Flexible pot</option>
                  <option value="all_or_nothing">All-or-nothing</option>
                  <option value="organiser_covers">Organizer covers gap</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#eedfd6] bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">3. The item</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Item title</span>
                <input
                  type="text"
                  value={form.itemTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, itemTitle: e.target.value }))}
                  className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                  placeholder="Weekend cabin stay"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Item link</span>
                <input
                  type="url"
                  value={form.itemUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, itemUrl: e.target.value }))}
                  className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                  placeholder="https://..."
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Item image URL</span>
                <input
                  type="url"
                  value={form.itemImageUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, itemImageUrl: e.target.value }))}
                  className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                  placeholder="https://..."
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Short description</span>
                <textarea
                  value={form.itemDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, itemDescription: e.target.value }))}
                  className="min-h-[100px] w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                  placeholder="Why this makes sense for the circle"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#eedfd6] bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">4. Amounts</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Currency</span>
                <select
                  value={form.currency}
                  onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                  className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                >
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code} · {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Source type</span>
                <select
                  value={form.sourceType}
                  onChange={(e) => setForm((prev) => ({ ...prev, sourceType: e.target.value }))}
                  className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                >
                  <option value="recipient_public_hint">Recipient public hint</option>
                  <option value="organiser_private_hint">Organiser private hint</option>
                  <option value="shop_item">Hinted Shop</option>
                  <option value="external_link">External link</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Item amount</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.itemTargetAmount}
                  onChange={(e) => setForm((prev) => ({ ...prev, itemTargetAmount: e.target.value }))}
                  className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                  placeholder="220"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Hinted organising fee</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.organisingFeeAmount}
                  onChange={(e) => setForm((prev) => ({ ...prev, organisingFeeAmount: e.target.value }))}
                  className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
                  placeholder="8"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto border-t border-[#efe0d7] bg-[#fff7f2] p-6 lg:border-l lg:border-t-0">
          <div className="rounded-[24px] border border-dashed border-[#e6d7cd] bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">5. Invite people</p>
            <p className="mt-1 text-[13px] leading-6 text-slate-500">
              Add people now. They will start as invited, and reminders can be added later when payments go live.
            </p>

            <div className="mt-4 min-h-[120px] rounded-[20px] bg-[#fffaf7] p-4">
              {selectedPeople.length ? (
                <div className="flex flex-wrap gap-3">
                  {selectedPeople.map((person) => (
                    <div key={person.id} className="inline-flex items-center gap-2 rounded-full border border-[#ead8ce] bg-white px-3 py-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b text-[11px] font-bold text-white ${person.colors}`}
                      >
                        {person.initials}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{person.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPeople((prev) => prev.filter((item) => item.id !== person.id))}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label={`Remove ${person.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No one added yet.</p>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {contacts.length ? (
                contacts.map((contact) => {
                  const alreadyAdded = selectedPeople.some((person) => person.id === contact.id);
                  return (
                    <div key={contact.id} className="flex items-center justify-between rounded-[18px] border border-[#f0dfd6] bg-[#fffdfa] p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b text-[11px] font-bold text-white ${contact.colors}`}
                        >
                          {contact.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                          <p className="text-[12px] text-slate-500">{contact.role || "Contact"}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => setSelectedPeople((prev) => [...prev, contact])}
                        className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[12px] font-semibold ${
                          alreadyAdded
                            ? "bg-[#f4efe9] text-slate-400"
                            : "border border-[#ead8ce] bg-white text-slate-700 hover:bg-[#fff5f0]"
                        }`}
                      >
                        {alreadyAdded ? "Added" : "Add"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400">Add contacts first, then come back to create a circle.</p>
              )}
            </div>

            <div className="mt-6 rounded-[20px] bg-[#fffaf7] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Total target</p>
              <p className="mt-1 text-[28px] font-semibold tracking-[-0.05em] text-slate-900">{totalLabel}</p>
              <div className="mt-3 space-y-2 text-[13px] text-slate-500">
                <div className="flex items-center justify-between gap-3">
                  <span>Item</span>
                  <span className="font-medium text-slate-700">{amountLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Hinted organising fee</span>
                  <span className="font-medium text-slate-700">{feeLabel}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={!contacts.length}
                className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
              >
                Create circle
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function AddInvitesModal({ open, onClose, circle, contacts, onSave, selectedPeople, setSelectedPeople, isSaving }) {
  if (!open || !circle) return null;

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Invite people" title={`Add people to ${circle.title}`} maxWidth="max-w-[820px]">
      <div className="space-y-5 p-6">
        <p className="text-sm leading-7 text-slate-600">
          Add more real contacts to this circle now. Invite status will begin as invited until email and payment flows are wired.
        </p>

        <div className="rounded-[20px] bg-[#fffaf7] p-4">
          {selectedPeople.length ? (
            <div className="flex flex-wrap gap-3">
              {selectedPeople.map((person) => (
                <div key={person.id} className="inline-flex items-center gap-2 rounded-full border border-[#ead8ce] bg-white px-3 py-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b text-[11px] font-bold text-white ${person.colors}`}
                  >
                    {person.initials}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{person.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPeople((prev) => prev.filter((item) => item.id !== person.id))}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label={`Remove ${person.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No additional people selected yet.</p>
          )}
        </div>

        <div className="space-y-3">
          {contacts.length ? (
            contacts.map((contact) => {
              const alreadyAdded = selectedPeople.some((person) => person.id === contact.id);
              return (
                <div key={contact.id} className="flex items-center justify-between rounded-[18px] border border-[#f0dfd6] bg-[#fffdfa] p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b text-[11px] font-bold text-white ${contact.colors}`}
                    >
                      {contact.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                      <p className="text-[12px] text-slate-500">{contact.role || "Contact"}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => setSelectedPeople((prev) => [...prev, contact])}
                    className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[12px] font-semibold ${
                      alreadyAdded
                        ? "bg-[#f4efe9] text-slate-400"
                        : "border border-[#ead8ce] bg-white text-slate-700 hover:bg-[#fff5f0]"
                    }`}
                  >
                    {alreadyAdded ? "Added" : "Add"}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400">No contacts available yet.</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!selectedPeople.length || isSaving}
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save invites"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default function CirclesClient() {
  const [session, setSession] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isCreateCircleOpen, setIsCreateCircleOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingCircle, setSavingCircle] = useState(false);
  const [savingInvites, setSavingInvites] = useState(false);
  const [activeCircle, setActiveCircle] = useState(null);

  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    note: "",
    email: "",
    phone: "",
    birthday: "",
  });

  const [eventMode, setEventMode] = useState("calendar");
  const [selectedEventId, setSelectedEventId] = useState("1");
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [inviteSelections, setInviteSelections] = useState([]);
  const [circleForm, setCircleForm] = useState({
    title: "Sarah's birthday gift",
    occasionType: "Birthday",
    eventDate: "2026-06-29",
    deadline: "2026-06-29",
    itemTitle: "Weekend cabin stay",
    itemUrl: "",
    itemImageUrl: "",
    itemDescription: "",
    currency: "GBP",
    sourceType: "recipient_public_hint",
    itemTargetAmount: "220",
    organisingFeeAmount: "8",
    fundingMode: "flexible",
  });

  const resetContactForm = () => {
    setContactForm({
      name: "",
      role: "",
      note: "",
      email: "",
      phone: "",
      birthday: "",
    });
  };

  const resetCircleForm = () => {
    setEventMode("calendar");
    setSelectedEventId("1");
    setSelectedPeople([]);
    setCircleForm({
      title: "Sarah's birthday gift",
      occasionType: "Birthday",
      eventDate: "2026-06-29",
      deadline: "2026-06-29",
      itemTitle: "Weekend cabin stay",
      itemUrl: "",
      itemImageUrl: "",
      itemDescription: "",
      currency: "GBP",
      sourceType: "recipient_public_hint",
      itemTargetAmount: "220",
      organisingFeeAmount: "8",
      fundingMode: "flexible",
    });
  };

  const hydrateContact = (row) => ({
    ...row,
    initials: getInitials(row.name),
    colors: getContactGradient(row.role),
  });

  const fetchContactsAndCircles = async (userId) => {
    setLoading(true);
    setErrorMessage("");

    const [{ data: contactRows, error: contactsError }, { data: circleRows, error: circlesError }] = await Promise.all([
      supabase
        .from("contacts")
        .select("id, user_id, name, role, note, email, phone, birthday, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("circles")
        .select(`
          id,
          user_id,
          recipient_contact_id,
          title,
          occasion_type,
          event_date,
          deadline_at,
          source_type,
          item_title,
          item_url,
          item_image_url,
          item_description,
          currency,
          item_target_amount,
          organising_fee_amount,
          total_target_amount,
          funding_mode,
          status,
          created_at,
          circle_invites (
            id,
            contact_id,
            invite_name,
            invite_email,
            status,
            created_at
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (contactsError || circlesError) {
      setErrorMessage(contactsError?.message || circlesError?.message || "Unable to load circles.");
      setLoading(false);
      return;
    }

    const hydratedContacts = (contactRows || []).map(hydrateContact);
    setContacts(hydratedContacts);

    const contactMap = new Map(hydratedContacts.map((contact) => [contact.id, contact]));

    const hydratedCircles = (circleRows || []).map((circle) => ({
      ...circle,
      invites: (circle.circle_invites || []).map((invite) => {
        const contact = invite.contact_id ? contactMap.get(invite.contact_id) : null;
        return {
          ...invite,
          contact_name: contact?.name || null,
          contact_colors: contact?.colors || null,
        };
      }),
    }));

    setCircles(hydratedCircles);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        if (mounted) {
          setErrorMessage(error.message);
          setLoading(false);
        }
        return;
      }

      const activeSession = data.session;
      if (!mounted) return;
      setSession(activeSession);

      if (!activeSession?.user?.id) {
        setLoading(false);
        return;
      }

      await fetchContactsAndCircles(activeSession.user.id);
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user?.id) {
        await fetchContactsAndCircles(nextSession.user.id);
      } else {
        setContacts([]);
        setCircles([]);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSaveContact = async () => {
    if (!session?.user?.id) {
      setErrorMessage("You need to be signed in to save a contact.");
      return;
    }

    if (!contactForm.name.trim()) {
      setErrorMessage("Please add a name for the contact.");
      return;
    }

    setSavingContact(true);
    setErrorMessage("");

    const payload = {
      user_id: session.user.id,
      name: contactForm.name.trim(),
      role: contactForm.role.trim() || null,
      note: contactForm.note.trim() || null,
      email: contactForm.email.trim() || null,
      phone: contactForm.phone.trim() || null,
      birthday: contactForm.birthday || null,
    };

    const { data, error } = await supabase
      .from("contacts")
      .insert(payload)
      .select("id, user_id, name, role, note, email, phone, birthday, created_at, updated_at")
      .single();

    if (error) {
      setErrorMessage(error.message);
      setSavingContact(false);
      return;
    }

    const hydrated = hydrateContact(data);
    setContacts((prev) => [hydrated, ...prev]);
    resetContactForm();
    setIsAddContactOpen(false);
    setSavingContact(false);
  };

  const handleCreateCircle = async () => {
    if (!session?.user?.id) {
      setErrorMessage("You need to be signed in to create a circle.");
      return;
    }

    if (!circleForm.title.trim() || !circleForm.itemTitle.trim()) {
      setErrorMessage("Please add a circle title and item title.");
      return;
    }

    setSavingCircle(true);
    setErrorMessage("");

    const itemAmount = parseAmount(circleForm.itemTargetAmount);
    const feeAmount = parseAmount(circleForm.organisingFeeAmount);
    const totalAmount = itemAmount + feeAmount;

    const deadlineAt = circleForm.deadline
      ? new Date(`${circleForm.deadline}T18:00:00`).toISOString()
      : null;

    const circlePayload = {
      user_id: session.user.id,
      title: circleForm.title.trim(),
      occasion_type: circleForm.occasionType.trim() || null,
      event_date: circleForm.eventDate || null,
      deadline_at: deadlineAt,
      source_type: circleForm.sourceType,
      item_title: circleForm.itemTitle.trim(),
      item_url: circleForm.itemUrl.trim() || null,
      item_image_url: circleForm.itemImageUrl.trim() || null,
      item_description: circleForm.itemDescription.trim() || null,
      currency: circleForm.currency,
      item_target_amount: itemAmount,
      organising_fee_amount: feeAmount,
      total_target_amount: totalAmount,
      funding_mode: circleForm.fundingMode,
      status: "active",
    };

    const { data: insertedCircle, error: circleError } = await supabase
      .from("circles")
      .insert(circlePayload)
      .select("*")
      .single();

    if (circleError) {
      setErrorMessage(circleError.message);
      setSavingCircle(false);
      return;
    }

    if (selectedPeople.length) {
      const inviteRows = selectedPeople.map((person) => ({
        circle_id: insertedCircle.id,
        user_id: session.user.id,
        contact_id: person.id,
        invite_name: person.name,
        invite_email: person.email || `${person.id}@pending.local`,
        status: "pending",
      }));

      const { error: inviteError } = await supabase.from("circle_invites").insert(inviteRows);
      if (inviteError) {
        setErrorMessage(inviteError.message);
      }
    }

    await fetchContactsAndCircles(session.user.id);
    resetCircleForm();
    setIsCreateCircleOpen(false);
    setSavingCircle(false);
  };

  const handleSaveInvites = async () => {
    if (!session?.user?.id || !activeCircle || !inviteSelections.length) {
      setIsInviteModalOpen(false);
      return;
    }

    setSavingInvites(true);
    setErrorMessage("");

    const existingContactIds = new Set((activeCircle.invites || []).map((invite) => invite.contact_id).filter(Boolean));
    const rowsToInsert = inviteSelections
      .filter((person) => !existingContactIds.has(person.id))
      .map((person) => ({
        circle_id: activeCircle.id,
        user_id: session.user.id,
        contact_id: person.id,
        invite_name: person.name,
        invite_email: person.email || `${person.id}@pending.local`,
        status: "pending",
      }));

    if (rowsToInsert.length) {
      const { error } = await supabase.from("circle_invites").insert(rowsToInsert);
      if (error) {
        setErrorMessage(error.message);
        setSavingInvites(false);
        return;
      }
    }

    await fetchContactsAndCircles(session.user.id);
    setInviteSelections([]);
    setActiveCircle(null);
    setIsInviteModalOpen(false);
    setSavingInvites(false);
  };

  const openInviteModal = (circle) => {
    setActiveCircle(circle);
    setInviteSelections([]);
    setIsInviteModalOpen(true);
  };

  const visibleCircles = circles.length ? circles : [demoCircle];

  return (
    <main className="min-h-screen bg-[#fcf8f5] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-[#f1e6df] bg-[#fcf8f5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#df7b59]">Hinted</p>
              <h1 className="text-lg font-semibold tracking-[-0.04em] text-slate-900">Circles</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/feed" className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-900">
              Feed
            </Link>
            <Link href="/hints" className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-900">
              Hints
            </Link>
            <Link href="/shop" className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-900">
              Shop
            </Link>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">Circles</span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateCircleOpen(true)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg"
            >
              Create circle
            </button>
            <AvatarMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Contacts</p>
                  <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">People you can invite</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(true)}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-4 text-sm font-semibold text-white shadow-lg"
                >
                  Add contact
                </button>
              </div>

              <p className="mt-2 text-[14px] leading-7 text-slate-600">
                Keep this list real. If there are no contacts yet, start there first.
              </p>

              <div className="mt-5 space-y-3">
                {loading ? (
                  <div className="rounded-[20px] bg-[#faf7f4] p-4 text-sm text-slate-500">Loading contacts...</div>
                ) : contacts.length ? (
                  contacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} onAdd={(person) => setSelectedPeople((prev) => [...prev, person])} />
                  ))
                ) : (
                  <EmptyContacts onAdd={() => setIsAddContactOpen(true)} />
                )}
              </div>
            </section>
          </aside>

          <section className="space-y-5">
            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Circles</p>
                  <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.05em] text-slate-900">
                    Group gifting without the awkward chasing
                  </h2>
                  <p className="mt-2 max-w-[64ch] text-[14px] leading-7 text-slate-600">
                    Start one shared circle around one clear item, invite the right people, and keep the plan calm and visible in one place.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#f0dfd6] bg-[#fffaf7] px-4 py-3 text-sm text-slate-600">
                  {circles.length ? `${circles.length} real circle${circles.length === 1 ? "" : "s"}` : "Showing one demo example until you create your first real circle"}
                </div>
              </div>
            </section>

            {errorMessage ? (
              <div className="rounded-[20px] border border-[#f1d1c8] bg-[#fff5f0] p-4 text-sm text-[#a55339]">{errorMessage}</div>
            ) : null}

            <div className="space-y-5">
              {loading ? (
                <div className="rounded-[28px] border border-[#f0dfd6] bg-white p-6 text-sm text-slate-500 shadow-sm">
                  Loading circles...
                </div>
              ) : (
                visibleCircles.map((circle) => (
                  <CircleCard key={circle.id} circle={circle} onOpenInviteModal={openInviteModal} />
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <AddContactModal
        open={isAddContactOpen}
        onClose={() => {
          resetContactForm();
          setIsAddContactOpen(false);
        }}
        onSave={handleSaveContact}
        form={contactForm}
        setForm={setContactForm}
        isSaving={savingContact}
      />

      <CreateCircleModal
        open={isCreateCircleOpen}
        onClose={() => {
          resetCircleForm();
          setIsCreateCircleOpen(false);
        }}
        onSubmit={handleCreateCircle}
        contacts={contacts}
        calendarEvents={calendarEvents}
        selectedPeople={selectedPeople}
        setSelectedPeople={setSelectedPeople}
        eventMode={eventMode}
        setEventMode={setEventMode}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        form={circleForm}
        setForm={setCircleForm}
      />

      <AddInvitesModal
        open={isInviteModalOpen}
        onClose={() => {
          setInviteSelections([]);
          setActiveCircle(null);
          setIsInviteModalOpen(false);
        }}
        circle={activeCircle}
        contacts={contacts}
        onSave={handleSaveInvites}
        selectedPeople={inviteSelections}
        setSelectedPeople={setInviteSelections}
        isSaving={savingInvites}
      />
    </main>
  );
}
