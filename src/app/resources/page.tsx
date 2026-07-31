"use client";

import { CardsPage } from "../../components/cardPage";
import { ProjectCard } from "../../components/ProjectCard";
import { AddProjectForm } from "../../components/AddProjectForm";
import { useAuth } from "../../contexts/AuthContext";
import type { ProjectData } from "../../types";

export default function ResourcesPage() {
  const { auth, isAuthenticated } = useAuth();

  const isTeacher = isAuthenticated && auth?.role === "teacher";

  return (
    <>
      <title>რესურსები - Newton</title>
      <meta
        name="description"
        content="სტუდენტების მიერ გაკეთებული რესურსები ფიზიკის სხვადსხვა თემებზე"
      />

      <CardsPage<ProjectData>
        endpoint="projects"
        renderCard={(card, refetch) => (
          <ProjectCard card={card} onChanged={refetch} />
        )}
        renderAddForm={
          isTeacher
            ? (onAdded) => <AddProjectForm onAdded={onAdded} />
            : undefined
        }
        searchMatch={(card, searchLower) =>
          card.topic.toLowerCase().includes(searchLower) ||
          card.grade.toString().includes(searchLower) ||
          card.description.toLowerCase().includes(searchLower) ||
          (card.projectAuthor?.toLowerCase().includes(searchLower) ?? false)
        }
      />
    </>
  );
}