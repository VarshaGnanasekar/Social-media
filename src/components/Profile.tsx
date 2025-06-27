import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import {
  MessageCircle,
  ThumbsUp,
  Users,
  Pencil,
  MessageSquareText,
  UserPlus,
  UserMinus
} from "lucide-react";

export const Profile = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["user-stats", userId],
    queryFn: async () => {
      if (!userId) return null;

      const [postsRes, commentsRes, votesRes, communitiesRes, messagesSentRes, messagesReceivedRes, followersRes, followingRes] = await Promise.all([
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
          .not("community_id", "is", null),
        supabase.from("messages").select("id").eq("sender_id", userId),
        supabase.from("messages").select("id").eq("receiver_id", userId),
        supabase.from("follows").select("id").eq("following_id", userId),
        supabase.from("follows").select("id").eq("follower_id", userId),
      ]);

      if (
        postsRes.error || commentsRes.error || votesRes.error ||
        communitiesRes.error || messagesSentRes.error || messagesReceivedRes.error ||
        followersRes.error || followingRes.error
      ) {
        throw new Error("Failed to fetch stats");
      }

      return {
        totalPosts: postsRes.data.length,
        totalComments: commentsRes.data.length,
        totalLikesReceived: votesRes.data.length,
        uniqueCommunities: new Set(communitiesRes.data.map(p => p.community_id)).size,
        messagesSent: messagesSentRes.data.length,
        messagesReceived: messagesReceivedRes.data.length,
        followers: followersRes.data.length,
        following: followingRes.data.length,
      };
    },
    enabled: !!userId,
  });

  if (!user) {
    return <div className="text-center text-red-300 py-8">Please log in to view profile.</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 py-8">Error: {error.message}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-gray-900 p-6 rounded-2xl flex items-center gap-6 shadow border border-gray-700">
        {user.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-purple-500" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-700 text-3xl text-purple-300 flex items-center justify-center">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            {user.user_metadata?.user_name || user.email?.split('@')[0]}
          </h1>
          <p className="text-gray-400">{user.email}</p>
          <p className="text-xs text-gray-500 mt-1">
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Activity Overview</h2>
        {isLoading || !stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-gray-800 border border-gray-700">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Posts" value={stats.totalPosts} icon={<Pencil className="text-purple-400" />} />
            <StatCard label="Comments" value={stats.totalComments} icon={<MessageCircle className="text-blue-400" />} />
            <StatCard label="Likes" value={stats.totalLikesReceived} icon={<ThumbsUp className="text-pink-400" />} />
            <StatCard label="Communities" value={stats.uniqueCommunities} icon={<Users className="text-green-400" />} />
            <StatCard label="Messages Sent" value={stats.messagesSent} icon={<MessageSquareText className="text-orange-400" />} />
            <StatCard label="Messages Received" value={stats.messagesReceived} icon={<MessageSquareText className="text-cyan-400" />} />
            <StatCard label="Followers" value={stats.followers} icon={<UserPlus className="text-yellow-400" />} />
            <StatCard label="Following" value={stats.following} icon={<UserMinus className="text-red-400" />} />
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <Card className="bg-black border border-gray-800 hover:border-gray-600 transition">
    <CardContent className="p-4 flex items-center gap-4">
      <div className="bg-gray-800 p-2 rounded-md">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </CardContent>
  </Card>
);
