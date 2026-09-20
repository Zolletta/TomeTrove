const assetPathPrefix = "../../assets/exports/badge-quote-down";
const imgIconArrowDown = `${assetPathPrefix}/c83d8.svg`;

type BadgeQuoteDownProps = {
  className?: string;
  value?: string;
};

export default function BadgeQuoteDown({ className, value = "8%" }: BadgeQuoteDownProps) {
  return (
    <div className={className || "bg-[var(--badges\\/decrease,#1a8f5c)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[6px]"} data-node-id="464:86" data-name="badge/quote/down">
      <div className="relative shrink-0 size-[14px]" data-node-id="464:87" data-name="icon/arrow-down">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconArrowDown} />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--color\/emerald\/600,#1a8f5c)] whitespace-nowrap" data-node-id="464:89">
        {value}
      </p>
    </div>
  );
}
