"use client";

import { CardsPage } from "../../components/cardPage";
import { ProjectCard } from "../../components/ProjectCard";
import { AddProjectForm } from "../../components/AddProjectForm";
import { useAuth } from "../../contexts/AuthContext";
import type { ProjectData } from "../../types";

export default function ResourcesPage() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <title>პროექტები — Newton</title>
      <meta name="description" content="სტუდენტების მიერ გაკეთებული პროექტები ფიზიკის სხვადსხვა თემებზე" />

      <CardsPage<ProjectData>
        endpoint="projects"
        renderCard={(card, refetch) => <ProjectCard card={card} onChanged={refetch} />}
        renderAddForm={isAuthenticated ? (onAdded) => <AddProjectForm onAdded={onAdded} /> : undefined}
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
