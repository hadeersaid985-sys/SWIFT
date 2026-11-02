import React from 'react';

/**
 * Normalizes any URL or domain input to ensure it has a valid external protocol.
 * E.g. 'power-tech-eg.com' -> 'https://power-tech-eg.com'
 * 'docs.google.com/spreadsheets/d/...' -> 'https://docs.google.com/spreadsheets/d/...'
 * 'https://example.com' -> 'https://example.com'
 */
export function formatExternalUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already has protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Protocol relative
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed}`;
}

/**
 * Checks if a string looks like a valid URL or domain.
 */
export function isValidUrlOrDomain(input?: string | null): boolean {
  if (!input) return false;
  const trimmed = input.trim();
  if (!trimmed) return false;

  // Has scheme
  if (/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(trimmed)) {
    return true;
  }

  // Domain with TLD or path (e.g. power-tech-eg.com, docs.google.com/...)
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(\/[^\s]*)?$/i;
  return domainRegex.test(trimmed);
}

/**
 * Categorizes a URL into specific services for richer UI badges.
 */
export function detectLinkType(url?: string | null): 'google_sheet' | 'google_drive' | 'website' | 'other' {
  if (!url) return 'other';
  const lower = url.toLowerCase().trim();
  if (lower.includes('docs.google.com/spreadsheets') || lower.includes('sheets.google.com')) {
    return 'google_sheet';
  }
  if (lower.includes('drive.google.com')) {
    return 'google_drive';
  }
  if (isValidUrlOrDomain(lower)) {
    return 'website';
  }
  return 'other';
}

/**
 * Regex matching URLs in plain text:
 * - Protocol links (http://, https://)
 * - www. links
 * - Google Docs / Drive links (docs.google.com, drive.google.com)
 * - Common domains with popular TLDs (.com, .net, .org, .eg, .sa, .ae, .io, .co, .me, etc.)
 */
const URL_REGEX = /((?:https?:\/\/|www\.|docs\.google\.com|drive\.google\.com)[^\s<>()]+|(?:[a-zA-Z0-9-]+\.)+(?:com|net|org|edu|gov|io|ai|me|eg|sa|ae|app|dev|co|xyz)(?:\/[^\s<>()]*)?)/gi;

/**
 * Parses free text (like projectDescription, notes, tasks) and turns raw URLs into clickable interactive links.
 */
export function renderTextWithLinks(text?: string | null): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(URL_REGEX);

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;

    // Push preceding text
    if (matchStart > lastIndex) {
      parts.push(text.substring(lastIndex, matchStart));
    }

    const rawUrl = match[0];
    // Clean trailing punctuation often attached in natural text
    let cleanUrl = rawUrl;
    let trailingPunctuation = '';
    const punctuationMatch = cleanUrl.match(/[.,;:!?)]+$/);
    if (punctuationMatch) {
      trailingPunctuation = punctuationMatch[0];
      cleanUrl = cleanUrl.slice(0, -trailingPunctuation.length);
    }

    const href = formatExternalUrl(cleanUrl);
    const linkType = detectLinkType(cleanUrl);

    let badgeClass = 'text-blue-600 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 border border-blue-200';
    let iconLabel = '🔗';
    if (linkType === 'google_sheet') {
      badgeClass = 'text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300';
      iconLabel = '📊';
    } else if (linkType === 'google_drive') {
      badgeClass = 'text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300';
      iconLabel = '📁';
    } else if (linkType === 'website') {
      badgeClass = 'text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-300';
      iconLabel = '🌐';
    }

    parts.push(
      <span key={`link-wrapper-${matchStart}`} className="inline-flex items-center gap-1 mx-1 my-0.5">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold underline transition-colors cursor-pointer ${badgeClass}`}
          title={`فتح الرابط في نافذة جديدة: ${href}`}
        >
          <span>{iconLabel}</span>
          <span className="truncate max-w-[240px] dir-ltr">{cleanUrl}</span>
          <span className="text-[10px]">↗</span>
        </a>
        {trailingPunctuation && <span>{trailingPunctuation}</span>}
      </span>
    );

    lastIndex = matchEnd;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
