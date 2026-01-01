import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard'; // Make sure you've created this page
import Profile from './pages/Profile'; // Make sure you've created this page
import { SignedIn } from '@clerk/clerk-react'; // We only need SignedIn
import CreateProject from './pages/CreateProject';
import MyApplications from "@/pages/MyApplications";

import { autoCloseProjects } from "@/utils/autoCloseProjects";



// at top imports
import MyProjects from "@/pages/MyProjects";
import SavedProjects from "@/pages/SavedProjects";
import ProjectDetails from "@/pages/ProjectDetails"; // ensure this exists (we created earlier in Phase 2 responses)

function App() {  

  useEffect(() => {
    autoCloseProjects();
  }, []);


  return (
    <Routes>
      {/* All pages will use your Header/Footer Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route 
          path="dashboard" 
          element={
            <SignedIn>
              <Dashboard />
            </SignedIn>
          }
        />
        <Route path="profile/:username" element={<Profile />} />
        <Route path="create-project" element={<CreateProject />} /> 
        <Route path="project/:id" element={<ProjectDetails />} />
        <Route path="my-projects" element={<MyProjects />} />
        <Route path="saved-projects" element={<SavedProjects />} />
        <Route path="/applications" element={<MyApplications />} />


      </Route>
    </Routes>
  );
}

export default App;