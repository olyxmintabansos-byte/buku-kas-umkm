/* ===================================================================
   FinOS UMKM – script.js (Enterprise Financial OS Engine)
   Complete, Zero-hallucination, All Features Active
   =================================================================== */

// ── DEFAULT CONSTANTS ──
const DEFAULT_SETTINGS = {
    brandName: 'Buku Kas Pro UMKM',
    tagline: 'Sistem Pembukuan & Arus Kas Digital',
    primaryColor: '#2563eb',
    isDarkMode: false,
    borderRadius: 12,
    taxPercentage: 0.5,
    ownerPin: '1234'
};

const DEFAULT_AUTH = {
    isLoggedIn: true,
    currentRole: 'Owner'
};

const DEFAULT_TRANSACTIONS = [
    {
        id: 'TRX-101',
        date: todayISO(),
        desc: 'Penjualan Kopi Susu 20 Cup',
        amount: 300000,
        fee: 900,
        netAmount: 299100,
        type: 'income',
        category: 'Penjualan',
        wallet: 'qris',
        notes: 'Pembayaran QRIS toko',
        customerPhone: '628123456789'
    },
    {
        id: 'TRX-102',
        date: todayISO(),
        desc: 'Pembelian Biji Kopi Arabika 2kg',
        amount: 180000,
        fee: 0,
        netAmount: 180000,
        type: 'expense',
        category: 'Bahan Baku',
        wallet: 'cash',
        notes: 'Beli tunai di pasar',
        customerPhone: ''
    }
];

const DEFAULT_DEBTS = [
    {
        id: 'DEBT-1',
        contactName: 'Warung Bu Siti',
        contactPhone: '628987654321',
        type: 'piutang',
        amount: 150000,
        dueDate: todayISO(),
        notes: 'Bon katering rapat',
        isPaid: false,
        dateCreated: todayISO()
    }
];

const DEFAULT_BILLS = [
    { id: 'BILL-1', name: 'Biaya WiFi Indihome', amount: 350000, period: 'bulanan', nextDueDate: todayISO(), category: 'Sewa & Listrik' }
];

const DEFAULT_GOALS = [
    { id: 'GOAL-1', name: 'Beli Mesin Espresso', targetAmount: 5000000, currentAmount: 1200000, deadline: '2026-12-31' }
];

// ── HELPERS ──
function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(num || 0);
}

function formatDateDisplay(isoStr) {
    if (!isoStr) return '-';
    const parts = isoStr.split('-');
    if (parts.length !== 3) return isoStr;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// ── STATE VARIABLES ──
let transactions = [];
let debts = [];
let bills = [];
let goals = [];
let settings = {};
let auth = {};

// ── LOAD & SAVE STATE ──
function loadAllState() {
    try {
        transactions = JSON.parse(localStorage.getItem('sme_transactions')) || DEFAULT_TRANSACTIONS;
        debts = JSON.parse(localStorage.getItem('sme_debts')) || DEFAULT_DEBTS;
        bills = JSON.parse(localStorage.getItem('sme_recurring')) || DEFAULT_BILLS;
        goals = JSON.parse(localStorage.getItem('sme_goals')) || DEFAULT_GOALS;
        settings = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem('sme_settings') || '{}'));
        auth = Object.assign({}, DEFAULT_AUTH, JSON.parse(localStorage.getItem('sme_auth') || '{}'));
    } catch (e) {
        transactions = DEFAULT_TRANSACTIONS;
        debts = DEFAULT_DEBTS;
        bills = DEFAULT_BILLS;
        goals = DEFAULT_GOALS;
        settings = DEFAULT_SETTINGS;
        auth = DEFAULT_AUTH;
    }
}

function saveState(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ── ROUTER & NAVIGATION ──
function initRouter() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            switchView(targetId);
        });
    });

    document.getElementById('goToTrxBtn')?.addEventListener('click', () => switchView('viewTransactions'));
    document.getElementById('quickTrxBtn')?.addEventListener('click', () => switchView('viewTransactions'));
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('show');
    });
}

function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));

    const activeSec = document.getElementById(viewId);
    if (activeSec) {
        activeSec.classList.remove('hidden');
        activeSec.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-target') === viewId) item.classList.add('active');
        else item.classList.remove('active');
    });

    const pageTitleMap = {
        'viewDashboard': 'Dashboard & Metrik',
        'viewTransactions': 'Buku Kas & Mutasi',
        'viewDebts': 'Buku Hutang Piutang',
        'viewWallets': 'Dompet & Multi-Kas',
        'viewBillsTax': 'Tagihan Rutin & Pajak',
        'viewGoals': 'Target Tabungan',
        'viewReports': 'Laporan Finansial',
        'viewSettings': 'Kustomisasi Sistem'
    };
    document.getElementById('pageTitle').textContent = pageTitleMap[viewId] || 'Dashboard';
    document.getElementById('sidebar').classList.remove('show');
    refreshAllUI();
}

// ── CALCULATIONS & WALLETS ──
function calculateWallets() {
    let cash = 0, bank = 0, qris = 0;
    transactions.forEach(t => {
        const net = t.netAmount !== undefined ? t.netAmount : (t.amount - (t.fee || 0));
        const sign = t.type === 'income' ? 1 : -1;
        if (t.wallet === 'cash') cash += net * sign;
        else if (t.wallet === 'bank') bank += net * sign;
        else if (t.wallet === 'qris') qris += net * sign;
    });
    return { cash, bank, qris, total: cash + bank + qris };
}

function calculateMonthlyStats() {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;

    let inc = 0, exp = 0, fees = 0;
    transactions.forEach(t => {
        const parts = t.date.split('-');
        if (parseInt(parts[0]) === curYear && parseInt(parts[1]) === curMonth) {
            if (t.type === 'income') inc += t.amount;
            else if (t.type === 'expense') exp += t.amount;
            fees += (t.fee || 0);
        }
    });
    return { inc, exp, fees, net: inc - exp - fees };
}

// ── UI REFRESH ENGINE ──
function refreshAllUI() {
    applyThemeSettings();
    renderDashboard();
    renderTransactionsTable();
    renderDebtsUI();
    renderWalletsUI();
    renderBillsAndTax();
    renderGoalsUI();
    renderReportsUI();
    renderSettingsInputs();
}

function applyThemeSettings() {
    document.documentElement.style.setProperty('--primary', settings.primaryColor || '#2563eb');
    document.documentElement.style.setProperty('--card-radius', (settings.borderRadius || 12) + 'px');
    if (settings.isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');

    document.getElementById('sidebarBrandName').textContent = settings.brandName || 'FinOS UMKM';
    document.getElementById('sidebarBrandTagline').textContent = settings.tagline || 'Sistem Finansial Digital';
}

// ── RENDER DASHBOARD ──
function renderDashboard() {
    const w = calculateWallets();
    const stats = calculateMonthlyStats();

    document.getElementById('dashTotalBalance').textContent = formatRupiah(w.total);
    document.getElementById('dashWalletBreakdown').innerHTML =
        `<span>Laci: ${formatRupiah(w.cash)}</span> | <span>Bank: ${formatRupiah(w.bank)}</span> | <span>QRIS: ${formatRupiah(w.qris)}</span>`;

    document.getElementById('dashTotalIncome').textContent = formatRupiah(stats.inc);
    document.getElementById('dashTotalExpense').textContent = formatRupiah(stats.exp);

    const netEl = document.getElementById('dashNetProfit');
    netEl.textContent = formatRupiah(stats.net);
    netEl.style.color = stats.net >= 0 ? 'var(--success)' : 'var(--danger)';

    // Runway
    const avgDailyExpense = stats.exp > 0 ? (stats.exp / 30) : 1;
    const runwayDays = Math.round(w.total / avgDailyExpense);
    const runwayMonths = (runwayDays / 30).toFixed(1);
    document.getElementById('runwayEstimate').textContent = `${runwayMonths} Bulan (${runwayDays} Hari Kas)`;

    // Tax reserve
    const taxRes = stats.inc * ((settings.taxPercentage || 0.5) / 100);
    document.getElementById('taxReserve').textContent = formatRupiah(taxRes) + ` (${settings.taxPercentage || 0.5}%)`;

    // Recent 5 TRX
    const tbody = document.getElementById('recentTrxBody');
    tbody.innerHTML = '';
    transactions.slice(0, 5).forEach(t => {
        const tr = document.createElement('tr');
        const sign = t.type === 'income' ? '+' : '-';
        const cls = t.type === 'income' ? 'text-income' : 'text-expense';
        tr.innerHTML = `<td>${formatDateDisplay(t.date)}</td><td>${t.desc}</td><td class="${cls}">${sign} ${formatRupiah(t.amount)}</td>`;
        tbody.appendChild(tr);
    });

    // Chart
    renderCanvasChart(stats.inc, stats.exp);

    // Watchlist
    renderWatchlist();
}

function renderCanvasChart(inc, exp) {
    const canvas = document.getElementById('financeChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.parentElement.clientWidth || 400;
    const h = 220;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    const maxVal = Math.max(inc, exp, 100000);
    const incHeight = (inc / maxVal) * 120;
    const expHeight = (exp / maxVal) * 120;

    // Background grid
    ctx.strokeStyle = settings.isDarkMode ? '#334155' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 40); ctx.lineTo(w - 20, 40);
    ctx.moveTo(40, 100); ctx.lineTo(w - 20, 100);
    ctx.moveTo(40, 160); ctx.lineTo(w - 20, 160);
    ctx.stroke();

    // Bar 1: Income
    const b1X = w * 0.3 - 30;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(b1X, 160 - incHeight, 60, incHeight);
    ctx.fillStyle = settings.isDarkMode ? '#f1f5f9' : '#0f172a';
    ctx.font = '600 12px sans-serif';
    ctx.fillText('Pemasukan', b1X, 180);
    ctx.fillText(formatRupiah(inc), b1X, 150 - incHeight);

    // Bar 2: Expense
    const b2X = w * 0.7 - 30;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(b2X, 160 - expHeight, 60, expHeight);
    ctx.fillStyle = settings.isDarkMode ? '#f1f5f9' : '#0f172a';
    ctx.fillText('Pengeluaran', b2X, 180);
    ctx.fillText(formatRupiah(exp), b2X, 150 - expHeight);
}

function renderWatchlist() {
    const container = document.getElementById('miniWatchlistContent');
    container.innerHTML = '';

    const unpaidDebts = debts.filter(d => !d.isPaid);
    if (unpaidDebts.length === 0 && bills.length === 0) {
        container.innerHTML = '<p class="text-secondary">Tidak ada tagihan atau hutang mendesak.</p>';
        return;
    }

    unpaidDebts.forEach(d => {
        const div = document.createElement('div');
        div.className = 'mb-2 p-2 border-bottom';
        div.innerHTML = `<span class="badge-${d.type === 'piutang' ? 'success' : 'danger'}">${d.type.toUpperCase()}</span> 
                         <strong>${d.contactName}</strong>: ${formatRupiah(d.amount)} 
                         <br><small>Jatuh Tempo: ${formatDateDisplay(d.dueDate)}</small>`;
        container.appendChild(div);
    });
}

// ── RENDER TRANSACTIONS ──
function renderTransactionsTable() {
    const tbody = document.getElementById('trxTableBody');
    tbody.innerHTML = '';

    const kw = (document.getElementById('filterKeyword')?.value || '').toLowerCase();
    const period = document.getElementById('filterPeriod')?.value || 'all';
    const cat = document.getElementById('filterCat')?.value || 'all';

    const filtered = transactions.filter(t => {
        if (kw && !t.desc.toLowerCase().includes(kw)) return false;
        if (cat !== 'all' && t.category !== cat) return false;
        if (period === 'today' && t.date !== todayISO()) return false;
        return true;
    });

    filtered.forEach((t, idx) => {
        const tr = document.createElement('tr');
        const sign = t.type === 'income' ? '+' : '-';
        const cls = t.type === 'income' ? 'text-income' : 'text-expense';
        const walletLabel = { cash: '💵 Laci', bank: '🏦 Bank', qris: '📱 QRIS' }[t.wallet] || t.wallet;

        tr.innerHTML = `
            <td>${formatDateDisplay(t.date)}</td>
            <td><strong>${t.desc}</strong><br><small class="text-secondary">${t.category}</small></td>
            <td>${walletLabel}</td>
            <td class="${cls}"><strong>${sign} ${formatRupiah(t.netAmount || t.amount)}</strong></td>
            <td>
                <button class="btn-secondary btn-sm" onclick="printReceipt('${t.id}')">🧾 Nota</button>
                <button class="btn-danger btn-sm" onclick="deleteTrx('${t.id}')">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteTrx(id) {
    if (confirm('Hapus transaksi ini?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveState('sme_transactions', transactions);
        refreshAllUI();
    }
}

// ── RENDER DEBTS ──
function renderDebtsUI() {
    let piutang = 0, hutang = 0;
    debts.forEach(d => {
        if (!d.isPaid) {
            if (d.type === 'piutang') piutang += d.amount;
            else hutang += d.amount;
        }
    });

    document.getElementById('totalPiutang').textContent = formatRupiah(piutang);
    document.getElementById('totalHutang').textContent = formatRupiah(hutang);

    const tbody = document.getElementById('debtTableBody');
    tbody.innerHTML = '';

    debts.forEach(d => {
        const tr = document.createElement('tr');
        const isOverdue = !d.isPaid && d.dueDate < todayISO();
        const statusBadge = d.isPaid ? '<span class="text-income">✓ Lunas</span>' : (isOverdue ? '<span class="text-expense">⚠️ Overdue</span>' : 'Belum Lunas');

        tr.innerHTML = `
            <td><strong>${d.contactName}</strong><br><small>${d.contactPhone || '-'}</small></td>
            <td>${d.type.toUpperCase()}</td>
            <td>${formatRupiah(d.amount)}</td>
            <td>${formatDateDisplay(d.dueDate)} ${statusBadge}</td>
            <td>
                ${!d.isPaid && d.contactPhone ? `<button class="btn-success btn-sm" onclick="sendWA('${d.contactPhone}', '${d.contactName}', ${d.amount}, '${d.dueDate}')">💬 WA</button>` : ''}
                ${!d.isPaid ? `<button class="btn-primary btn-sm" onclick="markDebtPaid('${d.id}')">✓ Lunas</button>` : ''}
                <button class="btn-danger btn-sm" onclick="deleteDebt('${d.id}')">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function markDebtPaid(id) {
    const d = debts.find(x => x.id === id);
    if (d) {
        d.isPaid = true;
        if (confirm('Catat penerimaan/pengeluaran lunas ke kas toko?')) {
            transactions.unshift({
                id: 'TRX-PAY-' + Date.now(),
                date: todayISO(),
                desc: 'Pelunasan ' + d.type + ': ' + d.contactName,
                amount: d.amount,
                fee: 0,
                netAmount: d.amount,
                type: d.type === 'piutang' ? 'income' : 'expense',
                category: 'Lainnya',
                wallet: 'cash',
                notes: 'Otomatis dari Buku Hutang'
            });
            saveState('sme_transactions', transactions);
        }
        saveState('sme_debts', debts);
        refreshAllUI();
    }
}

function deleteDebt(id) {
    debts = debts.filter(x => x.id !== id);
    saveState('sme_debts', debts);
    refreshAllUI();
}

function sendWA(phone, name, amount, dueDate) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = `Halo Kak ${name}, ini pengingat tagihan sebesar ${formatRupiah(amount)} dari ${settings.brandName}. Jatuh tempo: ${formatDateDisplay(dueDate)}. Terima kasih!`;
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
}

// ── RENDER WALLETS ──
function renderWalletsUI() {
    const w = calculateWallets();
    document.getElementById('balCash').textContent = formatRupiah(w.cash);
    document.getElementById('balBank').textContent = formatRupiah(w.bank);
    document.getElementById('balQris').textContent = formatRupiah(w.qris);
}

// ── RENDER BILLS & TAX ──
function renderBillsAndTax() {
    const ul = document.getElementById('billList');
    ul.innerHTML = '';

    bills.forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${b.name}</strong> (${formatRupiah(b.amount)})</span> 
                        <button class="btn-danger btn-sm" onclick="deleteBill('${b.id}')">Hapus</button>`;
        ul.appendChild(li);
    });

    const stats = calculateMonthlyStats();
    const taxPayable = stats.inc * ((settings.taxPercentage || 0.5) / 100);

    document.getElementById('taxOmzet').textContent = formatRupiah(stats.inc);
    document.getElementById('taxPayable').textContent = formatRupiah(taxPayable);
}

function deleteBill(id) {
    bills = bills.filter(b => b.id !== id);
    saveState('sme_recurring', bills);
    refreshAllUI();
}

// ── RENDER GOALS ──
function renderGoalsUI() {
    const grid = document.getElementById('goalsGrid');
    grid.innerHTML = '';

    goals.forEach(g => {
        const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.innerHTML = `
            <h4>${g.name}</h4>
            <p>${formatRupiah(g.currentAmount)} / ${formatRupiah(g.targetAmount)} (${pct}%)</p>
            <div class="goal-progress-bg">
                <div class="goal-progress-bar" style="width: ${pct}%"></div>
            </div>
            <div class="flex-between mt-2">
                <button class="btn-primary btn-sm" onclick="addGoalFund('${g.id}')">+ Sisihkan Kas</button>
                <button class="btn-danger btn-sm" onclick="deleteGoal('${g.id}')">Hapus</button>
            </div>
        `;
        grid.appendChild(div);
    });
}

function addGoalFund(id) {
    const amt = prompt('Masukkan nominal dana disisihkan (Rp):');
    if (amt && !isNaN(amt)) {
        const g = goals.find(x => x.id === id);
        if (g) {
            g.currentAmount += parseInt(amt, 10);
            saveState('sme_goals', goals);
            refreshAllUI();
        }
    }
}

function deleteGoal(id) {
    goals = goals.filter(x => x.id !== id);
    saveState('sme_goals', goals);
    refreshAllUI();
}

// ── RENDER REPORTS ──
function renderReportsUI() {
    const stats = calculateMonthlyStats();
    document.getElementById('reportBrand').textContent = settings.brandName || 'FinOS UMKM';
    document.getElementById('repIncome').textContent = formatRupiah(stats.inc);
    document.getElementById('repExpense').textContent = formatRupiah(stats.exp);
    document.getElementById('repFees').textContent = formatRupiah(stats.fees);
    document.getElementById('repNet').textContent = formatRupiah(stats.net);
}

// ── RENDER SETTINGS ──
function renderSettingsInputs() {
    document.getElementById('setBrandName').value = settings.brandName || '';
    document.getElementById('setTagline').value = settings.tagline || '';
    document.getElementById('setColor').value = settings.primaryColor || '#2563eb';
    document.getElementById('setRadius').value = settings.borderRadius || 12;
    document.getElementById('setDarkMode').checked = !!settings.isDarkMode;
    document.getElementById('setTax').value = settings.taxPercentage || 0.5;
}

// ── EVENT LISTENERS INITIALIZATION ──
function initFormsAndEvents() {
    // Checkbox fee toggle
    document.getElementById('trxHasFee')?.addEventListener('change', (e) => {
        document.getElementById('trxFeeAmount').classList.toggle('hidden', !e.target.checked);
    });

    // Transaction form submit
    document.getElementById('trxForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const gross = parseInt(document.getElementById('trxGrossAmount').value, 10);
        const hasFee = document.getElementById('trxHasFee').checked;
        const fee = hasFee ? (parseInt(document.getElementById('trxFeeAmount').value, 10) || 0) : 0;

        const newTrx = {
            id: 'TRX-' + Date.now(),
            date: document.getElementById('trxDate').value || todayISO(),
            desc: document.getElementById('trxDesc').value,
            amount: gross,
            fee: fee,
            netAmount: gross - fee,
            type: document.getElementById('trxType').value,
            category: document.getElementById('trxCategory').value,
            wallet: document.getElementById('trxWallet').value,
            notes: '',
            customerPhone: document.getElementById('trxPhone').value
        };

        transactions.unshift(newTrx);
        saveState('sme_transactions', transactions);
        document.getElementById('trxForm').reset();
        document.getElementById('trxDate').value = todayISO();
        refreshAllUI();
        alert('Transaksi berhasil disimpan!');
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = btn.getAttribute('data-preset');
            const descInput = document.getElementById('trxDesc');
            const typeInput = document.getElementById('trxType');
            const catInput = document.getElementById('trxCategory');

            if (p === 'jual') { descInput.value = 'Penjualan Harian'; typeInput.value = 'income'; catInput.value = 'Penjualan'; }
            if (p === 'stok') { descInput.value = 'Beli Stok / Bahan'; typeInput.value = 'expense'; catInput.value = 'Bahan Baku'; }
            if (p === 'listrik') { descInput.value = 'Bayar Listrik/WiFi'; typeInput.value = 'expense'; catInput.value = 'Sewa & Listrik'; }
            if (p === 'makan') { descInput.value = 'Makan/Operasional'; typeInput.value = 'expense'; catInput.value = 'Operasional'; }
        });
    });

    // Debt form
    document.getElementById('debtForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const d = {
            id: 'DEBT-' + Date.now(),
            type: document.getElementById('debtType').value,
            contactName: document.getElementById('debtName').value,
            contactPhone: document.getElementById('debtPhone').value,
            amount: parseInt(document.getElementById('debtAmount').value, 10),
            dueDate: document.getElementById('debtDueDate').value,
            notes: document.getElementById('debtNotes').value,
            isPaid: false,
            dateCreated: todayISO()
        };
        debts.unshift(d);
        saveState('sme_debts', debts);
        document.getElementById('debtForm').reset();
        refreshAllUI();
    });

    // Transfer form
    document.getElementById('transferForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const from = document.getElementById('transferFrom').value;
        const to = document.getElementById('transferTo').value;
        const amt = parseInt(document.getElementById('transferAmount').value, 10);
        const notes = document.getElementById('transferNotes').value;

        if (from === to) { alert('Dompet asal dan tujuan tidak boleh sama!'); return; }

        transactions.unshift({
            id: 'TRX-TRF-' + Date.now(),
            date: todayISO(),
            desc: `Transfer Kas (${from} → ${to})`,
            amount: amt, fee: 0, netAmount: amt,
            type: 'expense', category: 'Lainnya', wallet: from, notes
        });
        transactions.unshift({
            id: 'TRX-TRF-' + (Date.now() + 1),
            date: todayISO(),
            desc: `Transfer Kas (${from} → ${to})`,
            amount: amt, fee: 0, netAmount: amt,
            type: 'income', category: 'Lainnya', wallet: to, notes
        });

        saveState('sme_transactions', transactions);
        document.getElementById('transferForm').reset();
        refreshAllUI();
        alert('Transfer antar dompet berhasil!');
    });

    // Bill form
    document.getElementById('billForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        bills.unshift({
            id: 'BILL-' + Date.now(),
            name: document.getElementById('billName').value,
            amount: parseInt(document.getElementById('billAmount').value, 10),
            period: document.getElementById('billPeriod').value,
            nextDueDate: document.getElementById('billNextDate').value,
            category: 'Sewa & Listrik'
        });
        saveState('sme_recurring', bills);
        document.getElementById('billForm').reset();
        refreshAllUI();
    });

    // Goal form
    document.getElementById('goalForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        goals.unshift({
            id: 'GOAL-' + Date.now(),
            name: document.getElementById('goalName').value,
            targetAmount: parseInt(document.getElementById('goalTarget').value, 10),
            currentAmount: 0,
            deadline: document.getElementById('goalDate').value
        });
        saveState('sme_goals', goals);
        document.getElementById('goalForm').reset();
        refreshAllUI();
    });

    // Save settings
    document.getElementById('btnSaveSettings')?.addEventListener('click', () => {
        settings.brandName = document.getElementById('setBrandName').value;
        settings.tagline = document.getElementById('setTagline').value;
        settings.primaryColor = document.getElementById('setColor').value;
        settings.borderRadius = parseInt(document.getElementById('setRadius').value, 10);
        settings.isDarkMode = document.getElementById('setDarkMode').checked;
        settings.taxPercentage = parseFloat(document.getElementById('setTax').value) || 0.5;

        saveState('sme_settings', settings);
        refreshAllUI();
        alert('Pengaturan disimpan!');
    });

    // Dark mode toggle top button
    document.getElementById('darkModeToggleBtn')?.addEventListener('click', () => {
        settings.isDarkMode = !settings.isDarkMode;
        saveState('sme_settings', settings);
        refreshAllUI();
    });

    // Database JSON backup/restore
    document.getElementById('btnBackupDb')?.addEventListener('click', exportJSON);
    document.getElementById('btnRestoreDb')?.addEventListener('click', () => document.getElementById('uploadDb').click());
    document.getElementById('uploadDb')?.addEventListener('change', importJSON);
    document.getElementById('btnResetDb')?.addEventListener('click', () => {
        if (confirm('APAKAH ANDA YAKIN INGIN MENGHAPUS SELURUH DATA? (Factory Reset)')) {
            localStorage.clear();
            location.reload();
        }
    });

    // Export CSV & Print
    document.getElementById('btnExportCSV')?.addEventListener('click', exportCSV);
    document.getElementById('btnReportPrint')?.addEventListener('click', () => window.print());
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());

    // Record Tax to Cash
    document.getElementById('recordTaxBtn')?.addEventListener('click', () => {
        const stats = calculateMonthlyStats();
        const taxVal = stats.inc * ((settings.taxPercentage || 0.5) / 100);
        if (taxVal > 0) {
            transactions.unshift({
                id: 'TRX-TAX-' + Date.now(),
                date: todayISO(),
                desc: 'Bayar Pajak PPh Final 0.5%',
                amount: taxVal, fee: 0, netAmount: taxVal,
                type: 'expense', category: 'Operasional', wallet: 'cash', notes: 'Setoran Pajak UMKM'
            });
            saveState('sme_transactions', transactions);
            refreshAllUI();
            alert('Pembayaran pajak berhasil dicatat ke kas!');
        }
    });

    // CMD Palette Ctrl+K
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleCmdPalette();
        }
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    document.getElementById('cmdPaletteTriggerBtn')?.addEventListener('click', toggleCmdPalette);
    document.getElementById('cmdResults')?.addEventListener('click', (e) => {
        const item = e.target.closest('.cmd-item');
        if (item) {
            const act = item.getAttribute('data-action');
            if (act === 'goto-dashboard') switchView('viewDashboard');
            if (act === 'goto-transactions') switchView('viewTransactions');
            if (act === 'goto-debts') switchView('viewDebts');
            if (act === 'toggle-theme') { settings.isDarkMode = !settings.isDarkMode; saveState('sme_settings', settings); refreshAllUI(); }
            closeAllModals();
        }
    });
}

function toggleCmdPalette() {
    const modal = document.getElementById('cmdPaletteModal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        document.getElementById('cmdInput').focus();
    }
}

function closeAllModals() {
    document.getElementById('cmdPaletteModal').classList.add('hidden');
    document.getElementById('receiptModal').classList.add('hidden');
    document.getElementById('authModal').classList.add('hidden');
}

// ── THERMAL RECEIPT ──
function printReceipt(id) {
    const t = transactions.find(x => x.id === id);
    if (!t) return;

    document.getElementById('rcptBrand').textContent = settings.brandName || 'FinOS UMKM';
    document.getElementById('rcptTagline').textContent = settings.tagline || 'Buku Kas Digital';
    document.getElementById('rcptDate').textContent = formatDateDisplay(t.date);
    document.getElementById('rcptId').textContent = t.id;
    document.getElementById('rcptDesc').textContent = t.desc;
    document.getElementById('rcptAmount').textContent = formatRupiah(t.netAmount || t.amount);

    document.getElementById('receiptModal').classList.remove('hidden');

    document.getElementById('btnPrintReceipt').onclick = () => window.print();
    document.getElementById('btnCloseReceipt').onclick = () => document.getElementById('receiptModal').classList.add('hidden');
    document.getElementById('btnShareWA').onclick = () => {
        if (t.customerPhone) sendWA(t.customerPhone, 'Pelanggan', t.netAmount || t.amount, t.date);
        else alert('No WhatsApp tidak dicantumkan.');
    };
}

// ── JSON EXPORT/IMPORT & CSV ──
function exportJSON() {
    const blob = new Blob([JSON.stringify({
        sme_transactions: transactions,
        sme_debts: debts,
        sme_recurring: bills,
        sme_goals: goals,
        sme_settings: settings
    }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup_finos_umkm.json';
    a.click();
}

function importJSON(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                if (data.sme_transactions) saveState('sme_transactions', data.sme_transactions);
                if (data.sme_debts) saveState('sme_debts', data.sme_debts);
                if (data.sme_recurring) saveState('sme_recurring', data.sme_recurring);
                if (data.sme_goals) saveState('sme_goals', data.sme_goals);
                if (data.sme_settings) saveState('sme_settings', data.sme_settings);
                loadAllState();
                refreshAllUI();
                alert('Restore data berhasil!');
            } catch (err) {
                alert('Gagal membaca file backup.');
            }
        };
        reader.readAsText(file);
    }
}

function exportCSV() {
    let csv = '\uFEFFID,Tanggal,Deskripsi,Jenis,Kategori,Dompet,Nominal,Fee,Net\n';
    transactions.forEach(t => {
        csv += `"${t.id}","${t.date}","${t.desc}","${t.type}","${t.category}","${t.wallet}",${t.amount},${t.fee || 0},${t.netAmount || t.amount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mutasi_kas_umkm.csv';
    a.click();
}

// ── INIT APP ──
function initApp() {
    loadAllState();
    initRouter();
    initFormsAndEvents();
    document.getElementById('trxDate').value = todayISO();
    document.getElementById('debtDueDate').value = todayISO();
    refreshAllUI();
}

document.addEventListener('DOMContentLoaded', initApp);