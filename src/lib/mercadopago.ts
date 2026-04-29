import { Invoice, MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';

// Valida se a variável de ambiente está definida
if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined');
}

const configuredTimeout = Number(process.env.MERCADO_PAGO_TIMEOUT_MS ?? 15000);
const mercadoPagoTimeout =
  Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : 15000;

// Configura o cliente com o Access Token
export const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: { timeout: mercadoPagoTimeout },
});

// Instâncias dos recursos que vamos usar
export const preApproval = new PreApproval(client);
export const payment = new Payment(client);
export const invoice = new Invoice(client);
