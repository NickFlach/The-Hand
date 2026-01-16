# The Hand — Design Guidelines

## Brand Identity

**Purpose**: A private ledger for recording what you built, who you helped, and what you learned—without performance or judgment.

**Aesthetic Direction**: **Brutally Minimal**
- Stark, essential, maximum whitespace
- Silent and respectful of the user's time
- Feels like a private journal, not a productivity app
- Inspired by blank notebooks, uncoated paper, graphite pencils

**Memorable Element**: The SILENCE. No praise, no judgment, no nudging. The app does nothing unless the user acts first. This restraint is the product's signature.

---

## Navigation Architecture

**Root Navigation**: Stack-only (single-purpose tool)

**Screen List**:
1. **Ledger** (home) - Chronological list of all entries
2. **New Entry** - Modal form to record Built/Helped/Learned
3. **Entry Detail** - View/edit single entry (editable for 24h)
4. **Settings** - Export data, accessibility, about

**No Authentication**: Local-first, private. No login required.

---

## Screen-by-Screen Specifications

### 1. Ledger (Home Screen)
**Purpose**: View all recorded entries in reverse chronological order.

**Layout**:
- Header: Transparent, title "The Hand", right button "+" (to create entry)
- Main content: Scrollable list
- Filter pills at top: All | Built | Helped | Learned (pill style, not tabs)
- Safe area: top = headerHeight + 24, bottom = insets.bottom + 24

**Components**:
- Entry card (for each item):
  - Type badge (small, uppercase, neutral)
  - Timestamp (relative if <7 days, else date)
  - "Affected" preview (1 line, truncated)
  - Tap card → Entry Detail
- Empty state (when no entries): Illustration + "The Hand is ready when you are."

**Empty State**: Show `empty-ledger.png` centered with neutral message.

---

### 2. New Entry (Modal)
**Purpose**: Record a new Built/Helped/Learned entry.

**Layout**:
- Header: Title "New Entry", left "Cancel", right "Save" (disabled until type selected)
- Main content: Scrollable form
- Safe area: top = 16, bottom = insets.bottom + 24

**Components**:
1. Type selector (segmented control): Built | Helped | Learned
2. Form fields (after type selected):
   - "Affected" — Who or what this impacted (text input, 2–3 sentences max)
   - "Cost" — What it cost you (text input, 2–3 sentences max)
   - "Reflection" — What you would do differently (text input, 2–3 sentences max)
3. Character counters (subtle, below each field)
4. Submit/Cancel buttons in header (not below form)

**Behavior**: Auto-save timestamp on submit. Dismiss modal on save or cancel.

---

### 3. Entry Detail
**Purpose**: View full entry. Edit if <24h old, append addendum if >24h.

**Layout**:
- Header: Default navigation, right "Edit" (if <24h) or "Add Note" (if >24h)
- Main content: Scrollable view
- Safe area: top = 16, bottom = insets.bottom + 24

**Components**:
- Type badge + timestamp
- "Affected" (full text)
- "Cost" (full text)
- "Reflection" (full text)
- If >24h and addendum exists: "Addendum" section (italic, timestamped)
- If edit mode: Form fields become editable, header shows "Cancel" / "Save"

**Addendum Flow**: If >24h, "Add Note" opens bottom sheet with single text field. Append-only, timestamped separately.

---

### 4. Settings
**Purpose**: Export data, accessibility, app info.

**Layout**:
- Header: Default navigation, title "Settings"
- Main content: Scrollable list
- Safe area: top = 16, bottom = insets.bottom + 24

**Components**:
- Export Data (button → share JSON + plain text file)
- High Contrast Mode (toggle)
- About The Hand (link → opens modal with version, principles)
- No profile, no account, no cloud sync options

---

## Color Palette

**Principle**: Neutral, paper-like, no saturation. Feels like graphite on uncoated stock.

```
Primary: #2C2C2C (charcoal, for text)
Background: #FAFAF8 (warm white, off-white paper)
Surface: #FFFFFF (cards, modals)
Divider: #E8E8E4 (subtle, warm gray)
Text Primary: #2C2C2C
Text Secondary: #6B6B66
Accent (type badges): 
  - Built: #4A4A45 (dark warm gray)
  - Helped: #5A5A52 (medium warm gray)
  - Learned: #3A3A36 (darkest warm gray)
Error (validation): #8B4F47 (muted terracotta)
```

---

## Typography

**Fonts**: 
- **Primary**: System default (SF Pro on iOS, Roboto on Android) — legible, neutral
- **Monospace**: SF Mono / Roboto Mono (for timestamps)

**Type Scale**:
```
Heading 1: 28pt, Bold, tight line height
Heading 2: 20pt, Semibold
Body: 16pt, Regular, 1.5 line height
Caption: 13pt, Regular, uppercase for labels
Timestamp: 12pt, Monospace, medium weight
```

---

## Visual Design

**Icons**: Feather icons only (minimal, 24px)
- Plus (create entry)
- Filter (optional, if needed)
- Share (export)
- Edit (pencil)

**Touchable Feedback**: Subtle opacity change (0.6) on press. No shadows on list items.

**Spacing**: Generous. Minimum 24px between sections. Maximum whitespace around content.

**Cards**: Flat, no shadows. 1px border in Divider color. 12px border radius.

---

## Assets to Generate

1. **icon.png** — App icon
   - Depicts: Simple hand silhouette, open palm, centered on warm white
   - Used: Device home screen

2. **splash-icon.png** — Launch screen icon
   - Depicts: Same hand silhouette as app icon
   - Used: App launch

3. **empty-ledger.png** — Empty state for ledger
   - Depicts: Blank journal page with subtle corner fold, no text
   - Used: Ledger screen when no entries exist

4. **about-illustration.png** — About screen header
   - Depicts: Hand holding pencil, minimal line art
   - Used: Settings → About modal

**Style Notes**: All illustrations must be line art, warm gray (#6B6B66), minimal detail. No color, no shading. Quiet and unobtrusive.