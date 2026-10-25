-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "nota" INTEGER NOT NULL,
    "mensagem" VARCHAR(1000) NOT NULL,
    "podeContatar" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_userId_seq_key" ON "Feedback"("userId", "seq");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Limites garantidos pelo banco, mesmo com envios simultâneos:
-- no máximo 3 feedbacks por usuário (seq 1 a 3, único por usuário), nota de 1 a 5 e mensagem com pelo menos 10 caracteres.
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_seq_check" CHECK ("seq" BETWEEN 1 AND 3);
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_nota_check" CHECK ("nota" BETWEEN 1 AND 5);
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_mensagem_check" CHECK (char_length(btrim("mensagem")) >= 10);
