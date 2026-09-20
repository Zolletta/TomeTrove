const assetPathPrefix = "../../assets/exports/logo-mark";
const imgLogoMarkLightRefined = `${assetPathPrefix}/4b50f.svg`;
const imgLogoMarkDarkRefined = `${assetPathPrefix}/3abb5.svg`;

type LogoMarkProps = {
  className?: string;
  mode?: "light" | "dark";
};

export default function LogoMark({ className, mode = "light" }: LogoMarkProps) {
  const isDark = mode === "dark";
  return (
    <div className={className || "h-[100px] relative w-[120px]"} id={isDark ? "node-187_488" : "node-187_487"}>
      {mode === "light" && (
        <div className="absolute h-[75px] left-[10.2px] top-[12.5px] w-[99.609px]" data-node-id="187:460" data-name="Logo mark — light refined">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLogoMarkLightRefined} />
        </div>
      )}
      {isDark && (
        <div className="absolute h-[75px] left-[10.2px] top-[12.5px] w-[99.609px]" data-node-id="187:474" data-name="Logo mark — dark refined">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLogoMarkDarkRefined} />
        </div>
      )}
    </div>
  );
}
