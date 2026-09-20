const assetPathPrefix = "../../assets/exports/sortable-item";
const imgDragHandle = `${assetPathPrefix}/d54c5.svg`;
const imgItemIcon = `${assetPathPrefix}/9d7ca.svg`;
const imgDragHandle1 = `${assetPathPrefix}/c1d21.svg`;
const imgItemIcon1 = `${assetPathPrefix}/07753.svg`;

type SortableItemProps = {
  className?: string;
  label?: string;
  rank?: string;
  state?: "Default" | "Dragging";
};

export default function SortableItem({ className, label = "New books", rank = "1", state = "Default" }: SortableItemProps) {
  const isDefault = state === "Default";
  const isDragging = state === "Dragging";
  return (
    <div className={className || `${String.raw`border-[var(--text\/heading,#1a8f5c)] border-solid content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[10px] relative rounded-[var(--radius\/surface,8px)] `}${isDragging ? String.raw`bg-[var(--color\/emerald\/600,#1a8f5c)] border-[1.5px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08),0px_4px_12px_0px_rgba(0,0,0,0.15)] w-[320.5px]` : String.raw`bg-[var(--modes\/general\/surface,white)] border h-[46px] w-[319.5px]`]}`} id={isDragging ? "node-551_5917" : "node-551_5911"}>
      <div className="relative shrink-0 size-[24px]" id={isDragging ? "node-551_5913" : "node-551_5907"} data-name="drag-handle">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={isDragging ? imgDragHandle1 : imgDragHandle} />
      </div>
      <div className="relative shrink-0 size-[24px]" id={isDragging ? "node-551_5914" : "node-551_5908"} data-name="item-icon">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={isDragging ? imgItemIcon1 : imgItemIcon} />
      </div>
      {isDefault && (
        <>
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] w-[217px]" data-node-id="551:5909">
            {label}
          </p>
          <p className="[word-break:break-word] absolute font-['Outfit:Regular'] font-normal leading-[1.5] right-[8.5px] text-[12px] text-[color:var(--text\/heading,#1a8f5c)] text-right top-[14px] whitespace-nowrap" data-node-id="551:5910">
            {rank}
          </p>
        </>
      )}
      {isDragging && (
        <>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Outfit:Medium'] font-medium leading-[1.5] min-w-px relative text-[14px] text-[color:var(--button\/primary\/normal\/text,white)]" data-node-id="551:5915">
            {label}
          </p>
          <div className="[word-break:break-word] flex flex-col font-['Outfit:Regular'] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-[color:var(--button\/primary\/normal\/text,white)] text-right whitespace-nowrap" data-node-id="551:5916">
            <p className="leading-[1.5]">{rank}</p>
          </div>
        </>
      )}
    </div>
  );
}
