export const PROFILE_LINK_OPTIONS = [
  'Outros',
  'Instagram',
  'TikTok',
  'YouTube',
  'X',
  'Facebook',
  'LinkedIn',
  'WhatsApp',
  'Telegram',
  'Discord',
  'Twitch',
  'GitHub',
  'Email',
] as const;

export const PROFILE_LINK_TYPE = {
  OTHER: 0,
  INSTAGRAM: 1,
  TIKTOK: 2,
  YOUTUBE: 3,
  X: 4,
  FACEBOOK: 5,
  LINKEDIN: 6,
  WHATSAPP: 7,
  TELEGRAM: 8,
  DISCORD: 9,
  TWITCH: 10,
  GITHUB: 11,
  EMAIL: 12,
} as const;

const HTTP_PROTOCOL_PATTERN = /^https?:\/\//i;
const MAILTO_PATTERN = /^mailto:/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeExternalUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  return HTTP_PROTOCOL_PATTERN.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;
}

export function extractFonteFromUrl(value: string) {
  const normalizedUrl = normalizeExternalUrl(value);

  if (!normalizedUrl) {
    return '';
  }

  try {
    const hostname = new URL(normalizedUrl).hostname;
    const domain = hostname.replace(/^www\./i, '').split('.')[0];

    if (!domain) {
      return '';
    }

    return domain.charAt(0).toUpperCase() + domain.slice(1).toLowerCase();
  } catch {
    return '';
  }
}

function normalizeEmailLink(value: string) {
  const emailValue = value.trim().replace(MAILTO_PATTERN, '').trim();

  if (!emailValue || !EMAIL_PATTERN.test(emailValue)) {
    return {
      ok: false as const,
      error: 'Informe um e-mail valido.',
    };
  }

  return {
    ok: true as const,
    value: `mailto:${emailValue}`,
  };
}

function normalizeHttpLink(value: string) {
  const normalizedUrl = normalizeExternalUrl(value);

  if (!normalizedUrl) {
    return {
      ok: false as const,
      error: 'Informe um link valido.',
    };
  }

  try {
    const parsedUrl = new URL(normalizedUrl);

    if (!/^https?:$/i.test(parsedUrl.protocol)) {
      return {
        ok: false as const,
        error: 'Informe um link valido.',
      };
    }

    return {
      ok: true as const,
      value: normalizedUrl,
    };
  } catch {
    return {
      ok: false as const,
      error: 'Informe um link valido.',
    };
  }
}

export function normalizeProfileLink(value: string, linkType: number) {
  if (linkType === PROFILE_LINK_TYPE.EMAIL) {
    return normalizeEmailLink(value);
  }

  return normalizeHttpLink(value);
}
