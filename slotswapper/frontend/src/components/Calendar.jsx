import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const Calendar = ({ events, onDateClick, onEventClick, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  // Generate calendar grid
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const dayEvents = events.filter(event => 
        isSameDay(new Date(event.startTime), day)
      );

      days.push(
        <div
          className={`calendar-day ${!isSameMonth(day, monthStart) ? 'disabled' : ''} ${isSameDay(day, selectedDate) ? 'selected' : ''} ${isSameDay(day, new Date()) ? 'today' : ''}`}
          key={day}
          onClick={() => onDateClick(cloneDay)}
        >
          <span className="day-number">{formattedDate}</span>
          <div className="day-events">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={event._id}
                className={`event-dot ${event.status.toLowerCase()}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
                title={event.title}
              >
                {event.title.length > 12 ? event.title.substring(0, 12) + '...' : event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="more-events">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="calendar-row" key={day}>
        {days}
      </div>
    );
    days = [];
  }

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="calendar-container glass-card">
      <div className="calendar-header">
        <button className="glass-button nav-btn" onClick={prevMonth}>
          ◀
        </button>
        <h2 className="month-year">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button className="glass-button nav-btn" onClick={nextMonth}>
          ▶
        </button>
      </div>
      
      <div className="calendar-days-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="day-header">{day}</div>
        ))}
      </div>
      
      <div className="calendar-body">
        {rows}
      </div>
    </div>
  );
};

export default Calendar;