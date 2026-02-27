import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function I(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props} />;
}

export const HomeIcon = (p: IconProps) => <I {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></I>;
export const FlameIcon = (p: IconProps) => <I {...p}><path d="M12 3c2 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-4 4-8z"/></I>;
export const LabIcon = (p: IconProps) => <I {...p}><path d="M9 3v5l-5 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3"/><path d="M8 13h8"/></I>;
export const ChatIcon = (p: IconProps) => <I {...p}><path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z"/></I>;
export const NewsIcon = (p: IconProps) => <I {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></I>;
export const ProteinIcon = (p: IconProps) => <I {...p}><rect x="8" y="4" width="8" height="16" rx="2"/><path d="M9 8h6"/></I>;
export const AminoIcon = (p: IconProps) => <I {...p}><path d="M12 3v18"/><path d="M5 12h14"/><path d="M7 7l10 10"/><path d="M17 7L7 17"/></I>;
export const GainerIcon = (p: IconProps) => <I {...p}><path d="M4 14h16"/><path d="M7 14V9"/><path d="M17 14V9"/><path d="M10 9h4"/></I>;
export const PrebioIcon = (p: IconProps) => <I {...p}><circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="12" cy="16" r="2"/><path d="M10 9.5 11 14M14 9.5 13 14"/></I>;
export const VitIcon = (p: IconProps) => <I {...p}><rect x="4" y="7" width="16" height="10" rx="5"/><path d="M12 7v10"/></I>;
export const JointsIcon = (p: IconProps) => <I {...p}><path d="M8 7a3 3 0 1 1 0 6l2 2a3 3 0 1 0 4 0l2-2a3 3 0 1 1 0-6"/></I>;
export const AccessoriesIcon = (p: IconProps) => <I {...p}><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></I>;
export const FilterIcon = (p: IconProps) => <I {...p}><path d="M4 6h16M7 12h10M10 18h4"/></I>;
export const GlobeIcon = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></I>;
export const PriceIcon = (p: IconProps) => <I {...p}><path d="M20 12h-8"/><path d="M8 12H4"/><circle cx="10" cy="12" r="2"/></I>;
export const CartIcon = (p: IconProps) => <I {...p}><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.4 10h10.8L21 7H7"/></I>;
