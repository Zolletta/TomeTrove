const assetPathPrefix = "../../assets/exports/notifications";
const imgIconBell = `${assetPathPrefix}/28e77.svg`;
const imgBadge = `${assetPathPrefix}/67fd2.svg`;

function IconBell({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:988" data-name="icon/bell">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconBell} />
    </div>
  );
}

type NotificationsProps = {
  className?: string;
  state?: "Default" | "Hover";
};

export default function Notifications({ className, state = "Default" }: NotificationsProps) {
  const isHover = state === "Hover";
  return (
    <div className={className || "content-stretch flex items-center justify-center relative size-[40px]"} id={isHover ? "node-247_853" : "node-73_2"}>
      <IconBell className="relative shrink-0 size-[20px]" />
      <div className="absolute left-[22px] size-[16px] top-[4px]" id={isHover ? "node-247_855" : "node-73_4"} data-name="badge">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBadge} />
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Outfit:Bold'] font-bold justify-center leading-[0] left-[30px] size-[16px] text-[10px] text-[color:var(--color\/text-on-accent,white)] text-center top-[12px]" id={isHover ? "node-247_856" : "node-73_5"}>
        <p className="leading-[1.2]">3</p>
      </div>
    </div>
  );
}
