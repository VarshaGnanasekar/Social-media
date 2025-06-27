// GamingHub.tsx
import GameCard from "../components/GameCard"

export default function GamingHub() {
  const games = [
  // Puzzle Games
  {
    id: 1,
    title: "2048 Classic",
    genre: "Puzzle",
    image: "https://img.itch.zone/aW1nLzEzNDg2MjAucG5n/original/BW7m%2Fn.png",
    playLink: "https://play2048.co/",
  },
  {
    id: 2,
    title: "Tetris",
    genre: "Puzzle",
    image: "https://img.itch.zone/aW1nLzUxOTUwNjAucG5n/original/3%2FQw%2Fx.png",
    playLink: "https://tetris.com/play-tetris",
  },
  {
    id: 3,
    title: "Sudoku",
    genre: "Puzzle",
    image: "https://img.itch.zone/aW1nLzEyNjc2MTYucG5n/original/6%2F8qYV.png",
    playLink: "https://sudoku.com/",
  },

  // Strategy Games
  {
    id: 4,
    title: "Tic Tac Toe",
    genre: "Strategy",
    image: "https://img.itch.zone/aW1nLzU4NDU1OTcucG5n/original/%2B%2Fv%2B%2Ft.png",
    playLink: "https://playtictactoe.org/",
  },
  {
    id: 5,
    title: "Chess",
    genre: "Strategy",
    image: "https://img.itch.zone/aW1nLzYxMjQ3NDQucG5n/original/7%2F3Q%2F3.png",
    playLink: "https://www.chess.com/play/online",
  },
  {
    id: 6,
    title: "Checkers",
    genre: "Strategy",
    image: "https://img.itch.zone/aW1nLzU4NDU2MDMucG5n/original/0%2Fw%2F%2FQ.png",
    playLink: "https://www.mathsisfun.com/games/checkers.html",
  },

  // Skill Games
  {
    id: 7,
    title: "Typing Race",
    genre: "Skill",
    image: "https://img.itch.zone/aW1nLzYwNDQ2NjAucG5n/original/0%2F%2FJ4%2F.png",
    playLink: "https://play.typeracer.com/",
  },
  {
    id: 8,
    title: "Aim Trainer",
    genre: "Skill",
    image: "https://img.itch.zone/aW1nLzYyMjQ0MTYucG5n/original/%2F%2F%2Fw%2F1.png",
    playLink: "https://aimtrainer.io/",
  },
  {
    id: 9,
    title: "Reaction Time",
    genre: "Skill",
    image: "https://img.itch.zone/aW1nLzYyMjQ0MTcucG5n/original/9%2F%2F%2F%2Fk.png",
    playLink: "https://humanbenchmark.com/tests/reactiontime",
  },

  // Memory Games
  {
    id: 10,
    title: "Memory Flip",
    genre: "Memory",
    image: "https://img.itch.zone/aW1nLzU4NDU2MDYucG5n/original/5%2F%2F%2F%2F3.png",
    playLink: "https://www.memozor.com/memory-games/for-adults",
  },
  {
    id: 11,
    title: "Simon Game",
    genre: "Memory",
    image: "https://img.itch.zone/aW1nLzU4NDU2MDcucG5n/original/9%2F%2F%2F%2F7.png",
    playLink: "https://www.mathsisfun.com/games/simon.html",
  },
  {
    id: 12,
    title: "Pattern Memory",
    genre: "Memory",
    image: "https://img.itch.zone/aW1nLzYyMjQ0MTgucG5n/original/9%2F%2F%2F%2F9.png",
    playLink: "https://humanbenchmark.com/tests/memory",
  },

  // Classic Arcade
  {
    id: 13,
    title: "Snake Game",
    genre: "Arcade",
    image: "https://img.itch.zone/aW1nLzU4NDU2MDkucG5n/original/9%2F%2F%2F%2F9.png",
    playLink: "https://playsnake.org/",
  },
  {
    id: 14,
    title: "Pac-Man",
    genre: "Arcade",
    image: "https://img.itch.zone/aW1nLzU4NDU2MTAucG5n/original/9%2F%2F%2F%2F9.png",
    playLink: "https://www.pacman.com/",
  },
  {
    id: 15,
    title: "Space Invaders",
    genre: "Arcade",
    image: "https://img.itch.zone/aW1nLzU4NDU2MTEucG5n/original/9%2F%2F%2F%2F9.png",
    playLink: "https://www.spaceinvaders.com/",
  }
];

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl max-sm:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Ctrl+Play
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Dive into our collection of immersive games
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-xl font-medium mb-4 text-gray-300">More games coming soon</h3>
          <div className="flex justify-center gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-32 h-40 bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg opacity-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}