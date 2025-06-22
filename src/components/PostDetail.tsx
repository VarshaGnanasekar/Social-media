import { useQuery } from "@tanstack/react-query";
import type { Post } from "./PostList";
import { supabase } from "../supabase-client";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";

interface Props {
  postId: number;
}

const fetchPostById = async (id: number): Promise<Post> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Post;
};

export const PostDetail = ({ postId }: Props) => {
  const { data, error, isLoading } = useQuery<Post, Error>({
    queryKey: ["post", postId],
    queryFn: () => fetchPostById(postId),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 p-4 animate-pulse">
        {/* Title Skeleton */}
        <div className="h-12 bg-gray-700 rounded w-3/4 mx-auto"></div>
        
        {/* Image Skeleton */}
        <div className="h-64 w-full bg-gray-700 rounded-xl"></div>
        
        {/* Content Skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          <div className="h-4 bg-gray-700 rounded w-3/6"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
        
        {/* Like Button Skeleton */}
        <div className="h-10 bg-gray-700 rounded-lg w-24"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-red-900/10 text-red-500 rounded-lg border border-red-900/20">
        Error loading post: {error.message}
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          {data?.title}
        </h1>
        
        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <span className="text-sm">
            Posted on {new Date(data!.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </header>

      {data?.image_url && (
        <figure className="relative rounded-xl overflow-hidden shadow-lg">
          <img
            src={data.image_url}
            alt={data?.title}
            className="w-full h-auto max-h-[480px] object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </figure>
      )}

      <section className="prose prose-invert max-w-none">
        <p className="text-gray-300 leading-relaxed text-lg">
          {data?.content}
        </p>
      </section>

      <div className="border-t border-gray-800 pt-6">
        <LikeButton postId={postId} />
        <CommentSection postId={postId} />
      </div>
    </article>
  );
};