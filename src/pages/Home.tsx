import { PostList } from "../components/PostList";
import { TweetList } from "../components/TweetList";

export const Home = () => {
  return (
    <div>
      <h2 className="text-4xl max-sm:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-cyan-400  bg-clip-text text-transparent">
        Recent posts
      </h2>
      <div>
        <PostList />
        <TweetList />
      </div>
    </div>
  );
};