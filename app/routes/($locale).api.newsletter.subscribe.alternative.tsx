import {json, type ActionFunctionArgs} from '@shopify/remix-oxygen';

/**
 * ALTERNATIVE IMPLEMENTATION: Newsletter subscription using email service integration
 * 
 * This approach bypasses Shopify's email marketing consent limitations in the Storefront API
 * by directly integrating with an email marketing service like Klaviyo, Mailchimp, or Omnisend.
 * 
 * RECOMMENDED FOR PRODUCTION USE
 */

export async function action({request, context}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  const formData = await request.formData();
  const email = formData.get('email');

  // Validate email
  if (!email || typeof email !== 'string') {
    return json({error: 'Invalid email address'}, {status: 400});
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json({error: 'Please enter a valid email address'}, {status: 400});
  }

  try {
    // Option 1: Use Klaviyo API
    await subscribeToKlaviyo({email, context});
    
    // Option 2: Use Mailchimp API
    // await subscribeToMailchimp({email, context});
    
    // Option 3: Use Omnisend API
    // await subscribeToOmnisend({email, context});
    
    // Also create customer in Shopify for tracking
    await createShopifyCustomer({email, context});
    
    return json({
      success: true,
      message: 'Thank you for subscribing! Check your email for your 10% discount code.',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return json(
      {
        error: error instanceof Error ? error.message : 'Failed to subscribe. Please try again.',
      },
      {status: 500}
    );
  }
}

/**
 * Subscribe to Klaviyo
 * Requires: KLAVIYO_API_KEY and KLAVIYO_LIST_ID in environment variables
 */
async function subscribeToKlaviyo({
  email,
  context,
}: {
  email: string;
  context: any;
}) {
  const apiKey = (context as any)?.env?.KLAVIYO_API_KEY;
  const listId = (context as any)?.env?.KLAVIYO_LIST_ID;

  if (!apiKey || !listId) {
    console.warn('Klaviyo API key or List ID not configured');
    return;
  }

  const response = await fetch(
    `https://a.klaviyo.com/api/v2/list/${listId}/subscribe`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        profiles: [
          {
            email,
            // Add custom properties
            $consent: ['email'],
            source: 'Website Footer',
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to subscribe to Klaviyo');
  }

  return await response.json();
}

/**
 * Subscribe to Mailchimp
 * Requires: MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, MAILCHIMP_LIST_ID
 */
async function subscribeToMailchimp({
  email,
  context,
}: {
  email: string;
  context: any;
}) {
  const apiKey = (context as any)?.env?.MAILCHIMP_API_KEY;
  const serverPrefix = (context as any)?.env?.MAILCHIMP_SERVER_PREFIX; // e.g., 'us1'
  const listId = (context as any)?.env?.MAILCHIMP_LIST_ID;

  if (!apiKey || !serverPrefix || !listId) {
    console.warn('Mailchimp credentials not configured');
    return;
  }

  const response = await fetch(
    `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        tags: ['website-footer'],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    // If already subscribed, that's okay
    if (error.title === 'Member Exists') {
      return {alreadySubscribed: true};
    }
    throw new Error('Failed to subscribe to Mailchimp');
  }

  return await response.json();
}

/**
 * Subscribe to Omnisend
 * Requires: OMNISEND_API_KEY
 */
async function subscribeToOmnisend({
  email,
  context,
}: {
  email: string;
  context: any;
}) {
  const apiKey = (context as any)?.env?.OMNISEND_API_KEY;

  if (!apiKey) {
    console.warn('Omnisend API key not configured');
    return;
  }

  const response = await fetch('https://api.omnisend.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({
      email,
      status: 'subscribed',
      statusDate: new Date().toISOString(),
      channels: {
        email: {
          status: 'subscribed',
          statusDate: new Date().toISOString(),
        },
      },
      tags: ['website-footer'],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to subscribe to Omnisend');
  }

  return await response.json();
}

/**
 * Create customer in Shopify for tracking
 * This is optional but recommended for keeping records
 */
async function createShopifyCustomer({
  email,
  context,
}: {
  email: string;
  context: any;
}) {
  const {storefront} = context;

  const CUSTOMER_CREATE = `#graphql
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
        }
        customerUserErrors {
          code
          message
        }
      }
    }
  `;

  try {
    const response = await storefront.mutate(CUSTOMER_CREATE, {
      variables: {
        input: {
          email,
        },
      },
    });

    // Ignore if customer already exists
    if (response?.customerCreate?.customerUserErrors?.length > 0) {
      const error = response.customerCreate.customerUserErrors[0];
      if (error.code === 'TAKEN') {
        console.log(`Customer ${email} already exists in Shopify`);
        return;
      }
    }

    return response?.customerCreate?.customer;
  } catch (error) {
    // Don't fail the whole subscription if Shopify customer creation fails
    console.error('Failed to create Shopify customer:', error);
  }
}

export function loader() {
  return json({error: 'Method not allowed'}, {status: 405});
}
