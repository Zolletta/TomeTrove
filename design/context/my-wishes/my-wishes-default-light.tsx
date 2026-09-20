const assetPathPrefix = "../../assets/exports/my-wishes-default-light";
const imgIconSmileyMelting = `${assetPathPrefix}/87827.svg`;
const imgIcon = `${assetPathPrefix}/b98cc.svg`;
const imgStateNormal = `${assetPathPrefix}/eb4d9.svg`;
const imgIconSignOut = `${assetPathPrefix}/6b7f9.svg`;
const imgIconUser = `${assetPathPrefix}/99614.svg`;
const imgIconMoon = `${assetPathPrefix}/4c1fc.svg`;
const imgIconBell = `${assetPathPrefix}/28e77.svg`;
const imgVector1 = `${assetPathPrefix}/78203.svg`;
const imgBadge = `${assetPathPrefix}/67fd2.svg`;

type FooterProps = {
  className?: string;
  mode?: "light";
};

function Footer({ className, mode = "light" }: FooterProps) {
  return (
    <div className={className || "bg-[var(--modes\\/general\\/surface,white)] content-stretch flex gap-[24px] h-[48px] items-center justify-center px-[24px] relative w-[1200px]"} data-node-id="77:10">
      <div className="content-stretch flex gap-[24px] items-start relative shrink-0" data-node-id="317:323" data-name="footer/navigation">
        <div className="content-stretch flex items-start relative shrink-0" data-node-id="I317:323;317:319" data-name="privacy-link">
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I317:323;317:319;314:906">
            Privacy
          </p>
        </div>
        <div className="content-stretch flex items-start relative shrink-0" data-node-id="I317:323;317:321" data-name="license-link">
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I317:323;317:321;314:906">
            License
          </p>
        </div>
      </div>
      <div className="flex-[1_0_0] h-[100px] min-w-px relative" data-node-id="77:13" data-name="spacer" />
      <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="77:14">
        © 2026 TomeTrove
      </p>
      <div className="absolute h-px left-0 right-0 top-0" data-node-id="230:399" style={{ backgroundImage: "linear-gradient(90deg, var(--color\\/coral-500-0,rgba(247, 84, 84, 0)) 0%, var(--color\\/coral\\/500,rgb(247, 84, 84)) 30%, var(--color\\/coral\\/500,rgb(247, 84, 84)) 70%, var(--color\\/coral-500-0,rgba(247, 84, 84, 0)) 100%)" }} data-name="coral-hairline-top" />
    </div>
  );
}

function IconSmileyMelting({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:1036" data-name="icon/smiley-melting">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconSmileyMelting} />
    </div>
  );
}

function DataEmptyList({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[var(--modes\\/general\\/surface,white)] content-stretch flex flex-col items-start p-[24px] relative rounded-[var(--radius\\/surface,8px)] w-[800px]"} data-node-id="341:772" data-name="data/empty-list">
      <div className="content-stretch flex flex-col gap-[8px] items-center justify-center overflow-clip py-[64px] relative shrink-0 w-full" data-node-id="341:773" data-name="empty-state-message">
        <IconSmileyMelting className="relative shrink-0 size-[40px]" />
        <p className="[word-break:break-word] font-['Josefin_Sans:Bold'] font-bold leading-[1.3] relative shrink-0 text-[18px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="341:775">
          Nothing here yet
        </p>
        <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] opacity-60 relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="341:776">
          This list is empty. Items will appear here once added.
        </p>
      </div>
    </div>
  );
}

function ButtonPrimaryImportCsv({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex items-start relative"} data-node-id="603:1664" data-name="button/primary/import-csv">
      <div className="bg-[var(--button\/primary\/normal\/fill,#1a8f5c)] border border-[var(--button\/primary\/normal\/stroke,#1a8f5c)] border-solid content-stretch flex gap-[8px] h-[46px] items-center justify-center px-[16px] py-[10px] relative rounded-[var(--radius\/surface,8px)] shrink-0" data-node-id="603:1660" data-name="button/primary">
        <div className="relative shrink-0 size-[24px]" data-node-id="I603:1660;546:37586" data-name="icon">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon} />
        </div>
        <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/primary\/normal\/text,white)] whitespace-nowrap" data-node-id="I603:1660;185:64">
          Import CSV
        </p>
      </div>
    </div>
  );
}

type ButtonRowMagnifyingGlassProps = {
  className?: string;
  state?: "normal";
};

function ButtonRowMagnifyingGlass({ className, state = "normal" }: ButtonRowMagnifyingGlassProps) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:984">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStateNormal} />
    </div>
  );
}

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
  mode?: "light";
};

function Header({ className, mode = "light" }: HeaderProps) {
  return (
    <div className={className || "bg-[var(--modes\\/general\\/surface,white)] content-stretch flex h-[64px] items-center justify-between px-[24px] relative w-[1200px]"} data-node-id="76:2">
      <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0" data-node-id="76:3" data-name="left-section">
        <div className="h-[28px] relative shrink-0 w-[87.5px]" data-node-id="114:71" data-name="logo/wordmark">
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
        </div>
        <div className="content-stretch flex gap-[24px] items-start relative shrink-0" data-node-id="317:929" data-name="header/navigation">
          <div className="content-stretch flex items-start relative shrink-0" data-node-id="I317:929;317:923" data-name="My Wishes">
            <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--color\/emerald\/600,#1a8f5c)] whitespace-nowrap" data-node-id="I317:929;317:923;314:910">
              My Wishes
            </p>
          </div>
          <div className="content-stretch flex items-start relative shrink-0" data-node-id="I317:929;317:925" data-name="Watchlist">
            <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I317:929;317:925;314:906">
              Watchlist
            </p>
          </div>
          <div className="content-stretch flex items-start relative shrink-0" data-node-id="I317:929;317:927" data-name="Shared Lists">
            <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I317:929;317:927;314:906">
              Shared Lists
            </p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0" data-node-id="76:8" data-name="right-section">
        <div className="content-stretch flex items-center justify-center relative shrink-0 size-[40px]" data-node-id="76:9" data-name="notifications">
          <IconBell className="relative shrink-0 size-[20px]" />
          <div className="absolute left-[22px] size-[16px] top-[4px]" data-node-id="I76:9;73:4" data-name="badge">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBadge} />
          </div>
          <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Outfit:Bold'] font-bold justify-center leading-[0] left-[30px] size-[16px] text-[10px] text-[color:var(--color\/text-on-accent,white)] text-center top-[12px]" data-node-id="I76:9;73:5">
            <p className="leading-[1.2]">3</p>
          </div>
        </div>
        <HeaderButtonThemeToggle className="content-stretch flex items-center justify-between p-[4px] relative shrink-0" />
        <HeaderButtonPersonalArea className="content-stretch flex h-[28px] items-center justify-center p-[4px] relative shrink-0" />
        <HeaderButtonLogout className="content-stretch flex h-[28px] items-center justify-center p-[4px] relative shrink-0" />
      </div>
      <div className="absolute bottom-0 h-px left-0 right-0" data-node-id="230:398" style={{ backgroundImage: "linear-gradient(90deg, var(--color\\/coral-500-0,rgba(247, 84, 84, 0)) 0%, var(--color\\/coral\\/500,rgb(247, 84, 84)) 30%, var(--color\\/coral\\/500,rgb(247, 84, 84)) 70%, var(--color\\/coral-500-0,rgba(247, 84, 84, 0)) 100%)" }} data-name="coral-hairline-bottom" />
    </div>
  );
}

export default function MyWishesDefault() {
  return (
    <div className="bg-[var(--modes\/general\/background,#d0e2f0)] border border-[var(--color\/black,black)] border-solid content-stretch flex flex-col items-center relative size-full" data-node-id="263:879" data-name="my wishes / default">
      <Header className="bg-[var(--modes\/general\/surface,white)] content-stretch flex h-[64px] items-center justify-between px-[24px] relative shrink-0 w-full" />
      <div className="content-stretch flex flex-col gap-[32px] items-center overflow-clip px-[80px] py-[48px] relative shrink-0 w-full" data-node-id="314:814" data-name="content">
        <p className="[word-break:break-word] font-['Josefin_Sans:Bold'] font-bold leading-[1.2] relative shrink-0 text-[32px] text-[color:var(--text\/heading,#1a8f5c)] w-full" data-node-id="314:815">
          My Wishes
        </p>
        <div className="content-stretch flex gap-[16px] items-start overflow-clip relative shrink-0 w-full" data-node-id="453:1068" data-name="add-wish-row">
          <div className="bg-[var(--color\/white,white)] content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip p-[24px] relative rounded-[12px] self-stretch" data-node-id="314:816" data-name="add-wish">
            <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[color:var(--color\/navy\/700,#0a396e)] whitespace-nowrap" data-node-id="314:817">
              Add a wish
            </p>
            <div className="content-stretch flex flex-col h-[40px] items-start relative shrink-0 w-full" data-node-id="314:818" data-name="search-autocomplete">
              <div className="bg-[var(--modes\/general\/background,#d0e2f0)] content-stretch flex gap-[8px] h-[38px] items-center px-[12px] py-[10px] relative rounded-[6px] shrink-0 w-full" data-node-id="I314:818;227:589" data-name="input-field">
                <ButtonRowMagnifyingGlass className="relative shrink-0 size-[16px]" />
                <p className="[word-break:break-word] flex-[1_0_0] font-['Outfit:Regular'] font-normal leading-[1.5] min-w-px relative text-[14px] text-[color:var(--input\/placeholder,#596673)]" data-node-id="I314:818;227:591">
                  Search by title, author, or ISBN...
                </p>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] opacity-60 relative shrink-0 text-[12px] text-[color:var(--color\/navy\/700,#0a396e)] whitespace-nowrap" data-node-id="314:825">
              Start typing to search by title, author, or ISBN
            </p>
          </div>
          <div className="bg-[var(--color\/white,white)] content-stretch flex flex-col gap-[12px] items-center justify-center overflow-clip p-[24px] relative rounded-[12px] self-stretch shrink-0" data-node-id="453:1069" data-name="import-csv-card">
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--color\/slate\/600,#596673)] whitespace-nowrap" data-node-id="453:1070">
              Have a CSV file?
            </p>
            <ButtonPrimaryImportCsv className="content-stretch flex items-start relative shrink-0" />
          </div>
        </div>
        <DataEmptyList className="bg-[var(--modes\/general\/surface,white)] content-stretch flex flex-col items-start p-[24px] relative rounded-[var(--radius\/surface,8px)] shrink-0 w-full" />
      </div>
      <Footer className="bg-[var(--modes\/general\/surface,white)] content-stretch flex gap-[24px] h-[48px] items-center justify-center px-[24px] relative shrink-0 w-full" />
    </div>
  );
}
