# WooCommerce MCP → Railway → ChatGPT

Тази версия добавя стандартен MCP интерфейс към WooCommerce интеграцията на techspawn. Railway стартира `build/http.js`, а ChatGPT се свързва към HTTPS `/mcp` със Streamable HTTP и OAuth. Това е частна административна интеграция за един конфигуриран магазин.

## Какво е подготвено

- Стандартни `initialize`, `tools/list`, `tools/call` чрез официалния TypeScript MCP SDK.
- Каталог на 119 оригинални метода. По подразбиране се показват само WooCommerce методите за четене. WordPress методите се включват само при зададени WordPress credentials.
- Проверка на RS256 JWT: подпис, issuer, audience, срок на валидност, OAuth scopes и точен списък с разрешени потребители.
- `/health` и OAuth protected-resource metadata. Няма публичен режим без удостоверяване за `/mcp`.
- Dockerfile, който компилира и изпълнява тестовете преди създаване на runtime образа.
- Сървърът не пази MCP сесии и не се нуждае от база данни или Railway Volume. Входът и обновяването на токени се управляват от OAuth доставчика.

## 1. Създай Railway услуга

1. В Railway създай проект от GitHub repo `copermine/woocommerce-mcp-server`.
2. Избери branch `codex/railway-chatgpt`, или `main` след merge на pull request-а.
3. Railway използва `Dockerfile` и `railway.toml`. Не задавай друг Start Command.
4. В Settings → Networking генерирай публичен домейн. Портът е `3000`, освен ако зададеш друг `PORT`.
5. Копирай адреса, например `https://your-service.up.railway.app`. Това е `PUBLIC_URL`; MCP адресът е същият плюс `/mcp`.

Първото стартиране може да не премине, докато не попълниш задължителните Variables. Това е очаквано: сървърът отказва да стартира без настройките за достъп.

## 2. Настрой OAuth доставчик

Примерът използва Auth0. Нужен е твой Auth0 tenant; той не се създава автоматично от този repository. Друг доставчик е подходящ, ако поддържа MCP OAuth discovery, authorization code + PKCE S256 и RS256 JWT access tokens за правилния resource/audience.

### Auth0 API и потребител

1. Създай API с Identifier **точно** `https://your-service.up.railway.app/mcp`, signing algorithm **RS256**, token profile **Auth0**. Не включвай JWE encryption за access token-а.
2. Добави permissions `woocommerce:read` и `woocommerce:write`. За първоначалния тест е достатъчно `woocommerce:read`.
3. Включи RBAC за API-то, създай роля с нужните permissions и я назначи на собствения си потребител.
4. В User Management → Users копирай неговия **User ID**, например `auth0|abc123`. Това е `OAUTH_ALLOWED_SUBJECTS`, а не имейл адресът.
5. Увери се, че издаденият access token съдържа правата в claim `scope`. Наличието само на `permissions` не е достатъчно за този сървър.

Auth0 може да изисква **Tenant Settings → Default Audience**, зададен на същия API Identifier, за да издава подходящ JWT при връзка от ChatGPT. Това е и подходът в [официалния OpenAI Auth0 пример](https://github.com/openai/openai-mcpkit/blob/main/python-authenticated-mcp-server-scaffold/README.md#2-configure-auth0-authentication). Използвай отделен tenant за тази интеграция, ако промяна на Default Audience би засегнала други приложения. Всички audience стойности трябва да съвпадат с `PUBLIC_URL + /mcp`.

### Регистрация на ChatGPT като OAuth клиент

За първа настройка можеш да използваш **предварително регистриран клиент**:

1. В Auth0 създай Application от тип **Regular Web Application**, например `ChatGPT WooCommerce`.
2. Включи login connection-а за твоя потребител. Разреши Authorization Code grant и PKCE S256. За автоматично обновяване на токените включи Refresh Token grant, refresh token rotation и Allow Offline Access за API-то според настройките на Auth0.
3. Запази Client ID и Client Secret. Те се въвеждат в OAuth настройките на приложението в ChatGPT, **не** в WooCommerce и **не** в GitHub.
4. Копирай **точния callback/redirect URI, показан от ChatGPT при настройката на MCP приложението**, в Auth0 Allowed Callback URLs. Не използвай wildcard и не предполагай, че адресът е един и същ за всички приложения.
5. Провери, че discovery документът на Auth0 обявява `authorization_endpoint`, `token_endpoint` и `code_challenge_methods_supported`, включващ `S256`.

Алтернатива е Auth0 CIMD регистрация по [официалните инструкции](https://developers.openai.com/plugins/build/auth). Този MCP сървър не реализира собствен login, регистрация на OAuth клиенти или token endpoint — те се обслужват от Auth0.

## 3. Railway Variables

| Variable | Стойност |
| --- | --- |
| `WORDPRESS_SITE_URL` | URL на магазина, например `https://shop.example`, без `/wp-json` |
| `WOOCOMMERCE_CONSUMER_KEY` | `ck_...` от WooCommerce REST API |
| `WOOCOMMERCE_CONSUMER_SECRET` | `cs_...` от WooCommerce REST API |
| `PUBLIC_URL` | Публичният Railway origin, без `/mcp`. Може да се пропусне при наличен `RAILWAY_PUBLIC_DOMAIN` |
| `OAUTH_ISSUER` | Issuer от discovery документа, например `https://your-tenant.eu.auth0.com/` |
| `OAUTH_JWKS_URL` | JWKS URL от discovery документа, обикновено `https://your-tenant.eu.auth0.com/.well-known/jwks.json` |
| `OAUTH_ALLOWED_SUBJECTS` | Твоят точен User ID; при повече потребители — разделени със запетая |
| `ENABLE_WRITE_TOOLS` | `false` за началния тест |
| `PORT` | По избор; използва Railway `PORT` или `3000` |

Създай WooCommerce ключовете от WooCommerce → Settings → Advanced → REST API. За първия тест избери Read. Не добавяй ключовете към GitHub или към URL адреса.

За WordPress post tools по избор добави `WORDPRESS_USERNAME` и `WORDPRESS_PASSWORD`, като за парола използваш WordPress Application Password. WooCommerce ключовете са отделни от тези credentials.

Приложи Variables и deploy-ни услугата. Не е необходим OpenAI API key.

## 4. Проверка и свързване в ChatGPT

1. Отвори `https://your-service.up.railway.app/health` — очаква се `{"status":"ok"}`. Това проверява процеса, не WooCommerce credentials.
2. Отвори `https://your-service.up.railway.app/.well-known/oauth-protected-resource/mcp` и провери resource и issuer.
3. Заявка към `/mcp` без access token трябва да върне **401**, с `WWW-Authenticate` header. Това е очаквано.
4. Включи Developer mode в ChatGPT и създай собствено MCP приложение с URL `https://your-service.up.railway.app/mcp`, authentication **OAuth**, Client ID и Client Secret от Auth0 при предварително регистриран клиент.
5. Попълни точния callback URI в Auth0, ако още не е зададен. Завърши входа със собствения си разрешен потребител.
6. Избери приложението в нов разговор и поискай: **„Използвай WooCommerce инструмента get_products и покажи 5 продукта. Не прави промени.“**

Текущите стъпки в интерфейса на ChatGPT са описани в [Developer mode](https://developers.openai.com/api/docs/guides/developer-mode). Етикетите Apps/Plugins/Connectors могат да се различават според интерфейса на профила.

## 5. Включване на редактиране

След успешен тест на четенето:

1. Използвай WooCommerce REST API ключ с Read/Write права.
2. Разреши `woocommerce:write` на собствения си потребител и OAuth клиент, заедно с `woocommerce:read`.
3. Задай `ENABLE_WRITE_TOOLS=true` и redeploy.
4. Обнови инструментите на MCP приложението в ChatGPT и се удостоверѝ отново, за да получиш write scope.

И трите слоя се прилагат: deployment flag, OAuth scope и WooCommerce права. Изключването на flag-а блокира промените дори при вече издаден write token. При включване се излагат и административни операции, например изтриване, refunds и settings; избирай инструментите в ChatGPT според нуждите.

## Диагностика

| Симптом | Какво да провериш |
| --- | --- |
| Процесът не стартира | Deploy logs показват липсващата Variable. Провери HTTPS URL-ите и точния User ID |
| `/health` работи, ChatGPT връща 401 | JWT подпис, issuer, `/mcp` audience, срок и разрешен `sub`. При Auth0 провери Default Audience и че token-ът е JWT, не JWE |
| 403 / insufficient scope | Token claim `scope` трябва да съдържа `woocommerce:read`; за промени и `woocommerce:write` |
| OAuth callback mismatch | Копирай точния URI от ChatGPT в Auth0; провери login connection и client credentials |
| Списъкът с tools работи, продуктите не | WooCommerce URL, API ключове, техните права и дали REST API/Authorization header се пропускат от хостинга/WAF |
| 405 при отваряне на `/mcp` с browser | След удостоверяване endpoint-ът приема POST; това не е уеб страница и няма GET SSE канал |
| Преместване на друг домейн | Обнови PUBLIC_URL, API Identifier/audience и MCP URL в ChatGPT, след което се свържи отново |

## Обхват на проверките

`npm test` проверява истински MCP SDK клиент през HTTP и stdio, JWT подпис/issuer/audience/expiry/subject/scopes, блокирани write calls, фиксирания адрес на магазина, validation, редактируеми операции срещу mock WooCommerce и скриване на credentials в грешки. Docker build също изпълнява тези тестове.

Тестовете използват локален mock магазин и тестови RSA ключове. Не са доказателство за успешно свързване към твоя Auth0 tenant, ChatGPT профил или реален WooCommerce магазин. Оригиналните 119 бизнес операции са запазени; всички endpoint-и не са проверени срещу жив магазин. По-специално WordPress `/posts/{id}/meta` изисква допълнителна поддръжка, а upstream методите за reviews и изтриване на metadata следва да се проверят на staging, преди да се използват за редактиране.
