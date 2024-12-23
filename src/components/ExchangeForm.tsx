import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Euro } from 'lucide-react';

const AMOUNTS = [50, 100, 200, 500, 1000];

export function ExchangeForm() {
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<number>(AMOUNTS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabase.from('exchange_requests').insert({
        type,
        amount,
      });
      
      // Reset form
      setType('buy');
      setAmount(AMOUNTS[0]);
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Exchange Request
        </h2>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Type
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setType('buy')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                type === 'buy'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setType('sell')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                type === 'sell'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Amount (€)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`py-2 px-4 rounded-lg font-medium ${
                  amount === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {value}€
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : 'Create Request'}
        </button>
      </form>
    </div>
  );
}