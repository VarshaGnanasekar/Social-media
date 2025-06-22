import { Link } from "react-router-dom";
import type { Post } from "./PostList";

interface Props {
  post: Post;
}

export const PostItem = ({ post }: Props) => {
  return (
    <div className="relative group transition-transform duration-300 hover:scale-[1.02]">
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500 pointer-events-none"></div>
      
      <Link to={`/post/${post.id}`} className="block relative z-10 h-full">
        <div className="w-80 h-96 bg-gray-900 border border-gray-700 rounded-2xl text-white flex flex-col p-6 overflow-hidden transition-all duration-300 group-hover:border-gray-600 group-hover:shadow-xl">
        
          <div className="flex items-center gap-3">
            {post.avatar_url ? (
              <img
                src={post.avatar_url}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex-shrink-0" />
            )}
            <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">
              {post.title}
            </h3>
          </div>

        
          <div className="mt-4 mb-3 flex-1 relative overflow-hidden rounded-xl">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Stats and interactions */}
          <div className="flex justify-center items-center mt-auto pt-3 border-t border-gray-800 gap-8">
            <span className="flex items-center text-gray-400 hover:text-pink-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="ml-1 text-sm font-medium">{post.like_count ?? 0}</span>
            </span>
            <span className="flex items-center text-gray-400 hover:text-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="ml-1 text-sm font-medium">{post.comment_count ?? 0}</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};