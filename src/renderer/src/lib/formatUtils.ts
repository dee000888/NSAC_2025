/**
 * Formatting utilities for the NSAC application
 * These functions help convert enum/constant values to readable text for UI display
 */

/**
 * Converts an uppercase string with underscores or spaces to title case
 * Example: "FIBER_SHREDS" -> "Fiber Shreds"
 *          "NOTE BOOK"    -> "Note Book"
 *          "ALUMINIUM"    -> "Aluminium"
 */
export function formatEnumToTitleCase(text: string): string {
  if (!text) return '';
  return text
    .replace(/[_\s]+/g, ' ') // Replace underscores and multiple spaces with single space
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts an uppercase string with underscores to sentence case
 * Example: "FIBER_SHREDS" -> "Fiber shreds"
 */
export function formatEnumToSentenceCase(text: string): string {
  if (!text) return '';

  const titleCase = text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return titleCase.charAt(0).toUpperCase() + titleCase.slice(1);
}

/**
 * Converts a camelCase string to title case
 * Example: "fiberShreds" -> "Fiber Shreds"
 */
export function formatCamelCaseToTitleCase(text: string): string {
  if (!text) return '';

  // Insert a space before each uppercase letter that has a lowercase letter before it
  const spacedText = text.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Convert to title case
  return spacedText.charAt(0).toUpperCase() + spacedText.slice(1);
}

/**
 * Formats a raw material name for display
 * Handles special cases like chemical formulas
 */
export function formatRawMaterial(materialName: string): string {
  if (!materialName) return '';

  // Special case handling
  const specialCases: Record<string, string> = {
    'PET': 'PET',
    'PVC': 'PVC',
    'EVOH': 'EVOH',
    'CO2': 'CO₂',
    'H2O': 'H₂O',
  };

  if (specialCases[materialName]) {
    return specialCases[materialName];
  }

  return formatEnumToTitleCase(materialName);
}

/**
 * Formats a process name for display
 */
export function formatProcessName(processName: string): string {
  if (!processName) return '';

  return formatEnumToTitleCase(processName);
}

/**
 * Formats a category name for display
 */
export function formatCategoryName(categoryName: string): string {
  if (!categoryName) return '';

  // Special cases for categories
  const specialCases: Record<string, string> = {
    'FABRIC': 'Fabric',
    'POLYMER': 'Polymer',
    'PLASTIC': 'Plastic',
    'GLASS': 'Glass',
    'METAL': 'Metal',
    'COMPOSITE': 'Composite',
    'PAPER': 'Paper',
  };

  if (specialCases[categoryName]) {
    return specialCases[categoryName];
  }

  return formatEnumToTitleCase(categoryName);
}

/**
 * Formats a module name for display
 */
export function formatModuleName(moduleName: string): string {
  if (!moduleName) return '';

  // Remove "Module" suffix and format
  const cleanName = moduleName.replace(/Module$/, '');
  return formatCamelCaseToTitleCase(cleanName);
}

/**
 * Formats an application name for display
 */
export function formatApplicationName(appName: string): string {
  if (!appName) return '';

  const specialCases: Record<string, string> = {
    'RENOVATION': 'Renovation',
    'CELEBRATION': 'Celebration',
    'DISCOVERY': 'Discovery',
  };

  if (specialCases[appName]) {
    return specialCases[appName];
  }

  return formatEnumToTitleCase(appName);
}

/**
 * Formats mobility type for display
 */
export function formatMobilityType(mobility: string): string {
  if (!mobility) return '';

  const specialCases: Record<string, string> = {
    'INDOOR': 'Indoor',
    'INSTATION': 'In-station',
  };

  if (specialCases[mobility]) {
    return specialCases[mobility];
  }

  return formatEnumToTitleCase(mobility);
}

/**
 * Formats weight values with appropriate units
 */
export function formatWeight(weight: number, unit: string = 'kg'): string {
  if (weight === 0) return `0 ${unit}`;

  if (weight < 0.001) {
    return `${(weight * 1000000).toFixed(2)} mg`;
  } else if (weight < 1) {
    return `${(weight * 1000).toFixed(2)} g`;
  } else {
    return `${weight.toFixed(3)} ${unit}`;
  }
}

/**
 * Formats percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats item codes/names that might have special formatting
 */
export function formatItemCode(code: string): string {
  if (!code) return '';

  // Handle codes like "CREW-APPAREL-TS-001"
  return code
    .split('-')
    .map(part => {
      // Keep numeric parts as is
      if (/^\d+$/.test(part)) return part;

      // Format letter parts
      return formatEnumToTitleCase(part);
    })
    .join(' - ');
}

/**
 * Formats item names for display (handles both enum and regular text)
 */
export function formatItemName(name: string): string {
  if (!name) return '';

  // If it's all uppercase with underscores (enum-style), format it
  if (/^[A-Z_]+$/.test(name)) {
    return formatEnumToTitleCase(name);
  }

  // If it's already in a readable format, return as is
  return name;
}

/**
 * Generic formatter that tries to intelligently format any string
 */
export function formatDisplayText(text: string): string {
  if (!text) return '';

  // If it's all uppercase with underscores, treat as enum
  if (/^[A-Z_]+$/.test(text)) {
    return formatEnumToTitleCase(text);
  }

  // If it's camelCase, format accordingly
  if (/^[a-z][a-zA-Z]*$/.test(text)) {
    return formatCamelCaseToTitleCase(text);
  }

  // If it contains hyphens, format each part
  if (text.includes('-')) {
    return text
      .split('-')
      .map(part => formatDisplayText(part))
      .join(' - ');
  }

  // Otherwise return as is (might already be formatted)
  return text;
}
