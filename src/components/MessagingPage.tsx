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
    <div className="flex h-screen bg-black">
      <div className="w-1/4 border-r border-white">
        <UserList onSelectUser={setSelectedUser} />
      </div>
      <div className="w-3/4">
        {selectedUser ? (
          <ChatBox selectedUser={selectedUser} />
        ) : (
          <div className="text-white p-4">Select a user to start chatting.</div>
        )}
      </div>
    </div>
  );
}
