import { PostList } from "../components/PostList";

export const Home = () => {
  return (
    <div className="pt-10">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400 mb-4">
            Recent Posts
      </h1>
      <div>
        <PostList />
      </div>
    </div>
  );
};