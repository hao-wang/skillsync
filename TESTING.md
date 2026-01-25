# Testing

This project uses [Vitest](https://vitest.dev/) for testing.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
src/
├── cli.test.ts          # CLI command routing tests
├── commands/
│   └── push.test.ts     # Push command tests
└── lib/
    └── config.test.ts   # Config management tests
```

## Writing Tests

Tests use Vitest's globals (no need to import):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

## Test Coverage

To generate a coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory.

## Current Test Coverage

- ✅ CLI command routing
- ✅ Push command logic
- ✅ Config management
- ✅ Default configuration structure

## TODO: More Tests

- [ ] Fetch command tests
- [ ] Source command tests
- [ ] Target command tests
- [ ] Status command tests
- [ ] List command tests
- [ ] Init command tests
- [ ] File system operation tests
- [ ] Git integration tests
- [ ] Interactive prompts tests
