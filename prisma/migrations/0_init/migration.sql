-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "desc" JSON,
    "links" JSON,
    "storageUsedBytes" BIGINT NOT NULL DEFAULT 0,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "dtIniPremium" TIMESTAMP(3),
    "dtFimPremium" TIMESTAMP(3),
    "stripeCliId" TEXT,
    "stripeSubId" TEXT,
    "mercadoPagoPreApprovalId" TEXT,
    "mercadoPagoPaymentId" TEXT,
    "mercadoPagoSubscriptionId" TEXT,
    "statusAss" INTEGER NOT NULL DEFAULT 1,
    "plano" INTEGER NOT NULL DEFAULT 0,
    "valorPago" DECIMAL(10,2),
    "refreshPasswordToken" TEXT,
    "refreshPasswordTokenExpires" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conteudo" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "link" TEXT,
    "fonte" TEXT,
    "linkext" TEXT,
    "filename" TEXT,
    "mimetype" TEXT,
    "data" BYTEA,
    "mediaType" TEXT NOT NULL DEFAULT 'single',
    "mediaUrls" TEXT[],
    "storageBytes" BIGINT NOT NULL DEFAULT 0,
    "isTrend" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conteudo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nome" TEXT,
    "name" TEXT,
    "descricao" TEXT,
    "isTrend" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoUsuario" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "valorPago" DECIMAL(10,2),
    "isBlocked" BOOLEAN,
    "isPremium" BOOLEAN,
    "dtIniPremium" TIMESTAMP(3),
    "dtFimPremium" TIMESTAMP(3),
    "statusAss" INTEGER,
    "plano" INTEGER,
    "operationType" TEXT NOT NULL DEFAULT 'UPDATE',
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "expiresIn" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookRequest" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "authenticated" BOOLEAN NOT NULL DEFAULT false,
    "externalRequestId" TEXT,
    "notificationId" TEXT,
    "eventType" TEXT,
    "action" TEXT,
    "resourceId" TEXT,
    "headers" JSON,
    "query" JSON,
    "payload" JSON NOT NULL,
    "rawBody" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoriaToConteudo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoriaToConteudo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_slug_key" ON "Usuario"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_stripeCliId_key" ON "Usuario"("stripeCliId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_stripeSubId_key" ON "Usuario"("stripeSubId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_mercadoPagoPreApprovalId_key" ON "Usuario"("mercadoPagoPreApprovalId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_mercadoPagoPaymentId_key" ON "Usuario"("mercadoPagoPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_mercadoPagoSubscriptionId_key" ON "Usuario"("mercadoPagoSubscriptionId");

-- CreateIndex
CREATE INDEX "Usuario_email_statusAss_isPremium_idx" ON "Usuario"("email", "statusAss", "isPremium");

-- CreateIndex
CREATE INDEX "Conteudo_userId_createdAt_idx" ON "Conteudo"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "HistoricoUsuario_userId_changedAt_idx" ON "HistoricoUsuario"("userId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_key" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "WebhookRequest_provider_createdAt_idx" ON "WebhookRequest"("provider", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookRequest_provider_eventType_createdAt_idx" ON "WebhookRequest"("provider", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookRequest_resourceId_createdAt_idx" ON "WebhookRequest"("resourceId", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookRequest_externalRequestId_idx" ON "WebhookRequest"("externalRequestId");

-- CreateIndex
CREATE INDEX "_CategoriaToConteudo_B_index" ON "_CategoriaToConteudo"("B");

-- AddForeignKey
ALTER TABLE "Conteudo" ADD CONSTRAINT "Conteudo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToConteudo" ADD CONSTRAINT "_CategoriaToConteudo_A_fkey" FOREIGN KEY ("A") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToConteudo" ADD CONSTRAINT "_CategoriaToConteudo_B_fkey" FOREIGN KEY ("B") REFERENCES "Conteudo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
