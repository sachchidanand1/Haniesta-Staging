import {json, type LoaderFunctionArgs, type ActionFunctionArgs} from '@shopify/remix-oxygen';
import {adminGraphQL} from '~/lib/admin.server';

async function findCustomerByEmail(email: string, context: LoaderFunctionArgs['context']) {
  const query = `
    query findCustomerByEmail($query: String!) {
      customers(first: 1, query: $query) {
        edges { node { id } }
      }
    }
  `;
  const data = await adminGraphQL<{
    customers?: {edges?: Array<{node: {id: string}}>} | null;
  }>(context as any, query, {query: `email:${email}`});

  const id = data?.customers?.edges?.[0]?.node?.id;
  return id ?? null;
}

export async function loader({request, context}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const emailParam = url.searchParams.get('email');
  
  //console.log('Admin ID loader called with email:', emailParam);
  
  if (!emailParam) {
    // console.log('No email provided');
    return json({set: false, reason: 'no_email_provided'});
  }

  try {
    // console.log('Looking up customer by email:', emailParam);
    const customerId = await findCustomerByEmail(emailParam, context);
    
    if (!customerId) {
      // console.log('Customer not found for email:', emailParam);
      return json({set: false, reason: 'customer_not_found'});
    }

    // console.log('Setting customerId in session:', customerId);
    context.session.set('customerId', customerId);
    const headers = new Headers();
    headers.set('Set-Cookie', await context.session.commit());
    console.log('Successfully seeded customerId:', customerId);
    return json({set: true, customerId}, {headers});
  } catch (error) {
    console.error('Error finding customer by email:', error);
    return json({set: false, reason: 'api_error'}, {status: 500});
  }
}

export async function action({request, context}: ActionFunctionArgs) {
  try {
    const body = (await request.json()) as {email?: string; customerId?: string};
    
    // console.log('Admin ID action called with body:', body);
    
    let adminCustomerId: string | null = null;
    
    if (body.customerId) {
      // Direct customer ID provided - convert to Admin GID format
      // console.log('Using provided customer ID:', body.customerId);
      adminCustomerId = body.customerId.startsWith('gid://shopify/Customer/') 
        ? body.customerId 
        : `gid://shopify/Customer/${body.customerId}`;
    } else if (body.email) {
      // Email provided - look up customer
      // console.log('Looking up customer by email:', body.email);
      adminCustomerId = await findCustomerByEmail(body.email, context);
    } else {
      // console.log('No customer ID or email provided');
      return json({set: false, reason: 'missing_customer_data'}, {status: 400});
    }
    
    if (!adminCustomerId) {
      // console.log('Customer not found');
      return json({set: false, reason: 'customer_not_found'}, {status: 404});
    }

    // console.log('Setting customerId in session:', adminCustomerId);
    context.session.set('customerId', adminCustomerId);
    
    // Verify the session was set
    const verifyCustomerId = context.session.get('customerId');
    // console.log('Verifying customerId in session:', verifyCustomerId);
    
    const headers = new Headers();
    const cookie = await context.session.commit();
    headers.set('Set-Cookie', cookie);
    // console.log('Successfully seeded customerId:', adminCustomerId);
    // console.log('Session cookie set:', cookie);
    // console.log('Session cookie length:', cookie.length);
    return json({set: true, customerId: adminCustomerId}, {headers});
  } catch (error) {
    console.error('Error in action:', error);
    return json({set: false, reason: 'api_error'}, {status: 500});
  }
}


