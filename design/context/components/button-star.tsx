const assetPathPrefix = "../../assets/exports/button-star";
const imgPreferredFalse = `${assetPathPrefix}/54226.svg`;
const imgPreferredTrue = `${assetPathPrefix}/aa509.svg`;

type ButtonStarProps = {
  className?: string;
  preferred?: boolean;
};

export default function ButtonStar({ className, preferred = false }: ButtonStarProps) {
  const isPreferred = preferred;
  return (
    <div className={className || "relative size-[24px]"} id={isPreferred ? "node-232_562" : "node-232_560"}>
      {!preferred && (
        <div className="absolute inset-[-1.85%_0_0_0]">
          <img alt="" className="block max-w-none size-full" src={imgPreferredFalse} />
        </div>
      )}
      {isPreferred && <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPreferredTrue} />}
    </div>
  );
}
