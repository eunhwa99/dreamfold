import { AppShell } from "@/components/app-shell";
import { DreamList } from "@/components/archive/dream-list";
import { listDreams } from "@/lib/mock-store";

export default function ArchivePage() {
  const dreams = listDreams();

  return (
    <AppShell>
      <section className="panel panel--feature">
        <p className="eyebrow">Archive</p>
        <h2 className="section-title">보관함</h2>
        <p className="section-copy">기록된 꿈을 다시 열어보며, 어떤 장면과 감정이 오래 남았는지 천천히 되짚어보세요.</p>
      </section>
      <DreamList dreams={dreams} />
    </AppShell>
  );
}
