"use client";
import React, { useState, useEffect, useCallback } from "react";
import * as Recharts from "recharts";
import { useHandleStreamResponse } from "../utilities/runtime-helpers";
import Layout from '../components/Layout'
import { supabase } from '../utils/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function MainComponent() {
  const [query, setQuery] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [data, setData] = useState([]);
  const [scores, setScores] = useState([])
  const [newScore, setNewScore] = useState({ score: '', category: '', notes: '' })
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    getScores()
  }, [])

  async function getScores() {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setScores(data || [])
    } catch (error) {
      alert('Error fetching scores: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function addScore(e) {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('scores')
        .insert([
          {
            score: parseInt(newScore.score),
            category: newScore.category,
            notes: newScore.notes,
          },
        ])
        .select()

      if (error) throw error
      setScores([...scores, ...data])
      setNewScore({ score: '', category: '', notes: '' })
    } catch (error) {
      alert('Error adding score: ' + error.message)
    }
  }

  const averageScore = data.length
    ? Math.round(data.reduce((acc, curr) => acc + curr.value, 0) / data.length)
    : 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Score Input Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Score</h2>
          <form onSubmit={addScore} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Score</label>
                <input
                  type="number"
                  value={newScore.score}
                  onChange={(e) => setNewScore({ ...newScore, score: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={newScore.category}
                  onChange={(e) => setNewScore({ ...newScore, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <input
                  type="text"
                  value={newScore.notes}
                  onChange={(e) => setNewScore({ ...newScore, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Score
            </button>
          </form>
        </div>

        {/* Score Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Score History</h2>
          <div className="w-full overflow-x-auto">
            <LineChart
              width={800}
              height={400}
              data={scores}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="created_at" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>

        {/* Score List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Scores</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scores.map((score) => (
                  <tr key={score.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(score.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{score.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{score.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{score.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
    </Layout>
  );
}

export default MainComponent;