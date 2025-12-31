import React from 'react';
import GameCard from './GameCard';
import { parseGameData } from '../services/espnApi';

const LeagueSection = ({ leagueData }) => {
  const { leagueName, events, error } = leagueData;

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          {leagueName}
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading {leagueName} scores: {error}
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  const games = events.map(parseGameData).filter(Boolean);
  const liveGames = games.filter(g => g.status.inProgress);

  if (liveGames.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {leagueName}
        {liveGames.length > 0 && (
          <span className="text-sm font-normal text-red-600 flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            {liveGames.length} Live
          </span>
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {liveGames.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default LeagueSection;
