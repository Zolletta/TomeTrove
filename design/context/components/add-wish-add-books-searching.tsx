const assetPathPrefix = "../../assets/exports/add-wish-add-books-searching";
const imgStateNormal = `${assetPathPrefix}/eb4d9.svg`;
const imgLine = `${assetPathPrefix}/9b292.svg`;

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

function AutocompleteComposite({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex flex-col gap-[4px] h-[168px] items-start relative w-[1072px]"} data-node-id="542:2212" data-name="autocomplete/composite">
      <div className="content-stretch flex flex-col h-[38px] items-start relative shrink-0 w-full" data-node-id="253:823" data-name="autocomplete/search-field">
        <div className="bg-[var(--modes\/general\/background,#d0e2f0)] content-stretch flex gap-[8px] h-[38px] items-center px-[12px] py-[10px] relative rounded-[6px] shrink-0 w-full" data-node-id="I253:823;227:589" data-name="input-field">
          <ButtonRowMagnifyingGlass className="relative shrink-0 size-[16px]" />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Outfit:Regular'] font-normal leading-[1.5] min-w-px relative text-[14px] text-[color:var(--input\/placeholder,#596673)]" data-node-id="I253:823;227:591">
            Dune
          </p>
        </div>
      </div>
      <div className="bg-[var(--color\/white,white)] border border-[var(--input\/border,#bacfde)] border-solid content-stretch flex flex-col h-[126px] items-start overflow-clip relative rounded-[8px] shadow-[0px_4px_16px_0px_var(--drop-shadow,rgba(0,0,0,0.1))] shrink-0 w-full" data-node-id="253:830" data-name="autocomplete/dropdown-panel">
        <div className="bg-[var(--modes\/select\/drop-down\/selected\/background,#baddce)] content-stretch flex items-center px-[16px] py-[12px] relative shrink-0 w-full" data-node-id="I253:830;542:2196" data-name="autocomplete-row-1">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Outfit:Regular'] font-normal leading-[0] min-w-px relative text-[14px] text-[color:var(--modes\/general\/text,black)]" data-node-id="I253:830;542:2197">
            <span className="font-['Outfit:Bold'] font-bold leading-[normal] text-black">Dune</span>
            <span className="leading-[normal] text-black">{` - Frank Herbert`}</span>
          </p>
        </div>
        <div className="h-0 relative shrink-0 w-full" data-node-id="I253:830;542:2198" data-name="Line">
          <div className="absolute inset-[-1px_0_0_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine} />
          </div>
        </div>
        <div className="bg-[var(--modes\/select\/drop-down\/unselected\/background,#ecf3f9)] content-stretch flex items-center px-[16px] py-[12px] relative shrink-0 w-full" data-node-id="I253:830;542:2199" data-name="autocomplete-row-2">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Outfit:Regular'] font-normal leading-[0] min-w-px relative text-[14px] text-[color:var(--modes\/general\/text,black)]" data-node-id="I253:830;542:2200">
            <span className="font-['Outfit:Bold'] font-bold leading-[normal] text-black">Dune Messiah</span>
            <span className="leading-[normal] text-black">{` - Frank Herbert`}</span>
          </p>
        </div>
        <div className="h-0 relative shrink-0 w-full" data-node-id="I253:830;542:2201" data-name="Line">
          <div className="absolute inset-[-1px_0_0_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine} />
          </div>
        </div>
        <div className="bg-[var(--modes\/select\/drop-down\/unselected\/background,#ecf3f9)] content-stretch flex items-center px-[16px] py-[12px] relative shrink-0 w-full" data-node-id="I253:830;542:2202" data-name="autocomplete-row-3">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Outfit:Regular'] font-normal leading-[0] min-w-px relative text-[14px] text-[color:var(--modes\/general\/text,black)]" data-node-id="I253:830;542:2203">
            <span className="font-['Outfit:Bold'] font-bold leading-[normal] text-black">Children of Dune</span>
            <span className="leading-[normal] text-black">{` - Frank Herbert`}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AddWishAddBooksSearching({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[var(--modes\\/general\\/surface,white)] content-stretch flex flex-col gap-[20px] items-start p-[24px] relative rounded-[12px] w-[1120px]"} data-node-id="537:4910" data-name="add-wish/add-books/searching">
      <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[color:var(--modes\/general\\/text,black)] whitespace-nowrap" data-node-id="420:1888">
        Add Books to Shared List
      </p>
      <div className="content-stretch flex items-end relative shrink-0 w-full" data-node-id="420:1889" data-name="search-and-select-row">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-node-id="420:1890" data-name="search-input-container">
          <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[14px] text-[color:var(--input\/placeholder,#596673)] whitespace-nowrap" data-node-id="420:1891">
            Search your wishes
          </p>
          <AutocompleteComposite className="content-stretch flex flex-col gap-[4px] h-[168px] items-start relative shrink-0 w-[1072px]" />
        </div>
      </div>
    </div>
  );
}
