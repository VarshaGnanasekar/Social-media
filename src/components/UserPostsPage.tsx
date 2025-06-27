import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";
import { motion } from "framer-motion";

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

interface Profile {
  id: string;
  user_name: string;
  avatar_url?: string;
}

const fetchUserProfile = async (userId: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_name, avatar_url")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  const { data, error } = await supabase.rpc("get_my_posts_with_counts", {
    user_id_input: userId,
  });
  if (error) throw new Error(error.message);
  return data as Post[];
};

export const UserPostsPage = () => {
  const { userId } = useParams<{ userId: string }>();

  const {
    data: profile,
    isLoading: loadingProfile,
    error: profileError,
  } = useQuery<Profile, Error>({
    queryKey: ["user-profile", userId],
    queryFn: () => fetchUserProfile(userId!),
    enabled: !!userId,
  });

  const {
    data: posts,
    isLoading: loadingPosts,
    error: postsError,
  } = useQuery<Post[], Error>({
    queryKey: ["user-posts", userId],
    queryFn: () => fetchUserPosts(userId!),
    enabled: !!userId,
  });

  if (loadingProfile || loadingPosts)
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );

  if (profileError || postsError)
    return (
      <div className="max-w-md mx-auto p-6 bg-red-900/20 rounded-lg text-center text-red-300">
        Error: {profileError?.message || postsError?.message}
      </div>
    );

  if (!posts || posts.length === 0)
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg text-center text-gray-400">
        {profile?.user_name} has not created any posts yet.
      </div>
    );

  return (
    <div className="pb-12 px-4">
      <h2 className="text-4xl max-sm:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-cyan-400  bg-clip-text text-transparent">
        Posts by {profile?.user_name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <PostItem post={post} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
