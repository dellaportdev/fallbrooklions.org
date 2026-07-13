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
            isDayModalOpen: false
        };
    };

    // Builds the large event treatment used for major public events.
    const getMajorEventTemplate = () => `
        <article
            v-if="isMajorEvent(event)"
            :id="'event-' + event.id"
            :class="getMajorEventClass(event)"
        >
            <button
                type="button"
                class="event-date-rail"
                :aria-label="'Show ' + formatMonthYearForEvent(event) + ' on the calendar'"
                @click="goToEventMonth(event)"
            >
                <div class="event-date-rail-month">
                    {{ formatEventDateParts(event).month }}
                </div>

                <div class="event-date-rail-day">
                    {{ formatEventDateParts(event).day }}
                </div>

                <div class="event-date-rail-weekday">
                    {{ formatEventDateParts(event).weekday }}
                </div>

                <div
                    v-if="formatEventDateParts(event).time"
                    class="event-date-rail-time"
                >
                    {{ formatEventDateParts(event).time }}
                </div>
            </button>

            <div class="event-card-body">
                <div class="event-card-top">
                    <div>
                        <h3 class="event-title">{{ event.title }}</h3>
                        <p class="event-date-line">{{ formatEventDate(event) }}</p>
                    </div>

                    <span :class="'calendar-category-badge ' + getCategory(event.category).badgeClass">
                        <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                        {{ getCategory(event.category).label }}
                    </span>
                </div>

                <p
                    v-if="isPastEvent(event)"
                    class="event-past-notice"
                >
                    This event has already passed.
                </p>

                <p
                    v-if="event.summary"
                    class="event-summary"
                >
                    {{ event.summary }}
                </p>

                <div
                    v-if="event.locationName || event.locationAddress || shouldShowLinks(event)"
                    class="event-details-grid"
                >
                    <div
                        v-if="event.locationName || event.locationAddress"
                        class="event-location"
                    >
                        <i class="fa-solid fa-location-dot"></i>

                        <div>
                            <p class="font-bold text-gray-700">
                                {{ event.locationName || 'Location' }}
                            </p>

                            <p v-if="event.locationAddress">
                                {{ event.locationAddress }}
                            </p>

                            <p
                                v-if="event.room"
                                class="event-room"
                            >
                                {{ event.room }}
                            </p>
                        </div>
                    </div>

                    <div
                        v-if="shouldShowLinks(event)"
                        class="event-links"
                    >
                        <a
                            v-for="link in getVisibleLinks(event)"
                            :href="link.href"
                            target="_blank"
                            rel="noopener"
                            class="event-link-button"
                        >
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            {{ link.label }}
                        </a>
                    </div>
                </div>
            </div>
        </article>
    `;

    // Builds the compact event treatment used for meetings and holidays.
    const getMinorEventTemplate = () => `
        <article
            v-else
            :class="getMinorEventClass(event)"
        >
            <button
                type="button"
                class="minor-event-date"
                :aria-label="'Show ' + formatMonthYearForEvent(event) + ' on the calendar'"
                @click="goToEventMonth(event)"
            >
                <span class="minor-event-date-month">
                    {{ formatEventDateParts(event).month }}
                </span>

                <span class="minor-event-date-day">
                    {{ formatEventDateParts(event).day }}
                </span>
            </button>

            <div class="minor-event-body">
                <div class="minor-event-heading">
                    <h3 class="minor-event-title">{{ event.title }}</h3>

                    <span :class="'calendar-category-badge calendar-category-badge-minor ' + getCategory(event.category).badgeClass">
                        <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                        {{ getCategory(event.category).label }}
                    </span>
                </div>

                <p class="minor-event-meta">
                    {{ formatEventDate(event) }}
                </p>

                <p
                    v-if="event.locationName"
                    class="minor-event-location"
                >
                    <i class="fa-solid fa-location-dot"></i>
                    {{ event.locationName }}
                </p>
            </div>
        </article>
    `;

    // Builds a chronological mixed list using a real DOM parent for Petite Vue.
    const getEventItemsTemplate = eventsExpression => `
    <div
        v-for="event in ${eventsExpression}"
        class="calendar-event-entry"
    >
        ${getMajorEventTemplate()}
        ${getMinorEventTemplate()}
    </div>
`;

    const getCalendarTemplate = () => `
        <div
            class="calendar-scroll-viewport"
            id="calendar-scroll-viewport"
        >
            <div class="calendar-scroll-track">
                <section
                    class="calendar-month-panel"
                    :aria-label="monthNames[activeMonthIndex] + ' ' + activeYear"
                >
                    <div class="calendar-month-header calendar-month-header-controls">
                        <div class="calendar-month-nav">
                            <button
                                type="button"
                                class="calendar-month-button"
                                id="calendar-prev-month"
                                :disabled="isFirstAvailableMonth"
                                @click="previousMonth"
                            >
                                <i class="fa-solid fa-chevron-left"></i>
                                <span>Previous</span>
                            </button>

                            <div class="calendar-month-center calendar-month-center-inline">
                                <div
                                    class="calendar-month-label"
                                    id="calendar-current-month-label"
                                >
                                    {{ monthNames[activeMonthIndex] }}
                                </div>

                                <select
                                    id="calendar-year-select"
                                    class="calendar-year-select calendar-year-select-inline"
                                    aria-label="Select calendar year"
                                    v-model.number="activeYear"
                                    @change="changeYear"
                                >
                                    <option
                                        v-for="year in years"
                                        :value="year"
                                    >
                                        {{ year }}
                                    </option>
                                </select>

                                <button
                                    type="button"
                                    class="calendar-today-button"
                                    title="Return to today"
                                    aria-label="Return to today"
                                    :disabled="!canGoToToday"
                                    @click="goToToday"
                                >
                                    <i class="fa-solid fa-calendar-day"></i>
                                </button>
                            </div>

                            <button
                                type="button"
                                class="calendar-month-button"
                                id="calendar-next-month"
                                :disabled="isLastAvailableMonth"
                                @click="nextMonth"
                            >
                                <span>Next</span>
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <div class="calendar-month-grid">
                        <div
                            v-for="dayName in dayNames"
                            class="calendar-day-heading"
                        >
                            {{ dayName }}
                        </div>

                        <div
                            v-for="cell in visibleCalendarCells"
                            :class="cell.classes"
                            :data-date-key="cell.dateKey"
                            :tabindex="cell.events.length ? 0 : null"
                            :role="cell.events.length ? 'button' : null"
                            :aria-label="cell.events.length ? getDayAriaLabel(cell) : null"
                            @click="openDayModal(cell)"
                            @keydown="handleDayKeydown(cell, $event)"
                        >
                            <div
                                v-if="cell.day"
                                class="calendar-day-number"
                            >
                                {{ cell.day }}
                            </div>

                            <div
                                v-for="event in cell.events"
                                :class="getChipClass(event)"
                                :title="event.title"
                            >
                                <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                                <span>{{ event.title }}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;

    const getEventListTemplate = () => `
        <div class="calendar-event-overview">
            <div class="calendar-featured-months">
                <section
                    class="calendar-event-month-panel"
                    :aria-label="'Events for ' + thisMonthLabel"
                >
                    <header class="calendar-event-month-header">
                        <p class="calendar-event-month-kicker">This Month</p>
                        <h2 class="calendar-event-month-title">
                            {{ thisMonthLabel }}
                        </h2>
                    </header>

                    <div
                        v-if="thisMonthEvents.length"
                        class="calendar-event-month-list"
                    >
                        ${getEventItemsTemplate('thisMonthEvents')}
                    </div>

                    <p
                        v-else
                        class="calendar-month-empty"
                    >
                        No events scheduled for {{ thisMonthLabel }}.
                    </p>
                </section>

                <section
                    class="calendar-event-month-panel"
                    :aria-label="'Events for ' + nextMonthLabel"
                >
                    <header class="calendar-event-month-header">
                        <p class="calendar-event-month-kicker">Next Month</p>
                        <h2 class="calendar-event-month-title">
                            {{ nextMonthLabel }}
                        </h2>
                    </header>

                    <div
                        v-if="nextMonthEvents.length"
                        class="calendar-event-month-list"
                    >
                        ${getEventItemsTemplate('nextMonthEvents')}
                    </div>

                    <p
                        v-else
                        class="calendar-month-empty"
                    >
                        No events scheduled for {{ nextMonthLabel }}.
                    </p>
                </section>
            </div>

            <section
                v-if="laterMonthGroups.length"
                class="calendar-continuing-events"
            >
                <div class="calendar-continuing-heading">
                    <p class="calendar-event-month-kicker">
                        Continuing Calendar
                    </p>

                    <h2 class="calendar-continuing-title">
                        Later Events
                    </h2>
                </div>

                <section
                    v-for="group in laterMonthGroups"
                    class="calendar-continuing-month"
                    :aria-label="'Events for ' + group.label"
                >
                    <h3 class="calendar-continuing-month-title">
                        {{ group.label }}
                    </h3>

                    <div class="calendar-continuing-list">
                        ${getEventItemsTemplate('group.events')}
                    </div>
                </section>
            </section>
        </div>

        <div
            v-if="isDayModalOpen"
            class="calendar-day-modal-backdrop"
            role="presentation"
            @click="handleModalBackdrop($event)"
        >
            <section
                class="calendar-day-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="calendar-day-modal-title"
                @keydown="handleModalKeydown($event)"
            >
                <header class="calendar-day-modal-header">
                    <div>
                        <p class="calendar-day-modal-kicker">
                            Calendar Events
                        </p>

                        <h2
                            id="calendar-day-modal-title"
                            class="calendar-day-modal-title"
                        >
                            {{ modalDateLabel }}
                        </h2>
                    </div>

                    <button
                        id="calendar-day-modal-close"
                        type="button"
                        class="calendar-day-modal-close"
                        aria-label="Close event details"
                        @click="closeDayModal"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="calendar-day-modal-list">
                    <article
                        v-for="event in modalEvents"
                        class="calendar-day-modal-event"
                    >
                        <div class="calendar-day-modal-event-heading">
                            <h3>{{ event.title }}</h3>

                            <span :class="'calendar-category-badge ' + getCategory(event.category).badgeClass">
                                <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                                {{ getCategory(event.category).label }}
                            </span>
                        </div>

                        <p class="calendar-day-modal-date">
                            {{ formatEventDate(event) }}
                        </p>

                        <p
                            v-if="event.summary"
                            class="calendar-day-modal-summary"
                        >
                            {{ event.summary }}
                        </p>

                        <div
                            v-if="event.locationName || event.locationAddress || event.room"
                            class="calendar-day-modal-location"
                        >
                            <i class="fa-solid fa-location-dot"></i>

                            <div>
                                <p
                                    v-if="event.locationName"
                                    class="font-bold text-gray-800"
                                >
                                    {{ event.locationName }}
                                </p>

                                <p v-if="event.locationAddress">
                                    {{ event.locationAddress }}
                                </p>

                                <p v-if="event.room">
                                    {{ event.room }}
                                </p>
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    `;

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

            get laterMonthGroups() {
                const firstLaterMonth = this.getRelativeMonthInfo(2);
                const firstLaterDate = new Date(
                    firstLaterMonth.year,
                    firstLaterMonth.monthIndex,
                    1
                );
                const groups = new Map();

                this.events.forEach(event => {
                    const start = parseLocalDateTime(event.start);

                    if (!start || start < firstLaterDate) return;

                    const key = `${start.getFullYear()}-${String(
                        start.getMonth() + 1
                    ).padStart(2, '0')}`;

                    if (!groups.has(key)) {
                        groups.set(key, {
                            key,
                            label: start.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric'
                            }),
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

            get modalEvents() {
                if (!this.modalDateKey) return [];

                return this.events
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

            // Builds an empty calendar grid cell.
            getEmptyCalendarCell(key) {
                return {
                    key,
                    day: null,
                    dateKey: '',
                    events: [],
                    classes: 'calendar-day calendar-day-empty'
                };
            },

            // Builds a populated calendar day cell.
            getCalendarDayCell(day) {
                const dateKey = `${this.activeYear}-${String(
                    this.activeMonthIndex + 1
                ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const events = this.getEventsForDate(
                    this.activeYear,
                    this.activeMonthIndex,
                    day
                );

                return {
                    key: dateKey,
                    day,
                    dateKey,
                    events,
                    classes: [
                        'calendar-day',
                        events.length
                            ? 'calendar-day-has-events'
                            : '',
                        this.todayDateKey === dateKey
                            ? 'calendar-day-today'
                            : '',
                        this.isDayModalOpen &&
                            this.modalDateKey === dateKey
                            ? 'calendar-day-selected'
                            : ''
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

            // Gets all events for one calendar month.
            getEventsForMonth(year, monthIndex) {
                return this.events
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

            // Gets all events for one calendar date.
            getEventsForDate(year, monthIndex, day) {
                return this.events
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

            // Opens a read-only modal containing every event on a calendar day.
            openDayModal(cell) {
                if (!cell.events.length) return;

                this.modalDateKey = cell.dateKey;
                this.isDayModalOpen = true;
                document.body.classList.add(
                    'calendar-modal-open'
                );

                requestAnimationFrame(() => {
                    document
                        .getElementById(
                            'calendar-day-modal-close'
                        )
                        ?.focus();
                });
            },

            // Handles keyboard selection for calendar day cells.
            handleDayKeydown(cell, event) {
                if (!cell.events.length) return;

                if (
                    event.key !== 'Enter' &&
                    event.key !== ' '
                ) {
                    return;
                }

                event.preventDefault();
                this.openDayModal(cell);
            },

            // Closes the day modal and restores page scrolling.
            closeDayModal() {
                this.isDayModalOpen = false;
                this.modalDateKey = null;
                document.body.classList.remove(
                    'calendar-modal-open'
                );
            },

            // Closes the modal when its backdrop is clicked.
            handleModalBackdrop(event) {
                if (event.target === event.currentTarget) {
                    this.closeDayModal();
                }
            },

            // Closes the modal when Escape is pressed inside it.
            handleModalKeydown(event) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    this.closeDayModal();
                }
            }
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