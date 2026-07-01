import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Minus, RefreshCw } from 'lucide-react';

const SimpleTradingDashboard = () => {
  const [apiKeys, setApiKeys] = useState({
    alpacaKey: '',
    alpacaSecret: '',
    paperTrading: true
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeQty, setTradeQty] = useState('10');
  const [tradeSide, setTradeSide] = useState('buy');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');

  // Connect to Alpaca
  const connect = async () => {
    if (!apiKeys.alpacaKey || !apiKeys.alpacaSecret) {
      setMessage('❌ Please enter API credentials');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = apiKeys.paperTrading
        ? 'https://paper-api.alpaca.markets'
        : 'https://api.alpaca.markets';

      const response = await fetch(`${baseUrl}/v2/account`, {
        headers: {
          'APCA-API-KEY-ID': apiKeys.alpacaKey,
          'APCA-API-SECRET-KEY': apiKeys.alpacaSecret
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAccount(data);
        setIsConnected(true);
        setMessage('✅ Connected!');
        fetchData();
      } else {
        setMessage('❌ Invalid credentials');
      }
    } catch (error) {
      setMessage('❌ Connection error: ' + error.message);
    }
    setLoading(false);
  };

  // Fetch positions and orders
  const fetchData = async () => {
    if (!isConnected) return;

    setLoading(true);
    try {
      const baseUrl = apiKeys.paperTrading
        ? 'https://paper-api.alpaca.markets'
        : 'https://api.alpaca.markets';

      // Get positions
      const posRes = await fetch(`${baseUrl}/v2/positions`, {
        headers: {
          'APCA-API-KEY-ID': apiKeys.alpacaKey,
          'APCA-API-SECRET-KEY': apiKeys.alpacaSecret
        }
      });
      const posData = await posRes.json();
      setPositions(Array.isArray(posData) ? posData : []);

      // Get orders
      const ordRes = await fetch(`${baseUrl}/v2/orders?status=all&limit=10`, {
        headers: {
          'APCA-API-KEY-ID': apiKeys.alpacaKey,
          'APCA-API-SECRET-KEY': apiKeys.alpacaSecret
        }
      });
      const ordData = await ordRes.json();
      setOrders(Array.isArray(ordData) ? ordData : []);

      // Refresh account
      const accRes = await fetch(`${baseUrl}/v2/account`, {
        headers: {
          'APCA-API-KEY-ID': apiKeys.alpacaKey,
          'APCA-API-SECRET-KEY': apiKeys.alpacaSecret
        }
      });
      const accData = await accRes.json();
      setAccount(accData);
    } catch (error) {
      setMessage('Error fetching data: ' + error.message);
    }
    setLoading(false);
  };

  // Place trade
  const placeTrade = async () => {
    if (!tradeSymbol || !tradeQty) {
      setMessage('❌ Enter symbol and quantity');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = apiKeys.paperTrading
        ? 'https://paper-api.alpaca.markets'
        : 'https://api.alpaca.markets';

      const response = await fetch(`${baseUrl}/v2/orders`, {
        method: 'POST',
        headers: {
          'APCA-API-KEY-ID': apiKeys.alpacaKey,
          'APCA-API-SECRET-KEY': apiKeys.alpacaSecret,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol: tradeSymbol.toUpperCase(),
          qty: parseInt(tradeQty),
          side: tradeSide,
          type: 'market',
          time_in_force: 'day'
        })
      });

      if (response.ok) {
        setMessage(`✅ ${tradeSide.toUpperCase()} order placed: ${tradeQty} ${tradeSymbol}`);
        setTradeSymbol('');
        setTradeQty('10');
        setTimeout(() => fetchData(), 1000);
      } else {
        const error = await response.json();
        setMessage('❌ Order failed: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      setMessage('❌ Trade error: ' + error.message);
    }
    setLoading(false);
  };

  // Login Screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 p-4 flex flex-col justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">📊 Trading Dashboard</h1>
          <p className="text-sm text-gray-600">Simple portfolio monitoring</p>

          <div className="space-y-3 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Alpaca API Key</label>
              <input
                type="password"
                placeholder="PK..."
                value={apiKeys.alpacaKey}
                onChange={(e) => setApiKeys({...apiKeys, alpacaKey: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Alpaca Secret Key</label>
              <input
                type="password"
                placeholder="w7g8h9i0..."
                value={apiKeys.alpacaSecret}
                onChange={(e) => setApiKeys({...apiKeys, alpacaSecret: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>

            <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
              <input
                type="checkbox"
                checked={apiKeys.paperTrading}
                onChange={(e) => setApiKeys({...apiKeys, paperTrading: e.target.checked})}
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-700">📄 Paper Trading (Safe Mode)</label>
            </div>
          </div>

          <button
            onClick={connect}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Connecting...' : '🔗 Connect'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Get free API keys from alpaca.markets
          </p>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">📊 Trading Dashboard</h1>
            <p className="text-xs text-blue-100 mt-1">
              {apiKeys.paperTrading ? '📄 Paper Trading' : '🔴 Live Trading'}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-white text-blue-600 p-2 rounded-lg hover:bg-blue-100"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {message && (
          <div className="mt-2 text-xs bg-blue-500 bg-opacity-30 p-2 rounded">
            {message}
          </div>
        )}
      </div>

      {/* Account Balance */}
      {account && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-600">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-800">
                ${parseFloat(account.portfolio_value).toFixed(0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-600">Cash</p>
              <p className="text-2xl font-bold text-green-600">
                ${parseFloat(account.cash).toFixed(0)}
              </p>
            </div>
          </div>

          {account.equity && account.last_equity && (
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-600">Buying Power</p>
              <p className="text-2xl font-bold text-blue-600">
                ${parseFloat(account.buying_power).toFixed(0)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white border-b sticky top-16 z-10 p-2 overflow-x-auto">
        {['portfolio', 'trade', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab === 'portfolio' && '💼'}
            {tab === 'trade' && '🔄'}
            {tab === 'history' && '📋'}
            {' '}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="p-4 space-y-3">
          {positions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No open positions</p>
            </div>
          ) : (
            positions.map(pos => (
              <div key={pos.symbol} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{pos.symbol}</h3>
                    <p className="text-sm text-gray-600">{pos.qty} shares</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">
                      ${parseFloat(pos.current_price).toFixed(2)}
                    </p>
                    <p className={`text-sm font-semibold ${parseFloat(pos.unrealized_pl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(pos.unrealized_pl) >= 0 ? '📈' : '📉'} ${parseFloat(pos.unrealized_pl).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
                  <div>
                    <p className="text-gray-500">Entry Price</p>
                    <p className="font-semibold text-gray-800">${parseFloat(pos.avg_fill_price).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Market Value</p>
                    <p className="font-semibold text-gray-800">${parseFloat(pos.market_value).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Trade Tab */}
      {activeTab === 'trade' && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <h3 className="font-bold text-gray-800">Place Trade</h3>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Stock Symbol</label>
              <input
                type="text"
                placeholder="MU, AMD, NVDA..."
                value={tradeSymbol}
                onChange={(e) => setTradeSymbol(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                placeholder="10"
                value={tradeQty}
                onChange={(e) => setTradeQty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTradeSide('buy')}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                  tradeSide === 'buy'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Plus size={16} className="inline mr-1" />
                Buy
              </button>
              <button
                onClick={() => setTradeSide('sell')}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                  tradeSide === 'sell'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Minus size={16} className="inline mr-1" />
                Sell
              </button>
            </div>

            <button
              onClick={placeTrade}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Placing...' : '📤 Place Order'}
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <span className="font-bold">⚠️ Note:</span> Orders execute at market price. {apiKeys.paperTrading ? 'Paper trading - no real money.' : 'LIVE TRADING - Real money!'}
            </p>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="p-4 space-y-3">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No order history</p>
            </div>
          ) : (
            orders.slice(0, 10).map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{order.symbol}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${order.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                      {order.side === 'buy' ? '🟢' : '🔴'} {order.side.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">{order.qty} shares</p>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-600">
                  <span>Status: <span className="font-semibold capitalize">{order.status}</span></span>
                  {order.filled_qty && (
                    <span>Filled: {order.filled_qty} @ ${parseFloat(order.filled_avg_price).toFixed(2)}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Settings Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-2">
        <button
          onClick={() => {
            setIsConnected(false);
            setAccount(null);
            setPositions([]);
            setOrders([]);
            setMessage('');
          }}
          className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-gray-700"
        >
          🔌 Disconnect
        </button>
        <button
          onClick={() => setActiveTab('trade')}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700"
        >
          ➕ New Trade
        </button>
      </div>
    </div>
  );
};

export default SimpleTradingDashboard;
