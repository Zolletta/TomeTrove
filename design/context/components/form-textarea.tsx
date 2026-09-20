type FormTextareaProps = {
  className?: string;
  state?: "Default" | "Focus" | "Error" | "Disabled";
};

export default function FormTextarea({ className, state = "Default" }: FormTextareaProps) {
  const isDisabled = state === "Disabled";
  const isError = state === "Error";
  const isFocus = state === "Focus";
  return (
    <div className={className || `content-stretch flex flex-col items-start relative ${isDisabled ? "opacity-50" : ""}`} id={isDisabled ? "node-185_153" : isError ? "node-185_149" : isFocus ? "node-185_145" : "node-185_141"}>
      <div className="bg-[var(--modes\/general\/background,#d0e2f0)] content-stretch flex h-[80px] items-start overflow-clip px-[12px] py-[10px] relative rounded-[6px] shrink-0 w-[180px]" id={isDisabled ? "node-185_155" : isError ? "node-185_151" : isFocus ? "node-185_147" : "node-185_143"} data-name="textarea-field">
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--input\/placeholder,#596673)] whitespace-nowrap" id={isDisabled ? "node-185_156" : isError ? "node-185_152" : isFocus ? "node-185_148" : "node-185_144"}>
          Write a few lines...
        </p>
      </div>
    </div>
  );
}
