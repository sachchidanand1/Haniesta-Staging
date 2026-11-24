import type {SVGProps} from 'react';
import {
  FacebookShareButton,
  PinterestShareButton,
  TwitterShareButton,
} from 'react-share';

export function BlogShareButtons({
  url,
  title,
  mediaUrl,
}: {
  url: string;
  title: string;
  mediaUrl?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <FacebookShareButton url={url} className="inline-flex">
        <span
          aria-label="Share on Facebook"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
        >
          <FacebookIcon className="h-4 w-4" />
        </span>
      </FacebookShareButton>

      <PinterestShareButton url={url} media={mediaUrl || url} description={title}>
        <span
          aria-label="Share on Pinterest"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
        >
          <PinterestIcon className="h-4 w-4" />
        </span>
      </PinterestShareButton>

      <TwitterShareButton url={url} title={title}>
        <span
          aria-label="Share on X"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
        >
          <XIcon className="h-4 w-4" />
        </span>
      </TwitterShareButton>
    </div>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.3-1.6 1.6-1.6h1.6V4.8c-.3 0-1.4-.1-2.7-.1-2.7 0-4.6 1.7-4.6 4.8V11H7v3h2.4v8h4.1Z" />
    </svg>
  );
}

function PinterestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.1 2C6.6 2 3 5.7 3 10.6c0 3.3 1.8 5.2 3.9 5.2.6 0 .9-.4 1-1l.4-1.6c.1-.4.1-.5-.2-.9-.8-.9-1.2-2-1.2-3.3 0-3.2 2.5-6.3 6.7-6.3 3.6 0 5.6 2.2 5.6 5.1 0 3.9-1.7 7.2-4.3 7.2-1.4 0-2.5-1.2-2.1-2.6l.8-3.2c.3-1.3-.2-2.4-1.4-2.4-1.1 0-2 1.1-2.3 2.5-.2.8-.2 1.3-.2 1.3l-1.4 5.8c-.4 1.6-.1 3.6 0 3.8 0 .1.1.2.3.1.1-.1 1.6-2 2.1-3.6l.8-3c.4.7 1.5 1.3 2.7 1.3 3.6 0 6.1-3.3 6.1-7.7C21 5.1 17.4 2 12.1 2Z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.5l-5.1-6.6L5.6 22H2.5l7.3-8.4L2.3 2h6.7l4.6 6 5.3-6Zm-1.1 18h1.7L8.1 3.9H6.3L17.8 20Z" />
    </svg>
  );
}
