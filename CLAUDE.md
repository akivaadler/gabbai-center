# Gabbai Center — Development Notes

## Stack
- Next.js 14 App Router + TypeScript
- Prisma 5 + SQLite (portable to PostgreSQL)
- Tailwind CSS v3 + shadcn/ui (manual component setup)
- NextAuth.js v4 (JWT, credentials provider)
- @hebcal/core v6 for Hebrew calendar

## Node.js Compatibility
This project requires Node.js >= 18. It was built with Node 18.20.4.
Prisma 5 supports Node 18. If upgrading to Prisma 6+, you'll need Node >= 20.

## Running Locally
```bash
npm install
npx prisma generate
DATABASE_URL="file:./dev.db" npx prisma db push
DATABASE_URL="file:./dev.db" npx prisma db seed
npm run dev
```

## Login Credentials (seed data)
- Gabbai:  gabbai@shul.local / changeme
- Member:  member@shul.local / changeme

## Key Conventions
- Hebrew month numbering: @hebcal/core uses months 1-13 where 1=Nisan, 7=Tishrei
- All Hebrew dates stored as hebrewDay + hebrewMonth + optional hebrewYear
- Gabbai notes on Member are NEVER shown in member portal
- Reminder thresholds are stored in Setting table, never hardcoded
- Payment integration: see DonationPaymentButton component (Stripe stub — Phase 5)

## Project Structure
- `app/(gabbai)/` — Gabbai-only routes (auth guarded, GABBAI role required)
- `app/(member)/` — Member portal routes (any authenticated user)
- `app/api/members/` — REST API for member CRUD
- `components/hebrew/` — Hebrew date/name components with RTL support
- `components/members/` — Member table, form, and card components
- `components/layout/` — Sidebar and header for gabbai layout
- `lib/hebrew.ts` — @hebcal/core utilities
- `lib/auth.ts` — NextAuth config with GABBAI/MEMBER roles
- `prisma/schema.prisma` — Full data model for all phases

## Hebrew Text
- Hebrew text uses `dir="rtl"` and `lang="he"` attributes
- Font: Frank Ruhl Libre (loaded from Google Fonts in app/layout.tsx)
- The `HebrewNameDisplay` component wraps Hebrew text with proper attributes
- The `HebrewDatePicker` component uses @hebcal/core for month/day validation

## @hebcal/core Usage
The library is ESM-only. In Next.js server components it works fine.
Key exports used:
- `HDate` — Hebrew date object (takes a JS Date or day/month/year)
- `HebrewCalendar.calendar({ start, end, mask: flags.PARSHA_HASHAVUA })` — get parsha
- `gematriya(num)` — format number as Hebrew letters with geresh/gershayim
- `HDate.isLeapYear(year)` — check if Hebrew year has Adar II
- `HDate.daysInMonth(month, year)` — max days in a given Hebrew month
- `hdate.renderGematriya()` — full Hebrew date as "ד׳ ניסן תשפ״ו"

## Tailwind Notes
- Custom colors: navy (50-950) and gold (50-900) defined in tailwind.config.ts
- CSS variables for shadcn/ui components defined in app/globals.css
- Uses Tailwind v3 (not v4) for Node 18 compatibility

## Phases
- Phase 1: Complete — scaffold, auth, members, Hebrew dates
- Phase 2: Complete — life events, schedule, minyan, kibbudim
- Phase 3: Complete — donations, PDF receipts, announcements
- Phase 4: Complete — reminders, email, member portal
- Phase 5: Complete — print view (Shabbos Sheet), Stripe stub, mobile UX, Hebrew/English toggle across all pages

## Phase 5 Notes
- Hebrew/English toggle: All pages use `useLang()` from `LanguageProvider`. Server components serialize data and pass to client wrappers.
- `lib/i18n.ts` — Full translation file with all keys for both en and he.
- Print view: `app/(gabbai)/schedule/[id]/print/` — auto-triggers `window.print()`, A4 layout, bilingual.
- Mobile sidebar: `GabbaiSidebar` renders a fixed hamburger + slide-in drawer on mobile.
- Stripe stub: `DonationPaymentButton` contains full inline integration guide in comments.
- Server→Client split: Every page that uses `useLang()` must be a client component or use a client wrapper.
