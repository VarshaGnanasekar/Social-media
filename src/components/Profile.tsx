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

      const [
        postsRes, 
        commentsRes, 
        votesRes, 
        communitiesRes, 
        messagesSentRes, 
        messagesReceivedRes, 
        followersRes, 
        followingRes
      ] = await Promise.all([
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

      const errors = [
        postsRes.error, 
        commentsRes.error, 
        votesRes.error,
        communitiesRes.error, 
        messagesSentRes.error, 
        messagesReceivedRes.error,
        followersRes.error, 
        followingRes.error
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error("Failed to fetch stats");
      }

      return {
        totalPosts: postsRes.data?.length || 0,
        totalComments: commentsRes.data?.length || 0,
        totalLikesReceived: votesRes.data?.length || 0,
        uniqueCommunities: new Set(communitiesRes.data?.map(p => p.community_id)).size || 0,
        messagesSent: messagesSentRes.data?.length || 0,
        messagesReceived: messagesReceivedRes.data?.length || 0,
        followers: followersRes.data?.length || 0,
        following: followingRes.data?.length || 0,
      };
    },
    enabled: !!userId,
  });

  if (!user) {
    return (
      <div className="text-center text-gray-400 py-8 text-sm">
        Please sign in to view your profile
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-8 text-sm">
        Error loading profile data
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Profile Header */}
      <div className="bg-black p-5 rounded-xl border border-gray-800 flex items-center gap-4 mb-6">
        {user.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Avatar" 
            className="w-16 h-16 rounded-full border-2 border-purple-500/80 object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-800 text-2xl text-purple-400 flex items-center justify-center font-medium">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white truncate">
            {user.user_metadata?.user_name || user.email?.split('@')[0]}
          </h1>
          <p className="text-gray-400 text-sm truncate">{user.email}</p>
          <p className="text-xs text-gray-500 mt-1">
            Joined {new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-200 mb-3 px-1">Activity</h2>
        {isLoading || !stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-black border border-gray-800">
                <CardContent className="p-3">
                  <Skeleton className="h-5 w-3/4 mb-2 bg-gray-800" />
                  <Skeleton className="h-3 w-1/2 bg-gray-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard 
              label="Posts" 
              value={stats.totalPosts} 
              icon={<Pencil size={16} className="text-purple-400" />} 
            />
            <StatCard 
              label="Comments" 
              value={stats.totalComments} 
              icon={<MessageCircle size={16} className="text-blue-400" />} 
            />
            <StatCard 
              label="Likes" 
              value={stats.totalLikesReceived} 
              icon={<ThumbsUp size={16} className="text-pink-400" />} 
            />
            <StatCard 
              label="Communities" 
              value={stats.uniqueCommunities} 
              icon={<Users size={16} className="text-green-400" />} 
            />
            <StatCard 
              label="Sent" 
              value={stats.messagesSent} 
              icon={<MessageSquareText size={16} className="text-orange-400" />} 
            />
            <StatCard 
              label="Received" 
              value={stats.messagesReceived} 
              icon={<MessageSquareText size={16} className="text-cyan-400" />} 
            />
            <StatCard 
              label="Followers" 
              value={stats.followers} 
              icon={<UserPlus size={16} className="text-yellow-400" />} 
            />
            <StatCard 
              label="Following" 
              value={stats.following} 
              icon={<UserMinus size={16} className="text-red-400" />} 
            />
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
  <Card className="bg-black border border-gray-800 hover:border-gray-700 transition-colors">
    <CardContent className="p-3 flex items-center gap-3">
      <div className="bg-gray-900 p-2 rounded-md flex items-center justify-center">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-lg font-semibold text-white truncate">{value}</p>
        <p className="text-xs text-gray-400 truncate">{label}</p>
      </div>
    </CardContent>
  </Card>
);