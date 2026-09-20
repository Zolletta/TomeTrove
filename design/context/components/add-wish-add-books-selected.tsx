const assetPathPrefix = "../../assets/exports/add-wish-add-books-selected";
const imgStateNormal = `${assetPathPrefix}/eb4d9.svg`;
const imgChevronDown = `${assetPathPrefix}/02016.svg`;
const imgIcon = `${assetPathPrefix}/e63f0.svg`;

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

export default function AddWishAddBooksSelected({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[var(--modes\/general\/surface,white)] content-stretch flex flex-col gap-[24px] items-start p-[24px] relative rounded-[12px] w-[1120px]"} data-node-id="537:4929" data-name="add-wish/add-books/selected">
      <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="420:2009">
        Add Books to Shared List
      </p>
      <div className="content-stretch flex flex-col h-[40px] items-start relative shrink-0 w-full" data-node-id="526:4428" data-name="selected-book-search">
        <div className="bg-[var(--modes\/general\/background,#d0e2f0)] content-stretch flex gap-[8px] h-[38px] items-center px-[12px] py-[10px] relative rounded-[6px] shrink-0 w-full" data-node-id="I526:4428;227:589" data-name="input-field">
          <ButtonRowMagnifyingGlass className="relative shrink-0 size-[16px]" />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Outfit:Regular'] font-normal leading-[1.5] min-w-px relative text-[14px] text-[color:var(--modes\/general\/text,black)]" data-node-id="I526:4428;227:591">
            Dune - Frank Herbert
          </p>
        </div>
      </div>
      <div className="content-stretch flex gap-[16px] items-end relative shrink-0 w-full" data-node-id="420:2013" data-name="list-selection-row">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="420:2094" data-name="new-list-group">
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--input\/field-name,black)] whitespace-nowrap" data-node-id="420:2095">
            New list name
          </p>
          <div className="bg-[var(--color\/white,white)] content-stretch flex items-start overflow-clip px-[12px] py-[8px] relative rounded-[6px] shrink-0 w-full" data-node-id="420:2096" data-name="new-list-input">
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--input\/placeholder,#596673)] whitespace-nowrap" data-node-id="420:2097">
              Enter a name...
            </p>
          </div>
        </div>
        <p className="[word-break:break-word] absolute font-['Outfit:Regular'] font-normal leading-[1.5] left-[474.5px] text-[14px] text-[color:var(--modes\/general\/text,black)] top-[30px] whitespace-nowrap" data-node-id="420:2098">
          or
        </p>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="420:2099" data-name="existing-list-group">
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--input\/field-name,black)] whitespace-nowrap" data-node-id="420:2100">
            Existing list
          </p>
          <div className="bg-[var(--color\/white,white)] border border-[var(--input\/border,#bacfde)] border-solid content-stretch flex items-center justify-between overflow-clip px-[12px] py-[8px] relative rounded-[6px] shrink-0 w-full" data-node-id="420:2101" data-name="existing-list-select">
            <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--input\/placeholder,#596673)] whitespace-nowrap" data-node-id="420:2102">
              Choose a list...
            </p>
            <div className="relative shrink-0 size-[16px]" data-node-id="420:2103" data-name="chevron-down">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronDown} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex items-start relative shrink-0" data-node-id="437:2203" data-name="button/primary/add">
          <div className="bg-[var(--button\/primary\/normal\/fill,#1a8f5c)] border border-[var(--button\/primary\/normal\/stroke,#1a8f5c)] border-solid content-stretch flex gap-[8px] h-[46px] items-center justify-center px-[16px] py-[10px] relative rounded-[var(--radius\/surface,8px)] shrink-0" data-node-id="I437:2203;603:1595" data-name="button/primary">
            <div className="relative shrink-0 size-[24px]" data-node-id="I437:2203;603:1595;546:37586" data-name="icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon} />
            </div>
            <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--button\/primary\/normal\/text,white)] whitespace-nowrap" data-node-id="I437:2203;603:1595;185:64">
              Add
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
