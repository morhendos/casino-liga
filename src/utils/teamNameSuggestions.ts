// Array of 100 funny padel team names
const funnyTeamNames = [
  // Padel Puns
  "The Padel Whisperers",
  "Net Profits",
  "Court Jesters",
  "Lob Stars",
  "Wall-E's Padel Pals",
  "Smash Potatoes",
  "Return Policy",
  "Paddle Battle",
  "Glass Ceiling Breakers",
  "Backhand Bandits",
  
  // Sports Themed
  "Padel to the Metal",
  "No Love (Only Wins)",
  "Deuce & Juice",
  "The Spin Doctors",
  "Rally Cats",
  "Volley Llamas",
  "Grand Slam Sandwiches",
  "Drop Shot Hotshots",
  "Baseline Bosses",
  "Slice Girls",
  
  // Pop Culture Twists
  "Game of Throws",
  "Lord of the Strings",
  "The Walking Sets",
  "Padel-wan Kenobi",
  "Breaking Backhands",
  "The Paddle Bunch",
  "Mighty Morphin' Padel Rangers",
  "The Big Bang Racquets",
  "Stranger Swings",
  "The Mandalorian Matches",
  
  // Wordplay
  "Ace Ventura: Padel Detective",
  "Pun Intended",
  "Between the Lines",
  "Wimble-Done With You",
  "Padel-Monium",
  "Sweaty and We Know It",
  "In It to Win It",
  "Balls of Fury",
  "Victorious Secret",
  "The Server-vors",
  
  // Silly & Absurd
  "The Awkward Turtles",
  "Smashing Pumpkins",
  "Daft Padel",
  "Aggressive Pancakes",
  "The Cereal Killers",
  "Holy Guacamole",
  "Cobra Chai Latte",
  "Nacho Average Team",
  "Notorious DIG",
  "Jurassic Spark",
  
  // Food Themed
  "Taco 'Bout It",
  "The Spice Serves",
  "Hot Shots & Cool Dips",
  "Lord of the Onion Rings",
  "The Breakfast Club",
  "Padelling with Pineapple",
  "Guac and Roll",
  "Sushi Rollers",
  "Pizza Party Padel",
  "Egg-cellent Shots",
  
  // Animal Themes
  "Trash Pandas",
  "The Flying Squirrels",
  "Cunning Foxes",
  "Funky Monkeys",
  "Sloth-Like Reflexes",
  "The Turbo Turtles",
  "Sneaky Snakes",
  "The Galloping Giraffes",
  "Barking Spiders",
  "Silent but Koalas",
  
  // Classic Comedy
  "Weapons of Mass Instruction",
  "Error 404: Skill Not Found",
  "The Midlife Crisis",
  "Designated Drinkers",
  "Average Joes",
  "The Bad News Bears",
  "Snakes on a Court",
  "Plan B Team",
  "Better Late than Never",
  "We Showed Up",
  
  // Profession Based
  "The Accountants of Pain",
  "Legal Eagles",
  "The Spin Doctors",
  "Engineers of Victory",
  "The Marketing Maestros",
  "IT Crowd Control",
  "The Science Rackets",
  "Firefighter Forehands",
  "The Teaching Terrors",
  "Culinary Crushers",
  
  // Miscellaneous Gems
  "Too Hot to Handle",
  "Serves You Right",
  "Game, Set, Snack",
  "The Net Results",
  "Paddle Me This",
  "The Glass Cannons",
  "Bouncing Back",
  "Accidentally Athletic",
  "The Drama Queens",
  "Padel Me Away"
];

/**
 * Get a random team name suggestion
 * @returns A random funny team name
 */
export function getRandomTeamName(): string {
  const randomIndex = Math.floor(Math.random() * funnyTeamNames.length);
  return funnyTeamNames[randomIndex];
}

/**
 * Get multiple random team name suggestions
 * @param count Number of suggestions to return
 * @returns Array of random team names
 */
export function getRandomTeamNames(count: number = 3): string[] {
  // Create a copy of the array to avoid modifying the original
  const availableNames = [...funnyTeamNames];
  const suggestions: string[] = [];
  
  // Get random names without duplicates
  for (let i = 0; i < count && availableNames.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    suggestions.push(availableNames[randomIndex]);
    availableNames.splice(randomIndex, 1);
  }
  
  return suggestions;
}

export default funnyTeamNames;
