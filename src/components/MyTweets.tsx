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
      <div className="max-w-md mx-auto p-4 bg-black rounded-lg text-center text-gray-300 text-sm">
        Please sign in to view your tweets.
      </div>
    );

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-md mx-auto p-4 bg-red-900/10 rounded-lg text-center text-red-400 text-sm">
        Error: {error.message}
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="max-w-md mx-auto p-4 bg-black rounded-lg text-center text-gray-500 text-sm">
        You haven't tweeted anything yet.
      </div>
    );

  return (
    <div className="pb-8 px-4">
      <h2 className="text-2xl max-sm:text-1xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-cyan-400  bg-clip-text text-transparent">
        My Tweets
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {data.map((tweet) => (
          <motion.div
            key={tweet.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-black border border-gray-800 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>@{tweet.author}</span>
                <span>
                  {new Date(tweet.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-200 line-clamp-3">{tweet.content}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDelete(tweet.id)}
              disabled={isDeleting && deletingTweetId === tweet.id}
              className={`w-full mt-2 px-3 py-1 text-xs rounded-md flex items-center justify-center gap-1 transition-all ${
                isDeleting && deletingTweetId === tweet.id
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-red-900/30 hover:bg-red-900/40 text-red-400 hover:text-red-300"
              }`}
            >
              {isDeleting && deletingTweetId === tweet.id ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3"
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
                    className="w-3 h-3"
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