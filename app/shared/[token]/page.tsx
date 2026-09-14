import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StructuredContext } from "@/lib/types";
import SharedContextClient from "./SharedContextClient";

interface Props { params: { token: string } }

export default async function SharedContextPage({ params }: Props) {
  const shared = await prisma.sharedContext.findUnique({
    where: { token: params.token },
    include: {
      context: {
        select: {
          id: true, title: true, structured: true,
          tokensOriginal: true, tokensCompressed: true, updatedAt: true,
          conversation: { select: { sourceAI: true } },
        },
      },
    },
  });

  if (!shared) notFound();

  // Increment view count
  await prisma.sharedContext.update({
    where: { token: params.token },
    data: { viewCount: { increment: 1 } },
  });

  const ctx = shared.context;

  return (
    <SharedContextClient
      context={{
        id: ctx.id,
        title: ctx.title,
        structured: ctx.structured as unknown as StructuredContext,
        tokensOriginal: ctx.tokensOriginal,
        tokensCompressed: ctx.tokensCompressed,
        sourceAI: ctx.conversation?.sourceAI || "unknown",
        token: params.token,
      }}
    />
  );
}
