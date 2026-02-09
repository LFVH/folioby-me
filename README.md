FolioBy

npm install
npm run dev

- ajustar script prd
- ajustar package produção 

folioby.me
folioby-me
folioby_db
TODO
- revisar middleware - permissoes e redirects - ok testado 1d
- alterar front página principal traz conteudos do usuario pelo LINK -> testado 2dias
- ajustar header - ok
- exibir e alterar slug no front - ok
- pagina user - slug ok senha ok falta teste imagem
- pagina conteudos traz apenas coisas do usuario - testar com outros usuarios
- entender o que fica melhor de deixar o usuario inserir, é gif mesmo? só imagens? outros objetos? ele entrnado com link ou video tenho como trabalhar isso?
- testar tudo 
- iniciar vercel, banco neon
- revisar pagamento e testar  
- email (esqueci minha senha pelo menos) 

(não faço ideia)
- google auth
- TERMOS de serviço - termos legais em geral -
- estatisticas google SEO
- estatisticas internas
- pixseg
________________________________________________________________________________________________________________
luhkeepgoing@gmail.com
stripe listen --forward-to https://directorflix-project.vercel.app/api/webhook
https://directorflix-project.vercel.app/api/webhook
mercy-eases-merry-master
The Stripe CLI is configured for your account with account id acct_1Q9PhmKwBrvWS04k
__________________________________________________________________________________________________
TESTE
UPDATE public."Usuario"
	SET "dtIniPremium"='2025-10-24 23:42:39.122', "dtFimPremium"='2999-10-24 23:42:39.122', "statusAss"='ativo', "updatedAt"=NOW()'

dsadas@d.com cred 424242424242
___________________________________________________________________________________________________
 Para produção
- domínio, nome?
- pagamento->domínio-producao
NAO ESQUECER:  
- atualizar ADMIN_USER_IDS
- ATUALIZAR ENVS - PRODUTO - ROTAS - KEYS ETC
mercy-eases-merry-master
Configuração no Stripe
No Dashboard do Stripe:

Vá em Settings > Billing > Customer Portal

Configure quais informações os clientes podem gerenciar

Ative os recursos desejados (atualizar método de pagamento, cancelar assinatura, etc.)
Stripe portal error: Error: No configuration provided and your test
 mode default configuration has not been created. Provide a configuration or create
 your default by saving your customer portal settings in test mode at https://dashboard.stripe.com/test/settings/billing/portal.
_____________________________________________________________________________________________________________________


DADOS FUTURO
-DRE
-espelho de vendas
-rentabilidade X produto x canal x cliente 