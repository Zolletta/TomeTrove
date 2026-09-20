const assetPathPrefix = "../../assets/exports/notification";
const imgIconTrash = `${assetPathPrefix}/a6159.svg`;
const imgIconBell = `${assetPathPrefix}/28e77.svg`;
const imgIconCheck = `${assetPathPrefix}/62733.svg`;
const imgIconCheck1 = `${assetPathPrefix}/bd567.svg`;
const imgIconBell1 = `${assetPathPrefix}/372e7.svg`;
const imgIconTrash1 = `${assetPathPrefix}/91041.svg`;

function IconTrash({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="489:4562" data-name="icon/trash">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconTrash} />
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

function IconCheck({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:1016" data-name="icon/check">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconCheck} />
    </div>
  );
}

type NotificationProps = {
  className?: string;
  mode?: "Light" | "Dark";
  type?: "success" | "info" | "warning";
};

export default function Notification({ className, mode = "Light", type = "success" }: NotificationProps) {
  const isInfoAndDark = type === "info" && mode === "Dark";
  const isInfoAndLight = type === "info" && mode === "Light";
  const isSuccessAndDark = type === "success" && mode === "Dark";
  const isSuccessAndLight = type === "success" && mode === "Light";
  const isWarningAndDark = type === "warning" && mode === "Dark";
  const isWarningAndLight = type === "warning" && mode === "Light";
  return (
    <div className={className || `${String.raw`border border-solid content-stretch flex gap-[12px] items-center overflow-clip px-[16px] py-[12px] relative rounded-[var(--radius\/surface,8px)] `}${isWarningAndDark ? String.raw`bg-[var(--modes\/general\/surface,#0a396e)] border-[var(--alert\/warning,#d68e15)]` : isWarningAndLight ? String.raw`bg-[var(--modes\/general\/surface,white)] border-[var(--alert\/warning,#d68e15)]` : isInfoAndDark ? String.raw`bg-[var(--button\/secondary\/normal\/fill,#d0e2f0)] border-[var(--button\/secondary\/normal\/stroke,#0a396e)] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)]` : isInfoAndLight ? String.raw`bg-[var(--modes\/general\/surface,white)] border-[var(--color\/navy\/700,#0a396e)] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)]` : isSuccessAndDark ? String.raw`bg-[var(--modes\/general\/surface,#0a396e)] border-[var(--color\/emerald\/600,#1a8f5c)] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)]` : String.raw`bg-[var(--modes\/general\/surface,white)] border-[var(--color\/emerald\/600,#1a8f5c)] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)]`]}`} id={isWarningAndDark ? "node-576_46309" : isWarningAndLight ? "node-317_1024" : isInfoAndDark ? "node-576_46305" : isInfoAndLight ? "node-317_1018" : isSuccessAndDark ? "node-576_46301" : "node-317_1012"}>
      <div className={`absolute bottom-[-1px] left-[-1px] top-[-1px] w-[8px] ${type === "warning" ? String.raw`bg-[var(--alert\/warning,#d68e15)]` : isInfoAndDark ? String.raw`bg-[var(--button\/secondary\/normal\/text,#0a396e)]` : isInfoAndLight ? String.raw`bg-[var(--color\/navy\/700,#0a396e)]` : String.raw`bg-[var(--color\/emerald\/600,#1a8f5c)]`]}`} id={isWarningAndDark ? "node-576_46310" : isWarningAndLight ? "node-317_1025" : isInfoAndDark ? "node-576_46306" : isInfoAndLight ? "node-317_1019" : isSuccessAndDark ? "node-576_46302" : "node-317_1013"} data-name="accent" />
      {isSuccessAndLight && (
        <>
          <IconCheck className="relative shrink-0 size-[16px]" />
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="317:1014">
            Saved
          </p>
        </>
      )}
      {isSuccessAndDark && (
        <>
          <div className="relative shrink-0 size-[16px]" data-node-id="576:46303" data-name="icon/check">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconCheck1} />
          </div>
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,white)] whitespace-nowrap" data-node-id="576:46304">
            Saved
          </p>
        </>
      )}
      {isInfoAndLight && (
        <>
          <IconBell className="relative shrink-0 size-[16px]" />
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="317:1020">
            Welcome back!
          </p>
        </>
      )}
      {isInfoAndDark && (
        <>
          <div className="relative shrink-0 size-[16px]" data-node-id="576:46307" data-name="icon/bell">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconBell1} />
          </div>
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/secondary\/normal\/text,#0a396e)] whitespace-nowrap" data-node-id="576:46308">
            Welcome back!
          </p>
        </>
      )}
      {isWarningAndLight && (
        <>
          <IconTrash className="relative shrink-0 size-[24px]" />
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="317:1026">
            Session expiring soon
          </p>
        </>
      )}
      {isWarningAndDark && (
        <>
          <div className="relative shrink-0 size-[24px]" data-node-id="576:46311" data-name="icon/trash">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconTrash1} />
          </div>
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,white)] whitespace-nowrap" data-node-id="576:46312">
            Session expiring soon
          </p>
        </>
      )}
    </div>
  );
}
