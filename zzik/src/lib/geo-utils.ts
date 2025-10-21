/**
 * Geographic Utility Functions for ZZMUK Matching
 *
 * Provides distance calculation and geographic filtering for 3km radius matching.
 * Uses Haversine formula for accurate great-circle distance on Earth.
 */

/**
 * Calculate distance between two geographic points using Haversine formula
 *
 * @param lat1 - Latitude of point 1 (degrees)
 * @param lon1 - Longitude of point 1 (degrees)
 * @param lat2 - Latitude of point 2 (degrees)
 * @param lon2 - Longitude of point 2 (degrees)
 * @returns Distance in kilometers
 *
 * @example
 * ```ts
 * const distance = calculateDistance(37.5665, 126.9780, 37.5651, 126.9870);
 * // Returns distance between two points in Seoul in km
 * ```
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is within a certain radius from a reference point
 *
 * @param refLat - Reference latitude
 * @param refLon - Reference longitude
 * @param targetLat - Target latitude
 * @param targetLon - Target longitude
 * @param radiusKm - Maximum radius in kilometers
 * @returns true if target is within radius, false otherwise
 */
export function isWithinRadius(
  refLat: number,
  refLon: number,
  targetLat: number,
  targetLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(refLat, refLon, targetLat, targetLon);
  return distance <= radiusKm;
}

/**
 * Calculate bounding box for geographic queries
 * Returns min/max lat/lon that encompass a circle of given radius
 *
 * This is useful for database queries to pre-filter candidates before
 * applying the more expensive Haversine calculation.
 *
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param radiusKm - Radius in kilometers
 * @returns Bounding box coordinates
 */
export function getBoundingBox(
  lat: number,
  lon: number,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  const latDelta = radiusKm / 111; // 1 degree latitude ≈ 111 km
  const lonDelta = radiusKm / (111 * Math.cos(toRadians(lat))); // Adjusted for latitude

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}

/**
 * Performance metrics for geo calculations
 * Used for monitoring and ensuring p95 < 200ms target
 */
export class GeoPerformanceTracker {
  private measurements: number[] = [];

  record(durationMs: number): void {
    this.measurements.push(durationMs);

    // Keep only last 1000 measurements to prevent memory bloat
    if (this.measurements.length > 1000) {
      this.measurements.shift();
    }
  }

  getP95(): number {
    if (this.measurements.length === 0) return 0;

    const sorted = [...this.measurements].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
  }

  getP50(): number {
    if (this.measurements.length === 0) return 0;

    const sorted = [...this.measurements].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.5);
    return sorted[index];
  }

  getAvg(): number {
    if (this.measurements.length === 0) return 0;

    const sum = this.measurements.reduce((a, b) => a + b, 0);
    return sum / this.measurements.length;
  }

  getStats() {
    return {
      count: this.measurements.length,
      avg: this.getAvg(),
      p50: this.getP50(),
      p95: this.getP95(),
      max: Math.max(...this.measurements),
    };
  }
}
