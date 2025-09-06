import { useState } from "react";
import { X } from "lucide-react";

export default function AddOrEditTask({ initialData, onSave, onCancel }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [project, setProject] = useState(initialData?.project || "");
  const [tags, setTags] = useState(initialData?.tags || []);
  const [date, setDate] = useState(initialData?.date || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [avatar, setAvatar] = useState(initialData?.avatar || "");

  const handleSave = () => {
    const taskData = { title, project, tags, date, image, avatar };
    onSave(taskData);
  };

  const handleTagToggle = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const availableTags = ["Feedback", "Bug", "Improvement", "Payment Provider"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {initialData ? "Edit Task" : "Add Task"}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter task title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Project name..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    tags.includes(tag)
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-gray-100 text-gray-600 border-gray-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Paste image URL..."
            />
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium mb-1">Assignee Avatar</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Avatar URL..."
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}
