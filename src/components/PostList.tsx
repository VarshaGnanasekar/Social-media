import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";
import { useAuth } from "../context/AuthContext";

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  image_url: string;
  avatar_url?: string;
  like_count?: number;
  comment_count?: number;
  author: string;
}

const fetchFollowedPosts = async (userId: string): Promise<Post[]> => {
  const { data, error } = await supabase.rpc("get_followed_posts", {
    user_uuid: userId,
  });

  if (error) throw new Error(error.message);
  return data as Post[];
};

export const PostList = () => {
  const { user } = useAuth();

  const {
    data,
    error,
    isLoading,
  } = useQuery<Post[], Error>({
    queryKey: ["followed-posts", user?.id],
    queryFn: () => fetchFollowedPosts(user!.id),
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Please log in to see followed users' posts.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center text-white py-10">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 py-10">Error: {error.message}</div>;
  }

  if ((data?.length ?? 0) === 0) {
    return (
      <div className="text-center text-gray-400 mt-10">
        No posts yet by the people you follow.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6 justify-center px-4 py-10">
      {data!.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};
