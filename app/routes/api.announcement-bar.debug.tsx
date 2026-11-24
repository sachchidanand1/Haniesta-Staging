import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {getAnnouncementBarConfig} from '~/lib/announcement-bar.server';

export async function loader({context}: LoaderFunctionArgs) {
  try {
    const config = await getAnnouncementBarConfig(context);
    return json({
      success: true,
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
