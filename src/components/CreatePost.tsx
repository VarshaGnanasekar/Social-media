/*import { type ChangeEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { type Community, fetchCommunities } from "./CommunityList";

interface PostInput {
  title: string;
  content: string;
  avatar_url: string | null;
  community_id?: number | null;
}

const createPost = async (post: PostInput, imageFile: File, userId: string,author: string) => {
  const filePath = `${post.title}-${Date.now()}-${imageFile.name}`;

  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, imageFile);

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicURLData } = supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...post,
      image_url: publicURLData.publicUrl,
      user_id: userId,
      author, 
    });

  if (error) throw new Error(error.message);

  return data;
};

export const CreatePost = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: communities } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: { post: PostInput; imageFile: File; userId: string;author: string; }) => {
      return createPost(data.post, data.imageFile, data.userId,data.author);
    },
    onSuccess: () => {
      // ✅ Clear form
      setTitle("");
      setContent("");
      setCommunityId(null);
      setSelectedFile(null);
      setImagePreviewUrl(null);
      // ✅ Redirect to /myposts
      navigate("/myposts");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !user?.id) return;

    mutate({
      post: {
        title,
        content,
        avatar_url: user.user_metadata.avatar_url || null,
        community_id: communityId,
      },
      imageFile: selectedFile,
      userId: user.id,
      author: user.user_metadata.user_name || "Anonymous",
    });
  };

  const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCommunityId(value ? Number(value) : null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // ✅ Set image preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Post</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter post title"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={5}
            placeholder="Write your post content here..."
            required
          />
        </div>

        <div>
          <label htmlFor="community" className="block text-sm font-medium text-gray-300 mb-2">
            Community (optional)
          </label>
          <select 
            id="community" 
            onChange={handleCommunityChange}
            value={communityId ?? ""}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- Choose a Community --</option>
            {communities?.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
            Upload Image
          </label>
          <div className="flex flex-col items-center justify-center w-full">
            <label className="flex flex-col w-full border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-750 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {imagePreviewUrl && (
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-40 h-40 object-cover mb-4 rounded-md"
                  />
                )}
                <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {selectedFile ? selectedFile.name : "PNG, JPG, GIF (MAX. 10MB)"}
                </p>
              </div>
              <input 
                id="image" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
                required
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {isError && (
            <p className="text-red-400 text-sm">
              Error creating post. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={isPending || !selectedFile}
            className={`px-6 py-2 rounded-md font-medium text-white ${
              isPending || !selectedFile
                ? 'bg-purple-700 cursor-not-allowed opacity-70' 
                : 'bg-purple-600 hover:bg-purple-700 transition-colors'
            }`}
          >
            {isPending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};*/
import { type ChangeEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

interface Community {
  id: number;
  name: string;
  description: string;
  created_at: string;
  avatar_url: string | null;
}

interface PostInput {
  title: string;
  content: string;
  avatar_url: string | null;
  community_id?: number | null;
}

const fetchCommunities = async (): Promise<Community[]> => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const createPost = async (
  post: PostInput,
  imageFile: File,
  userId: string,
  author: string
) => {
  const filePath = `${post.title}-${Date.now()}-${imageFile.name}`;

  // Upload image to storage
  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, imageFile);

  if (uploadError) throw new Error(uploadError.message);

  // Get public URL for the uploaded image
  const { data: publicURLData } = supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  // Create post record in database
  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...post,
      image_url: publicURLData.publicUrl,
      user_id: userId,
      author,
    })
    .select();

  if (error) throw new Error(error.message);
  return data;
};

export const CreatePost = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: communities } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (data: {
      post: PostInput;
      imageFile: File;
      userId: string;
      author: string;
    }) => {
      return createPost(data.post, data.imageFile, data.userId, data.author);
    },
    onSuccess: () => {
      setTitle("");
      setContent("");
      setCommunityId(null);
      setSelectedFile(null);
      setImagePreviewUrl(null);
      navigate("/myposts");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !user?.id) return;

    mutate({
      post: {
        title,
        content,
        avatar_url: user.user_metadata.avatar_url || null,
        community_id: communityId,
      },
      imageFile: selectedFile,
      userId: user.id,
      author: user.user_metadata.user_name || "Anonymous",
    });
  };

  const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCommunityId(value ? Number(value) : null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Creative Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 mb-4">
            Share Your Story
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Craft your post with images, text, and personality
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Preview */}
          <div className="lg:w-2/5">
            <div className="sticky top-8">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Live Preview</h3>
                
                {imagePreviewUrl ? (
                  <div className="mb-6 overflow-hidden rounded-xl">
                    <img 
                      src={imagePreviewUrl} 
                      alt="Preview" 
                      className="w-full h-64 object-cover transition-all duration-300 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-gray-700 rounded-xl flex items-center justify-center mb-6">
                    <div className="text-center p-4">
                      <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p className="mt-2 text-gray-400">Your image will appear here</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">
                    {title || "Your post title"}
                  </h4>
                  <p className="text-gray-300 whitespace-pre-line">
                    {content || "Start typing your content and it will appear here..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Creation area */}
          <div className="lg:w-3/5">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image upload card */}
              <div 
                onClick={() => document.getElementById('image')?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${imagePreviewUrl ? 'border-transparent' : 'border-gray-700 hover:border-purple-500'} bg-gray-800 hover:bg-gray-750`}
              >
                <input 
                  id="image" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  required
                />
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-14 h-14 text-purple-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {imagePreviewUrl ? 'Change Image' : 'Upload Featured Image'}
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {imagePreviewUrl 
                      ? 'Click to select a different image' 
                      : 'Drag & drop or click to browse (Recommended size: 1200x630)'}
                  </p>
                </div>
              </div>

              {/* Title input */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xl font-medium"
                  placeholder="Catchy title that grabs attention..."
                  required
                />
              </div>

              {/* Content editor */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Your Story
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[200px]"
                  placeholder="Write your content here... (Markdown supported)"
                  required
                />
              </div>

              {/* Community selector */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Add to Community (optional)
                </label>
                <select 
                  onChange={handleCommunityChange}
                  value={communityId ?? ""}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Community</option>
                  {communities?.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error message */}
              {isError && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <div className="flex items-center text-red-400">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="font-medium">{error?.message || "Error creating post. Please try again."}</span>
                  </div>
                </div>
              )}

              {/* Publish button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending || !selectedFile}
                  className={`px-8 py-4 rounded-xl font-bold text-white transition-all flex items-center ${
                    isPending || !selectedFile
                      ? 'bg-gray-700 cursor-not-allowed opacity-80' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg hover:shadow-purple-500/30'
                  }`}
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                      </svg>
                      Publish Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
