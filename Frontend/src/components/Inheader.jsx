import { Bell, Search, MoreHorizontal, Plus, Settings } from "lucide-react";

export default function InHeader({ hideCompany, onNewProject }) {
  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-white shadow-sm border-b">
      {/* Left side - Company Logo */}
      <div className="flex items-center gap-2">
        {/* Only show company if hideCompany is false AND on mobile */}
        {hideCompany && false}
      </div>

      {/* Middle - Search bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-1 bg-gray-50">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500 text-white text-sm hover:bg-blue-600 shadow"
          onClick={onNewProject}
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>

        <button className="p-2 rounded-full hover:bg-gray-100">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
