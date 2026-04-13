import { prisma } from "@/lib/prisma";
import { JudaicaClient } from "@/components/judaica/JudaicaClient";

export const dynamic = "force-dynamic";

export default async function JudaicaPage() {
  const items = await prisma.judaicaItem.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-4xl">
      <JudaicaClient
        initialItems={items.map((i) => ({
          ...i,
          borrowedDate: i.borrowedDate ? i.borrowedDate.toISOString() : null,
          dueDate: i.dueDate ? i.dueDate.toISOString() : null,
        }))}
      />
    </div>
  );
}
