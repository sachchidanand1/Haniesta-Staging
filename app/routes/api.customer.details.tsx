import { json } from '@shopify/remix-oxygen';

export async function loader({ context }: { context: any }) {
  // console.log('🔍 GET /api/customer/details - Debug info:');
  
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  // console.log(' - Is logged in:', isLoggedIn);
  
  if (!isLoggedIn) {
    console.log('❌ Customer not authenticated');
    return json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const customerQuery = `
      query getCustomer {
        customer {
          id
          firstName
          lastName
        }
      }
    `;

    // console.log(' - Querying customer data...');
    const { data, errors } = await context.customerAccount.query(customerQuery);
    
    if (errors) {
      // console.log('❌ Customer query errors:', errors);
      return json({ error: 'Failed to fetch customer data', details: errors }, { status: 500 });
    }

    // console.log('✅ Customer data fetched:', data?.customer);
    return json({ customer: data?.customer });
  } catch (error) {
    console.error('❌ Error fetching customer data:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
