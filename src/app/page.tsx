"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { EmailsSection } from "@/components/EmailsSection";
import { TasksSection } from "@/components/TasksSection";
import { DesignersReport } from "@/components/DesignersReport";
import { NewsSection } from "@/components/NewsSection";
import { NotesSidebar } from "@/components/NotesSidebar";

export default function HomePage() {
  const qc = useQueryClient();
  const refreshAll = () => qc.invalidateQueries();

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header onRefresh={refreshAll} />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-5 space-y-6">
            <EmailsSection />
            <TasksSection />
          </section>

          <section className="lg:col-span-5">
            <DesignersReport />
          </section>

          <aside className="lg:col-span-2">
            <NotesSidebar />
          </aside>

          <section className="lg:col-span-12">
            <NewsSection />
          </section>
        </div>
      </main>
    </div>
  );
}
