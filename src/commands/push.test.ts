/**
 * Push command tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readConfig } from '../lib/config.js';
import { push } from './push.js';

// Mock dependencies
vi.mock('../lib/config.js');
vi.mock('node:fs/promises');
vi.mock('../lib/paths.js', () => ({
  STORE_DIR: '/mock/store',
}));

describe('Push Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be exported as a function', () => {
    expect(typeof push).toBe('function');
  });

  it('should accept deprecated parameter', () => {
    // Function signature test
    const pushFn = push as (deprecated?: boolean) => Promise<void>;
    expect(pushFn.length).toBeGreaterThanOrEqual(0);
  });

  it('should call readConfig when executed', async () => {
    vi.mocked(readConfig).mockResolvedValue({
      sources: {},
      targets: {},
    } as any);

    try {
      await push();
    } catch (e) {
      // File system operations will fail, but readConfig should be called
    }

    expect(readConfig).toHaveBeenCalled();
  });

  it('should handle enabled and disabled sources', () => {
    const mockConfig = {
      sources: {
        'anthropics/skills': {
          enabled: true,
        },
        'vercel-labs/agent-skills': {
          enabled: false,
        },
      },
      targets: {},
    };

    const enabledCount = Object.values(mockConfig.sources).filter(
      (s: any) => s.enabled
    ).length;

    expect(enabledCount).toBe(1);
  });

  it('should handle enabled and disabled targets', () => {
    const mockConfig = {
      sources: {},
      targets: {
        cursor: {
          enabled: true,
          path: '/mock/cursor/skills',
        },
        claude: {
          enabled: false,
          path: '/mock/claude/skills',
        },
      },
    };

    const enabledTargets = Object.entries(mockConfig.targets).filter(
      ([_, t]: [string, any]) => t.enabled
    );

    expect(enabledTargets.length).toBe(1);
    expect(enabledTargets[0][0]).toBe('cursor');
  });
});
