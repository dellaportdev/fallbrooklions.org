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
            isDayModalOpen: false,
            modalDateKey: null,
            modalEvents: [],
            showNextYearEvents: false,
            showRecurringEvents: true,
            showHolidayEvents: true
        };
    };

    // Builds the large event treatment used for major public events.
    const getMajorEventTemplate = majorCondition => `
        <article
            v-if="${majorCondition}"
            :id="'event-' + event.id"
            :class="getMajorEventClass(event)"
        >
            <div class="flex min-w-0 flex-col gap-2">
                <button
                    type="button"
                    class="event-date-rail"
                    :style="getEventDateStyle(event)"
                    :aria-label="'Show ' + formatMonthYearForEvent(event) + ' on the calendar'"
                    @click="goToEventMonth(event)"
                >
                    <div
                        v-if="!formatEventDateParts(event).isRange"
                        class="event-date-single flex w-full flex-col items-center"
                    >
                        <div class="event-date-rail-month text-xs font-black uppercase tracking-widest text-navy">
                            {{ formatEventDateParts(event).start.month }}
                        </div>

                        <div class="event-date-rail-day mt-1 font-serif text-3xl font-black leading-none text-gray-900">
                            {{ formatEventDateParts(event).start.day }}
                        </div>

                        <div class="event-date-rail-weekday mt-1 text-xs font-black uppercase text-gray-500">
                            {{ formatEventDateParts(event).start.weekday }}
                        </div>
                    </div>

                    <div
                        v-else
                        class="event-date-range flex w-full flex-col items-center gap-1"
                    >
                        <div class="flex w-full flex-col items-center">
                            <div class="event-date-rail-month text-xs font-black uppercase tracking-widest text-navy">
                                {{ formatEventDateParts(event).start.month }}
                            </div>

                            <div class="event-date-rail-day mt-1 font-serif font-black leading-none text-gray-900">
                                {{ formatEventDateParts(event).start.day }}
                            </div>

                            <div class="event-date-rail-weekday mt-1 text-xs font-black uppercase text-gray-500">
                                {{ formatEventDateParts(event).start.weekday }}
                            </div>
                        </div>

                        <div
                            class="event-date-range-separator my-1 text-[0.6rem] font-black uppercase tracking-widest text-gray-400"
                            aria-hidden="true"
                        >
                            to
                        </div>

                        <div class="flex w-full flex-col items-center">
                            <div class="event-date-rail-month text-xs font-black uppercase tracking-widest text-navy">
                                {{ formatEventDateParts(event).end.month }}
                            </div>

                            <div class="event-date-rail-day mt-1 font-serif font-black leading-none text-gray-900">
                                {{ formatEventDateParts(event).end.day }}
                            </div>

                            <div class="event-date-rail-weekday mt-1 text-xs font-black uppercase text-gray-500">
                                {{ formatEventDateParts(event).end.weekday }}
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="formatEventDateParts(event).time"
                        class="event-date-rail-time mt-2 w-full border-t border-gray-200 pt-2 text-[0.7rem] font-black leading-snug text-gray-700"
                    >
                        {{ formatEventDateParts(event).time }}
                    </div>
                </button>

                <span
                    :class="'calendar-category-badge w-full justify-center whitespace-normal px-2 text-center text-[0.65rem] leading-tight max-sm:mx-4 max-sm:mb-3 max-sm:w-fit max-sm:self-start ' + getCategory(event.category).badgeClass"
                >
                    <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                    {{ getCategory(event.category).label }}
                </span>
            </div>

            <div class="min-w-0 max-sm:p-4">
                <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h3 class="text-lg font-bold text-navy md:text-xl">
                            {{ event.title }}
                        </h3>

                        <p class="mt-1 text-sm font-semibold text-gray-500 max-sm:hidden">
                            {{ formatEventDate(event) }}
                        </p>

                        <span
                            v-if="isEventInProgress(event)"
                            class="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-gray-800"
                        >
                            <i class="fa-solid fa-hourglass-half"></i>
                            {{ getEventTimeRemainingLabel(event) }}
                        </span>
                    </div>
                </div>

                <p
                    v-if="isPastEvent(event)"
                    class="mt-3 rounded-lg border-l-4 border-gray-400 bg-gray-100 px-3 py-2 text-sm font-bold text-gray-600"
                >
                    This event has already passed.
                </p>

                <p
                    v-if="event.summary"
                    class="mt-3 text-sm leading-relaxed text-gray-600 md:text-base"
                >
                    {{ event.summary }}
                </p>

                <div
                    v-if="event.locationName || event.locationAddress || shouldShowLinks(event)"
                    class="mt-4 grid gap-3"
                >
                    <div
                        v-if="event.locationName || event.locationAddress"
                        class="flex items-start gap-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-600"
                    >
                        <i class="fa-solid fa-location-dot mt-1 text-yellow-500"></i>

                        <div>
                            <p class="font-bold text-gray-700">
                                {{ event.locationName || 'Location' }}
                            </p>

                            <p v-if="event.locationAddress">
                                {{ event.locationAddress }}
                            </p>

                            <p
                                v-if="event.room"
                                class="mt-1 text-xs text-gray-500"
                            >
                                {{ event.room }}
                            </p>
                        </div>
                    </div>

                    <div
                        v-if="shouldShowLinks(event)"
                        class="flex flex-col gap-2 sm:flex-row sm:flex-wrap max-sm:grid max-sm:grid-cols-1"
                    >
                        <a
                            v-for="link in getVisibleLinks(event)"
                            :href="link.href"
                            target="_blank"
                            rel="noopener"
                            class="event-link-button max-sm:w-full"
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
                :style="getEventDateStyle(event)"
                :aria-label="'Show ' + formatMonthYearForEvent(event) + ' on the calendar'"
                @click="goToEventMonth(event)"
            >
                <span class="text-[0.65rem] font-black uppercase tracking-wider text-navy">
                    {{ formatEventDateParts(event).start.month }}
                </span>

                <span class="font-serif text-xl font-black leading-none text-gray-800">
                    {{ formatEventDateParts(event).start.day }}
                </span>
            </button>

            <div class="min-w-0">
                <div class="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 class="min-w-0 text-base font-bold leading-tight text-gray-800">
                        {{ event.title }}
                    </h3>

                    <span
                        :class="'calendar-category-badge gap-1.5 px-2 py-0.5 text-[0.65rem] max-sm:self-start ' + getCategory(event.category).badgeClass"
                    >
                        <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                        {{ getCategory(event.category).label }}
                    </span>
                </div>

                <p class="mt-1 text-sm font-semibold text-gray-500">
                    {{ formatEventDate(event) }}
                </p>

                <p
                    v-if="event.locationName"
                    class="mt-1 flex items-center gap-1.5 text-xs text-gray-500"
                >
                    <i class="fa-solid fa-location-dot text-yellow-500"></i>
                    {{ event.locationName }}
                </p>
            </div>
        </article>
    `;

    const getCalendarTemplate = () => `
        <div id="calendar-scroll-viewport">
            <section
                class="bg-white"
                :aria-label="monthNames[activeMonthIndex] + ' ' + activeYear"
            >
                <header class="border-b border-gray-200 bg-slate-50 p-4">
                    <div class="calendar-month-nav grid items-center gap-3 max-sm:grid-cols-2 max-sm:gap-2">
                        <button
                            type="button"
                            class="calendar-control-button gap-2 border px-4 py-2 text-sm max-sm:w-full max-sm:min-w-0 max-sm:px-2 max-sm:text-xs"
                            id="calendar-prev-month"
                            :disabled="isFirstAvailableMonth"
                            @click="previousMonth"
                        >
                            <i class="fa-solid fa-chevron-left"></i>
                            <span class="max-sm:truncate">Previous</span>
                        </button>

                        <div class="order-first col-span-2 flex min-w-0 flex-nowrap items-center justify-center gap-2 sm:order-none sm:col-span-1 sm:gap-3">
                            <div
                                class="calendar-month-label whitespace-nowrap font-serif font-extrabold leading-none text-navy max-sm:text-center"
                                id="calendar-current-month-label"
                            >
                                {{ monthNames[activeMonthIndex] }}
                            </div>

                            <select
                                id="calendar-year-select"
                                class="calendar-year-select-inline min-h-11 rounded-xl border-2 border-blue-200 bg-white px-3 py-1 pr-8 font-black leading-none text-navy focus:border-navy focus:outline-none focus:ring-4 focus:ring-blue-900/20 max-sm:min-h-10 max-sm:px-2.5 max-sm:py-1 max-sm:pr-7"
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
                                class="calendar-control-button h-11 w-11 shrink-0 text-lg max-sm:h-10 max-sm:w-10 max-sm:text-base"
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
                            class="calendar-control-button gap-2 border px-4 py-2 text-sm max-sm:w-full max-sm:min-w-0 max-sm:px-2 max-sm:text-xs"
                            id="calendar-next-month"
                            :disabled="isLastAvailableMonth"
                            @click="nextMonth"
                        >
                            <span class="max-sm:truncate">Next</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </header>

                <div class="relative isolate grid grid-cols-7 gap-px bg-gray-200">
                    <div
                        v-for="dayName in dayNames"
                        class="bg-gray-100 px-2 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-500 max-sm:px-1 max-sm:py-2 max-sm:text-[0.65rem]"
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
                            class="calendar-day-number mb-1 text-xs font-black text-gray-500"
                        >
                            {{ cell.day }}
                        </div>

                        <div
                            v-for="event in cell.events"
                            :class="getChipClass(event)"
                            :title="event.title"
                        >
                            <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                            <span>{{ event.calendarLabel || event.title }}</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;

    const getEventListTemplate = () => `
        <div class="space-y-8">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section
                    class="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-slate-50"
                    :aria-label="'Events for ' + thisMonthLabel"
                >
                    <header
                        class="relative overflow-hidden border-b border-gray-200 bg-white px-5 py-4"
                        :style="getMonthHeaderStyle(0)"
                    >
                        <p class="relative z-10 text-xs font-black uppercase tracking-widest text-blue-700">
                            This Month
                        </p>

                        <h2 class="relative z-10 mt-1 font-serif text-2xl font-bold text-navy">
                            {{ thisMonthLabel }}
                        </h2>
                    </header>

                    <div
                        v-if="thisMonthEvents.length"
                        class="space-y-3 p-4 max-sm:p-3"
                    >
                        ${getEventItemsTemplate('thisMonthEvents', true)}
                    </div>

                    <p
                        v-else
                        class="m-4 rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm font-semibold text-gray-500"
                    >
                        No events to show for {{ thisMonthLabel }}.
                    </p>
                </section>

                <section
                    class="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-slate-50"
                    :aria-label="'Events for ' + nextMonthLabel"
                >
                    <header
                        class="relative overflow-hidden border-b border-gray-200 bg-white px-5 py-4"
                        :style="getMonthHeaderStyle(1)"
                    >
                        <p class="relative z-10 text-xs font-black uppercase tracking-widest text-blue-700">
                            Next Month
                        </p>

                        <h2 class="relative z-10 mt-1 font-serif text-2xl font-bold text-navy">
                            {{ nextMonthLabel }}
                        </h2>
                    </header>

                    <div
                        v-if="nextMonthEvents.length"
                        class="space-y-3 p-4 max-sm:p-3"
                    >
                        ${getEventItemsTemplate('nextMonthEvents')}
                    </div>

                    <p
                        v-else
                        class="m-4 rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm font-semibold text-gray-500"
                    >
                        No events to show for {{ nextMonthLabel }}.
                    </p>
                </section>
            </div>

            <section
                v-if="laterMonthGroups.length || hasNextYearEvents"
                class="border-t border-gray-200 pt-8"
            >
                <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p class="text-xs font-black uppercase tracking-widest text-blue-700">
                            Continuing Calendar
                        </p>

                        <h2 class="mt-1 font-serif text-2xl font-bold text-navy">
                            Later Events
                        </h2>
                    </div>

                    <div
                        class="flex flex-wrap items-center gap-x-4 gap-y-2"
                        aria-label="Filter later events"
                    >
                        <label class="calendar-filter">
                            <input
                                type="checkbox"
                                v-model="showRecurringEvents"
                            >

                            <span>Recurring events</span>
                        </label>

                        <label class="calendar-filter">
                            <input
                                type="checkbox"
                                v-model="showHolidayEvents"
                            >

                            <span>Holidays and observances</span>
                        </label>
                    </div>
                </div>

                <section
                    v-for="group in laterMonthGroups"
                    class="calendar-continuing-month"
                    :aria-label="'Events for ' + group.label"
                >
                    <h3
                        class="mb-4 rounded-t-md border-b-2 px-2 pb-2 pt-1 font-serif text-xl font-bold text-gray-800"
                        :style="getContinuingMonthHeadingStyle(group.events[0])"
                    >
                        {{ group.label }}
                    </h3>

                    <div class="space-y-3">
                        ${getEventItemsTemplate('group.events')}
                    </div>
                </section>

                <div
                    v-if="hasNextYearEvents && !showNextYearEvents"
                    class="mt-4 text-center"
                >
                    <button
                        type="button"
                        class="calendar-show-more"
                        @click="showNextYear"
                    >
                        Show {{ scheduleNextYear }} events
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                </div>

                <div
                    v-if="showNextYearEvents"
                    class="mt-4"
                >
                    <section
                        v-for="group in nextYearMonthGroups"
                        class="calendar-continuing-month"
                        :aria-label="'Events for ' + group.label"
                    >
                        <h3 class="mb-4 border-b-2 border-blue-100 pb-2 font-serif text-xl font-bold text-gray-800">
                            {{ group.label }}
                        </h3>

                        <div class="space-y-3">
                            ${getEventItemsTemplate('group.events')}
                        </div>
                    </section>
                </div>
            </section>
        </div>

        <div
            v-if="isDayModalOpen"
            class="calendar-day-modal-backdrop fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-2 sm:items-center sm:p-4"
            role="presentation"
            @click="handleModalBackdrop($event)"
        >
            <section
                class="calendar-day-modal my-auto flex max-h-[calc(100vh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="calendar-day-modal-title"
                @keydown="handleModalKeydown($event)"
            >
                <header class="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4 md:px-6">
                    <div>
                        <p class="text-xs font-black uppercase tracking-widest text-blue-700">
                            Calendar Events
                        </p>

                        <h2
                            id="calendar-day-modal-title"
                            class="mt-1 font-serif text-xl font-bold text-navy sm:text-2xl md:text-3xl"
                        >
                            {{ modalDateLabel }}
                        </h2>
                    </div>

                    <button
                        id="calendar-day-modal-close"
                        type="button"
                        class="calendar-day-modal-close inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xl text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-900/20"
                        aria-label="Close event details"
                        @click="closeDayModal"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="space-y-4 overflow-y-auto p-3 sm:p-5 md:p-6">
                    <article
                        v-for="event in modalEvents"
                        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                    >
                        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <h3 class="text-xl font-bold text-navy md:text-2xl">
                                {{ event.title }}
                            </h3>

                            <span :class="'calendar-category-badge ' + getCategory(event.category).badgeClass">
                                <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                                {{ getCategory(event.category).label }}
                            </span>
                        </div>

                        <p class="mt-2 text-base font-bold text-gray-600">
                            {{ formatEventDate(event) }}
                        </p>

                        <p
                            v-if="isPastEvent(event)"
                            class="mt-3 rounded-lg border-l-4 border-gray-400 bg-gray-100 px-3 py-2 text-sm font-bold text-gray-600"
                        >
                            This event has passed.
                        </p>

                        <p
                            v-if="event.summary"
                            class="mt-4 text-lg leading-relaxed text-gray-700 max-sm:text-base"
                        >
                            {{ event.summary }}
                        </p>

                        <div
                            v-if="event.locationName || event.locationAddress || event.room"
                            class="mt-4 flex items-start gap-3 rounded-xl bg-gray-50 p-4 text-base leading-relaxed text-gray-600"
                        >
                            <i class="fa-solid fa-location-dot mt-1 text-yellow-500"></i>

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

    // Builds a chronological mixed list of major and minor events.
    const getEventItemsTemplate = (
        eventsExpression,
        demotePastEvents = false
    ) => {
        const majorCondition = demotePastEvents
            ? 'isMajorEvent(event) && !isPastEvent(event)'
            : 'isMajorEvent(event)';

        return `
        <div
            v-for="event in ${eventsExpression}"
            class="calendar-event-entry"
        >
            ${getMajorEventTemplate(majorCondition)}
            ${getMinorEventTemplate()}
        </div>
    `;
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