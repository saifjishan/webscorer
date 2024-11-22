"use client";
import React, { useState } from "react";

export default function MainComponent() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setData([]); // Clear previous results
    setLoading(true);
    setError("");

    try {
      // Ensure URL has protocol
      let urlToAnalyze = query;
      if (!urlToAnalyze.startsWith('http://') && !urlToAnalyze.startsWith('https://')) {
        urlToAnalyze = 'https://' + urlToAnalyze;
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToAnalyze }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze website');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to analyze website. Please try again.');
    } finally {
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

      {error && (
        <div className="mt-4 text-red-600">{error}</div>
      )}

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
    </div>
  );
}