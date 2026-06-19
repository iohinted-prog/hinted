"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import AvatarMenu from "../components/AvatarMenu";

/* keep your existing currencyOptions, relationshipOptions,
   calendarEvents, helper functions, LogoMark, ModalShell,
   ContactCard, MemberPill, ContributionRing, PotPreviewCard,
   PotTypeGuide, CircleCard, CurrencyAmountInput,
   CreateCircleModal, EditPotModal, DeletePotModal exactly as-is */

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
      status: "joined",
    },
    {
      name: "Example friend",
      initials: "E",
      contributed: false,
      amount: 0,
      colors: "from-[#efcdbf] to-[#bb8168]",
      status: "invited",
    },
  ],
  pot: {
    active: true,
    item: "Example item",
    source: "Example shared goal",
    sourceUrl: "https://example.com/example-item",
    previewImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    previewDescription:
      "This is just a single example pot so the layout still demonstrates the feature without showing multiple fake pots.",
    target: 120,
    currency: "GBP",
    raised: 40,
    note: "Example only.",
    fundingMode: "Flexible pot",
    deadline: "2026-07-01",
    goalType: "item",
  },
};

function normalizeSupabaseError(error, fallback) {
  if (!error) return fallback;
  const parts = [error.message, error.details, error.hint].filter(Boolean);
  return parts.length ? parts.join(" — ") : fallback;
}

function mapFundingModeToLabel(value) {
  if (value === "all_or_nothing" || value === "All-or-nothing") return "All-or-nothing";
  if (value === "organizer_covers" || value === "Organizer covers gap") return "Organizer covers gap";
  return "Flexible pot";
}

function mapFundingModeToDb(value) {
  if (value === "All-or-nothing" || value === "all_or_nothing") return "all_or_nothing";
  if (value === "Organizer covers gap" || value === "organizer_covers") return "organizer_covers";
  return "flexible";
}

function safeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function buildContactRecordFromProfileConnection(row) {
  const name =
    (row?.name || "").trim() ||
    (row?.email || "").trim() ||
    "Unnamed contact";

  const relationship = row?.relationship || "Friend";

  return {
    id: row.id,
    profileConnectionId: row.id,
    name,
    role: relationship,
    note: row?.source === "google" ? "Added from linked contacts" : "Added manually",
    initials: getInitials(name),
    colors: getRelationshipGradient(relationship),
    email: (row?.email || "").trim(),
    phone: (row?.phone || "").trim(),
    birthday: row?.birthday || "",
    raw: row,
  };
}

function buildCircleFromRow(circleRow, inviteRows = [], currentUserName = "You") {
  const joinedMembers = [
    {
      name: currentUserName || "You",
      initials: getInitials(currentUserName || "You"),
      contributed: false,
      amount: Number(circleRow?.raised_amount || 0),
      colors: "from-[#4e596d] to-[#212a3c]",
      status: "joined",
    },
    ...inviteRows.map((invite) => {
      const inviteName =
        invite?.invite_name ||
        invite?.profileconnections?.name ||
        invite?.invite_email ||
        "Invited person";

      const relationship =
        invite?.profileconnections?.relationship || "Friend";

      return {
        name: inviteName,
        initials: getInitials(inviteName),
        contributed: false,
        amount: 0,
        colors: getRelationshipGradient(relationship),
        status: invite?.status === "accepted" ? "joined" : "invited",
      };
    }),
  ];

  const subtitleType = circleRow?.event_type || "Event";
  const eventDate = circleRow?.event_date || circleRow?.deadline;

  return {
    id: circleRow.id,
    name: circleRow.name || circleRow.event_title || "Untitled circle",
    subtitle: `${subtitleType} · ${formatDateLabel(eventDate)}`,
    description:
      circleRow?.description ||
      "A shared circle built around one event, one goal, and a clear fallback if invitees do not join.",
    members: joinedMembers,
    pot: {
      active: true,
      item:
        circleRow?.goal_type === "amount"
          ? "Shared contribution pot"
          : circleRow?.item_name || "Untitled item",
      source:
        circleRow?.goal_type === "amount"
          ? "Amount-based goal"
          : circleRow?.item_source_label || "Shared goal",
      sourceUrl: circleRow?.item_source_url || "",
      previewImage: circleRow?.preview_image || "",
      previewDescription: circleRow?.preview_description || "",
      target: Number(circleRow?.target_amount || 0),
      currency: circleRow?.currency || "GBP",
      raised: Number(circleRow?.raised_amount || 0),
      note:
        circleRow?.note ||
        "Choose a public hint or paste a link to turn this into a communal goal.",
      fundingMode: mapFundingModeToLabel(circleRow?.funding_mode),
      deadline: circleRow?.deadline || "",
      goalType: circleRow?.goal_type || "item",
    },
    raw: circleRow,
    invites: inviteRows,
  };
}

async function fetchGoogleContacts(supabase, query) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const providerToken = session?.provider_token;

  if (!providerToken) {
    throw new Error(
      "Google contacts access is unavailable because session.provider_token is missing. Reconnect Google sign-in with contacts scope."
    );
  }

  await fetch(
    "https://people.googleapis.com/v1/people:searchContacts?query=&pageSize=1&readMask=names,emailAddresses",
    {
      headers: {
        Authorization: `Bearer ${providerToken}`,
      },
    }
  );

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
    throw new Error(result?.error?.message || "Google contact search failed.");
  }

  const people = Array.isArray(result?.results) ? result.results : [];

  return people
    .map((item) => item?.person)
    .filter(Boolean)
    .map((person, index) => ({
      id: person.resourceName || String(index),
      resourceName: person.resourceName || "",
      name: getPrimaryContactField(person, "names"),
      email: getPrimaryContactField(person, "emailAddresses"),
    }))
    .filter((person) => person.name || person.email);
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
    source: "manual",
    googleResourceName: "",
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
      setForm({ name: "", email: "", source: "manual", googleResourceName: "" });
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
      const results = await fetchGoogleContacts(supabase, query);
      setContactResults(results);

      if (results.length === 0) {
        setContactsMessage("No matching Google contacts found. You can still type their email manually.");
      }
    } catch (error) {
      console.error("Contact search error:", error);
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
      source: "google",
      googleResourceName: contact.resourceName || "",
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
      return [relationship];
    });
  }

  async function handleSave() {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const relationship = selectedRelationships[0] || "Friend";

    if (!name && !email) {
      setSaveError("Enter at least a name or an email.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      await onSave({
        name,
        email,
        relationship,
        source: form.source,
        google_resource_name: form.googleResourceName || null,
      });
      onClose();
    } catch (error) {
      console.error("Save contact failed:", error);
      setSaveError(error?.message || "Failed to save contact.");
    } finally {
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
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value, source: prev.source || "manual" }))
              }
              placeholder="Maya"
              className="mt-2 h-[48px] w-full rounded-[18px] border border-[#d9dce3] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#f19b7e]"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-900">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value, source: prev.source || "manual" }))
              }
              placeholder="maya@example.com"
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
            disabled={saving || (!form.name.trim() && !form.email.trim())}
            className={`inline-flex h-[44px] items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-lg ${
              saving || (!form.name.trim() && !form.email.trim())
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

export default function CirclesClient() {
  const supabase = createClient();

  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [realCircles, setRealCircles] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingCircles, setIsLoadingCircles] = useState(true);

  const [pageError, setPageError] = useState("");
  const [contactError, setContactError] = useState("");
  const [circleError, setCircleError] = useState("");
  const [circleSuccess, setCircleSuccess] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [eventMode, setEventMode] = useState("calendar");
  const [selectedEventId, setSelectedEventId] = useState(String(calendarEvents?.[0]?.id || ""));
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [selectedHintContactId, setSelectedHintContactId] = useState(null);
  const [linkPreview, setLinkPreview] = useState(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [editingCircle, setEditingCircle] = useState(null);
  const [isEditPotOpen, setIsEditPotOpen] = useState(false);
  const [isDeletePotOpen, setIsDeletePotOpen] = useState(false);
  const [editLinkPreview, setEditLinkPreview] = useState(null);
  const [isFetchingEditPreview, setIsFetchingEditPreview] = useState(false);
  const [editSelectedHintContactId, setEditSelectedHintContactId] = useState(null);
  const [isCreatingCircle, setIsCreatingCircle] = useState(false);
  const [isSavingPot, setIsSavingPot] = useState(false);
  const [isDeletingPot, setIsDeletingPot] = useState(false);

  const safeDefaultEvent = calendarEvents?.[0] || { id: "", title: "", date: "" };

  const [form, setForm] = useState({
    eventTitle: safeDefaultEvent.title || "",
    eventDate: safeDefaultEvent.date || "",
    deadline: safeDefaultEvent.date || "",
    goalType: "item",
    goalValue: "",
    currency: "GBP",
    fundingMode: "flexible",
    itemSource: "hint",
    selectedHintId: "",
    itemUrl: "",
  });

  const [editPotForm, setEditPotForm] = useState({
    goalType: "item",
    item: "",
    target: "",
    currency: "GBP",
    deadline: "",
    fundingMode: "Flexible pot",
    note: "",
    source: "",
    sourceUrl: "",
    previewImage: "",
    previewDescription: "",
    itemSource: "hint",
    selectedHintId: "",
    itemUrl: "",
  });

  const displayedCircles = useMemo(() => {
    if (realCircles.length > 0) return realCircles;
    return [exampleCircle];
  }, [realCircles]);

  const resetCircleForm = useCallback(() => {
    const fallbackEvent = calendarEvents?.[0] || { id: "", title: "", date: "" };
    setEventMode("calendar");
    setSelectedEventId(String(fallbackEvent.id || ""));
    setSelectedPeople([]);
    setSelectedHintContactId((prev) => prev ?? contacts?.[0]?.id ?? null);
    setLinkPreview(null);
    setCircleError("");
    setCircleSuccess("");
    setForm({
      eventTitle: fallbackEvent.title || "",
      eventDate: fallbackEvent.date || "",
      deadline: fallbackEvent.date || "",
      goalType: "item",
      goalValue: "",
      currency: "GBP",
      fundingMode: "flexible",
      itemSource: "hint",
      selectedHintId: "",
      itemUrl: "",
    });
  }, [contacts]);

  const loadProfile = useCallback(async (userId) => {
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
  }, [supabase]);

  const loadContacts = useCallback(async (userId) => {
    setIsLoadingContacts(true);
    setContactError("");

    const { data, error } = await supabase
      .from("profileconnections")
      .select("*")
      .eq("profileid", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setContacts([]);
      throw new Error(normalizeSupabaseError(error, "Failed to load contacts from profileconnections."));
    }

    const mappedContacts = Array.isArray(data)
      ? data.map(buildContactRecordFromProfileConnection)
      : [];

    setContacts(mappedContacts);
    setIsLoadingContacts(false);
    return mappedContacts;
  }, [supabase]);

  const loadCircles = useCallback(async (userId) => {
    setIsLoadingCircles(true);
    setCircleError("");

    const { data: circlesData, error: circlesError } = await supabase
      .from("circles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (circlesError) {
      setRealCircles([]);
      throw new Error(normalizeSupabaseError(circlesError, "Failed to load circles."));
    }

    const circleIds = (circlesData || []).map((circle) => circle.id).filter(Boolean);

    let invitesByCircle = {};
    if (circleIds.length > 0) {
      const { data: inviteData, error: inviteError } = await supabase
        .from("circleinvites")
        .select("*, profileconnections(*)")
        .in("circle_id", circleIds);

      if (inviteError) {
        throw new Error(normalizeSupabaseError(inviteError, "Failed to load circle invites."));
      }

      invitesByCircle = (inviteData || []).reduce((acc, invite) => {
        const key = invite.circle_id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(invite);
        return acc;
      }, {});
    }

    const currentUserName =
      getGoogleName(profile || {}) ||
      profile?.full_name ||
      profile?.name ||
      "You";

    const mappedCircles = (circlesData || []).map((circle) =>
      buildCircleFromRow(circle, invitesByCircle[circle.id] || [], currentUserName)
    );

    setRealCircles(mappedCircles);
    setIsLoadingCircles(false);
    return mappedCircles;
  }, [supabase, profile]);

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
          throw new Error("You must be signed in to view circles.");
        }

        if (!active) return;
        setSessionUser(user);

        await loadProfile(user.id);
        if (!active) return;

        await loadContacts(user.id);
        if (!active) return;

        await loadCircles(user.id);
      } catch (error) {
        console.error("Circles bootstrap failed:", error);
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
  }, [supabase, loadProfile, loadContacts, loadCircles]);

  useEffect(() => {
    if (!selectedHintContactId && contacts.length > 0) {
      setSelectedHintContactId(contacts[0].id);
    }

    if (!editSelectedHintContactId && contacts.length > 0) {
      setEditSelectedHintContactId(contacts[0].id);
    }
  }, [contacts, selectedHintContactId, editSelectedHintContactId]);

  const handleFetchPreview = async () => {
    if (!form.itemUrl.trim()) return;

    try {
      setIsFetchingPreview(true);
      setCircleError("");

      const response = await fetch("/api/link-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: form.itemUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch preview");
      }

      setLinkPreview(data);
    } catch (error) {
      setLinkPreview({
        title: "Preview unavailable",
        description: "We could not pull a preview from that link yet, but you can still use the URL.",
        image: "",
        siteName: form.itemUrl,
        url: form.itemUrl,
      });
      setCircleError(error?.message || "Preview fetch failed.");
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handleFetchEditPreview = async () => {
    if (!editPotForm.itemUrl.trim()) return;

    try {
      setIsFetchingEditPreview(true);
      setCircleError("");

      const response = await fetch("/api/link-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: editPotForm.itemUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch preview");
      }

      setEditLinkPreview(data);
    } catch (error) {
      setEditLinkPreview({
        title: "Preview unavailable",
        description: "We could not pull a preview from that link yet, but you can still use the URL.",
        image: "",
        siteName: editPotForm.itemUrl,
        url: editPotForm.itemUrl,
      });
      setCircleError(error?.message || "Edit preview fetch failed.");
    } finally {
      setIsFetchingEditPreview(false);
    }
  };

  async function handleSaveContact(payload) {
    setContactError("");

    if (!sessionUser?.id) {
      throw new Error("You must be signed in to save contacts.");
    }

    const insertPayload = {
      profileid: sessionUser.id,
      name: payload.name || null,
      email: payload.email || null,
      relationship: payload.relationship || "Friend",
      source: payload.source || "manual",
      google_resource_name: payload.google_resource_name || null,
    };

    const { data, error } = await supabase
      .from("profileconnections")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      throw new Error(
        normalizeSupabaseError(
          error,
          "Failed to save contact to profileconnections. Check RLS, required columns, and schema names."
        )
      );
    }

    const nextContact = buildContactRecordFromProfileConnection(data);

    setContacts((prev) => {
      const alreadyExists = prev.some(
        (item) =>
          item.profileConnectionId === nextContact.profileConnectionId ||
          (!!nextContact.email && item.email?.toLowerCase() === nextContact.email?.toLowerCase())
      );
      if (alreadyExists) return prev;
      return [nextContact, ...prev];
    });

    if (!selectedHintContactId) {
      setSelectedHintContactId(nextContact.id);
    }

    return nextContact;
  }

  async function handleCreateCircle() {
    setCircleError("");
    setCircleSuccess("");

    const selectedEvent =
      eventMode === "calendar"
        ? calendarEvents.find((event) => String(event.id) === String(selectedEventId))
        : null;

    const eventTitle =
      eventMode === "calendar"
        ? selectedEvent?.title || form.eventTitle || ""
        : form.eventTitle?.trim() || "";

    const eventDate =
      eventMode === "calendar"
        ? selectedEvent?.date || form.eventDate || ""
        : form.eventDate || "";

    if (!sessionUser?.id) {
      setCircleError("You must be signed in to create a circle.");
      return;
    }

    if (!eventTitle.trim()) {
      setCircleError("Event title is required.");
      return;
    }

    if (!safeDate(eventDate)) {
      setCircleError("Event date is required and must be valid.");
      return;
    }

    if (!safeDate(form.deadline || eventDate)) {
      setCircleError("Contribution deadline is required and must be valid.");
      return;
    }

    const targetNumber = parseAmount(form.goalValue);
    if (!Number.isFinite(targetNumber) || targetNumber <= 0) {
      setCircleError("Target amount must be greater than 0.");
      return;
    }

    const selectedHintContact =
      contacts.find((contact) => String(contact.id) === String(selectedHintContactId)) || null;

    const selectedHint =
      form.goalType === "item" && form.itemSource === "hint"
        ? publicHintsByContact?.[selectedHintContactId]?.find((hint) => hint.id === form.selectedHintId) || null
        : null;

    if (form.goalType === "item" && form.itemSource === "hint" && !selectedHint) {
      setCircleError("Choose a public hint or switch to pasted link.");
      return;
    }

    if (form.goalType === "item" && form.itemSource === "url" && !form.itemUrl.trim()) {
      setCircleError("Paste a product or experience link.");
      return;
    }

    const itemName =
      form.goalType === "amount"
        ? null
        : form.itemSource === "hint"
          ? selectedHint?.title || null
          : linkPreview?.title || "Linked item";

    const itemSourceLabel =
      form.goalType === "amount"
        ? "Amount-based goal"
        : form.itemSource === "hint"
          ? `From ${selectedHintContact?.name || "contact"}'s public hints`
          : linkPreview?.siteName || "From pasted link";

    const itemSourceUrl =
      form.goalType === "amount"
        ? null
        : form.itemSource === "hint"
          ? selectedHint?.url || null
          : linkPreview?.url || form.itemUrl.trim() || null;

    const previewImage =
      form.goalType === "amount"
        ? null
        : form.itemSource === "hint"
          ? selectedHint?.image || null
          : linkPreview?.image || null;

    const previewDescription =
      form.goalType === "amount"
        ? null
        : form.itemSource === "hint"
          ? selectedHint?.description || null
          : linkPreview?.description || null;

    const description =
      "A shared circle built around one event, one goal, and a clear fallback if invitees do not join.";

    const note =
      form.fundingMode === "all_or_nothing"
        ? "This circle will only proceed if the group reaches the target by the deadline."
        : form.fundingMode === "organizer_covers"
          ? "If the full target is not reached, the organiser can choose to cover the gap."
          : "This circle can stay flexible if fewer people join than expected.";

    setIsCreatingCircle(true);

    try {
      const insertCirclePayload = {
        user_id: sessionUser.id,
        profile_id: sessionUser.id,
        name: eventTitle.trim(),
        event_title: eventTitle.trim(),
        event_date: safeDate(eventDate),
        event_type: eventMode === "calendar" ? selectedEvent?.type || "Event" : "Event",
        description,
        goal_type: form.goalType,
        item_name: itemName,
        item_source_label: itemSourceLabel,
        item_source_url: itemSourceUrl,
        preview_image: previewImage,
        preview_description: previewDescription,
        target_amount: targetNumber,
        raised_amount: 0,
        currency: form.currency || "GBP",
        funding_mode: mapFundingModeToDb(form.fundingMode),
        deadline: safeDate(form.deadline || eventDate),
        note,
      };

      const { data: insertedCircle, error: circleInsertError } = await supabase
        .from("circles")
        .insert(insertCirclePayload)
        .select("*")
        .single();

      if (circleInsertError) {
        throw new Error(
          normalizeSupabaseError(
            circleInsertError,
            "Failed to insert into circles. Check RLS, required columns, and date/value formats."
          )
        );
      }

      const inviteRows = selectedPeople.map((person) => ({
        circle_id: insertedCircle.id,
        user_id: sessionUser.id,
        contact_id: person.profileConnectionId || person.id,
        invite_name: person.name || null,
        invite_email: person.email || null,
        status: "sent",
        reminder_count: 0,
      }));

      let insertedInvites = [];
      if (inviteRows.length > 0) {
        const { data: inviteData, error: inviteError } = await supabase
          .from("circleinvites")
          .insert(inviteRows)
          .select("*, profileconnections(*)");

        if (inviteError) {
          throw new Error(
            normalizeSupabaseError(
              inviteError,
              "Circle was created but invite insert into circleinvites failed. Check RLS, foreign keys, and column names."
            )
          );
        }

        insertedInvites = inviteData || [];
      }

      const currentUserName =
        getGoogleName(profile || {}) ||
        profile?.full_name ||
        profile?.name ||
        "You";

      const mappedCircle = buildCircleFromRow(insertedCircle, insertedInvites, currentUserName);

      setRealCircles((prev) => [mappedCircle, ...prev]);
      setCircleSuccess("Circle created successfully.");
      setIsCreateOpen(false);
      resetCircleForm();
    } catch (error) {
      console.error("Error creating circle:", error);
      setCircleError(error?.message || "Error creating circle.");
    } finally {
      setIsCreatingCircle(false);
    }
  }

  function openEditPot(circle) {
    if (!circle) return;

    setEditingCircle(circle);
    setEditSelectedHintContactId(contacts?.[0]?.id ?? null);
    setEditLinkPreview(null);
    setCircleError("");
    setEditPotForm({
      goalType: circle?.pot?.goalType || "item",
      item: circle?.pot?.item || "",
      target: String(circle?.pot?.target || ""),
      currency: circle?.pot?.currency || "GBP",
      deadline: circle?.pot?.deadline || "",
      fundingMode: circle?.pot?.fundingMode || "Flexible pot",
      note: circle?.pot?.note || "",
      source: circle?.pot?.source || "",
      sourceUrl: circle?.pot?.sourceUrl || "",
      previewImage: circle?.pot?.previewImage || "",
      previewDescription: circle?.pot?.previewDescription || "",
      itemSource: circle?.pot?.sourceUrl ? "url" : "hint",
      selectedHintId: "",
      itemUrl: circle?.pot?.sourceUrl || "",
    });
    setIsEditPotOpen(true);
  }

  async function handleSavePot() {
    if (!editingCircle?.id) return;

    const updatedTarget = parseAmount(editPotForm.target);

    if (!Number.isFinite(updatedTarget) || updatedTarget <= 0) {
      setCircleError("Pot target must be greater than 0.");
      return;
    }

    if (!safeDate(editPotForm.deadline)) {
      setCircleError("Pot deadline must be a valid date.");
      return;
    }

    setIsSavingPot(true);
    setCircleError("");

    try {
      const payload = {
        goal_type: editPotForm.goalType,
        item_name: editPotForm.goalType === "amount" ? null : editPotForm.item || null,
        item_source_label:
          editPotForm.goalType === "amount" ? "Amount-based goal" : editPotForm.source || null,
        item_source_url: editPotForm.goalType === "amount" ? null : editPotForm.sourceUrl || null,
        preview_image: editPotForm.goalType === "amount" ? null : editPotForm.previewImage || null,
        preview_description:
          editPotForm.goalType === "amount" ? null : editPotForm.previewDescription || null,
        target_amount: updatedTarget,
        currency: editPotForm.currency || "GBP",
        deadline: safeDate(editPotForm.deadline),
        funding_mode: mapFundingModeToDb(editPotForm.fundingMode),
        note: editPotForm.note || null,
      };

      const { data, error } = await supabase
        .from("circles")
        .update(payload)
        .eq("id", editingCircle.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(
          normalizeSupabaseError(
            error,
            "Failed to update circle pot. Check RLS, schema columns, and value formatting."
          )
        );
      }

      const currentUserName =
        getGoogleName(profile || {}) ||
        profile?.full_name ||
        profile?.name ||
        "You";

      const existingInvites = editingCircle.invites || [];
      const nextCircle = buildCircleFromRow(data, existingInvites, currentUserName);

      setRealCircles((prev) =>
        prev.map((circle) => (circle.id === editingCircle.id ? nextCircle : circle))
      );

      setEditingCircle(nextCircle);
      setIsEditPotOpen(false);
    } catch (error) {
      console.error("Save pot failed:", error);
      setCircleError(error?.message || "Failed to save pot.");
    } finally {
      setIsSavingPot(false);
    }
  }

  async function handleDeletePot() {
    if (!editingCircle?.id) return;

    setIsDeletingPot(true);
    setCircleError("");

    try {
      const payload = {
        goal_type: "item",
        item_name: null,
        item_source_label: null,
        item_source_url: null,
        preview_image: null,
        preview_description: null,
        target_amount: 0,
        note: "Choose a public hint or paste a link to turn this into a communal goal.",
      };

      const { data, error } = await supabase
        .from("circles")
        .update(payload)
        .eq("id", editingCircle.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(
          normalizeSupabaseError(
            error,
            "Failed to delete pot details from circles."
          )
        );
      }

      const currentUserName =
        getGoogleName(profile || {}) ||
        profile?.full_name ||
        profile?.name ||
        "You";

      const nextCircle = buildCircleFromRow(data, editingCircle.invites || [], currentUserName);
      nextCircle.pot.active = false;

      setRealCircles((prev) =>
        prev.map((circle) => (circle.id === editingCircle.id ? nextCircle : circle))
      );

      setIsDeletePotOpen(false);
      setIsEditPotOpen(false);
      setEditingCircle(null);
    } catch (error) {
      console.error("Delete pot failed:", error);
      setCircleError(error?.message || "Failed to delete pot.");
    } finally {
      setIsDeletingPot(false);
    }
  }

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
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-4 text-[14px] font-semibold text-slate-700 hover:bg-[#fff5f0] sm:px-5"
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
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#2f3b2d] px-4 text-[14px] font-semibold text-white sm:px-5"
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
        {(pageError || contactError || circleError || circleSuccess) ? (
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
                          onAdd={(person) => {
                            setSelectedPeople((prev) =>
                              prev.some((item) => item.id === person.id) ? prev : [...prev, person]
                            );
                            setIsCreateOpen(true);
                          }}
                        />
                      ))
                    ) : (
                      <div className="rounded-[22px] border border-dashed border-[#e5d8cf] bg-[#fffaf7] p-4 text-[13px] leading-6 text-slate-500">
                        No contacts added yet. Use the add contact flow to browse from your linked Google account or type someone in manually.
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddContactOpen(true)}
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
                      Create a circle around an event, invite people, choose a public hint or pasted link, and let the pot stay flexible if everyone does not join.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-[#ff946d] to-[#f36f64] px-6 text-sm font-semibold text-white shadow-lg"
                  >
                    {isCreatingCircle ? "Creating..." : "Create new circle"}
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
                        onEditPot={circle.id === "example-circle" ? () => {} : openEditPot}
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
          resetCircleForm();
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
        form={form}
        setForm={setForm}
        linkPreview={linkPreview}
        isFetchingPreview={isFetchingPreview}
        handleFetchPreview={handleFetchPreview}
        selectedHintContactId={selectedHintContactId}
        setSelectedHintContactId={setSelectedHintContactId}
      />

      <EditPotModal
        open={isEditPotOpen}
        onClose={() => {
          setIsEditPotOpen(false);
          setEditingCircle(null);
        }}
        onSave={handleSavePot}
        onDelete={() => setIsDeletePotOpen(true)}
        circle={editingCircle}
        contacts={contacts}
        form={editPotForm}
        setForm={setEditPotForm}
        linkPreview={editLinkPreview}
        isFetchingPreview={isFetchingEditPreview}
        handleFetchPreview={handleFetchEditPreview}
        selectedHintContactId={editSelectedHintContactId}
        setSelectedHintContactId={setEditSelectedHintContactId}
      />

      <DeletePotModal
        open={isDeletePotOpen}
        onClose={() => setIsDeletePotOpen(false)}
        onConfirm={handleDeletePot}
        circle={editingCircle}
      />

      <AddContactModal
        open={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onSave={async (contactPayload) => {
          try {
            await handleSaveContact(contactPayload);
          } catch (error) {
            setContactError(error?.message || "Failed to save contact.");
            throw error;
          }
        }}
        supabase={supabase}
      />
    </main>
  );
}
