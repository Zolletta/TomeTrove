const assetPathPrefix = "../../assets/exports/form-radio";
const imgRadioSelected = `${assetPathPrefix}/3340b.svg`;

type FormRadioProps = {
  className?: string;
  state?: boolean;
};

export default function FormRadio({ className, state = true }: FormRadioProps) {
  const isNotState = !state;
  return (
    <div className={className || `content-stretch flex h-[18px] items-center relative ${isNotState ? "w-[81px]" : "w-[82px]"}`} id={isNotState ? "node-185_570" : "node-185_566"}>
      {state && (
        <div className="relative shrink-0 size-[18px]" data-node-id="185:567" data-name="radio-selected">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRadioSelected} />
        </div>
      )}
      {isNotState && <div className="border-[1.5px] border-[var(--modes\/general\/background,#d0e2f0)] border-solid relative rounded-[9px] shrink-0 size-[18px]" data-node-id="185:571" data-name="Frame" />}
    </div>
  );
}
