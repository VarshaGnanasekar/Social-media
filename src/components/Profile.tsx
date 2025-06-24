import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

export const Profile = () => {
  const { user } = useAuth();

  const userId = user?.id;

  const { data: stats, isLoading } = useQuery({
  queryKey: ["user-stats", userId],
  queryFn: async () => {
    if (!userId) return null;

    const [postsRes, commentsRes, votesRes, communitiesRes] = await Promise.all([
      supabase.from("posts").select("id").eq("user_id", userId),
      supabase.from("comments").select("id").eq("user_id", userId),
      supabase
        .from("votes")
        .select("vote, posts!inner(user_id)")
        .eq("posts.user_id", userId)
        .gte("vote", 1),
      supabase
        .from("posts")
        .select("community_id")
        .eq("user_id", userId)
        .not("community_id", "is", null) ,
    ]);

    if (postsRes.error || commentsRes.error || votesRes.error || communitiesRes.error)
      throw new Error("Failed to fetch stats");

    const totalPosts = postsRes.data.length;
    const totalComments = commentsRes.data.length;
    const totalLikesReceived = votesRes.data.length;
    const uniqueCommunities = new Set(communitiesRes.data.map((p) => p.community_id)).size;

    return {
      totalPosts,
      totalComments,
      totalLikesReceived,
      uniqueCommunities,
    };
  },
  enabled: !!userId,
});


  if (!user) return <p className="text-white">Please log in to view profile.</p>;
  if (isLoading || !stats) return <p className="text-white">Loading...</p>;

  return (

  <div className="max-w-4xl mx-auto py-12 px-4 text-white">
    {/* Profile Header */}
    <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-4 shadow-md border border-white/10">
      {user.user_metadata?.avatar_url && (
        <img
          src={user.user_metadata.avatar_url}
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
      )}
      <div>
        <h1 className="text-3xl font-bold">{user.user_metadata.user_name}</h1>
        <p className="text-gray-400">{user.email}</p>
        <p className="text-sm text-gray-500 mt-1">
          Member since: {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>

    {/* Stats Section */}
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray-900 rounded-lg p-4 text-center border border-white/10 shadow-sm">
        <p className="text-4xl font-bold">{stats.totalPosts}</p>
        <p className="text-gray-400 mt-1">Posts</p>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 text-center border border-white/10 shadow-sm">
        <p className="text-4xl font-bold">{stats.totalComments}</p>
        <p className="text-gray-400 mt-1">Comments</p>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 text-center border border-white/10 shadow-sm">
        <p className="text-4xl font-bold">{stats.totalLikesReceived}</p>
        <p className="text-gray-400 mt-1">Likes Received</p>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 text-center border border-white/10 shadow-sm">
        <p className="text-4xl font-bold">{stats.uniqueCommunities}</p>
        <p className="text-gray-400 mt-1">Communities</p>
      </div>
    </div>
  </div>

  );
};
