import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';

import type { Event } from './types.ts';

let allEvents: Event[] = [];

window.Webflow ||= [];
window.Webflow.push(() => {
  const calendarElement = document.querySelector<HTMLDivElement>('[data-element="calendar"]');
  if (!calendarElement) return;

  allEvents = getEvents(); // store all events globally
  console.log({ allEvents });

  const calendar = new Calendar(calendarElement, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listPlugin',
    },
    events: allEvents,
    eventClick(data) {
      const { event } = data;
      const { type, slug } = event.extendedProps as { type?: string; slug?: string };
      if (type && slug) {
        window.location.href = `/${type}/${slug}`;
      } else {
        alert(`Missing type or slug for event: ${event.title}`);
      }
    },
    eventClassNames(arg) {
      const { type } = arg.event.extendedProps;
      if (type === 'event') return ['event-type-event'];
      if (type === 'meeting') return ['event-type-meeting'];
      return [];
    },
  });

  calendar.render();

  // 🔁 Filtering logic
  const filters = document.querySelectorAll<HTMLElement>('[data-filter]');
  filters.forEach((filterBtn) => {
    filterBtn.addEventListener('click', () => {
      const type = filterBtn.getAttribute('data-filter');

      const filtered = type === 'all'
        ? allEvents
        : allEvents.filter(event => event.type === type);

      calendar.removeAllEvents();
      calendar.addEventSource(filtered);

      // Optional: active class toggle
      filters.forEach((btn) => btn.classList.remove('is-active'));
      filterBtn.classList.add('is-active');
    });
  });
});

const getEvents = (): Event[] => {
  const scripts = document.querySelectorAll<HTMLScriptElement>('[data-element="event-data"]');
  const events = [...scripts].map((script) => {
    const event: Event = JSON.parse(script.textContent!);
    event.start = new Date(event.start);
    event.end = new Date(event.end);
    return event;
  });

  return events;
};
