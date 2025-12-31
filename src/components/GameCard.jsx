import React from 'react';

const GameCard = ({ game }) => {
  const { homeTeam, awayTeam, status } = game;

  const getStatusBadge = () => {
    if (status.inProgress) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-xs font-semibold text-red-600">LIVE</span>
        </div>
      );
    }

    if (status.completed) {
      return <span className="text-xs font-medium text-gray-500">FINAL</span>;
    }

    return (
      <span className="text-xs font-medium text-gray-600">
        {game.date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}
      </span>
    );
  };

  const getScoreClass = (team) => {
    if (!status.completed && !status.inProgress) return 'text-gray-400';
    if (team.winner) return 'text-gray-900 font-bold';
    return 'text-gray-600';
  };

  const getTeamNameClass = (team) => {
    if (team.winner) return 'font-semibold text-gray-900';
    return 'text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-medium text-gray-500">{status.detail}</div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {awayTeam.logo && (
              <img
                src={awayTeam.logo}
                alt={awayTeam.name}
                className="w-8 h-8 object-contain"
              />
            )}
            <div className="flex flex-col">
              <span className={`text-sm ${getTeamNameClass(awayTeam)}`}>
                {awayTeam.name}
              </span>
              {awayTeam.record && (
                <span className="text-xs text-gray-500">{awayTeam.record}</span>
              )}
            </div>
          </div>
          <div className={`text-2xl font-bold ${getScoreClass(awayTeam)} min-w-[2rem] text-right`}>
            {awayTeam.score || '-'}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {homeTeam.logo && (
              <img
                src={homeTeam.logo}
                alt={homeTeam.name}
                className="w-8 h-8 object-contain"
              />
            )}
            <div className="flex flex-col">
              <span className={`text-sm ${getTeamNameClass(homeTeam)}`}>
                {homeTeam.name}
              </span>
              {homeTeam.record && (
                <span className="text-xs text-gray-500">{homeTeam.record}</span>
              )}
            </div>
          </div>
          <div className={`text-2xl font-bold ${getScoreClass(homeTeam)} min-w-[2rem] text-right`}>
            {homeTeam.score || '-'}
          </div>
        </div>
      </div>

      {game.broadcast && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>📺 {game.broadcast}</span>
            {game.venue && <span className="truncate ml-2">{game.venue}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard;
