type NavigationItemProps = {
  className?: string;
  label?: string;
  state?: "normal" | "hover" | "selected";
};

export default function NavigationItem({ className, label = "Label", state = "normal" }: NavigationItemProps) {
  return (
    <div className={className || "content-stretch flex items-start relative"} id={state === "selected" ? "node-314_909" : state === "hover" ? "node-314_907" : "node-314_905"}>
      {["hover", "selected"].includes(state) && (
        <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--color\/emerald\/600,#1a8f5c)] whitespace-nowrap" data-node-id="314:908">
          {label}
        </p>
      )}
      {state === "normal" && (
        <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="314:906">
          {label}
        </p>
      )}
    </div>
  );
}
