type FormToggleProps = {
  className?: string;
  state?: boolean;
};

export default function FormToggle({ className, state = true }: FormToggleProps) {
  const isNotState = !state;
  return (
    <div className={className || `content-stretch flex h-[22px] items-center relative ${isNotState ? "w-[73px]" : "w-[71px]"}`} id={isNotState ? "node-185_578" : "node-185_574"}>
      <div className={`content-stretch flex h-[22px] items-center p-[2px] relative rounded-[11px] shrink-0 w-[40px] ${isNotState ? String.raw`bg-[var(--modes\/general\/background,#d0e2f0)] border border-[var(--modes\/general\/background,#d0e2f0)] border-solid` : String.raw`bg-[var(--color\/emerald\/600,#1a8f5c)] justify-end`}`} id={isNotState ? "node-185_579" : "node-185_575"} data-name="Frame">
        <div className="bg-[var(--modes\/general\/surface,white)] relative rounded-[9px] shrink-0 size-[18px]" id={isNotState ? "node-185_580" : "node-185_576"} data-name="Frame" />
      </div>
    </div>
  );
}
