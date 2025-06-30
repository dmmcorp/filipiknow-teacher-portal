"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const MainContent = () => {
  const current = useQuery(api.users.current);

  if (current === undefined) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const firstName = current?.fname || "Teacher";
  const chapters = [
    { id: 1, name: "Kabanata 1", completed: true },
    { id: 2, name: "Kabanata 2", completed: true },
    { id: 3, name: "Kabanata 3", completed: true },
    { id: 4, name: "Kabanata 4", completed: false },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">DASHBOARD</h1>
      </div>

      {/* Welcome Card */}
      <Card className="mb-8 border-0 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, <span className="text-blue-600">{firstName}</span>
          </h2>
          <p className="text-gray-600">
            Your Students complete{" "}
            <span className="font-semibold text-red-500">80%</span> of the
            tasks.
          </p>
          <p className="text-gray-600">
            Progress is{" "}
            <span className="font-semibold text-green-500">very good!</span>
          </p>
        </CardContent>
      </Card>

      {/* Chapters List */}
      <div className="space-y-4">
        {chapters.map((chapter) => (
          <Card
            key={chapter.id}
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 bg-gray-200">
                  <AvatarFallback className="text-gray-600 font-medium">
                    {chapter.id}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{chapter.name}</h3>
                </div>
                {chapter.completed ? (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
