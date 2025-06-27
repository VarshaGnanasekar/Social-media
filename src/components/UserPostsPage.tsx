import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // assuming React Router
import { supabase } from "../supabase-client";

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  image_url?: string;
  like_count?: number;
  comment_count?: number;
};

type Profile = {
  id: string;
  user_name: string;
  avatar_url?: string;
};

export const UserPostsPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      setLoading(true);
      const [profileRes, postRes] = await Promise.all([
        supabase.from("profiles").select("id, user_name, avatar_url").eq("id", userId).single(),
        supabase.rpc("get_my_posts_with_counts", { user_id_input: userId }),
      ]);

      if (profileRes.error || postRes.error) {
        console.error("Error loading user/posts", profileRes.error || postRes.error);
      } else {
        setUserProfile(profileRes.data);
        setPosts(postRes.data || []);
      }

      setLoading(false);
    };

    if (userId) fetchUserAndPosts();
  }, [userId]);

  if (loading) {
    return <div className="text-center text-white py-10">Loading posts...</div>;
  }

  if (!userProfile) {
    return <div className="text-center text-red-400 py-10">User not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
        Posts by {userProfile.user_name}
      </h2>

      {posts.length === 0 ? (
        <div className="text-center text-gray-400">No posts yet.</div>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.id} className="bg-[#1c1c1c] p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p className="text-sm text-gray-300">{post.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                Posted on {new Date(post.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
