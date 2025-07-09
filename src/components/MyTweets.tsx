import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";

export interface Tweet {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  author: string;
  avatar_url?: string;
}

const fetchMyTweets = async (userId: string): Promise<Tweet[]> => {
  const { data, error } = await supabase
    .from("tweets")
    .select(`
      *,
      profiles:user_id (avatar_url)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Tweet[];
};

const deleteTweet = async (tweetId: number) => {
  const { error } = await supabase.from("tweets").delete().eq("id", tweetId);
  if (error) throw new Error(error.message);
};

export const MyTweets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deletingTweetId, setDeletingTweetId] = useState<number | null>(null);

  const { data, error, isLoading } = useQuery<Tweet[], Error>({
    queryKey: ["my-tweets", user?.id],
    queryFn: () => fetchMyTweets(user!.id),
    enabled: !!user?.id,
  });

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteTweet,
    onMutate: (tweetId) => setDeletingTweetId(tweetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tweets"] });
      setDeletingTweetId(null);
    },
    onError: () => setDeletingTweetId(null),
  });

  if (!user)
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg text-center text-white">
        Please sign in to view your tweets.
      </div>
    );

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-md mx-auto p-6 bg-red-900/20 rounded-lg text-center text-red-300">
        Error: {error.message}
      </div>
    );

  if (data?.length === 0)
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg text-center text-gray-400">
        You haven't tweeted anything yet.
      </div>
    );

  return (
    <div className="pb-12 px-4">
      <h2 className="text-4xl max-sm:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
        My Tweets
      </h2>

      <div className="max-w-2xl mx-auto space-y-6">
        {data?.map((tweet) => (
          <motion.div
            key={tweet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-5 relative"
          >
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {tweet.avatar_url ? (
                  <img
                    src={tweet.avatar_url}
                    alt={tweet.author}
                    className="w-10 h-10 rounded-full border border-gray-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
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
                  <span className="font-medium text-white">{tweet.author}</span>
                  <span className="text-gray-500 text-sm">
                    · {new Date(tweet.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="mt-1 text-gray-200 whitespace-pre-line">
                  {tweet.content}
                </p>
              </div>
            </div>

            {/* Delete Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDelete(tweet.id)}
              disabled={isDeleting && deletingTweetId === tweet.id}
              className={`absolute top-4 right-4 p-2 rounded-full ${
                isDeleting && deletingTweetId === tweet.id
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300"
              }`}
            >
              {isDeleting && deletingTweetId === tweet.id ? (
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16"
                  />
                </svg>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};