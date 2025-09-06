import { MoreHorizontal, MessageSquare } from "lucide-react";

export default function ProjectCard({ project, task }) {
  return (
    <div className="bg-white border rounded-xl shadow p-4 hover:shadow-md transition w-full max-w-sm">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {task.tags.map((tag) => (
          <span
            key={tag}
            className={`px-2 py-0.5 text-xs rounded ${
              tag === "Feedback"
                ? "bg-green-100 text-green-600"
                : tag === "Bug"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Project + Menu */}
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm">
          <span className="font-semibold">Project:</span> {project}
        </p>
        <button className="p-1 rounded-full hover:bg-gray-100">
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Task Title */}
      <p className="text-sm text-gray-700 mb-3">{task.title}</p>

      {/* Thumbnail */}
      <div className="w-full h-28 bg-gray-100 rounded-lg overflow-hidden mb-3">
        <img
          src={task.image}
          alt={task.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Footer: Date + Avatar */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {task.date}
        </div>
        <img
          src={task.avatar}
          alt="user"
          className="w-6 h-6 rounded-full border"
        />
      </div>
    </div>
  );
}
