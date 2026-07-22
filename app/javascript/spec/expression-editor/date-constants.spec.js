import {
  FROM_HOURS,
  FROM_DAYS,
  FROM_WEEKS,
  FROM_MONTHS,
  FROM_QUARTERS,
  FROM_YEARS,
  buildRelativeDateOptions,
  TIME_OPTIONS,
} from '../../components/expression-editor/date-constants';

describe('date-constants', () => {
  describe('FROM_* arrays mirror ViewHelper', () => {
    it('FROM_HOURS has 24 entries (This Hour … 23 Hours Ago)', () => {
      expect(FROM_HOURS).toHaveLength(24);
      expect(FROM_HOURS[0]).toBe('This Hour');
      expect(FROM_HOURS[23]).toBe('23 Hours Ago');
    });

    it('FROM_DAYS starts with Today and Yesterday', () => {
      expect(FROM_DAYS[0]).toBe('Today');
      expect(FROM_DAYS[1]).toBe('Yesterday');
    });

    it('FROM_WEEKS has 5 entries', () => {
      expect(FROM_WEEKS).toHaveLength(5);
      expect(FROM_WEEKS[0]).toBe('This Week');
    });

    it('FROM_MONTHS has 6 entries', () => {
      expect(FROM_MONTHS).toHaveLength(6);
      expect(FROM_MONTHS[0]).toBe('This Month');
    });

    it('FROM_QUARTERS has 5 entries', () => {
      expect(FROM_QUARTERS).toHaveLength(5);
    });

    it('FROM_YEARS has 5 entries', () => {
      expect(FROM_YEARS).toHaveLength(5);
      expect(FROM_YEARS[0]).toBe('This Year');
    });
  });

  describe('buildRelativeDateOptions', () => {
    it('excludes hours when isDatetime is false', () => {
      const opts = buildRelativeDateOptions(false);
      const names = opts.map((o) => o.name);
      expect(names).not.toContain('This Hour');
      expect(names).toContain('Today');
      expect(names).toContain('This Week');
    });

    it('includes hours when isDatetime is true', () => {
      const opts = buildRelativeDateOptions(true);
      const names = opts.map((o) => o.name);
      expect(names[0]).toBe('This Hour');
      expect(names).toContain('Today');
    });

    it('returns objects with name and label properties', () => {
      const opts = buildRelativeDateOptions(false);
      opts.forEach((o) => {
        expect(typeof o.name).toBe('string');
        expect(typeof o.label).toBe('string');
        expect(o.name.length).toBeGreaterThan(0);
      });
    });

    it('does not duplicate options', () => {
      const opts = buildRelativeDateOptions(true);
      const names = opts.map((o) => o.name);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  describe('TIME_OPTIONS', () => {
    it('has 96 entries (24 hours × 4 quarters)', () => {
      expect(TIME_OPTIONS).toHaveLength(96);
    });

    it('starts at 0:00', () => {
      expect(TIME_OPTIONS[0].name).toBe('0:00');
    });

    it('ends at 23:45', () => {
      expect(TIME_OPTIONS[95].name).toBe('23:45');
    });

    it('includes 0:15 and 0:30 quarter-hours', () => {
      const names = TIME_OPTIONS.map((t) => t.name);
      expect(names).toContain('0:15');
      expect(names).toContain('0:30');
      expect(names).toContain('0:45');
    });
  });
});
