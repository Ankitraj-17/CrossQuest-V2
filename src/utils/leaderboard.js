export function getLeaderboard() {
  const data = localStorage.getItem('mgh_leaderboard');
  return data ? JSON.parse(data) : {};
}

export function recordResult(gameId, playerName, resultType) {
  if (!playerName) return;
  const lb = getLeaderboard();
  if (!lb[gameId]) lb[gameId] = {};
  if (!lb[gameId][playerName]) {
    lb[gameId][playerName] = { wins: 0, losses: 0, draws: 0, games: 0 };
  }
  
  lb[gameId][playerName].games += 1;
  if (resultType === 'win')  lb[gameId][playerName].wins += 1;
  if (resultType === 'lose') lb[gameId][playerName].losses += 1;
  if (resultType === 'draw') lb[gameId][playerName].draws += 1;

  localStorage.setItem('mgh_leaderboard', JSON.stringify(lb));
}

export function clearLeaderboard() {
  localStorage.removeItem('mgh_leaderboard');
}
