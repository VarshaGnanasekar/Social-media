import GameCard from "../components/GameCard"

export default function GamingHub() {
    
const games = [
  {
    id: 1,
    title: "2048 Classic",
    genre: "Puzzle",
    image: "https://picsum.photos/seed/2048/300/200",
    playLink: "/games/2048",
  },
  {
    id: 2,
    title: "Tic Tac Toe",
    genre: "Strategy",
    image: "https://picsum.photos/seed/tictactoe/300/200",
    playLink: "/games/tictactoe",
  },
  {
    id: 3,
    title: "Typing Race",
    genre: "Skill",
    image: "https://picsum.photos/seed/typing/300/200",
    playLink: "/games/typing",
  },
  {
    id: 4,
    title: "Memory Flip",
    genre: "Memory",
    image: "https://picsum.photos/seed/memory/300/200",
    playLink: "/games/memory",
  },
];
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        🎮 Gaming Hub
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
