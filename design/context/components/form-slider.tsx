const assetPathPrefix = "../../assets/exports/form-slider";
const imgUnion = `${assetPathPrefix}/d8b20.svg`;
const imgEllipse = `${assetPathPrefix}/8e78a.svg`;

export default function FormSlider({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex flex-col gap-[4px] h-[62px] items-start relative w-[190px]"} data-node-id="190:176" data-name="form/slider">
      <div className="content-stretch flex gap-[8px] h-[24px] items-center overflow-clip relative shrink-0 w-full" data-node-id="190:178" data-name="track-row">
        <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.4] relative shrink-0 text-[11px] text-[color:var(--color\/navy\/700,#0a396e)] whitespace-nowrap" data-node-id="190:179">
          0
        </p>
        <div className="flex-[1_0_0] h-full min-w-px relative" data-node-id="190:180" data-name="Frame">
          <div className="absolute h-[4px] left-0 right-0 top-[10px]" data-node-id="546:27577" data-name="Union">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgUnion} />
          </div>
          <div className="absolute bg-[var(--color\/emerald\/600,#1a8f5c)] h-[4px] left-0 rounded-[2px] top-[10px] w-[70px]" data-node-id="190:182" data-name="filled-rectangle" />
          <div className="absolute left-[60px] size-[20px] top-[2px]" data-node-id="190:183" data-name="Ellipse">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse} />
          </div>
        </div>
        <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.4] relative shrink-0 text-[11px] text-[color:var(--color\/navy\/700,#0a396e)] whitespace-nowrap" data-node-id="190:184">
          100
        </p>
      </div>
      <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] text-center w-[180px]" data-node-id="190:185">
        50
      </p>
    </div>
  );
}
