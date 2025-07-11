import { motion } from "framer-motion";
import type { Tweet } from "./TweetList";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

interface Props {
  tweet: Tweet;
}

export const TweetItem = ({ tweet }: Props) => {
  const avatarUrl = tweet.avatar_url;
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) return;

    const { error } = await supabase.from("votes").insert({
      user_id: user.id,
      post_id: tweet.id,
      vote: 1,
      content_type: "tweet",
    });

    if (error) {
      console.error("Error liking tweet:", error.message);
    } else {
      // Optional: trigger refetch using queryClient.invalidateQueries
      location.reload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-black rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-colors duration-300"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={tweet.author}
              className="w-10 h-10 rounded-full border border-gray-700 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{tweet.author}</span>
            <span className="text-gray-500 text-sm">
              · {new Date(tweet.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <p className="mt-1 text-gray-200 whitespace-pre-line">{tweet.content}</p>

          {/* Like + Comment Count */}
          <div className="flex gap-6 mt-2 text-sm text-gray-400">
            <button onClick={handleLike} className="flex items-center gap-1 hover:text-pink-400 transition-colors">
              ❤️ {tweet.like_count ?? 0}
            </button>
            <div className="flex items-center gap-1 hover:text-blue-400 transition-colors">
              💬 {tweet.comment_count ?? 0}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
