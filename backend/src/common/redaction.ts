const REDACTED = '[REDACTED]';
const MAX_DEPTH = 10;

const SENSITIVE_KEY =
  /pass(word|wd)?|secret|token|api[-_]?key|authorization|cookie|session|credit[-_]?card|card[-_]?number|cvv|ssn/i;

const VALUE_PATTERNS: [RegExp, string][] = [
  [/\bBearer\s+[A-Za-z0-9\-._~+/]+=*/g, `Bearer ${REDACTED}`],
  [/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, REDACTED],
  [/\bobs_[A-Za-z0-9_-]{20,}/g, REDACTED],
  [
    /\b(pass(?:word|wd)?|secret|token|api[-_]?key)=([^&\s"']+)/gi,
    `$1=${REDACTED}`,
  ],
];

const CARD_CANDIDATE = /\b[2-6](?:[ -]?\d){12,18}\b/g;

function passesLuhn(digits: string): boolean {
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);

    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
  }

  return sum % 10 === 0;
}

export function redactString(text: string): string {
  const masked = VALUE_PATTERNS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    text,
  );

  return masked.replace(CARD_CANDIDATE, (match) =>
    passesLuhn(match.replace(/[ -]/g, '')) ? REDACTED : match,
  );
}

export function redactValue(value: unknown, depth = 0): unknown {
  if (typeof value === 'string') {
    return redactString(value);
  }

  if (depth >= MAX_DEPTH || value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? REDACTED : redactValue(item, depth + 1),
    ]),
  );
}

export function redactAttributes(
  attributes: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  return attributes
    ? (redactValue(attributes) as Record<string, unknown>)
    : undefined;
}

export function redactOptional(text: string | undefined): string | undefined {
  return text === undefined ? undefined : redactString(text);
}
