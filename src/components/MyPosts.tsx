import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { PostItem } from "./PostItem";
import { useState } from "react";
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

const fetchMyPosts = async (userId: string): Promise<Post[]> => {
  const { data, error } = await supabase.rpc("get_my_posts_with_counts", {
    user_id_input: userId,
  });
  if (error) throw new Error(error.message);
  return data as Post[];
};

const deletePost = async (postId: number) => {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);
};

export const MyPosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

  const { data, error, isLoading } = useQuery<Post[], Error>({
    queryKey: ["my-posts", user?.id],
    queryFn: () => fetchMyPosts(user!.id),
    enabled: !!user?.id,
  });

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: deletePost,
    onMutate: (postId) => setDeletingPostId(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      setDeletingPostId(null);
    },
    onError: () => setDeletingPostId(null),
  });

  if (!user)
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg text-center text-white">
        Please sign in to view your posts.
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
        You haven't created any posts yet.
      </div>
    );

  return (
    <div className="pb-12 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-bold mb-12 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
      >
        My Posts
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {data?.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <PostItem post={post} />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDelete(post.id)}
              disabled={isDeleting && deletingPostId === post.id}
              className={`mt-4 px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isDeleting && deletingPostId === post.id
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300"
              }`}
            >
              {isDeleting && deletingPostId === post.id ? (
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
                  <span>Delete Post</span>
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
