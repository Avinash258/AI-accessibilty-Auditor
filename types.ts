export enum ImpactLevel {
    Critical = 'critical',
    Serious = 'serious',
    Moderate = 'moderate',
    Minor = 'minor',
    Info = 'info',
    None = 'none'
}

export interface AccessibilityIssue {
    id: string;
    impact: ImpactLevel;
    description: string;
    help: string;
    helpUrl: string;
    htmlElementSnippet?: string;
    visualAidUrl?: string;
}

export interface AccessibilityReport {
    url: string;
    timestamp: string;
    violations: AccessibilityIssue[];
    incomplete: AccessibilityIssue[];
    passes: AccessibilityIssue[];
}

export interface AuditRule {
    id: string;
    description: string;
    importance: string;
}

export type DownloadFormat = 'json' | 'html' | 'csv' | 'pdf' | 'word';

// New interface for the fix suggestion feature
export interface FixSuggestion {
    suggestedCode: string;
    imageUrl: string;
    imageCaption: string;
}
