import { ReceiptScreen } from "@/features/transactions";

export default async function ReceiptPage({ params }: PageProps<"/transactions/[id]/receipt">) {
  const { id } = await params;
  return <ReceiptScreen id={id} />;
}
