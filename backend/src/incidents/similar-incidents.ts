const ERROR_WEIGHT = 0.5;
const SERVICE_WEIGHT = 0.3;
const TITLE_WEIGHT = 0.2;
const MIN_WORD_LENGTH = 3;

export interface IncidentFeatures {
  errorTypes: Set<string>;
  services: Set<string>;
  titleWords: Set<string>;
}

export interface Similarity {
  score: number;
  reasons: string[];
}

export function titleWords(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= MIN_WORD_LENGTH),
  );
}

function intersection(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((value) => b.has(value));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection(a, b).length / union;
}

export function compareIncidents(
  a: IncidentFeatures,
  b: IncidentFeatures,
): Similarity {
  const score =
    ERROR_WEIGHT * jaccard(a.errorTypes, b.errorTypes) +
    SERVICE_WEIGHT * jaccard(a.services, b.services) +
    TITLE_WEIGHT * jaccard(a.titleWords, b.titleWords);

  const reasons = [
    ...intersection(a.errorTypes, b.errorTypes).map(
      (type) => `Same error: ${type}`,
    ),
    ...intersection(a.services, b.services).map(
      (service) => `Same service: ${service}`,
    ),
    ...(intersection(a.titleWords, b.titleWords).length > 0
      ? ['Similar title']
      : []),
  ];

  return { score: Math.round(score * 100) / 100, reasons };
}
