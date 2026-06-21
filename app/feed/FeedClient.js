"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import AvatarMenu from "../components/AvatarMenu";

const demoMode = true;
const hasContactsDemoFallback = false;

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
  { key: "reminder", label: "Reminders" },
  { key: "hint", label: "Hints" },
  { key: "circle", label: "Circles" },
  { key: "celebration", label: "Celebrations" },
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
    id: 1,
    name: "Maya",
    role: "Friend",
    note: "Saved 8 hints",
    initials: "M",
    colors: "from-[#efc3af] to-[#ae6e57]",
    email: "",
    phone: "",
    birthday: "",
  },
  {
    id: 2,
    name: "James",
    role: "Brother",
    note: "Saved 5 hints",
    initials: "J",
    colors: "from-[#4e596d] to-[#212a3c]",
    email: "",
    phone: "",
    birthday: "",
  },
  {
    id: 3,
    name: "Fiona",
    role: "Friend",
    note: "Saved 4 hints",
    initials: "F",
    colors: "from-[#809168] to-[#41512e]",
    email: "",
    phone: "",
    birthday: "",
  },
];

const feedItems = [
  {
    id: 1,
    type: "reminder",
    avatar: "S",
    avatarColors: "from-[#efcdbf] to-[#c88c73]",
    name: "Sarah",
    action: "has a birthday coming up in 2 weeks",
    detail: "June 29 · She saved a ceramics workshop and linen bedding.",
    time: "Just now",
    icon: "🎂",
    badge: "Reminder",
    comments: [
      { id: 1, name: "You", text: "Need to sort this early this time." },
      { id: 2, name: "Maya", text: "I can help with ideas if you want to split something." },
    ],
    reactions: ["🎉", "❤️", "👏"],
  },
  {
    id: 2,
    type: "hint",
    avatar: "M",
    avatarColors: "from-[#e7cab8] to-[#b97d66]",
    name: "Mum",
    action: "saved a new hint",
    detail: "Silk pillowcase set · From John Lewis · Around £45.",
    time: "12m ago",
    icon: "🎁",
    badge: "Hint",
    comments: [{ id: 1, name: "You", text: "This is actually a very solid option." }],
    reactions: ["✨", "😍", "👏"],
  },
  {
    id: 3,
    type: "circle",
    avatar: "MF",
    avatarColors: "from-[#98a47d] to-[#5f7046]",
    name: "Max & Fiona",
    action: "have a wedding circle that is nearly funded",
    detail: "£320 of £400 raised · 4 contributors · 80% full.",
    time: "1h ago",
    icon: "💍",
    badge: "Circle",
    comments: [{ id: 1, name: "James", text: "Nearly there — I’ll add the last bit tonight." }],
    reactions: ["🥂", "💚", "🎉"],
  },
  {
    id: 4,
    type: "celebration",
    avatar: "J",
    avatarColors: "from-[#dcc4b5] to-[#b78972]",
    name: "James",
    action: "reacted to a shared hint in your circle",
    detail: "Weekend cabin stay · Marked as a top pick.",
    time: "3h ago",
    icon: "⭐",
    badge: "Celebration",
    comments: [],
    reactions: ["🔥", "🙌", "💛"],
  },
];

const reminders = [
  {
    title: "Sarah's Birthday",
    date: "June 29",
    subtitle: "2 weeks away",
    colors: "from-[#efc3af] to-[#ae6e57]",
  },
  {
    title: "Mum & Dad Anniversary",
    date: "July 10",
    subtitle: "Plan gift ideas",
    colors: "from-[#eac8b8] to-[#9d6957]",
  },
  {
    title: "James Promotion",
    date: "July 16",
    subtitle: "Congratulate him",
    colors: "from-[#809168] to-[#41512e]",
  },
];

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

function getPrimaryContactField(person, field) {
  const items = person?.[field];
  if (!Array.isArray(items) || items.length === 0) return "";
  return items[0]?.value || items[0]?.displayName || "";
}

function getGoogleName(metadata = {}) {
  return (
    metadata.full_name ||
    metadata.name ||
    [metadata.given_name, metadata.family_name].filter(Boolean).join(" ") ||
    ""
  ).trim();
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
    type: "contact",
    profileConnectionId: row.id,
    name: safeName,
    role: relationship,
    note: "Saved to contacts",
    initials: getInitials(safeName),
    colors: getRelationshipGradient(relationship),
    email: row?.email || "",
    phone: "",
    birthday: "",
    raw: row,
  };
}

function LogoMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-white shadow-lg">
      <span className="text-lg">🎁</span>
    </div>
  );
}

function ModalShell({ open, onClose, title, eyebrow, children, maxWidth = "max-w-[720px]", hideHeaderBorder = false }) {
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

function AddContactModal({ open, onClose, onSave, supabase }) {
  const [contactSearch, setContactSearch] = useState("");
  const [contactResults, setContactResults] = useState([]);
  const [searchingContacts, setSearchingContacts] = useState(false);
  const [contactsMessage, setContactsMessage] = useState("");
  const [selectedRelationships, setSelectedRelationships] = useState(["Friend"]);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!open) {
      setContactSearch("");
      setContactResults([]);
      setSearchingContacts(false);
      setContactsMessage("");
      setSelectedRelationships(["Friend"]);
      setForm({ name: "", email: "" });
      setSaving(false);
      setSaveError("");
    }
  }, [open]);

  async function searchGoogleContacts(query) {
    setContactSearch(query);
    setContactsMessage("");
    setSaveError("");

    if (!query.trim()) {
      setContactResults([]);
      return;
    }

    setSearchingContacts(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const providerToken = session?.provider_token;

      if (!providerToken) {
        setContactResults([]);
        setContactsMessage(
          "We couldn’t access your linked Google contacts right now because the Google provider token is missing."
        );
        return;
      }

      const warmupResponse = await fetch(
        "https://people.googleapis.com/v1/people:searchContacts?query=&pageSize=1&readMask=names,emailAddresses",
        {
          headers: {
            Authorization: `Bearer ${providerToken}`,
          },
        }
      );

      if (!warmupResponse.ok) {
        setContactResults([]);
        setContactsMessage("We couldn’t access your linked Google contacts right now.");
        return;
      }

      const url = new URL("https://people.googleapis.com/v1/people:searchContacts");
      url.searchParams.set("query", query);
      url.searchParams.set("pageSize", "8");
      url.searchParams.set("readMask", "names,emailAddresses");

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        setContactResults([]);
        setContactsMessage(result?.error?.message || "We couldn’t search Google contacts right now.");
        return;
      }

      const people = Array.isArray(result.results) ? result.results : [];
      const mapped = people
        .map((item) => item.person)
        .filter(Boolean)
        .map((person, index) => ({
          id: person.resourceName || String(index),
          name: getPrimaryContactField(person, "names"),
          email: getPrimaryContactField(person, "emailAddresses"),
        }))
        .filter((person) => person.name || person.email);

      setContactResults(mapped);

      if (mapped.length === 0) {
        setContactsMessage("No matching Google contacts found. You can still type their email manually.");
      }
    } catch (error) {
      setContactResults([]);
      setContactsMessage(error?.message || "We couldn’t search Google contacts right now.");
    } finally {
      setSearchingContacts(false);
    }
  }

  function selectContact(contact) {
    setForm({
      name: contact.name || "",
      email: contact.email || "",
    });
    setContactSearch(contact.name || contact.email || "");
    setContactResults([]);
    setContactsMessage("");
    setSaveError("");
  }

  function toggleRelationship(relationship) {
    setSelectedRelationships((prev) => {
      if (prev.includes(relationship)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== relationship);
      }
      return [...prev, relationship];
    });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setSaveError("Contact name is required.");
      return;
    }

    const cleanedEmail = form.email.trim().toLowerCase();

    if (!cleanedEmail) {
      setSaveError("Email is required.");
      return;
    }

    if (!isValidEmail(cleanedEmail)) {
      setSaveError("Enter a valid email address.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      await onSave({
        name: form.name.trim(),
        email: cleanedEmail,
        relationshipTypes: selectedRelationships.length ? selectedRelationships : ["Friend"],
      });
      setSaving(false);
      onClose();
    } catch (error) {
      setSaveError(error?.message || "Failed to save contact.");
      setSaving(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      eyebrow="Contact"
      title="Add a contact"
      maxWidth="max-w-[760px]"
      hideHeaderBorder
    >
      <div className="border-t border-[#efe0d7] px-6 py-6">
        <div className="rounded-[28px] border border-dashed border-[#e5d8cf] bg-[#fffdfa] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Bring someone in quickly
          </p>
          <h3 className="mt-3 text-[18px] font-semibold tracking-[-0.03em] text-slate-900">
            Add from Gmail or type their email
          </h3>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-8 text-slate-500">
            Use the onboarding-style flow here to browse contacts from your linked Google account, or add someone manually now so they are ready for hints and circles.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={contactSearch}
              onChange={(e) => searchGoogleContacts(e.target.value)}
              placeholder="Search Gmail contacts"
              className="h-[46px] w-full rounded-full border border-[#ead8ce] bg-white px-5 text-sm text-slate-700 outline-none transition focus:border-[#f19b7e]"
            />
          </div>

          {searchingContacts ? (
            <p className="mt-3 text-xs text-slate-500">Searching contacts...</p>
          ) : null}

          {contactResults.length > 0 ? (
            <div className="mt-3 overflow-hidden rounded-[20px] border border-[#efe1d9] bg-white">
              {contactResults.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => selectContact(contact)}
                  className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{contact.name || "No name"}</p>
                    <p className="text-xs text-slate-500">{contact.email || "No email"}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#ea7451]">Use</span>
                </button>
              ))}
            </div>
          ) : null}

          {contactsMessage ? (
            <p className="mt-3 text-xs text-slate-500">{contactsMessage}</p>
          ) : null}
        </div>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="block text-sm font-medium text-slate-900">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Maya"
              className="mt-2 h-[48px] w-full rounded-[18px] border border-[#d9dce3] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#f19b7e]"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-900">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="maya@example.com"
              required
              className="mt-2 h-[48px] w-full rounded-[18px] border border-[#d9dce3] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#f19b7e]"
            />
          </label>

          <div>
            <span className="block text-sm font-medium text-slate-900">Relationship</span>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {relationshipOptions.map((relationship) => {
                const selected = selectedRelationships.includes(relationship);

                return (
                  <button
                    key={relationship}
                    type="button"
                    onClick={() => toggleRelationship(relationship)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                      selected
                        ? "border-[#2f3b2d] bg-[#2f3b2d] text-white"
                        : "border-[#d9dce3] bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {relationship}
                  </button>
                );
              })}
            </div>
          </div>

          {saveError ? (
            <div className="rounded-[18px] border border-[#efc0ba] bg-[#fff4f2] px-4 py-3 text-sm text-[#b14f43]">
              {saveError}
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[44px] items-center justify-center rounded-full border border-[#ead8ce] bg-white px-6 text-sm font-medium text-slate-700 hover:bg-[#fff5f0]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.email.trim()}
            className={`inline-flex h-[44px] items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-lg ${
              saving || !form.name.trim() || !form.email.trim()
                ? "cursor-not-allowed bg-[#e9a48d]"
                : "bg-gradient-to-b from-[#ff946d] to-[#f36f64]"
            }`}
          >
            {saving ? "Saving..." : "Save contact"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function DeleteContactModal({
  open,
  onClose,
  onConfirm,
  contact,
  isDeleting,
  errorMessage,
}) {
  const [typedName, setTypedName] = useState("");

  useEffect(() => {
    if (!open) {
      setTypedName("");
    }
  }, [open]);

  if (!open || !contact) return null;

  const expectedName = String(contact.name || "").trim();
  const matches = typedName.trim() === expectedName;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      eyebrow="Delete contact"
      title={`Delete ${contact.name}`}
      maxWidth="max-w-[620px]"
    >
      <div className="space-y-5 p-6">
        <div className="rounded-[22px] border border-[#efc0ba] bg-[#fff4f2] p-4">
          <p className="text-sm font-semibold text-[#b14f43]">This will permanently remove the contact.</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-600">
            Type <span className="font-semibold text-slate-900">{expectedName}</span> to confirm.
          </p>
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-slate-900">Type the contact name</span>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder={expectedName}
            className="mt-2 h-12 w-full rounded-[18px] border border-[#ead8ce] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19b7e]"
          />
        </label>

        {errorMessage ? (
          <div className="rounded-[18px] border border-[#efc0ba] bg-[#fff4f2] px-4 py-3 text-sm text-[#b14f43]">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-[#fff5f0]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting || !matches}
            onClick={() => onConfirm(contact)}
            className={`inline-flex h-12 flex-1 items-center justify-center rounded-full px-6 text-sm font-semibold text-white ${
              isDeleting || !matches
                ? "cursor-not-allowed bg-[#e9a48d]"
                : "bg-[#b14f43]"
            }`}
          >
            {isDeleting ? "Deleting..." : "Delete contact"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ContactCard({ contact, onDeleteClick }) {
  return (
    <article
      className="rounded-[22px] border border-[#f0dfd6] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      aria-label={`Manage ${contact.name}`}
    >
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

function FeedItem({ item }) {
  const typeStyles =
    item.type === "reminder"
      ? {
          chip: "bg-[#fff3ee] text-[#e07c54]",
          border: "border-[#f6ddd2]",
        }
      : item.type === "circle"
        ? {
            chip: "bg-[#edf6eb] text-[#4a7a3a]",
            border: "border-[#deebda]",
          }
        : item.type === "celebration"
          ? {
              chip: "bg-[#fff7e8] text-[#af7b14]",
              border: "border-[#f3e3b8]",
            }
          : {
              chip: "bg-[#f5f3ff] text-[#7c5cbf]",
              border: "border-[#e5defa]",
            };

  const actionLabel =
    item.type === "reminder"
      ? "Start a circle"
      : item.type === "hint"
        ? "View hint"
        : item.type === "circle"
          ? "Open circle"
          : "View activity";

  return (
    <article className={`rounded-[28px] border bg-white p-5 shadow-sm ${typeStyles.border}`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b text-[12px] font-bold text-white ${item.avatarColors}`}
        >
          {item.avatar}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${typeStyles.chip}`}>
                  {item.icon} {item.badge}
                </span>
                {demoMode && (
                  <span className="rounded-full border border-[#eadfd7] bg-[#fffaf7] px-2.5 py-1 text-[11px] font-medium text-slate-500">
                    Demo data
                  </span>
                )}
              </div>

              <p className="mt-3 text-[15px] leading-7 text-slate-700">
                <span className="font-semibold text-slate-900">{item.name}</span> {item.action}
              </p>
              <p className="mt-1 text-[14px] leading-6 text-slate-500">{item.detail}</p>
            </div>

            <span className="shrink-0 text-[12px] text-slate-400">{item.time}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {item.reactions.map((reaction) => (
              <button
                key={reaction}
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#ebdfd8] bg-[#fffaf7] px-3 text-sm text-slate-700 hover:bg-[#fff2eb]"
                aria-label={`React with ${reaction}`}
              >
                {reaction}
              </button>
            ))}

            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#ebdfd8] bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Comment
            </button>

            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#ebdfd8] bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {actionLabel}
            </button>
          </div>

          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            {item.comments.map((comment) => (
              <div key={comment.id} className="rounded-[18px] bg-[#faf7f4] px-4 py-3">
                <p className="text-[13px] leading-6 text-slate-600">
                  <span className="font-semibold text-slate-900">{comment.name}</span> {comment.text}
                </p>
              </div>
            ))}

            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#efcdbf] to-[#bb8168] text-[11px] font-bold text-white">
                Y
              </div>
              <input
                type="text"
                placeholder="Write a comment..."
                className="h-11 w-full rounded-full border border-[#e9ddd6] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19a78]/60 focus:ring-4 focus:ring-[#f19a78]/10"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
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

function CalendarPopover({
  selectedDate,
  events,
  onClose,
  onAddEvent,
  draft,
  setDraft,
  isSaving,
}) {
  if (!selectedDate) return null;

  const prettyDate = selectedDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mt-4 rounded-[24px] border border-[#efdcd2] bg-[#fffaf7] p-4 shadow-[0_18px_45px_rgba(123,84,64,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Selected day
          </p>
          <h3 className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-slate-900">
            {prettyDate}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eaded6] bg-white text-slate-500 hover:bg-slate-50"
          aria-label="Close calendar event panel"
        >
          ×
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {events.length > 0 ? (
          events.map((event) => {
            const style = eventTypeStyles[event.type] || eventTypeStyles.celebration;

            return (
              <div key={event.id} className="rounded-[18px] border border-[#eee1da] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.pill}`}>
                        {style.label}
                      </span>
                      {event.source === "system" ? (
                        <span className="rounded-full border border-[#eadfd7] bg-[#fffaf7] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
                          Seasonal
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{event.title}</p>
                    {event.time ? <p className="mt-1 text-xs text-slate-500">{event.time}</p> : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[18px] bg-white p-4 text-sm text-slate-500">
            No events yet for this day.
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[20px] border border-[#efe2db] bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Create new event</p>

        <div className="mt-3 space-y-3">
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Event title"
            className="h-11 w-full rounded-[16px] border border-[#eaded6] bg-white px-4 text-sm outline-none focus:border-[#f19a78]/60 focus:ring-4 focus:ring-[#f19a78]/10"
          />

          <select
            value={draft.type}
            onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value }))}
            className="h-11 w-full rounded-[16px] border border-[#eaded6] bg-white px-4 text-sm outline-none focus:border-[#f19a78]/60 focus:ring-4 focus:ring-[#f19a78]/10"
          >
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="celebration">Celebration</option>
            <option value="christmas">Christmas</option>
          </select>

          <button
            type="button"
            onClick={onAddEvent}
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] px-5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save event"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniCalendar() {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [openPopover, setOpenPopover] = useState(true);
  const [eventsByDate, setEventsByDate] = useState({});
  const [draft, setDraft] = useState({
    title: "",
    type: "birthday",
  });
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarSaving, setCalendarSaving] = useState(false);
  const [calendarError, setCalendarError] = useState("");

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth]
  );

  const days = useMemo(() => getMonthData(currentMonth), [currentMonth]);

  const toKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayKey = toKey(today);

  const groupEventsByDate = (rows) => {
    return rows.reduce((acc, row) => {
      const key = row.event_date;
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        id: row.id,
        title: row.title,
        type: row.type,
        time: row.event_time || null,
        source: row.source || "user",
      });
      return acc;
    }, {});
  };

  const loadEvents = async () => {
    setCalendarLoading(true);
    setCalendarError("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setCalendarError("You need to be signed in to view calendar events.");
      setEventsByDate({});
      setCalendarLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("calendar_events")
      .select("id, user_id, title, event_date, event_time, type, source, slug, is_recurring, created_at")
      .or(`source.eq.system,user_id.eq.${user.id}`)
      .order("event_date", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setCalendarError(error.message || "Could not load calendar events.");
      setEventsByDate({});
      setCalendarLoading(false);
      return;
    }

    setEventsByDate(groupEventsByDate(data || []));
    setCalendarLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const selectedKey = selectedDate ? toKey(selectedDate) : null;
  const selectedEvents = selectedKey ? eventsByDate[selectedKey] || [] : [];

  const goMonth = (direction) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    setOpenPopover(false);
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setOpenPopover(true);
  };

  const handleAddEvent = async () => {
    if (!selectedKey || !draft.title.trim()) return;

    setCalendarSaving(true);
    setCalendarError("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setCalendarError("You need to be signed in to save calendar events.");
      setCalendarSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      title: draft.title.trim(),
      event_date: selectedKey,
      event_time: null,
      type: draft.type,
      source: "user",
      slug: null,
      is_recurring: false,
    };

    const { data, error } = await supabase
      .from("calendar_events")
      .insert(payload)
      .select()
      .single();

    if (error) {
      setCalendarError(error.message || "Could not save event.");
      setCalendarSaving(false);
      return;
    }

    const savedEvent = {
      id: data.id,
      title: data.title,
      type: data.type,
      time: data.event_time || null,
      source: data.source || "user",
    };

    setEventsByDate((prev) => ({
      ...prev,
      [selectedKey]: [...(prev[selectedKey] || []), savedEvent],
    }));

    setDraft({
      title: "",
      type: "birthday",
    });

    setCalendarSaving(false);
  };

  return (
    <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Planner
          </p>
          <h2
            className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900"
            aria-live="polite"
          >
            {monthLabel}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
              setSelectedDate(now);
              setOpenPopover(true);
            }}
            className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => goMonth(-1)}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => goMonth(1)}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            →
          </button>
        </div>
      </div>

      {calendarError ? (
        <div className="mt-4 rounded-[18px] border border-[#f3d7cc] bg-[#fff4ef] px-4 py-3 text-sm text-[#c46545]">
          {calendarError}
        </div>
      ) : null}

      {calendarLoading ? (
        <div className="mt-4 rounded-[18px] bg-[#faf7f4] px-4 py-3 text-sm text-slate-500">
          Loading calendar...
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((item) => {
          const key = toKey(item.date);
          const selected = key === selectedKey;
          const isToday = key === todayKey;
          const dayEvents = eventsByDate[key] || [];
          const leadType = dayEvents[0]?.type;
          const dotClass = leadType ? (eventTypeStyles[leadType] || eventTypeStyles.celebration).dot : null;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleDayClick(item.date)}
              aria-label={item.date.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              aria-pressed={selected}
              className={`min-h-[58px] rounded-[16px] border p-2 text-left transition ${
                selected
                  ? "border-[#f2b39a] bg-[#fff2ea] shadow-[inset_0_0_0_1px_rgba(242,179,154,0.35)]"
                  : isToday
                    ? "border-[#f3c8b7] bg-[#fff8f4]"
                    : "border-slate-100 bg-[#fffdfa] hover:border-[#efc8b6] hover:bg-[#fff7f2]"
              }`}
            >
              <div
                className={`text-[13px] font-semibold ${
                  selected
                    ? "text-[#d96d4f]"
                    : isToday
                      ? "text-slate-900"
                      : item.currentMonth
                        ? "text-slate-700"
                        : "text-slate-300"
                }`}
              >
                {item.day}
              </div>

              {dayEvents.length > 0 ? (
                <div className="mt-1.5 flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                  {dayEvents.length > 1 ? (
                    <span className="text-[10px] text-slate-400">+{dayEvents.length - 1}</span>
                  ) : null}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {openPopover ? (
        <CalendarPopover
          selectedDate={selectedDate}
          events={selectedEvents}
          onClose={() => setOpenPopover(false)}
          onAddEvent={handleAddEvent}
          draft={draft}
          setDraft={setDraft}
          isSaving={calendarSaving}
        />
      ) : null}
    </section>
  );
}

export default function FeedClient() {
  const supabase = createClient();

  const [activeFilter, setActiveFilter] = useState("all");
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [pageError, setPageError] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isDeleteContactOpen, setIsDeleteContactOpen] = useState(false);
  const [selectedContactToDelete, setSelectedContactToDelete] = useState(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);
  const [deleteContactError, setDeleteContactError] = useState("");

  const [pendingInvites, setPendingInvites] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [invitesError, setInvitesError] = useState("");
  const [activeInvite, setActiveInvite] = useState(null);
  const [inviteActionId, setInviteActionId] = useState(null);

  const loadProfile = useCallback(
    async (userId) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw new Error(normalizeSupabaseError(error, "Failed to load profile."));
      }

      setProfile(data || null);
      return data || null;
    },
    [supabase]
  );

  const loadContacts = useCallback(
    async (userId) => {
      setIsLoadingContacts(true);
      setContactError("");

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

  async function loadPendingInvites() {
    setInvitesLoading(true);
    setInvitesError("");

    const { data, error } = await supabase
      .from("circle_invites")
      .select(`
        id,
        circle_id,
        invite_name,
        invite_email,
        status,
        created_at,
        invited_user_id
      `)
      .in("status", ["pending", "viewed"])
      .order("created_at", { ascending: false });

    if (error) {
      setInvitesError(error.message || "Could not load invites.");
      setPendingInvites([]);
      setInvitesLoading(false);
      return;
    }

    setPendingInvites(data || []);
    setInvitesLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        setPageError("");

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

        await loadProfile(user.id);
        if (!active) return;

        await loadContacts(user.id);
        if (!active) return;

        await loadPendingInvites();
      } catch (error) {
        if (active) {
          setPageError(error?.message || "Failed to load the feed page.");
          setIsLoadingContacts(false);
          setInvitesLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [supabase, loadProfile, loadContacts]);

  async function handleSaveContact(contactPayload) {
    setContactError("");
    setContactSuccess("");

    if (!sessionUser?.id) {
      throw new Error("You must be signed in to save contacts.");
    }

    const cleanedEmail = String(contactPayload.email || "").trim().toLowerCase();

    if (!cleanedEmail || !isValidEmail(cleanedEmail)) {
      throw new Error("A valid email address is required.");
    }

    const insertPayload = {
      profile_id: sessionUser.id,
      name: contactPayload.name,
      email: cleanedEmail,
      relationship_types: contactPayload.relationshipTypes || ["Friend"],
    };

    const { error } = await supabase.from("profile_connections").insert(insertPayload);

    if (error) {
      throw new Error(
        normalizeSupabaseError(error, "Failed to save contact to profile_connections.")
      );
    }

    await loadContacts(sessionUser.id);
    setContactSuccess("Contact saved successfully.");
  }

  function openDeleteContactModal(contact) {
    setDeleteContactError("");
    setSelectedContactToDelete(contact);
    setIsDeleteContactOpen(true);
  }

  async function handleConfirmDeleteContact(contact) {
    setDeleteContactError("");
    setContactError("");
    setContactSuccess("");

    if (!contact?.id) {
      setDeleteContactError("Missing contact id.");
      return;
    }

    setIsDeletingContact(true);

    try {
      const { error } = await supabase
        .from("profile_connections")
        .delete()
        .eq("id", contact.id);

      if (error) {
        throw new Error(
          normalizeSupabaseError(error, "Failed to delete contact from profile_connections.")
        );
      }

      setContacts((prev) => prev.filter((item) => item.id !== contact.id));
      setIsDeleteContactOpen(false);
      setSelectedContactToDelete(null);
      setContactSuccess("Contact deleted successfully.");
    } catch (error) {
      setDeleteContactError(error?.message || "Failed to delete contact.");
    } finally {
      setIsDeletingContact(false);
    }
  }

  async function handleInviteDecision(inviteId, nextStatus) {
    setInviteActionId(inviteId);
    setInvitesError("");

    const { error } = await supabase
      .from("circle_invites")
      .update({ status: nextStatus })
      .eq("id", inviteId)
      .select()
      .single();

    if (error) {
      setInvitesError(error.message || "Could not update invite.");
      setInviteActionId(null);
      return;
    }

    setPendingInvites((current) => current.filter((invite) => invite.id !== inviteId));
    setActiveInvite((current) => {
      if (!current) return null;
      return current.id === inviteId ? null : current;
    });
    setInviteActionId(null);
  }

  const showDemoGuide = demoMode && !(contacts.length > 0 || hasContactsDemoFallback);

  const visibleFeedItems = useMemo(() => {
    if (activeFilter === "all") return feedItems;
    return feedItems.filter((item) => item.type === activeFilter);
  }, [activeFilter]);

  const displayContacts = contacts.length > 0 ? contacts : demoContacts;
  const displayContactsAreDemo = contacts.length === 0 && demoMode;

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
              <Link
                href="/feed"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#2f3b2d] px-4 text-[14px] font-semibold text-white sm:px-5"
              >
                Feed
              </Link>
              <Link
                href="/hints"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-[14px] font-semibold text-slate-700 hover:bg-[#fff5f0] sm:px-5"
              >
                Hints
              </Link>
              <Link
                href="/circles"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-[14px] font-semibold text-slate-700 hover:bg-[#fff5f0] sm:px-5"
              >
                Circles
              </Link>
              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-[14px] font-semibold text-slate-700 hover:bg-[#fff5f0] sm:px-5"
              >
                Shop
              </Link>
            </nav>

            <AvatarMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1380px] px-5 py-8 md:px-8">
        {pageError || contactError || contactSuccess ? (
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

            {contactSuccess ? (
              <div className="rounded-[22px] border border-[#d8e8d3] bg-[#f3fbf1] px-4 py-3 text-sm text-[#4a7a3a]">
                {contactSuccess}
              </div>
            ) : null}
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

                {demoMode && (
                  <span className="rounded-full bg-[#fff2ea] px-3 py-1 text-[11px] font-semibold text-[#e77756]">
                    Demo
                  </span>
                )}
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
                      className={`rounded-[18px] px-4 py-3 text-left text-sm font-medium transition ${
                        selected
                          ? "bg-[#2f3b2d] text-white shadow-sm"
                          : "border border-[#efe4dd] bg-[#fffdfa] text-slate-600 hover:bg-[#faf7f5]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {showDemoGuide && (
              <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  First look
                </p>
                <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.04em] text-slate-900">
                  How this feed will work
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-slate-600">
                  You’re seeing a demo version of your feed so you can understand the layout before real activity starts appearing.
                </p>

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
            )}

            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Contacts</h2>
                  <p className="mt-1 text-xs text-slate-500">Manage people from the same source as Circles.</p>
                </div>

                <span className="rounded-full bg-[#fff5ef] px-2.5 py-1 text-[11px] font-semibold text-[#e77756]">
                  {contacts.length > 0 ? contacts.length : displayContacts.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {isLoadingContacts ? (
                  <div className="rounded-[22px] border border-dashed border-[#e5d8cf] bg-[#fffaf7] p-4 text-[13px] leading-6 text-slate-500">
                    Loading contacts...
                  </div>
                ) : displayContacts.length ? (
                  displayContacts.map((contact) =>
                    contacts.length > 0 ? (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        onDeleteClick={openDeleteContactModal}
                      />
                    ) : (
                      <div key={contact.id} className="rounded-[20px] border border-[#f1e4dc] bg-[#fffdfa] p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b text-[11px] font-bold text-white ${contact.colors}`}
                          >
                            {contact.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{contact.name}</p>
                            <p className="text-xs text-slate-500">{contact.role}</p>
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[#e5d8cf] bg-[#fffaf7] p-4 text-[13px] leading-6 text-slate-500">
                    No contacts added yet. Use the add contact flow to browse from your linked Google account or type someone in manually.
                  </div>
                )}
              </div>

              {displayContactsAreDemo ? (
                <p className="mt-4 text-[12px] leading-5 text-slate-400">
                  These are demo contacts until you add real ones.
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => setIsAddContactOpen(true)}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] px-4 text-sm font-semibold text-white shadow-lg"
              >
                Add or import contact
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
                    <p className="mt-2 max-w-[620px] text-[15px] leading-7 text-slate-600">
                      This feed updates automatically as reminders get closer, hints are added, and shared gift moments start moving.
                    </p>
                  </div>

                  {demoMode && (
                    <div className="rounded-[20px] border border-[#f3dfd6] bg-[#fffaf7] px-4 py-3 text-[13px] leading-6 text-slate-600">
                      Demo mode is on now. Once contacts are added, this area will switch to real activity.
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddContactOpen(true)}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-5 text-sm font-semibold text-white shadow-lg"
                  >
                    Add contact
                  </button>

                  <Link
                    href="/circles"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-[#fff5f0]"
                  >
                    Create circle
                  </Link>

                  <Link
                    href="/shop"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-[#fff5f0]"
                  >
                    Open shop
                  </Link>
                </div>

                <div className="mt-5 space-y-4">
                  {visibleFeedItems.map((item) => (
                    <FeedItem key={item.id} item={item} />
                  ))}
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
              ) : invitesError ? (
                <p className="mt-4 text-sm text-[#c46545]">{invitesError}</p>
              ) : pendingInvites.length === 0 ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-[#ecd9cf] bg-[#fcf8f5] px-4 py-5">
                  <p className="text-sm font-medium text-slate-700">
                    No invites need a response right now.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    When someone adds you to a circle, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {pendingInvites.map((invite) => (
                    <article
                      key={invite.id}
                      className="rounded-[22px] border border-[#ecd9cf] bg-[#fcf8f5] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            {invite.invite_name || invite.invite_email || "Circle invite"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {invite.invite_email || "No email attached"}
                          </p>
                        </div>

                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#e77756]">
                          {invite.status}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        You’ve been invited to join a circle.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveInvite(invite)}
                          disabled={inviteActionId === invite.id}
                          className="inline-flex items-center justify-center rounded-full border border-[#ee8d69] bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                        >
                          {inviteActionId === invite.id ? "Working..." : "View invite"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInviteDecision(invite.id, "accepted")}
                          disabled={inviteActionId === invite.id}
                          className="inline-flex items-center justify-center rounded-full border border-[#dbe8d4] bg-[#eef8e9] px-4 py-2 text-sm font-semibold text-[#4b7a39] disabled:opacity-60"
                        >
                          {inviteActionId === invite.id ? "Working..." : "Accept"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInviteDecision(invite.id, "declined")}
                          disabled={inviteActionId === invite.id}
                          className="inline-flex items-center justify-center rounded-full border border-[#ead7cd] bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
                        >
                          {inviteActionId === invite.id ? "Working..." : "Decline"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {activeInvite ? (
              <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Selected invite
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">
                      {activeInvite.invite_name || activeInvite.invite_email || "Circle invite"}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveInvite(null)}
                    className="rounded-full border border-[#ead7cd] bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Email: {activeInvite.invite_email || "No email attached"}</p>
                  <p>Status: {activeInvite.status}</p>
                  <p>Circle ID: {activeInvite.circle_id}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleInviteDecision(activeInvite.id, "accepted")}
                    disabled={inviteActionId === activeInvite.id}
                    className="inline-flex items-center justify-center rounded-full border border-[#dbe8d4] bg-[#eef8e9] px-4 py-2 text-sm font-semibold text-[#4b7a39] disabled:opacity-60"
                  >
                    {inviteActionId === activeInvite.id ? "Working..." : "Accept invite"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInviteDecision(activeInvite.id, "declined")}
                    disabled={inviteActionId === activeInvite.id}
                    className="inline-flex items-center justify-center rounded-full border border-[#ead7cd] bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
                  >
                    {inviteActionId === activeInvite.id ? "Working..." : "Decline invite"}
                  </button>
                </div>
              </section>
            ) : null}

            <MiniCalendar />

            <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">Upcoming reminders</h2>
                <span className="rounded-full bg-[#fff5ef] px-2.5 py-1 text-[11px] font-semibold text-[#e77756]">
                  3 soon
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {reminders.map((item) => (
                  <div key={item.title} className="rounded-[22px] border border-[#f1e4dc] bg-[#fffdfa] p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-b ${item.colors}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#e6ddd7] bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Shop next
              </p>
              <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.04em] text-slate-900">
                A place for saved gift options
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-slate-600">
                Shop can become the home for linked products, saved retailer finds, and the items you might attach to circles later.
              </p>

              <Link
                href="/shop"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-[#fff5f0]"
              >
                Go to shop
              </Link>
            </section>

            <section className="rounded-[28px] bg-[#2f3b2d] p-5 text-white shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                Gift prompt
              </p>
              <p className="mt-3 text-sm leading-7 text-white/90">
                Sarah has recently saved “ceramic dinnerware” and “weekend city break”, so experience-led gifts may be the strongest route.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-800"
              >
                View related hints
              </button>
            </section>
          </aside>
        </div>
      </div>

      <AddContactModal
        open={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onSave={async (payload) => {
          try {
            await handleSaveContact(payload);
          } catch (error) {
            setContactError(error?.message || "Failed to save contact.");
            throw error;
          }
        }}
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
    </main>
  );
}
