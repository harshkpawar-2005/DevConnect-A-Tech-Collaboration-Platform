// src/pages/CreateProject.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import RoleInput from "@/components/roles/RoleInput";
import { createProject as createProjectApi } from "@/firebase/projectApi";
import { toast } from "@/hooks/use-toast";

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useUser();

  // Basic meta
  const [title, setTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState([]);

  // Roles
  const [roles, setRoles] = useState([
    { roleName: "", responsibilities: [""], requirements: [""], membersRequired: 1 },
  ]);

  // Availability
  const [availability, setAvailability] = useState("");

  // Stipend
  const [isPaid, setIsPaid] = useState(false);
  const [stipendAmount, setStipendAmount] = useState("");

  // Dates
  const [lastDate, setLastDate] = useState("");

  // Misc
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ----------------- Handlers ----------------- */

  const addTech = () => {
    const t = techInput.trim();
    if (t && !techStack.includes(t)) {
      setTechStack((s) => [...s, t]);
      setTechInput("");
    }
  };

  const removeTech = (t) => {
    setTechStack((s) => s.filter((x) => x !== t));
  };

  const addRole = () => {
    setRoles((r) => [...r, { roleName: "", responsibilities: [""], requirements: [""], membersRequired: 1 }]);
  };

  const updateRole = (index, newRole) => {
    setRoles((r) => r.map((it, i) => (i === index ? newRole : it)));
  };

  const removeRole = (index) => {
    setRoles((r) => r.filter((_, i) => i !== index));
  };

  /* ----------------- Submit ----------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) return setError("You must be signed in to post a project.");
    if (!title.trim()) return setError("Please enter project title.");
    if (!headline.trim()) return setError("Please add a headline.");
    if (!description.trim()) return setError("Please add a description.");
    if (!lastDate) return setError("Please set last date to apply.");
    if (roles.length === 0) return setError("Add at least one role.");

    const projectId = crypto.randomUUID();

    const payload = {
      creatorId: user.id,
      creatorUsername: user.username || "",
      creatorName: user.fullName || "",
      creatorImage: user.imageUrl || "",

      projectTitle: title.trim(),
      projectHeadline: headline.trim(),
      projectDescription: description.trim(),
      techStack,

      roles: roles.map((r) => ({
        roleName: r.roleName,
        responsibilities: (r.responsibilities || []).filter(Boolean),
        requirements: (r.requirements || []).filter(Boolean),
        membersRequired: Number(r.membersRequired) || 0,
      })),

      availability: availability.trim(),
      additionalInfo: {
        timing: availability.trim(),
        stipend: isPaid ? stipendAmount.trim() : "Unpaid",
        duration: "",
      },

      contact: {
        email:
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          "",
        linkedin: "",
      },

      location: location.trim(),
      mode: mode.trim(),
      lastDate,
      status: "open",
      createdAt: new Date(),
    };

    try {
      setLoading(true);
      await createProjectApi(projectId, payload);

      toast({
        title: "Project Created 🎉",
        description: "Your project has been posted successfully!",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Create project error:", err);

      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });

      setError("Failed to create project. Check console.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------- UI ----------------- */

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Post a Project</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div>
          <Label>Project Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Real-time chat app with React & Firebase"
            className="mt-2"
          />
        </div>

        {/* Headline */}
        <div>
          <Label>Headline *</Label>
          <Textarea
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            rows={2}
            placeholder="Short headline for the card"
            className="mt-2"
          />
        </div>

        {/* Description */}
        <div>
          <Label>Description *</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Describe the project in detail..."
            className="mt-2"
          />
        </div>

        {/* Tech Stack */}
        <div>
          <Label>Tech Stack</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
              placeholder="Type tech and press Enter"
            />
            <Button
              type="button"
              onClick={addTech}
              className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {techStack.map((t) => (
              <div key={t} className="px-3 py-1 rounded bg-slate-100 flex items-center gap-2">
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => removeTech(t)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Roles */}
        <div>
          <div className="flex items-center justify-between">
            <Label>Roles & Requirements *</Label>
            <Button
              type="button"
              onClick={addRole}
              className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
            >
              + Add Role
            </Button>
          </div>

          <div className="space-y-4 mt-4">
            {roles.map((role, idx) => (
              <RoleInput
                key={idx}
                index={idx}
                role={role}
                onChange={(r) => updateRole(idx, r)}
                onRemove={() => removeRole(idx)}
              />
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <Label>Availability / Timing</Label>
          <Input
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder='e.g. "Evenings 7–10 PM" or "Flexible"'
            className="mt-2"
          />
        </div>

        {/* Location + Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Location (optional)</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City / Remote"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Mode (optional)</Label>
            <Input
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              placeholder="Remote / Hybrid / In-office"
              className="mt-2"
            />
          </div>
        </div>

        {/* Stipend */}
        <div>
          <Label>Stipend</Label>

          <RadioGroup
            defaultValue={isPaid ? "paid" : "unpaid"}
            onValueChange={(v) => setIsPaid(v === "paid")}
            className="mt-3 flex items-center gap-6"
          >
            {/* Unpaid */}
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="unpaid"
                id="unpaid"
                // className="text-[#0072E5] border-[#0072E5] data-[state=checked]:bg-[#0072E5]"
              />
              <Label htmlFor="unpaid">Unpaid</Label>
            </div>

            {/* Paid */}
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="paid"
                id="paid"
                // className="text-[#0072E5] border-[#0b0b0b] data-[stat"
              />
              <Label htmlFor="paid">Paid</Label>
            </div>
          </RadioGroup>


          {isPaid && (
            <Input
              value={stipendAmount}
              onChange={(e) => setStipendAmount(e.target.value)}
              placeholder="Amount (e.g. ₹2000 / $20/month)"
              className="mt-3"
            />
          )}
        </div>

        {/* Last Date */}
        <div>
          <Label>Last date to apply *</Label>
          <Input
            type="date"
            value={lastDate}
            onChange={(e) => setLastDate(e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
          >
            {loading ? "Posting..." : "Post Project"}
          </Button>

          <Button variant="outline" type="button" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
