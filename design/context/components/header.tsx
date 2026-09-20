const assetPathPrefix = "../../assets/exports/header";
const imgIconSignOut = `${assetPathPrefix}/6b7f9.svg`;
const imgIconUser = `${assetPathPrefix}/99614.svg`;
const imgIconMoon = `${assetPathPrefix}/4c1fc.svg`;
const imgIconBell = `${assetPathPrefix}/28e77.svg`;
const imgVector1 = `${assetPathPrefix}/78203.svg`;
const imgBadge = `${assetPathPrefix}/67fd2.svg`;
const imgIconBell1 = `${assetPathPrefix}/ddad9.svg`;
const imgIconSun = `${assetPathPrefix}/01a24.svg`;
const imgIconUser1 = `${assetPathPrefix}/064ef.svg`;
const imgIconSignOut1 = `${assetPathPrefix}/d87b5.svg`;

function IconSignOut({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:992" data-name="icon/sign-out">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconSignOut} />
    </div>
  );
}

type HeaderButtonLogoutProps = {
  className?: string;
  state?: "Default";
};

function HeaderButtonLogout({ className, state = "Default" }: HeaderButtonLogoutProps) {
  return (
    <div className={className || "content-stretch flex h-[28px] items-center justify-center p-[4px] relative"} data-node-id="187:694">
      <IconSignOut className="relative shrink-0 size-[20px]" />
    </div>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:1020" data-name="icon/user">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconUser} />
    </div>
  );
}

type HeaderButtonPersonalAreaProps = {
  className?: string;
  state?: "Default";
};

function HeaderButtonPersonalArea({ className, state = "Default" }: HeaderButtonPersonalAreaProps) {
  return (
    <div className={className || "content-stretch flex h-[28px] items-center justify-center p-[4px] relative"} data-node-id="187:689">
      <IconUser className="relative shrink-0 size-[20px]" />
    </div>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:980" data-name="icon/moon">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconMoon} />
    </div>
  );
}

type HeaderButtonThemeToggleProps = {
  className?: string;
  mode?: "light";
  state?: "Default";
};

function HeaderButtonThemeToggle({ className, mode = "light", state = "Default" }: HeaderButtonThemeToggleProps) {
  return (
    <div className={className || "content-stretch flex items-center justify-between p-[4px] relative"} data-node-id="246:893">
      <IconMoon className="relative shrink-0 size-[20px]" />
    </div>
  );
}

function IconBell({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:988" data-name="icon/bell">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconBell} />
    </div>
  );
}

type HeaderProps = {
  className?: string;
  mode?: "light" | "dark";
};

export default function Header({ className, mode = "light" }: HeaderProps) {
  const isDark = mode === "dark";
  const isLight = mode === "light";
  return (
    <div className={className || `content-stretch flex h-[64px] items-center justify-between px-[24px] relative w-[1200px] ${isDark ? String.raw`bg-[var(--modes\/general\/surface,#0a396e)]` : String.raw`bg-[var(--modes\/general\/surface,white)]`}`} id={isDark ? "node-187_744" : "node-76_2"}>
      <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0" id={isDark ? "node-187_745" : "node-76_3"} data-name="left-section">
        <div className="h-[28px] relative shrink-0 w-[87.5px]" id={isDark ? "node-187_746" : "node-114_71"} data-name="logo/wordmark">
          {isLight && (
            <>
              <div className="absolute content-stretch flex h-[14.7px] items-start left-[1.92px] overflow-clip rounded-[8px] top-[3.5px] w-[83.65px]" data-node-id="I114:71;114:11" data-name="Wordmark — light">
                <p className="[word-break:break-word] font-['Josefin_Sans:Bold'] font-bold leading-[0] relative shrink-0 text-[0px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I114:71;114:12">
                  <span className="leading-[1.4] text-[5.6px]">Tome</span>
                  <span className="leading-[1.4] text-[#1a8f5c] text-[5.6px]">Trove</span>
                </p>
              </div>
              <div className="absolute h-[3.367px] left-[5.42px] top-[19.95px] w-[72.927px]" data-node-id="I114:71;114:13">
                <div className="absolute inset-[-11.44%_0_-13.33%_-0.67%]">
                  <img alt="" className="block max-w-none size-full" src={imgVector1} />
                </div>
              </div>
            </>
          )}
          {isDark && (
            <>
              <div className="absolute content-stretch flex h-[14.7px] items-start left-[1.92px] overflow-clip rounded-[var(--radius\/surface,2.8px)] top-[3.5px] w-[83.65px]" data-node-id="I187:746;187:495" data-name="Wordmark — dark">
                <p className="[word-break:break-word] font-['Josefin_Sans:Bold'] font-bold leading-[0] relative shrink-0 text-[0px] text-[color:var(--modes\/general\/background,#0a2540)] whitespace-nowrap" data-node-id="I187:746;187:496">
                  <span className="leading-[1.4] text-[5.6px]">Tome</span>
                  <span className="leading-[1.4] text-[#1a8f5c] text-[5.6px]">Trove</span>
                </p>
              </div>
              <div className="absolute h-[3.367px] left-[5.42px] top-[19.95px] w-[72.927px]" data-node-id="I187:746;187:497">
                <div className="absolute inset-[-11.44%_0_-13.33%_-0.67%]">
                  <img alt="" className="block max-w-none size-full" src={imgVector1} />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="content-stretch flex gap-[24px] items-start relative shrink-0" id={isDark ? "node-317_936" : "node-317_929"} data-name="header/navigation">
          <div className="content-stretch flex items-start relative shrink-0" id={isDark ? "node-I317_936-317_923" : "node-I317_929-317_923"} data-name="My Wishes">
            <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--color\/emerald\/600,#1a8f5c)] whitespace-nowrap" id={isDark ? "node-I317_936-317_923-314_910" : "node-I317_929-317_923-314_910"}>
              My Wishes
            </p>
          </div>
          <div className="content-stretch flex items-start relative shrink-0" id={isDark ? "node-I317_936-317_925" : "node-I317_929-317_925"} data-name="Watchlist">
            <p className={`[word-break:break-word] font-["Outfit:Medium"] font-medium leading-[1.5] relative shrink-0 text-[14px] whitespace-nowrap ${isDark ? String.raw`text-[color:var(--modes\/general\/text,white)]` : String.raw`text-[color:var(--modes\/general\/text,black)]`}`} id={isDark ? "node-I317_936-317_925-314_906" : "node-I317_929-317_925-314_906"}>
              Watchlist
            </p>
          </div>
          <div className="content-stretch flex items-start relative shrink-0" id={isDark ? "node-I317_936-317_927" : "node-I317_929-317_927"} data-name="Shared Lists">
            <p className={`[word-break:break-word] font-["Outfit:Medium"] font-medium leading-[1.5] relative shrink-0 text-[14px] whitespace-nowrap ${isDark ? String.raw`text-[color:var(--modes\/general\/text,white)]` : String.raw`text-[color:var(--modes\/general\/text,black)]`}`} id={isDark ? "node-I317_936-317_927-314_906" : "node-I317_929-317_927-314_906"}>
              Shared Lists
            </p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0" id={isDark ? "node-187_747" : "node-76_8"} data-name="right-section">
        <div className="content-stretch flex items-center justify-center relative shrink-0 size-[40px]" id={isDark ? "node-187_748" : "node-76_9"} data-name="notifications">
          {isLight && (
            <>
              <IconBell className="relative shrink-0 size-[20px]" />
              <div className="absolute left-[22px] size-[16px] top-[4px]" data-node-id="I76:9;73:4" data-name="badge">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBadge} />
              </div>
              <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Outfit:Bold'] font-bold justify-center leading-[0] left-[30px] size-[16px] text-[10px] text-[color:var(--color\/text-on-accent,white)] text-center top-[12px]" data-node-id="I76:9;73:5">
                <p className="leading-[1.2]">3</p>
              </div>
            </>
          )}
          {isDark && (
            <>
              <div className="relative shrink-0 size-[20px]" data-node-id="I187:748;405:2092" data-name="icon/bell">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconBell1} />
              </div>
              <div className="absolute left-[22px] size-[16px] top-[4px]" data-node-id="I187:748;73:4" data-name="badge">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBadge} />
              </div>
              <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Outfit:Bold'] font-bold justify-center leading-[0] left-[30px] size-[16px] text-[10px] text-[color:var(--color\/text-on-accent,white)] text-center top-[12px]" data-node-id="I187:748;73:5">
                <p className="leading-[1.2]">3</p>
              </div>
            </>
          )}
        </div>
        {isLight && (
          <>
            <HeaderButtonThemeToggle className="content-stretch flex items-center justify-between p-[4px] relative shrink-0" />
            <HeaderButtonPersonalArea className="content-stretch flex h-[28px] items-center justify-center p-[4px] relative shrink-0" />
            <HeaderButtonLogout className="content-stretch flex h-[28px] items-center justify-center p-[4px] relative shrink-0" />
          </>
        )}
        {isDark && (
          <>
            <div className="content-stretch flex items-center justify-between p-[4px] relative rounded-[var(--radius\/surface,8px)] shrink-0" data-node-id="187:749" data-name="theme-toggle-dark">
              <div className="relative shrink-0 size-[20px]" data-node-id="I187:749;383:2509" data-name="icon/sun">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconSun} />
              </div>
            </div>
            <div className="content-stretch flex h-[28px] items-center justify-center p-[4px] relative shrink-0" data-node-id="187:750" data-name="header/button/personal-area">
              <div className="relative shrink-0 size-[20px]" data-node-id="I187:750;405:2096" data-name="icon/user">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconUser1} />
              </div>
            </div>
            <div className="content-stretch flex h-[28px] items-center justify-center p-[4px] relative shrink-0" data-node-id="187:751" data-name="header/button/logout">
              <div className="relative shrink-0 size-[20px]" data-node-id="I187:751;405:2100" data-name="icon/sign-out">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconSignOut1} />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="absolute bottom-0 h-px left-0 right-0" id={isDark ? "node-245_2143" : "node-230_398"} style={{ backgroundImage: "linear-gradient(90deg, var(--color\\/coral-500-0,rgba(247, 84, 84, 0)) 0%, var(--color\\/coral\\/500,rgb(247, 84, 84)) 30%, var(--color\\/coral\\/500,rgb(247, 84, 84)) 70%, var(--color\\/coral-500-0,rgba(247, 84, 84, 0)) 100%)" }} data-name="coral-hairline-bottom" />
    </div>
  );
}
