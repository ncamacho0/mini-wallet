"use client";

import { useRouter } from "next/navigation";
import { useMe } from "@/features/wallet";
import { Button } from "@/shared/components/ui/button";
import { ErrorState } from "@/shared/components/ui/error-state";
import { useTxDraftStore } from "@/shared/stores/tx-draft.store";
import type { CreateTransactionRequest } from "@/features/transactions/schemas";
import { AmountStep } from "./amount-step";
import { RecipientStep } from "./recipient-step";
import { SummaryStep } from "./summary-step";
import { WizardSkeleton } from "./wizard-skeleton";
import { useSendTransaction } from "../hooks/use-send-transaction";

export function TransactionWizard() {
  const router = useRouter();
  const { data: me, isLoading, isError, error, refetch } = useMe();
  const { amountMinorUnits, recipient, step, setStep, setAmount, setRecipient, reset } =
    useTxDraftStore();
  const send = useSendTransaction();

  if (isLoading) return <WizardSkeleton />;
  if (isError)
    return (
      <ErrorState
        title="No pudimos cargar tu cuenta"
        message={error?.message ?? "Intenta de nuevo"}
        onRetry={() => refetch()}
      />
    );
  if (!me) return null;

  const balanceMinorUnits = me.account.balanceMinorUnits;

  function goBack() {
    if (step === "recipient") setStep("amount");
    if (step === "summary") setStep("recipient");
  }

  function handleConfirm() {
    if (!amountMinorUnits || !recipient) return;

    const body: CreateTransactionRequest = {
      amountMinorUnits,
      recipientId: recipient.recipientId,
    };

    send.mutate(body, {
      onSuccess: ({ transaction }) => {
        reset();
        router.push(`/transactions/${transaction.id}/receipt`);
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      {step === "recipient" || step === "summary" ? (
        <Button variant="ghost" className="self-start" onClick={goBack}>
          Volver
        </Button>
      ) : null}

      {step === "amount" ? (
        <AmountStep
          balanceMinorUnits={balanceMinorUnits}
          defaultValue={amountMinorUnits ?? undefined}
          onSubmit={setAmount}
        />
      ) : null}

      {step === "recipient" ? (
        <RecipientStep
          onSelectExisting={(id: string, name: string) => setRecipient({ recipientId: id, name })}
          onCreateNew={(contact) => setRecipient({ recipientId: contact.id, name: contact.name })}
        />
      ) : null}

      {step === "summary" && amountMinorUnits && recipient ? (
        <SummaryStep
          amountMinorUnits={amountMinorUnits}
          recipientName={recipient.name}
          balanceMinorUnits={balanceMinorUnits}
          onConfirm={handleConfirm}
          isPending={send.isPending}
          error={send.error}
        />
      ) : null}
    </div>
  );
}
