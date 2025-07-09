import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { motion } from "framer-motion";
import type { Tweet } from "./TweetList";

const fetchTweetById = async (id: number): Promise<Tweet> => {
  const { data, error } = await supabase
    .from("tweets")
    .select(`
      *,
      profiles:user_id (avatar_url)
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Tweet;
};

export const TweetDetail = ({ tweetId }: { tweetId: number }) => {
  const { data, error, isLoading } = useQuery<Tweet, Error>({
    queryKey: ["tweet", tweetId],
    queryFn: () => fetchTweetById(tweetId),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-800 rounded animate-pulse" style={{ width: `${100 - (i * 15)}%` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto p-6 bg-red-900/10 rounded-xl border border-red-800/50"
      >
        <div className="flex items-center gap-3 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-bold">Failed to load tweet</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6 space-y-6"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {data?.avatar_url ? (
            <img
              src={data.avatar_url}
              alt={data.author}
              className="w-12 h-12 rounded-full border border-gray-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white text-lg">{data?.author}</span>
            <span className="text-gray-500 text-sm">
              · {new Date(data!.created_at).toLocaleString()}
            </span>
          </div>

          <p className="mt-2 text-gray-200 whitespace-pre-line text-lg">
            {data?.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
};