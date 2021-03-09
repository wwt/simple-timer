window.addEventListener('load', app);

function app() {
    const until = parseUntil(location.pathname);
    const config = parseConfig(location.search);

    const DOM = {
        time: document.querySelector('#time'),
        until: document.querySelector('#until'),
        message: document.querySelector('#message'),
    };

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
}

let fullscreen = false;

document.addEventListener('click', async () => {
    if (!fullscreen) {
        await document.body.requestFullscreen();
        fullscreen = true;
    } else {
        document.exitFullscreen();
        fullscreen = false;
    }
});

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
