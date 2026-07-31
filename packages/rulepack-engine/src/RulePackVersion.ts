/**
 * Utilities and types for dealing with RulePack versions.
 */
export interface RulePackVersion {
  major: number;
  minor: number;
  patch: number;
  /** Full semantic version string (e.g. "1.2.3") */
  full: string;
}

export function parseVersion(versionString: string): RulePackVersion {
  const parts = versionString.replace(/^[vV]/, '').split('.');
  return {
    major: parseInt(parts[0] || '0', 10),
    minor: parseInt(parts[1] || '0', 10),
    patch: parseInt(parts[2] || '0', 10),
    full: versionString
  };
}
