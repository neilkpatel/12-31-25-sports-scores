// Scoring weights (total = 100 points possible + league prestige bonus)
const WEIGHTS = {
  PLAYOFF_STATUS: 40,
  BROADCAST: 25,
  TEAM_QUALITY: 20,
  CONTEXT: 15,
  LEAGUE_PRESTIGE: 20, // New: bonus for major leagues
};

// League prestige tiers (bonus points)
const LEAGUE_PRESTIGE = {
  // Tier 1: Major Professional Leagues (20 points)
  NBA: 20,
  NFL: 20,
  NHL: 20,
  MLB: 20,

  // Tier 2: Premier International Soccer (18 points)
  EPL: 18,
  LALIGA: 18,
  BUNDESLIGA: 18,
  SERIEA: 18,
  UCL: 18,

  // Tier 3: Other Pro Leagues (15 points)
  MLS: 15,
  WNBA: 15,
  UFC: 15,
  LIGUE1: 15,
  LIGAMX: 15,

  // Tier 4: Major College (only when ranked) (10 points)
  NCAAF: 10,
  NCAAMB: 10,

  // Tier 5: Other College (5 points)
  NCAAWB: 5,
};

// Broadcast tier scoring
const BROADCAST_TIERS = {
  tier1: { score: 25, networks: ['ESPN', 'ABC', 'FOX', 'CBS', 'NBC', 'TNT', 'TBS'] },
  tier2: { score: 18, networks: ['FS1', 'ESPN2', 'NBCSN', 'USA', 'TRUTV'] },
  tier3: { score: 12, networks: ['ESPNU', 'ESPN+', 'CBSSN', 'FS2', 'BTN', 'SEC NETWORK', 'ACC NETWORK', 'PAC-12'] },
  tier4: { score: 6, networks: [] },
};

/**
 * Calculate playoff/season type score (0-40 points)
 */
function calculatePlayoffScore(game) {
  const { seasonType, bracketRound, playoffRound, neutralSite } = game.metadata;

  // Playoff games get highest priority
  if (seasonType === 3) {
    let score = 40;

    // Championship games
    if (bracketRound?.includes('Champion') ||
        bracketRound?.includes('Final') ||
        playoffRound?.includes('Final')) {
      score = 40;
    }
    // Conference finals, semifinals
    else if (bracketRound?.includes('Semi') ||
             bracketRound?.includes('Conference')) {
      score = 38;
    }
    // Earlier playoff rounds
    else if (bracketRound || playoffRound) {
      score = 35;
    }

    // Neutral site playoff games often more important
    if (neutralSite) {
      score = Math.min(40, score + 2);
    }

    return score;
  }

  // Preseason gets minimal score
  if (seasonType === 1) {
    return 5;
  }

  // Regular season base score
  return 20;
}

/**
 * Calculate broadcast prominence score (0-25 points)
 */
function calculateBroadcastScore(game) {
  const broadcasts = game.metadata.broadcasts;

  if (!broadcasts || broadcasts.length === 0) {
    return 0;
  }

  let maxScore = 0;

  // Check all broadcast networks and take highest tier
  for (const broadcast of broadcasts) {
    for (const networkName of broadcast.names) {
      const upperNetwork = networkName.toUpperCase();

      // Check each tier
      for (const [tierName, tier] of Object.entries(BROADCAST_TIERS)) {
        if (tierName === 'tier4') continue;

        const match = tier.networks.some(net =>
          upperNetwork.includes(net.toUpperCase())
        );

        if (match) {
          maxScore = Math.max(maxScore, tier.score);
          break;
        }
      }
    }
  }

  // If no tier matched, give tier 4 score (regional/streaming)
  if (maxScore === 0 && broadcasts.length > 0) {
    maxScore = BROADCAST_TIERS.tier4.score;
  }

  return maxScore;
}

/**
 * Helper to parse record strings like "10-5" or "12-3-1"
 */
function parseRecord(recordStr) {
  if (!recordStr) return null;

  const parts = recordStr.split('-').map(n => parseInt(n, 10));
  if (parts.length < 2) return null;

  return {
    wins: parts[0] || 0,
    losses: parts[1] || 0,
    ties: parts[2] || 0,
  };
}

/**
 * Calculate team quality score (0-20 points)
 */
function calculateTeamQualityScore(game) {
  const { homeTeam, awayTeam } = game;
  let score = 0;

  // Check for ranked teams (college sports, some pro rankings)
  const homeRank = homeTeam.rank;
  const awayRank = awayTeam.rank;

  if (homeRank || awayRank) {
    // Top 5 teams
    if (homeRank <= 5 || awayRank <= 5) {
      score += 10;
    }
    // Top 10 teams
    else if (homeRank <= 10 || awayRank <= 10) {
      score += 8;
    }
    // Top 25 teams
    else if (homeRank <= 25 || awayRank <= 25) {
      score += 6;
    }

    // Both teams ranked (adds excitement)
    if (homeRank && awayRank) {
      score += 5;
    }
  }

  // Check playoff seeds
  const homeSeed = homeTeam.seed;
  const awaySeed = awayTeam.seed;

  if (homeSeed || awaySeed) {
    // Top seeds
    if (homeSeed <= 2 || awaySeed <= 2) {
      score += 8;
    }
    else if (homeSeed <= 4 || awaySeed <= 4) {
      score += 6;
    }
    else {
      score += 4;
    }
  }

  // Parse winning records (if no ranking/seed data)
  if (!homeRank && !awayRank && !homeSeed && !awaySeed) {
    const homeRecord = parseRecord(homeTeam.record);
    const awayRecord = parseRecord(awayTeam.record);

    if (homeRecord && awayRecord) {
      const homeWinPct = homeRecord.wins / (homeRecord.wins + homeRecord.losses);
      const awayWinPct = awayRecord.wins / (awayRecord.wins + awayRecord.losses);

      // Both teams have winning records
      if (homeWinPct > 0.6 && awayWinPct > 0.6) {
        score += 10;
      }
      // At least one strong team
      else if (homeWinPct > 0.7 || awayWinPct > 0.7) {
        score += 6;
      }
    }
  }

  return Math.min(20, score);
}

/**
 * Calculate league prestige score (0-20 points)
 */
function calculateLeaguePrestigeScore(game) {
  const leagueKey = game.leagueKey;
  let baseScore = LEAGUE_PRESTIGE[leagueKey] || 0;

  // For college sports, reduce score if teams aren't ranked
  if (leagueKey === 'NCAAF' || leagueKey === 'NCAAMB') {
    const { homeTeam, awayTeam } = game;
    const homeRank = homeTeam.rank;
    const awayRank = awayTeam.rank;

    // If neither team is ranked, drastically reduce college game importance
    if (!homeRank && !awayRank) {
      baseScore = 2; // Very low priority for unranked college games
    }
    // If only one team ranked and it's not top 25
    else if ((!homeRank || homeRank > 25) && (!awayRank || awayRank > 25)) {
      baseScore = 4; // Low priority
    }
  }

  return baseScore;
}

/**
 * Calculate contextual importance score (0-15 points)
 */
function calculateContextScore(game) {
  let score = 0;
  const { metadata } = game;

  // Neutral site games (championships, bowl games, etc.)
  if (metadata.neutralSite) {
    score += 5;
  }

  // High attendance relative to capacity
  if (metadata.attendance && metadata.venueCapacity) {
    const capacityPct = metadata.attendance / metadata.venueCapacity;
    if (capacityPct > 0.95) {
      score += 5;
    } else if (capacityPct > 0.85) {
      score += 3;
    }
  }

  // Conference championship games
  if (metadata.conferenceCompetition) {
    score += 3;
  }

  // Check for rivalry indicators in notes/headlines
  const allText = [
    ...(metadata.notes || []),
    ...(metadata.headlines || []),
  ].join(' ').toLowerCase();

  if (allText.includes('rival') || allText.includes('classic')) {
    score += 2;
  }

  return Math.min(15, score);
}

/**
 * Main ranking function
 * Returns game with added importanceScore and scoreBreakdown
 */
export function rankGame(game) {
  const playoffScore = calculatePlayoffScore(game);
  const broadcastScore = calculateBroadcastScore(game);
  const teamQualityScore = calculateTeamQualityScore(game);
  const contextScore = calculateContextScore(game);
  const leaguePrestigeScore = calculateLeaguePrestigeScore(game);

  const totalScore = playoffScore + broadcastScore + teamQualityScore + contextScore + leaguePrestigeScore;

  return {
    ...game,
    importanceScore: totalScore,
    scoreBreakdown: {
      playoff: playoffScore,
      broadcast: broadcastScore,
      teamQuality: teamQualityScore,
      context: contextScore,
      leaguePrestige: leaguePrestigeScore,
    },
  };
}

/**
 * Rank all games and return top N with league diversity
 */
export function getTopGames(games, limit = 30, maxGamesPerLeague = 5) {
  // Add ranking scores to all games
  const rankedGames = games.map(rankGame);

  // Sort by importance score (descending), with tie-breaker by start time
  rankedGames.sort((a, b) => {
    if (b.importanceScore !== a.importanceScore) {
      return b.importanceScore - a.importanceScore;
    }
    // Tie-breaker: earlier start time = higher priority
    return a.date.getTime() - b.date.getTime();
  });

  // Apply league diversity: limit games per league to ensure variety
  const leagueCounts = {};
  const diverseGames = [];

  for (const game of rankedGames) {
    const leagueKey = game.leagueKey || 'unknown';
    const currentCount = leagueCounts[leagueKey] || 0;

    // If this league hasn't hit the limit, include the game
    if (currentCount < maxGamesPerLeague) {
      diverseGames.push(game);
      leagueCounts[leagueKey] = currentCount + 1;

      // Stop once we have enough games
      if (diverseGames.length >= limit) {
        break;
      }
    }
  }

  return diverseGames;
}
