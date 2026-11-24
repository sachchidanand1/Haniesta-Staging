import {json, type ActionFunctionArgs} from '@shopify/remix-oxygen';

/**
 * Newsletter subscription using Klaviyo
 * 
 * SETUP REQUIRED:
 * 1. Install Klaviyo from Shopify App Store
 * 2. Get API Key from Klaviyo Settings → API Keys
 * 3. Get List ID from Klaviyo Lists
 * 4. Add to .env:
 *    KLAVIYO_API_KEY=your_api_key
 *    KLAVIYO_LIST_ID=your_list_id
 * 
 * This is the RECOMMENDED solution for newsletter subscriptions.
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
    const apiKey = (context as any)?.env?.KLAVIYO_API_KEY;
    const listId = (context as any)?.env?.KLAVIYO_LIST_ID;

    // Check if Klaviyo is configured
    if (!apiKey || !listId) {
      console.error('Klaviyo not configured. Please add KLAVIYO_API_KEY and KLAVIYO_LIST_ID to environment variables.');
      
      // Fallback: Just create customer in Shopify
      await createShopifyCustomer({email, context});
      
      return json({
        success: true,
        message: 'Thank you for subscribing! We will be in touch soon.',
      });
    }

    // Subscribe to Klaviyo list
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
              $consent: ['email'], // GDPR consent
              $source: 'Website Footer Newsletter',
              properties: {
                'Signup Source': 'Footer',
                'Signup Date': new Date().toISOString(),
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Klaviyo API error:', errorData);
      throw new Error('Failed to subscribe to newsletter');
    }

    // Also create customer in Shopify for record keeping
    await createShopifyCustomer({email, context});

    return json({
      success: true,
      message: 'Thank you for subscribing! Check your email for your 10% discount code.',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return json(
      {
        error: 'Failed to subscribe. Please try again.',
      },
      {status: 500}
    );
  }
}

/**
 * Create customer in Shopify for tracking
 * This is optional but recommended
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
