// GameCard.tsx
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
    <div className="
      bg-[#0d0d0d] 
      border border-[#1f1f1f] 
      rounded-xl 
      overflow-hidden 
      shadow-lg 
      hover:scale-[1.02] 
      transition-all
      duration-300
      hover:shadow-purple-900/30
      hover:border-[#333]
      group
    ">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={game.image} 
          alt={game.title} 
          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1 text-white">{game.title}</h2>
        <p className="text-sm text-gray-400 mb-3">{game.genre}</p>
        <a
  href={game.playLink}
  className="
    inline-flex
    items-center
    gap-2
    bg-transparent
    hover:bg-gray-800/50
    border border-gray-700
    hover:border-gray-600
    px-4 py-2
    rounded-lg
    text-sm font-medium
    transition-all
    duration-200
    group
  "
>
  <span>Play</span>
  <Play 
    size={16}
    strokeWidth={2}
    className="transition-transform group-hover:translate-x-0.5"
  />
</a>
      </div>
    </div>
  );
}