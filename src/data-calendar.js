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
		id: 'holiday',
		label: 'Holiday',
		icon: 'fa-flag-usa',
		badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
	},
	{
		id: 'club',
		label: 'Club Event',
		icon: 'fa-users',
		badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200'
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

const federalHolidayDatesByYear = {
	2026: {
		newYearsDay: '2026-01-01',
		martinLutherKingJrDay: '2026-01-19',
		washingtonsBirthday: '2026-02-16',
		memorialDay: '2026-05-25',
		juneteenth: '2026-06-19',
		independenceDay: '2026-07-03',
		laborDay: '2026-09-07',
		columbusDay: '2026-10-12',
		veteransDay: '2026-11-11',
		thanksgivingDay: '2026-11-26',
		christmasDay: '2026-12-25'
	},
	2027: {
		newYearsDay: '2027-01-01',
		martinLutherKingJrDay: '2027-01-18',
		washingtonsBirthday: '2027-02-15',
		memorialDay: '2027-05-31',
		juneteenth: '2027-06-18',
		independenceDay: '2027-07-05',
		laborDay: '2027-09-06',
		columbusDay: '2027-10-11',
		veteransDay: '2027-11-11',
		thanksgivingDay: '2027-11-25',
		christmasDay: '2027-12-24'
	},
	2028: {
		newYearsDay: '2027-12-31',
		martinLutherKingJrDay: '2028-01-17',
		washingtonsBirthday: '2028-02-21',
		memorialDay: '2028-05-29',
		juneteenth: '2028-06-19',
		independenceDay: '2028-07-04',
		laborDay: '2028-09-04',
		columbusDay: '2028-10-09',
		veteransDay: '2028-11-10',
		thanksgivingDay: '2028-11-23',
		christmasDay: '2028-12-25'
	}
};