const assetPathPrefix = "../../assets/exports/button-github-login";
const imgGithub = `${assetPathPrefix}/bd05f.svg`;

type ButtonGithubLoginProps = {
  className?: string;
  label?: string;
};

export default function ButtonGithubLogin({ className, label = "Login with GitHub" }: ButtonGithubLoginProps) {
  return (
    <div className={className || "bg-[var(--modes\\/general\\/link,#0a2540)] content-stretch drop-shadow-[0px_2px_4px_rgba(0,0,0,0.1)] flex gap-[12px] items-center px-[24px] py-[14px] relative rounded-[var(--radius\\/surface,8px)]"} data-node-id="429:1795" data-name="button/github-login">
      <div className="relative shrink-0 size-[20px]" data-node-id="429:1792" data-name="github">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGithub} />
      </div>
      <p className="[word-break:break-word] font-['Outfit:Medium'] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[color:var(--modes\/general\\/surface,white)] whitespace-nowrap" data-node-id="429:1794">
        {label}
      </p>
    </div>
  );
}
