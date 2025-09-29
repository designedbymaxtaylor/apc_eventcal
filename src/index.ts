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
    eventDidMount: function (info) {
      const tooltip = document.createElement('div');
  tooltip.className = 'fc-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.padding = '8px';
  tooltip.style.background = 'white';
  tooltip.style.border = '1px solid #ccc';
  tooltip.style.borderRadius = '4px';
  tooltip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  tooltip.style.zIndex = '9999';
  tooltip.style.display = 'none';

  // Format date/time
  const { start, end } = info.event;
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };

  let dateRange = '';
  if (start && (!end || isNaN(end.getTime()))) {
    // Only show start date/time
    dateRange = `${start.toLocaleDateString(undefined, dateOptions)} ${start.toLocaleTimeString(undefined, timeOptions)}`;
  } else if (start && end) {
    const sameDay = start.toDateString() === end.toDateString();
    if (sameDay) {
      dateRange = `${start.toLocaleDateString(undefined, dateOptions)} ${start.toLocaleTimeString(undefined, timeOptions)} – ${end.toLocaleTimeString(undefined, timeOptions)}`;
    } else {
      dateRange = `${start.toLocaleDateString(undefined, dateOptions)} – ${end.toLocaleDateString(undefined, dateOptions)}`;
    }
  }

  tooltip.innerHTML = `
    <strong>${info.event.title}</strong><br>
    ${dateRange}<br>
    ${info.event.extendedProps.location || ''}
  `;
  document.body.appendChild(tooltip);

      info.el.addEventListener('mouseenter', (e) => {
        tooltip.style.display = 'block';
        tooltip.style.top = `${e.pageY + 10}px`;
        tooltip.style.left = `${e.pageX + 10}px`;
      });

      info.el.addEventListener('mousemove', (e) => {
        tooltip.style.top = `${e.pageY + 10}px`;
        tooltip.style.left = `${e.pageX + 10}px`;
      });

      info.el.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    },
  });

  calendar.render();

  // 🔁 Filtering logic
  const filters = document.querySelectorAll<HTMLElement>('[data-filter]');
  filters.forEach((filterBtn) => {
    filterBtn.addEventListener('click', () => {
      const type = filterBtn.getAttribute('data-filter');

      const filtered =
        type === 'all' ? allEvents : allEvents.filter((event) => event.type === type);

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
    if (event.end) {
      const endDate = new Date(event.end);
      if (isNaN(endDate.getTime())) {
        delete event.end;
      } else {
        event.end = endDate;
      }
    } else {
      delete event.end;
    }
    return event;
  });

  return events;
};
