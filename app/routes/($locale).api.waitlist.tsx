import {json, type ActionFunctionArgs} from '@shopify/remix-oxygen';

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export async function action({request, context}: ActionFunctionArgs) {
  try {
    if (request.method !== 'POST') {
      return json({error: 'Method not allowed'}, {status: 405});
    }

    const env = (context as any)?.env;
    const privateApiKey = env?.KLAVIYO_PRIVATE_API_KEY;
    const waitlistListId = env?.KLAVIYO_WAITLIST_LIST_ID;

    if (!privateApiKey) {
      return json({error: 'Missing KLAVIYO_PRIVATE_API_KEY'}, {status: 500});
    }

    if (!waitlistListId) {
      return json({error: 'Missing KLAVIYO_WAITLIST_LIST_ID'}, {status: 500});
    }

    const formData = await request.formData();
    const emailRaw = formData.get('email');
    const email = typeof emailRaw === 'string' ? emailRaw.trim() : '';

    if (!email || !isValidEmail(email)) {
      return json({error: 'Please enter a valid email address.'}, {status: 400});
    }

    const headers = {
      Authorization: `Klaviyo-API-Key ${privateApiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Revision: '2024-02-15',
    };

    const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email,
            properties: {
              source: 'private_launch_waitlist',
              brand: 'Haniesta',
            },
          },
        },
      }),
    });

    const profileJson = await profileRes.json().catch(() => null);

    let profileId = (profileJson as any)?.data?.id as string | undefined;

    // Klaviyo returns 409 when profile already exists. In that case, recover the
    // existing profile id and proceed to subscribe to the list.
    if (!profileRes.ok && profileRes.status === 409) {
      const errors = (profileJson as any)?.errors;
      const meta = errors?.[0]?.meta;
      profileId =
        meta?.duplicate_profile_id ||
        meta?.duplicate_profile?.id ||
        meta?.profile_id ||
        profileId;

      if (!profileId) {
        const lookupUrl = new URL('https://a.klaviyo.com/api/profiles/');
        // Klaviyo expects the filter expression itself to contain the literal email.
        // URLSearchParams will take care of encoding for the query string.
        lookupUrl.searchParams.set('filter', `equals(email,"${email}")`);

        const lookupRes = await fetch(lookupUrl.toString(), {
          method: 'GET',
          headers,
        });

        const lookupJson = await lookupRes.json().catch(() => null);
        if (!lookupRes.ok) {
          console.error('[Klaviyo Waitlist] Profile lookup failed after 409', {
            status: lookupRes.status,
            statusText: lookupRes.statusText,
            errors: (lookupJson as any)?.errors,
          });

          return json(
            {
              error:
                (lookupJson as any)?.errors?.[0]?.detail ||
                (lookupJson as any)?.errors?.[0]?.title ||
                'Failed to lookup existing profile.',
            },
            {status: 502},
          );
        }

        profileId = (lookupJson as any)?.data?.[0]?.id;
      }
    }

    if (!profileRes.ok && profileRes.status !== 409) {
      console.error('[Klaviyo Waitlist] Profile create failed', {
        status: profileRes.status,
        statusText: profileRes.statusText,
        errors: (profileJson as any)?.errors,
      });

      const message =
        (profileJson as any)?.errors?.[0]?.detail ||
        (profileJson as any)?.errors?.[0]?.title ||
        'Failed to create profile.';
      return json({error: message}, {status: 502});
    }

    if (!profileId) {
      return json({error: 'Klaviyo did not return a profile id.'}, {status: 502});
    }

    const subscribeRes = await fetch(
      `https://a.klaviyo.com/api/lists/${waitlistListId}/relationships/profiles/`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: [
            {
              type: 'profile',
              id: profileId,
            },
          ],
        }),
      },
    );

    const subscribeJson = await subscribeRes.json().catch(() => null);

    if (!subscribeRes.ok) {
      console.error('[Klaviyo Waitlist] List subscribe failed', {
        status: subscribeRes.status,
        statusText: subscribeRes.statusText,
        listId: waitlistListId,
        errors: (subscribeJson as any)?.errors,
      });

      const message =
        (subscribeJson as any)?.errors?.[0]?.detail ||
        (subscribeJson as any)?.errors?.[0]?.title ||
        'Failed to subscribe to waitlist.';
      return json({error: message}, {status: 502});
    }

    return json({success: true, message: "You're on the list!"});
  } catch (err) {
    console.error('[Klaviyo Waitlist] Unexpected error', err);
    return json({error: 'Something went wrong. Please try again.'}, {status: 500});
  }
}
