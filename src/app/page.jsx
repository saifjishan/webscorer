"use client";
import React from "react";
import * as Recharts from "recharts";
import { useHandleStreamResponse } from "../utilities/runtime-helpers";

function MainComponent() {
  const [query, setQuery] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [data, setData] = useState([]);
  const handleFinish = useCallback((message) => {
    setMessages((prev) => [...prev, { role: "assistant", content: message }]);
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
  const handleSearch = async () => {
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

  const averageScore = data.length
    ? Math.round(data.reduce((acc, curr) => acc + curr.value, 0) / data.length)
    : 0;

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 rounded-full border border-gray-300"
            placeholder="Enter website URL..."
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-[#E80533] transition-colors duration-200"
          >
            Analyze
          </button>
        </div>

        {data.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {averageScore}
                <span className="text-gray-500 text-lg">/100</span>
              </div>
              <div className="text-gray-500">Overall Score</div>
            </div>
            <Recharts.ResponsiveContainer width="100%" height={300}>
              <Recharts.RadarChart data={data}>
                <Recharts.PolarGrid />
                <Recharts.PolarAngleAxis dataKey="name" />
                <Recharts.PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Recharts.Radar
                  name="Score"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Recharts.Tooltip />
              </Recharts.RadarChart>
            </Recharts.ResponsiveContainer>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="text-xl font-semibold">{item.value}</div>
                  <div className="text-sm text-gray-500">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {streamingMessage && (
          <div className="mt-4 p-4 bg-gray-100 rounded">{streamingMessage}</div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;