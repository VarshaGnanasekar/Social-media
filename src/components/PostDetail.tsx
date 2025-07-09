import { useQuery } from "@tanstack/react-query";
import type { Post } from "./PostList";
import { supabase } from "../supabase-client";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";
import { motion } from "framer-motion";

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
      <div className="max-w-3xl mx-auto space-y-8 p-6">
        {/* Header Skeleton */}
        <div className="space-y-6">
          <div className="h-10 bg-gray-900 rounded-full w-3/4 mx-auto"></div>
          <div className="h-12 bg-gray-900 rounded-full w-4/5 mx-auto"></div>
          <div className="h-4 bg-gray-900 rounded-full w-1/3 mx-auto"></div>
        </div>
        
        {/* Image Skeleton */}
        <div className="aspect-video w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl animate-pulse"></div>
        
        {/* Content Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-900 rounded-full" style={{ width: `${100 - (i * 15)}%` }}></div>
          ))}
        </div>
        
        {/* Interaction Skeleton */}
        <div className="flex gap-4 pt-6">
          <div className="h-12 bg-gray-900 rounded-lg w-24"></div>
          <div className="h-12 bg-gray-900 rounded-lg w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-red-900/30 to-transparent rounded-xl border border-red-800/50"
      >
        <div className="flex items-center gap-3 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-bold">Failed to load post</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 space-y-10"
    >
      <header className="space-y-6 text-center">
        <motion.h3 
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {data?.author}
        </motion.h3>
        
        <motion.h4 
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {data?.title}
        </motion.h4>
        
        <motion.div 
          className="text-sm text-gray-500 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {new Date(data!.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </motion.div>
      </header>

      {data?.image_url && (
        <motion.figure 
          className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800/50"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <img
            src={data.image_url}
            alt={data?.title}
            className="w-full h-auto max-h-[600px] object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </motion.figure>
      )}

      <motion.section 
        className="prose prose-invert max-w-none text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-lg leading-relaxed">
          {data?.content}
        </p>
      </motion.section>

      <motion.div 
        className="border-t border-gray-800/50 pt-8 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <LikeButton postId={postId} />
        <CommentSection postId={postId} />
      </motion.div>
    </motion.article>
  );
};