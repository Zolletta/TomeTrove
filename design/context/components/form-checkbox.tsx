const assetPathPrefix = "../../assets/exports/form-checkbox";
const imgCheck = `${assetPathPrefix}/dad55.svg`;

type FormCheckboxProps = {
  className?: string;
  state?: boolean;
};

export default function FormCheckbox({ className, state = true }: FormCheckboxProps) {
  const isNotState = !state;
  return (
    <div className={className || `content-stretch flex h-[18px] items-center relative ${isNotState ? "w-[81px]" : "w-[70px]"}`} id={isNotState ? "node-185_562" : "node-185_557"}>
      <div className={`relative rounded-[4px] shrink-0 size-[18px] ${isNotState ? String.raw`border-[1.5px] border-[var(--modes\/general\/background,#d0e2f0)] border-solid` : String.raw`bg-[var(--color\/emerald\/600,#1a8f5c)] content-stretch flex items-center justify-center`}`} id={isNotState ? "node-185_563" : "node-185_558"} data-name="Frame">
        {state && (
          <div className="relative shrink-0 size-[12px]" data-node-id="405:2520" data-name="check">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
          </div>
        )}
      </div>
    </div>
  );
}
