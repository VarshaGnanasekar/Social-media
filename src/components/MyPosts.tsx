import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
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
    mutationFn: (postId: number) => deletePost(postId),
    onMutate: (postId) => setDeletingPostId(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      setDeletingPostId(null);
    },
    onError: () => {
      setDeletingPostId(null);
    },
  });

  if (!user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <div className="max-w-md mx-auto p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700 shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-2">Welcome!</h3>
          <p className="text-gray-300">Please sign in to view your posts.</p>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto p-6 bg-red-900/20 rounded-xl border border-red-700/50 text-red-300 text-center"
      >
        Error: {error.message}
      </motion.div>
    );
  }

  if (data?.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <div className="max-w-md mx-auto p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700 shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-2">No posts yet</h3>
          <p className="text-gray-400">You haven't created any posts yet.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="py-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-purple-500 to-cyan-400  bg-clip-text text-transparent"
      >
        My Posts
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {data?.map((post, index) => (
          <motion.div
            key={post.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-700/50 hover:border-pink-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.image_url}
                alt="Post"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{post.title}</h3>
              <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>

              <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                <span>By: {post.author}</span>
                <div className="flex space-x-2">
                  <span className="flex items-center">
                    ❤️ {post.like_count ?? 0}
                  </span>
                  <span className="flex items-center">
                    💬 {post.comment_count ?? 0}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDelete(post.id)}
                disabled={isDeleting && deletingPostId === post.id}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                  isDeleting && deletingPostId === post.id
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                }`}
              >
                {isDeleting && deletingPostId === post.id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Post
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
