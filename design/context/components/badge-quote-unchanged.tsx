const assetPathPrefix = "../../assets/exports/badge-quote-unchanged";
const imgIconEqual = `${assetPathPrefix}/3072c.svg`;

type BadgeQuoteUnchangedProps = {
  className?: string;
  value?: string;
};

export default function BadgeQuoteUnchanged({ className, value = "0%" }: BadgeQuoteUnchangedProps) {
  return (
    <div className={className || "bg-[var(--badges\\/no-change,#0a2540)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[6px]"} data-node-id="464:94" data-name="badge/quote/unchanged">
      <div className="relative shrink-0 size-[14px]" data-node-id="464:95" data-name="icon/equal">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconEqual} />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--color\/navy\/900,#0a2540)] whitespace-nowrap" data-node-id="464:97">
        {value}
      </p>
    </div>
  );
}
