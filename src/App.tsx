import { Route, Routes } from "react-router";
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
          



        </Routes>
      </div>
    </div>
  );
}

export default App
