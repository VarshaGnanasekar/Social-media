import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { PostItem } from "./PostItem";

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  image_url: string;
  avatar_url?: string;
  like_count?: number;
  comment_count?: number;
}

const fetchMyPosts = async (userId: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .rpc("get_my_posts_with_counts", { user_id_input: userId });

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

  const { data, error, isLoading } = useQuery<Post[], Error>({
    queryKey: ["my-posts", user?.id],
    queryFn: () => fetchMyPosts(user!.id),
    enabled: !!user?.id,
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["my-posts", user.id] });
      }
    },
  });

  const confirmAndDelete = (postId: number) => {
    const confirm = window.confirm("Are you sure you want to delete this post?");
    if (confirm) {
      handleDelete(postId);
    }
  };

  if (!user) return <div className="text-white text-center">Please sign in to view your posts.</div>;
  if (isLoading) return <div className="text-white text-center">Loading your posts...</div>;
  if (error) return <div className="text-red-400 text-center">Error: {error.message}</div>;
  if (data?.length === 0) return <div className="text-gray-400 text-center">You haven't created any posts yet.</div>;

  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {data?.map((post) => (
        <div key={post.id} className="relative">
          <PostItem post={post} />
          <button
            onClick={() => confirmAndDelete(post.id)}
            className="absolute top-2 right-2 bg-red-600 text-white text-sm px-2 py-1 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
