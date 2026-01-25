/**
 * Config management tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEFAULT_CONFIG } from './types.js';

describe('Config Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have default config structure', () => {
    expect(DEFAULT_CONFIG).toBeDefined();
    expect(DEFAULT_CONFIG.sources).toBeDefined();
    expect(DEFAULT_CONFIG.targets).toBeDefined();
  });

  it('should have default sources', () => {
    const sources = Object.keys(DEFAULT_CONFIG.sources);

    expect(sources).toContain('anthropics/skills');
    expect(sources).toContain('vercel-labs/agent-skills');
  });

  it('should have enabled sources by default', () => {
    const { sources } = DEFAULT_CONFIG;

    Object.values(sources).forEach((source: any) => {
      expect(source.enabled).toBe(true);
    });
  });

  it('should handle source with subdir', () => {
    const agentSkills = DEFAULT_CONFIG.sources['vercel-labs/agent-skills'] as any;

    expect(agentSkills).toBeDefined();
    expect(agentSkills.url).toBe('https://github.com/vercel-labs/agent-skills');
    expect(agentSkills.subdir).toBe('skills');
  });

  it('should handle remote source without subdir', () => {
    const anthropicsSkills = DEFAULT_CONFIG.sources['anthropics/skills'] as any;

    expect(anthropicsSkills).toBeDefined();
    expect(anthropicsSkills.url).toBe('https://github.com/anthropics/skills');
    expect(anthropicsSkills.subdir).toBeUndefined();
  });
});
