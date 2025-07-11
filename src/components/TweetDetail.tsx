import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { motion } from "framer-motion";
import type { Tweet } from "./TweetList";

interface Props {
  tweetId: number;
}

const fetchTweetById = async (id: number): Promise<Tweet> => {
  const { data, error } = await supabase.from("tweets").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data as Tweet;
};

export const TweetDetail = ({ tweetId }: Props) => {
  const { data, error, isLoading } = useQuery<Tweet, Error>({
    queryKey: ["tweet", tweetId],
    queryFn: () => fetchTweetById(tweetId),
  });

  if (isLoading) {
    return <div className="text-center text-white py-10">Loading tweet...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 py-10">Error: {error.message}</div>;
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6 space-y-6 bg-black rounded-xl border border-gray-800"
    >
      <header className="flex gap-4 items-center">
        {data?.avatar_url ? (
          <img
            src={data.avatar_url}
            alt={data.author}
            className="w-12 h-12 rounded-full border border-gray-700"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-sm text-white">👤</span>
          </div>
        )}
        <div>
          <h3 className="text-white font-semibold">{data?.author}</h3>
          <p className="text-gray-500 text-sm">
            new Date(data?.created_at ?? "").toLocaleDateString()
          </p>
        </div>
      </header>

      <section>
        <p className="text-gray-300 text-lg whitespace-pre-line">{data?.content}</p>
      </section>

      <footer className="flex gap-6 text-gray-400 text-sm">
        <span>❤️ {data?.like_count ?? 0}</span>
        <span>💬 {data?.comment_count ?? 0}</span>
      </footer>
    </motion.article>
  );
};
