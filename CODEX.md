# Codex Context

## Project

`mqtt-pushover` is a Node.js bridge from MQTT to Pushover notifications.

It subscribes below a configurable MQTT root topic, defaulting to `MQTT_TOPIC`, and sends incoming plain-text or JSON payloads through the Pushover API.

The service uses MQTT 5 subscription option `rh: 2` and also ignores retained packets in the message handler, so restarts should not replay old retained notifications.

## Repository

- Local path: `/Users/magnus/Documents/GitHub/mqtt-pushover`
- GitHub repository: `meg768/mqtt-pushover`
- Runtime entrypoint: `app.js`
- Main dependencies: `mqtt-ex`, `pushover-notifications`, `dotenv`, `yargs`
- `test.js` exists but is empty.

## Run

Install dependencies:

```bash
npm install
```

Syntax check:

```bash
node --check app.js
```

Run directly:

```bash
node app.js
```

There is no `npm start` script at the time this context was written.

## Configuration

Environment variables used by `app.js`:

- `MQTT_HOST`: MQTT broker URL/host
- `MQTT_PORT`: MQTT broker port
- `MQTT_USERNAME`: MQTT username
- `MQTT_PASSWORD`: MQTT password
- `MQTT_TOPIC`: root topic, e.g. `pushover`
- `PUSHOVER_USER`: default Pushover user/group key
- `PUSHOVER_TOKEN`: default Pushover app token

Do not commit `.env`.

The CLI can override MQTT settings:

```bash
node app.js --host mqtt://example.local --port 1883 --topic pushover --debug
```

## MQTT Contract

With `MQTT_TOPIC=pushover`, accepted topics are:

- `pushover`: backwards-compatible root message route, default priority `0`
- `pushover/message`: general message route, default priority `0`
- `pushover/notification`: low-priority notification, default priority `-1`
- `pushover/warning`: warning route, default priority `1`
- `pushover/alarm`: emergency route, default priority `2`

Payloads may be plain text or JSON.

Plain text becomes:

```json
{ "message": "text" }
```

JSON may include Pushover fields such as `message`, `title`, `priority`, `sound`, `url`, `url_title`, `device`, `html`, `timestamp`, `ttl`, `retry`, `expire`, `token`, and `user`.

If `token` or `user` are omitted, `PUSHOVER_TOKEN` and `PUSHOVER_USER` are used. For priority `2`, the service supplies default `retry: 60` and `expire: 3600` when omitted.

## Deployment Notes

2026-06-30: A copy exists on `pi-kato` at `/home/pi/mqtt-pushover` with `.env` and dependencies installed. PM2 had no running `mqtt-pushover` process when checked with `pm2 list`, so do not assume this service is active in production unless re-verified.

The `pi-kato` working copy was at commit `1bd37f6 Remove notify topic alias` when checked, matching the current local latest commit at that time.

If running under PM2, prefer an explicit command rather than package scripts:

```bash
pm2 start app.js --name mqtt-pushover
pm2 save
```

## Gotchas

- Package scripts include `git-revert`, which runs `git reset --hard HEAD`. Do not use it casually.
- Package scripts include `git-commit`, which commits everything with message `-`. Prefer normal explicit git commands.
- The old `notify` topic alias was removed. Use `notification`.
- The service subscribes to `${MQTT_TOPIC}/#`, so the root topic itself is handled in code but may not be delivered by that wildcard subscription depending on broker behavior. README says the root topic is supported for backwards compatibility; verify before relying on it.
- Pushover emergency priority `2` has stricter API requirements; this service adds default `retry` and `expire`, but caller-provided values should still be reasonable.
