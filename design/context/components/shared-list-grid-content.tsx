const assetPathPrefix = "../../assets/exports/shared-list-grid-content";
const imgStateNormal = `${assetPathPrefix}/8c47f.svg`;
const imgIconPencilLine = `${assetPathPrefix}/40ca8.svg`;
const imgStateDefault = `${assetPathPrefix}/07b22.svg`;
const imgStateDefault1 = `${assetPathPrefix}/1b9f9.svg`;

function Separator({ className }: { className?: string }) {
  return <div className={className || "h-px relative w-[99px]"} data-node-id="132:298" style={{ backgroundImage: "linear-gradient(90deg, var(--color\\/coral-500-0,rgba(247, 84, 84, 0)) 0%, var(--color\\/coral\\/500,rgb(247, 84, 84)) 30%, var(--color\\/coral\\/500,rgb(247, 84, 84)) 70%, var(--color\\/coral-500-0,rgba(247, 84, 84, 0)) 100%)" }} data-name="separator" />;
}

type ButtonRowTrashProps = {
  className?: string;
  state?: "normal";
};

function ButtonRowTrash({ className, state = "normal" }: ButtonRowTrashProps) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="385:1044">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStateNormal} />
    </div>
  );
}

function IconPencilLine({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="608:982" data-name="icon/pencil-line">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconPencilLine} />
    </div>
  );
}

type ButtonRowPencilLineProps = {
  className?: string;
  state?: "Default";
};

function ButtonRowPencilLine({ className, state = "Default" }: ButtonRowPencilLineProps) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="416:892">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStateDefault} />
    </div>
  );
}

type ButtonRowExternalLinkProps = {
  className?: string;
  state?: "Default";
};

function ButtonRowExternalLink({ className, state = "Default" }: ButtonRowExternalLinkProps) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="429:1879">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStateDefault1} />
    </div>
  );
}

export default function SharedListGridContent({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex flex-col items-start relative w-[800px]"} data-node-id="526:1637" data-name="shared-list/grid-content">
      <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] opacity-60 relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] text-center w-full" data-node-id="526:1638">
        Showing 21–30 of 42 results
      </p>
      <div className="bg-[var(--modes\/rows\/header,#9fbfd6)] content-stretch flex items-center relative shrink-0 w-full" data-node-id="526:1639" data-name="shared-grid-header">
        <div className="[word-break:break-word] content-stretch flex gap-[6px] items-center px-[12px] py-[8px] relative shrink-0 text-[color:var(--color\/emerald\/600,#1a8f5c)] w-[368px] whitespace-nowrap" data-node-id="I526:1639;526:2402" data-name="col-list-name">
          <p className="font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px]" data-node-id="I526:1639;526:2402;341:361">
            List name
          </p>
          <p className="font-['Outfit:Bold'] font-bold leading-[1.2] relative shrink-0 text-[10px]" data-node-id="I526:1639;526:2402;341:362">
            A↓Z
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px px-[12px] py-[8px] relative" data-node-id="I526:1639;526:2403" data-name="col-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I526:1639;526:2403;341:367">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px px-[12px] py-[8px] relative" data-node-id="I526:1639;526:2404" data-name="col-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/link,#0a2540)] whitespace-nowrap" data-node-id="I526:1639;526:2404;341:367">
            Book count
          </p>
        </div>
        <div className="content-stretch flex items-center px-[12px] py-[8px] relative shrink-0 w-[64px]" data-node-id="I526:1639;526:2406" data-name="col-actions">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1639;526:2406;341:370">
            Actions
          </p>
        </div>
      </div>
      <Separator className="h-px relative shrink-0 w-full" />
      <div className="bg-[var(--modes\/rows\/odd,#ecf3f9)] content-stretch flex items-center py-[8px] relative shrink-0 w-full" data-node-id="526:1641" data-name="row-1">
        <div className="content-stretch flex items-center overflow-clip px-[12px] relative shrink-0 w-[368px]" data-node-id="I526:1641;526:1574" data-name="cell-list-name">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1641;526:1575">
            List name
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1641;526:1576" data-name="cell-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1641;526:1577">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1641;526:1578" data-name="cell-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1641;526:1579">
            0 books
          </p>
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="I526:1641;526:1582">
          <div className="content-stretch flex gap-[8px] h-full items-center justify-center overflow-clip relative shrink-0 w-[64px]" data-name="cell-action">
            <ButtonRowExternalLink className="relative shrink-0 size-[16px]" />
            <ButtonRowPencilLine className="relative shrink-0 size-[16px]" />
            <ButtonRowTrash className="relative shrink-0 size-[16px]" />
          </div>
        </div>
      </div>
      <div className="bg-[var(--modes\/rows\/even,#d0e2f0)] content-stretch flex items-center py-[8px] relative shrink-0 w-full" data-node-id="526:1642" data-name="row-2">
        <div className="content-stretch flex items-center overflow-clip px-[12px] relative shrink-0 w-[368px]" data-node-id="I526:1642;526:1585" data-name="cell-list-name">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1642;526:1586">
            List name
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1642;526:1587" data-name="cell-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1642;526:1588">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1642;526:1589" data-name="cell-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1642;526:1590">
            0 books
          </p>
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="I526:1642;526:1593">
          <div className="content-stretch flex gap-[8px] h-full items-center justify-center overflow-clip relative shrink-0 w-[64px]" data-name="cell-action">
            <ButtonRowExternalLink className="relative shrink-0 size-[16px]" />
            <ButtonRowPencilLine className="relative shrink-0 size-[16px]" />
            <ButtonRowTrash className="relative shrink-0 size-[16px]" />
          </div>
        </div>
      </div>
      <div className="bg-[var(--modes\/rows\/odd,#ecf3f9)] content-stretch flex items-center py-[8px] relative shrink-0 w-full" data-node-id="526:1643" data-name="row-3">
        <div className="content-stretch flex items-center overflow-clip px-[12px] relative shrink-0 w-[368px]" data-node-id="I526:1643;526:1574" data-name="cell-list-name">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1643;526:1575">
            List name
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1643;526:1576" data-name="cell-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1643;526:1577">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1643;526:1578" data-name="cell-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1643;526:1579">
            0 books
          </p>
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="I526:1643;526:1582">
          <div className="content-stretch flex gap-[8px] h-full items-center justify-center overflow-clip relative shrink-0 w-[64px]" data-name="cell-action">
            <ButtonRowExternalLink className="relative shrink-0 size-[16px]" />
            <ButtonRowPencilLine className="relative shrink-0 size-[16px]" />
            <ButtonRowTrash className="relative shrink-0 size-[16px]" />
          </div>
        </div>
      </div>
      <div className="bg-[var(--modes\/rows\/even,#d0e2f0)] content-stretch flex items-center py-[8px] relative shrink-0 w-full" data-node-id="526:1644" data-name="row-4">
        <div className="content-stretch flex items-center overflow-clip px-[12px] relative shrink-0 w-[368px]" data-node-id="I526:1644;526:1585" data-name="cell-list-name">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1644;526:1586">
            List name
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1644;526:1587" data-name="cell-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1644;526:1588">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1644;526:1589" data-name="cell-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1644;526:1590">
            0 books
          </p>
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="I526:1644;526:1593">
          <div className="content-stretch flex gap-[8px] h-full items-center justify-center overflow-clip relative shrink-0 w-[64px]" data-name="cell-action">
            <ButtonRowExternalLink className="relative shrink-0 size-[16px]" />
            <ButtonRowPencilLine className="relative shrink-0 size-[16px]" />
            <ButtonRowTrash className="relative shrink-0 size-[16px]" />
          </div>
        </div>
      </div>
      <div className="bg-[var(--modes\/rows\/odd,#ecf3f9)] content-stretch flex items-center py-[8px] relative shrink-0 w-full" data-node-id="526:1645" data-name="row-5">
        <div className="content-stretch flex items-center overflow-clip px-[12px] relative shrink-0 w-[368px]" data-node-id="I526:1645;526:1574" data-name="cell-list-name">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1645;526:1575">
            List name
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1645;526:1576" data-name="cell-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1645;526:1577">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1645;526:1578" data-name="cell-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1645;526:1579">
            0 books
          </p>
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="I526:1645;526:1582">
          <div className="content-stretch flex gap-[8px] h-full items-center justify-center overflow-clip relative shrink-0 w-[64px]" data-name="cell-action">
            <ButtonRowExternalLink className="relative shrink-0 size-[16px]" />
            <ButtonRowPencilLine className="relative shrink-0 size-[16px]" />
            <ButtonRowTrash className="relative shrink-0 size-[16px]" />
          </div>
        </div>
      </div>
      <div className="bg-[var(--modes\/rows\/even,#d0e2f0)] content-stretch flex items-center py-[8px] relative shrink-0 w-full" data-node-id="526:1646" data-name="row-6">
        <div className="content-stretch flex items-center overflow-clip px-[12px] relative shrink-0 w-[368px]" data-node-id="I526:1646;526:1585" data-name="cell-list-name">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1646;526:1586">
            List name
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1646;526:1587" data-name="cell-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1646;526:1588">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1646;526:1589" data-name="cell-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1646;526:1590">
            0 books
          </p>
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="I526:1646;526:1593">
          <div className="content-stretch flex gap-[8px] h-full items-center justify-center overflow-clip relative shrink-0 w-[64px]" data-name="cell-action">
            <ButtonRowExternalLink className="relative shrink-0 size-[16px]" />
            <ButtonRowPencilLine className="relative shrink-0 size-[16px]" />
            <ButtonRowTrash className="relative shrink-0 size-[16px]" />
          </div>
        </div>
      </div>
      <div className="bg-[var(--modes\/rows\/odd,#ecf3f9)] content-stretch flex items-center py-[8px] relative shrink-0 w-full" data-node-id="526:1647" data-name="row-7">
        <div className="content-stretch flex items-center overflow-clip px-[12px] relative shrink-0 w-[368px]" data-node-id="I526:1647;526:1574" data-name="cell-list-name">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1647;526:1575">
            List name
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1647;526:1576" data-name="cell-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1647;526:1577">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1647;526:1578" data-name="cell-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1647;526:1579">
            0 books
          </p>
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="I526:1647;526:1582">
          <div className="content-stretch flex gap-[8px] h-full items-center justify-center overflow-clip relative shrink-0 w-[64px]" data-name="cell-action">
            <ButtonRowExternalLink className="relative shrink-0 size-[16px]" />
            <ButtonRowPencilLine className="relative shrink-0 size-[16px]" />
            <ButtonRowTrash className="relative shrink-0 size-[16px]" />
          </div>
        </div>
      </div>
      <div className="bg-[var(--modes\/rows\/even,#d0e2f0)] content-stretch flex items-center py-[8px] relative shrink-0 w-full" data-node-id="526:1648" data-name="row-8">
        <div className="content-stretch flex items-center overflow-clip px-[12px] relative shrink-0 w-[368px]" data-node-id="I526:1648;526:1585" data-name="cell-list-name">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1648;526:1586">
            List name
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1648;526:1587" data-name="cell-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1648;526:1588">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1648;526:1589" data-name="cell-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1648;526:1590">
            0 books
          </p>
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="I526:1648;526:1593">
          <div className="content-stretch flex gap-[8px] h-full items-center justify-center overflow-clip relative shrink-0 w-[64px]" data-name="cell-action">
            <ButtonRowExternalLink className="relative shrink-0 size-[16px]" />
            <ButtonRowPencilLine className="relative shrink-0 size-[16px]" />
            <ButtonRowTrash className="relative shrink-0 size-[16px]" />
          </div>
        </div>
      </div>
      <div className="bg-[var(--modes\/rows\/odd,#ecf3f9)] content-stretch flex items-center py-[8px] relative shrink-0 w-full" data-node-id="526:1649" data-name="row-9">
        <div className="content-stretch flex items-center overflow-clip px-[12px] relative shrink-0 w-[368px]" data-node-id="I526:1649;526:1574" data-name="cell-list-name">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1649;526:1575">
            List name
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1649;526:1576" data-name="cell-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1649;526:1577">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1649;526:1578" data-name="cell-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1649;526:1579">
            0 books
          </p>
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="I526:1649;526:1582">
          <div className="content-stretch flex gap-[8px] h-full items-center justify-center overflow-clip relative shrink-0 w-[64px]" data-name="cell-action">
            <ButtonRowExternalLink className="relative shrink-0 size-[16px]" />
            <ButtonRowPencilLine className="relative shrink-0 size-[16px]" />
            <ButtonRowTrash className="relative shrink-0 size-[16px]" />
          </div>
        </div>
      </div>
      <div className="bg-[var(--modes\/rows\/even,#d0e2f0)] content-stretch flex items-center py-[8px] relative shrink-0 w-full" data-node-id="526:1650" data-name="row-10">
        <div className="content-stretch flex items-center overflow-clip px-[12px] relative shrink-0 w-[368px]" data-node-id="I526:1650;526:1585" data-name="cell-list-name">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1650;526:1586">
            List name
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1650;526:1587" data-name="cell-expiration-date">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1650;526:1588">
            Expiration date
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip px-[12px] relative" data-node-id="I526:1650;526:1589" data-name="cell-book-count">
          <p className="[word-break:break-word] font-['Outfit:Regular'] font-normal leading-[1.5] relative shrink-0 text-[12px] text-[color:var(--modes\/general\/text,black)] whitespace-nowrap" data-node-id="I526:1650;526:1590">
            0 books
          </p>
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="I526:1650;526:1593">
          <div className="content-stretch flex gap-[8px] h-full items-center justify-center overflow-clip relative shrink-0 w-[64px]" data-name="cell-action">
            <ButtonRowExternalLink className="relative shrink-0 size-[16px]" />
            <ButtonRowPencilLine className="relative shrink-0 size-[16px]" />
            <ButtonRowTrash className="relative shrink-0 size-[16px]" />
          </div>
        </div>
      </div>
      <Separator className="h-px relative shrink-0 w-full" />
    </div>
  );
}
