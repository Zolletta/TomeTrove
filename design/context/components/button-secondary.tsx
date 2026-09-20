const assetPathPrefix = "../../assets/exports/button-secondary";
const imgIconPencilLine = `${assetPathPrefix}/40ca8.svg`;
const imgIcon = `${assetPathPrefix}/2f340.svg`;
const imgIcon1 = `${assetPathPrefix}/de571.svg`;
const imgIcon2 = `${assetPathPrefix}/7c98a.svg`;

function IconPencilLine({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="608:982" data-name="icon/pencil-line">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconPencilLine} />
    </div>
  );
}

type ButtonSecondaryProps = {
  className?: string;
  label?: string;
  state?: "Default" | "Hover" | "Disabled";
};

export default function ButtonSecondary({ className, label = "Add to Shelf", state = "Default" }: ButtonSecondaryProps) {
  const isDisabled = state === "Disabled";
  const isHover = state === "Hover";
  return (
    <div className={className || `${String.raw`border border-solid content-stretch flex gap-[8px] h-[46px] items-center justify-center px-[16px] py-[10px] relative rounded-[var(--radius\/surface,8px)] `}${isDisabled ? String.raw`bg-[var(--button\/secondary\/disabled\/fill,#d0e2f0)] border-[var(--button\/secondary\/disabled\/stroke,#d0e2f0)]` : isHover ? String.raw`bg-[var(--button\/secondary\/hover\/fill,#0a396e)] border-[var(--button\/secondary\/hover\/stroke,#d0e2f0)]` : String.raw`bg-[var(--button\/secondary\/normal\/fill,#d0e2f0)] border-[var(--button\/secondary\/normal\/stroke,#0a396e)]`}`} id={isDisabled ? "node-185_86" : isHover ? "node-185_80" : "node-185_74"}>
      <div className="relative shrink-0 size-[24px]" id={isDisabled ? "node-546_37569" : isHover ? "node-546_37566" : "node-546_37491"} data-name="icon">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={isDisabled ? imgIcon2 : isHover ? imgIcon1 : imgIcon} />
      </div>
      {state === "Default" && (
        <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/secondary\/normal\/text,#0a396e)] whitespace-nowrap" data-node-id="185:79">
          {label}
        </p>
      )}
      {isHover && (
        <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/secondary\/hover\/text,#d0e2f0)] whitespace-nowrap" data-node-id="185:85">
          {label}
        </p>
      )}
      {isDisabled && (
        <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/secondary\/disabled\/text,white)] whitespace-nowrap" data-node-id="185:91">
          {label}
        </p>
      )}
    </div>
  );
}
