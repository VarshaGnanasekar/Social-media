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
        .neq("community_id", null),
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
  enabled: !!userId, // only run query if userId is available
});


  if (!user) return <p className="text-white">Please log in to view profile.</p>;
  if (isLoading || !stats) return <p className="text-white">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-white">
      <div className="flex items-center space-x-4">
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt="Avatar"
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.user_metadata.user_name}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Stats</h2>
        <ul className="mt-2 space-y-2">
          <li>📝 Total Posts: {stats.totalPosts}</li>
          <li>💬 Total Comments: {stats.totalComments}</li>
          <li>👍 Likes Received: {stats.totalLikesReceived}</li>
          <li>🌐 Communities Participated: {stats.uniqueCommunities}</li>
          <li>📅 Member Since: {new Date(user.created_at).toLocaleDateString()}</li>
        </ul>
      </div>
    </div>
  );
};
