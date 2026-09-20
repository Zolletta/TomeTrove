const assetPathPrefix = "../../assets/exports/data-loading";
const imgIconSmileyBlank = `${assetPathPrefix}/e85be.svg`;

function IconSmileyBlank({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:1040" data-name="icon/smiley-blank">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconSmileyBlank} />
    </div>
  );
}

export default function DataLoading({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[var(--modes\/general\/surface,white)] content-stretch flex flex-col h-[311px] items-start p-[24px] relative w-[800px]"} data-node-id="357:1559" data-name="data/loading">
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-center justify-center min-h-px overflow-clip py-[48px] relative w-full" data-node-id="357:1571" data-name="loading-message">
        <IconSmileyBlank className="relative shrink-0 size-[40px]" />
        <p className="[word-break:break-word] font-['Josefin_Sans:Bold'] font-bold leading-[1.3] relative shrink-0 text-[18px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="357:1574">
          Loading...
        </p>
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="357:1575">
          Fetching data, please wait.
        </p>
      </div>
    </div>
  );
}
