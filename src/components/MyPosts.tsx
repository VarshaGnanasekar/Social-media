import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { PostItem } from "./PostItem";
import { useState } from "react";

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
    return <div className="text-white text-center">Please sign in to view your posts.</div>;

  if (isLoading)
    return <div className="text-white text-center">Loading your posts...</div>;

  if (error)
    return <div className="text-red-400 text-center">Error: {error.message}</div>;

  if (data?.length === 0)
    return (
      <div className="text-gray-400 text-center">
        You haven't created any posts yet.
      </div>
    );

  return (
    <div>
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        My Posts
      </h2>

      <div className="flex flex-wrap gap-6 justify-center">
        {data?.map((post) => (
          <div key={post.id} className="relative">
            <PostItem post={post} />
            <button
              onClick={() => handleDelete(post.id)}
              disabled={isDeleting && deletingPostId === post.id}
              className={`absolute bottom-2 right-2 text-red-500 hover:text-red-600 transition ${
                isDeleting && deletingPostId === post.id
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              title="Delete post"
            >
              {isDeleting && deletingPostId === post.id ? (
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
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
