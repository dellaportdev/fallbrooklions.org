const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const defaultCategory = {
    id: 'general',
    label: 'Event',
    icon: 'fa-calendar-days',
    badgeClass: 'bg-gray-100 text-gray-800 border-gray-200'
};

const timeOptions = {
    hour: 'numeric',
    minute: '2-digit'
};

// Parses local date/time strings without UTC conversion.
const parseLocalDateTime = value => {
    if (!value) return null;

    const [dateValue, timeValue = '00:00:00'] = value.split('T');
    const [year, month, day] = dateValue.split('-').map(Number);
    const [hour = 0, minute = 0, second = 0] = timeValue.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second);
};

// Converts a Date object to YYYY-MM-DD.
const getDateKey = date => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// Gets the YYYY-MM-DD key from a calendar event.
const getEventDateKey = event => getDateKey(parseLocalDateTime(event.start));

// Gets the current Pacific date parts.
const getPacificTodayParts = () => {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    }).formatToParts(new Date()).reduce((parts, part) => {
        if (part.type !== 'literal') {
            parts[part.type] = parseInt(part.value, 10);
        }

        return parts;
    }, {});
};

// Gets today as YYYY-MM-DD in Pacific time.
const getPacificTodayKey = () => {
    const today = getPacificTodayParts();

    return `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
};

// Formats YYYY-MM-DD as a readable date.
const formatDateKey = dateKey => {
    const date = parseLocalDateTime(`${dateKey}T00:00:00`);
    if (!date) return '';

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

// Checks whether a stored date value includes a time component.
const hasTimeComponent = value => typeof value === 'string' && value.includes('T');

// Formats a time without displaying unnecessary :00 minutes.
const formatTime = date => date
    ? date.toLocaleTimeString('en-US', timeOptions).replace(':00', '')
    : '';

// Formats an event's available start or start/end time.
const formatEventTime = event => {
    const start = parseLocalDateTime(event.start);
    const end = parseLocalDateTime(event.end);

    if (!start || !hasTimeComponent(event.start)) return '';

    const startTime = formatTime(start);

    if (!end || !hasTimeComponent(event.end)) return startTime;

    return `${startTime} – ${formatTime(end)}`;
};

// Formats event date parts for the event card date rail.
const formatEventDateParts = event => {
    const start = parseLocalDateTime(event.start);

    if (!start) {
        return {
            month: '',
            day: '',
            weekday: '',
            time: ''
        };
    }

    return {
        month: start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        day: String(start.getDate()),
        weekday: start.toLocaleDateString('en-US', { weekday: 'short' }),
        time: formatEventTime(event)
    };
};

// Formats a full event date and any available time information.
const formatEventDate = event => {
    const start = parseLocalDateTime(event.start);
    if (!start) return '';

    const dateText = start.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    const timeText = formatEventTime(event);

    return timeText ? `${dateText} · ${timeText}` : dateText;
};

// Builds generated federal holiday events from the holiday date map.
const getFederalHolidayEvents = () => {
    const holidays = [];

    if (typeof federalHolidayDefinitions === 'undefined') return holidays;
    if (typeof federalHolidayDatesByYear === 'undefined') return holidays;

    const buildHolidayEvent = (year, holidayKey, date) => {
        const definition = federalHolidayDefinitions[holidayKey];

        if (!definition) return null;

        return {
            id: `${definition.slug}-${year}`,
            title: definition.title,
            category: 'holiday',
            start: `${date}T00:00:00`,
            end: `${date}T23:59:00`,
            timezone: 'America/Los_Angeles',
            summary: 'Federal holiday.',
            showInList: false
        };
    };

    Object.entries(federalHolidayDatesByYear).forEach(([year, dates]) => {
        Object.entries(dates).forEach(([holidayKey, date]) => {
            const holiday = buildHolidayEvent(year, holidayKey, date);

            if (holiday) {
                holidays.push(holiday);
            }
        });
    });

    return holidays;
};

// Builds all recurring, single, and holiday events into one sorted array.
const getCalendarEvents = () => {
    const recurringEvents = [];

    const buildRecurringEvent = (set, date) => ({
        id: `${set.id}-${date}`,
        title: set.title,
        category: set.category,
        start: `${date}T${set.startTime}:00`,
        end: `${date}T${set.endTime}:00`,
        timezone: set.timezone,
        summary: set.summary,
        locationName: set.locationName,
        locationAddress: set.locationAddress,
        room: set.room,
        links: set.links || []
    });

    if (typeof calendarRecurringEventSets !== 'undefined') {
        (calendarRecurringEventSets || []).forEach(set => {
            (set.dates || []).forEach(date => {
                recurringEvents.push(buildRecurringEvent(set, date));
            });
        });
    }

    return recurringEvents
        .concat(typeof calendarSingleEvents !== 'undefined' ? calendarSingleEvents || [] : [])
        .concat(getFederalHolidayEvents())
        .sort((a, b) => parseLocalDateTime(a.start) - parseLocalDateTime(b.start));
};

// Gets a known category or the fallback category.
const getCategory = categoryId => {
    if (typeof calendarEventCategories === 'undefined') return defaultCategory;

    return (calendarEventCategories || []).find(category => category.id === categoryId) || defaultCategory;
};

// Checks whether an event belongs in the public event list.
const isPublicEvent = event => event.category !== 'meeting' && event.showInList !== false;

// Checks whether an event has already ended.
const isPastEvent = event => {
    const end = parseLocalDateTime(event.end || event.start);

    return end ? end < new Date() : false;
};

// Formats the public event count label.
const getEventCountLabel = (count, year) => count === 1
    ? `1 public event for ${year}`
    : `${count} public events for ${year}`;

window.CalendarUtils = {
    monthNames,
    dayNames,
    parseLocalDateTime,
    getEventDateKey,
    getPacificTodayParts,
    getPacificTodayKey,
    formatDateKey,
    formatEventDateParts,
    formatEventDate,
    getCalendarEvents,
    getCategory,
    isPublicEvent,
    isPastEvent,
    getEventCountLabel
};