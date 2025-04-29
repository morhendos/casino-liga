/**
 * Public league rankings table component
 */

import { Trophy, Medal, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Ranking {
  _id: string;
  team: {
    _id: string;
    name: string;
  };
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
}

interface RankingsTableProps {
  rankings: Ranking[];
}

export default function RankingsTable({ rankings }: RankingsTableProps) {
  if (!rankings || rankings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No rankings available yet.</p>
      </div>
    );
  }
  
  // Sort rankings by points (descending)
  const sortedRankings = [...rankings].sort((a, b) => b.points - a.points);
  
  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800/50">
              <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Pos
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Team
              </th>
              <th className="p-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                MP
              </th>
              <th className="p-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                W
              </th>
              <th className="p-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                L
              </th>
              <th className="p-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Sets
              </th>
              <th className="p-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Pts
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/30">
            {sortedRankings.map((ranking, index) => (
              <tr 
                key={ranking._id} 
                className={cn(
                  "transition-colors", 
                  "hover:bg-gray-800/30",
                  index === 0 ? "bg-yellow-500/10" : 
                  index === 1 ? "bg-gray-400/10" : 
                  index === 2 ? "bg-amber-700/10" : 
                  ""
                )}
              >
                <td className="p-3 whitespace-nowrap text-sm">
                  <PositionBadge position={index + 1} />
                </td>
                <td className="p-3 whitespace-nowrap text-sm font-medium text-white">
                  {ranking.team?.name || 'Unknown'}
                </td>
                <td className="p-3 whitespace-nowrap text-sm text-gray-400 text-center">
                  {ranking.matchesPlayed}
                </td>
                <td className="p-3 whitespace-nowrap text-sm text-green-400 text-center font-medium">
                  {ranking.matchesWon}
                </td>
                <td className="p-3 whitespace-nowrap text-sm text-red-400 text-center font-medium">
                  {ranking.matchesLost}
                </td>
                <td className="p-3 whitespace-nowrap text-sm text-blue-400 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10">
                    {ranking.setsWon}-{ranking.setsLost}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full font-bold text-sm bg-purple-500/20 text-purple-300">
                    {ranking.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold shadow-lg">
        <Trophy size={12} />
      </div>
    );
  }
  
  if (position === 2) {
    return (
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900 font-bold shadow-lg">
        <Medal size={12} />
      </div>
    );
  }
  
  if (position === 3) {
    return (
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-lg">
        <Medal size={12} />
      </div>
    );
  }
  
  return (
    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-gray-400 font-medium">
      {position}
    </div>
  );
}