"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function buildContactBirthdayEvents(contacts) {
  const now = new Date();
  const rows = [];
  for (const contact of (contacts || [])) {
    if (!contact.birthday) continue;
    const bday = new Date(contact.birthday + "T00:00:00");
    if (isNaN(bday.getTime())) continue;
    const month = bday.getMonth();
    const day = bday.getDate();
    for (let y = now.getFullYear(); y <= now.getFullYear() + 1; y++) {
      const date = new Date(Date.UTC(y, month, day));
      if (date >= now) {
        rows.push({
          id: `birthday-${contact.contact_id}-${y}`,
          title: `${contact.name || "Contact"}'s Birthday`,
          event_date: date.toISOString().slice(0, 10),
          type: "Birthday",
          source: "contact",
          cta_label: "See hints",
          cta_href: contact.profileId ? "/profile/" + contact.profileId : "/feed",
        });
        break;
      }
    }
  }
  return rows;
}

export default function CalendarClient() {
  const supabase = createClient();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: calEvents }, { data: contacts }] = await Promise.all([
        supabase.from("calendar_events").select("*").eq("user_id", user.id).order("event_date"),
        supabase.from("contact_public_state").select("*").eq("owner_user_id", user.id),
      ]);

      const birthdayEvents = buildContactBirthdayEvents(contacts || []);
      const all = [...(calEvents || []), ...birthdayEvents];
      setEvents(all);
      setLoading(false);
    }
    load();
  }, []);

  const eventsByDate = events.reduce((acc, e) => {
    const key = e.event_date?.slice(0, 10);
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayKey = toKey(today);
  const selectedKey = toKey(selectedDate);

  const monthName = currentMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const selectedEvents = eventsByDate[selectedKey] || [];

  // Upcoming events next 30 days
  const upcoming = events
    .filter(e => {
      const d = e.event_date?.slice(0, 10);
      return d && d >= todayKey;
    })
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-[#fffaf7] pb-24">
      <div className="px-4 pt-6 pb-2 sm:px-8 max-w-[640px] mx-auto">
        <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-slate-900 mb-4">Calendar</h1>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="h-9 w-9 flex items-center justify-center rounded-full border border-[#ead8ce] text-slate-500">←</button>
          <p className="text-[15px] font-semibold text-slate-900">{monthName}</p>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="h-9 w-9 flex items-center justify-center rounded-full border border-[#ead8ce] text-slate-500">→</button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={"e" + i} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const hasEvents = !!eventsByDate[key];
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            return (
              <button key={d} type="button" onClick={() => setSelectedDate(new Date(year, month, d))}
                className={`relative flex flex-col items-center justify-center h-10 rounded-full text-[13px] font-semibold transition
                  ${isSelected ? "bg-[#ff875d] text-white" : isToday ? "bg-[#fff4ee] text-[#ff875d]" : "text-slate-700 hover:bg-[#fff4ee]"}`}>
                {d}
                {hasEvents && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#ff875d]" />}
              </button>
            );
          })}
        </div>

        {/* Selected day events */}
        {selectedEvents.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">
              {selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            {selectedEvents.map(e => (
              <div key={e.id} className="rounded-[16px] border border-[#f0dfd6] bg-white p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">{e.title}</p>
                  {e.type && <p className="text-[11px] text-slate-400 mt-0.5">{e.type}</p>}
                </div>
                {e.cta_label && e.cta_href && (
                  <a href={e.cta_href} className="shrink-0 h-8 px-3 flex items-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] text-[11px] font-semibold text-white">
                    {e.cta_label}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upcoming */}
        <div className="mt-6">
          <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Coming up</p>
          {loading ? (
            <div className="text-sm text-slate-400">Loading...</div>
          ) : upcoming.length === 0 ? (
            <div className="text-sm text-slate-400">Nothing coming up.</div>
          ) : (
            <div className="space-y-2">
              {upcoming.map(e => (
                <div key={e.id} className="rounded-[16px] border border-[#f0dfd6] bg-white p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">{e.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(e.event_date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                  </div>
                  {e.cta_label && e.cta_href && (
                    <a href={e.cta_href} className="shrink-0 h-8 px-3 flex items-center rounded-full bg-gradient-to-b from-[#ff966f] to-[#ff7e54] text-[11px] font-semibold text-white">
                      {e.cta_label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
