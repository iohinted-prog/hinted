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
  onRequestDelete,
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
            const canDelete = event.source === "user";

            return (
              <div key={event.id} className="rounded-[18px] border border-[#eee1da] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.pill}`}>
                        {style.label}
                      </span>

                      {event.source === "system" ? (
                        <span className="rounded-full border border-[#eadfd7] bg-[#fffaf7] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
                          Seasonal
                        </span>
                      ) : (
                        <span className="rounded-full border border-[#e6ddd7] bg-[#faf7f4] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
                          You created this
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-900">{event.title}</p>
                    {event.time ? <p className="mt-1 text-xs text-slate-500">{event.time}</p> : null}
                  </div>

                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => onRequestDelete({ ...event, date: selectedDate })}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[#efc0ba] bg-[#fff4f2] px-3 text-[12px] font-semibold text-[#b14f43] hover:bg-[#ffe9e5]"
                    >
                      Delete
                    </button>
                  ) : null}
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
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

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

  const loadEvents = useCallback(async () => {
    setCalendarLoading(true);
    setCalendarError("");

    try {
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
    } catch (error) {
      setCalendarError(error?.message || "Could not load calendar events.");
      setEventsByDate({});
      setCalendarLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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

    try {
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
    } catch (error) {
      setCalendarError(error?.message || "Could not save event.");
      setCalendarSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete?.id || !eventToDelete?.date) return;

    setIsDeletingEvent(true);
    setCalendarError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You need to be signed in to delete calendar events.");
      }

      const eventDateKey = toKey(eventToDelete.date);

      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", eventToDelete.id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(error.message || "Could not delete event.");
      }

      setEventsByDate((prev) => {
        const nextDayEvents = (prev[eventDateKey] || []).filter(
          (item) => item.id !== eventToDelete.id
        );

        return {
          ...prev,
          [eventDateKey]: nextDayEvents,
        };
      });

      setEventToDelete(null);
    } catch (error) {
      setCalendarError(error?.message || "Could not delete event.");
    } finally {
      setIsDeletingEvent(false);
    }
  };

  return (
    <>
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
            const dotClass = leadType
              ? (eventTypeStyles[leadType] || eventTypeStyles.celebration).dot
              : null;

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
            onRequestDelete={setEventToDelete}
            draft={draft}
            setDraft={setDraft}
            isSaving={calendarSaving}
          />
        ) : null}
      </section>

      {eventToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(42,26,20,0.38)] px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-[520px] rounded-[30px] border border-[#eddacf] bg-[#fffaf7] p-6 shadow-[0_24px_80px_rgba(88,46,31,0.22)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#df7b59]">
              Delete event
            </p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
              Remove this event?
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              This will permanently delete{" "}
              <span className="font-semibold text-slate-900">{eventToDelete.title}</span> from your
              calendar.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={isDeletingEvent}
                className="inline-flex h-[44px] items-center justify-center rounded-full border border-[#ead8ce] bg-white px-6 text-sm font-medium text-slate-700 hover:bg-[#fff5f0] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={isDeletingEvent}
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#b14f43] px-6 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isDeletingEvent ? "Deleting..." : "Delete event"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
