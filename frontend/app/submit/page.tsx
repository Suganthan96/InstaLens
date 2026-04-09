'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function SubmitPage() {
  const router = useRouter();
  const [instagramUrl, setInstagramUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInstagramUrl = (url: string): boolean => {
    // Accept various Instagram URL formats
    const instagramRegex =
      /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9_.-]+)\/?$/;
    return instagramRegex.test(url.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUrl = instagramUrl.trim();

    // Validate URL format
    if (!trimmedUrl) {
      setError('Please enter an Instagram URL');
      return;
    }

    if (!validateInstagramUrl(trimmedUrl)) {
      setError('Please enter a valid Instagram profile URL (e.g., instagram.com/username)');
      return;
    }

    // Normalize the URL
    let normalizedUrl = trimmedUrl;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    setLoading(true);

    // Redirect to extraction page with URL as query parameter
    router.push(`/extraction?url=${encodeURIComponent(normalizedUrl)}`);
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#0A0A0A] pt-[60px]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Analyze Instagram Profiles
            </h1>
            <p className="text-gray-400 text-lg">
              Paste an Instagram profile URL to get AI-powered insights
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="instagram-url" className="block text-white mb-2 font-medium">
                Instagram Profile URL
              </label>
              <input
                id="instagram-url"
                type="text"
                value={instagramUrl}
                onChange={(e) => {
                  setInstagramUrl(e.target.value);
                  setError('');
                }}
                placeholder="e.g., instagram.com/username or https://www.instagram.com/username"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                'Analyze Profile'
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-gray-400 text-sm">
              <span className="font-semibold text-blue-400">💡 Tip:</span> Paste any public Instagram
              business or creator profile to get detailed insights including business type,
              content themes, engagement metrics, and AI-powered recommendations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
