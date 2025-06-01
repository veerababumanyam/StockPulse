/**
 * Dashboard Utilities
 * Helper functions for dashboard operations
 * Part of Story 2.2: Customizable Widget System
 */

/**
 * Generate a unique widget ID
 */
export const generateWidgetId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `widget-${timestamp}-${random}`;
};

/**
 * Validate widget ID format
 */
export const isValidWidgetId = (id: string): boolean => {
  return /^widget-\d+-[a-z0-9]{6}$/.test(id);
};

/**
 * Extract timestamp from widget ID
 */
export const getWidgetTimestamp = (id: string): number | null => {
  const match = id.match(/^widget-(\d+)-[a-z0-9]{6}$/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Sort widgets by creation time (newest first)
 */
export const sortWidgetsByCreation = (
  widgets: { id: string }[],
): { id: string }[] => {
  return widgets.sort((a, b) => {
    const timestampA = getWidgetTimestamp(a.id) || 0;
    const timestampB = getWidgetTimestamp(b.id) || 0;
    return timestampB - timestampA;
  });
};

/**
 * Check if two layouts are equal
 */
export const areLayoutsEqual = (layout1: any, layout2: any): boolean => {
  return JSON.stringify(layout1) === JSON.stringify(layout2);
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
