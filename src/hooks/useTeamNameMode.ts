import { useLocalStorage } from './useLocalStorage';
import { getRandomTeamName } from '@/utils/teamNameSuggestions';

// Type for team name mode
export type TeamNameMode = 'manual' | 'sequential' | 'funny';

// LocalStorage key
const TEAM_NAME_MODE_KEY = 'padeliga-team-name-mode';

export const useTeamNameMode = () => {
  const [teamNameMode, setTeamNameMode] = useLocalStorage<TeamNameMode>(
    TEAM_NAME_MODE_KEY,
    'manual'
  );
  
  return {
    teamNameMode,
    setTeamNameMode,
  };
};

export const useTeamName = (teamsCount: number = 0) => {
  const { teamNameMode } = useTeamNameMode();
  const [teamName, setTeamName] = useLocalStorage<string>('padeliga-team-name', '');
  const [nextSequentialLetter, setNextSequentialLetter] = useLocalStorage<string>(
    'padeliga-next-letter',
    'A'
  );

  // Update the next sequential letter based on existing teams
  const updateNextSequentialLetter = (teams: any[]) => {
    const letterTeams = teams.filter((team) => team.name.match(/^Team [A-Z]$/));

    if (letterTeams.length === 0) {
      setNextSequentialLetter('A');
      return;
    }

    // Find the highest letter used
    const highestLetter =
      letterTeams
        .map((team) => team.name.charAt(team.name.length - 1))
        .sort()
        .pop() || 'A';

    // Get the next letter in sequence
    const nextLetter = String.fromCharCode(highestLetter.charCodeAt(0) + 1);
    setNextSequentialLetter(nextLetter);
  };

  // Generate a team name based on the selected mode
  const updateTeamName = () => {
    switch (teamNameMode) {
      case 'sequential':
        setTeamName(`Team ${nextSequentialLetter}`);
        break;
      case 'funny':
        setTeamName(getRandomTeamName());
        break;
      // For manual mode, only set the name if it's currently empty
      case 'manual':
        if (!teamName.trim()) {
          setTeamName('');
        }
        break;
    }
  };

  // Generate a new random funny team name
  const generateRandomFunnyName = () => {
    setTeamName(getRandomTeamName());
  };

  return {
    teamName,
    setTeamName,
    nextSequentialLetter,
    updateNextSequentialLetter,
    updateTeamName,
    generateRandomFunnyName,
  };
};
