import type {AppLoadContext} from '@shopify/remix-oxygen';
import {adminGraphQL} from '~/lib/admin.server';

export async function findAdminCustomerIdByEmail(
  context: AppLoadContext,
  email: string,
): Promise<string | undefined> {
  const query = `
    query getCustomerId($query: String!) {
      customers(first: 1, query: $query) {
        edges { node { id email } }
      }
    }
  `;

  const data = await adminGraphQL<{customers?: {edges?: Array<{node: {id: string; email?: string}}>} | null}>(
    context,
    query,
    {query: `email:${email}`},
  );
  const id = data?.customers?.edges?.[0]?.node?.id;
  return id;
}


