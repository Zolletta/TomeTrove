export default function SharedListGridContentHeaderWide({ className }: { className?: string }) {
  return (
    <div className={className || '[word-break:break-word] content-stretch flex font-["Outfit:Bold"] font-bold gap-[16px] items-center leading-[1.5] px-[12px] py-[8px] relative text-[14px] text-[color:var(--modes\/general\/text,black)] w-[1072px]'} data-node-id="539:5032" data-name="shared-list/grid-content-header/wide">
      <p className="flex-[1_0_0] min-w-px relative" data-node-id="539:4803">
        Title
      </p>
      <p className="flex-[1_0_0] min-w-px relative" data-node-id="539:4804">
        Author
      </p>
      <p className="relative shrink-0 w-[100px]" data-node-id="539:4805">
        Language
      </p>
      <p className="relative shrink-0 w-[120px]" data-node-id="539:4806">
        Genre
      </p>
    </div>
  );
}
