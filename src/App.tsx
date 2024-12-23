import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { ExchangeForm } from './components/ExchangeForm';
import { ExchangeList } from './components/ExchangeList';
import { Euro } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Euro className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">CurrencyXchange</span>
            </div>
            {session && (
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!session ? (
          <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <AuthForm />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center">
              <ExchangeForm />
            </div>
            <div className="flex justify-center">
              <ExchangeList />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;