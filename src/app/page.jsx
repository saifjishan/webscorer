"use client";
import React, { useState, useCallback } from "react";
import { useHandleStreamResponse } from "../utilities/runtime-helpers";

export default function MainComponent() {
  const [query, setQuery] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [data, setData] = useState([]);

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
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: handleFinish,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    setData([]); // Clear previous results
    const response = await fetch("/integrations/groq/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an expert at analyzing websites. Always provide balanced scores between 60-90 for each metric unless explicitly told otherwise. Ensure the scores are realistic and consistent.",
          },
          {
            role: "user",
            content: `Analyze "${query}" and generate website metrics in this exact JSON format: [
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
    handleStreamResponse(response);
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
            className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            Analyze
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