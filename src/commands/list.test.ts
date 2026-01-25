/**
 * List command tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readConfig } from '../lib/config.js';
import { list } from './list.js';
import { readdir, stat } from 'node:fs/promises';
import { readSkillMetadata } from '../lib/skill.js';

// Mock dependencies
vi.mock('../lib/config.js');
vi.mock('node:fs/promises');
vi.mock('../lib/skill.js');
vi.mock('../lib/paths.js', () => ({
  STORE_DIR: '/mock/store',
}));
vi.mock('../lib/colors.js', () => ({
  bold: (s: string) => s,
  dim: (s: string) => s,
  green: (s: string) => s,
}));

describe('List Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list all sources when no filter provided', async () => {
    vi.mocked(readConfig).mockResolvedValue({
      sources: {
        'source1': { enabled: true },
        'source2': { enabled: true }
      },
      targets: {}
    } as any);

    // Mock file system
    vi.mocked(stat).mockResolvedValue({} as any);
    vi.mocked(readdir).mockResolvedValue([]);
    
    // Spy on console.log
    const logSpy = vi.spyOn(console, 'log');

    await list();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('source1'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('source2'));
  });

  it('should filter sources when filter provided', async () => {
    vi.mocked(readConfig).mockResolvedValue({
      sources: {
        'source1': { enabled: true },
        'source2': { enabled: true }
      },
      targets: {}
    } as any);

    vi.mocked(stat).mockResolvedValue({} as any);
    vi.mocked(readdir).mockResolvedValue([]);
    
    const logSpy = vi.spyOn(console, 'log');

    await list('source1');

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('source1'));
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('source2'));
  });

  it('should perform case-insensitive filtering', async () => {
    vi.mocked(readConfig).mockResolvedValue({
      sources: {
        'SourceOne': { enabled: true },
        'SourceTwo': { enabled: true }
      },
      targets: {}
    } as any);

    vi.mocked(stat).mockResolvedValue({} as any);
    vi.mocked(readdir).mockResolvedValue([]);
    
    const logSpy = vi.spyOn(console, 'log');

    await list('sourceone');

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('SourceOne'));
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('SourceTwo'));
  });
});
