"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const initialHasContacts = false;

const filters = [
  { label: "All activity", key: "all" },
  { label: "Reminders", key: "reminders" },
  { label: "Hints", key: "hints" },
  { label: "Circles", key: "circles" },
  { label: "Celebrations", key: "celebrations" },
];

const onboardingSteps = [
  {
    id: 1,
    title: "Add your people",
    text: "Start by adding contacts so Hinted can turn birthdays, milestones, and gift moments into useful updates.",
  },
  {
    id: 2,
    title: "Save hints naturally",
    text: "As you save gift ideas and details, Hinted uses them to make this feed more useful over time.",
  },
  {
    id: 3,
    title: "Let the feed fill itself",
    text: "Once contacts are added, this demo is replaced by real reminders, shared activity, and circle updates.",
  },
];

const allFeedItems = [
  {
    id: 1,
    type: "reminders",
    avatar: "S",
    avatarColors: "from-[#efc3af] to-[#ae6e57]",
    name: "Sarah",
    action: "has a birthday coming up in 2 weeks",
    detail: "June 29 · She recently saved a ceramics workshop and linen bedding.",
    time: "Just now",
    icon: "🎂",
    badge: "Reminder",
    comments: [
      { id: 1, name: "You", text: "Need to actually get ahead of this one." },
      { id: 2, name: "Maya", text: "Happy to split something if you want." },
    ],
    reactions: ["🎉", "❤️", "👏"],
  },
  {
    id: 2,
    type: "hints",
    avatar: "M",
    avatarColors: "from-[#eac8b8] to-[#9d6957]",
    name: "Mum",
    action: "saved a new hint",
    detail: "Silk pillowcase set · John Lewis · Around £45.",
    time: "12m ago",
    icon: "🎁",
    badge: "Hint",
    comments: [{ id: 1, name: "You", text: "This feels very on-brand for her." }],
    reactions: ["✨", "😍", "👏"],
  },
  {
    id: 3,
    type: "circles",
    avatar: "MF",
    avatarColors: "from-[#809168] to-[#41512e]",
    name: "Max & Fiona",
    action: "have a wedding circle that is nearly funded",
    detail: "£320 of £400 raised · 4 contributors · 80% full.",
    time: "1h ago",
    icon: "💍",
    badge: "Circle",
    comments: [{ id: 1, name: "James", text: "I’ll top this up tonight." }],
    reactions: ["🥂", "💚", "🎉"],
  },
  {
    id: 4,
    type: "celebrations",
    avatar: "J",
    avatarColors: "from-[#4e596d] to-[#212a3c]",
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

const eventTypeConfig = {
  birthday: { label: "Birthday", color: "bg-[#f7b7a3] text-[#8f4a2b]", dot: "bg-[#e57a53]" },
  christmas: { label: "Christmas", color: "bg-[#dbeed8] text-[#3d6a34]", dot: "bg-[#5a9b4c]" },
  easter: { label: "Easter", color: "bg-[#f7e9b8] text-[#8e6c13]", dot: "bg-[#d5ab25]" },
  valentines: { label: "Valentine's Day", color: "bg-[#f8d3de] text-[#9a395c]", dot: "bg-[#db6a93]" },
  fathersDay: { label: "Father's Day", color: "bg-[#d8e6f7] text-[#355a87]", dot: "bg-[#5c88c8]" },
  mothersDay: { label: "Mother's Day", color: "bg-[#efd7f7] text-[#7a4b96]", dot: "bg-[#af76d8]" },
  wedding: { label: "Wedding", color: "bg-[#ddebdc] text-[#446646]", dot: "bg-[#7da57b]" },
  promotion: { label: "Promotion", color: "bg-[#d9edf1] text-[#336674]", dot: "bg-[#5aa3b7]" },
  anniversary: { label: "Anniversary", color: "bg-[#f6dcc9] text-[#8f5a32]", dot: "bg-[#d88e55]" },
  babyShower: { label: "Baby shower", color: "bg-[#dce7fb] text-[#4f6390]", dot: "bg-[#88a5df]" },
  graduation: { label: "Graduation", color: "bg-[#ece6d6] text-[#756649]", dot: "bg-[#b29b63]" },
  engagement: { label: "Engagement", color: "bg-[#e4f0e7] text-[#4e7556]", dot: "bg-[#79ac83]" },
};

const seededEvents = [
  {
    id: 1,
    date: "2026-06-29",
    title: "Sarah's Birthday",
    type: "birthday",
    email: "sarah@example.com",
    invite: true,
  },
  {
    id: 2,
    date: "2026-07-10",
    title: "Mum & Dad Anniversary",
    type: "anniversary",
  },
  {
    id: 3,
    date: "2026-07-16",
    title: "James Promotion",
    type: "promotion",
  },
  {
    id: 4,
    date: "2026-12-25",
    title: "Christmas Day",
    type: "christmas",
  },
];

function formatMonthYear(date) {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function formatFullDate(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCalendarDays(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const days = [];

  for (let i = startOffset; i > 0; i -= 1) {
    const date = new Date(year, month, 1 - i);
    days.push({ date, currentMonth: false });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    days.push({ date, currentMonth: true });
  }

  while (days.length < 35) {
    const nextIndex = days.length - (startOffset + totalDays) + 1;
    const date = new Date(year, month + 1, nextIndex);
    days.push({ date, currentMonth: false });
  }

  return days;
}

function LogoMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-b from-[#ffa47f] to-[#ff875d] text-white shadow-lg">
      <span className="text-lg">🎁</span>
    </div>
  );
}

function AvatarMenu({ open, setOpen }) {
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#4e596d] to-[#212a3c] text-sm font-bold text-white ring-4 ring-white/70"
        aria-label="Open account menu"
        aria-expanded={open}
      >
        CG
      </button>

      <div
        className={`absolute right-0 top-[calc(100%+10px)] z-20 w-56 rounded-[22px] border border-[#ecdcd2] bg-white p-2 shadow-[0_18px_45px_rgba(123,84,64,0.14)] transition-all duration-200 ${
          open ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"
        }`}
      >
        <Link href="/account" className="block rounded-[16px] px-4 py-3 text-sm text-slate-700 hover:bg-[#faf6f3]">
          Account details
        </Link>
        <Link href="/settings" className="block rounded-[16px] px-4 py-3 text-sm text-slate-700 hover:bg-[#faf6f3]">
          Settings
        </Link>
        <Link href="/billing" className="block rounded-[16px] px-4 py-3 text-sm text-slate-700 hover:bg-[#faf6f3]">
          Payment details
        </Link>
      </div>
    </div>
  );
}

function FeedItem({ item, demoMode }) {
  const typeStyles =
    item.type === "reminders"
      ? {
          chip: "bg-[#fff3ee] text-[#e07c54]",
          border: "border-[#f6ddd2]",
        }
      : item.type === "circles"
        ? {
            chip: "bg-[#edf6eb] text-[#4a7a3a]",
            border: "border-[#deebda]",
          }
        : item.type === "celebrations"
          ? {
              chip: "bg-[#fff7e8] text-[#af7b14]",
              border: "border-[#f3e3b8]",
            }
          : {
              chip: "bg-[#f5f3ff] text-[#7c5cbf]",
              border: "border-[#e5defa]",
            };

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
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#4e596d] to-[#212a3c] text-[11px] font-bold text-white">
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

function CalendarPanel({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  events,
  onAddEvent,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "birthday",
    email: "",
    invite: false,
  });

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const selectedDateKey = formatDateKey(selectedDate);

  const selectedEvents = useMemo(
    () => events.filter((event) => event.date === selectedDateKey),
    [events, selectedDateKey]
  );

  function changeMonth(direction) {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1)
    );
  }

  function handleDayClick(date) {
    setSelectedDate(date);
    setFormOpen(false);
  }

  function submitEvent(e) {
    e.preventDefault();

    if (!newEvent.title.trim()) return;

    onAddEvent({
      id: Date.now(),
      date: selectedDateKey,
      title: newEvent.title.trim(),
      type: newEvent.type,
      invite: newEvent.type === "birthday" ? newEvent.invite : false,
      email: newEvent.type === "birthday" ? newEvent.email.trim() : "",
    });

    setNewEvent({
      title: "",
      type: "birthday",
      email: "",
      invite: false,
    });
    setFormOpen(false);
  }

  return (
    <section className="rounded-[28px] border border-[#f0dfd6] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Planner
          </p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
            {formatMonthYear(currentMonth)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {calendarDays.map(({ date, currentMonth: inMonth }) => {
          const dateKey = formatDateKey(date);
          const dayEvents = events.filter((event) => event.date === dateKey).slice(0, 2);
          const isSelected = dateKey === selectedDateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => handleDayClick(date)}
              className={`min-h-[74px] rounded-[16px] border p-2 text-left ${
                isSelected
                  ? "border-[#f2b39a] bg-[#fff2ea]"
                  : "border-slate-100 bg-[#fffdfa] hover:bg-[#fff7f2]"
              }`}
            >
              <div className={`text-[13px] font-semibold ${inMonth ? "text-slate-700" : "text-slate-300"}`}>
                {date.getDate()}
              </div>

              <div className="mt-1.5 space-y-1">
                {dayEvents.map((event) => {
                  const type = eventTypeConfig[event.type];
                  return (
                    <div
                      key={event.id}
                      className={`truncate rounded-full px-2 py-1 text-[10px] font-medium ${type.color}`}
                    >
                      {event.title}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[24px] border border-[#f1e4dc] bg-[#fffdfa] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Selected day
            </p>
            <h3 className="mt-1 text-[16px] font-semibold text-slate-900">
              {formatFullDate(selectedDate)}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setFormOpen((prev) => !prev)}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#2f3b2d] px-4 text-sm font-semibold text-white"
          >
            {selectedEvents.length ? "Add another" : "Add event"}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event) => {
              const type = eventTypeConfig[event.type];
              return (
                <div key={event.id} className="rounded-[18px] border border-[#eee3dc] bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-3 w-3 rounded-full ${type.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{type.label}</p>
                      {event.type === "birthday" && event.invite && event.email ? (
                        <p className="mt-1 text-xs text-slate-400">
                          Invite prompt ready for {event.email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">
              No events yet for this day. Add one to get started.
            </p>
          )}
        </div>

        {formOpen && (
          <form onSubmit={submitEvent} className="mt-4 space-y-3 rounded-[20px] border border-[#ebdfd8] bg-[#faf7f4] p-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Event title
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Anna's Birthday"
                className="mt-2 h-11 w-full rounded-[16px] border border-[#e6d8cf] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19a78]/60 focus:ring-4 focus:ring-[#f19a78]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Event type
              </label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, type: e.target.value }))}
                className="mt-2 h-11 w-full rounded-[16px] border border-[#e6d8cf] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19a78]/60 focus:ring-4 focus:ring-[#f19a78]/10"
              >
                {Object.entries(eventTypeConfig).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            {newEvent.type === "birthday" && (
              <div className="rounded-[16px] bg-white p-4">
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={newEvent.invite}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, invite: e.target.checked }))}
                  />
                  Offer to invite this person to Hinted by email
                </label>

                {newEvent.invite && (
                  <input
                    type="email"
                    value={newEvent.email}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="their@email.com"
                    className="mt-3 h-11 w-full rounded-[16px] border border-[#e6d8cf] bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#f19a78]/60 focus:ring-4 focus:ring-[#f19a78]/10"
                  />
                )}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] px-5 text-sm font-semibold text-white shadow-lg"
            >
              Save event
            </button>
          </form>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(eventTypeConfig).slice(0, 8).map(([key, value]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium ${value.color}`}
            >
              <span className={`h-2 w-2 rounded-full ${value.dot}`} />
              {value.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function FeedClient() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [hasContacts] = useState(initialHasContacts);
  const [menuOpen, setMenuOpen] = useState(false);
  const [events, setEvents] = useState(seededEvents);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 6, 16));

  const demoMode = !hasContacts;

  const visibleFeedItems = useMemo(() => {
    if (activeFilter === "all") return allFeedItems;
    return allFeedItems.filter((item) => item.type === activeFilter);
  }, [activeFilter]);

  const showDemoGuide = demoMode && !hasContacts;

  function handleAddEvent(event) {
    setEvents((prev) => [...prev, event]);
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-800">
      <header className="border-b border-[#efe0d7] bg-[#fffaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link href="/feed" className="flex items-center gap-3.5">
              <LogoMark />
              <div className="text-[22px] font-extrabold tracking-[-0.05em] text-slate-900">
                Hinted<span className="text-[#f36f64]">.io</span>
              </div>
            </Link>

            <nav className="flex items-center gap-3">
              <Link
                href="/hints"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#ead8ce] bg-white px-5 text-[14px] font-semibold text-slate-700 hover:bg-[#fff5f0]"
              >
                Hints
              </Link>
            </nav>
          </div>

          <AvatarMenu open={menuOpen} setOpen={setMenuOpen} />
        </div>
      </header>

      <div className="mx-auto max-w-[1380px] px-5 py-8 md:px-8">
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
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
                {filters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={`rounded-[18px] px-4 py-3 text-left text-sm font-medium ${
                      activeFilter === filter.key
                        ? "bg-[#2f3b2d] text-white"
                        : "border border-[#efe4dd] bg-[#fffdfa] text-slate-600 hover:bg-[#faf7f5]"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
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

                <Link
                  href="/contacts"
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] px-5 text-sm font-semibold text-white shadow-lg"
                >
                  Add contacts
                </Link>
              </section>
            )}
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

                <div className="mt-5 space-y-4">
                  {visibleFeedItems.map((item) => (
                    <FeedItem key={item.id} item={item} demoMode={demoMode} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <CalendarPanel
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              events={events}
              onAddEvent={handleAddEvent}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
