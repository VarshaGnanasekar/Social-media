import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";

export interface Tweet {
  id: number;
  content: string;
  user_id: string;
  author: string;
  created_at: string;
}

const fetchMyTweets = async (userId: string): Promise<Tweet[]> => {
  const { data, error } = await supabase
    .from("tweets")
    .select("*")
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

  const { data, isLoading, error } = useQuery<Tweet[], Error>({
    queryKey: ["my-tweets", user?.id],
    queryFn: () => fetchMyTweets(user!.id),
    enabled: !!user?.id,
  });

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteTweet,
    onMutate: (id) => setDeletingTweetId(id),
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

  if (!data || data.length === 0)
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg text-center text-gray-400">
        You haven't tweeted anything yet.
      </div>
    );

  return (
    <div className="pb-12 px-4">
      <h2 className="text-4xl max-sm:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-cyan-400  bg-clip-text text-transparent">
        My Tweets
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {data.map((tweet) => (
          <motion.div
            key={tweet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 border border-gray-700 p-5 rounded-xl shadow-lg text-white flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>@{tweet.author}</span>
                <span>
                  {new Date(tweet.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-lg">{tweet.content}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDelete(tweet.id)}
              disabled={isDeleting && deletingTweetId === tweet.id}
              className={`mt-4 px-5 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isDeleting && deletingTweetId === tweet.id
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300"
              }`}
            >
              {isDeleting && deletingTweetId === tweet.id ? (
                <>
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
                  <span>Deleting...</span>
                </>
              ) : (
                <>
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
                  <span>Delete</span>
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
