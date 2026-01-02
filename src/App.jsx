import React, { useState, useEffect } from 'react';
import { fetchTopLiveGames } from './services/espnApi';
import GameCard from './components/GameCard';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [topGames, setTopGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const loadScores = async () => {
    try {
      setError(null);
      const rankedGames = await fetchTopLiveGames(30);
      setTopGames(rankedGames);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load scores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores();

    const interval = setInterval(() => {
      loadScores();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadScores();
  };

  const liveCount = topGames.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Live Sports Scores
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  {lastUpdated && (
                    <p className="text-sm text-gray-600">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                  {liveCount > 0 && (
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span className="text-sm font-semibold text-red-600">
                        {liveCount} {liveCount === 1 ? 'game' : 'games'} live
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 self-start md:self-center"
              >
                <svg
                  className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </header>

        <main>
          {loading && topGames.length === 0 ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-semibold mb-2">Error loading scores</p>
              <p className="text-red-600">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : liveCount === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg mb-2">No live games right now</p>
              <p className="text-gray-500 text-sm">Check back later or click refresh to update</p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Top {topGames.length} Games Right Now
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {topGames.map((game, index) => (
                  <GameCard key={game.id} game={game} rank={index + 1} />
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Showing top 30 live games ranked by importance. Data provided by ESPN. Updates every 60 seconds.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
