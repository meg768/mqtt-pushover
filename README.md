# mqtt-pushover

Publish a JSON payload to the configured MQTT topic to send a Pushover message.
The service handles the root topic from `MQTT_TOPIC`, for example `pushover`,
and a few semantic subtopics under it.
The service connects with MQTT 5 and asks the broker not to deliver retained
messages when subscribing, so restarts do not replay old notifications.

## Example

Normal notification:

```json
{
  "title": "Build",
  "message": "Build finished",
  "token": "pushover-app-token"
}
```

Publish it to `pushover/notify`, or to the root `pushover` topic for backwards
compatibility.

If `token` is omitted, `PUSHOVER_TOKEN` from `.env` is used. If `user` is omitted,
`PUSHOVER_USER` from `.env` is used.

## Topics

With `MQTT_TOPIC=pushover`:

- `pushover`: backwards-compatible general message topic, default priority `0`.
- `pushover/message`: general message topic, default priority `0`.
- `pushover/notify`: normal notification, default priority `0`.
- `pushover/warning`: warning notification, default priority `1`.
- `pushover/alarm`: emergency alarm, default priority `2`.

All topics accept the same JSON payload. If the payload includes `priority`, it
overrides the topic default. For `pushover/alarm`, `retry` defaults to `60` and
`expire` defaults to `3600` when priority is `2`.

## Environment

```env
MQTT_HOST=mqtt://example.local
MQTT_PORT=1883
MQTT_USERNAME=username
MQTT_PASSWORD=password
MQTT_TOPIC=pushover
PUSHOVER_USER=your-user-or-group-key
PUSHOVER_TOKEN=your-default-app-token
```

## JSON Parameters

Required:

- `message`: notification text.

Authentication:

- `token`: Pushover application API token. Defaults to `PUSHOVER_TOKEN`.
- `user`: Pushover user or group key. Defaults to `PUSHOVER_USER`.

Optional Pushover fields:

- `title`: message title. If omitted, Pushover uses the application name for the token.
- `device`: target device name. If omitted, Pushover sends to all active devices.
- `sound`: notification sound name.
- `priority`: priority value, one of `-2`, `-1`, `0`, `1`, or `2`.
- `html`: set to `1` to enable Pushover HTML parsing.
- `timestamp`: Unix timestamp to display instead of the API receive time.
- `ttl`: seconds before the message is deleted automatically.
- `url`: supplementary URL.
- `url_title`: label for `url`.

Emergency priority:

- `priority: 2` also requires `retry` and `expire`.
- `retry`: seconds between repeated emergency notifications.
- `expire`: seconds before emergency notifications stop retrying.

Attachments:

- `file`: local image path or file object supported by `pushover-notifications`.
- Pushover's raw `attachment_base64` API field is not explicitly handled by this service yet.

Any other fields in the JSON payload are passed through to the Pushover library.
