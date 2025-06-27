import { Route, Routes } from "react-router";
import { Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { CreatePostPage } from "./pages/CreatePostPage";
import { PostPage } from "./pages/PostPage";
import { NavBar } from "./pages/NavBar";
import { CreateCommunityPage } from "./pages/CreateCommunityPage";
import { CommunitiesPage } from "./pages/CommunitiesPage";
import { CommunityPage } from "./components/CommunityPage";
import { MyPosts } from "./components/MyPosts";
import {Profile} from "./components/Profile";
import MessagingPage from "./components/MessagingPage";
import { FollowUsersPage } from "./components/FollowUsersPage";
import { UserPostsPage } from "./components/UserPostsPage";
import { FollowRequestsPage } from "./pages/FollowreqPage";
import GamingHub from "./pages/GamingHub";
import { Gamepad } from "lucide-react";


function App() {
  return (
    <div className="min-h-screen bg-black text-gray-100 transition-opacity duration-700 pt-20">
     <NavBar />
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/community/create" element={<CreateCommunityPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/community/:id" element={<CommunityPage />} />
          <Route path="/myposts" element={<MyPosts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/follow" element={<FollowUsersPage/>} />
          <Route path="/user/:userId/posts" element={<UserPostsPage />} />
          <Route path="/follow-requests" element={<FollowRequestsPage />} />
          <Route path="/gaming" element={<GamingHub />} />



        </Routes>
      </div>
      <div className="fixed bottom-5 right-5 z-50">
  <Link
  to="/gaming"
  className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-105"
  title="Go to Gaming Hub"
>
  <Gamepad size={24} strokeWidth={2.5} />
</Link>
</div>
    </div>
  );
}

export default App
