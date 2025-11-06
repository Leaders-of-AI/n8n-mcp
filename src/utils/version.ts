import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Get the project version from package.json
 * This ensures we have a single source of truth for versioning
 * Fallback for local development where package.json may not be in the expected location
 */
function getProjectVersion(): string {
  try {
    const paths = [
      join(__dirname, '../../package.json'),
      join(process.cwd(), 'package.json'),
    ];

    for (const path of paths) {
      if (existsSync(path)) {
        const packageJson = JSON.parse(readFileSync(path, 'utf-8'));
        return packageJson.version || '0.0.0';
      }
    }

    return '0.0.0';
  } catch (error) {
    console.error('Failed to read version from package.json:', error);
    return '0.0.0';
  }
}

export const PROJECT_VERSION = getProjectVersion();