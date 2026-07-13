const calendarEventCategories = [
	{
		id: 'meeting',
		label: 'Club Meeting',
		icon: 'fa-calendar-check',
		badgeClass: 'bg-blue-100 text-blue-900 border-blue-200'
	},
	{
		id: 'fundraiser',
		label: 'Fundraiser',
		icon: 'fa-hand-holding-heart',
		badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-200'
	},
	{
		id: 'service',
		label: 'Service Project',
		icon: 'fa-people-carry-box',
		badgeClass: 'bg-green-100 text-green-900 border-green-200'
	},
	{
		id: 'community',
		label: 'Community Event',
		icon: 'fa-people-group',
		badgeClass: 'bg-purple-100 text-purple-900 border-purple-200'
	},
	{
		id: 'club',
		label: 'Club Event',
		icon: 'fa-users',
		badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200'
	},
	{
		id: 'federal-holiday',
		label: 'Federal Holiday',
		icon: 'fa-flag-usa',
		badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
	},
	{
		id: 'california-holiday',
		label: 'California State Holiday',
		icon: 'fa-star',
		badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
	},
	{
		id: 'observance',
		label: 'Calendar Observance',
		icon: 'fa-calendar-day',
		badgeClass: 'bg-rose-100 text-rose-900 border-rose-200'
	},
	{
		id: 'local',
		label: 'Local Event',
		icon: 'fa-location-dot',
		badgeClass: 'bg-teal-100 text-teal-900 border-teal-200'
	},
];

const calendarRecurringDatesByYear = {
	clubMeeting: {
		2025: [
			'2025-02-25',
			'2025-03-11', '2025-03-25',
			'2025-04-08', '2025-04-22',
			'2025-05-13', '2025-05-27',
			'2025-06-10', '2025-06-24',
			'2025-07-08', '2025-07-22',
			'2025-08-12', '2025-08-26',
			'2025-09-09', '2025-09-23',
			'2025-10-14', '2025-10-28',
			'2025-11-18'
		],
		2026: [
			'2026-01-13', '2026-01-27',
			'2026-02-10', '2026-02-24',
			'2026-03-10', '2026-03-24',
			'2026-04-14', '2026-04-28',
			'2026-05-12', '2026-05-26',
			'2026-06-09', '2026-06-23',
						, '2026-07-28',
			'2026-08-11', '2026-08-25',
			'2026-09-08', '2026-09-22',
			'2026-10-13', '2026-10-27',
			'2026-11-10', '2026-11-24'
		],
		2027: [
			'2027-01-12', '2027-01-26',
			'2027-02-09', '2027-02-23',
			'2027-03-09', '2027-03-23',
			'2027-04-13', '2027-04-27',
			'2027-05-11', '2027-05-25',
			'2027-06-08', '2027-06-22',
			'2027-07-13', '2027-07-27',
			'2027-08-10', '2027-08-24',
			'2027-09-14', '2027-09-28',
			'2027-10-12', '2027-10-26',
			'2027-11-09', '2027-11-23'
		]
	}
};

const getRecurringDates = (key, years = null) => {
	const dateGroup = calendarRecurringDatesByYear[key] || {};
	const selectedYears = years || Object.keys(dateGroup);

	return selectedYears.flatMap(year => dateGroup[year] || []);
};

// Generates weekly YYYY-MM-DD dates without UTC date shifting.
const getWeeklyDates = (startDate, endDate) => {
	const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
	const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
	const current = new Date(startYear, startMonth - 1, startDay);
	const end = new Date(endYear, endMonth - 1, endDay);
	const dates = [];

	while (current <= end) {
		const year = current.getFullYear();
		const month = String(current.getMonth() + 1).padStart(2, '0');
		const day = String(current.getDate()).padStart(2, '0');

		dates.push(`${year}-${month}-${day}`);
		current.setDate(current.getDate() + 7);
	}

	return dates;
};

const calendarRecurringEventSets = [
	{
		id: 'club-meeting',
		title: 'Club Meeting',
		category: 'meeting',
		startTime: '18:00',
		endTime: '19:00',
		timezone: 'America/Los_Angeles',
		summary: 'Regular Fallbrook Ranch Lions Club meeting. Visitors and prospective members are welcome.',
		locationName: 'Community Health & Wellness Center',
		locationAddress: '1636 E. Mission Rd., Fallbrook, CA 92028',
		room: 'Room 4, unless posted signs indicate a change',
		links: [
			{
				label: 'Directions',
				href: 'https://maps.app.goo.gl/Akk6pw1LT7Rgi8pY7'
			}
		],
		dates: getRecurringDates('clubMeeting')
	},
	{
		id: 'fallbrook-farmers-market',
		title: 'Farmers Market Downtown on Main Ave.',
		category: 'local',
		startTime: '09:00',
		endTime: '13:00',
		timezone: 'America/Los_Angeles',
		summary: 'Weekly farmers market featuring local vendors in downtown Fallbrook.',
		locationName: 'Downtown Fallbrook',
		locationAddress: 'Main Ave., Fallbrook, CA 92028',
		links: [
			{
				label: 'Learn More',
				href: 'https://business.fallbrookchamberofcommerce.org/eventcalendar/Details/farmers-market-downtown-on-main-ave-1741224?sourceTypeId=Website'
			}
		],
		showInList: false,
		dates: getWeeklyDates('2026-07-25', '2027-12-31')
	}
];

const calendarSingleEvents = [

	{
		id: 'rummage-sale-2026',
		title: 'Rummage Sale Fundraiser',
		category: 'fundraiser',
		start: '2026-02-21T10:00:00',
		end: '2026-02-21T15:00:00',
		timezone: 'America/Los_Angeles',
		summary: 'Fundraiser supporting the club Sight Campaign, including eye exams and glasses for local elementary students in need.',
		locationName: 'Community Health & Wellness Center',
		locationAddress: '1636 E. Mission Rd., Fallbrook, CA 92028',
		links: [
			{
				label: 'Download Flyer',
				href: './files/Rummage Sale 8.5x11 color.pdf'
			},
			{
				label: 'Directions',
				href: 'https://maps.app.goo.gl/kfxLbUSMyRGHMvMB9'
			}
		]
	},
	{
		id: 'installation-dinner-2026',
		title: '2026 Installation Dinner',
		category: 'club',
		start: '2026-07-14T18:00:00',
		end: null,
		timezone: 'America/Los_Angeles',
		summary: 'Installation dinner at Backdraft Bar & Grill in Bonsall.',
		locationName: 'Backdraft Bar & Grill',
		locationAddress: '5525 Mission Rd., Ste. F, Bonsall, CA',
		links: [
			{
				label: 'Directions',
				href: 'https://maps.app.goo.gl/69RFt2HS1FLPfSHY6'
			}
		]
	},
	{
		id: 'rummage-sale-fundraiser-2026-10-17',
		title: 'Rummage Sale Fundraiser',
		category: 'fundraiser',
		start: '2026-10-17T09:30:00',
		end: '2026-10-17T15:30:00',
		timezone: 'America/Los_Angeles',
		summary: 'Rummage sale fundraiser at the Community Health & Wellness Center.',
		locationName: 'Community Health & Wellness Center',
		locationAddress: '1636 E. Mission Rd., Fallbrook, CA 92028',
		links: [
			{
				label: 'Directions',
				href: 'https://maps.app.goo.gl/qfp5p3bAynE7cohk7'
			}
		]
	},
	{
		id: 'fallbrook-avocado-festival-2026',
		title: 'Fallbrook Avocado Festival',
		category: 'local',
		start: '2026-04-19T09:00:00',
		end: '2026-04-19T17:00:00',
		timezone: 'America/Los_Angeles',
		summary: 'Annual downtown Fallbrook celebration featuring avocados, local vendors, food, and community activities. Free admission.',
		locationName: 'Downtown Fallbrook',
		locationAddress: 'Main Avenue, Fallbrook, CA 92028',
		links: [
			{
				label: 'Learn More',
				href: 'https://www.fallbrookchamberofcommerce.org/avocado-festival/'
			}
		]
	},
	{
		id: 'fallbrook-veterans-day-parade-2026',
		title: 'Veterans Day Parade',
		category: 'local',
		start: '2026-11-11T10:00:00',
		end: '2026-11-11T12:00:00',
		timezone: 'America/Los_Angeles',
		summary: 'Fallbrook Veterans Day Parade along Main Avenue. The parade begins at Fallbrook Street and ends at Alvarado Street.',
		locationName: 'Main Avenue',
		locationAddress: 'Fallbrook, CA 92028',
		links: [
			{
				label: 'Learn More',
				href: 'https://business.fallbrookchamberofcommerce.org/eventcalendar/Details/veteran-s-day-parade-1618784?sourceTypeId=Website'
			}
		]
	},
	{
		id: 'fallbrook-christmas-parade-2026',
		title: 'Fallbrook Christmas Parade',
		category: 'local',
		start: '2026-12-05T17:00:00',
		end: null,
		timezone: 'America/Los_Angeles',
		summary: 'Annual Christmas parade through downtown Fallbrook. The parade is held rain or shine.',
		locationName: 'Downtown Main Avenue',
		locationAddress: 'Fallbrook, CA 92028',
		links: [
			{
				label: 'Learn More',
				href: 'https://www.fallbrookchamberofcommerce.org/fallbrook-christmas-parade/'
			}
		]
	},
	{
		id: 'fallbrook-wine-trail-2026',
		title: 'Fallbrook Wine Trail',
		category: 'local',
		start: '2026-07-08T00:00:00',
		end: '2026-08-16T23:59:59',
		timezone: 'America/Los_Angeles',
		summary: 'Explore participating wineries and wine-related destinations throughout the Fallbrook area from July 8 through August 16.',
		locationName: 'Fallbrook Wine Country',
		locationAddress: 'Fallbrook, CA 92028',
		allDay: true,
		links: [
			{
				label: 'Learn More',
				href: 'https://business.fallbrookchamberofcommerce.org/eventcalendar/Details/fallbrook-wine-trail-july-8-august-16-1618781?sourceTypeId=Website'
			}
		]
	},
	{
		id: 'fallbrook-scarecrow-days-2026',
		title: 'Scarecrow Days 2026',
		category: 'local',
		start: '2026-10-01T00:00:00',
		end: '2026-10-31T23:59:59',
		timezone: 'America/Los_Angeles',
		summary: 'Scarecrows of all categories will be displayed at businesses and residences throughout Fallbrook during October. Activities include workshops, a scavenger hunt, registration, rentals, and a kids corner.',
		locationName: 'Throughout Fallbrook',
		locationAddress: 'Workshop location: 300 N. Brandon Rd., Suite 8, Fallbrook, CA 92028',
		allDay: true,
		links: [
			{
				label: 'Learn More',
				href: 'https://www.fallbrookchamberofcommerce.org/fallbrook-harvest-faire-october/#scarecrowdays'
			}
		]
	},
	{
		id: 'fallbrook-harvest-faire-2026',
		title: 'Fallbrook Harvest Faire',
		category: 'local',
		start: '2026-10-18T09:00:00',
		end: '2026-10-18T16:00:00',
		timezone: 'America/Los_Angeles',
		summary: 'Annual Fallbrook Harvest Faire featuring seasonal activities, local vendors, entertainment, and community attractions.',
		locationName: 'Downtown Fallbrook',
		locationAddress: 'Main Avenue, Fallbrook, CA 92028',
		links: [
			{
				label: 'Learn More',
				href: 'https://www.fallbrookchamberofcommerce.org/fallbrook-harvest-faire-october/'
			}
		]
	},
	{
		id: 'fallbrook-village-artisan-faire-2026',
		title: 'Village Artisan Faire 2026',
		category: 'local',
		start: '2026-11-28T09:00:00',
		end: '2026-11-28T15:00:00',
		timezone: 'America/Los_Angeles',
		summary: 'A showcase of locally handmade crafts, artisan products, artwork, live music, and holiday attractions in downtown Fallbrook.',
		locationName: 'Downtown Fallbrook',
		locationAddress: 'Main Avenue, Fallbrook, CA 92028',
		links: [
			{
				label: 'Learn More',
				href: 'https://business.fallbrookchamberofcommerce.org/eventcalendar/Details/save-the-date-village-artisan-faire-2026-1618785?sourceTypeId=Website'
			}
		]
	}
];

const federalHolidayDefinitions = {
	newYearsDay: {
		title: 'New Year\u2019s Day',
		slug: 'new-years-day'
	},
	martinLutherKingJrDay: {
		title: 'Birthday of Martin Luther King, Jr.',
		slug: 'martin-luther-king-jr-day'
	},
	washingtonsBirthday: {
		title: 'Washington\u2019s Birthday',
		slug: 'washingtons-birthday'
	},
	memorialDay: {
		title: 'Memorial Day',
		slug: 'memorial-day'
	},
	juneteenth: {
		title: 'Juneteenth National Independence Day',
		slug: 'juneteenth'
	},
	independenceDay: {
		title: 'Independence Day',
		slug: 'independence-day'
	},
	laborDay: {
		title: 'Labor Day',
		slug: 'labor-day'
	},
	columbusDay: {
		title: 'Columbus Day',
		slug: 'columbus-day'
	},
	veteransDay: {
		title: 'Veterans Day',
		slug: 'veterans-day'
	},
	thanksgivingDay: {
		title: 'Thanksgiving Day',
		slug: 'thanksgiving-day'
	},
	christmasDay: {
		title: 'Christmas Day',
		slug: 'christmas-day'
	}
};

/*
 * These use the actual calendar date of the holiday.
 * observedDate is included when the federal employee holiday differs.
 */
const federalHolidayDatesByYear = {
	2026: {
		newYearsDay: {
			date: '2026-01-01'
		},
		martinLutherKingJrDay: {
			date: '2026-01-19'
		},
		washingtonsBirthday: {
			date: '2026-02-16'
		},
		memorialDay: {
			date: '2026-05-25'
		},
		juneteenth: {
			date: '2026-06-19'
		},
		independenceDay: {
			date: '2026-07-04',
			observedDate: '2026-07-03'
		},
		laborDay: {
			date: '2026-09-07'
		},
		columbusDay: {
			date: '2026-10-12'
		},
		veteransDay: {
			date: '2026-11-11'
		},
		thanksgivingDay: {
			date: '2026-11-26'
		},
		christmasDay: {
			date: '2026-12-25'
		}
	},
	2027: {
		newYearsDay: {
			date: '2027-01-01'
		},
		martinLutherKingJrDay: {
			date: '2027-01-18'
		},
		washingtonsBirthday: {
			date: '2027-02-15'
		},
		memorialDay: {
			date: '2027-05-31'
		},
		juneteenth: {
			date: '2027-06-19',
			observedDate: '2027-06-18'
		},
		independenceDay: {
			date: '2027-07-04',
			observedDate: '2027-07-05'
		},
		laborDay: {
			date: '2027-09-06'
		},
		columbusDay: {
			date: '2027-10-11'
		},
		veteransDay: {
			date: '2027-11-11'
		},
		thanksgivingDay: {
			date: '2027-11-25'
		},
		christmasDay: {
			date: '2027-12-25',
			observedDate: '2027-12-24'
		}
	},
	2028: {
		newYearsDay: {
			date: '2028-01-01',
			observedDate: '2027-12-31'
		},
		martinLutherKingJrDay: {
			date: '2028-01-17'
		},
		washingtonsBirthday: {
			date: '2028-02-21'
		},
		memorialDay: {
			date: '2028-05-29'
		},
		juneteenth: {
			date: '2028-06-19'
		},
		independenceDay: {
			date: '2028-07-04'
		},
		laborDay: {
			date: '2028-09-04'
		},
		columbusDay: {
			date: '2028-10-09'
		},
		veteransDay: {
			date: '2028-11-11',
			observedDate: '2028-11-10'
		},
		thanksgivingDay: {
			date: '2028-11-23'
		},
		christmasDay: {
			date: '2028-12-25'
		}
	}
};

const californiaStateHolidayDefinitions = {
	newYearsDay: {
		title: 'New Year\u2019s Day',
		slug: 'new-years-day'
	},
	martinLutherKingJrDay: {
		title: 'Martin Luther King Jr. Day',
		slug: 'martin-luther-king-jr-day'
	},
	presidentsDay: {
		title: 'Presidents\u2019 Day',
		slug: 'presidents-day'
	},
	farmworkersDay: {
		title: 'Farmworkers Day',
		slug: 'farmworkers-day'
	},
	memorialDay: {
		title: 'Memorial Day',
		slug: 'memorial-day'
	},
	independenceDay: {
		title: 'Independence Day',
		slug: 'independence-day'
	},
	laborDay: {
		title: 'Labor Day',
		slug: 'labor-day'
	},
	veteransDay: {
		title: 'Veterans Day',
		slug: 'veterans-day'
	},
	thanksgivingDay: {
		title: 'Thanksgiving Day',
		slug: 'thanksgiving-day'
	},
	dayAfterThanksgiving: {
		title: 'Day after Thanksgiving',
		slug: 'day-after-thanksgiving'
	},
	christmasDay: {
		title: 'Christmas Day',
		slug: 'christmas-day'
	}
};

/*
 * CalHR currently publishes this official 2026 schedule.
 * Add later years here as CalHR publishes them.
 */
const californiaStateHolidayDatesByYear = {
	2026: {
		newYearsDay: '2026-01-01',
		martinLutherKingJrDay: '2026-01-19',
		presidentsDay: '2026-02-16',
		farmworkersDay: '2026-03-31',
		memorialDay: '2026-05-25',
		independenceDay: '2026-07-04',
		laborDay: '2026-09-07',
		veteransDay: '2026-11-11',
		thanksgivingDay: '2026-11-26',
		dayAfterThanksgiving: '2026-11-27',
		christmasDay: '2026-12-25'
	}
};

const calendarObservanceDefinitions = {
	valentinesDay: {
		title: 'Valentine\u2019s Day',
		slug: 'valentines-day',
		summary: 'Common calendar observance.'
	},
	stPatricksDay: {
		title: 'St. Patrick\u2019s Day',
		slug: 'st-patricks-day',
		summary: 'Common calendar observance.'
	},
	easterSunday: {
		title: 'Easter Sunday',
		slug: 'easter-sunday',
		summary: 'Christian observance.'
	},
	earthDay: {
		title: 'Earth Day',
		slug: 'earth-day',
		summary: 'Environmental observance.'
	},
	mothersDay: {
		title: 'Mother\u2019s Day',
		slug: 'mothers-day',
		summary: 'Common calendar observance.'
	},
	fathersDay: {
		title: 'Father\u2019s Day',
		slug: 'fathers-day',
		summary: 'Common calendar observance.'
	},
	halloween: {
		title: 'Halloween',
		slug: 'halloween',
		summary: 'Common calendar observance.'
	},
	newYearsEve: {
		title: 'New Year\u2019s Eve',
		slug: 'new-years-eve',
		summary: 'Common calendar observance.'
	}
};

const calendarObservanceDatesByYear = {
	2026: {
		valentinesDay: '2026-02-14',
		stPatricksDay: '2026-03-17',
		easterSunday: '2026-04-05',
		earthDay: '2026-04-22',
		mothersDay: '2026-05-10',
		fathersDay: '2026-06-21',
		halloween: '2026-10-31',
		newYearsEve: '2026-12-31'
	},
	2027: {
		valentinesDay: '2027-02-14',
		stPatricksDay: '2027-03-17',
		easterSunday: '2027-03-28',
		earthDay: '2027-04-22',
		mothersDay: '2027-05-09',
		fathersDay: '2027-06-20',
		halloween: '2027-10-31',
		newYearsEve: '2027-12-31'
	},
	2028: {
		valentinesDay: '2028-02-14',
		stPatricksDay: '2028-03-17',
		easterSunday: '2028-04-16',
		earthDay: '2028-04-22',
		mothersDay: '2028-05-14',
		fathersDay: '2028-06-18',
		halloween: '2028-10-31',
		newYearsEve: '2028-12-31'
	}
};