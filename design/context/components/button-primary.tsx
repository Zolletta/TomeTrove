const assetPathPrefix = "../../assets/exports/button-primary";
const imgIconPencilLine = `${assetPathPrefix}/40ca8.svg`;
const imgIcon = `${assetPathPrefix}/ad23d.svg`;
const imgIcon1 = `${assetPathPrefix}/0d8d6.svg`;
const imgIcon2 = `${assetPathPrefix}/c93a6.svg`;

function IconPencilLine({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="608:982" data-name="icon/pencil-line">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconPencilLine} />
    </div>
  );
}

type ButtonPrimaryProps = {
  className?: string;
  label?: string;
  state?: "Default" | "Hover" | "Disabled";
};

export default function ButtonPrimary({ className, label = "Add to Shelf", state = "Default" }: ButtonPrimaryProps) {
  const isDisabled = state === "Disabled";
  const isHover = state === "Hover";
  return (
    <div className={className || `${String.raw`border border-solid content-stretch flex gap-[8px] h-[46px] items-center justify-center px-[16px] py-[10px] relative rounded-[var(--radius\/surface,8px)] `}${isDisabled ? String.raw`bg-[var(--button\/primary\/disabled\/fill,#1a8f5c)] border-[var(--button\/primary\/disabled\/stroke,#1a8f5c)]` : isHover ? String.raw`bg-[var(--button\/primary\/hover\/fill,white)] border-[var(--button\/primary\/hover\/stroke,#1a8f5c)]` : String.raw`bg-[var(--button\/primary\/normal\/fill,#1a8f5c)] border-[var(--button\/primary\/normal\/stroke,#1a8f5c)]`]}`} id={isDisabled ? "node-185_71" : isHover ? "node-185_65" : "node-185_59"}>
      <div className="relative shrink-0 size-[24px]" id={isDisabled ? "node-546_37572" : isHover ? "node-546_37583" : "node-546_37586"} data-name="icon">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={isDisabled ? imgIcon2 : isHover ? imgIcon1 : imgIcon} />
      </div>
      {state === "Default" && (
        <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/primary\/normal\/text,white)] whitespace-nowrap" data-node-id="185:64">
          {label}
        </p>
      )}
      {isHover && (
        <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/primary\/hover\/text,#1a8f5c)] whitespace-nowrap" data-node-id="185:70">
          {label}
        </p>
      )}
      {isDisabled && (
        <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/primary\/disabled\/text,white)] whitespace-nowrap" data-node-id="185:73">
          {label}
        </p>
      )}
    </div>
  );
}
