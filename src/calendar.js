(() => {
    const {
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
        isPastEvent
    } = window.CalendarUtils;

    const {
        getCalendarTemplate,
        getEventIndexTemplate,
        getEventListTemplate
    } = window.CalendarTemplates;

    // Builds the initial reactive state for the calendar app.
    const getInitialState = () => {
        const events = getCalendarEvents();
        const years = [...new Set(events.map(event => {
            const start = parseLocalDateTime(event.start);

            return start ? start.getFullYear() : null;
        }).filter(Boolean))].sort((a, b) => a - b);
        const pacific = getPacificTodayParts();
        const currentYear = pacific.year;
        const currentMonthIndex = pacific.month - 1;
        const activeYears = years.length ? years : [currentYear];
        const activeYear = activeYears.includes(currentYear) ? currentYear : activeYears[0];

        return {
            events,
            years: activeYears,
            activeYear,
            activeMonthIndex: activeYear === currentYear ? currentMonthIndex : 0,
            todayDateKey: getPacificTodayKey(),
            modalDateKey: null,
            isDayModalOpen: false,
            modalDateKey: null,
            modalEvents: [],
            showNextYearEvents: false,
            showRecurringEvents: true,
            showHolidayEvents: true
        };
    };

    // Creates the Petite Vue calendar view model.
    const calendarApp = () => {
        const initial = getInitialState();

        return {
            monthNames,
            dayNames,
            events: initial.events,
            years: initial.years,
            activeYear: initial.activeYear,
            activeMonthIndex: initial.activeMonthIndex,
            todayDateKey: initial.todayDateKey,
            modalDateKey: initial.modalDateKey,
            isDayModalOpen: initial.isDayModalOpen,
            showNextYearEvents: initial.showNextYearEvents,
            showRecurringEvents: initial.showRecurringEvents,
            showHolidayEvents: initial.showHolidayEvents,

            get currentYearIndex() {
                return this.years.indexOf(this.activeYear);
            },

            get isFirstAvailableMonth() {
                return this.currentYearIndex === 0 &&
                    this.activeMonthIndex === 0;
            },

            get isLastAvailableMonth() {
                return this.currentYearIndex === this.years.length - 1 &&
                    this.activeMonthIndex === 11;
            },

            get canGoToToday() {
                return this.years.includes(
                    parseInt(this.todayDateKey.slice(0, 4), 10)
                );
            },

            get upcomingEventIndex() {
                const todayKey = getPacificTodayKey();
                const currentYear = getPacificTodayParts().year;

                return (this.events || [])
                    .filter(event => {
                        const start = parseLocalDateTime(event.start);

                        return start &&
                            start.getFullYear() === currentYear &&
                            getEventDateKey(event) >= todayKey &&
                            isPublicEvent(event);
                    })
                    .sort((a, b) => {
                        return parseLocalDateTime(a.start) - parseLocalDateTime(b.start);
                    });
            },        

            get visibleCalendarCells() {
                const cells = [];
                const firstDay = new Date(
                    this.activeYear,
                    this.activeMonthIndex,
                    1
                ).getDay();
                const daysInMonth = new Date(
                    this.activeYear,
                    this.activeMonthIndex + 1,
                    0
                ).getDate();

                for (let i = 0; i < firstDay; i++) {
                    cells.push(
                        this.getEmptyCalendarCell(`empty-start-${i}`)
                    );
                }

                for (let day = 1; day <= daysInMonth; day++) {
                    cells.push(this.getCalendarDayCell(day));
                }

                const remainingCells = cells.length % 7 === 0
                    ? 0
                    : 7 - (cells.length % 7);

                for (let i = 0; i < remainingCells; i++) {
                    cells.push(
                        this.getEmptyCalendarCell(`empty-end-${i}`)
                    );
                }

                return cells;
            },

            get filteredEvents() {
                return this.events.filter(event => {
                    if (!this.showRecurringEvents && event.isRecurring) {
                        return false;
                    }

                    if (
                        !this.showHolidayEvents &&
                        this.isHolidayEvent(event)
                    ) {
                        return false;
                    }

                    return true;
                });
            },            

            get thisMonthLabel() {
                return this.getRelativeMonthInfo(0).label;
            },

            get nextMonthLabel() {
                return this.getRelativeMonthInfo(1).label;
            },

            get thisMonthEvents() {
                const month = this.getRelativeMonthInfo(0);

                return this.getEventsForMonth(
                    month.year,
                    month.monthIndex
                );
            },

            get nextMonthEvents() {
                const month = this.getRelativeMonthInfo(1);

                return this.getEventsForMonth(
                    month.year,
                    month.monthIndex
                );
            },

            get scheduleCurrentYear() {
                return getPacificTodayParts().year;
            },

            get scheduleNextYear() {
                const currentYear = this.scheduleCurrentYear;

                return this.years.find(year => year > currentYear) || null;
            },

            get laterMonthGroups() {
                const firstLaterMonth = this.getRelativeMonthInfo(2);

                return this.getMonthGroups({
                    startYear: firstLaterMonth.year,
                    startMonthIndex: firstLaterMonth.monthIndex,
                    endYear: this.scheduleCurrentYear
                });
            },

            get nextYearMonthGroups() {
                if (!this.scheduleNextYear) return [];

                return this.getMonthGroups({
                    startYear: this.scheduleNextYear,
                    startMonthIndex: 0,
                    endYear: this.scheduleNextYear
                });
            },

            get hasNextYearEvents() {
                return this.nextYearMonthGroups.length > 0;
            },

            // Gets every public event for the selected year in chronological order.
            get eventIndex() {
                return (this.events || [])
                    .filter(event => {
                        const start = parseLocalDateTime(event.start);

                        return start &&
                            start.getFullYear() === this.activeYear &&
                            isPublicEvent(event);
                    })
                    .sort((a, b) => {
                        return parseLocalDateTime(a.start) - parseLocalDateTime(b.start);
                    });
            },

            get modalEvents() {
                if (!this.modalDateKey) return [];

                return this.filteredEvents
                    .filter(event => {
                        return getEventDateKey(event) ===
                            this.modalDateKey;
                    })
                    .sort((a, b) => {
                        return parseLocalDateTime(a.start) -
                            parseLocalDateTime(b.start);
                    });
            },

            get modalDateLabel() {
                return this.modalDateKey
                    ? formatDateKey(this.modalDateKey)
                    : '';
            },

            getCategory,
            isPastEvent,
            formatEventDate,
            formatEventDateParts,

            // Gets the abbreviated month for an event-index entry.
            formatEventIndexMonth(event) {
                const start = parseLocalDateTime(event.start);

                return start
                    ? start.toLocaleDateString('en-US', { month: 'short' })
                    : '';
            },

            // Gets the day number for an event-index entry.
            formatEventIndexDay(event) {
                const start = parseLocalDateTime(event.start);

                return start ? start.getDate() : '';
            },

            // Gets the month accent for an event-index entry.
            getEventIndexMonthAccent(event) {
                const start = parseLocalDateTime(event.start);

                return start
                    ? this.getMonthAccent(start.getMonth())
                    : {};
            },            

            // Scrolls from the alphabetical index to the corresponding event card.
            scrollToEvent(event) {
                const target = document.getElementById(`event-${event.id}`);

                if (!target) return;

                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                history.replaceState(null, '', `#event-${event.id}`);

                target.classList.remove('event-card-highlight');

                requestAnimationFrame(() => {
                    target.classList.add('event-card-highlight');
                });

                window.setTimeout(() => {
                    target.classList.remove('event-card-highlight');
                }, 1800);
            },

            // Formats the date shown before an event-index title.
            formatEventIndexDate(event) {
                const start = parseLocalDateTime(event.start);

                if (!start) return '';

                return start.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            },           

            // Builds an empty calendar grid cell.
            getEmptyCalendarCell(key) {
                return {
                    key,
                    day: null,
                    dateKey: '',
                    events: [],
                    visibleEvents: [],
                    hiddenEventCount: 0,
                    classes: 'calendar-day calendar-day-empty'
                };
            },

            // Estimates how many calendar rows a chip needs for its label.
            getCalendarChipRowSpan(event) {
                if (window.matchMedia('(max-width: 640px)').matches) {
                    return 1;
                }

                const label = event.calendarLabel || event.title || '';

                if (event.calendarRowSpan) {
                    return Math.max(1, Math.min(4, Number(event.calendarRowSpan)));
                }

                if (label.length > 80) return 3;
                if (label.length > 30) return 2;

                return 1;
            },            

            // Assigns events to the four available calendar-day slots.
            getCalendarEventLayout(events) {
                const visibleEvents = [];
                let nextSlot = 1;

                for (const event of events) {
                    const rowOffset = Math.max(
                        0,
                        Math.min(3, Number(event.calendarRowOffset) || 0)
                    );

                    const slot = nextSlot + rowOffset;

                    if (slot > 4) break;

                    visibleEvents.push({
                        event,
                        slot
                    });

                    nextSlot = slot + 1;
                }

                return {
                    visibleEvents,
                    hiddenEventCount: events.length - visibleEvents.length
                };
            },     

            // Builds a populated calendar day cell.
            getCalendarDayCell(day) {
                const dateKey = `${this.activeYear}-${String(this.activeMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const events = this.getEventsForDate(
                    this.activeYear,
                    this.activeMonthIndex,
                    day
                );

                const {
                    visibleEvents,
                    hiddenEventCount
                } = this.getCalendarEventLayout(events);

                return {
                    key: dateKey,
                    day,
                    dateKey,
                    events,
                    visibleEvents,
                    hiddenEventCount,
                    classes: [
                        'calendar-day',
                        events.length ? 'calendar-day-has-events' : '',
                        this.todayDateKey === dateKey ? 'calendar-day-today' : ''
                    ].filter(Boolean).join(' ')
                };
            },

            // Gets information for a month relative to the current Pacific month.
            getRelativeMonthInfo(offset) {
                const pacific = getPacificTodayParts();
                const date = new Date(
                    pacific.year,
                    pacific.month - 1 + offset,
                    1
                );

                return {
                    year: date.getFullYear(),
                    monthIndex: date.getMonth(),
                    label: date.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    })
                };
            },
            // Rebuilds an rgba color using the requested opacity.
            setColorAlpha(color, alpha) {
                const values = String(color).match(/[\d.]+/g);

                if (!values || values.length < 3) {
                    return color;
                }

                return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
            },

            // Gets the seasonal accent color for a month index.
            getMonthAccent(monthIndex) {
                const accents = [
                    'rgb(37, 99, 235)',    // January — clear winter blue
                    'rgb(219, 39, 119)',   // February — vivid camellia pink
                    'rgb(22, 163, 74)',    // March — bright spring green
                    'rgb(124, 58, 237)',   // April — jacaranda violet
                    'rgb(5, 150, 105)',    // May — saturated eucalyptus
                    'rgb(2, 132, 199)',    // June — coastal sky blue
                    'rgb(234, 179, 8)',    // July — strong sunshine yellow
                    'rgb(234, 88, 12)',    // August — hot orange
                    'rgb(202, 138, 4)',    // September — golden chaparral
                    'rgb(220, 38, 38)',    // October — vivid sunset red
                    'rgb(180, 83, 9)',     // November — warm copper
                    'rgb(21, 128, 61)'     // December — rich evergreen
                ];

                return accents[monthIndex] || accents[0];
            },

            // Adds a restrained seasonal accent to later-month headings.
            getContinuingMonthHeadingStyle(event) {
                const start = event ? parseLocalDateTime(event.start) : null;

                if (!start) {
                    return {};
                }

                const accent = this.getMonthAccent(start.getMonth());

                return {
                    borderBottomColor: this.setColorAlpha(accent, 0.65),
                    background: `
			linear-gradient(
				0deg,
				${this.setColorAlpha(accent, 0.12)} 0%,
				rgba(255, 255, 255, 0) 45%
			)
		`
                };
            },

            // Builds the seasonal top-right gradient for a featured month.
            getMonthHeaderStyle(offset) {
                const month = this.getRelativeMonthInfo(offset);
                const accent = this.getMonthAccent(month.monthIndex);

                return {
                    background: `
			radial-gradient(
				circle at 100% 0%,
				${this.setColorAlpha(accent, 0.48)} 0%,
				${this.setColorAlpha(accent, 0.16)} 32%,
				rgba(255, 255, 255, 0) 68%
			),
			#fff
		`
                };
            },

            // Applies month-specific colors to an event date button.
            getEventDateStyle(event) {
                const start = parseLocalDateTime(event.start);

                if (!start) {
                    return {};
                }

                const end = parseLocalDateTime(event.end);
                const startAccent = this.getMonthAccent(start.getMonth());
                const spansMultipleMonths = Boolean(
                    end &&
                    (
                        start.getFullYear() !== end.getFullYear() ||
                        start.getMonth() !== end.getMonth()
                    )
                );

                if (spansMultipleMonths) {
                    const endAccent = this.getMonthAccent(end.getMonth());

                    return {
                        background: `
				radial-gradient(
					circle at 0% 0%,
					${this.setColorAlpha(startAccent, 0.26)} 0%,
					${this.setColorAlpha(startAccent, 0.10)} 34%,
					rgba(255, 255, 255, 0) 62%
				),
				radial-gradient(
					circle at 100% 100%,
					${this.setColorAlpha(endAccent, 0.26)} 0%,
					${this.setColorAlpha(endAccent, 0.10)} 34%,
					rgba(255, 255, 255, 0) 62%
				),
				linear-gradient(
					145deg,
					rgba(255, 255, 255, 0.98) 0%,
					rgba(255, 255, 255, 0.94) 100%
				)
			`,
                        borderColor: this.setColorAlpha(startAccent, 0.28),
                        boxShadow: `inset 0 0 0 1px ${this.setColorAlpha(endAccent, 0.12)}`
                    };
                }

                return {
                    background: `
			linear-gradient(
				145deg,
				${this.setColorAlpha(startAccent, 0.18)} 0%,
				${this.setColorAlpha(startAccent, 0.07)} 58%,
				rgba(255, 255, 255, 0.96) 100%
			)
		`,
                    borderColor: this.setColorAlpha(startAccent, 0.32)
                };
            },

            // Groups events chronologically by month within a restricted year range.
            getMonthGroups({
                startYear,
                startMonthIndex,
                endYear
            }) {
                const groups = new Map();
                const startDate = new Date(
                    startYear,
                    startMonthIndex,
                    1
                );
                const endDate = new Date(
                    endYear,
                    11,
                    31,
                    23,
                    59,
                    59
                );

                this.filteredEvents.forEach(event => {
                    const start = parseLocalDateTime(event.start);

                    if (
                        !start ||
                        start < startDate ||
                        start > endDate
                    ) {
                        return;
                    }

                    const key = `${start.getFullYear()}-${String(
                        start.getMonth() + 1
                    ).padStart(2, '0')}`;

                    if (!groups.has(key)) {
                        groups.set(key, {
                            key,
                            label: start.toLocaleDateString(
                                'en-US',
                                {
                                    month: 'long',
                                    year: 'numeric'
                                }
                            ),
                            events: []
                        });
                    }

                    groups.get(key).events.push(event);
                });

                return [...groups.values()].map(group => ({
                    ...group,
                    events: group.events.sort((a, b) => {
                        return parseLocalDateTime(a.start) -
                            parseLocalDateTime(b.start);
                    })
                }));
            },

            // Gets visible events for one calendar month.
            getEventsForMonth(year, monthIndex) {
                return this.filteredEvents
                    .filter(event => {
                        const start = parseLocalDateTime(event.start);

                        return start &&
                            start.getFullYear() === year &&
                            start.getMonth() === monthIndex;
                    })
                    .sort((a, b) => {
                        return parseLocalDateTime(a.start) -
                            parseLocalDateTime(b.start);
                    });
            },

            // Gets visible events for one calendar date.
            getEventsForDate(year, monthIndex, day) {
                return this.filteredEvents
                    .filter(event => {
                        const start = parseLocalDateTime(event.start);

                        return start &&
                            start.getFullYear() === year &&
                            start.getMonth() === monthIndex &&
                            start.getDate() === day;
                    })
                    .sort((a, b) => {
                        return parseLocalDateTime(a.start) -
                            parseLocalDateTime(b.start);
                    });
            },

            // Treats public list events as major and meetings or holidays as minor.
            isMajorEvent(event) {
                return isPublicEvent(event);
            },

            // Checks whether an event has begun but has not yet ended.
            isEventInProgress(event) {
                const start = parseLocalDateTime(event.start);
                const end = parseLocalDateTime(event.end);
                const now = new Date();

                if (!start || now < start) return false;

                if (end) {
                    return now <= end;
                }

                return getEventDateKey(event) === this.todayDateKey;
            },        

            // Formats a single event date for the compact mobile date rail.
            formatEventMobileDateParts(event) {
                const start = event ? parseLocalDateTime(event.start) : null;

                if (!start) {
                    return {
                        weekday: '',
                        month: '',
                        day: ''
                    };
                }

                return {
                    weekday: start.toLocaleDateString('en-US', {
                        weekday: 'long'
                    }),
                    month: start.toLocaleDateString('en-US', {
                        month: 'long'
                    }),
                    day: start.getDate()
                };
            },            

            // Formats the remaining calendar days for an event already in progress.
            getEventTimeRemainingLabel(event) {
                const end = parseLocalDateTime(event.end);

                if (!end) {
                    return 'This event is happening now!';
                }

                const today = parseLocalDateTime(
                    `${this.todayDateKey}T00:00:00`
                );
                const endDate = new Date(
                    end.getFullYear(),
                    end.getMonth(),
                    end.getDate()
                );
                const millisecondsPerDay = 24 * 60 * 60 * 1000;
                const daysLeft = Math.ceil(
                    (endDate - today) / millisecondsPerDay
                );

                if (daysLeft <= 0) {
                    return 'Last day of this event';
                }

                if (daysLeft === 1) {
                    return '1 day left on this event';
                }

                return `${daysLeft} days left on this event`;
            },            

            // Builds the class list for an event chip.
            getChipClass(event) {
                const category = getCategory(event.category);

                return [
                    'calendar-chip',
                    category.badgeClass,
                    this.isMajorEvent(event)
                        ? ''
                        : 'calendar-chip-muted'
                ].filter(Boolean).join(' ');
            },

            // Builds the class list for a major event card.
            getMajorEventClass(event) {
                return [
                    'event-card',
                    'event-card-with-date',
                    'major-event-card',
                    isPastEvent(event)
                        ? 'event-card-past'
                        : ''
                ].filter(Boolean).join(' ');
            },

            // Builds the class list for a compact minor event row.
            getMinorEventClass(event) {
                return [
                    'minor-event-card',
                    isPastEvent(event)
                        ? 'minor-event-card-past'
                        : ''
                ].filter(Boolean).join(' ');
            },

            // Gets valid links for a major event card.
            getVisibleLinks(event) {
                return (event.links || []).filter(link => {
                    return link &&
                        link.href &&
                        link.label;
                });
            },

            // Checks whether a major event card should show action links.
            shouldShowLinks(event) {
                return !isPastEvent(event) &&
                    this.getVisibleLinks(event).length;
            },

            // Formats the month and year represented by an event.
            formatMonthYearForEvent(event) {
                const start = parseLocalDateTime(event.start);

                return start
                    ? start.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    })
                    : '';
            },

            // Builds the accessible label for a clickable calendar day.
            getDayAriaLabel(cell) {
                const count = cell.events.length;
                const eventLabel = count === 1
                    ? '1 event'
                    : `${count} events`;

                return `Open ${eventLabel} for ${formatDateKey(
                    cell.dateKey
                )}`;
            },

            // Moves the calendar to a month index, crossing year boundaries if needed.
            goToMonth(monthIndex) {
                const currentYearIndex = this.years.indexOf(
                    this.activeYear
                );

                if (monthIndex < 0 && currentYearIndex > 0) {
                    this.activeYear =
                        this.years[currentYearIndex - 1];
                    this.activeMonthIndex = 11;
                } else if (
                    monthIndex > 11 &&
                    currentYearIndex < this.years.length - 1
                ) {
                    this.activeYear =
                        this.years[currentYearIndex + 1];
                    this.activeMonthIndex = 0;
                } else {
                    this.activeMonthIndex = Math.min(
                        11,
                        Math.max(0, monthIndex)
                    );
                }

                this.closeDayModal();
            },

            // Moves to the previous month.
            previousMonth() {
                this.goToMonth(this.activeMonthIndex - 1);
            },

            // Moves to the next month.
            nextMonth() {
                this.goToMonth(this.activeMonthIndex + 1);
            },

            // Keeps the current month when the year dropdown changes.
            changeYear() {
                this.closeDayModal();
            },

            // Returns the calendar to the current Pacific month.
            goToToday() {
                const [year, month] = this.todayDateKey
                    .split('-')
                    .map(Number);

                if (!this.years.includes(year)) return;

                this.activeYear = year;
                this.activeMonthIndex = month - 1;
                this.closeDayModal();
            },

            // Moves the calendar to an event's month without filtering the schedule below.
            goToEventMonth(event) {
                const start = parseLocalDateTime(event.start);

                if (
                    !start ||
                    !this.years.includes(start.getFullYear())
                ) {
                    return;
                }

                this.activeYear = start.getFullYear();
                this.activeMonthIndex = start.getMonth();
                this.closeDayModal();

                requestAnimationFrame(() => {
                    document
                        .getElementById('calendar-grid')
                        ?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                });
            },

            // Reveals the next available calendar year.
            showNextYear() {
                this.showNextYearEvents = true;
            },

            // Checks whether an event is a holiday or general observance.
            isHolidayEvent(event) {
                return [
                    'federal-holiday',
                    'california-holiday',
                    'observance'
                ].includes(event.category);
            },

            // Checks whether an event should appear in the continuing schedule.
            shouldShowContinuingEvent(event) {
                if (!this.showRecurringEvents && event.isRecurring) {
                    return false;
                }

                if (!this.showHolidayEvents && this.isHolidayEvent(event)) {
                    return false;
                }

                return true;
            }, 
            
            // Opens the calendar modal for an indexed event's date.
            openEventIndexModal(event) {
                const dateKey = getEventDateKey(event);
                const events = (this.events || [])
                    .filter(item => getEventDateKey(item) === dateKey);

                if (!events.length) return;

                this.openDayModal({
                    key: dateKey,
                    day: parseLocalDateTime(event.start).getDate(),
                    dateKey,
                    events
                });
            },         

            // Opens the day modal from an event card's date button.
            openEventDayModal(event) {
                const start = event ? parseLocalDateTime(event.start) : null;

                if (!start) {
                    return;
                }

                const dateKey = getEventDateKey(event);
                const events = this.getEventsForDate(
                    start.getFullYear(),
                    start.getMonth(),
                    start.getDate()
                );

                this.openDayModal({
                    dateKey,
                    events
                });
            },

            // Opens the event-details modal for a populated calendar day.
            openDayModal(cell) {
                if (!cell || !cell.events || !cell.events.length) {
                    return;
                }

                this.modalDateKey = cell.dateKey;
                this.modalEvents = cell.events;
                this.isDayModalOpen = true;

                document.body.classList.add('calendar-modal-open');

                requestAnimationFrame(() => {
                    document.getElementById('calendar-day-modal-close')?.focus();
                });
            },

            // Opens a populated calendar day with the keyboard.
            handleDayKeydown(cell, event) {
                if (!cell.events.length) {
                    return;
                }

                if (event.key !== 'Enter' && event.key !== ' ') {
                    return;
                }

                event.preventDefault();
                this.openDayModal(cell);
            },

            // Closes the event-details modal.
            closeDayModal() {
                this.isDayModalOpen = false;
                this.modalDateKey = null;
                this.modalEvents = [];

                document.body.classList.remove('calendar-modal-open');
            },

            // Closes the modal when its backdrop itself is clicked.
            handleModalBackdrop(event) {
                if (event.target === event.currentTarget) {
                    this.closeDayModal();
                }
            },

            // Provides Escape-key handling inside the modal.
            handleModalKeydown(event) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    this.closeDayModal();
                }
            },
        };
    };

    // Closes the mobile nav after selecting a mobile nav link.
    const initMobileNavClose = () => {
        document
            .querySelectorAll('.nav-mobile a')
            .forEach(link => {
                link.addEventListener('click', () => {
                    const checkbox =
                        document.getElementById('nav-check');

                    if (checkbox) {
                        checkbox.checked = false;
                    }
                });
            });
    };

    // Injects the Petite Vue templates into the static calendar placeholders.
    const setCalendarTemplates = () => {
        const templateTargets = [
            ['calendar-grid', getCalendarTemplate],
            ['event-list', getEventIndexTemplate],
            ['calendar-list', getEventListTemplate]
        ];

        templateTargets.forEach(([id, getTemplate]) => {
            const target = document.getElementById(id);

            if (target) {
                target.innerHTML = getTemplate();
            }
        });

        document
            .getElementById('calendar-grid')
            ?.classList.remove('calendar-grid-loading');
    };

    // Starts the Petite Vue calendar.
    const initCalendarPage = () => {
        if (typeof PetiteVue === 'undefined') {
            console.error('Petite Vue was not loaded.');
            return;
        }

        const mountRoot =
            document.querySelector('main') ||
            document.body;

        setCalendarTemplates();
        initMobileNavClose();

        mountRoot.setAttribute(
            'v-scope',
            'calendarApp()'
        );

        PetiteVue.createApp({
            calendarApp
        }).mount(mountRoot);
    };

    document.addEventListener(
        'DOMContentLoaded',
        initCalendarPage
    );
})();