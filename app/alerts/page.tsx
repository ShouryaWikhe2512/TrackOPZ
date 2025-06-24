"use client";
import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../../components/sidebar";

// Type definitions
interface Alert {
  id: number;
  name: string;
  message: string;
  avatar: string;
  timestamp: string;
}

export default function SeeAlertsPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Fetch initial alerts from backend
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        if (data.alerts)
          setAlerts(
            data.alerts.map((a: any) => ({
              id: a.id,
              name: a.senderId ? `Manager #${a.senderId}` : "Manager",
              message: a.message,
              avatar: "",
              timestamp: new Date(a.createdAt).toLocaleString(),
            }))
          );
      });

    // Subscribe to SSE for real-time alerts
    const es = new EventSource("/api/alerts/stream");
    es.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      setAlerts((prev) => [
        {
          id: alert.id,
          name: alert.senderId ? `Manager #${alert.senderId}` : "Manager",
          message: alert.message,
          avatar: "",
          timestamp: new Date(alert.createdAt).toLocaleString(),
        },
        ...prev,
      ]);
    };
    return () => es.close();
  }, []);

  const handleMenuClick = (): void => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = (): void => {
    setSidebarOpen(false);
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLoadMore = (): void => {
    // Handle load more functionality
    console.log("Load more alerts clicked");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        username="Operator"
      />

      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
        <button
          onClick={handleMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-blue-700" />
        </button>

        <h1 className="text-xl font-semibold text-blue-700">See Alerts</h1>

        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-lg">A</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          {alerts.map((alert: Alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-700 font-medium text-sm">
                    {getInitials(alert.name)}
                  </span>
                </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-gray-900 font-medium text-sm">
                      {alert.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State (if no alerts) */}
          {alerts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🔔</span>
              </div>
              <h3 className="text-gray-500 font-medium mb-2">No alerts</h3>
              <p className="text-gray-400 text-sm">
                All systems are running smoothly
              </p>
            </div>
          )}

          {/* Load More Button (if needed) */}
          {alerts.length > 0 && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Load more alerts
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
