// src/types.ts

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  status: "pending" | "completed";
  topics?: string[]; // Optional: if you have sub-topics
}

export interface PathData {
  id: string;
  title: string;
  items: RoadmapItem[];
}
