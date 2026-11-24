import type {AppLoadContext} from '@shopify/remix-oxygen';
import {adminGraphQL} from '~/lib/admin.server';

export type AnnouncementBarConfig = {
  enabled: boolean;
  showOnHomePageOnly: boolean;
  messageText: string;
  buttonname: string;
  buttonlink: string;
  dismissible: boolean;
};

export async function getAnnouncementBarConfig(context: AppLoadContext): Promise<AnnouncementBarConfig | null> {
  const QUERY = `
    query getAnnouncementBarMetaobject {
      metaobjects(type: "announcement_bar", first: 10) {
        edges {
          node {
            handle
            fields {
              key
              value
            }
          }
        }
      }
    }
  `;

  try {
    //console.log('[announcement-bar] fetching configuration from shop metafields');
    const data = await adminGraphQL<{
      metaobjects?: {
        edges?: Array<{
          node: {
            handle: string;
            fields?: Array<{
              key: string;
              value: string | null;
            }> | null;
          };
        }> | null;
      } | null;
    }>(context, QUERY);

    //console.log('[announcement-bar] Raw GraphQL response:', JSON.stringify(data, null, 2));
    
    // Get the first metaobject from the list
    const metaobjectEdges = data?.metaobjects?.edges;
    if (!metaobjectEdges?.length) {
      //console.log('[announcement-bar] no metaobjects found');
      return null;
    }
    
    const metaobject = metaobjectEdges[0].node;
    //console.log('[announcement-bar] Using metaobject:', metaobject.handle);
    
    if (!metaobject.fields) {
      //console.log('[announcement-bar] no fields found in metaobject');
      return null;
    }

    // Parse fields from metaobject
    const fields = metaobject.fields.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {} as Record<string, string | null>);

    //console.log('[announcement-bar] Available field keys:', Object.keys(fields));
    //console.log('[announcement-bar] All fields:', fields);

    // Parse boolean values from metaobject fields (using lowercase keys from API)
    const enabled = fields.enabled === 'true';
    const showOnHomePageOnly = fields.showonhomepageonly === 'true';
    const dismissible = fields.dismissible === 'true';

    // Get text values (using lowercase keys from API)
    const messageText = fields.messagetext || '';
    const buttonname = fields.buttonname || '';
    const buttonlink = fields.buttonlink || '';

    //console.log('[announcement-bar] Parsed values:', {
    //   enabled,
    //   showOnHomePageOnly,
    //   messageText,
    //   buttonname,
    //   buttonlink,
    //   dismissible,
    // });

    const config: AnnouncementBarConfig = {
      enabled,
      showOnHomePageOnly,
      messageText,
      buttonname,
      buttonlink,
      dismissible,
    };

    //console.log('[announcement-bar] fetched configuration:', config);
    return config;
  } catch (e) {
    //console.log('[announcement-bar] fetch error:', e);
    // Return null on error to gracefully handle missing metafields
    return null;
  }
}
