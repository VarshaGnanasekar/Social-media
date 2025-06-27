// GamingHub.tsx
import GameCard from "../components/GameCard"

export default function GamingHub() {
  const games = [
  // Puzzle Games
  {
    id: 1,
    title: "2048 Classic",
    genre: "Puzzle",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/2048_gameplay.png",
    playLink: "https://play2048.co/"
  },
  {
    id: 2,
    title: "Tetris",
    genre: "Puzzle",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Tetris_Game_Boy_screenshot.png",
    playLink: "https://tetris.com/play-tetris"
  },
  {
    id: 3,
    title: "Sudoku",
    genre: "Puzzle",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sudoku-by-L2G-20050714.svg/800px-Sudoku-by-L2G-20050714.svg.png",
    playLink: "https://sudoku.com/"
  },

  // Strategy Games
  {
    id: 4,
    title: "Chess",
    genre: "Strategy",
    image: "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PeterDoggers/phpCFSdYo.png",
    playLink: "https://www.chess.com/play/online"
  },
  {
    id: 5,
    title: "Checkers",
    genre: "Strategy",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Checkers-Canadian.png/640px-Checkers-Canadian.png",
    playLink: "https://www.mathsisfun.com/games/checkers.html"
  },

  // Skill Games
  {
    id: 6,
    title: "Typing Race",
    genre: "Skill",
    image: "https://i.ibb.co/kHtbj7v/typingrace.png",
    playLink: "https://play.typeracer.com/"
  },
  {
    id: 7,
    title: "Aim Trainer",
    genre: "Skill",
    image: "https://i.ibb.co/Jn8Wq6C/aimtrainer.png",
    playLink: "https://aimtrainer.io/"
  },

  // Classic Arcade
  {
    id: 8,
    title: "Snake Game",
    genre: "Arcade",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Snake_game.gif",
    playLink: "https://playsnake.org/"
  },
  {
    id: 9,
    title: "Space Invaders",
    genre: "Arcade",
    image: "https://upload.wikimedia.org/wikipedia/en/0/01/Space_Invaders_arcade_game.png",
    playLink: "https://www.retrogames.cz/play_023-Arcade.php?language=EN"
  },
  {
    id: 10,
    title: "Pac-Man",
    genre: "Arcade",
    image: "https://upload.wikimedia.org/wikipedia/en/5/59/Pac-man.png",
    playLink: "https://www.pacman.com/en/"
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