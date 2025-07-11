import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

// Interface for one tweet row
export interface TweetRow {
  id: number;
  content: string;
  user_id: string;
  author: string;
  created_at: string;
}

export const CreateTweet = () => {
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ Supabase insert function
  const createTweet = async (vars: {
    content: string;
    userId: string;
    author: string;
  }): Promise<TweetRow> => {
    const { data, error } = await supabase
      .from("tweets")
      .insert({
        content: vars.content,
        user_id: vars.userId,
        author: vars.author,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || "Tweet creation failed");
    return data;
  };

  // ✅ useMutation with proper generics for types
  const { mutate, isPending, isError, error } = useMutation<
    TweetRow,
    Error,
    { content: string; userId: string; author: string }
  >({
    mutationFn: createTweet,
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["followed-tweets", user?.id] });
      navigate("/tweets");
    },
  });

  // ✅ handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !content.trim()) return;
    mutate({
      content: content.trim(),
      userId: user.id,
      author: (user.user_metadata?.user_name as string) || "Anonymous",
    });
  };

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <div className="max-w-xl mx-auto bg-gray-950 p-6 rounded-xl border border-gray-800 shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-4">What's happening?</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={280}
            placeholder="Write a tweet..."
            className="w-full px-4 py-3 bg-black border border-gray-800 rounded-md text-white focus:ring-purple-500 focus:border-purple-500 resize-none"
            required
          />
          {isError && <p className="text-red-500">{error?.message}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending || !content.trim()}
              className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 disabled:opacity-50"
            >
              {isPending ? "Tweeting..." : "Tweet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
