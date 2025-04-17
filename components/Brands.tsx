export const ManifoldMarketLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth={0.6}
    aria-hidden="true"
    className="h-10 w-10 shrink-0 stroke-indigo-700 transition-transform group-hover:rotate-12 dark:stroke-white"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.249 17.095 18.718 6.803 14.344 20M5.25 17.095l4.547 1.453M5.25 17.095 4.274 6.528M14.344 20l-4.548-1.452M14.344 20 22 12.638l-5.607 1.177m-6.597 4.733 2.6-3.481m-8.122-8.54 5.797 6.862M4.274 6.528 2 9.082l2.474-.226m8.471 2.304L10.971 5l-2.317 6.661"
    />
  </svg>
);

export const KalshiLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={20}
    viewBox="-4 -4 25 29"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M.417.022h4.322v8.972l8.08-8.972h5.24l-7.412 8.224L18.538 20h-5.177L7.599 11.57l-2.86 3.177V20H.417V.022Z"
    />
  </svg>
);

export const PolymarketLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={28}
    viewBox="0 0 23 28"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M22.954 27.799V.2l-.24.068L.856 6.425l-.138.04v15.07l.138.04 22.099 6.224ZM20.46 12.018 5.288 7.745 20.46 3.47v8.547ZM3.212 18.273V9.727L18.382 14l-15.17 4.273Zm17.248 6.256L5.288 20.256l15.172-4.274v8.547Z"
      clipRule="evenodd"
    />
  </svg>
);

export const brands = {
  manifold: ManifoldMarketLogo,
  kalshi: KalshiLogo,
  polymarket: PolymarketLogo,
};

export const brandColors = {
  manifold: "text-[#4338ca] bg-[#4338ca]/10",
  kalshi: "text-[#00b478] bg-[#00b478]/10",
  polymarket: "text-[#1652f0] bg-[#1652f0]/10",
};
