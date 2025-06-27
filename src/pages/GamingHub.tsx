// GamingHub.tsx
import GameCard from "../components/GameCard"

export default function GamingHub() {
  const games = [
  // Puzzle Games
  {
    id: 1,
    title: "2048 Classic",
    genre: "Puzzle",
    image: "https://i.imgur.com/VBe4kD2.png", // Actual 2048 screenshot
    playLink: "https://play2048.co/"
  },
  {
    id: 2,
    title: "Tetris",
    genre: "Puzzle",
    image: "https://i.imgur.com/9JZwWqx.png", // Tetris gameplay
    playLink: "https://tetris.com/play-tetris"
  },
  {
    id: 3,
    title: "Sudoku",
    genre: "Puzzle",
    image: "https://i.imgur.com/7QZJY3a.png", // Clean Sudoku board
    playLink: "https://sudoku.com/"
  },

  // Strategy Games
  {
    id: 4,
    title: "Chess",
    genre: "Strategy",
    image: "https://i.imgur.com/3KZQY7j.png", // 3D chess board
    playLink: "https://www.chess.com/play/online"
  },
  {
    id: 5,
    title: "Checkers",
    genre: "Strategy",
    image: "https://i.imgur.com/5v8W9yT.png", // Checkers mid-game
    playLink: "https://www.mathsisfun.com/games/checkers.html"
  },

  // Skill Games
  {
    id: 6,
    title: "Typing Race",
    genre: "Skill",
    image: "https://i.imgur.com/JqyeZtT.png", // Typing test screenshot
    playLink: "https://play.typeracer.com/"
  },
  {
    id: 7,
    title: "Aim Trainer",
    genre: "Skill",
    image: "https://i.imgur.com/9YQ9Z3y.png", // Aim training target
    playLink: "https://aimtrainer.io/"
  },

  // Classic Arcade
  {
    id: 8,
    title: "Snake Game",
    genre: "Arcade",
    image: "https://i.imgur.com/9JZwWqx.png", // Classic snake game
    playLink: "https://playsnake.org/"
  },
  {
    id: 9,
    title: "Space Invaders",
    genre: "Arcade",
    image: "https://i.imgur.com/7QZJY3a.png", // Retro space invaders
    playLink: "https://www.spaceinvaders.com/"
  },
  {
    id: 10,
    title: "Pac-Man",
    genre: "Arcade",
    image: "https://i.imgur.com/VBe4kD2.png", // Classic Pac-Man
    playLink: "https://www.pacman.com/"
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