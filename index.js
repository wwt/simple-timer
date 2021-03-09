window.addEventListener('load', app);

function app() {
    let path = location.pathname.replace('/simple-timer', '');
    let query = location.search;

    if (location.href.includes('#/')) {
        path = location.hash.split('?')[0].substr(1);
        query = '?' + location.hash.split('?')[1];
    }

    const until = parseUntil(path);
    const config = parseConfig(query);

    const DOM = {
        time: document.querySelector('#time'),
        until: document.querySelector('#until'),
        message: document.querySelector('#message'),
        form: document.querySelector('#form'),
        submit: document.querySelector('#submit'),
        create: document.querySelector('#create'),
    };

    if (!until) {
        DOM.form.classList.remove('hide');
        DOM.submit.addEventListener('click', createLink);
        return;
    }

    DOM.create.classList.remove('hide');

    const asDate = new Date(until);

    if (until - Date.now() > units.day) {
        DOM.until.innerHTML = 'Starting at ' + asDate.toLocaleDateString() + ' ' + asDate.toLocaleTimeString();
    } else {
        DOM.until.innerHTML = 'Starting at ' + asDate.toLocaleTimeString();
    }

    DOM.message.innerHTML = config.message;

    function setTimeRemaining() {
        const left = until - Date.now();

        if (left <= 0) return DOM.time.innerHTML = config.endMessage;
        if (left >= units.day) return DOM.time.innerHTML = config.startMessage;

        DOM.time.innerHTML = humanTime(left);
    }

    setInterval(setTimeRemaining, 1000);
    setTimeRemaining();

    let fullscreen = false;

    document.body.addEventListener('click', async (e) => {
        if (e.target === DOM.create) return;

        if (!fullscreen) {
            await document.body.requestFullscreen();
            fullscreen = true;
        } else {
            document.exitFullscreen();
            fullscreen = false;
        }
    });
}

const units = {
    'day': 24 * 60 * 60 * 1000,
    'hour': 60 * 60 * 1000,
    'min': 60 * 1000,
    'sec': 1000,
    'milli': 1,
}

const zeroPad = (n) => n < 10 ? `0${n}` : `${n}`;

function humanTime(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    if (hours) {
        return [hours, minutes - hours * 60, seconds - minutes * 60].map(zeroPad).join(':');
    }

    return [minutes, seconds - minutes * 60].map(zeroPad).join(':');
}

function parseDuration(str) {
    parts = str.split(' ');

    if (parts.length === 1) {
        return parseInt(parts[0]) * units.sec;
    }

    let dur = 0;
    for (let i = 0; i < parts.length; i += 2) {
        const partDur = parseInt(parts[i]);
        const partUnit = units[parts[i + 1]];
        dur += partDur * partUnit;
    }

    return dur;
}

function parseTime(str) {
    const parts = str.split(' ');

    let time = parseInt(parts[0]) * units.hour;
    if (parts.length === 1) return time;

    time += parseInt(parts[1]) * units.min;
    if (parts.length === 2) return time;

    time += parseInt(parts[2]) * units.sec;
    if (parts.length === 3) return time;

    return time + parseInt(parts[3]) * units.milli;
}

function parseUntil(url) {
    const now = Date.now();
    if (url.startsWith('/duration/')) {
        const dur = parseDuration(url.replace('/duration/', '').replace(/\//g, ' '));

        return now + dur;
    }

    if (url.startsWith('/time/')) {
        const today = new Date((new Date()).toDateString()).getTime();

        const atTime = parseTime(url.replace('/time/', '').replace(/\//g, ' '));

        return today + atTime > now ? today + atTime : today + units.day + atTime;
    }

    if (url.startsWith('/date/')) {
        const day = new Date(url.replace('/date/', '').split('/').slice(0, 3).join('-')).getTime();

        if (url.includes('/time/')) {
            const atTime = parseTime(url.split('/time/').pop().replace(/\//g, ' '));

            return day + atTime;
        }

        return day;
    }

    return null;
}

function parseConfig(query) {
    const config = {
        startMessage: 'Welcome',
        endMessage: 'Time to Start',
        message: 'The event will begin shortly.',
    };

    query.substr(1).split('&').forEach(pair => {
        const [key, value] = pair.split('=').map(decodeURIComponent);

        config[key] = value;
    })

    return config;
}

function createLink() {
    const inputs = [...document.querySelectorAll('#form input')];

    const values = inputs.reduce((values, input) => {
        const [group, key] = input.getAttribute('name').split('-');

        values[group] = values[group] || {};
        values[group][key] = /\d+/.test(input.value) ? parseInt(input.value) : input.value;

        return values;
    }, {});

    const config = {
        startMessage: values.config.start,
        endMessage: values.config.end,
        message: values.config.message,
    };

    const query = Object.entries(config).filter(([key, value]) => value).map(([key, value]) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }).join('&');

    if (values.dur.seconds) {
        location.hash = `/duration/${values.dur.seconds}` + (query ? `?${query}` : '');
        return location.reload();
    }

    if (values.dur.hour || values.dur.min || values.dur.sec) {
        let hash = '/duration';

        if (values.dur.hour) hash += `/${values.dur.hour}/hour`;
        if (values.dur.min) hash += `/${values.dur.min}/min`;
        if (values.dur.sec) hash += `/${values.dur.sec}/sec`;

        location.hash = `#${hash}` + (query ? `?${query}` : '');
        return location.reload();
    }

    let hash = '';

    if (values.time.hour || values.time.min || values.time.sec) {
        hash = `/time/${values.time.hour || 0}/${values.time.min || 0}/${values.time.sec || 0}`;
    }

    if (values.date.year) {
        hash = `/date/${values.date.year}/${values.date.month}/${values.date.day}` + hash;
    }

    location.hash = hash + (query ? `?${query}` : '');
    return location.reload();
}
