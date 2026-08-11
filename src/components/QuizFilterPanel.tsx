"use client";

import { TopicFilter } from "./topicFilter";

export function QuizFilterPanel({
  topicFilter,
  onTopicChange,
  topicOptions,
}: {
  topicFilter: string | "all";
  onTopicChange: (value: string | "all") => void;
  topicOptions: string[];
}) {
  return (
    <aside className="quizFilterPanel">
      <TopicFilter
        value={topicFilter}
        onChange={onTopicChange}
        options={topicOptions}
      />
    </aside>
  );
}