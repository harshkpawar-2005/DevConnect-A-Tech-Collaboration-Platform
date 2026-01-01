// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import ProjectCard from "@/components/project/ProjectCard";
import { getAllProjects, saveProject, removeSavedProject, deleteProjectCompletely  } from "@/firebase/projectApi";



export default function Dashboard() {
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all projects (latest first)
  useEffect(() => {
    async function load() {
      setLoading(true);

      const all = await getAllProjects();

      const normalized = all.map((p) => ({
        ...p,
        createdAt: p.createdAt?.toDate ? p.createdAt.toDate() : p.createdAt,
      }));

      // Sort descending (latest first)
      normalized.sort(
        (a, b) =>
          (b.createdAt?.getTime?.() || 0) -
          (a.createdAt?.getTime?.() || 0)
      );

      setProjects(normalized);
      setLoading(false);
    }

    load();
  }, []);

  // 🔥 Realtime wishlist listener
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.id);
    const unsub = onSnapshot(ref, (snap) => {
      setWishlist(snap.data()?.wishlist || []);
    });

    return () => unsub();
  }, [user]);

  // Save/Unsave toggle
  const handleToggleSaved = async (projectId) => {
    const isSaved = wishlist.includes(projectId);

    if (isSaved) {
      await removeSavedProject(user.id, projectId);
    } else {
      await saveProject(user.id, projectId);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading latest projects...</div>;

  return (
    <div className="container mx-auto px-6 py-10 flex flex-col items-center">

      {/* Centered Title */}
      <h2 className="text-4xl font-bold mb-10 text-center">
        Latest Projects
      </h2>

      {/* 3 Cards per Row */}
      <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-3 
        gap-8 
        justify-items-center 
        w-full
      ">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSaved={wishlist.includes(project.id)}
            onToggleSave={handleToggleSaved}
            onDelete={async () => {
              if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
                await deleteProjectCompletely(project.id);

                // remove from UI instantly
                setProjects((prev) => prev.filter((p) => p.id !== project.id));
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
