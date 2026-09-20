type FormInputProps = {
  className?: string;
  state?: "Default" | "Focus" | "Error" | "Disabled";
};

export default function FormInput({ className, state = "Default" }: FormInputProps) {
  const isDisabled = state === "Disabled";
  const isError = state === "Error";
  const isFocus = state === "Focus";
  return (
    <div className={className || `content-stretch flex flex-col items-start relative ${isDisabled ? "opacity-50" : ""}`} id={isDisabled ? "node-185_136" : isError ? "node-185_131" : isFocus ? "node-185_127" : "node-185_123"}>
      <div className="bg-[var(--modes\/general\/background,#d0e2f0)] content-stretch flex items-center overflow-clip px-[12px] py-[10px] relative rounded-[6px] shrink-0 w-[180px]" id={isDisabled ? "node-185_138" : isError ? "node-185_133" : isFocus ? "node-185_129" : "node-185_125"} data-name="input-field">
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--input\/placeholder,#596673)] whitespace-nowrap" id={isDisabled ? "node-185_139" : isError ? "node-185_134" : isFocus ? "node-185_130" : "node-185_126"}>
          Enter your name...
        </p>
      </div>
    </div>
  );
}
