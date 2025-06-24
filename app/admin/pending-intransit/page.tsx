"use client";
import React, { useEffect, useState } from "react";

interface Update {
  id: number;
  product: string;
  processSteps: Record<string, boolean>;
  dispatchStatus: string;
  dispatchedCost: number;
  createdAt: string;
}

export default function PendingInTransitPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pending-intransit")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUpdates(data.updates);
        } else {
          setError(data.error || "Failed to fetch data");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Pending & In Transit Products</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : updates.length === 0 ? (
          <div className="text-center text-gray-500">No pending or in transit products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-blue-100 text-blue-700">
                  <th className="py-3 px-4 text-left">Product</th>
                  <th className="py-3 px-4 text-left">Dispatch Status</th>
                  <th className="py-3 px-4 text-left">Process Steps</th>
                  <th className="py-3 px-4 text-left">Cost</th>
                  <th className="py-3 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((u) => (
                  <tr key={u.id} className="border-b last:border-none hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 font-medium">{u.product}</td>
                    <td className="py-3 px-4">{u.dispatchStatus}</td>
                    <td className="py-3 px-4">
                      <ul className="list-disc ml-4">
                        {Object.entries(u.processSteps).map(([step, done]) => (
                          <li key={step} className={done ? "text-green-700" : "text-gray-400"}>
                            {step}: {done ? "✔" : "✗"}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 px-4">₹{u.dispatchedCost.toFixed(2)}</td>
                    <td className="py-3 px-4">{new Date(u.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 