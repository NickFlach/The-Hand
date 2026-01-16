# The Hand

A private, local-first ledger for recording what you built, who you helped, and what you learned—without performance or judgment.

## Overview

The Hand is a mobile app built with Expo React Native and Express.js backend. It follows strict principles of privacy, local-first storage, and no gamification.

### Core Principles (Non-Negotiable)
- Private by default
- Local-first (AsyncStorage)
- No scores, streaks, badges, or achievements
- No public feed or social features
- No notifications (except system-critical)
- No behavioral nudges
- User owns and can export all data
- Silence is acceptable

## Current Version: V1

### Entry Types
- **Built**: Created, repaired, improved, or completed something
- **Helped**: Assisted, taught, supported, or carried responsibility for someone
- **Learned**: A correction, mistake, insight, or hard truth absorbed

### Entry Structure
- Type: Built | Helped | Learned
- Affected: Who or what this impacted
- Cost: What it cost the user (time, effort, risk)
- Reflection: What they would do differently
- Themes: Optional user-defined tags (V1)
- Addenda: Notes added after 24-hour edit window

### V1 Features
1. **Patterns View** - Distribution of entries over time (weekly/monthly)
2. **Themes** - User-defined tags on entries
3. **Review Mode** - Manual review of entries with optional reflection
4. **Export** - Plain text and JSON export

### Feature Flags
Located in `client/lib/features.ts`:
- FEATURE_PATTERNS_V1 = true
- FEATURE_THEMES_V1 = true
- FEATURE_REVIEW_MODE_V1 = true
- FEATURE_EXPORT_V1 = true
- FEATURE_RESPONSIBILITY_THREADS_V2 = false (scaffolded)
- FEATURE_TRUSTED_HANDS_V3 = false (scaffolded)
- FEATURE_MOMENTS_OF_POWER_V4 = false (scaffolded)
- FEATURE_ARCHIVE_MODE_V5 = false (scaffolded)

## Project Structure

```
client/
├── App.tsx                 # Root component with providers
├── components/             # Reusable UI components
│   ├── AddendumSheet.tsx   # Bottom sheet for adding notes
│   ├── EmptyState.tsx      # Empty state illustration
│   ├── EntryCard.tsx       # Entry list item
│   ├── ErrorBoundary.tsx   # Error handling wrapper
│   ├── FilterPills.tsx     # Entry type filter
│   ├── FormField.tsx       # Form input with label
│   ├── PatternBar.tsx      # Distribution visualization
│   ├── SettingsRow.tsx     # Settings list item
│   ├── ThemeEditor.tsx     # Theme tag editor
│   └── TypeSelector.tsx    # Entry type selector
├── constants/
│   └── theme.ts            # Colors, spacing, typography
├── hooks/
│   ├── useScreenOptions.ts # Navigation header options
│   └── useTheme.ts         # Theme hook
├── lib/
│   ├── features.ts         # Feature flags
│   ├── query-client.ts     # API client
│   └── storage.ts          # AsyncStorage operations
├── navigation/
│   └── RootStackNavigator.tsx # Stack navigation
├── screens/
│   ├── EntryDetailScreen.tsx  # View/edit entry
│   ├── ExportScreen.tsx       # Export data (V1)
│   ├── LedgerScreen.tsx       # Main entry list
│   ├── NewEntryScreen.tsx     # Create entry
│   ├── PatternsScreen.tsx     # Distribution view (V1)
│   ├── ReviewScreen.tsx       # Review mode (V1)
│   └── SettingsScreen.tsx     # App settings
└── types/
    └── entry.ts            # Type definitions

server/
└── index.ts               # Express server (serves static Expo)
```

## Design Guidelines

### Aesthetic: Brutally Minimal
- Stark, essential, maximum whitespace
- Silent and respectful of the user's time
- Feels like a private journal, not a productivity app
- Inspired by blank notebooks, uncoated paper, graphite pencils

### Colors
- Background: #FAFAF8 (warm white, off-white paper)
- Text Primary: #2C2C2C (charcoal)
- Text Secondary: #6B6B66
- Divider: #E8E8E4 (subtle, warm gray)
- Badge Built: #4A4A45
- Badge Helped: #5A5A52
- Badge Learned: #3A3A36

### UX Rules
- Neutral tone only
- Never praise the user
- Never push daily usage
- No "Congrats" messages
- Empty states should be calm

## Running the App

The app runs on two workflows:
- **Start Backend** (port 5000): Express server serving static Expo files
- **Start Frontend** (port 8081): Expo dev server with HMR

Data is stored locally using AsyncStorage with the following keys:
- `@thehand_entries`: Entry data
- `@thehand_settings`: User settings
- `@thehand_review_notes`: Review reflections
- `@thehand_user_themes`: User's theme history
