const assetPathPrefix = "../../assets/exports/data-no-results";
const imgIconSmileyXEyes = `${assetPathPrefix}/3d40a.svg`;

function IconSmileyXEyes({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:1032" data-name="icon/smiley-x-eyes">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconSmileyXEyes} />
    </div>
  );
}

export default function DataNoResults({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[var(--modes\/general\/surface,white)] content-stretch flex flex-col items-start p-[24px] relative rounded-[var(--radius\/surface,8px)] w-[800px]"} data-node-id="341:762" data-name="data/no-results">
      <div className="content-stretch flex flex-col gap-[8px] items-center justify-center overflow-clip py-[48px] relative shrink-0 w-full" data-node-id="341:768" data-name="no-results-message">
        <IconSmileyXEyes className="relative shrink-0 size-[40px]" />
        <p className="[word-break:break-word] font-['Josefin_Sans:Bold'] font-bold leading-[1.3] relative shrink-0 text-[18px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="341:770">
          No results found
        </p>
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] opacity-60 relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="341:771">
          Try adjusting your search terms or clearing filters.
        </p>
      </div>
    </div>
  );
}
