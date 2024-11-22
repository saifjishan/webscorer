"use client";
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Layout from '../components/Layout';
import { supabase } from '../utils/supabase';

export default function MainComponent() {
  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState({ score: '', category: '', notes: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScores();
  }, []);

  async function getScores() {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      alert('Error fetching scores: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addScore(e) {
    e.preventDefault();
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
        .select();

      if (error) throw error;
      setScores([...scores, ...data]);
      setNewScore({ score: '', category: '', notes: '' });
    } catch (error) {
      alert('Error adding score: ' + error.message);
    }
  }

  return (
    <Layout>
      <div className="space-y-8 p-4">
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
            <div className="min-w-[800px] h-[400px]">
              <LineChart
                width={800}
                height={400}
                data={scores}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="created_at" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  name="Score"
                />
              </LineChart>
            </div>
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
      </div>
    </Layout>
  );
}