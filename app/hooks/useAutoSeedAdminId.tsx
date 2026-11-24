import { useEffect, useState, useRef } from 'react';
import { useRouteLoaderData } from 'react-router';

const SEED_THROTTLE_KEY = 'favorites_admin_seed_failed_attempts';
const MAX_FAILED_ATTEMPTS = 3;
const THROTTLE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

// Global flags to prevent multiple seeding attempts and hook executions
let globalSeedingInProgress = false;
let globalHookInitialized = false;

export function useAutoSeedAdminId() {
  const rootData = useRouteLoaderData('root') as { isLoggedIn?: Promise<boolean> } | undefined;
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [customer, setCustomer] = useState<any>(null);
  const [hasTriedSeeding, setHasTriedSeeding] = useState(false);
  const isInitializedRef = useRef(false);

  // Only log once to avoid spam
  if (!globalHookInitialized) {
    // console.log('useAutoSeedAdminId hook called');
    // console.log('rootData:', rootData);
    globalHookInitialized = true;
  }

  // Resolve the isLoggedIn promise and fetch customer data (only once)
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    // console.log('useAutoSeedAdminId: Promise resolution useEffect triggered');
    // console.log('rootData:', rootData);
    // console.log('rootData?.isLoggedIn:', rootData?.isLoggedIn);
    // console.log('rootData?.isLoggedIn type:', typeof rootData?.isLoggedIn);
    
    if (rootData?.isLoggedIn) {
      //console.log('Attempting to resolve isLoggedIn promise...');
      
      // Handle both Promise and direct boolean values
      const resolveLogin = async () => {
        try {
          const loggedIn = await rootData.isLoggedIn;
          
          //console.log('isLoggedIn resolved:', loggedIn);
          setIsLoggedIn(!!loggedIn);
          
          // If logged in, fetch customer data
          if (loggedIn) {
            //console.log('Fetching customer data...');
            try {
              const response = await fetch('/api/customer/details', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              if (response.ok) {
                const customerData = await response.json();
                //console.log('Customer data fetched:', customerData);
                setCustomer(customerData);
              } else {
                //console.log('Failed to fetch customer data:', response.status);
              }
            } catch (error) {
              console.error('Error fetching customer data:', error);
            }
          }
        } catch (error) {
          console.error('Error resolving isLoggedIn:', error);
        }
      };
      
      resolveLogin();
    } else {
      console.log('No isLoggedIn promise found in rootData');
    }
  }, [rootData?.isLoggedIn]);

  useEffect(() => {
    // console.log('useAutoSeedAdminId useEffect triggered');
    // console.log('Conditions check - isLoggedIn:', isLoggedIn, 'customer:', !!customer, 'hasTriedSeeding:', hasTriedSeeding, 'globalSeedingInProgress:', globalSeedingInProgress);
    
    if (!isLoggedIn || !customer || hasTriedSeeding || globalSeedingInProgress) {
      console.log('useAutoSeedAdminId: Early return - conditions not met');
      return;
    }

    // Check throttling only for failed attempts
    try {
      const throttleData = localStorage.getItem(SEED_THROTTLE_KEY);
      if (throttleData) {
        const parsed = JSON.parse(throttleData) as { attempts: number; lastAttempt: number };
        const now = Date.now();
        
        if (parsed.attempts >= MAX_FAILED_ATTEMPTS && (now - parsed.lastAttempt) < THROTTLE_DURATION_MS) {
          console.log('Seeding throttled - too many failed attempts');
          return;
        }
      }
    } catch {}

    // console.log('useAutoSeedAdminId: Customer data:', customer);
    // console.log('useAutoSeedAdminId: Customer ID:', customer.customer?.id);
    
    // Check if we already have customerId in session by calling debug endpoint
    fetch('/api/customer/favorites/debug')
      .then(res => res.json())
      .then((data: any) => {
        // console.log('Debug data:', data);
        
        // If we don't have customerId, try to seed it
        if (!data.customerId) {
          setHasTriedSeeding(true);
          globalSeedingInProgress = true;
          
          // Use customer ID directly to seed Admin customer ID
          const customerId = customer.customer?.id;
          
          if (customerId) {
            // console.log('Auto-seeding Admin customer ID using customer ID:', customerId);
            
            // Try to seed from customer ID
            fetch('/api/customer/admin-id', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ customerId }),
            })
              .then(res => res.json())
              .then((result: any) => {
                // console.log('Seeding result:', result);
                if (result.set) {
                  // console.log('Successfully seeded Admin customer ID:', result.customerId);
                  // Clear failed attempts on success
                  try { localStorage.removeItem(SEED_THROTTLE_KEY); } catch {}
                  
                  // Test session state after seeding
                  setTimeout(() => {
                    fetch('/api/customer/session-test')
                      .then(res => res.json())
                      .then(data => {
                        // console.log('Session test after seeding:', data);
                      })
                      .catch(err => console.error('Session test failed:', err));
                  }, 2000); // Increased delay to 2 seconds
                } else {
                  // console.log('Failed to seed Admin customer ID:', result.reason);
                  // Record failed attempt
                  try {
                    const throttleData = localStorage.getItem(SEED_THROTTLE_KEY);
                    const data = throttleData ? JSON.parse(throttleData) as { attempts: number; lastAttempt: number } : { attempts: 0, lastAttempt: 0 };
                    data.attempts += 1;
                    data.lastAttempt = Date.now();
                    localStorage.setItem(SEED_THROTTLE_KEY, JSON.stringify(data));
                  } catch {}
                }
              })
              .catch(err => {
                console.error('Error seeding Admin customer ID:', err);
                // Record failed attempt
                try {
                  const throttleData = localStorage.getItem(SEED_THROTTLE_KEY);
                  const data = throttleData ? JSON.parse(throttleData) as { attempts: number; lastAttempt: number } : { attempts: 0, lastAttempt: 0 };
                  data.attempts += 1;
                  data.lastAttempt = Date.now();
                  localStorage.setItem(SEED_THROTTLE_KEY, JSON.stringify(data));
                } catch {}
              })
              .finally(() => {
                globalSeedingInProgress = false;
              });
          } else {
            console.log('No customer ID found to seed');
            globalSeedingInProgress = false;
          }
        } else {
          console.log('Admin customer ID already exists:', (data as any).customerId);
        }
      })
      .catch(err => {
        console.error('Error checking customer ID status:', err);
      });
  }, [isLoggedIn, customer, hasTriedSeeding]);
}
