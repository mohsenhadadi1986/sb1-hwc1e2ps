import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type ExchangeRequest = {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  created_at: string;
  matched_at: string | null;
  user_id: string;
};

type Filter = 'all' | 'mine' | 'others';

export function ExchangeList() {
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      const query = supabase
        .from('exchange_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (filter === 'mine' && currentUserId) {
        query.eq('user_id', currentUserId);
      } else if (filter === 'others' && currentUserId) {
        query.neq('user_id', currentUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching requests:', error);
      } else {
        setRequests(data || []);
      }
      setLoading(false);
    };

    fetchRequests();

    const subscription = supabase
      .channel('exchange_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exchange_requests' }, 
        () => fetchRequests())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filter, currentUserId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Exchange Requests</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'mine'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setFilter('others')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'others'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Other Users
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className={`bg-white shadow-lg rounded-lg p-6 transition-all hover:shadow-xl ${
              request.user_id === currentUserId ? 'border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  request.type === 'buy' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {request.type.toUpperCase()}
                </span>
                <span className="ml-4 text-lg font-semibold">{request.amount}€</span>
                {request.user_id === currentUserId && (
                  <span className="ml-4 text-sm text-blue-600 font-medium">Your Request</span>
                )}
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : request.status === 'matched'
                    ? 'bg-blue-100 text-blue-800'
                    : request.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {request.status.toUpperCase()}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No exchange requests found. {filter === 'mine' ? 'Create one to get started!' : 'Check back later!'}
          </div>
        )}
      </div>
    </div>
  );
}