const assetPathPrefix = "../../assets/exports/button-close";
const imgStateDefault = `${assetPathPrefix}/09bfa.svg`;
const imgStateHover = `${assetPathPrefix}/a2808.svg`;

type ButtonCloseProps = {
  className?: string;
  state?: "Default" | "Hover";
};

export default function ButtonClose({ className, state = "Default" }: ButtonCloseProps) {
  const isHover = state === "Hover";
  return (
    <div className={className || "relative size-[12px]"} id={isHover ? "node-246_859" : "node-207_788"}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={isHover ? imgStateHover : imgStateDefault} />
    </div>
  );
}
