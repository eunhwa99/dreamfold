import { AppShell } from "@/components/app-shell";
import { DreamList } from "@/components/archive/dream-list";
import { listDreams } from "@/lib/mock-store";

export default function ArchivePage() {
  const dreams = listDreams();

  return (
    <AppShell>
      <section className="panel">
        <p className="eyebrow">Archive</p>
        <h2 className="section-title">보관함</h2>
        <p className="section-copy">기록된 꿈을 다시 열어보고, 어떤 장면과 감정이 오래 남았는지 조용히 되짚어보세요.</p>
      </section>
      <DreamList dreams={dreams} />
    </AppShell>
  );
}
