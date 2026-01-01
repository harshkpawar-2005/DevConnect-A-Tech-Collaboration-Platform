// src/pages/ProjectDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Heart, ArrowRight, Mail } from "lucide-react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

// wishlist
import { saveProject, removeSavedProject } from "@/firebase/projectApi";

// applications API (you provided this file)
import {
  applyForProject,
  hasUserAppliedToProject,
  onApplicationsByProject,
  updateApplicationStatus,
} from "@/firebase/applicationApi";

// small shadcn select (Option A)
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useUser();

  const [project, setProject] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Application state for current user
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("pending");

  // Applicants list (owner only, realtime)
  const [applicants, setApplicants] = useState([]);

  /* ---------------- Load Project ---------------- */
  useEffect(() => {
    async function load() {
      const ref = doc(db, "projects", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProject({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  /* ---------------- Load Wishlist (realtime) ---------------- */
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.id);
    const unsub = onSnapshot(ref, (snap) => {
      setWishlist(snap.data()?.wishlist || []);
    });

    return () => unsub();
  }, [user]);

  /* ---------------- Check if current user already applied ---------------- */
  useEffect(() => {
    if (!user) return;

    async function check() {
      try {
        const existing = await hasUserAppliedToProject(user.id, id);
        if (existing) {
          setAlreadyApplied(true);
          setApplicationStatus(existing.status || "pending");
        }
      } catch (e) {
        console.error("check applied error", e);
      }
    }

    check();
  }, [user, id]);

  /* ---------------- Subscribe to applicants (owner-only realtime) ---------------- */
  useEffect(() => {
    if (!project || !project.creatorId) return;
    if (!user) return;

    // Only subscribe if logged-in user is the project owner
    if (user.id !== project.creatorId) return;

    const unsub = onApplicationsByProject(project.id, (items) => {
      // items are { id, ...data }
      // sort by appliedAt (newest first) if possible
      const sorted = [...items].sort((a, b) => {
        const ta = a.appliedAt?.toDate ? a.appliedAt.toDate().getTime() : (a.appliedAt ? new Date(a.appliedAt).getTime() : 0);
        const tb = b.appliedAt?.toDate ? b.appliedAt.toDate().getTime() : (b.appliedAt ? new Date(b.appliedAt).getTime() : 0);
        return tb - ta;
      });
      setApplicants(sorted);
    });

    return () => unsub();
  }, [project, user]);

  const toggleSave = async () => {
    if (!user) return;

    const isSaved = wishlist.includes(id);
    if (isSaved) {
      await removeSavedProject(user.id, id);
    } else {
      await saveProject(user.id, id);
    }
  };

  /* ---------------- APPLY HANDLER ---------------- */
  const handleApply = async () => {
    if (!user) return;

    try {
      const payload = {
        projectId: id,
        applicantId: user.id,
        applicantName: user.fullName || "",
        applicantUsername: user.username || "",
        applicantImage: user.imageUrl || "",
      };

      const res = await applyForProject(payload);
      if (res && res.success) {
        setAlreadyApplied(true);
        setApplicationStatus("pending");
      }
    } catch (e) {
      console.error("apply error", e);
    }
  };

  /* ---------------- Update application status (owner action) ---------------- */
  const handleChangeApplicantStatus = async (applicationId, newStatus) => {
    try {
      // optimistic UI update
      setApplicants((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a)));
      await updateApplicationStatus(applicationId, newStatus);
    } catch (e) {
      console.error("update application status error", e);
      // refresh or rollback minimal: refetch list (next onSnapshot will sync)
    }
  };

  /* ---------------- Loading UI ---------------- */
  if (loading)
    return <div className="text-center p-10 text-slate-500">Loading...</div>;

  if (!project)
    return <div className="text-center p-10">Project not found.</div>;

  /* ---------------- Extract Firestore Data ---------------- */
  const {
    projectTitle,
    projectHeadline,
    projectDescription,
    techStack,
    roles,

    creatorName,
    creatorImage,
    creatorUsername,
    creatorId,

    availability,
    additionalInfo,

    contact,

    location,
    mode,
    lastDate,
    status,
    createdAt,
  } = project;

  const isOwner = user?.id === creatorId;

  /* ---------------- Deadline Logic ---------------- */
  const parseDate = (d) => {
    if (!d) return null;
    try {
      if (d?.toDate) return d.toDate();
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) return parsed;
    } catch (e) {}
    return null;
  };

  const deadlineDate = parseDate(lastDate);

  const computeDaysLeft = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dl = new Date(
      deadline.getFullYear(),
      deadline.getMonth(),
      deadline.getDate()
    );
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((dl - today) / msPerDay);
  };

  const daysLeftNumber = computeDaysLeft(deadlineDate);

  const DaysLeftPill = () => {
    if (daysLeftNumber == null) return null;

    if (daysLeftNumber < 0) {
      return (
        <div className="flex items-center justify-center px-3 py-2 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
          Deadline passed
        </div>
      );
    }

    const isLastDay = daysLeftNumber === 0;
    const numberToShow = isLastDay ? 1 : daysLeftNumber;

    return (
      <div className="w-20 h-24 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-3xl font-semibold text-[#0F172A]">
            {numberToShow > 99 ? "99+" : numberToShow}
          </div>
        </div>
        <div className="h-9 bg-slate-50 flex items-center justify-center border-t border-slate-100">
          <div className="text-sm text-slate-600">
            {isLastDay ? "Last day" : "Days Left"}
          </div>
        </div>
      </div>
    );
  };

  /* ---------------- date formatting helper ---------------- */
  const formatAppliedAt = (ts) => {
    if (!ts) return "Unknown";
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString();
    } catch {
      return String(ts);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10">
      {/* ---------------- HERO SECTION ---------------- */}
      <div className="mb-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#0F172A] leading-tight">
              {projectTitle}
            </h1>
            {projectHeadline ? (
              <p className="text-slate-700 text-lg mt-2">{projectHeadline}</p>
            ) : null}
          </div>

          <div className="ml-4 flex-shrink-0">
            <DaysLeftPill />
          </div>
        </div>

        {/* Creator (clickable name/image goes to profile) */}
        <div className="flex items-center gap-3 mt-6">
          <Link to={`/profile/${creatorUsername}`}>
            <img
              src={creatorImage || "/avatar-placeholder.png"}
              alt={creatorName}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-full border border-slate-300 object-cover"
            />
          </Link>

          <div>
            <Link
              to={`/profile/${creatorUsername}`}
              className="font-semibold text-[#0F172A] hover:text-[#0072E5] transition"
            >
              {creatorName}
            </Link>
            <div className="text-slate-500 text-sm">@{creatorUsername}</div>
          </div>
        </div>

        {/* Status + Wishlist */}
        <div className="flex items-center gap-4 mt-6">
          <span
            className={`text-sm px-4 py-1 rounded-lg font-medium ${
              status === "open"
                ? "bg-green-500/20 text-green-600"
                : "bg-red-500/20 text-red-500"
            }`}
          >
            {status === "open" ? "Open to Join" : "Closed"}
          </span>

          {!isOwner && (
            <button
              onClick={toggleSave}
              className="p-3 border border-slate-300 rounded-lg hover:border-[#0072E5] transition"
            >
              {wishlist.includes(id) ? (
                <Heart className="text-red-500" fill="red" size={24} />
              ) : (
                <Heart className="text-[#0F172A]" size={24} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ---------------- MAIN LAYOUT ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT (project content) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <SectionCard title="About This Project">
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
              {projectDescription}
            </p>
          </SectionCard>

          <SectionCard title="Required Skills (Tech Stack)">
            <div className="flex flex-wrap gap-2">
              {techStack?.length ? (
                techStack.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-200 text-sm"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <p className="text-slate-500">No tech listed.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Roles & Responsibilities">
            {roles?.length ? (
              roles.map((role, idx) => (
                <div
                  key={idx}
                  className="p-5 mb-4 border border-slate-200 rounded-lg bg-white"
                >
                  <h3 className="text-xl font-semibold text-[#0F172A]">
                    {role.roleName}
                  </h3>

                  <h4 className="mt-3 font-medium text-[#0F172A]">Responsibilities:</h4>
                  <ul className="list-disc ml-6 text-slate-700">
                    {role.responsibilities?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>

                  <h4 className="mt-4 font-medium text-[#0F172A]">Requirements:</h4>
                  <ul className="list-disc ml-6 text-slate-700">
                    {role.requirements?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>

                  <p className="mt-3 text-sm text-slate-500">
                    Members Required: <strong>{role.membersRequired}</strong>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No roles specified.</p>
            )}
          </SectionCard>

          <SectionCard title="Additional Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoBlock title="Last Date to Apply" value={lastDate || "Not set"} />
              <InfoBlock title="Stipend" value={additionalInfo?.stipend || "Unpaid"} />
              <InfoBlock title="Availability" value={availability || "Not provided"} />
              <InfoBlock title="Timing" value={additionalInfo?.timing || "Not specified"} />
              <InfoBlock title="Mode" value={mode || "Not specified"} />
              <InfoBlock title="Location" value={location || "Not specified"} />
            </div>
          </SectionCard>

          <SectionCard title="Contact the Creator">
            <div className="flex items-center gap-4">
              <Mail className="text-[#0072E5]" size={22} />
              <a
                href={`mailto:${contact?.email}`}
                className="text-blue-600 underline text-lg"
              >
                {contact?.email}
              </a>
            </div>
          </SectionCard>

          {/* ---------------- APPLICANTS (owner only) ---------------- */}
          {isOwner && (
            <SectionCard title={`Applicants (${applicants.length})`}>
              {applicants.length === 0 ? (
                <p className="text-slate-600">No applicants yet.</p>
              ) : (
                <div className="space-y-4">
                  {applicants.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={app.applicantImage || "/placeholder-avatar.png"}
                          alt={app.applicantName || app.applicantUsername}
                          className="h-12 w-12 rounded-full object-cover border"
                        />
                        <div>
                          <div className="font-semibold text-[#0F172A]">
                            {app.applicantName || "Unknown"}
                          </div>
                          <div className="text-sm text-slate-500">
                            @{app.applicantUsername || "unknown"}
                          </div>
                          <div className="text-xs text-slate-400">
                            Applied: {formatAppliedAt(app.appliedAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Select to change status (shadcn Select - Option A) */}
                        <Select
                          value={app.status || "pending"}
                          onValueChange={(v) => handleChangeApplicantStatus(app.id, v)}
                        >
                          <SelectTrigger className="w-40 border border-slate-200 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="interviewing">Interviewing</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>

                        <Link
                          to={`/profile/${app.applicantUsername || app.applicantId}`}
                          className="px-3 py-1 border border-slate-200 rounded-md text-sm hover:bg-slate-50"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 border border-slate-200 bg-white rounded-xl shadow-sm flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
              {isOwner ? "Manage Project" : "Join This Project"}
            </h3>

            {isOwner ? (
              <>
                {/* DELETE PROJECT BUTTON */}
                <button
                  onClick={async () => {
                    if (!confirm("Are you sure you want to delete this project permanently?")) return;

                    try {
                      const { deleteProjectCompletely } = await import("@/firebase/projectApi");
                      await deleteProjectCompletely(id);

                      alert("Project deleted successfully.");
                      window.location.href = "/dashboard";
                    } catch (e) {
                      console.error(e);
                      alert("Something went wrong while deleting the project.");
                    }
                  }}
                  className="
                    w-full py-2 rounded-lg font-medium
                    bg-red-500 text-white
                    hover:bg-red-600
                    transition-all
                    shadow-sm
                  "
                >
                  Delete Project
                </button>
              </>
            ) : (
              <>
                {/* Apply Now (same) */}
                <button
                  disabled={
                    alreadyApplied ||
                    (daysLeftNumber != null && daysLeftNumber < 0)
                  }
                  onClick={handleApply}
                  className={`w-full py-2 rounded-lg font-medium transition-all duration-300 ${
                    alreadyApplied
                      ? "bg-slate-200 text-slate-600 cursor-not-allowed"
                      : daysLeftNumber < 0
                      ? "bg-red-200 text-red-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-400 to-blue-600 text-white hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {alreadyApplied ? "✓ Applied" : daysLeftNumber < 0 ? "Closed" : "Apply Now"}
                  {!alreadyApplied && daysLeftNumber >= 0 && (
                    <ArrowRight className="inline ml-1" size={18} />
                  )}
                </button>

                {/* Save button */}
                <button
                  onClick={toggleSave}
                  className="w-full border border-slate-300 py-2 rounded-lg hover:border-[#0072E5] transition text-[#0F172A]"
                >
                  {wishlist.includes(id) ? "Unsave Project" : "Save Project"}
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ------------------- Reusable Components ------------------- */

function SectionCard({ title, children }) {
  return (
    <div className="bg-gradient-to-br from-white to-[#F1F5F9] border border-slate-200 rounded-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoBlock({ title, value }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <h4 className="text-sm font-medium text-[#0F172A] mb-1">{title}</h4>
      <p className="text-slate-700">{value}</p>
    </div>
  );
}


