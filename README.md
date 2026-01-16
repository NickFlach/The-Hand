# The Hand

A private ledger for recording what you built, who you helped, and what you learned.

No scores. No streaks. No audience.

---

## What This Is

The Hand is a personal record. It exists for one purpose: to hold what you did, so you don't have to.

You built something. You helped someone. You learned a hard truth. Write it down. Move on.

This is not a productivity app. There are no goals to hit, no habits to track, no graphs climbing upward. The Hand doesn't care how often you use it. It won't remind you. It won't congratulate you.

It will remember.

---

## What This Is Not

- **Not social.** There is no feed. No followers. No likes.
- **Not gamified.** No points. No badges. No streaks to maintain.
- **Not cloud-synced.** Your data stays on your device. You own it completely.
- **Not optimized for engagement.** Silence is acceptable. Gaps in your ledger are not failures.

---

## The Three Types

Every entry is one of three things:

**Built**
You made something. Fixed something. Shipped something. Finished something that wasn't finished before.

**Helped**
You carried weight for someone else. Taught. Supported. Showed up when it would have been easier not to.

**Learned**
A correction. A mistake absorbed. An insight that cost something to acquire.

---

## The Structure

Each entry asks four things:

1. **What type?** Built, Helped, or Learned.
2. **Who or what was affected?** The person, project, or thing this touched.
3. **What did it cost you?** Time. Effort. Risk. Discomfort.
4. **What would you do differently?** Reflection, not regret.

That's it. No ratings. No categories beyond the three. No required daily check-ins.

---

## The 24-Hour Window

You have 24 hours to edit an entry after creating it. After that, it locks.

This is intentional. The past should not be endlessly revised. What happened, happened.

If you need to add context later, you can attach an addendum—a note that sits alongside the original, clearly marked as added after the fact.

---

## Trusted Hands (V3)

Sometimes you need a witness. Not an audience. Not feedback. Just someone who knows.

You can designate up to three Trusted Hands—people who can see entries you choose to share with them. They cannot reply. They cannot comment. They can only witness.

Sharing requires intention:
1. Choose one person.
2. State why you're sharing.
3. Confirm.

There are no quick-share buttons. No notifications when they view it. No read receipts.

They see it once. That's enough.

---

## Responsibility Threads (V2)

Some work spans months or years. Caring for a parent. Mentoring someone. Maintaining a system everyone depends on.

Threads let you connect entries across time to a single ongoing responsibility. You create the thread. You name it. You link entries as you see fit.

Threads can be closed when the responsibility ends. They can be reopened if it returns. The entries remain regardless.

---

## The Archive

Everything you record is browsable by time. Year by year. Month by month.

Empty months appear as empty months. This is correct. Not every month contains something worth recording. The absence of entries is not a problem to solve.

---

## Patterns

If you want to see distribution—how many Built vs Helped vs Learned entries over a period—you can. Weekly. Monthly.

No insights. No suggestions. No "you're doing great" or "try to help more people." Just the shape of what you recorded.

---

## Export

Your data is yours. Export it anytime as plain text or structured JSON. Take it somewhere else. Delete the app. The record belongs to you.

---

## Design Principles

The Hand follows a few rules without exception:

- **Private by default.** Nothing leaves your device unless you explicitly share it.
- **Local-first.** No accounts. No servers holding your data. No sync.
- **No behavioral nudges.** No "You haven't logged in 3 days!" No push notifications.
- **Neutral tone.** The app never praises you. It never scolds you. It simply records.
- **Silence is acceptable.** Going weeks without an entry is fine. The app won't guilt you.

---

## Technical Notes

Built with Expo (React Native) and Express.js. Data stored locally via AsyncStorage.

```
client/           # React Native app
├── components/   # UI components
├── screens/      # App screens
├── lib/          # Storage, features, utilities
└── types/        # TypeScript definitions

server/           # Express backend (serves static files)
```

Runs on two workflows:
- Backend on port 5000
- Frontend on port 8081

---

## Version

1.3

---

## Final Note

The Hand exists because some things deserve to be recorded even when no one else will see them.

You don't need an audience to do meaningful work. You don't need streaks to build discipline. You don't need points to prove your value.

You just need a place to put it down.

This is that place.

---

*A private ledger. Nothing more. Nothing less.*
