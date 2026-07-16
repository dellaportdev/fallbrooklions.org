(() => {

    // Builds the large event treatment used for major public events.
    const getMajorEventTemplate = majorCondition => `
        <article
            v-if="${majorCondition}"
            :key="event.id"
            :id="'event-' + event.id"
            :class="getMajorEventClass(event)"
        >
            <div class="flex min-w-0 flex-col">
                <button
                    type="button"
                    class="event-date-rail max-sm:flex-row max-sm:items-center max-sm:justify-between max-sm:gap-3 max-sm:px-4 max-sm:py-3 max-sm:text-left"
                    :style="getEventDateStyle(event)"
                    :aria-label="'Show events for ' + formatEventDate(event)"
                    @click="openEventDayModal(event)"
                >
                    <div
                        v-if="!formatEventDateParts(event).isRange"
                        class="event-date-single flex w-full flex-col items-center max-sm:hidden"
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
                        v-if="!formatEventDateParts(event).isRange"
                        class="hidden min-w-0 items-baseline gap-2 max-sm:flex py-2"
                    >
                        <span class="font-serif text-md font-bold text-navy">
                            {{ formatEventMobileDateParts(event).weekday }},
                        </span>

                        <span class="font-serif text-md font-bold text-navy">
                            {{ formatEventMobileDateParts(event).month }}
                        </span>

                        <span class="font-serif text-3xl font-black leading-none text-gray-900">
                            {{ formatEventMobileDateParts(event).day }}
                        </span>
                    </div>

                    <div
                        v-else
                        class="event-date-range flex w-full flex-col items-center gap-1 max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] max-sm:gap-3"
                    >
                        <div class="flex w-full flex-col items-center">
                            <div class="event-date-rail-month text-xs font-black uppercase tracking-widest text-navy">
                                {{ formatEventDateParts(event).start.month }}
                            </div>

                            <div class="event-date-rail-day mt-1 font-serif text-2xl font-black leading-none text-gray-900 sm:text-3xl">
                                {{ formatEventDateParts(event).start.day }}
                            </div>

                            <div class="event-date-rail-weekday mt-1 text-xs font-black uppercase text-gray-500">
                                {{ formatEventDateParts(event).start.weekday }}
                            </div>
                        </div>

                        <div
                            class="event-date-range-separator my-1 text-[0.65rem] font-black uppercase tracking-wider text-gray-400 max-sm:m-0"
                            aria-hidden="true"
                        >
                            <span class="sm:hidden">through</span>
                            <span class="hidden sm:inline">to</span>
                        </div>

                        <div class="flex w-full flex-col items-center">
                            <div class="event-date-rail-month text-xs font-black uppercase tracking-widest text-navy">
                                {{ formatEventDateParts(event).end.month }}
                            </div>

                            <div class="event-date-rail-day mt-1 font-serif text-2xl font-black leading-none text-gray-900 sm:text-3xl">
                                {{ formatEventDateParts(event).end.day }}
                            </div>

                            <div class="event-date-rail-weekday mt-1 text-xs font-black uppercase text-gray-500">
                                {{ formatEventDateParts(event).end.weekday }}
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="formatEventDateParts(event).time"
                        class="event-date-rail-time mt-2 w-full border-t border-gray-200 pt-2 text-md font-black leading-snug text-gray-700 max-sm:mt-0 max-sm:w-auto max-sm:shrink-0 max-sm:border-l max-sm:border-t-0 max-sm:pl-4 max-sm:pt-0 max-sm:text-right"
                    >
                        {{ formatEventDateParts(event).time }}
                    </div>
                </button>

                <div class="relative z-10 flex justify-center">
                    <span
                        :class="'calendar-category-badge -mt-2.5 w-fit justify-center whitespace-normal px-3 py-1 text-center text-[0.65rem] leading-tight shadow-sm ' + getCategory(event.category).badgeClass"
                    >
                        <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                        {{ getCategory(event.category).label }}
                    </span>
                </div>
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
                        class="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                    >
                        <a
                            v-for="link in getVisibleLinks(event)"
                            :href="link.href"
                            target="_blank"
                            rel="noopener"
                            class="event-link-button w-full sm:w-auto"
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
            :key="event.id"
            v-else
            :class="getMinorEventClass(event) + ' max-sm:grid-cols-[3rem_minmax(0,1fr)] max-sm:gap-2.5 max-sm:p-2.5'"
        >
            <button
                type="button"
                class="minor-event-date min-h-12 py-1.5 max-sm:h-12 max-sm:min-h-12 max-sm:rounded-lg"
                :style="getEventDateStyle(event)"
                :aria-label="'Show events for ' + formatEventDate(event)"
                @click="openEventDayModal(event)"
            >
                <span class="text-[0.65rem] font-black uppercase tracking-wider text-navy max-sm:text-[0.6rem]">
                    {{ formatEventDateParts(event).start.month }}
                </span>

                <span class="font-serif text-xl font-black leading-none text-gray-800 max-sm:text-lg">
                    {{ formatEventDateParts(event).start.day }}
                </span>
            </button>

            <div class="min-w-0">
                <div class="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 class="min-w-0 text-base font-bold leading-tight text-gray-800 max-sm:text-[0.95rem]">
                        {{ event.title }}
                    </h3>

                    <span
                        :class="'calendar-category-badge gap-1.5 px-2 py-0.5 text-[0.65rem] max-sm:w-fit max-sm:self-start max-sm:text-[0.6rem] ' + getCategory(event.category).badgeClass"
                    >
                        <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                        {{ getCategory(event.category).label }}
                    </span>
                </div>

                <p class="mt-1 text-sm font-semibold leading-snug text-gray-500 max-sm:text-xs">
                    {{ formatEventDate(event) }}
                </p>

                <p
                    v-if="event.locationName"
                    class="mt-1 flex items-center gap-1.5 text-xs text-gray-500 max-sm:hidden"
                >
                    <i class="fa-solid fa-location-dot text-yellow-500"></i>
                    {{ event.locationName }}
                </p>
            </div>
        </article>
    `;

    // Builds the main calendar grid.
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
                            class="calendar-day-number"
                        >
                            {{ cell.day }}
                        </div>

                        <div
                            v-for="item in cell.visibleEvents"
                            :key="item.event.id"
                            :class="getChipClass(item.event)"
                            :style="{ gridRow: item.slot }"
                            :title="item.event.title"
                        >
                            <i :class="'fa-solid ' + getCategory(item.event.category).icon"></i>

                            <span class="calendar-chip-label">
                                {{ item.event.calendarLabel || item.event.title }}
                            </span>
                        </div>

                        <div
                            v-if="cell.hiddenEventCount"
                            class="calendar-day-more"
                            :title="cell.hiddenEventCount + ' more events'"
                        >
                            +{{ cell.hiddenEventCount }}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;

    // Builds the grouped upcoming-event sections.
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
                            <div class="min-w-0">
                                <h3 class="font-serif text-xl font-bold text-navy md:text-2xl">
                                    {{ event.title }}
                                </h3>

                                <p class="mt-1 text-base font-semibold text-gray-600">
                                    {{ formatEventDate(event) }}
                                </p>
                            </div>

                            <span
                                :class="'calendar-category-badge self-start ' + getCategory(event.category).badgeClass"
                            >
                                <i :class="'fa-solid ' + getCategory(event.category).icon"></i>
                                {{ getCategory(event.category).label }}
                            </span>
                        </div>

                        <div
                            v-if="isEventInProgress(event) || isPastEvent(event)"
                            class="mt-3 flex flex-wrap items-center gap-2"
                        >
                            <span
                                v-if="isEventInProgress(event)"
                                class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-gray-800"
                            >
                                <i class="fa-solid fa-hourglass-half"></i>
                                {{ getEventTimeRemainingLabel(event) }}
                            </span>

                            <span
                                v-if="isPastEvent(event)"
                                class="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-gray-600"
                            >
                                <i class="fa-solid fa-clock-rotate-left"></i>
                                Event passed
                            </span>
                        </div>

                        <p
                            v-if="event.summary"
                            class="mt-4 text-base leading-relaxed text-gray-700 md:text-lg"
                        >
                            {{ event.summary }}
                        </p>

                        <div
                            v-if="event.locationName || event.locationAddress || event.room"
                            class="mt-4 flex items-start gap-3 rounded-xl bg-gray-50 p-4 text-base leading-relaxed text-gray-600"
                        >
                            <i class="fa-solid fa-location-dot mt-1 shrink-0 text-yellow-500"></i>

                            <div class="min-w-0">
                                <p
                                    v-if="event.locationName"
                                    class="font-bold text-gray-800"
                                >
                                    {{ event.locationName }}
                                </p>

                                <p v-if="event.locationAddress">
                                    {{ event.locationAddress }}
                                </p>

                                <p
                                    v-if="event.room"
                                    class="mt-1 text-sm text-gray-500"
                                >
                                    {{ event.room }}
                                </p>
                            </div>
                        </div>

                        <div
                            v-if="shouldShowLinks(event)"
                            class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                        >
                            <a
                                v-for="link in getVisibleLinks(event)"
                                :href="link.href"
                                target="_blank"
                                rel="noopener"
                                class="event-link-button w-full sm:w-auto"
                            >
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                {{ link.label }}
                            </a>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    `;

    // Builds an alphabetical index of upcoming events.
    const getEventIndexTemplate = () => `
	<p
		v-if="!eventIndex.length"
		class="text-sm text-gray-600"
	>
		No events are listed for this year.
	</p>

	<ul
		v-else
		class="columns-1 gap-8 text-md sm:columns-2 lg:columns-3"
	>
		<li
			v-for="event in eventIndex"
			:key="'event-index-' + event.id"
			class="mb-1 break-inside-avoid"
		>
			<button
				type="button"
				:class="[
					'group flex w-full items-start rounded-md px-1.5 py-1 text-left transition',
					isPastEvent(event)
						? 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
						: 'text-gray-800 hover:bg-blue-50 hover:text-blue-950'
				]"
				@click="openEventIndexModal(event)"
			>
				<span
					class="flex w-20 shrink-0 items-baseline font-bold tabular-nums"
					:class="isPastEvent(event) ? 'opacity-60' : ''"
				>
					<span
						class="w-9 text-nowrap"
						:style="getEventIndexMonthAccent(event)"
					>
						{{ formatEventIndexMonth(event) }} {{ formatEventIndexDay(event) }}
					</span>

				</span>

				<span
					:class="[
						'min-w-0 whitespace-normal break-words font-medium leading-snug group-hover:underline',
						isPastEvent(event) ? 'opacity-70' : ''
					]"
				>
					{{ event.title }}
				</span>
			</button>
		</li>
	</ul>
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
    

    window.CalendarTemplates = {
        getCalendarTemplate,
        getEventIndexTemplate,
        getEventListTemplate
    };
})();