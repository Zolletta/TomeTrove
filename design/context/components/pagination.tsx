const assetPathPrefix = "../../assets/exports/pagination";
const imgIconCaretDown = `${assetPathPrefix}/0d085.svg`;

function IconCaretDown({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:996" data-name="icon/caret-down">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconCaretDown} />
    </div>
  );
}

export default function Pagination({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex items-center justify-between py-[8px] relative w-[800px]"} data-node-id="341:406" data-name="pagination">
      <div className="content-stretch flex items-center relative shrink-0" data-node-id="341:407" data-name="pagination/page-list">
        <div className="content-stretch flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 size-[24px]" data-node-id="I341:407;341:387" data-name="first-page">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I341:407;341:388">«</p>
        </div>
        <div className="content-stretch flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 size-[24px]" data-node-id="I341:407;341:389" data-name="page-1">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I341:407;341:390">1</p>
        </div>
        <div className="content-stretch flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 size-[24px]" data-node-id="I341:407;341:391" data-name="page-2">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I341:407;341:392">2</p>
        </div>
        <div className="content-stretch flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 size-[24px]" data-node-id="I341:407;341:393" data-name="current-page">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--color\/emerald\/600,#1a8f5c)] whitespace-nowrap" data-node-id="I341:407;341:394">3</p>
        </div>
        <div className="content-stretch flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 size-[24px]" data-node-id="I341:407;341:395" data-name="page-4">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I341:407;341:396">4</p>
        </div>
        <div className="content-stretch flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 size-[24px]" data-node-id="I341:407;341:397" data-name="page-5">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I341:407;341:398">5</p>
        </div>
        <div className="content-stretch flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 size-[24px]" data-node-id="I341:407;341:399" data-name="last-page">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I341:407;341:400">»</p>
        </div>
      </div>
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="341:422" data-name="pagination/change-page-size">
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I341:422;341:402">Show:</p>
        <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I341:422;357:1990" data-name="page-size-select">
          <div className="bg-[var(--modes\/general\/background,#d0e2f0)] content-stretch flex items-center justify-between overflow-clip px-[12px] py-[10px] relative rounded-[6px] shrink-0" data-node-id="I341:422;357:1990;185:451" data-name="input-field">
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I341:422;357:1990;185:452">10</p>
            <div className="overflow-clip relative shrink-0 size-[16px]" data-node-id="I341:422;357:1990;185:453" data-name="chevron">
              <IconCaretDown className="absolute left-0 size-[16px] top-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
