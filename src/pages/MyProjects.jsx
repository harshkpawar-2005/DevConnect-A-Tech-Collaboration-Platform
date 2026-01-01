// src/pages/MyProjects.jsx
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import ProjectCard from "@/components/project/ProjectCard";
import { getProjectsByUserId, saveProject, removeSavedProject, deleteProjectCompletely  } from "@/firebase/projectApi";


export default function MyProjects() {
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user's own projects
  useEffect(() => {
    if (!isLoaded || !user) return;

    async function load() {
      setLoading(true);
      const res = await getProjectsByUserId(user.id);
      setProjects(res);
      setLoading(false);
    }

    load();
  }, [isLoaded, user]);

  // Realtime wishlist listener
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.id);
    const unsub = onSnapshot(ref, (snap) => {
      setWishlist(snap.data()?.wishlist || []);
    });

    return () => unsub();
  }, [user]);

  if (!isLoaded) return <div className="p-10 text-center">Loading...</div>;
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!projects.length) return <div className="p-10 text-center">You haven't created any projects yet.</div>;

  return (
    <div className="container mx-auto px-6 py-10">
      
      {/* Centered Title */}
      <h2 className="text-4xl font-bold mb-10 text-center">
        My Projects
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <ProjectCard
            key={p.id}
            project={p}
            isSaved={wishlist.includes(p.id)}
            onToggleSave={() =>
              wishlist.includes(p.id)
                ? removeSavedProject(user.id, p.id)
                : saveProject(user.id, p.id)
            }
            onDelete={async () => {
              if (confirm("Are you sure you want to delete this project? This cannot be undone.")) {
                await deleteProjectCompletely(p.id);
                setProjects((prev) => prev.filter((proj) => proj.id !== p.id));
              }
            }}
          />

        ))}
      </div>
    </div>
  );
}
