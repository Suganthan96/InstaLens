'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface ExtractedData {
  business_type: string;
  category: string;
  description: string;
  services: string[];
  content_themes: string[];
  target_audience: string[];
  tone: string;
  engagement_score: number;
  lead_quality: string;
  growth_potential: string;
  crm_tags: string[];
  competitor_signals: string[];
  recommended_action: string;
  contact: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

export default function ExtractionPage() {
  const searchParams = useSearchParams();
  const instagramUrl = searchParams.get('url');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<ExtractedData | null>(null);

  useEffect(() => {
    if (!instagramUrl) {
      setError('No Instagram URL provided');
      setLoading(false);
      return;
    }

    // Simulate data extraction
    const extractData = async () => {
      try {
        setLoading(true);

        // TODO: Replace this with your actual backend API call
        // const response = await fetch('/api/extract', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ url: instagramUrl }),
        // });
        // const result = await response.json();
        // setData(result);

        // Placeholder: Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock data for demonstration
        setData({
          business_type: 'B2C',
          category: 'Fashion & Apparel',
          description:
            'Premium fashion brand specializing in sustainable, eco-friendly clothing. Focuses on modern design with emphasis on ethical production practices.',
          services: ['Retail', 'E-commerce', 'Custom Orders', 'Styling Consultation'],
          content_themes: ['Product Showcases', 'Behind-the-scenes', 'Sustainability', 'Style Tips'],
          target_audience: ['18-35 years old', 'Fashion-conscious', 'Eco-aware consumers'],
          tone: 'Inspirational',
          engagement_score: 78,
          lead_quality: 'High',
          growth_potential: 'High',
          crm_tags: ['hot-prospect', 'retail-ready', 'high-engagement'],
          competitor_signals: ['Reformation', 'Everlane', 'Patagonia'],
          recommended_action: 'Prioritize for partnership outreach this quarter',
          contact: {
            email: 'business@example.com',
            website: 'https://example.com',
          },
        });

        setError('');
      } catch (err) {
        setError('Failed to extract data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    extractData();
  }, [instagramUrl]);

  if (!instagramUrl) {
    return (
      <main className="flex flex-col w-full min-h-screen bg-[#0A0A0A] pt-[60px]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">No Instagram URL provided</p>
            <a href="/submit" className="text-blue-500 hover:text-blue-400">
              Go back to submit page
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex flex-col w-full min-h-screen bg-[#0A0A0A] pt-[60px]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block">
              <svg className="animate-spin h-12 w-12 text-blue-500" viewBox="0 0 24 24">
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
            </div>
            <p className="text-white text-xl font-semibold mt-4">Analyzing profile...</p>
            <p className="text-gray-400 mt-2">This may take a few moments</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col w-full min-h-screen bg-[#0A0A0A] pt-[60px]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <a href="/submit" className="text-blue-500 hover:text-blue-400">
              Try another profile
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#0A0A0A] pt-[60px]">
      <Navbar />

      <div className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <a href="/submit" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
              ← Back to submit
            </a>
            <h1 className="text-4xl font-bold text-white mb-2">Profile Analysis</h1>
            <p className="text-gray-400">{instagramUrl}</p>
          </div>

          {data && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Engagement Score</p>
                  <p className="text-4xl font-bold text-blue-400">{data.engagement_score}/100</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Lead Quality</p>
                  <p className="text-2xl font-bold text-green-400">{data.lead_quality}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Growth Potential</p>
                  <p className="text-2xl font-bold text-purple-400">{data.growth_potential}</p>
                </div>
              </div>

              {/* Business Info */}
              <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Business Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Business Type</p>
                    <p className="text-white font-semibold">{data.business_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Category</p>
                    <p className="text-white font-semibold">{data.category}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-sm mb-2">Description</p>
                    <p className="text-white">{data.description}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-sm mb-2">Tone</p>
                    <p className="text-white font-semibold">{data.tone}</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              {data.services.length > 0 && (
                <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.services.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Themes */}
              {data.content_themes.length > 0 && (
                <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Content Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.content_themes.map((theme, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-sm"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Audience */}
              {data.target_audience.length > 0 && (
                <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Target Audience</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.target_audience.map((audience, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 rounded-full text-sm"
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CRM Tags */}
              {data.crm_tags.length > 0 && (
                <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">CRM Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.crm_tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-2">Recommended Action</h3>
                <p className="text-gray-300">{data.recommended_action}</p>
              </div>

              {/* Contact Info */}
              {(data.contact.email || data.contact.phone || data.contact.website) && (
                <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {data.contact.email && (
                      <p>
                        <span className="text-gray-400">Email: </span>
                        <a href={`mailto:${data.contact.email}`} className="text-blue-400 hover:text-blue-300">
                          {data.contact.email}
                        </a>
                      </p>
                    )}
                    {data.contact.phone && (
                      <p>
                        <span className="text-gray-400">Phone: </span>
                        <span className="text-white">{data.contact.phone}</span>
                      </p>
                    )}
                    {data.contact.website && (
                      <p>
                        <span className="text-gray-400">Website: </span>
                        <a
                          href={data.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {data.contact.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end">
                <a
                  href="/submit"
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Analyze Another
                </a>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                  Export Results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
