"use client";
import React, { useState, useCallback } from "react";
import { useHandleStreamResponse } from "../utilities/runtime-helpers";

export default function MainComponent() {
  const [query, setQuery] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFinish = useCallback((message) => {
    try {
      const parsed = JSON.parse(message);
      if (Array.isArray(parsed)) {
        setData(parsed);
      }
    } catch (e) {
      // not json data
    }
    setStreamingMessage("");
    setLoading(false);
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: handleFinish,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setData([]); // Clear previous results
    setLoading(true);

    try {
      // Ensure URL has protocol
      let urlToAnalyze = query;
      if (!urlToAnalyze.startsWith('http://') && !urlToAnalyze.startsWith('https://')) {
        urlToAnalyze = 'https://' + urlToAnalyze;
      }

      const response = await fetch("/integrations/groq/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an expert at analyzing websites. Analyze the provided URL for Performance, SEO, Accessibility, Best Practices, and Security. Consider factors like load time, mobile responsiveness, meta tags, HTTPS, and more. Provide realistic scores.",
            },
            {
              role: "user",
              content: `Analyze "${urlToAnalyze}" and generate website metrics in this exact JSON format: [
                {"name": "Performance", "value": number between 0-100}, 
                {"name": "SEO", "value": number between 0-100},
                {"name": "Accessibility", "value": number between 0-100},
                {"name": "Best Practices", "value": number between 0-100},
                {"name": "Security", "value": number between 0-100}
              ]. Only respond with the JSON.`,
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze website');
      }

      handleStreamResponse(response);
    } catch (error) {
      console.error('Error:', error);
      setStreamingMessage('Failed to analyze website. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold mb-8">WebScorer</h1>
      <form onSubmit={handleSearch} className="w-full max-w-xl px-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-4 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:border-gray-400"
            placeholder="Enter website URL..."
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-black text-white rounded-full hover:bg-[#E80533] transition-colors duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>

      {data.length > 0 && (
        <div className="mt-8 w-full max-w-xl px-4">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-700">{item.name}</span>
              <span className="font-semibold">{item.value}/100</span>
            </div>
          ))}
        </div>
      )}

      {streamingMessage && (
        <div className="mt-4 text-gray-600">{streamingMessage}</div>
      )}
    </div>
  );
}