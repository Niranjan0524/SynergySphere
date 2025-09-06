import { Upload } from "lucide-react";
import { useState } from "react";

export default function ProjectAddOrEdit() {
  const [priority, setPriority] = useState("low");

  return (
    <div className="flex flex-col w-full h-full p-6 overflow-y-auto max-h-[80vh]">
      {/* Breadcrumb & Actions */}
      <div className="flex justify-between items-center mb-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500">
          <span className="hover:underline cursor-pointer">Projects</span> &gt;{" "}
          <span className="font-medium">New Project</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">
            Discard
          </button>
          <button className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600">
            Save
          </button>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-6 max-w-3xl">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            placeholder="Enter project name"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            type="text"
            placeholder="Enter tags (comma separated)"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Project Manager */}
        <div>
          <label className="block text-sm font-medium mb-1">Project Manager</label>
          <input
            type="text"
            placeholder="Enter manager name"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium mb-1">Deadline</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <div className="flex gap-6 mt-2">
            {["low", "medium", "high"].map((level) => (
              <label key={level} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="priority"
                  value={level}
                  checked={priority === level}
                  onChange={() => setPriority(level)}
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <label className="flex items-center gap-2 w-fit px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
            <Upload className="w-4 h-4 text-gray-600" />
            <span>Upload Image</span>
            <input type="file" className="hidden" />
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            placeholder="Enter project description"
            className="w-full border rounded-lg px-3 py-2 h-28 focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </form>
    </div>
  );
}
