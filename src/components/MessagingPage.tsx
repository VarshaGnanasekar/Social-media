import { useState } from "react";
import { UserList } from "../pages/UserList";
import { ChatBox } from "./chatBox";

interface Profile {
  id: string;
  user_name: string;
  avatar_url?: string;
  created_at?: string;
}

export default function MessagingPage() {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showUserList, setShowUserList] = useState(true);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 overflow-hidden">
      {/* Mobile header when chat is open */}
      {!showUserList && selectedUser && (
        <div className="md:hidden flex items-center p-3 bg-gray-800 border-b border-gray-700">
          <button 
            onClick={() => setShowUserList(true)}
            className="mr-3 p-1 rounded-full hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center">
            {selectedUser.avatar_url ? (
              <img
                src={selectedUser.avatar_url}
                alt={selectedUser.user_name}
                className="w-8 h-8 rounded-full object-cover mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-2">
                <span className="text-white text-sm">
                  {selectedUser.user_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h2 className="text-white font-medium">{selectedUser.user_name}</h2>
          </div>
        </div>
      )}

      {/* Sidebar for User List - shown conditionally on mobile */}
      <div className={`${showUserList ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-col border-b md:border-b-0 md:border-r border-gray-700 h-full`}>
        <div className="p-3 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <button className="md:hidden p-1 rounded-full hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <UserList 
            onSelectUser={(user) => {
              setSelectedUser(user);
              setShowUserList(false);
            }} 
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showUserList ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full`}>
        {selectedUser ? (
          <ChatBox selectedUser={selectedUser} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-xl font-medium text-white mb-2">No conversation selected</h2>
              <p className="text-gray-400 mb-6">Select a user from the sidebar to start chatting</p>
              <button 
                onClick={() => setShowUserList(true)}
                className="md:hidden bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Browse Users
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}