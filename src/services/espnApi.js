const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const LEAGUES = {
  NFL: { sport: 'football', league: 'nfl', name: 'NFL' },
  NBA: { sport: 'basketball', league: 'nba', name: 'NBA' },
  MLB: { sport: 'baseball', league: 'mlb', name: 'MLB' },
  NHL: { sport: 'hockey', league: 'nhl', name: 'NHL' },
  MLS: { sport: 'soccer', league: 'usa.1', name: 'MLS' },
  EPL: { sport: 'soccer', league: 'eng.1', name: 'Premier League' },
  LALIGA: { sport: 'soccer', league: 'esp.1', name: 'La Liga' },
  BUNDESLIGA: { sport: 'soccer', league: 'ger.1', name: 'Bundesliga' },
  SERIEA: { sport: 'soccer', league: 'ita.1', name: 'Serie A' },
  LIGUE1: { sport: 'soccer', league: 'fra.1', name: 'Ligue 1' },
  UCL: { sport: 'soccer', league: 'uefa.champions', name: 'Champions League' },
};

export const fetchScoresForLeague = async (leagueKey) => {
  const league = LEAGUES[leagueKey];
  if (!league) {
    throw new Error(`Unknown league: ${leagueKey}`);
  }

  const url = `${ESPN_API_BASE}/${league.sport}/${league.league}/scoreboard`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return {
      leagueName: league.name,
      leagueKey,
      sport: league.sport,
      events: data.events || [],
    };
  } catch (error) {
    console.error(`Error fetching ${league.name} scores:`, error);
    return {
      leagueName: league.name,
      leagueKey,
      sport: league.sport,
      events: [],
      error: error.message,
    };
  }
};

export const fetchAllScores = async () => {
  const leagueKeys = Object.keys(LEAGUES);
  const promises = leagueKeys.map(key => fetchScoresForLeague(key));
  const results = await Promise.all(promises);

  return results.filter(result => result.events.length > 0 || result.error);
};

export const parseGameData = (event) => {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const homeTeam = competition.competitors?.find(c => c.homeAway === 'home');
  const awayTeam = competition.competitors?.find(c => c.homeAway === 'away');

  if (!homeTeam || !awayTeam) return null;

  return {
    id: event.id,
    name: event.name,
    shortName: event.shortName,
    date: new Date(event.date),
    status: {
      type: event.status?.type?.name,
      detail: event.status?.type?.detail,
      completed: event.status?.type?.completed,
      inProgress: event.status?.type?.state === 'in',
    },
    homeTeam: {
      id: homeTeam.id,
      name: homeTeam.team?.displayName,
      abbrev: homeTeam.team?.abbreviation,
      logo: homeTeam.team?.logo,
      score: homeTeam.score,
      record: homeTeam.records?.[0]?.summary,
      winner: homeTeam.winner,
    },
    awayTeam: {
      id: awayTeam.id,
      name: awayTeam.team?.displayName,
      abbrev: awayTeam.team?.abbreviation,
      logo: awayTeam.team?.logo,
      score: awayTeam.score,
      record: awayTeam.records?.[0]?.summary,
      winner: awayTeam.winner,
    },
    broadcast: competition.broadcasts?.[0]?.names?.[0] || null,
    venue: competition.venue?.fullName,
  };
};
