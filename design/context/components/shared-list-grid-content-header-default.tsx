export default function SharedListGridContentHeaderDefault({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[var(--modes\\/rows\\/header,#9fbfd6)] content-stretch flex items-center relative w-[800px]"} data-node-id="526:2401" data-name="shared-list/grid-content-header/default">
      <div className="[word-break:break-word] content-stretch flex gap-[6px] items-center px-[12px] py-[8px] relative shrink-0 text-[color:var(--color\/emerald\/600,#1a8f5c)] w-[368px] whitespace-nowrap" data-node-id="526:2402" data-name="col-list-name">
        <p className="font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px]" data-node-id="I526:2402;341:361">
          List name
        </p>
        <p className="font-['Outfit:Bold'] font-bold leading-[1.2] relative shrink-0 text-[10px]" data-node-id="I526:2402;341:362">
          A↓Z
        </p>
      </div>
      <div className="content-stretch flex flex-[1_0_0] items-center min-w-px px-[12px] py-[8px] relative" data-node-id="526:2403" data-name="col-expiration-date">
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I526:2403;341:367">
          Expiration date
        </p>
      </div>
      <div className="content-stretch flex flex-[1_0_0] items-center min-w-px px-[12px] py-[8px] relative" data-node-id="526:2404" data-name="col-book-count">
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I526:2404;341:367">
          Book count
        </p>
      </div>
      <div className="content-stretch flex items-center px-[12px] py-[8px] relative shrink-0 w-[64px]" data-node-id="526:2406" data-name="col-actions">
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:2406;341:370">
          Actions
        </p>
      </div>
    </div>
  );
}
