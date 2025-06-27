// GamingHub.tsx
import GameCard from "../components/GameCard"

export default function GamingHub() {
const games = [
  {
    id: 1,
    title: "2048 Classic",
    genre: "Puzzle",
    image: "/one.avif", 
    playLink: "https://play2048.co/"
  },
  {
    id: 2,
    title: "Tetris",
    genre: "Puzzle",
    image: "/two.jpg", 
    playLink: "https://tetris.com/play-tetris"
  },
  {
    id: 3,
    title: "Sudoku",
    genre: "Puzzle",
    image: "/three.avif", 
    playLink: "https://sudoku.com/"
  },
  {
    id: 4,
    title: "Chess",
    genre: "Strategy",
    image: "/four.jpeg", 
    playLink: "https://www.chess.com/play/online"
  },
  {
    id: 5,
    title: "Checkers",
    genre: "Strategy",
    image: "/five.jpg",
    playLink: "https://www.mathsisfun.com/games/checkers.html"
  },

  // Skill Games
  {
    id: 6,
    title: "Typing Race",
    genre: "Skill",
    image: "/six.png",
    playLink: "https://play.typeracer.com/"
  },
  {
    id: 7,
    title: "Aim Trainer",
    genre: "Skill",
    image: "/six.png",
    playLink: "https://aimtrainer.io/"
  },

  // Classic Arcade
  {
    id: 8,
    title: "Snake Game",
    genre: "Arcade",
    image: "/eight.jpg",
    playLink: "https://playsnake.org/"
  },
  {
    id: 9,
    title: "Space Invaders",
    genre: "Arcade",
    image: "/nine.png",
    playLink: "https://www.retrogames.cz/play_023-Arcade.php?language=EN"
  },
  {
    id: 10,
    title: "Pac-Man",
    genre: "Arcade",
    image: "/ten.jpg",
    playLink: "https://www.pacman.com/en/"
  }
];


  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl max-sm:text-2xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
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