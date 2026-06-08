# mqtt-pushover

Publish a JSON payload to the configured MQTT topic to send a Pushover message.

```json
{
  "title": "Build",
  "message": "Build finished",
  "token": "pushover-app-token"
}
```

If `token` is omitted, `PUSHOVER_TOKEN` from `.env` is used. If `user` is omitted,
`PUSHOVER_USER` from `.env` is used.
