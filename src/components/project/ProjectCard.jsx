/* eslint-disable react/prop-types */
import { Heart, Trash2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ProjectCard({
  project,
  isSaved = false,
  onToggleSave,
  onDelete,
}) {
  const { user } = useUser();

  const {
    id,
    projectTitle,
    creatorId,
    creatorName,
    creatorImage,
    projectHeadline,
    status,
  } = project;

  const isOwner = user?.id === creatorId;

  return (
    <Card
      className="
        bg-gradient-to-br from-white to-[#F1F5F9]
        border border-slate-200
        rounded-xl shadow-sm
        flex flex-col

        w-[445.2px]
        h-[302.9px]

        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-lg
        hover:border-[#0072E5]
      "
    >
      {/* HEADER */}
      <CardHeader className="pb-1">
        <CardTitle className="text-[#0F172A] text-[22px] font-semibold flex justify-between items-start gap-2">
          <Link to={`/project/${id}`} className="w-full hover:underline">
            {/* TITLE → 1 LINE */}
            <span className="block line-clamp-1 leading-tight">
              {projectTitle}
            </span>
          </Link>

          <span
            className={`
              text-sm px-3 py-1 rounded-md font-medium whitespace-nowrap
              ${
                status === "open"
                  ? "bg-green-500/20 text-green-600"
                  : "bg-red-500/20 text-red-500"
              }
            `}
          >
            {status === "open" ? "Open" : "Closed"}
          </span>
        </CardTitle>
      </CardHeader>

      {/* CREATOR */}
      <CardContent className="flex items-center gap-2 mt-2 mb-3">
        <img
          src={creatorImage || "/avatar-placeholder.png"}
          alt={creatorName}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-8 w-8 rounded-full border border-slate-300 object-cover"
        />
        <span className="text-slate-600 text-sm">{creatorName}</span>
      </CardContent>

      <div className="border-b border-slate-200 w-full" />

      {/* HEADLINE */}
      <CardContent className="mt-3 text-slate-700 text-sm flex-1">
        {/* HEADLINE → 2 LINES */}
        <p className="line-clamp-2 leading-relaxed">
          {projectHeadline || "No headline added yet."}
        </p>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex justify-between items-center mt-auto">
        <Link to={`/project/${id}`} className="w-full">
          <Button
            className="
              w-full 
              bg-white 
              text-[#0F172A]
              border border-slate-300
              hover:border-[#0072E5]
              transition-colors duration-200
              shadow-sm
            "
          >
            More Details
          </Button>
        </Link>

        <button
          onClick={() => {
            if (isOwner) {
              onDelete && onDelete(id);
            } else if (user && onToggleSave) {
              onToggleSave(id);
            }
          }}
          className="
            p-2 ml-3 
            border border-slate-300 
            rounded-lg 
            hover:border-[#0072E5]
            transition-colors duration-200
          "
        >
          {isOwner ? (
            <Trash2 size={20} className="text-red-600" />
          ) : isSaved ? (
            <Heart size={20} className="text-red-500" fill="red" />
          ) : (
            <Heart size={20} className="text-[#0F172A]" />
          )}
        </button>
      </CardFooter>
    </Card>
  );
}
