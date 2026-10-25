import { z } from 'zod'

// Regras compartilhadas pelo formulário e pela API de feedback.
// O limite também está no CHECK "Feedback_seq_check" da migration 20261025120000_feedback.
export const FEEDBACK_LIMITE_POR_USUARIO = 3
export const FEEDBACK_MENSAGEM_MIN = 10
export const FEEDBACK_MENSAGEM_MAX = 1000
export const FEEDBACK_BODY_MAX_BYTES = 4096

// Remove caracteres de controle, mantendo quebra de linha e tabulação.
const CONTROLES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

// Conta caracteres como o Postgres (char_length): um emoji vale 1, não 2.
export const contarCaracteres = (texto: string) => Array.from(texto).length

export const feedbackSchema = z
  .object({
    nota: z.number().int().min(1).max(5),
    mensagem: z
      .string()
      .transform((texto) => texto.replace(CONTROLES, '').trim())
      .pipe(
        z
          .string()
          .refine((texto) => contarCaracteres(texto) >= FEEDBACK_MENSAGEM_MIN, `Escreva pelo menos ${FEEDBACK_MENSAGEM_MIN} caracteres.`)
          .refine((texto) => contarCaracteres(texto) <= FEEDBACK_MENSAGEM_MAX, `Use no máximo ${FEEDBACK_MENSAGEM_MAX} caracteres.`)
      ),
    podeContatar: z.boolean().optional().default(false),
  })
  .strict()

export type FeedbackInput = z.infer<typeof feedbackSchema>
