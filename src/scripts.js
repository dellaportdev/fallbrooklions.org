function renderMembers() {
    const container = document.getElementById('members');
    container.innerHTML = '';

    members.forEach(({ name, role, image }) => {
        const avatarWrapper = document.createElement('div');
        avatarWrapper.className = 'h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400';

        if (image) {
            const img = document.createElement('img');
            img.src = memberPhotoPath + image;
            img.alt = name + ', ' + role;
            img.className = 'h-12 w-12 rounded-full object-cover border-2 border-gray';

            avatarWrapper.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-user';

            avatarWrapper.appendChild(icon);
        }

        const nameEl = document.createElement('p');
        nameEl.className = 'font-semibold text-gray-800';
        nameEl.innerText = name;

        const roleEl = document.createElement('p');
        roleEl.className = 'text-gray-500 text-sm';

        if (role && role.indexOf(',') !== -1) {
            roleEl.innerHTML = role.split(',').map(r => r.trim()).join('<br>');
        } else {
            roleEl.innerText = role;
        }


        const info = document.createElement('div');
        info.appendChild(nameEl);
        info.appendChild(roleEl);

        const card = document.createElement('div');
        card.className = 'flex items-center space-x-4';
        card.appendChild(avatarWrapper);
        card.appendChild(info);

        container.appendChild(card);
    });
}

function renderPhotos() {
    const container = document.getElementById('activity-photos');
    container.innerHTML = '';

    photos.forEach(({ file, caption }) => {
        const a = document.createElement('a');
        a.href = photoPath + file;
        a.target = '_blank';
        a.className = 'block';

        const img = document.createElement('img');
        img.src = photoPath + file;
        img.alt = caption;
        img.className = 'mx-auto shadow-lg border-2';

        a.appendChild(img);

        const figcap = document.createElement('p');
        figcap.className = 'text-center text-sm text-gray-700';
        figcap.innerText = caption;

        const imgWrap = document.createElement('div');
        imgWrap.className = 'swiper-slide-img-wrap';
        imgWrap.appendChild(img);

        a.appendChild(imgWrap);
        a.appendChild(figcap);

        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.appendChild(a);

        container.appendChild(slide);
    });
}

function renderNextMeetingDate() {
    const now = new Date();

    const pacificParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
    }).formatToParts(now).reduce((a, p) => {
        if (p.type !== 'literal') a[p.type] = parseInt(p.value, 10);
        return a;
    }, {});

    const yr = pacificParts.year;
    const mo = pacificParts.month;
    const dy = pacificParts.day;
    const hr = pacificParts.hour;

    function findNext(year) {
        const list = datesByYear[year] || [];
        if (!list.length) return null;

        if (year > yr) {
            return { year, ds: list[0] };
        }

        const todayKey = `${String(mo).padStart(2, '0')}-${String(dy).padStart(2, '0')}`;
        const todayNumber = mo * 100 + dy;

        const next = list.find(ds => {
            const [m, d] = ds.split('-').map(Number);
            const meetingNumber = m * 100 + d;
            if (ds === todayKey) return hr < 19;
            return meetingNumber > todayNumber;
        });

        return next ? { year, ds: next } : null;
    }

    let found = findNext(yr);
    if (!found) found = findNext(yr + 1);
    if (!found) return;

    const [mm, dd] = found.ds.split('-').map(Number);
    const monthName = new Date(found.year, mm - 1, 1).toLocaleString('default', { month: 'long' });

    document.getElementById('next-meeting').innerHTML =
        `Next Meeting: Tuesday, ${monthName} ${dd}`;
}

function renderMinutes(year) {
    const dates = datesByYear[year] || [];
    const year2 = year.toString().slice(2);
    const minutesGrid = document.getElementById('minutes-grid-' + year);
    minutesGrid.innerHTML = '';
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    var months = {};
    for (var i = 0; i < 12; i++) {
        var name = new Date(year, i, 1).toLocaleString('default', { month: 'long' });
        months[name] = [];
    }

    dates.forEach(d => {
        const parts = d.split('-');
        const m = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        const dt = new Date(year, m - 1, day);
        const monthName = new Date(year, m - 1, 1).toLocaleString('default', { month: 'long' });
        months[monthName].push({ d, day, dt });
    });

    Object.keys(months).forEach(monthName => {
        const monthDiv = document.createElement('div');
        const h4 = document.createElement('h4');
        h4.className = 'text-sm uppercase text-gray-500 mb-2';
        h4.innerText = monthName;
        monthDiv.appendChild(h4);

        const ul = document.createElement('ul');
        ul.className = 'space-y-2';

        months[monthName].forEach(obj => {
            const d = obj.d;
            const day = obj.day;
            const dt = obj.dt;
            const a = document.createElement('a');
            const fileName = `/minutes/${d}-${year2} Fallbrook Ranch Lions Club meeting minutes.pdf`;
            a.href = fileName;
            a.target = '_blank';

            if (dt < todayMidnight) {
                a.className = 'flex items-center space-x-2 whitespace-nowrap text-blue-500 hover:underline';
            } else {
                a.className = 'flex items-center space-x-2 whitespace-nowrap text-gray-400 pointer-events-none';
            }

            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-file-pdf';
            a.appendChild(icon);

            const span = document.createElement('span');
            span.innerText = monthName + ' ' + day;
            a.appendChild(span);

            const li = document.createElement('li');
            li.appendChild(a);
            ul.appendChild(li);

            if (dt < todayMidnight) {
                fetch(fileName, { method: 'HEAD' }).then(r => {
                    if (!r.ok) {
                        a.classList.remove('text-blue-500', 'hover:underline');
                        a.classList.add('text-gray-400', 'pointer-events-none');
                        a.removeAttribute('href');
                    }
                }).catch(() => {
                    a.classList.remove('text-blue-500', 'hover:underline');
                    a.classList.add('text-gray-400', 'pointer-events-none');
                    a.removeAttribute('href');
                });
            }
        });

        monthDiv.appendChild(ul);
        minutesGrid.appendChild(monthDiv);
    });
}

function renderMeetingNotices() {
    var container = document.getElementById('meeting-notices');
    container.innerHTML = '';

    var now = new Date();

    meetingNotices.forEach(function (notice) {
        var start = notice.start ? new Date(notice.start) : null;
        var end = notice.end ? new Date(notice.end) : null;

        var show = true;

        if (start && now < start) show = false;
        if (end && now >= end) show = false;

        if (show) {
            var div = document.createElement('div');
            div.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-md';

            var title = document.createElement('p');
            title.className = 'font-bold';
            title.textContent = 'Notice';

            var msg = document.createElement('p');
            msg.textContent = notice.text;

            div.appendChild(title);
            div.appendChild(msg);

            container.appendChild(div);
        }
    });
}

function initSwiper() {
    new Swiper('.swiper-container', {
        loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    });
}

function mailTo(name) {
    const member = members.find(m => m.name === name);
    if (member && member.email) {
        window.location.href = "mailto:" + member.email;
    } else {
        alert("We don't have an email on file for " + name + " at the time.");
    }
}

function initMinutesSystem() {
    var minutesTabs = document.getElementById('minutes-tabs');
    var minutesPanels = document.getElementById('minutes-panels');
    var panelEl = document.getElementById('minutes-panel');
    var toggle = document.getElementById('minutes-toggle');
    var chevron = document.getElementById('minutes-chevron');
    var minutesLoadedByYear = {};

    var years = Object.keys(datesByYear || {})
        .map(function (n) { return parseInt(n, 10); })
        .sort(function (a, b) { return a - b; });

    var currentYear = new Date().getFullYear();
    var activeYear = years.indexOf(currentYear) !== -1 ? currentYear : years[years.length - 1];

    years.forEach(function (y, i) {
        var tab = document.createElement('button');
        tab.id = 'tab-' + y;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', 'panel-' + y);
        tab.textContent = y;
        if (i === 0) {
            tab.className = 'px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600';
            tab.setAttribute('aria-selected', 'true');
        } else {
            tab.className = 'px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-800';
            tab.setAttribute('aria-selected', 'false');
        }
        minutesTabs.appendChild(tab);

        var panel = document.createElement('div');
        panel.id = 'panel-' + y;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', 'tab-' + y);
        if (i !== 0) panel.classList.add('hidden');

        var h3 = document.createElement('h3');
        h3.className = 'text-lg font-bold';
        h3.textContent = 'Meeting Minutes ' + y;
        panel.appendChild(h3);

        var grid = document.createElement('div');
        grid.id = 'minutes-grid-' + y;
        grid.className = 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-md mt-2';
        panel.appendChild(grid);

        minutesPanels.appendChild(panel);
    });

    function setActiveYear(year) {
        activeYear = year;
        years.forEach(function (y) {
            var tab = document.getElementById('tab-' + y);
            var panel = document.getElementById('panel-' + y);
            if (!tab || !panel) return;
            if (y === year) {
                tab.className = 'px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600';
                tab.setAttribute('aria-selected', 'true');
                panel.classList.remove('hidden');
                if (!minutesLoadedByYear[y] && typeof renderMinutes === 'function') {
                    renderMinutes(y);
                    minutesLoadedByYear[y] = true;
                }
            } else {
                tab.className = 'px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-800';
                tab.setAttribute('aria-selected', 'false');
                panel.classList.add('hidden');
            }
        });
        if (panelEl && panelEl.style.maxHeight && panelEl.style.maxHeight !== '0px') {
            panelEl.style.maxHeight = panelEl.scrollHeight + 'px';
        }
    }

    if (years.length) setActiveYear(activeYear);

    years.forEach(function (y) {
        var tab = document.getElementById('tab-' + y);
        if (!tab) return;
        tab.addEventListener('click', function () {
            setActiveYear(y);
        });
    });

    if (toggle && panelEl && chevron) {
        toggle.addEventListener('click', function () {
            var isOpen = panelEl.style.maxHeight && panelEl.style.maxHeight !== '0px';
            if (isOpen) {
                panelEl.style.maxHeight = '0px';
                chevron.style.transform = 'rotate(0deg)';
            } else {
                if (!minutesLoadedByYear[activeYear] && typeof renderMinutes === 'function') {
                    renderMinutes(activeYear);
                    minutesLoadedByYear[activeYear] = true;
                }
                panelEl.style.maxHeight = panelEl.scrollHeight + 'px';
                chevron.style.transform = 'rotate(180deg)';
            }
        });
    }
}
function isTodayWithinRange(dateStart, dateEnd) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const hasStart = !!dateStart;
  const hasEnd = !!dateEnd;

  if (!hasStart && !hasEnd) return true;

  let start = null;
  let end = null;

  if (hasStart) {
    const parts = dateStart.split('-');
    start = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  if (hasEnd) {
    const parts = dateEnd.split('-');
    end = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  if (start && today < start) return false;
  if (end && today > end) return false;

  return true;
}

document.addEventListener('DOMContentLoaded', function () {
    renderNextMeetingDate();
    renderMembers();
    renderPhotos();
    initSwiper();
    initMinutesSystem();
    renderMeetingNotices();

    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
            this.style.display = 'none';
        });
    });

    document.querySelectorAll('[data-hideafter],[data-hidebefore]').forEach(function (el) {
        var now = new Date();
        var hideAfter = el.getAttribute('data-hideafter');
        var hideBefore = el.getAttribute('data-hidebefore');
        if (hideAfter) {
            var afterDate = new Date(hideAfter);
            if (now >= afterDate) el.style.display = 'none';
        }
        if (hideBefore) {
            var beforeDate = new Date(hideBefore);
            if (now < beforeDate) el.style.display = 'none';
        }
    });
});