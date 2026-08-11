// MongoDB init script — runs once on first container start
// Creates isolated databases and dedicated users for each service.
// Connection: mongodb://novacart_root:novacart_root_pw@localhost:27017/

// ── Auth Service ─────────────────────────────────────────────────────────────
db = db.getSiblingDB('auth_db');
db.createUser({
  user: 'auth_svc',
  pwd:  'auth_svc_pw',
  roles: [{ role: 'readWrite', db: 'auth_db' }]
});
db.createCollection('users');
db.createCollection('refresh_tokens');
db.createCollection('password_reset_tokens');

// ── Product Service (Member 2) ────────────────────────────────────────────────
db = db.getSiblingDB('product_db');
db.createUser({
  user: 'product_svc',
  pwd:  'product_svc_pw',
  roles: [{ role: 'readWrite', db: 'product_db' }]
});
db.createCollection('products');
db.createCollection('categories');
db.createCollection('reviews');

// ── Inventory Service (Member 3) ─────────────────────────────────────────────
db = db.getSiblingDB('inventory_db');
db.createUser({
  user: 'inventory_svc',
  pwd:  'inventory_svc_pw',
  roles: [{ role: 'readWrite', db: 'inventory_db' }]
});
db.createCollection('inventory');
db.createCollection('reservations');

// ── Order Service (Member 3) ──────────────────────────────────────────────────
db = db.getSiblingDB('order_db');
db.createUser({
  user: 'order_svc',
  pwd:  'order_svc_pw',
  roles: [{ role: 'readWrite', db: 'order_db' }]
});
db.createCollection('orders');
db.createCollection('outbox');
db.createCollection('processed_events');

// ── Payment Service (Member 3) ────────────────────────────────────────────────
db = db.getSiblingDB('payment_db');
db.createUser({
  user: 'payment_svc',
  pwd:  'payment_svc_pw',
  roles: [{ role: 'readWrite', db: 'payment_db' }]
});
db.createCollection('payments');
db.createCollection('refunds');
db.createCollection('coupons');
db.createCollection('invoices');

// ── AI Assistant Service (Member 4) ──────────────────────────────────────────
db = db.getSiblingDB('ai_db');
db.createUser({
  user: 'ai_svc',
  pwd:  'ai_svc_pw',
  roles: [{ role: 'readWrite', db: 'ai_db' }]
});
db.createCollection('knowledge_chunks');
db.createCollection('agent_runs');

print('NovaCart MongoDB init complete — all databases and users created.');
