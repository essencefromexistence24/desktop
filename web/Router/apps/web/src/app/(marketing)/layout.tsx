import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function MarketingLayout({ children }: Props) {
  return <div>{children}</div>;
}
