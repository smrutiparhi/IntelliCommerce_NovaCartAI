# NovaCart AI — final review runbook

Use this for the local customer-flow and AI review. The checkout path and both AI prompts below were verified on 29 October 2026. The app is a local demo; payment is simulated and reset email is captured by Mailpit.

## Before the review

1. Start Docker Desktop. From the repository root, run:

   ```bash
   docker compose -f docker-compose.yml --profile infra --profile platform --profile backend --profile frontend up -d
   docker compose -f docker-compose.yml --profile infra --profile platform --profile backend --profile frontend ps
   ```

2. Open `http://localhost:3000`. Keep `http://localhost:8025` available only if a password reset is requested. Use a fresh email for the live registration and a password you choose; do not display it during screen sharing.
3. Have `docs/ARCHITECTURE.md` and `docs/DEFERRED.md` open for questions about the design and scope.

## Seven-minute demo sequence

1. **Account (1 minute):** Open `/register`, create a customer account, and land on the home page. Explain that Auth issues a short-lived signed access token and a rotating refresh cookie.
2. **Shopping (2 minutes):** Add an active product to the cart, open `/cart`, then `/checkout`. Enter demo delivery details and continue to payment.
3. **Order (1 minute):** Click **Pay securely**, wait for **Payment complete · Track order**, then open the order timeline. The local payment path is a simulation; it makes no real charge. The browser checkout test passed this exact path on 29 October 2026.
4. **Nova AI (2 minutes):** Return to `/home` and click **Ask Nova AI** or **Open NovaCart AI**. Ask “What is the delivery policy?” and “Recommend wireless headphones.” Point to the policy and product citations. Both returned `rag-gemini-v1` answers in the live check, and the policy prompt passed a Chromium browser check.
5. **Architecture (1 minute):** Explain: gateway and Eureka route requests; services own their data; Kafka carries order events; the order saga coordinates stock reservation and payment; AI retrieves indexed product and policy evidence before answering.

## If asked about limits

- Password-reset email goes to local Mailpit at `http://localhost:8025`, not to an external inbox. The requested email must belong to a registered account.
- Checkout uses the local payment simulation. Razorpay code exists, but this review does not use live payment credentials or collect money.
- Gemini is on a free-tier key. A response may be slower or rate-limited; the grounded local answer path remains available. Do not claim a model answer was produced if the UI reports fallback mode.
- Public cloud deployment, real email delivery, full CI/CD, broad load testing, and expanded catalogue are deferred. See `docs/DEFERRED.md`.

## Fast checks if a page does not load

```bash
docker compose -f docker-compose.yml --profile infra --profile platform --profile backend --profile frontend ps
curl -fsS http://localhost:8080/actuator/health
curl -fsS http://localhost:8081/actuator/health
```

Keep Docker Desktop running during the review. Do not run `docker compose down -v`; that removes the local database volumes.
