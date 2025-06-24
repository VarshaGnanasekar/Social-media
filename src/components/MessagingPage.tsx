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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black overflow-hidden">
      {/* Sidebar for User List */}
      <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-white max-h-[40vh] md:max-h-full overflow-y-auto">
        <UserList onSelectUser={setSelectedUser} />
      </div>

      {/* Chat Area */}
      <div className="w-full md:w-3/4 flex-1">
        {selectedUser ? (
          <ChatBox selectedUser={selectedUser} />
        ) : (
          <div className="text-white p-4 flex items-center justify-center h-full text-center text-lg">
            Select a user to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
