-- Limites de texto e de armazenamento garantidos também pelo banco.
-- Os valores espelham src/lib/limits.ts e src/lib/user-slug.ts.
-- NOT VALID: valem para toda gravação nova sem barrar registros antigos que já passem do limite.
-- Para validar os antigos depois de conferi-los: ALTER TABLE ... VALIDATE CONSTRAINT <nome>;

ALTER TABLE "Usuario"
    ADD CONSTRAINT "Usuario_name_len_check" CHECK (char_length("name") <= 100) NOT VALID,
    ADD CONSTRAINT "Usuario_slug_len_check" CHECK (char_length("slug") <= 50) NOT VALID,
    ADD CONSTRAINT "Usuario_email_len_check" CHECK (char_length("email") <= 254) NOT VALID,
    ADD CONSTRAINT "Usuario_storage_nonneg_check" CHECK ("storageUsedBytes" >= 0) NOT VALID;

ALTER TABLE "Categoria"
    ADD CONSTRAINT "Categoria_nome_len_check" CHECK (char_length("nome") <= 60) NOT VALID,
    ADD CONSTRAINT "Categoria_name_len_check" CHECK (char_length("name") <= 60) NOT VALID,
    ADD CONSTRAINT "Categoria_descricao_len_check" CHECK (char_length("descricao") <= 300) NOT VALID;

ALTER TABLE "Conteudo"
    ADD CONSTRAINT "Conteudo_name_len_check" CHECK (char_length("name") <= 120) NOT VALID,
    ADD CONSTRAINT "Conteudo_fonte_len_check" CHECK (char_length("fonte") <= 200) NOT VALID,
    ADD CONSTRAINT "Conteudo_link_len_check" CHECK (char_length("link") <= 2048) NOT VALID,
    ADD CONSTRAINT "Conteudo_linkext_len_check" CHECK (char_length("linkext") <= 2048) NOT VALID,
    ADD CONSTRAINT "Conteudo_mediaurls_count_check" CHECK (cardinality("mediaUrls") <= 30) NOT VALID,
    ADD CONSTRAINT "Conteudo_storage_nonneg_check" CHECK ("storageBytes" >= 0) NOT VALID;
