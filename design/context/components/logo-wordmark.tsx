const assetPathPrefix = "../../assets/exports/logo-wordmark";
const imgVector1 = `${assetPathPrefix}/c2d52.svg`;

type LogoWordmarkProps = {
  className?: string;
  mode?: "light" | "dark";
};

export default function LogoWordmark({ className, mode = "light" }: LogoWordmarkProps) {
  const isDark = mode === "dark";
  const isLight = mode === "light";
  return (
    <div className={className || "h-[80px] relative w-[250px]"} id={isDark ? "node-187_499" : "node-187_498"}>
      {isLight && (
        <>
          <div className="absolute content-stretch flex h-[42px] items-start left-[5.5px] overflow-clip rounded-[var(--radius\/surface,8px)] top-[10px] w-[239px]" data-node-id="187:491" data-name="Wordmark — light">
            <p className="[word-break:break-word] font-['Josefin_Sans:Bold'] font-bold leading-[0] relative shrink-0 text-[0px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="187:492">
              <span className="leading-[1.15] text-[48px]">Tome</span>
              <span className="leading-[1.15] text-[#1a8f5c] text-[48px]">Trove</span>
            </p>
          </div>
          <div className="absolute h-[9.62px] left-[15.5px] top-[57px] w-[208.364px]" data-node-id="187:493">
            <div className="absolute inset-[-11.44%_0_-13.33%_-0.68%]">
              <img alt="" className="block max-w-none size-full" src={imgVector1} />
            </div>
          </div>
        </>
      )}
      {isDark && (
        <>
          <div className="absolute content-stretch flex h-[42px] items-start left-[5.5px] overflow-clip rounded-[var(--radius\/surface,8px)] top-[10px] w-[239px]" data-node-id="187:495" data-name="Wordmark — dark">
            <p className="[word-break:break-word] font-['Josefin_Sans:Bold'] font-bold leading-[0] relative shrink-0 text-[0px] text-[color:var(--modes\/general\/background,#d0e2f0)] whitespace-nowrap" data-node-id="187:496">
              <span className="leading-[1.15] text-[48px]">Tome</span>
              <span className="leading-[1.15] text-[#1a8f5c] text-[48px]">Trove</span>
            </p>
          </div>
          <div className="absolute h-[9.62px] left-[15.5px] top-[57px] w-[208.364px]" data-node-id="187:497">
            <div className="absolute inset-[-11.44%_0_-13.33%_-0.68%]">
              <img alt="" className="block max-w-none size-full" src={imgVector1} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
