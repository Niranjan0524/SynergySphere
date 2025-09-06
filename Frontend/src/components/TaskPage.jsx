import Sidebar from "./Sidebar";
import InHeader from "./Inheader";
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProjectAddorEdit from "./ProjectAddorEdit";
import AddOrEditTask from "./AddOrEditTask";

export default function TaskPage() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const navigate = useNavigate();

  const tasks = [
    {
      id: 1,
      tags: ["Feedback", "Refactor"],
      title: "Optimise Website Controllers",
      date: "21/03/22",
      avatar: "🌐",
    },
    {
      id: 2,
      tags: ["Feedback", "Delete"],
      title: "Remove Sales App 😥",
      date: "21/03/22",
      avatar: "📱",
    },
    {
      id: 3,
      tags: ["Improvement", "Payment Provider"],
      title: "Stripe Integration",
      date: "21/03/22",
      avatar: "💳",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar for mobile (slide-in) */}
      {showSidebar && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="relative w-64 bg-white dark:bg-gray-900 shadow-2xl h-full flex flex-col">
            <button
              className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-primary-600 text-white shadow-lg"
              onClick={() => setShowSidebar(false)}
              aria-label="Close sidebar"
            >
              ☰
            </button>
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black bg-opacity-30"
            onClick={() => setShowSidebar(false)}
          ></div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Sidebar Toggle */}
        {!showSidebar && (
          <button
            className="md:hidden fixed top-16 left-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-primary-600 text-white shadow-lg"
            onClick={() => setShowSidebar(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-2">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <InHeader hideCompany={showSidebar} onNewProject={() => setShowProjectModal(true)} />
          </div>
        </div>

        {/* Main */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Breadcrumb & Button */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-500">
                &gt; Tasks &gt; <span className="font-medium">RD Sales</span>
              </div>
              <button
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500 text-white text-sm hover:bg-blue-600 shadow"
                onClick={() => setShowTaskModal(true)}
              >
                + New Task
              </button>
            </div>

            {/* Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border rounded-xl shadow p-4 hover:shadow-md transition"
                >
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <p className="text-sm font-medium">{task.title}</p>

                  {/* Date & Avatar */}
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-gray-400">📅 {task.date}</p>
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                      {task.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Project Modal */}
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative my-12">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowProjectModal(false)}
                aria-label="Close project modal"
              >
                ✕
              </button>
              <ProjectAddorEdit />
            </div>
          </div>
        )}

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative my-12">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowTaskModal(false)}
                aria-label="Close task modal"
              >
                ✕
              </button>
              <AddOrEditTask onCancel={() => setShowTaskModal(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
