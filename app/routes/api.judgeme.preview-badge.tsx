import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {fetchJudgeMeWidgetHTML} from '~/lib/judgeme.server';

export async function loader({request, context}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get('handle') || '';
  if (!handle) return new Response('Missing handle', {status: 400});

  const html = await fetchJudgeMeWidgetHTML(context.env, 'preview_badge', {
    handle,
  });

  if (!html) return new Response('', {status: 204});

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
