/* Shared demo logic: accounts, login state, loan data (stored in the browser only) */
const DB = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};
const user = DB.get('user');
const loggedIn = localStorage.getItem('loggedIn') === '1';
const RATES = { personal: 1.5, salary: 1.2, business: 1.0, car: 0.8, home: 0.6 };
const peso = n => '₱' + Math.round(n).toLocaleString('en-PH');
const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const monthly = (p, ratePct, n) => { const r = ratePct / 100; return p * r / (1 - Math.pow(1 + r, -n)); };

/* Call at the top of a protected page */
function requireLogin() {
  if (!user) location.replace('Login.html?need=signup');
  else if (!loggedIn) location.replace('Login.html?need=login');
}

/* Nav button becomes "Log out" when signed in */
document.addEventListener('DOMContentLoaded', () => {
  const b = document.querySelector('.nav-right');
  if (b && loggedIn) {
    b.textContent = 'Log out';
    b.href = '#';
    b.onclick = e => { e.preventDefault(); localStorage.removeItem('loggedIn'); location.href = 'Login.html'; };
  }
});

/* ---- Loan applications (all loans live in one list; status: pending -> active) ---- */
const APPROVAL_DELAY_MS = 15000;
function getApps() {
  let apps = DB.get('apps');
  if (!apps) {
    apps = [];
    const old = DB.get('application');
    if (old) apps.push(Object.assign({ id: 'L' + Date.parse(old.appliedAt), status: old.method ? 'active' : 'pending' }, old));
    DB.set('apps', apps);
  }
  return apps;
}
function saveApps(a) { DB.set('apps', a); }
function processApps() {
  const apps = getApps(); let changed = false;
  apps.forEach(a => {
    if (a.status === 'pending' && a.method && Date.now() - a.submittedAt > APPROVAL_DELAY_MS) {
      a.status = 'active'; a.approvedAt = new Date().toISOString(); changed = true;
    }
  });
  if (changed) saveApps(apps);
  return apps;
}
