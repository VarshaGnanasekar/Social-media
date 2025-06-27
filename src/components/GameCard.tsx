type Game = {
  id: number;
  title: string;
  genre: string;
  image: string;
  playLink: string;
};

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition">
      <img src={game.image} alt={game.title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1">{game.title}</h2>
        <p className="text-sm text-gray-400 mb-3">{game.genre}</p>
        <a
          href={game.playLink}
          className="inline-block bg-pink-600 hover:bg-pink-700 px-3 py-1.5 rounded text-sm font-medium"
        >
          Play Now
        </a>
      </div>
    </div>
  );
}
