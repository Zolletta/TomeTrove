export default function HeaderNavigation({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex gap-[24px] items-start relative"} data-node-id="317:922" data-name="header/navigation">
      <div className="content-stretch flex items-start relative shrink-0" data-node-id="317:923" data-name="My Wishes">
        <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--color\/emerald\/600,#1a8f5c)] whitespace-nowrap" data-node-id="I317:923;314:910">
          My Wishes
        </p>
      </div>
      <div className="content-stretch flex items-start relative shrink-0" data-node-id="317:925" data-name="Watchlist">
        <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I317:925;314:906">
          Watchlist
        </p>
      </div>
      <div className="content-stretch flex items-start relative shrink-0" data-node-id="317:927" data-name="Shared Lists">
        <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I317:927;314:906">
          Shared Lists
        </p>
      </div>
    </div>
  );
}
