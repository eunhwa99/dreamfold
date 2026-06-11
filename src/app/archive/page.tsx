import { AppShell } from "@/components/app-shell";
import { DreamList } from "@/components/archive/dream-list";
import { listDreams } from "@/lib/mock-store";

export default function ArchivePage() {
  const dreams = listDreams();

  return (
    <AppShell>
      <section className="screen-screen">
        <div className="report-hero">
          <p className="section-kicker">Archive</p>
          <h2 className="report-title">보관함</h2>
          <p className="report-copy">기록된 꿈을 다시 열어보고, 어떤 장면과 감정이 오래 남았는지 조용히 되짚어보세요.</p>
        </div>
        <DreamList dreams={dreams} />
      </section>
    </AppShell>
  );
}
