import {Link} from '~/components/Link';

const TOKEN_RE =
  /(https?:\/\/[^\s]+|haniesta\.com\/[^\s]*|haniesta\.com|support@haniesta\.com)/gi;

function hrefForToken(token: string): {href: string; external: boolean} {
  const clean = token.replace(/[.,;)]+$/, '');
  if (clean.includes('@')) return {href: `mailto:${clean}`, external: false};
  if (clean.startsWith('http')) return {href: clean, external: true};
  if (clean.startsWith('haniesta.com')) {
    return {href: `https://www.${clean}`, external: true};
  }
  return {href: clean, external: false};
}

function InlineLink({token}: {token: string}) {
  const {href, external} = hrefForToken(token);
  const display = token
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/[.,;)]+$/, '');
  const className =
    'text-[#8B6914] border-b border-[#C8A96E]/60 hover:text-[#1a1714]';

  if (external || href.startsWith('mailto')) {
    return (
      <a href={href} className={className}>
        {display}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {display}
    </Link>
  );
}

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(TOKEN_RE);
  return parts.map((part, i) => {
    if (!part) return null;
    const isToken =
      part.startsWith('http') ||
      part.includes('haniesta.com') ||
      part.includes('@');
    if (isToken) return <InlineLink key={`${i}-${part}`} token={part} />;
    return <span key={`${i}-t`}>{part}</span>;
  });
}

export function FaqAnswer({text}: {text: string}) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const isBulletList = lines.length > 0 && lines.every((l) => l.startsWith('•'));

  if (isBulletList) {
    return (
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] font-light leading-[1.8] text-[#4a4540]">
        {lines.map((line) => {
          const content = line.replace(/^•\s*/, '');
          return (
            <li key={content.slice(0, 48)}>{parseInline(content)}</li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="text-[13px] font-light leading-[1.8] tracking-wide text-[#4a4540]">
      {parseInline(text)}
    </div>
  );
}
