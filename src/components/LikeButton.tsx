import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

interface Props {
  postId: number;
}

interface Vote {
  id: number;
  post_id: number;
  user_id: string;
  vote: number;
}

const vote = async (voteValue: number, postId: number, userId: string) => {
  const { data: existingVote } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingVote) {
    if (existingVote.vote === voteValue) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);
      if (error) throw error;
      return { action: 'removed', vote: voteValue };
    } else {
      const { error } = await supabase
        .from("votes")
        .update({ vote: voteValue })
        .eq("id", existingVote.id);
      if (error) throw error;
      return { action: 'changed', vote: voteValue };
    }
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({ post_id: postId, user_id: userId, vote: voteValue });
    if (error) throw error;
    return { action: 'added', vote: voteValue };
  }
};

const fetchVotes = async (postId: number): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId);
  if (error) throw error;
  return data as Vote[];
};

export const LikeButton = ({ postId }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: votes, isLoading, error } = useQuery<Vote[], Error>({
    queryKey: ["votes", postId],
    queryFn: () => fetchVotes(postId),
  });

  const { mutate } = useMutation({
    mutationFn: (voteValue: number) => {
      if (!user) throw new Error("You must be logged in to vote!");
      return vote(voteValue, postId, user.id);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["votes", postId] });
      const message = result.action === 'added' 
        ? `You ${result.vote === 1 ? 'liked' : 'disliked'} this post!`
        : result.action === 'removed' 
          ? `Vote removed`
          : `Changed to ${result.vote === 1 ? 'like' : 'dislike'}`;
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <div className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error.message}</div>;
  }

  const likes = votes?.filter((v) => v.vote === 1).length || 0;
  const dislikes = votes?.filter((v) => v.vote === -1).length || 0;
  const userVote = votes?.find((v) => v.user_id === user?.id)?.vote;

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => mutate(1)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          userVote === 1 
            ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
        aria-label="Like this post"
      >
        <FontAwesomeIcon icon={faThumbsUp} />
        <span className="font-medium">{likes}</span>
      </button>
      
      <button
        onClick={() => mutate(-1)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          userVote === -1 
            ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
        aria-label="Dislike this post"
      >
        <FontAwesomeIcon icon={faThumbsDown} />
        <span className="font-medium">{dislikes}</span>
      </button>
    </div>
  );
};