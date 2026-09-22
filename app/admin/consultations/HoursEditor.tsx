"use client";

import { useMemo, useState } from "react";
import {
  CONSULTATION_TIME_ZONE,
  FOUNDERS,
  SIMPLE_HOUR_TIMES,
  WEEKDAYS,
  effectiveHoursForFounder,
  nyDateKey,
  weekdayInNy,
  zonedConsultationDate,
  type ConsultationDayHours,
  type FounderAvailability,
  type FounderId,
  type Weekday,
} from "@/lib/consultation";

type Repeat = "once" | "weekly" | "weekdays" | "custom";

function hourLabel(hour: number) {
  if (hour === 0) return "12 am";
  if (hour === 12) return "12 pm";
  return hour < 12 ? `${hour} am` : `${hour - 12} pm`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toKey(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function shiftMonth(year: number, month: number, delta: number) {
  const next = new Date(year, month - 1 + delta, 1);
  return { year: next.getFullYear(), month: next.getMonth() + 1 };
}

function monthTitle(year: number, month: number) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return zonedConsultationDate(year, month, day, 12);
}

function addDays(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  return nyDateKey(zonedConsultationDate(year, month, day + days, 12));
}

export function HoursEditor({ initial }: { initial: FounderAvailability }) {
  const todayKey = nyDateKey(new Date());
  const [todayYear, todayMonth] = todayKey.split("-").map(Number);
  const maxMonth = shiftMonth(todayYear, todayMonth, 3);
  const lastKey = toKey(maxMonth.year, maxMonth.month, new Date(maxMonth.year, maxMonth.month, 0).getDate());

  const [who, setWho] = useState<FounderId>("noga");
  const [cursor, setCursor] = useState({ year: todayYear, month: todayMonth });
  const [selected, setSelected] = useState(todayKey);
  const [repeat, setRepeat] = useState<Repeat>("once");
  const [customDays, setCustomDays] = useState<Weekday[]>([]);
  const [hours, setHours] = useState(initial);
  const [pending, setPending] = useState(false);

  const selectedDate = useMemo(() => dateFromKey(selected), [selected]);
  const selectedWeekday = weekdayInNy(selectedDate);
  const selectedLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: CONSULTATION_TIME_ZONE,
  }).format(selectedDate);
  const weekdayLong = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: CONSULTATION_TIME_ZONE,
  }).format(selectedDate);

  const blanks = WEEKDAYS.indexOf(weekdayInNy(zonedConsultationDate(cursor.year, cursor.month, 1, 12)));
  const lastDay = new Date(cursor.year, cursor.month, 0).getDate();
  const canPrev = cursor.year > todayYear || cursor.month > todayMonth;
  const canNext = cursor.year < maxMonth.year || cursor.month < maxMonth.month;

  async function save(next: FounderAvailability) {
    setPending(true);
    const response = await fetch("/api/admin/consultation-hours", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours: next }),
    });
    const data = (await response.json()) as { hours?: FounderAvailability };
    setPending(false);
    if (response.ok && data.hours) setHours(data.hours);
  }

  function hoursOn(key: string) {
    return effectiveHoursForFounder(dateFromKey(key), hours.weekly[who], hours.dates[who]);
  }

  function matchingKeys() {
    if (repeat === "once") return [selected];
    const keys: string[] = [];
    for (let offset = 0; ; offset += 1) {
      const key = addDays(selected, offset);
      if (key > lastKey) break;
      if (key < todayKey) continue;
      const weekday = weekdayInNy(dateFromKey(key));
      if (repeat === "weekly" && weekday === selectedWeekday) keys.push(key);
      if (repeat === "weekdays" && weekday !== "Sat" && weekday !== "Sun") keys.push(key);
      if (repeat === "custom" && customDays.includes(weekday)) keys.push(key);
    }
    return keys.length ? keys : [selected];
  }

  function toggle(hour: number, minute: number) {
    if (selected < todayKey) return;
    const turningOn = !hoursOn(selected).some((slot) => slot.hour === hour && slot.minute === minute);
    const dates: Record<string, ConsultationDayHours> = {};
    for (const key of matchingKeys()) {
      const current = hoursOn(key);
      const exists = current.some((slot) => slot.hour === hour && slot.minute === minute);
      if (turningOn && exists) {
        dates[key] = current;
        continue;
      }
      if (!turningOn && !exists) {
        dates[key] = current;
        continue;
      }
      dates[key] = turningOn
        ? [...current, { hour, minute }].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
        : current.filter((slot) => slot.hour !== hour || slot.minute !== minute);
    }
    const next: FounderAvailability = {
      ...hours,
      dates: {
        ...hours.dates,
        [who]: { ...hours.dates[who], ...dates },
      },
    };
    setHours(next);
    void save(next);
  }

  const weekEmpty = Array.from({ length: 7 }, (_, index) => {
    const sunday = addDays(selected, -WEEKDAYS.indexOf(selectedWeekday));
    return hoursOn(addDays(sunday, index)).length > 0;
  }).every((open) => !open);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {FOUNDERS.map((founder) => (
          <button
            key={founder.id}
            type="button"
            onClick={() => setWho(founder.id)}
            className={`rounded-full py-2.5 text-sm font-semibold outline-none ${
              who === founder.id ? "bg-[var(--ink)] text-white" : "bg-[var(--background)] text-[var(--ink)]"
            }`}
          >
            {founder.name}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-[var(--muted)]">
        {weekEmpty ? "This week is empty. Tap the times you can take." : "Tap a day, then the times you can take."}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => setCursor(shiftMonth(cursor.year, cursor.month, -1))}
          className="rounded-full px-3 py-1 text-sm text-[var(--ink)] disabled:text-[var(--muted)]"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-[var(--ink)]">{monthTitle(cursor.year, cursor.month)}</p>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => setCursor(shiftMonth(cursor.year, cursor.month, 1))}
          className="rounded-full px-3 py-1 text-sm text-[var(--ink)] disabled:text-[var(--muted)]"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-[11px] text-[var(--muted)]">
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7">
        {Array.from({ length: blanks }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {Array.from({ length: lastDay }, (_, index) => {
          const day = index + 1;
          const key = toKey(cursor.year, cursor.month, day);
          const past = key < todayKey;
          const selectedDay = key === selected;
          const open = hoursOn(key).length > 0;
          return (
            <button
              key={key}
              type="button"
              disabled={past}
              onClick={() => setSelected(key)}
              className={`flex h-11 flex-col items-center justify-center rounded-2xl text-sm outline-none ${
                selectedDay
                  ? "bg-[var(--ink)] text-white"
                  : past
                    ? "text-[var(--muted)]/50"
                    : "text-[var(--ink)]"
              }`}
            >
              {day}
              <span
                className={`mt-0.5 h-1 w-1 rounded-full ${
                  open ? (selectedDay ? "bg-white" : "bg-[var(--accent)]") : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-sm font-semibold text-[var(--ink)]">{selectedLabel}</p>
      <label className="mt-1 block">
        <span className="sr-only">Repeat</span>
        <select
          value={repeat}
          onChange={(event) => {
            const next = event.target.value as Repeat;
            setRepeat(next);
            if (next === "custom" && customDays.length === 0) setCustomDays([selectedWeekday]);
          }}
          className="w-full bg-transparent py-1 text-sm text-[var(--muted)] outline-none"
        >
          <option value="once">Does not repeat</option>
          <option value="weekly">Weekly on {weekdayLong}</option>
          <option value="weekdays">Every weekday (Monday to Friday)</option>
          <option value="custom">Custom…</option>
        </select>
      </label>

      {repeat === "custom" ? (
        <div className="mt-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => {
            const on = customDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() =>
                  setCustomDays((current) =>
                    current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
                  )
                }
                className={`rounded-full py-1.5 text-xs font-semibold ${
                  on ? "bg-[var(--ink)] text-white" : "bg-[var(--background)] text-[var(--ink)]"
                }`}
              >
                {day.slice(0, 1)}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-2">
        {SIMPLE_HOUR_TIMES.map((slot, index) => {
          const on = hoursOn(selected).some((item) => item.hour === slot.hour && item.minute === slot.minute);
          return (
            <button
              key={`${who}-${selected}-${slot.hour}`}
              type="button"
              disabled={pending || selected < todayKey}
              aria-pressed={on}
              onClick={() => toggle(slot.hour, slot.minute)}
              className={`flex h-12 w-full items-center justify-between outline-none ${
                index > 0 ? "border-t border-[var(--line)]" : ""
              } ${on ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}
            >
              <span className="text-base">{hourLabel(slot.hour)}</span>
              <span
                className={`h-5 w-5 rounded-full border ${
                  on ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--line)] bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
