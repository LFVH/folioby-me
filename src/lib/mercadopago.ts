import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';

// Valida se a variável de ambiente está definida
if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined');
}

// Configura o cliente com o Access Token
export const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

// Instâncias dos recursos que vamos usar
export const preApproval = new PreApproval(client);
export const payment = new Payment(client);