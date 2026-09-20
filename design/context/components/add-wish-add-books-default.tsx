const assetPathPrefix = "../../assets/exports/add-wish-add-books-default";
const imgSearch = `${assetPathPrefix}/8312c.svg`;

export default function AddWishAddBooksDefault({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[var(--modes\/general\/surface,white)] content-stretch flex flex-col gap-[20px] items-start p-[24px] relative rounded-[12px] w-[1120px]"} data-node-id="537:4855" data-name="add-wish/add-books/default">
      <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="414:2038">
        Add Books to Shared List
      </p>
      <div className="content-stretch flex items-end relative shrink-0 w-full" data-node-id="414:2039" data-name="search-and-select-row">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-node-id="414:2040" data-name="search-input-container">
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--input\/placeholder,#596673)] whitespace-nowrap" data-node-id="414:2041">
            Search your wishes
          </p>
          <div className="bg-[var(--modes\/general\/background,#d0e2f0)] content-stretch flex gap-[8px] items-center px-[12px] py-[10px] relative rounded-[6px] shrink-0 w-full" data-node-id="414:2042" data-name="input-field">
            <div className="relative shrink-0 size-[16px]" data-node-id="414:2144" data-name="search">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSearch} />
            </div>
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="414:2044">
              Dune
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
