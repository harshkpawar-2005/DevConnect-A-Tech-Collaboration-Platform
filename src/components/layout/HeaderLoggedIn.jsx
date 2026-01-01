import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/clerk-react";
import LogoIcon from "@/assets/logo-icon.png";
import { User, Folder, Bookmark, FileText, } from "lucide-react";


export default function HeaderLoggedIn() {
  const { user } = useUser();

  return (
    <nav className="h-16 w-full sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 -ml-2.5">
          <img src={LogoIcon} alt="DevConnect Logo" className="h-8 w-8" />
          <span className="
            text-2xl font-bold
            bg-gradient-to-r from-sky-400 to-blue-600
            bg-clip-text text-transparent
          ">
            DevConnect
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link to="/dashboard">Dashboard</Link>
          </Button>

          <Button
            asChild
            className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
          >
            <Link to="/create-project">Post a Project</Link>
          </Button>

          <UserButton
            appearance={{
              elements: {avatarBox:{
                width: "35px",
                height: "35px",
              }}
            }}
            
          >
            <UserButton.MenuItems>

              {/* ⭐ CUSTOM PROFILE LINK — NOW WORKS! */}
              <UserButton.Link
                label="Profile"
                href={`/profile/${user?.username}`}
                labelIcon={<User size={16} />}
              />
              <UserButton.Link
                label="My Projects"
                href="/my-projects"
                labelIcon={<Folder size={16} />}
              />

              <UserButton.Link
                label="Saved Projects"
                href="/saved-projects"
                labelIcon={<Bookmark size={16} />}
              />

              <UserButton.Link
                label="My Applications"
                href="/applications"
                labelIcon={<FileText size={16} />}
              />

              


              {/* Default Clerk items */}
              <UserButton.Action label="manageAccount" />
              <UserButton.Action label="signOut" />


            </UserButton.MenuItems>
          </UserButton>


        </div>

      </div>
    </nav>
  );
}
