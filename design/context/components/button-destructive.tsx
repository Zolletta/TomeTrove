const assetPathPrefix = "../../assets/exports/button-destructive";
const imgIconPencilLine = `${assetPathPrefix}/40ca8.svg`;
const imgIcon = `${assetPathPrefix}/7c98a.svg`;
const imgIcon1 = `${assetPathPrefix}/ab84d.svg`;
const imgIcon2 = `${assetPathPrefix}/6f3d3.svg`;

function IconPencilLine({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="608:982" data-name="icon/pencil-line">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconPencilLine} />
    </div>
  );
}

type ButtonDestructiveProps = {
  className?: string;
  label?: string;
  state?: "Default" | "Hover" | "Disabled";
};

export default function ButtonDestructive({ className, label = "Add to Shelf", state = "Default" }: ButtonDestructiveProps) {
  const isDisabled = state === "Disabled";
  const isHover = state === "Hover";
  return (
    <div className={className || `${String.raw`border border-solid content-stretch flex gap-[8px] h-[46px] items-center justify-center px-[16px] py-[10px] relative rounded-[var(--radius\/surface,8px)] `}${isDisabled ? String.raw`bg-[var(--button\/destructive\/disabled\/fill,#f75454)] border-[var(--button\/destructive\/disabled\/stroke,#f75454)]` : isHover ? String.raw`bg-[var(--button\/destructive\/hover\/fill,#fdcccc)] border-[var(--button\/destructive\/hover\/stroke,#f75454)]` : String.raw`bg-[var(--button\/destructive\/normal\/fill,#f75454)] border-[var(--button\/destructive\/normal\/stroke,#f75454)]`]}`} id={isDisabled ? "node-185_104" : isHover ? "node-185_98" : "node-185_92"}>
      <div className="relative shrink-0 size-[24px]" id={isDisabled ? "node-546_37929" : isHover ? "node-546_37926" : "node-546_37891"} data-name="icon">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={isDisabled ? imgIcon2 : isHover ? imgIcon1 : imgIcon} />
      </div>
      {state === "Default" && (
        <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/destructive\/normal\/text,white)] whitespace-nowrap" data-node-id="185:97">
          {label}
        </p>
      )}
      {isHover && (
        <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/destructive\/hover\/text,#f75454)] whitespace-nowrap" data-node-id="185:103">
          {label}
        </p>
      )}
      {isDisabled && (
        <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/destructive\/disabled\/text,white)] whitespace-nowrap" data-node-id="185:109">
          {label}
        </p>
      )}
    </div>
  );
}
