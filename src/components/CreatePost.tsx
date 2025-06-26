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
    <div><h2 className="text-4xl max-sm:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-cyan-400  bg-clip-text text-transparent">
        Create New Post
      </h2>
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Preview panel */}
          <div className="lg:w-2/5">
            <div className="sticky top-8">
              <div className="bg-gray-950 rounded-xl p-6 border border-gray-800 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Preview
                </h3>
                
                {imagePreviewUrl ? (
                  <div className="mb-6 overflow-hidden rounded-lg border border-gray-800">
                    <img 
                      src={imagePreviewUrl} 
                      alt="Preview" 
                      className="w-full h-64 object-cover transition-all duration-500 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-gray-900 rounded-lg border-2 border-dashed border-gray-800 flex items-center justify-center mb-6">
                    <div className="text-center p-4">
                      <svg className="w-12 h-12 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p className="mt-2 text-gray-700">Image preview will appear here</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className={`text-lg font-semibold ${title ? 'text-white' : 'text-gray-600'}`}>
                    {title || "Your post title"}
                  </h4>
                  <p className={`text-sm ${content ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-line`}>
                    {content || "Your content will appear here..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="lg:w-3/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image upload */}
              <div 
                onClick={() => document.getElementById('image')?.click()}
                className={`rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                  imagePreviewUrl 
                    ? 'bg-gray-900 border border-gray-800 hover:border-purple-500/50' 
                    : 'bg-gray-950 border-2 border-dashed border-gray-800 hover:border-purple-500'
                }`}
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
                  <div className={`p-3 rounded-full mb-4 ${
                    imagePreviewUrl 
                      ? 'bg-purple-500/10 text-purple-400' 
                      : 'bg-gray-900 text-gray-600'
                  }`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {imagePreviewUrl ? 'Change Image' : 'Upload Featured Image'}
                  </h3>
                  <p className={`text-sm ${
                    imagePreviewUrl ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {imagePreviewUrl 
                      ? 'Click to select a different image' 
                      : 'JPG, PNG or GIF (Max 5MB)'}
                  </p>
                </div>
              </div>

              {/* Title input */}
              <div className="bg-gray-950 rounded-lg p-5 border border-gray-800">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                  Post Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-md text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-lg font-medium placeholder-gray-700"
                  placeholder="Your headline here..."
                  required
                />
              </div>

              {/* Content editor */}
              <div className="bg-gray-950 rounded-lg p-5 border border-gray-800">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-md text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 min-h-[200px] placeholder-gray-700"
                  placeholder="Write your story here..."
                  required
                />
              </div>

              {/* Community selector */}
              <div className="bg-gray-950 rounded-lg p-5 border border-gray-800">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                  Community (Optional)
                </label>
                <select 
                  onChange={handleCommunityChange}
                  value={communityId ?? ""}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-md text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="" className="text-gray-600">Select a community</option>
                  {communities?.map((community) => (
                    <option key={community.id} value={community.id} className="text-white">
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error message */}
              {isError && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <div className="flex items-center text-red-400">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="font-medium">{error?.message || "Error creating post"}</span>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPending || !selectedFile}
                  className={`px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center ${
                    isPending || !selectedFile
                      ? 'bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-lg hover:shadow-purple-500/20'
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                      </svg>
                      Publish Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};