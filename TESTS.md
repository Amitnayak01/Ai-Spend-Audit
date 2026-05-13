# Test Documentation — SpendScan AI

## Philosophy

All tests focus on the audit engine (pure business logic). The engine is the core value driver — everything else is presentation.

**Testing pyramid:**
- Unit tests: audit engine (30 tests)
- Integration tests: API routes (future)
- E2E tests: form flow (future, Playwright)

## Running Tests

```bash
npm run test:run          # Single pass, exit
npm run test              # Watch mode (dev)
npm run test:coverage     # With V8 coverage report
```

## Test Suites Overview

### Suite 1: Core Calculations (4 tests)
Verifies total spend aggregation, annual calculation, unique ID generation, and timestamp accuracy.

### Suite 2: Redundancy Detection (5 tests)
Tests all major tool pair detections: Cursor/Copilot, ChatGPT/Claude. Verifies the more expensive tool is flagged for elimination.

### Suite 3: Seat Utilization (4 tests)
Tests excess seat detection, savings calculation ($19/seat × excess), boundary conditions, and confidence scores.

### Suite 4: API Overspend (3 tests)
Tests the $200 threshold, savings calculation (30% reduction), and false-positive prevention below threshold.

### Suite 5: Bundle Detection (2 tests)
Tests 2+ paid general AI tools triggering consolidation recommendation and sort order validation.

### Suite 6: Efficiency Ratings (3 tests)
Tests "excellent" rating when no waste found, and per-rec + summary annual savings consistency.

### Suite 7: Utility Functions (4 tests)
Tests formatCurrency (formatting, rounding) and getSeverityColor (uniqueness, completeness).

### Suite 8: Edge Cases (5 tests)
Tests zero spend, 5000-person teams, 15-tool stacks, savings percentage bounds, and required field presence.

**Total: 30 tests across 8 suites**

## Coverage Report

After running `npm run test:coverage`, open `coverage/index.html`.

Target coverage:
- `lib/audit-engine/index.ts` → >90%
- `lib/audit-engine/tool-data.ts` → >80%
- `lib/rate-limit.ts` → >80%

## CI Integration

Tests run on every push via GitHub Actions (`.github/workflows/ci.yml`). Build is blocked if tests fail.
