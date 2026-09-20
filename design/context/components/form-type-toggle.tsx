const assetPathPrefix = "../../assets/exports/form-type-toggle";
const imgCheckIcon = `${assetPathPrefix}/ff480.svg`;
const imgXIcon = `${assetPathPrefix}/a8347.svg`;
const imgXIcon1 = `${assetPathPrefix}/598dd.svg`;
const imgCheckIcon1 = `${assetPathPrefix}/c37ea.svg`;
const imgCheckIcon2 = `${assetPathPrefix}/9dd99.svg`;
const imgCheckIcon3 = `${assetPathPrefix}/cb099.svg`;

type FormTypeToggleProps = {
  className?: string;
  hover?: boolean;
  label?: string;
  mode?: "Light" | "Dark";
  selected?: boolean;
};

export default function FormTypeToggle({ className, hover = false, label = "Label", mode = "Light", selected = true }: FormTypeToggleProps) {
  const isDarkAndIsSelectedAndNotHoverOrNotSelectedAndHover = mode === "Dark" && ((selected && !hover) || (!selected && hover));
  const isNotSelectedAndHoverAndDark = !selected && hover && mode === "Dark";
  const isNotSelectedAndHoverAndLight = !selected && hover && mode === "Light";
  const isNotSelectedAndNotHover = !selected && !hover;
  const isNotSelectedAndNotHoverAndDark = !selected && !hover && mode === "Dark";
  const isNotSelectedAndNotHoverAndLight = !selected && !hover && mode === "Light";
  const isSelectedAndHover = selected && hover;
  const isSelectedAndHoverAndDark = selected && hover && mode === "Dark";
  const isSelectedAndNotHoverAndDark = selected && !hover && mode === "Dark";
  return (
    <div className={className || `content-stretch flex gap-[4px] items-center pl-[8px] pr-[10px] py-[4px] relative rounded-[999px] ${isDarkAndIsSelectedAndNotHoverOrNotSelectedAndHover ? String.raw`bg-[var(--button\/secondary\/hover\/fill,#0a396e)]` : isSelectedAndHover || isNotSelectedAndNotHover ? String.raw`bg-[var(--button\/secondary\/normal\/fill,#d0e2f0)]` : String.raw`bg-[var(--modes\/general\/surface,white)]`}`} id={isNotSelectedAndHoverAndDark ? "node-546_27769" : isNotSelectedAndNotHoverAndDark ? "node-546_27766" : isSelectedAndHoverAndDark ? "node-546_27762" : isSelectedAndNotHoverAndDark ? "node-546_27759" : isNotSelectedAndHoverAndLight ? "node-246_837" : isNotSelectedAndNotHoverAndLight ? "node-246_297" : selected && hover && mode === "Light" ? "node-246_833" : "node-246_293"}>
      {((selected && !hover) || (!selected && hover)) && (
        <div className="relative shrink-0 size-[12px]" id={isNotSelectedAndHoverAndDark ? "node-546_27770" : isSelectedAndNotHoverAndDark ? "node-546_27760" : isNotSelectedAndHoverAndLight ? "node-446_1294" : "node-405_2512"} data-name="check-icon">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={isNotSelectedAndHoverAndDark ? imgCheckIcon3 : isSelectedAndNotHoverAndDark ? imgCheckIcon2 : isNotSelectedAndHoverAndLight ? imgCheckIcon1 : imgCheckIcon} />
        </div>
      )}
      {(isSelectedAndHover || isNotSelectedAndNotHover) && (
        <div className="relative shrink-0 size-[10px]" id={isNotSelectedAndNotHoverAndDark ? "node-546_27767" : isSelectedAndHoverAndDark ? "node-546_27763" : isNotSelectedAndNotHoverAndLight ? "node-405_2518" : "node-446_1291"} data-name="x-icon">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={isNotSelectedAndNotHover ? imgXIcon1 : imgXIcon} />
        </div>
      )}
      {((hover && mode === "Light") || isNotSelectedAndNotHover || isSelectedAndHoverAndDark) && (
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/secondary\/normal\/text,#0a396e)] whitespace-nowrap" data-node-id="246:836">
          {label}
        </p>
      )}
      {isDarkAndIsSelectedAndNotHoverOrNotSelectedAndHover && (
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/secondary\/hover\/text,#d0e2f0)] whitespace-nowrap" data-node-id="546:27761">
          {label}
        </p>
      )}
      {selected && !hover && mode === "Light" && (
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="246:296">
          {label}
        </p>
      )}
    </div>
  );
}
