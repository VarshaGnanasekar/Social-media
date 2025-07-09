import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { UserPlus,Bell } from "lucide-react";


export const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { signInWithGitHub, signOut, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Profile creation effect
  useEffect(() => {
    const createProfileIfMissing = async () => {
      if (!user) return;

      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error checking profile:', fetchError);
          return;
        }

        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              user_name: user.user_metadata.user_name || user.email?.split('@')[0] || 'user',
              avatar_url: user.user_metadata.avatar_url || '',
              created_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    createProfileIfMissing();
  }, [user]);

  const displayName = user?.user_metadata.user_name || user?.email;

  // Navigation links data (excluding Follow from main nav)
  const navLinks = [
    { to: "/", text: "Home" },
    { to: "/create", text: "Create Post" },
    { to: "/communities", text: "Communities" },
    { to: "/community/create", text: "Create Community" },
    { to: "/myposts", text: "My Posts" },
    { to: "/messages", text: "Messages" },
  ];

  // Follow button component
  const FollowButton = () => (
    <Link
      to="/follow"
      className={`flex items-center justify-center p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors ${
        location.pathname === "/follow" ? "bg-purple-600 hover:bg-purple-700" : ""
      }`}
      aria-label="Follow"
    >
      <UserPlus className="h-5 w-5" />

    </Link>
  );

  
==
const FollowRequestsLink = () => (
  <Link
    to="/follow-requests"
    className={`flex items-center justify-center p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors ${
      location.pathname === "/follow-requests" ? "bg-purple-600 hover:bg-purple-700" : ""
    }`}
    aria-label="Follow Requests"
  >
    <Bell className="h-5 w-5" />
  </Link>
);


  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg" 
        : "bg-gray-900/80 backdrop-blur-sm border-b border-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
   
          <Link 
            to="/" 
            className="flex items-center space-x-1 group"
            aria-label="Home"
          >
            <span className="font-mono text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
              Snipp<span className="text-purple-500">.in</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-white bg-gray-800"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
                aria-label={link.text}
              >
                {link.text}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center ml-4 space-x-3">
            <FollowButton />
            <FollowRequestsLink />
            
            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 group"
                  aria-label="Profile"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-purple-500 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border-2 border-transparent group-hover:border-purple-500 transition-all">
                      <span className="text-white text-sm font-medium">
                        {displayName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-300 text-sm font-medium max-w-[120px] truncate">
                    {displayName}
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                  aria-label="Sign out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGitHub}
                className="flex items-center px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                aria-label="Sign in with GitHub"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none transition-colors"
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
            >
              <span className="sr-only">Open main menu</span>
              {menuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
        menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-white bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800/50"
              }`}
              aria-label={link.text}
            >
              {link.text}
            </Link>
          ))}
          
         
          <Link
            to="/follow"
            className="flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors text-gray-300 hover:text-white hover:bg-gray-800/50"
            aria-label="Follow"
             onClick={() => setMenuOpen(!menuOpen)}
          >
            <UserPlus className="h-5 w-5 mr-1" />

            Follow
          </Link>

          <Link
              to="/follow-requests"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors text-gray-300 hover:text-white hover:bg-gray-800/50"
              aria-label="Follow Requests"
              onClick={() => setMenuOpen(false)}
            >
              <Bell className="h-5 w-5 mr-1" />
              Follow Requests
          </Link>
          
          <div className="pt-4 pb-3 border-t border-gray-800">
            {user ? (
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-purple-500">
                      <span className="text-white text-lg font-medium">
                        {displayName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white truncate max-w-[160px]">
                    {displayName}
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="ml-auto px-3 py-1 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGitHub}
                className="flex items-center justify-center w-full px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                Sign in with GitHub
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};