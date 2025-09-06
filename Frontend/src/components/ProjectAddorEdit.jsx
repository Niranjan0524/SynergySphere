import { Upload } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function ProjectAddOrEdit() {
  const { currentUser } = useAuth();
  const [priority, setPriority] = useState("low");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    tags: "",
    managerName: "",
    deadline: "",
    description: "",
    image: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    
    // Validation
    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }
    
    if (!formData.deadline) {
      setError("Deadline is required");
      return;
    }

    try {
      setLoading(true);
      
      // Format deadline to match the required format
      const deadlineDate = new Date(formData.deadline);
      const formattedDeadline = deadlineDate.toISOString().replace('Z', '+05:30');
      
      const projectData = {
        ownerID: currentUser?.id || 1,
        managerID: currentUser?.id || 1, // You might want to change this based on selected manager
        name: formData.name,
        deadline: formattedDeadline,
        priority: priority,
        status: "waiting"
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify(projectData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create project');
      }

      setSuccess("Project created successfully!");
      
      // Reset form after successful creation
      setFormData({
        name: "",
        tags: "",
        managerName: "",
        deadline: "",
        description: "",
        image: null
      });
      setPriority("low");
      
    } catch (error) {
      setError(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

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
          <button 
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            onClick={() => {
              setFormData({
                name: "",
                tags: "",
                managerName: "",
                deadline: "",
                description: "",
                image: null
              });
              setPriority("low");
              setError("");
              setSuccess("");
            }}
          >
            Discard
          </button>
          <button 
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Form */}
      <form className="space-y-6 max-w-3xl">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter project name"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Enter tags (comma separated)"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Project Manager */}
        <div>
          <label className="block text-sm font-medium mb-1">Project Manager</label>
          <input
            type="text"
            name="managerName"
            value={formData.managerName}
            onChange={handleInputChange}
            placeholder="Enter manager name"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium mb-1">Deadline *</label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
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
            <span>{formData.image ? formData.image.name : "Upload Image"}</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter project description"
            className="w-full border rounded-lg px-3 py-2 h-28 focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </form>
    </div>
  );
}
