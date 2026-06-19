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

const relationshipOptions = ["Partner", "Family", "Friend", "Brother", "Sister", "Parent", "Colleague", "Child"];

const calendarEvents = [
  { id: 1, title: "Sarah's Birthday", date: "2026-06-29", type: "Birthday" },
  { id: 2, title: "Mum & Dad Anniversary", date: "2026-07-10", type: "Anniversary" },
  { id: 3, title: "James Promotion Dinner", date: "2026-07-16", type: "Milestone" },
];

const demoCircle = {
  id: "demo-circle",
  name: "Sarah's Birthday",
  subtitle: "Birthday · 29 June",
  description: "A shared circle for Sarah’s next gift so everyone can contribute without duplicating ideas.",
  members: [
    { name: "You", initials: "Y", contributed: true, amount: 40, colors: "from-[#4e596d] to-[#212a3c]", status: "joined" },
    { name: "Maya", initials: "M", contributed: true, amount: 35, colors: "from-[#efc3af] to-[#ae6e57]", status: "joined" },
    { name: "James", initials: "J", contributed: false, amount: 0, colors: "from-[#4e596d] to-[#212a3c]", status: "invited" },
    { name: "Fiona", initials: "F", contributed: true, amount: 20, colors: "from-[#809168] to-[#41512e]", status: "joined" },
  ],
  pot: {
    active: true,
    item: "Weekend cabin stay",
    source: "From Sarah’s public hints",
    sourceUrl: "https://example.com/weekend-cabin-stay",
    previewImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    previewDescription: "A memorable shared experience with a clear target that works naturally as a circle goal.",
    target: 220,
    currency: "GBP",
    raised: 95,
    note: "Selected from Sarah’s own hints so the group has a clear goal.",
    fundingMode: "Flexible pot",
    deadline: "2026-06-29",
    goalType: "item",
  },
  isDemo: true,
};

const publicHintsByContact = {
  demo: [
    {
      id: "sarah-1",
      title: "Weekend cabin stay",
      subtitle: "£220 · Public hint",
      amount: 220,
      currency: "GBP",
      description: "A memorable shared experience with a clear target that works naturally as a circle goal.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      url: "https://example.com/weekend-cabin-stay",
    },
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
  if (["Family", "Parent"].includes(role)) return "from-[#eac8b8] to-[#9d6957]";
  if (role === "Partner") return "from-[#e8b9a7] to-[#bf755f]";
  if (["Brother", "Sister"].includes(role)) return "from-[#4e596d] to-[#212a3c]";
  if (role === "Colleague") return "from-[#b7c8db] to-[#6b88a7]";
  return "from-[#efcdbf] to-[#bb8168]";
}

function formatDateLabel(dateString) {
  if (!dateString) return "No date";
  return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
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

function ModalShell({ open, onClose, title, eyebrow, children, maxWidth = "max-w-[1120px]" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(42,26,20,0.38)] px-4 py-6 backdrop-blur-sm">
      <div className={`max-h-[92vh] w-full overflow-hidden rounded-[34px] border border-[#eddacf] bg-[#fffaf7] shadow-[0_24px_80px_rgba(88,46,31,0.22)] ${maxWidth}`}>
        <div className="flex items-center justify-between border-b border-[#efe0d7] px-6 py-5">
          <div>
            {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#df7b59]">{eyebrow}</p> : null}
            <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.05em] text-slate-900">{title}</h2>
          </div>
          <button onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white text-slate-500 hover:bg-[#fff2eb]" aria-label="Close window" type="button">✕</button>
        </div>
        {children}
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
          <circle cx="70" cy="70" r={radius} stroke={`url(#${ringId})`} strokeWidth="12" strokeLinecap="round" fill="none" strokeDasharray={circumference} strokeDashoffset={dash} />
          <defs>
            <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9b75" />
              <stop offset="100%" stopColor="#f36f64" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-white/80">
          <span className="text-[28px] font-semibold tracking-[-0.06em] text-slate-900">{Math.round(percentage)}%</span>
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">funded</span>
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
          <img src={image} alt={title || "Linked item preview"} className={`${compact ? "h-16 w-16 rounded-[16px]" : "h-20 w-20 rounded-[18px]"} object-cover`} />
        ) : (
          <div className={`${compact ? "h-16 w-16 rounded-[16px]" : "h-20 w-20 rounded-[18px]"} bg-[#f5ebe4]`} />
        )}
        <div className="min-w-0 flex-1">
          <p className={`${compact ? "text-[13px]" : "text-sm"} font-semibold text-slate-900`}>{title || "Untitled item"}</p>
          {description ? <p className={`mt-1 ${compact ? "text-[12px] leading-5" : "text-[13px] leading-6"} text-slate-500`}>{description}</p> : null}
          {sourceLabel ? <p className="mt-2 text-[12px] font-medium text-[#df7b59]">{sourceLabel}</p> : null}
          {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block truncate text-[12px] text-slate-500 underline decoration-[#e8b4a0] underline-offset-4">{url}</a> : null}
        </div>
      </div>
    </div>
  );
}

function PotTypeGuide() {
  const potTypes = [
    { title: "Flexible pot", text: "Anyone invited can join and contribute what they want. If fewer people join, the group can still continue with a smaller total or switch to a simpler gift.", colors: "bg-[#edf6eb] text-[#4a7a3a]" },
    { title: "All-or-nothing", text: "The circle only goes ahead if the target is reached by the deadline. This works best when the item only makes sense at the full amount.", colors: "bg-[#fff3ee] text-[#d57a58]" },
    { title: "Organizer covers gap", text: "The organiser can choose to top up the missing amount if not everyone joins or contributes. Useful when the gift matters more than exact participation.", colors: "bg-[#eef4ff] text-[#5676b3]" },
  ];

  return (
    <section className="rounded-[26px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pot guide</p>
      <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">How pot types work</h2>
      <p className="mt-2 text-[14px] leading-7 text-slate-600">Choose the funding style that best fits the gift and how certain you are that everyone will join.</p>
      <div className="mt-5 space-y-3">
        {potTypes.map((type) => (
          <div key={type.title} className="rounded-[20px] bg-[#faf7f4] p-4">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${type.colors}`}>{type.title}</span>
            <p className="mt-3 text-[13px] leading-6 text-slate-600">{type.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AddContactModal({ open, onClose, onSave, form, setForm, isSaving }) {
  const toggleRelationship = (value) => {
    setForm((prev) => ({
      ...prev,
      relationshipTypes: prev.relationshipTypes.includes(value)
        ? prev.relationshipTypes.filter((item) => item !== value)
        : [...prev.relationshipTypes, value],
    }));
  };

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Contact" title="Add a contact" maxWidth="max-w-[760px]">
      <div className="space-y-5 p-6">
        <div className="rounded-[24px] border border-dashed border-[#e6d7cd] bg-[#fffdfb] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Bring someone in quickly</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-900">Add from Gmail or type their email</h3>
          <p className="mt-2 text-[14px] leading-7 text-slate-600">Use the onboarding-style flow here: connect Google later, or add someone manually now so they are ready for hints and circles.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 flex-1 items-center rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-400">Search Gmail contacts</div>
            <button type="button" className="inline-flex h-12 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]">Connect Google</button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2"><span className="text-sm font-medium text-slate-700">Name</span><input type="text" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]" placeholder="Maya" /></label>
          <label className="space-y-2 sm:col-span-2"><span className="text-sm font-medium text-slate-700">Email</span><input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]" placeholder="maya@example.com" /></label>
          <div className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Relationship</span>
            <div className="flex flex-wrap gap-2">
              {relationshipOptions.map((option) => {
                const isSelected = form.relationshipTypes.includes(option);
                return <button key={option} type="button" onClick={() => toggleRelationship(option)} className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition ${isSelected ? "border-[#f0a384] bg-[#fff4ee] text-[#a95b3e]" : "border-[#ead8ce] bg-white text-slate-700 hover:bg-[#fff5f0]"}`}>{option}</button>;
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1"><button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]">Cancel</button><button type="button" onClick={onSave} disabled={isSaving} className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{isSaving ? "Saving..." : "Save contact"}</button></div>
      </div>
    </ModalShell>
  );
}

function ContactPanel({ contacts, onAddContact }) {
  return (
    <section className="rounded-[26px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Contacts</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">People for future circles</h2>
          <p className="mt-2 text-[14px] leading-7 text-slate-600">Keep contacts light for now. Add them from Gmail or save an email manually when you are ready to invite someone.</p>
        </div>
      </div>
      {contacts.length ? (
        <div className="mt-5 space-y-3">
          {contacts.map((contact) => (
            <article key={contact.id} className="rounded-[22px] border border-[#f0dfd6] bg-[#fffdfa] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b text-[12px] font-bold text-white ${contact.colors}`}>{contact.initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                  <p className="text-xs text-slate-500">{contact.role || "Contact"}</p>
                  {contact.email ? <p className="truncate text-[11px] text-slate-400">{contact.email}</p> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[24px] border border-dashed border-[#e7d7ce] bg-[#fffdfa] p-5 text-center">
          <p className="text-sm font-semibold text-slate-900">No contacts yet</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-500">Add a contact first so you can start building circles around real people.</p>
          <button type="button" onClick={onAddContact} className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg">Add contact</button>
        </div>
      )}
    </section>
  );
}

function CircleCard({ circle, onEditPot }) {
  const joinedCount = circle.members.filter((member) => member.status === "joined").length;
  const invitedCount = circle.members.length;
  const moneyLabel = formatMoney(circle.pot.target, circle.pot.currency);
  const raisedLabel = formatMoney(circle.pot.raised, circle.pot.currency);
  return (
    <article className="rounded-[30px] border border-[#f0dfd6] bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Circle</p>
                {circle.isDemo ? <span className="rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">Demo example</span> : null}
              </div>
              <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.05em] text-slate-900">{circle.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{circle.subtitle}</p>
            </div>
            <div className="rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">{joinedCount} of {invitedCount} joined</div>
          </div>
          <p className="mt-4 max-w-[60ch] text-[14px] leading-7 text-slate-600">{circle.description}</p>
          <div className="mt-5 rounded-[24px] border border-dashed border-[#e6d7cd] bg-[#fffaf7] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Members</p>
                <p className="mt-1 text-[13px] text-slate-500">People can be invited now and only become full members once they accept.</p>
              </div>
              <div className="rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">Circle invite flow</div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {circle.members.map((member) => (
                <div key={`${circle.id}-${member.name}`} className="rounded-[20px] border border-[#eee1d9] bg-[#fffdfa] p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b text-[11px] font-bold text-white ${member.colors}`}>{member.initials}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                      <div className="mt-1 flex items-center gap-2"><span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold bg-[#edf6eb] text-[#4a7a3a]">{member.contributed ? "Contributed" : member.status === "joined" ? "Joined" : "Invited"}</span><span className="text-[11px] text-slate-400">{member.contributed ? formatMoney(member.amount, circle.pot.currency) : "—"}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[30px] border border-[#eedfd6] bg-[radial-gradient(circle_at_top,_#fff7f2,_#fffdfa_62%)] p-5">
          <div className="flex flex-col items-center text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Shared pot</p>
            <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">{circle.pot.item}</h3>
            <p className="mt-2 max-w-[28ch] text-[13px] leading-6 text-slate-500">{circle.pot.source}</p>
            <div className="mt-5"><ContributionRing raised={circle.pot.raised} target={circle.pot.target} ringId={`circle-gradient-${circle.id}`} /></div>
            <p className="mt-3 text-sm text-slate-500">{raisedLabel} of {moneyLabel}</p>
            <div className="mt-4 flex -space-x-3">{circle.members.map((member) => <div key={`${circle.id}-${member.name}-avatar`} className={`flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-gradient-to-b text-[11px] font-bold text-white shadow-sm ${member.colors}`} title={member.name}>{member.initials}</div>)}</div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2"><span className="rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-semibold text-[#df7b59]">{circle.pot.fundingMode}</span><span className="rounded-full bg-[#f3f6fb] px-3 py-1 text-[11px] font-semibold text-slate-600">Deadline {formatDateLabel(circle.pot.deadline)}</span><span className="rounded-full bg-[#edf3ff] px-3 py-1 text-[11px] font-semibold text-slate-600">{circle.pot.currency}</span></div>
            <div className="mt-5 w-full text-left"><PotPreviewCard image={circle.pot.previewImage} title={circle.pot.item} description={circle.pot.previewDescription} url={circle.pot.sourceUrl} sourceLabel={circle.pot.source} compact /></div>
            <p className="mt-4 text-[14px] leading-7 text-slate-600">{circle.pot.note}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => onEditPot(circle)} className="inline-flex h-10 items-center justify-center rounded-full bg-[#2f3b2d] px-4 text-sm font-semibold text-white">Edit pot</button></div>
          </div>
        </div>
      </div>
    </article>
  );
}

function CreatePotModal({ open, onClose, onSubmit, contacts, selectedPeople, setSelectedPeople, form, setForm }) {
  const amountLabel = useMemo(() => formatMoney(parseAmount(form.goalValue), form.currency || "GBP"), [form.goalValue, form.currency]);
  if (!open) return null;
  const visibleHints = publicHintsByContact.demo;
  return (
    <ModalShell open={open} onClose={onClose} eyebrow="New circle" title="Create a circle around an event">
      <div className="grid gap-0 lg:grid-cols-[1.06fr_0.94fr]">
        <div className="max-h-[calc(92vh-90px)] space-y-6 overflow-y-auto p-6">
          <div className="rounded-[24px] border border-[#eedfd6] bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">1. Choose the event</p>
            <div className="mt-4 space-y-3">{calendarEvents.map((event) => <label key={event.id} className="flex cursor-pointer items-center justify-between rounded-[20px] border border-[#efe1d9] bg-[#fffdfa] p-4"><div><p className="text-sm font-semibold text-slate-900">{event.title}</p><p className="mt-1 text-[13px] text-slate-500">{event.type} · {event.date}</p></div><input type="radio" name="calendarEvent" className="h-4 w-4 accent-[#f36f64]" checked={String(event.id) === String(form.selectedEventId)} onChange={() => setForm((prev) => ({ ...prev, selectedEventId: String(event.id), eventTitle: event.title, eventDate: event.date, deadline: event.date }))} /></label>)}</div>
          </div>
          <div className="rounded-[24px] border border-[#eedfd6] bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">2. Pot details</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="space-y-2 sm:col-span-2"><span className="text-sm font-medium text-slate-700">Circle title</span><input type="text" value={form.eventTitle} onChange={(e) => setForm((prev) => ({ ...prev, eventTitle: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]" placeholder="Sarah's birthday gift" /></label><label className="space-y-2"><span className="text-sm font-medium text-slate-700">Contribution deadline</span><input type="date" value={form.deadline} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]" /></label><label className="space-y-2"><span className="text-sm font-medium text-slate-700">If people do not join</span><select value={form.fundingMode} onChange={(e) => setForm((prev) => ({ ...prev, fundingMode: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"><option value="Flexible pot">Flexible pot</option><option value="All-or-nothing">All-or-nothing</option><option value="Organizer covers gap">Organizer covers gap</option></select></label></div>
          </div>
          <div className="rounded-[24px] border border-[#eedfd6] bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">3. The item</p>
            <div className="mt-4 space-y-4">{visibleHints.map((hint) => <button key={hint.id} type="button" onClick={() => setForm((prev) => ({ ...prev, selectedHintId: hint.id, item: hint.title, goalValue: String(hint.amount), currency: hint.currency, source: "From Sarah’s public hints", sourceUrl: hint.url, previewImage: hint.image, previewDescription: hint.description }))} className={`w-full rounded-[20px] border p-4 text-left ${form.selectedHintId === hint.id ? "border-[#f0a384] bg-[#fff4ee]" : "border-[#efe1d9] bg-[#fffdfa]"}`}><p className="text-sm font-semibold text-slate-900">{hint.title}</p><p className="mt-1 text-[13px] text-slate-500">{hint.subtitle}</p></button>)}<label className="space-y-2"><span className="text-sm font-medium text-slate-700">Or paste a product link</span><input type="url" value={form.itemUrl} onChange={(e) => setForm((prev) => ({ ...prev, itemUrl: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]" placeholder="https://..." /></label></div>
          </div>
          <div className="rounded-[24px] border border-[#eedfd6] bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">4. Amounts</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium text-slate-700">Currency</span><select value={form.currency} onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]">{currencyOptions.map((option) => <option key={option.code} value={option.code}>{option.code} · {option.label}</option>)}</select></label><label className="space-y-2"><span className="text-sm font-medium text-slate-700">Target amount</span><input type="text" inputMode="decimal" value={form.goalValue} onChange={(e) => setForm((prev) => ({ ...prev, goalValue: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]" placeholder="220" /></label></div>
          </div>
        </div>
        <div className="max-h-[calc(92vh-90px)] overflow-y-auto border-t border-[#efe0d7] bg-[#fff7f2] p-6 lg:border-l lg:border-t-0">
          <div className="rounded-[24px] border border-dashed border-[#e6d7cd] bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">5. Invite people</p>
            <p className="mt-1 text-[13px] leading-6 text-slate-500">Add people now. They will start as invited, and reminders can be added later when payments go live.</p>
            <div className="mt-4 min-h-[120px] rounded-[20px] bg-[#fffaf7] p-4">{selectedPeople.length ? <div className="flex flex-wrap gap-3">{selectedPeople.map((person) => <div key={person.id} className="inline-flex items-center gap-2 rounded-full border border-[#ead8ce] bg-white px-3 py-2"><div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b text-[11px] font-bold text-white ${person.colors}`}>{person.initials}</div><span className="text-sm font-medium text-slate-700">{person.name}</span><button type="button" onClick={() => setSelectedPeople((prev) => prev.filter((item) => item.id !== person.id))} className="text-slate-400 hover:text-slate-600" aria-label={`Remove ${person.name}`}>✕</button></div>)}</div> : <p className="text-sm text-slate-400">No one added yet.</p>}</div>
            <div className="mt-5 space-y-3">{contacts.length ? contacts.map((contact) => { const alreadyAdded = selectedPeople.some((person) => person.id === contact.id); return <div key={contact.id} className="flex items-center justify-between rounded-[18px] border border-[#f0dfd6] bg-[#fffdfa] p-3"><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b text-[11px] font-bold text-white ${contact.colors}`}>{contact.initials}</div><div><p className="text-sm font-semibold text-slate-900">{contact.name}</p><p className="text-[12px] text-slate-500">{contact.role || "Contact"}</p></div></div><button type="button" disabled={alreadyAdded} onClick={() => setSelectedPeople((prev) => [...prev, contact])} className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[12px] font-semibold ${alreadyAdded ? "bg-[#f4efe9] text-slate-400" : "border border-[#ead8ce] bg-white text-slate-700 hover:bg-[#fff5f0]"}`}>{alreadyAdded ? "Added" : "Add"}</button></div>; }) : <p className="text-sm text-slate-400">No contacts available yet.</p>}</div>
            <div className="mt-5 rounded-[20px] bg-[#fffaf7] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Preview</p><p className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-slate-900">{amountLabel}</p>{form.item ? <div className="mt-4"><PotPreviewCard image={form.previewImage} title={form.item} description={form.previewDescription} url={form.sourceUrl || form.itemUrl} sourceLabel={form.source || "Chosen item"} compact /></div> : null}</div>
            <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]">Cancel</button><button type="button" onClick={onSubmit} className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg">Create pot</button></div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function EditPotModal({ open, onClose, onSave, form, setForm }) {
  if (!open) return null;
  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Edit pot" title="Update demo pot" maxWidth="max-w-[760px]">
      <div className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 sm:col-span-2"><span className="text-sm font-medium text-slate-700">Item name</span><input type="text" value={form.item} onChange={(e) => setForm((prev) => ({ ...prev, item: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]" /></label><label className="space-y-2"><span className="text-sm font-medium text-slate-700">Raised</span><input type="text" value={form.raised} onChange={(e) => setForm((prev) => ({ ...prev, raised: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]" /></label><label className="space-y-2"><span className="text-sm font-medium text-slate-700">Target</span><input type="text" value={form.target} onChange={(e) => setForm((prev) => ({ ...prev, target: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]" /></label><label className="space-y-2"><span className="text-sm font-medium text-slate-700">Funding mode</span><select value={form.fundingMode} onChange={(e) => setForm((prev) => ({ ...prev, fundingMode: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"><option value="Flexible pot">Flexible pot</option><option value="All-or-nothing">All-or-nothing</option><option value="Organizer covers gap">Organizer covers gap</option></select></label><label className="space-y-2"><span className="text-sm font-medium text-slate-700">Deadline</span><input type="date" value={form.deadline} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} className="h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]" /></label></div>
        <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]">Cancel</button><button type="button" onClick={onSave} className="inline-flex h-11 items-center justify-center rounded-full bg-[#2f3b2d] px-5 text-sm font-semibold text-white">Save changes</button></div>
      </div>
    </ModalShell>
  );
}

export default function CirclesClient() {
  const [session, setSession] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [circles, setCircles] = useState([demoCircle]);
  const [loading, setLoading] = useState(true);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isCreateCircleOpen, setIsCreateCircleOpen] = useState(false);
  const [isEditPotOpen, setIsEditPotOpen] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [editingCircleId, setEditingCircleId] = useState("demo-circle");
  const [savingContact, setSavingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", relationshipTypes: [] });
  const [circleForm, setCircleForm] = useState({ selectedEventId: "1", eventTitle: "Sarah's Birthday", eventDate: "2026-06-29", deadline: "2026-06-29", fundingMode: "Flexible pot", goalValue: "220", currency: "GBP", selectedHintId: "sarah-1", item: "Weekend cabin stay", source: "From Sarah’s public hints", sourceUrl: "https://example.com/weekend-cabin-stay", previewImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", previewDescription: "A memorable shared experience with a clear target that works naturally as a circle goal.", itemUrl: "" });
  const [editPotForm, setEditPotForm] = useState({ item: demoCircle.pot.item, raised: String(demoCircle.pot.raised), target: String(demoCircle.pot.target), fundingMode: demoCircle.pot.fundingMode, deadline: demoCircle.pot.deadline });

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session || null);
        setLoading(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession || null));
    return () => {
      active = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSaveContact = () => {
    const trimmedName = contactForm.name.trim() || contactForm.email.trim().split("@")[0];
    const trimmedEmail = contactForm.email.trim();
    if (!trimmedName && !trimmedEmail) return;
    setSavingContact(true);
    const role = contactForm.relationshipTypes[0] || "Friend";
    const newContact = { id: `contact-${Date.now()}`, name: trimmedName || trimmedEmail, role, initials: getInitials(trimmedName || trimmedEmail), colors: getContactGradient(role), email: trimmedEmail };
    setContacts((prev) => [newContact, ...prev]);
    setContactForm({ name: "", email: "", relationshipTypes: [] });
    setSavingContact(false);
    setIsAddContactOpen(false);
  };

  const handleCreateCircle = () => {
    const target = parseAmount(circleForm.goalValue);
    const newCircle = {
      id: `circle-${Date.now()}`,
      name: circleForm.eventTitle,
      subtitle: `Event · ${formatDateLabel(circleForm.eventDate)}`,
      description: "A newly created circle with one shared goal so the organiser can invite everyone into the same pot.",
      members: selectedPeople.map((person) => ({ name: person.name, initials: person.initials, contributed: false, amount: 0, colors: person.colors, status: "invited" })),
      pot: { active: true, item: circleForm.item || "Shared contribution pot", source: circleForm.source || "Chosen item", sourceUrl: circleForm.sourceUrl || circleForm.itemUrl, previewImage: circleForm.previewImage, previewDescription: circleForm.previewDescription, target, currency: circleForm.currency, raised: 0, note: "This pot was created from the old circles flow.", fundingMode: circleForm.fundingMode, deadline: circleForm.deadline, goalType: "item" },
    };
    setCircles((prev) => [newCircle, ...prev]);
    setSelectedPeople([]);
    setIsCreateCircleOpen(false);
  };

  const openEditPot = (circle) => {
    setEditingCircleId(circle.id);
    setEditPotForm({ item: circle.pot.item, raised: String(circle.pot.raised), target: String(circle.pot.target), fundingMode: circle.pot.fundingMode, deadline: circle.pot.deadline });
    setIsEditPotOpen(true);
  };

  const handleSavePot = () => {
    setCircles((prev) => prev.map((circle) => circle.id !== editingCircleId ? circle : { ...circle, pot: { ...circle.pot, item: editPotForm.item, raised: parseAmount(editPotForm.raised), target: parseAmount(editPotForm.target), fundingMode: editPotForm.fundingMode, deadline: editPotForm.deadline } }));
    setIsEditPotOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f3ef] text-slate-900">
      <header className="border-b border-[#eaded7] bg-[#fcf8f5]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 text-slate-900 no-underline">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-white shadow-lg"><span className="text-lg">🎁</span></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#df7b59]">Hinted</p><p className="text-base font-semibold tracking-[-0.04em] text-slate-900">Circles</p></div>
            </Link>
            <nav className="hidden items-center gap-5 md:flex"><Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">Dashboard</Link><Link href="/hints" className="text-sm text-slate-500 hover:text-slate-900">Hints</Link><Link href="/circles" className="text-sm font-semibold text-slate-900">Circles</Link></nav>
          </div>
          <AvatarMenu session={session} />
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[30px] border border-[#f0dfd6] bg-[radial-gradient(circle_at_top_left,_#fff7f2,_#fffdfa_68%)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-[760px]"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#df7b59]">Circles</p><h1 className="mt-2 text-[34px] font-semibold tracking-[-0.06em] text-slate-900 sm:text-[46px]">Shared gifting, one calm pot at a time.</h1><p className="mt-4 max-w-[58ch] text-[15px] leading-7 text-slate-600">Start with one clear example, keep the original circles flow for creating pots, and add contacts only when you actually need them.</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setIsCreateCircleOpen(true)} className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg">Create pot</button><button type="button" onClick={() => setIsAddContactOpen(true)} className="inline-flex h-12 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-6 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]">Add contact</button></div></div>
        </section>
        <div className="mt-8 grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]"><div className="space-y-8"><ContactPanel contacts={contacts} onAddContact={() => setIsAddContactOpen(true)} /><PotTypeGuide /></div><div className="space-y-6">{circles.map((circle) => <CircleCard key={circle.id} circle={circle} onEditPot={openEditPot} />)}</div></div>
      </main>
      <AddContactModal open={isAddContactOpen} onClose={() => setIsAddContactOpen(false)} onSave={handleSaveContact} form={contactForm} setForm={setContactForm} isSaving={savingContact} />
      <CreatePotModal open={isCreateCircleOpen} onClose={() => setIsCreateCircleOpen(false)} onSubmit={handleCreateCircle} contacts={contacts} selectedPeople={selectedPeople} setSelectedPeople={setSelectedPeople} form={circleForm} setForm={setCircleForm} />
      <EditPotModal open={isEditPotOpen} onClose={() => setIsEditPotOpen(false)} onSave={handleSavePot} form={editPotForm} setForm={setEditPotForm} />
    </div>
  );
}
