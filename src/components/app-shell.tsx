"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

const tabs = [
  { href: "/", label: "홈" },
  { href: "/record", label: "꿈 기록" },
  { href: "/report", label: "내 리포트" },
  { href: "/archive", label: "보관함" }
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div aria-hidden="true" className="brand-lockup__mark" />
          <div>
            <p className="brand-lockup__eyebrow">Dream journal</p>
            <h1 className="brand-lockup__wordmark">dreamfold</h1>
          </div>
        </div>

        <nav className="primary-nav" aria-label="Main navigation">
          {tabs.map((tab) => {
            const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className="nav-item" data-active={active}>
                <span className="nav-item__icon" aria-hidden="true">
                  {tab.href === "/" ? "⌂" : tab.href === "/record" ? "✎" : tab.href === "/report" ? "◐" : "☾"}
                </span>
                <span className="nav-item__label">{tab.label}</span>
                <span className="nav-dot" aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="page-shell">
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
