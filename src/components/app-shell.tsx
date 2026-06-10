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
    <div className="shell">
      <div className="shell__inner">
        <header className="topbar">
          <div className="brand">
            <div aria-hidden="true" className="brand__mark" />
            <div>
              <span className="brand__eyebrow">Dream Journal</span>
              <h1 className="brand__title">Dream Insight</h1>
            </div>
          </div>
          <nav className="topnav" aria-label="Main navigation">
            {tabs.map((tab) => {
              const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="topnav__link"
                  data-active={active}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
