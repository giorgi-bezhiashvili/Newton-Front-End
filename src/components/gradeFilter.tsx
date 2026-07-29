interface GradeFilterProps {
  value: number | "all";
  onChange: (value: number | "all") => void;
  options?: number[]; 
}

export function GradeFilter({ value, onChange, options = [7, 8,9,10,11,12] }: GradeFilterProps) {
  return (
    <div className="gradeFilterWrapper">
      <span className="gradeFilterLabel">კლასები</span>
      <div className="gradeFilterButtons">
        <button
          type="button"
          className={`gradeFilterBtn ${value === "all" ? "active" : ""}`}
          onClick={() => onChange("all")}
        >
          ყველა კლასი
        </button>
        {options.map((grade) => (
          <button
            key={grade}
            type="button"
            className={`gradeFilterBtn ${value === grade ? "active" : ""}`}
            onClick={() => onChange(grade)}
          >
            მე-{grade} კლასი
          </button>
        ))}
      </div>
    </div>
  );
}