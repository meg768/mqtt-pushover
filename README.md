# mqtt-pushover

Publish a JSON payload to the configured MQTT topic to send a Pushover message.
The service only handles the exact topic from `MQTT_TOPIC`, for example `pushover`.

## Example

```json
{
  "title": "Build",
  "message": "Build finished",
  "token": "pushover-app-token"
}
```

If `token` is omitted, `PUSHOVER_TOKEN` from `.env` is used. If `user` is omitted,
`PUSHOVER_USER` from `.env` is used.

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
