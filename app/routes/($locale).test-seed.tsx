import { useState } from 'react';
import { useRouteLoaderData } from 'react-router';

export default function TestSeedPage() {
  const rootData = useRouteLoaderData('root') as { isLoggedIn?: boolean; customer?: any } | undefined;
  const isLoggedIn = rootData?.isLoggedIn;
  const customer = rootData?.customer;
  const [debugData, setDebugData] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);

  const checkDebug = async () => {
    try {
      const res = await fetch('/api/customer/favorites/debug');
      const data = await res.json();
      setDebugData(data);
    } catch (err) {
      console.error('Error checking debug:', err);
    }
  };

  const seedAdminId = async () => {
    if (!customer?.email) {
      alert('No customer email available');
      return;
    }
    
    // console.log('Manual seeding attempt with email:', customer.email);
    setSeeding(true);
    try {
      const url = `/api/customer/admin-id?email=${encodeURIComponent(customer.email)}`;
      // console.log('Calling URL:', url);
      
      const res = await fetch(url);
      const result = await res.json();
      // console.log('Seeding result:', result);
      
      if (result.set) {
        alert('Successfully seeded! Refreshing page...');
        window.location.reload();
      } else {
        alert(`Failed to seed: ${result.reason}`);
      }
    } catch (err) {
      console.error('Error seeding:', err);
      alert('Error seeding Admin customer ID');
    } finally {
      setSeeding(false);
    }
  };

  const testDirectCall = async () => {
    // console.log('Testing direct call to admin-id endpoint');
    try {
      const res = await fetch('/api/customer/admin-id?email=admin@theikons.com');
      const result = await res.json();
      // console.log('Direct call result:', result);
      alert(`Direct call result: ${JSON.stringify(result)}`);
    } catch (err) {
      console.error('Direct call error:', err);
      alert('Direct call failed');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Admin ID Seeding</h1>
      
      <div className="space-y-4">
        <div>
          <p><strong>Logged in:</strong> {isLoggedIn ? 'Yes' : 'No'}</p>
          <p><strong>Customer ID:</strong> {customer?.id || 'None'}</p>
          <p><strong>Customer Email:</strong> {customer?.email || 'None'}</p>
        </div>
        
        <div className="space-x-2">
          <button 
            onClick={checkDebug}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Check Debug Data
          </button>
          
          <button 
            onClick={seedAdminId}
            disabled={!isLoggedIn || !customer?.email || seeding}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            {seeding ? 'Seeding...' : 'Seed Admin ID'}
          </button>
          
          <button 
            onClick={testDirectCall}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Test Direct Call
          </button>
        </div>
        
        {debugData && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold">Debug Data:</h3>
            <pre className="text-sm">{JSON.stringify(debugData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
