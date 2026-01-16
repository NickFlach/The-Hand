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

## Current Version: V3

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
- Attachments: Optional local file attachments (V2)
- Addenda: Notes added after 24-hour edit window

### V1 Features
1. **Patterns View** - Distribution of entries over time (weekly/monthly)
2. **Themes** - User-defined tags on entries
3. **Review Mode** - Manual review of entries with optional reflection
4. **Export** - Plain text and JSON export

### V2 Features (Continuity)
1. **Responsibility Threads** - Track ongoing responsibilities across time
   - User-created threads (e.g., "Mentoring junior engineers", "Caring for my father")
   - Link entries to responsibilities (many-to-many)
   - Close/reopen threads without data loss
   - No auto-suggestions, no prompts
2. **Long-Horizon View (Archive)** - Browse entries by year and month
   - Vertical scroll by year → month
   - Empty periods remain visible (silence is acceptable)
   - No charts, no summaries
3. **Artifact Attachments** - Attach local files to entries
   - Images, PDFs, text files
   - Local-only storage (no cloud)
   - No previews beyond filename/type

### V3 Features (Trusted Hands - Accountability Without Audience)
1. **Trusted Contacts** - Up to 3 people who witness, not respond
   - Manage contacts via Settings → Trusted Hands
   - Add display name and contact method (email/identifier)
   - Revoke access (past shares archived, future access removed)
2. **Share Entries** - Two-step intentional sharing flow
   - Select one trusted hand to share with
   - Provide reason for sharing (max 200 chars, required)
   - No quick-share options (intentional friction)
   - Shares are one-way (witness only, no replies)
3. **Witness Notes** - View shared entries and witness status
   - Shows which entries are shared and with whom
   - "Awaiting witness" status for pending shares
   - Witness notes (500 char max, one per share) when witnessed

### Feature Flags
Located in `client/lib/features.ts`:
- FEATURE_PATTERNS_V1 = true
- FEATURE_THEMES_V1 = true
- FEATURE_REVIEW_MODE_V1 = true
- FEATURE_EXPORT_V1 = true
- FEATURE_RESPONSIBILITY_THREADS_V2 = true
- FEATURE_LONG_HORIZON_VIEW_V2 = true
- FEATURE_ARTIFACT_ATTACHMENTS_V2 = true
- FEATURE_TRUSTED_HANDS_V3 = true
- FEATURE_MOMENTS_OF_POWER_V4 = false (scaffolded)
- FEATURE_ARCHIVE_MODE_V5 = false (scaffolded)

## Project Structure

```
client/
├── App.tsx                 # Root component with providers
├── components/             # Reusable UI components
│   ├── AddendumSheet.tsx   # Bottom sheet for adding notes
│   ├── AttachmentManager.tsx # File attachment UI (V2)
│   ├── EmptyState.tsx      # Empty state illustration
│   ├── EntryCard.tsx       # Entry list item
│   ├── ErrorBoundary.tsx   # Error handling wrapper
│   ├── FilterPills.tsx     # Entry type filter
│   ├── FormField.tsx       # Form input with label
│   ├── PatternBar.tsx      # Distribution visualization
│   ├── SettingsRow.tsx     # Settings list item
│   ├── ThemeEditor.tsx     # Theme tag editor
│   ├── ThreadLinker.tsx    # Thread linking UI (V2)
│   ├── TypeSelector.tsx    # Entry type selector
│   ├── ShareEntrySheet.tsx # Two-step share flow (V3)
│   └── WitnessNotes.tsx    # Display shared entries (V3)
├── constants/
│   └── theme.ts            # Colors, spacing, typography
├── hooks/
│   ├── useScreenOptions.ts # Navigation header options
│   └── useTheme.ts         # Theme hook
├── lib/
│   ├── features.ts         # Feature flags
│   ├── query-client.ts     # API client
│   └── storage.ts          # AsyncStorage operations + V2 thread/attachment functions
├── navigation/
│   └── RootStackNavigator.tsx # Stack navigation
├── screens/
│   ├── ArchiveScreen.tsx      # Long-horizon view (V2)
│   ├── EntryDetailScreen.tsx  # View/edit entry + thread linking + attachments
│   ├── ExportScreen.tsx       # Export data (V1)
│   ├── LedgerScreen.tsx       # Main entry list
│   ├── NewEntryScreen.tsx     # Create entry
│   ├── PatternsScreen.tsx     # Distribution view (V1)
│   ├── ReviewScreen.tsx       # Review mode (V1)
│   ├── SettingsScreen.tsx     # App settings (V1+V2+V3 tools)
│   ├── ThreadDetailScreen.tsx # Thread timeline view (V2)
│   ├── ThreadsScreen.tsx      # Responsibility threads list (V2)
│   └── TrustedHandsScreen.tsx # Manage trusted contacts (V3)
└── types/
    └── entry.ts            # Type definitions (V1+V2 types)

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
- Silence and gaps are acceptable

## Running the App

The app runs on two workflows:
- **Start Backend** (port 5000): Express server serving static Expo files
- **Start Frontend** (port 8081): Expo dev server with HMR

Data is stored locally using AsyncStorage with the following keys:
- `@thehand_entries`: Entry data (with attachments)
- `@thehand_settings`: User settings
- `@thehand_review_notes`: Review reflections
- `@thehand_user_themes`: User's theme history
- `@thehand_threads`: Responsibility threads (V2)
- `@thehand_thread_links`: Entry-thread relationships (V2)
- `@thehand_trusted_contacts`: Trusted contacts (V3)
- `@thehand_shared_entries`: Shared entry records (V3)
- `@thehand_trusted_notes`: Witness notes from contacts (V3)

Attachments are stored in the app's document directory at `FileSystem.documentDirectory/attachments/`.

## App Version

Current version: 1.3 (Settings → About)
