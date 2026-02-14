import { describe, it, expect } from 'vitest';
import { haversineKm, formatDistance } from '../../utils/distance';

describe('haversineKm', () => {
  it('returns 0 for same coordinates', () => {
    expect(haversineKm(52.52, 13.405, 52.52, 13.405)).toBe(0);
  });

  it('calculates Berlin Hauptbahnhof to Alexanderplatz (~2.2 km)', () => {
    // Hbf: 52.5251, 13.3694
    // Alex: 52.5219, 13.4132
    const dist = haversineKm(52.5251, 13.3694, 52.5219, 13.4132);
    expect(dist).toBeGreaterThan(2);
    expect(dist).toBeLessThan(3.5);
  });

  it('calculates Heilbronnerstr to Brandenburger Tor (~5 km)', () => {
    // Home: 52.4985, 13.3110
    // Brandenburger Tor: 52.5163, 13.3777
    const dist = haversineKm(52.4985, 13.311, 52.5163, 13.3777);
    expect(dist).toBeGreaterThan(4);
    expect(dist).toBeLessThan(6);
  });

  it('calculates Berlin to Potsdam (~25 km)', () => {
    const dist = haversineKm(52.52, 13.405, 52.3906, 13.0645);
    expect(dist).toBeGreaterThan(20);
    expect(dist).toBeLessThan(30);
  });
});

describe('formatDistance', () => {
  it('formats meters for distances under 1 km', () => {
    expect(formatDistance(0.5)).toBe('500 m');
    expect(formatDistance(0.123)).toBe('123 m');
  });

  it('formats km for distances over 1 km', () => {
    expect(formatDistance(2.345)).toBe('2.3 km');
    expect(formatDistance(15.0)).toBe('15.0 km');
  });
});
