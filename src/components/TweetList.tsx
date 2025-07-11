import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { TweetItem } from "./TweetItem";
import { useAuth } from "../context/AuthContext";

export interface Tweet {
  id: number;
  content: string;
  created_at: string;
  avatar_url?: string;
  like_count?: number;
  comment_count?: number;
  author: string;
}

const fetchFollowedTweets = async (userId: string): Promise<Tweet[]> => {
  const { data, error } = await supabase.rpc("get_followed_tweets", {
    user_uuid: userId,
  });

  if (error) throw new Error(error.message);
  return data as Tweet[];
};

export const TweetList = () => {
  const { user } = useAuth();

  const {
    data,
    error,
    isLoading,
  } = useQuery<Tweet[], Error>({
    queryKey: ["followed-tweets", user?.id],
    queryFn: () => fetchFollowedTweets(user!.id),
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Please log in to see followed users' tweets.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center text-white py-10">Loading tweets...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 py-10">Error: {error.message}</div>;
  }

  if ((data?.length ?? 0) === 0) {
    return (
      <div className="text-center text-gray-400 mt-10">
        No tweets yet by the people you follow.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-10 max-w-xl mx-auto">
      {data!.map((tweet) => (
        <TweetItem key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
};
