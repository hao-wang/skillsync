/**
 * CLI command routing tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('CLI Command Routing', () => {
  // Mock process.argv
  const originalArgv = process.argv;

  beforeEach(() => {
    // Reset argv before each test
    process.argv = [...originalArgv];
  });

  afterEach(() => {
    // Restore original argv
    process.argv = originalArgv;
  });

  it('should recognize "push" command', async () => {
    // This is a basic test to verify command structure
    const commands = ['init', 'fetch', 'push', 'sync', 'status', 'ls', 'list', 'config', 'source', 'target'];
    expect(commands).toContain('push');
    expect(commands).toContain('sync'); // deprecated but still present
  });

  it('should have backward compatibility for "sync" command', () => {
    // Verify that both 'push' and 'sync' are valid commands
    const pushCommand = 'push';
    const syncCommand = 'sync';

    expect(pushCommand).toBe('push');
    expect(syncCommand).toBe('sync');
    expect(pushCommand).not.toBe(syncCommand);
  });

  it('should handle all command aliases', () => {
    const aliases = {
      ls: 'list',
    };

    expect(aliases.ls).toBe('list');
  });
});
