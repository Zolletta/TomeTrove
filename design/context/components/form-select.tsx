const assetPathPrefix = "../../assets/exports/form-select";
const imgIconCaretDown = `${assetPathPrefix}/0d085.svg`;

function IconCaretDown({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:996" data-name="icon/caret-down">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconCaretDown} />
    </div>
  );
}

type FormSelectProps = {
  className?: string;
  state?: boolean;
};

export default function FormSelect({ className, state = false }: FormSelectProps) {
  const isState = state;
  return (
    <div className={className || `content-stretch flex flex-col items-start relative ${isState ? "gap-[4px]" : ""}`} id={isState ? "node-185_454" : "node-185_449"}>
      <div className="bg-[var(--modes\/general\/background,#d0e2f0)] content-stretch flex items-center justify-between overflow-clip px-[12px] py-[10px] relative rounded-[6px] shrink-0 w-[180px]" id={isState ? "node-185_456" : "node-185_451"} data-name="input-field">
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" id={isState ? "node-185_457" : "node-185_452"}>
          Italy
        </p>
        <div className="overflow-clip relative shrink-0 size-[16px]" id={isState ? "node-185_458" : "node-185_453"} data-name="chevron">
          <IconCaretDown className="absolute left-0 size-[16px] top-0" />
        </div>
      </div>
      {isState && (
        <div className="bg-[var(--modes\/general\/surface,white)] border border-[var(--input\/border,#bacfde)] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[var(--radius\/surface,8px)] shrink-0 w-[180px]" data-node-id="185:459" data-name="dropdown-panel">
          <div className="content-stretch flex items-start overflow-clip px-[12px] py-[10px] relative shrink-0 w-full" data-node-id="185:460" data-name="item-france">
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="185:461">
              France
            </p>
          </div>
          <div className="bg-[var(--modes\/general\/background,#d0e2f0)] h-px relative shrink-0 w-full" data-node-id="185:462" data-name="divider" />
          <div className="content-stretch flex items-start overflow-clip px-[12px] py-[10px] relative shrink-0 w-full" data-node-id="185:463" data-name="item-germany">
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="185:464">
              Germany
            </p>
          </div>
          <div className="bg-[var(--modes\/general\/background,#d0e2f0)] h-px relative shrink-0 w-full" data-node-id="185:465" data-name="divider" />
          <div className="bg-[var(--color\/emerald\/600,#1a8f5c)] content-stretch flex items-start overflow-clip px-[12px] py-[10px] relative shrink-0 w-full" data-node-id="185:466" data-name="item-italy">
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/surface,white)] whitespace-nowrap" data-node-id="185:467">
              Italy
            </p>
          </div>
          <div className="bg-[var(--modes\/general\/background,#d0e2f0)] h-px relative shrink-0 w-full" data-node-id="185:468" data-name="divider" />
          <div className="content-stretch flex items-start overflow-clip px-[12px] py-[10px] relative shrink-0 w-full" data-node-id="185:469" data-name="item-spain">
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="185:470">
              Spain
            </p>
          </div>
          <div className="bg-[var(--modes\/general\/background,#d0e2f0)] h-px relative shrink-0 w-full" data-node-id="185:471" data-name="divider" />
          <div className="content-stretch flex items-start overflow-clip px-[12px] py-[10px] relative shrink-0 w-full" data-node-id="185:472" data-name="item-portugal">
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="185:473">
              Portugal
            </p>
          </div>
          <div className="absolute bottom-[3px] overflow-clip right-[3px] top-[3px] w-[4px]" data-node-id="253:964" data-name="scrollbar">
            <div className="absolute bg-[var(--modes\/general\/background,#d0e2f0)] inset-0 rounded-[2px]" data-node-id="I253:964;185:555" data-name="track" />
            <div className="absolute bg-[var(--modes\/general\/link,#0a2540)] inset-[0_0_70%_0] opacity-40 rounded-[2px]" data-node-id="I253:964;185:556" data-name="thumb" />
          </div>
        </div>
      )}
    </div>
  );
}
