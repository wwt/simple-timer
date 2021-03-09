# Timer

A simple timer web page to show a countdown on your screen.

Install: `npm ci`
Run: `npm start`

## Usage

The timer is completely URL driven where the path drives the time and the query string drives the configuration.

### URL Patterns

Supported urls:

 - `/duration/<sec>`: starts a timer of a given number of seconds after page refresh. Refreshing restarts the timer.
 - `/duration/<hour>/hour/<min>/min/<sec>/sec`: starts a timer of the given duration for the given units. Do not have to specify any particular part.
 - `/duration/<hour>/hour/<min>/min`
 - `/duration/<min>/min`
 - `/time/<hour>/<min>/<sec>`: starts a timer for the next time the local clock will read the given time. Do not have to specify minutes or seconds.
 - `/time/<hour>/<min>`
 - `/time/<hour>`
 - `/date/<yyyy>/<MM>/<dd>`: starts a timer for midnight of the given date.
 - `/date/<yyyy>/<MM>/<dd>/time/<hour>/hour/<min>/min`: optionally can add a time to the end of a date.

Supported query config:

 - `message`: message to display below timer. Default: `The event will begin shortly.`
 - `endMessage`: message to display after timer completes. Default: `Time to Start`
 - `startMessage`: message to display before the 24 hour period of timer. Default: `Welcome`
