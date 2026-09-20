const assetPathPrefix = "../../assets/exports/logo-full";
const imgLogoMarkLightRefined = `${assetPathPrefix}/c77c7.svg`;
const imgVector1 = `${assetPathPrefix}/c2d52.svg`;
const imgLogoMarkDarkRefined = `${assetPathPrefix}/8100f.svg`;

type LogoFullProps = {
  className?: string;
  mode?: "light" | "dark";
};

export default function LogoFull({ className, mode = "light" }: LogoFullProps) {
  const isDark = mode === "dark";
  const isLight = mode === "light";
  return (
    <div className={className || "h-[100px] relative w-[380px]"} id={isDark ? "node-187_457" : "node-187_456"}>
      <div className="absolute h-[100px] left-0 top-0 w-[120px]" id={isDark ? "node-542_4668" : "node-542_4650"} data-name="logo/mark">
        {isLight && (
          <div className="absolute h-[75px] left-[10.2px] top-[12.5px] w-[99.609px]" data-node-id="I542:4650;187:460" data-name="Logo mark — light refined">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLogoMarkLightRefined} />
          </div>
        )}
        {isDark && (
          <div className="absolute h-[75px] left-[10.2px] top-[12.5px] w-[99.609px]" data-node-id="I542:4668;187:474" data-name="Logo mark — dark refined">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLogoMarkDarkRefined} />
          </div>
        )}
      </div>
      <div className="absolute h-[80px] left-[120px] top-[14px] w-[250px]" id={isDark ? "node-542_4682" : "node-542_4664"} data-name="logo/wordmark">
        {isLight && (
          <>
            <div className="absolute content-stretch flex h-[42px] items-start left-[5.5px] overflow-clip rounded-[var(--radius\/surface,8px)] top-[10px] w-[239px]" data-node-id="I542:4664;187:491" data-name="Wordmark — light">
              <p className="[word-break:break-word] font-['Josefin_Sans:Bold'] font-bold leading-[0] relative shrink-0 text-[0px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I542:4664;187:492">
                <span className="leading-[1.15] text-[48px]">Tome</span>
                <span className="leading-[1.15] text-[#1a8f5c] text-[48px]">Trove</span>
              </p>
            </div>
            <div className="absolute h-[9.62px] left-[15.5px] top-[57px] w-[208.364px]" data-node-id="I542:4664;187:493">
              <div className="absolute inset-[-11.44%_0_-13.33%_-0.68%]">
                <img alt="" className="block max-w-none size-full" src={imgVector1} />
              </div>
            </div>
          </>
        )}
        {isDark && (
          <>
            <div className="absolute content-stretch flex h-[42px] items-start left-[5.5px] overflow-clip rounded-[var(--radius\/surface,8px)] top-[10px] w-[239px]" data-node-id="I542:4682;187:495" data-name="Wordmark — dark">
              <p className="[word-break:break-word] font-['Josefin_Sans:Bold'] font-bold leading-[0] relative shrink-0 text-[0px] text-[color:var(--modes\/general\/background,#d0e2f0)] whitespace-nowrap" data-node-id="I542:4682;187:496">
                <span className="leading-[1.15] text-[48px]">Tome</span>
                <span className="leading-[1.15] text-[#1a8f5c] text-[48px]">Trove</span>
              </p>
            </div>
            <div className="absolute h-[9.62px] left-[15.5px] top-[57px] w-[208.364px]" data-node-id="I542:4682;187:497">
              <div className="absolute inset-[-11.44%_0_-13.33%_-0.68%]">
                <img alt="" className="block max-w-none size-full" src={imgVector1} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
