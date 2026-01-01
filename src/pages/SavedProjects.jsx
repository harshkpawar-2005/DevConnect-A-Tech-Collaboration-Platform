// src/pages/SavedProjects.jsx
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import ProjectCard from "@/components/project/ProjectCard";
import { getSavedProjects, removeSavedProject } from "@/firebase/projectApi";


export default function SavedProjects() {
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Realtime wishlist listener
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.id);
    const unsub = onSnapshot(ref, (snap) => {
      setWishlist(snap.data()?.wishlist || []);
    });

    return () => unsub();
  }, [user]);

  // Load saved projects whenever wishlist changes
  useEffect(() => {
    async function load() {
      if (!user) return;

      setLoading(true);
      const res = await getSavedProjects(user.id);
      setProjects(res);
      setLoading(false);
    }

    load();
  }, [wishlist, user]);

  if (!isLoaded) return <div className="p-10 text-center">Loading...</div>;
  if (loading) return <div className="p-10 text-center">Loading saved projects...</div>;
  if (!projects.length) return <div className="p-10 text-center">No saved projects yet.</div>;

  return (
    <div className="container mx-auto px-6 py-10">
      <h2 className="text-4xl font-bold mb-10 text-center">
        Saved Projects
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <ProjectCard
            key={p.id}
            project={p}
            isSaved={wishlist.includes(p.id)}
            onToggleSave={() => removeSavedProject(user.id, p.id)}
          />
        ))}
      </div>
    </div>
  );
}
