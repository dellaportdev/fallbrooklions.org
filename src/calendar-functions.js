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

// Formats a time while keeping AM or PM attached to the numeric time.
const formatTime = date => {
    if (!date) return '';

    return date
        .toLocaleTimeString('en-US', timeOptions)
        .replace(':00', '')
        .replace(/\s+(AM|PM)$/i, '\u00A0$1');
};

// Formats an event's available start or start/end time.
const formatEventTime = event => {
    if (event.allDay) return '';

    const start = parseLocalDateTime(event.start);
    const end = parseLocalDateTime(event.end);

    if (!start || !hasTimeComponent(event.start)) return '';

    const startTime = formatTime(start);

    if (!end || !hasTimeComponent(event.end)) {
        return startTime;
    }

    return `${startTime} – ${formatTime(end)}`;
};

// Formats one date into the parts used by an event date rail.
const getEventDisplayDateParts = date => ({
    month: date.toLocaleDateString('en-US', {
        month: 'short'
    }).toUpperCase(),
    day: String(date.getDate()),
    weekday: date.toLocaleDateString('en-US', {
        weekday: 'short'
    })
});

// Formats event date parts, including a multi-day range when present.
const formatEventDateParts = event => {
    const start = parseLocalDateTime(event.start);
    const end = parseLocalDateTime(event.end);

    if (!start) {
        return {
            isRange: false,
            start: {
                month: '',
                day: '',
                weekday: ''
            },
            end: null,
            time: ''
        };
    }

    const isRange = Boolean(
        end &&
        getDateKey(start) !== getDateKey(end)
    );

    return {
        isRange,
        start: getEventDisplayDateParts(start),
        end: isRange
            ? getEventDisplayDateParts(end)
            : null,
        time: formatEventTime(event)
    };
};

// Formats a full event date or date range.
const formatEventDate = event => {
    const start = parseLocalDateTime(event.start);
    const end = parseLocalDateTime(event.end);

    if (!start) return '';

    const isRange = Boolean(
        end &&
        getDateKey(start) !== getDateKey(end)
    );
    const timeText = formatEventTime(event);
    let dateText;

    if (isRange) {
        const sameYear =
            start.getFullYear() === end.getFullYear();

        const startText = start.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: sameYear ? undefined : 'numeric'
        });

        const endText = end.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        dateText = `${startText} – ${endText}`;
    } else {
        dateText = start.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    return timeText
        ? `${dateText} · ${timeText}`
        : dateText;
};

// Formats an internal date key for holiday summaries.
const formatHolidaySummaryDate = dateKey => {
    const date = parseLocalDateTime(`${dateKey}T00:00:00`);

    return date
        ? date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
        : '';
};

// Builds official holidays, preferring the federal category when jurisdictions overlap.
const getOfficialHolidayEvents = () => {
    const holidaysByDate = new Map();

    const addHoliday = ({
        definition,
        date,
        observedDate = null,
        jurisdiction
    }) => {
        if (!definition || !date) return;

        const existing = holidaysByDate.get(date);

        if (!existing) {
            holidaysByDate.set(date, {
                definition,
                date,
                observedDate,
                jurisdictions: new Set([jurisdiction])
            });

            return;
        }

        existing.jurisdictions.add(jurisdiction);

        if (jurisdiction === 'federal') {
            existing.definition = definition;
            existing.observedDate = observedDate;
        }
    };

    if (
        typeof federalHolidayDefinitions !== 'undefined' &&
        typeof federalHolidayDatesByYear !== 'undefined'
    ) {
        Object.values(federalHolidayDatesByYear).forEach(dates => {
            Object.entries(dates).forEach(([holidayKey, holidayDate]) => {
                const definition = federalHolidayDefinitions[holidayKey];
                const dateData = typeof holidayDate === 'string'
                    ? { date: holidayDate }
                    : holidayDate;

                addHoliday({
                    definition,
                    date: dateData.date,
                    observedDate: dateData.observedDate || null,
                    jurisdiction: 'federal'
                });
            });
        });
    }

    if (
        typeof californiaStateHolidayDefinitions !== 'undefined' &&
        typeof californiaStateHolidayDatesByYear !== 'undefined'
    ) {
        Object.values(californiaStateHolidayDatesByYear).forEach(dates => {
            Object.entries(dates).forEach(([holidayKey, date]) => {
                addHoliday({
                    definition: californiaStateHolidayDefinitions[holidayKey],
                    date,
                    jurisdiction: 'california'
                });
            });
        });
    }

    return [...holidaysByDate.values()].map(holiday => {
        const isFederal = holiday.jurisdictions.has('federal');
        const isCalifornia = holiday.jurisdictions.has('california');
        const summaryParts = [];

        if (isFederal && isCalifornia) {
            summaryParts.push('Federal holiday and California state holiday.');
        } else if (isFederal) {
            summaryParts.push('Federal holiday.');
        } else {
            summaryParts.push('California state holiday.');
        }

        if (
            holiday.observedDate &&
            holiday.observedDate !== holiday.date
        ) {
            summaryParts.push(
                `Observed by most federal employees on ${formatHolidaySummaryDate(holiday.observedDate)}.`
            );
        }

        return {
            id: `official-holiday-${holiday.definition.slug}-${holiday.date}`,
            title: holiday.definition.title,
            category: isFederal
                ? 'federal-holiday'
                : 'california-holiday',
            start: `${holiday.date}T00:00:00`,
            end: `${holiday.date}T23:59:59`,
            timezone: 'America/Los_Angeles',
            summary: summaryParts.join(' '),
            allDay: true,
            showInList: false
        };
    });
};

// Builds common non-government calendar observances.
const getCalendarObservanceEvents = () => {
    const observances = [];

    if (
        typeof calendarObservanceDefinitions === 'undefined' ||
        typeof calendarObservanceDatesByYear === 'undefined'
    ) {
        return observances;
    }

    Object.values(calendarObservanceDatesByYear).forEach(dates => {
        Object.entries(dates).forEach(([observanceKey, date]) => {
            const definition =
                calendarObservanceDefinitions[observanceKey];

            if (!definition) return;

            observances.push({
                id: `observance-${definition.slug}-${date}`,
                title: definition.title,
                category: 'observance',
                start: `${date}T00:00:00`,
                end: `${date}T23:59:59`,
                timezone: 'America/Los_Angeles',
                summary: definition.summary,
                allDay: true,
                showInList: false
            });
        });
    });

    return observances;
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
        links: set.links || [],
        showInList: set.showInList,
        isRecurring: true
    });

    if (typeof calendarRecurringEventSets !== 'undefined') {
        (calendarRecurringEventSets || []).forEach(set => {
            (set.dates || []).forEach(date => {
                recurringEvents.push(buildRecurringEvent(set, date));
            });
        });
    }

    return recurringEvents
        .concat(
            typeof calendarSingleEvents !== 'undefined'
                ? calendarSingleEvents || []
                : []
        )
        .concat(getOfficialHolidayEvents())
        .concat(getCalendarObservanceEvents())
        .sort(
            (a, b) =>
                parseLocalDateTime(a.start) -
                parseLocalDateTime(b.start)
        );
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