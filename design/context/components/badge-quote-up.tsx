const assetPathPrefix = "../../assets/exports/badge-quote-up";
const imgIconArrowUp = `${assetPathPrefix}/01b98.svg`;

type BadgeQuoteUpProps = {
  className?: string;
  value?: string;
};

export default function BadgeQuoteUp({ className, value = "3%" }: BadgeQuoteUpProps) {
  return (
    <div className={className || "bg-[var(--badges\\/increase,#f75454)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[6px]"} data-node-id="464:90" data-name="badge/quote/up">
      <div className="relative shrink-0 size-[14px]" data-node-id="464:91" data-name="icon/arrow-up">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconArrowUp} />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--color\/coral\/500,#f75454)] whitespace-nowrap" data-node-id="464:93">
        {value}
      </p>
    </div>
  );
}
