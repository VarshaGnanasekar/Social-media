import { useQuery } from "@tanstack/react-query";
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
  author: string; 
}

const fetchMyPosts = async (userId: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .rpc("get_my_posts_with_counts", { user_id_input: userId });

  if (error) throw new Error(error.message);
  return data as Post[];
};

export const MyPosts = () => {
  const { user } = useAuth();

  const { data, error, isLoading } = useQuery<Post[], Error>({
    queryKey: ["my-posts", user?.id],
    queryFn: () => fetchMyPosts(user!.id),
    enabled: !!user?.id,
  });

  if (!user) return <div className="text-white text-center">Please sign in to view your posts.</div>;

  if (isLoading) return <div className="text-white text-center">Loading your posts...</div>;

  if (error) return <div className="text-red-400 text-center">Error: {error.message}</div>;

  if (data?.length === 0) return <div className="text-gray-400 text-center">You haven't created any posts yet.</div>;

  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400 mb-4">
            My Posts
      </h1>
      <div className="flex flex-wrap gap-6 justify-center">
      
      {data?.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
    </div>
    
  );
};
