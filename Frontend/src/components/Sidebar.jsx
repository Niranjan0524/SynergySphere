import { FolderKanban, CheckSquare, Sun, Moon, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className="h-screen w-64 flex flex-col justify-between bg-white border-r shadow-sm">
      {/* Top Section */}
      <div>
        {/* Company Switcher */}
        <div className="flex items-center gap-2 px-4 py-4 border-b">
          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
            {/* Logo placeholder */}
            <span className="text-sm font-bold">C</span>
          </div>
          <span className="font-semibold text-lg">Company</span>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col gap-2">
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full text-left"
          >
            <FolderKanban className="w-5 h-5" />
            My Projects
          </button>
          <button
            onClick={() => navigate("/tasks")}
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full text-left"
          >
            <CheckSquare className="w-5 h-5" />
            My Tasks
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t">
        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-2 w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          {darkMode ? (
            <>
              <Sun className="w-5 h-5 text-yellow-500" /> Light Mode
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-gray-600" /> Dark Mode
            </>
          )}
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 mt-4 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium">Test User</p>
            <p className="text-xs text-gray-500">user@mail</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
