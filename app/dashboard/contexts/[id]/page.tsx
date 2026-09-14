import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StructuredContext } from "@/lib/types";
import ContextPageClient from "./ContextPageClient";
import type { Metadata } from "next";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await auth();
  const context = session?.user?.id
    ? await prisma.context.findFirst({ where: { id: params.id, userId: session.user.id }, select: { title: true } })
    : null;
  return { title: context?.title || "Context" };
}

export default async function ContextPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const context = await prisma.context.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      conversation: { select: { sourceAI: true } },
      versions: { orderBy: { version: "desc" }, take: 10 },
      sharedLinks: { select: { id: true, token: true, viewCount: true } },
    },
  });

  if (!context) notFound();

  return (
    <ContextPageClient
      context={{
        id: context.id,
        title: context.title,
        structured: context.structured as unknown as StructuredContext,
        tokensOriginal: context.tokensOriginal,
        tokensCompressed: context.tokensCompressed,
        currentVersion: context.currentVersion,
        conversation: context.conversation,
        versions: context.versions.map((v) => ({
          version: v.version,
          changeSummary: v.changeSummary,
          createdAt: v.createdAt.toISOString(),
        })),
        sharedLinks: context.sharedLinks,
      }}
    />
  );
}
