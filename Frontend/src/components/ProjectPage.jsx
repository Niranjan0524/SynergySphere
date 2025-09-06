import Sidebar from "./Sidebar";
import InHeader from "./Inheader";
import React, { useState } from "react";
import ProjectCard from "./ProjectCard";
import ProjectAddorEdit from "./ProjectAddorEdit";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProjectPage() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const navigate = useNavigate();
  // Example projects and tasks data
  const projects = [
    {
      id: 1,
      name: "SynergySphere Website",
      manager: "Aman Kumar",
      deadline: "2025-09-30",
      tags: ["Frontend", "React"],
      tasks: [
        {
          title: "Landing Page Design",
          tags: ["Feedback", "Bug"],
          date: "2025-09-10",
          image: "https://via.placeholder.com/150",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        {
          title: "API Integration",
          tags: ["Improvement"],
          date: "2025-09-12",
          image: "https://via.placeholder.com/150",
          avatar: "https://randomuser.me/api/portraits/women/2.jpg",
        },
      ],
    },
    {
      id: 2,
      name: "Mobile App",
      manager: "Shivam Singh",
      deadline: "2025-10-15",
      tags: ["Mobile", "React Native"],
      tasks: [
        {
          title: "Push Notifications",
          tags: ["Feedback"],
          date: "2025-09-15",
          image: "https://via.placeholder.com/150",
          avatar: "https://randomuser.me/api/portraits/men/3.jpg",
        },
      ],
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
          <div className="flex-1 bg-black bg-opacity-30" onClick={() => setShowSidebar(false)}></div>
        </div>
      )}
      <div className="flex-1 flex flex-col">
        {/* Mobile Sidebar Toggle Button (only when sidebar is closed) */}
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
        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) =>
                project.tasks.map((task, idx) => (
                  <ProjectCard key={project.id + '-' + idx} project={project.name} task={task} />
                ))
              )}
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
      </div>
    </div>
  );
}
