import { Link } from "react-router-dom";
import type { Post } from "./PostList";

interface Props {
  post: Post;
}

export const PostItem = ({ post }: Props) => {
  return (
    <div className="relative group transition-all duration-500 hover:z-10">
      {/* Glow effect */}
      <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-indigo-500/40 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 pointer-events-none"></div>
      {/* Subtle pulse animation on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <Link 
        to={`/post/${post.id}`} 
        className="block relative z-10 h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded-2xl"
      >
        <div className="w-80 h-96 bg-gray-900 border border-gray-700/80 rounded-2xl text-white flex flex-col p-6 overflow-hidden transition-all duration-500 group-hover:border-gray-600 group-hover:shadow-2xl group-hover:shadow-purple-500/10">
          {/* Author section */}
          <div className="flex items-center gap-3">
            {post.avatar_url ? (
              <img
                src={post.avatar_url}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/80 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:border-purple-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex-shrink-0 animate-pulse" />
            )}
            <div className="flex flex-col overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors duration-300 truncate">
                {post.author}
              </h3>
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 truncate">
                {post.title}
              </span>
            </div>
          </div>

          {/* Image with overlay effect */}
          <div className="mt-4 mb-3 flex-1 relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent z-[1] opacity-70"></div>
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Engagement metrics */}
          <div className="flex justify-center items-center mt-auto pt-3 border-t border-gray-800/50 group-hover:border-gray-700 transition-colors duration-300 gap-6">
            <span className="flex items-center text-gray-400 group-hover:text-pink-400 transition-colors duration-300">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.8} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
              <span className="ml-1.5 text-sm font-medium">{post.like_count ?? 0}</span>
            </span>
            <span className="flex items-center text-gray-400 group-hover:text-blue-400 transition-colors duration-300">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.8} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
              <span className="ml-1.5 text-sm font-medium">{post.comment_count ?? 0}</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};