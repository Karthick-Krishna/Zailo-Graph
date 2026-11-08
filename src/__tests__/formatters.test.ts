import { describe, it, expect } from 'vitest';
import { formatBytes, formatDimensions, calculateSavings } from '../utils/formatters';

describe('formatters utility', () => {
  describe('formatBytes', () => {
    it('formats 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('formats bytes correctly', () => {
      expect(formatBytes(512)).toBe('512 B');
    });

    it('formats kilobytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(2560)).toBe('2.5 KB');
    });

    it('formats megabytes correctly', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(15728640)).toBe('15 MB');
    });

    it('formats gigabytes correctly', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDimensions', () => {
    it('formats width and height correctly', () => {
      expect(formatDimensions(1920, 1080)).toBe('1,920 × 1,080 px');
    });

    it('handles missing dimensions gracefully', () => {
      expect(formatDimensions(undefined, undefined)).toBe('—');
      expect(formatDimensions(100, undefined)).toBe('—');
    });
  });

  describe('calculateSavings', () => {
    it('calculates file size reduction correctly', () => {
      const savings = calculateSavings(1000, 400);
      expect(savings.isSaved).toBe(true);
      expect(savings.percent).toBe(60);
      expect(savings.bytes).toBe(600);
    });

    it('handles file size expansion correctly', () => {
      const savings = calculateSavings(500, 750);
      expect(savings.isSaved).toBe(false);
      expect(savings.percent).toBe(-50);
      expect(savings.bytes).toBe(250);
    });

    it('handles zero byte inputs gracefully', () => {
      const savings = calculateSavings(0, 500);
      expect(savings.percent).toBe(0);
      expect(savings.isSaved).toBe(false);
    });
  });
});
