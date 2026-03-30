# vitap-chatbot

# VIT-AP Campus Navigator

A structured, maintainable dataset for campus locations and services at **VIT‑AP**.  
This repository/sheet pack is designed to power a campus directory, chatbot, website, or internal navigation tool with **consistent place IDs**, **room-level accuracy**, and **verifiable contact information**.

> Scope note: This data pack focuses on **places, locations, hours, emergency contacts, and verified club emails**.

---

## What this project provides

### 1) Places directory (room-aware)
A normalized list of campus places (offices, services, venues, food courts, etc.) with:
- `block` (AB1 / AB2 / CB)
- `floor` (Ground / 1 / 2 / 3 / …)
- `room` (e.g., `G23`, `229`, `304`)
- `landmark` (e.g., “Opposite AB2”, “Behind CB”)
- `aliases` for better search (e.g., “COE”, “Controller of Examinations”)

### 2) Operating hours
A separate hours table keyed by `place_id` to support:
- “Open now?” checks
- weekly schedules
- easy updates without touching the master `places` list

### 3) Start points (for navigation systems)
A canonical list of start points such as Main Gate and key blocks/hostels for future navigation features.

### 4) Emergency contacts (verified source list)
A dedicated table to store emergency/helpdesk contacts with clear ownership and update responsibility.

### 5) Official club allowlist
A verified allowlist of **official club email IDs** (vitap.ac.in) mapped to club names. This helps prevent misinformation and ensures students can contact legitimate chapters/associations.

---

## Data model / Tabs (recommended structure)

Maintain the dataset as an Excel/Google Sheets workbook with the following tabs:

1. **`places`**  
2. **`place_hours`**  
3. **`start_points`**  
4. **`emergency_contacts`**  
5. **`club_allowlist`**

Each tab can also be exported as CSV for easy integration into apps/bots/websites.

---

## Data quality rules

1. **Never guess.**  
   If a room/floor is uncertain, mark it explicitly as **TBD** in `notes`.

2. **Prefer structured fields over text.**  
   Put room/floor in `room`/`floor` columns—not in notes.

3. **Aliases matter.**  
   Add common abbreviations and alternate spellings to improve search.

4. **Change management.**  
   Room changes and office relocations should be recorded immediately. If possible, keep dated backups or version control exports.

---

## Current coverage (high level)
- Administrative and student-service locations with room-level details (where provided)
- Weekly hours for key services (library, food courts, medical room, etc.)
- Verified club allowlist (official emails) — **32 entries**

---

## For web/app/chatbot integration
Typical usage patterns:
- Search: match user query against `name` and `aliases`
- Display: show `block + floor + room + landmark`
- Hours: join `places.place_id = place_hours.place_id`
- Clubs: display verified contacts from `club_allowlist`

---

## License / Ownership
This dataset is intended for campus utility and internal/student support use.