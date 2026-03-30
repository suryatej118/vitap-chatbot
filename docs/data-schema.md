# Data schema (v1)

## Category (v1)
We use a small set of categories for maintainability:

- `academic`
- `admin_services`
- `food`
- `hostel`
- `other`

## Start points
Stored in `data/start-points.json`:

- `version`: number
- `startPoints`: array of:
  - `start_id`: string (stable ID)
  - `name`: string
  - `description`: string (optional)

## Places
Stored in `data/places.json`:

- `version`: number
- `places`: array of `Place`

### Place
- `place_id`: string (unique, stable; UPPER_SNAKE_CASE)
- `name`: string
- `aliases`: string[] (include abbreviations and common spellings)
- `category`: one of `academic` | `admin_services` | `food` | `hostel` | `other`
- `location`:
  - `block`: `AB1` | `AB2` | `CB` | `""` (empty when not applicable)
  - `floor`: number | null (Ground = 0)
  - `room`: string | null (e.g., `G23`, `229`, `304`)
  - `landmark`: string | null (e.g., “Opposite AB2”)
- `hours`: `Hours` | null
- `notes`: string | null
- `is_verified`: boolean

## Hours (structured)
Stored per place under `hours`.

- `tz` must be `Asia/Kolkata`

### A) Unknown hours
Use `hours = null`.

### B) Always open (24/7)
```json
{ "tz": "Asia/Kolkata", "type": "always_open" }
```

### C) Weekly windows (multiple windows per day supported)
```json
{
  "tz": "Asia/Kolkata",
  "type": "weekly_windows",
  "days": {
    "mon": [{ "start": "09:00", "end": "13:00" }, { "start": "14:00", "end": "18:00" }],
    "tue": [{ "start": "09:00", "end": "18:00" }],
    "wed": [],
    "thu": [],
    "fri": [],
    "sat": [],
    "sun": []
  }
}
```

- `[]` means closed.
- Times are `HH:MM` (24-hour).
- Validation rule: `start < end`.
