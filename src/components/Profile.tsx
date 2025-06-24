import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export const Profile = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: stats, isLoading, error } = useQuery({
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
          .not("community_id", "is", null),
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

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl p-8 text-center border border-red-800/50">
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-red-200">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl p-8 text-center border border-red-800/50">
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Profile</h2>
          <p className="text-red-200">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-lg border border-gray-700">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-indigo-300 border-2 border-indigo-500">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            {user.user_metadata?.user_name || user.email?.split('@')[0]}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">{user.email}</p>
          
          <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="px-2.5 py-1 bg-gray-700/50 rounded-full text-xs sm:text-sm text-gray-300">
              Member since: {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 px-2">Activity Overview</h2>
        
        {isLoading || !stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border border-gray-800">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-3 w-1/2 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard 
              value={stats.totalPosts} 
              label="Posts" 
              icon={<PostIcon className="w-5 h-5 text-indigo-400" />}
              trend={stats.totalPosts > 0 ? 'up' : 'none'}
            />
            <StatCard 
              value={stats.totalComments} 
              label="Comments" 
              icon={<CommentIcon className="w-5 h-5 text-blue-400" />}
              trend={stats.totalComments > 0 ? 'up' : 'none'}
            />
            <StatCard 
              value={stats.totalLikesReceived} 
              label="Likes" 
              icon={<HeartIcon className="w-5 h-5 text-pink-400" />}
              trend={stats.totalLikesReceived > 0 ? 'up' : 'none'}
            />
            <StatCard 
              value={stats.uniqueCommunities} 
              label="Communities" 
              icon={<CommunityIcon className="w-5 h-5 text-green-400" />}
              trend={stats.uniqueCommunities > 0 ? 'up' : 'none'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// StatCard component with improved sizing
const StatCard = ({ value, label, icon, trend }: { 
  value: number; 
  label: string; 
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'none';
}) => {
  return (
    <Card className="bg-gray-900/50 hover:bg-gray-900/70 transition-colors border border-gray-800 hover:border-gray-700">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-gray-400 text-sm mt-0.5">{label}</p>
          </div>
          <div className="p-1.5 rounded-md bg-gray-800/50">
            {icon}
          </div>
        </div>
        {trend !== 'none' && (
          <div className={`mt-2 inline-flex items-center text-xs ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? (
              <>
                <ArrowUpIcon className="w-3 h-3 mr-1" />
                <span>Active</span>
              </>
            ) : (
              <>
                <ArrowDownIcon className="w-3 h-3 mr-1" />
                <span>None yet</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Icon components with consistent sizing
const PostIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CommentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommunityIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ArrowUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);