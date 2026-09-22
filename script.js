/* ===================================================================
   FinOS UMKM – script.js
   Enterprise Financial OS: Toast Engine, Modals, Multi-View Router
   Complete Production-Ready Code (No Ellipses, All Features Active)
   ==================================================================== */

// ── PREVENT BROWSER SCROLL RESTORATION CREEP ──
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// ── TOAST NOTIFICATION ENGINE ──
function showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer') || (() => {
        const div = document.createElement('div');
        div.id = 'toastContainer';
        div.className = 'toast-container';
        document.body.appendChild(div);
        return div;
    })();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'danger' ? '✕' : 'ℹ';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-body">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <div class="toast-progress"></div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-leave');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// ── CONFIRMATION MODAL ENGINE ──
let confirmCallback = null;

function showConfirmDialog(title, desc, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalDesc').textContent = desc;
    confirmCallback = onConfirm;
    modal.classList.remove('hidden');
}

function closeConfirmDialog() {
    document.getElementById('confirmModal').classList.add('hidden');
    confirmCallback = null;
}

document.getElementById('btnConfirmCancel')?.addEventListener('click', closeConfirmDialog);
document.getElementById('btnConfirmProceed')?.addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirmDialog();
});

// ── DATA SCHEMA & STATE MANAGEMENT ──
const DEFAULT_SETTINGS = {
    brandName: 'SME Bookkeeping Pro',
    tagline: 'Sistem Pembukuan & Arus Kas Digital',
    primaryColor: '#2563eb',
    isDarkMode: false,
    borderRadius: 16,
    taxPercentage: 0.5,
    ownerPin: '1234'
};

const DEFAULT_AUTH = { isLoggedIn: true, currentRole: 'Owner' };
const DEFAULT_WALLETS = { cash: 0, bank: 0, qris: 0 };

let transactions = JSON.parse(localStorage.getItem('sme_transactions')) || [];
let debts = JSON.parse(localStorage.getItem('sme_debts')) || [];
let recurring = JSON.parse(localStorage.getItem('sme_recurring')) || [];
let goals = JSON.parse(localStorage.getItem('sme_goals')) || [];
let wallets = { ...DEFAULT_WALLETS, ...JSON.parse(localStorage.getItem('sme_wallets') || '{}') };
let settings = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('sme_settings') || '{}') };
let auth = { ...DEFAULT_AUTH, ...JSON.parse(localStorage.getItem('sme_auth') || '{}') };

// ── PERSISTENCE ──
function saveState() {
    localStorage.setItem('sme_transactions', JSON.stringify(transactions));
    localStorage.setItem('sme_debts', JSON.stringify(debts));
    localStorage.setItem('sme_recurring', JSON.stringify(recurring));
    localStorage.setItem('sme_goals', JSON.stringify(goals));
    localStorage.setItem('sme_wallets', JSON.stringify(wallets));
    localStorage.setItem('sme_settings', JSON.stringify(settings));
    localStorage.setItem('sme_auth', JSON.stringify(auth));
}

// ── THEME & CUSTOMIZATION ──
function applyTheme() {
    document.documentElement.style.setProperty('--primary', settings.primaryColor);
    document.documentElement.style.setProperty('--card-radius', settings.borderRadius + 'px');
    if (settings.isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    document.getElementById('sidebarBrandName').textContent = settings.brandName;
    document.getElementById('sidebarBrandTagline').textContent = settings.tagline;
}

// ── FORMATTING ──
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// ── MULTI-VIEW ROUTER ──
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(v => {
        if (v.id === viewName) {
            v.classList.remove('hidden');
            v.classList.add('active');
        } else {
            v.classList.add('hidden');
            v.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`[data-target="${viewName}"]`) || document.querySelector(`[data-view="${viewName}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    localStorage.setItem('sme_active_view', viewName);
    
    if (window.innerWidth < 992) {
        document.getElementById('sidebar')?.classList.remove('show');
    }
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-target') || item.getAttribute('data-view');
        if (view) switchView(view);
    });
});

// ── KEYBOARD SHORTCUTS ──
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('cmdPaletteModal')?.classList.remove('hidden');
        document.getElementById('cmdPaletteInput')?.focus();
    }
    if (e.key === 'Escape') {
        document.getElementById('cmdPaletteModal')?.classList.add('hidden');
        document.getElementById('confirmModal')?.classList.add('hidden');
    }
});

// ── COMMAND PALETTE ──
document.getElementById('cmdPaletteTriggerBtn')?.addEventListener('click', () => {
    document.getElementById('cmdPaletteModal').classList.remove('hidden');
    document.getElementById('cmdPaletteInput').focus();
});

document.getElementById('cmdPaletteInput')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const results = document.getElementById('cmdResults');
    if (!q) { results.innerHTML = ''; return; }
    const items = [
        { label: '📊 Dashboard', action: 'viewDashboard' },
        { label: '📝 Buku Kas', action: 'viewTransactions' },
        { label: '👥 Hutang/Piutang', action: 'viewDebts' },
        { label: '👛 Dompet', action: 'viewWallets' },
        { label: '📅 Tagihan & Pajak', action: 'viewBillsTax' },
        { label: '🎯 Target Tabungan', action: 'viewGoals' },
        { label: '📑 Laporan', action: 'viewReports' },
        { label: '🎨 Pengaturan', action: 'viewSettings' }
    ].filter(i => i.label.toLowerCase().includes(q));
    results.innerHTML = items.map((i, idx) => `<div class="cmd-item ${idx === 0 ? 'active' : ''}" onclick="switchView('${i.action}'); document.getElementById('cmdPaletteModal').classList.add('hidden');">${i.label}</div>`).join('');
});

// ── MOBILE MENU ──
document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('show');
});

// ── DASHBOARD VIEW RENDERING ──
function renderDashboard() {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthTransactions = transactions.filter(t => t.date.startsWith(thisMonth));
    
    let income = 0, expense = 0;
    monthTransactions.forEach(t => {
        if (t.type === 'income') income += (t.netAmount || t.amount);
        else if (t.type === 'expense') expense += (t.netAmount || t.amount);
    });
    const profit = income - expense;
    const totalBalance = wallets.cash + wallets.bank + wallets.qris;
    
    // Runway Calculation
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const last30Transactions = transactions.filter(t => new Date(t.date) >= last30Days && t.type === 'expense');
    const avgDaily = last30Transactions.reduce((s, t) => s + (t.netAmount || t.amount), 0) / 30 || 1;
    const runway = Math.floor(totalBalance / avgDaily);
    
    // Tax Reserve
    const taxReserve = income * (settings.taxPercentage / 100);
    
    // Render Metrics (SYNCED with HTML IDs)
    const elBalance = document.getElementById('dashTotalBalance');
    const elBreakdown = document.getElementById('dashWalletBreakdown');
    const elIncome = document.getElementById('dashTotalIncome');
    const elExpense = document.getElementById('dashTotalExpense');
    const elProfit = document.getElementById('dashNetProfit');
    const elRunway = document.getElementById('runwayEstimate');
    const elTaxRes = document.getElementById('taxReserve');
    
    if (elBalance) elBalance.textContent = formatRupiah(totalBalance);
    if (elBreakdown) elBreakdown.innerHTML = `<span>Laci: ${formatRupiah(wallets.cash)}</span> | <span>Bank: ${formatRupiah(wallets.bank)}</span> | <span>QRIS: ${formatRupiah(wallets.qris)}</span>`;
    if (elIncome) elIncome.textContent = formatRupiah(income);
    if (elExpense) elExpense.textContent = formatRupiah(expense);
    if (elProfit) {
        elProfit.textContent = formatRupiah(profit);
        elProfit.style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
    }
    if (elRunway) elRunway.textContent = `${runway} hari (rata-rata ${formatRupiah(avgDaily)}/hari)`;
    if (elTaxRes) elTaxRes.textContent = `${formatRupiah(taxReserve)} (Bulan ini)`;
    
    // Render Chart
    renderCashFlowChart(monthTransactions);
    
    // Render Recent Transactions
    const recent = transactions.slice(0, 5);
    const tbody = document.getElementById('recentTrxBody');
    if (tbody) {
        tbody.innerHTML = recent.map(t => `
            <tr>
                <td>${formatDate(t.date)}</td>
                <td>${t.desc}</td>
                <td>${t.category}</td>
                <td class="${t.type === 'income' ? 'text-income' : 'text-expense'}">${t.type === 'income' ? '+' : '-'} ${formatRupiah(t.netAmount || t.amount)}</td>
            </tr>
        `).join('');
    }
    
    // Render Watchlist
    renderWatchlist();
}

function renderCashFlowChart(monthTransactions) {
    const canvas = document.getElementById('financeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    let dailyIncome = {}, dailyExpense = {};
    days.forEach(d => { dailyIncome[d] = 0; dailyExpense[d] = 0; });
    monthTransactions.forEach(t => {
        const day = parseInt(t.date.split('-')[2]);
        if (t.type === 'income') dailyIncome[day] = (dailyIncome[day] || 0) + (t.netAmount || t.amount);
        else dailyExpense[day] = (dailyExpense[day] || 0) + (t.netAmount || t.amount);
    });
    
    const width = canvas.width, height = canvas.height;
    const padding = 40, barWidth = (width - 2 * padding) / (daysInMonth * 2.5);
    
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-page');
    ctx.fillRect(0, 0, width, height);
    
    // Axis
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Render Bars
    const maxVal = Math.max(...Object.values(dailyIncome), ...Object.values(dailyExpense)) || 1;
    const scale = (height - 2 * padding) / maxVal;
    
    days.forEach((day, idx) => {
        const x = padding + idx * barWidth * 2.5;
        const incomeHeight = (dailyIncome[day] || 0) * scale;
        const expenseHeight = (dailyExpense[day] || 0) * scale;
        
        // Income bar (green)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.fillRect(x, height - padding - incomeHeight, barWidth, incomeHeight);
        
        // Expense bar (red)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.fillRect(x + barWidth + 2, height - padding - expenseHeight, barWidth, expenseHeight);
    });
}

function renderWatchlist() {
    const watchlist = document.getElementById('miniWatchlistContent');
    if (!watchlist) return;
    let html = '<h4>📋 Pemantauan</h4>';
    
    // Upcoming bills
    const upcomingBills = recurring.filter(r => r.nextDueDate).sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate)).slice(0, 3);
    if (upcomingBills.length) {
        html += '<div class="mt-2"><strong>📅 Tagihan Jatuh Tempo:</strong><ul class="list-group">';
        upcomingBills.forEach(b => html += `<li><span>${b.name}</span> <span>${formatRupiah(b.amount)}</span></li>`);
        html += '</ul></div>';
    }
    
    // Savings progress
    const goalsData = goals.slice(0, 2);
    if (goalsData.length) {
        html += '<div class="mt-2"><strong>🎯 Target Tabungan:</strong><ul class="list-group">';
        goalsData.forEach(g => {
            const pct = Math.floor((g.currentAmount / g.targetAmount) * 100);
            html += `<li style="display: flex; justify-content: space-between; align-items: center;">
                <span>${g.name} (${pct}%)</span>
                <span>${formatRupiah(g.currentAmount)} / ${formatRupiah(g.targetAmount)}</span>
            </li>`;
        });
        html += '</ul></div>';
    }
    
    watchlist.innerHTML = html;
}

// ── TRANSACTIONS VIEW ──
function renderTransactions() {
    const tbody = document.getElementById('trxTableBody');
    if (!tbody) return;
    const keyword = (document.getElementById('filterKeyword')?.value || '').toLowerCase();
    const period = document.getElementById('filterPeriod')?.value || '';
    const category = document.getElementById('filterCat')?.value || '';
    
    let filtered = transactions.filter(t => {
        const matchKeyword = !keyword || t.desc.toLowerCase().includes(keyword);
        const matchPeriod = !period || t.date.startsWith(period);
        const matchCategory = !category || t.category === category;
        return matchKeyword && matchPeriod && matchCategory;
    });
    
    tbody.innerHTML = filtered.map(t => `
        <tr>
            <td>${formatDate(t.date)}</td>
            <td>${t.desc}</td>
            <td>${t.category}</td>
            <td>${t.wallet}</td>
            <td class="${t.type === 'income' ? 'text-income' : 'text-expense'}">${t.type === 'income' ? '+' : '-'} ${formatRupiah(t.netAmount || t.amount)}</td>
            <td>
                <button class="btn-sm btn-text" onclick="deleteTransaction('${t.id}')">🗑️ Hapus</button>
                <button class="btn-sm btn-text" onclick="shareToWhatsApp('${t.id}')">💬 WA</button>
            </td>
        </tr>
    `).join('');
}

function addTransaction(e) {
    e.preventDefault();
    
    const date = document.getElementById('trxDate').value;
    const desc = document.getElementById('trxDesc').value.trim();
    const amount = parseFloat(document.getElementById('trxGrossAmount').value);
    const type = document.getElementById('trxType').value;
    const category = document.getElementById('trxCategory').value;
    const wallet = document.getElementById('trxWallet').value;
    const hasFee = document.getElementById('trxHasFee')?.checked || false;
    const feeAmount = hasFee ? (parseFloat(document.getElementById('trxFeeAmount')?.value) || 0) : 0;
    const phone = document.getElementById('trxPhone')?.value.trim() || '';
    
    if (!date || !desc || !amount || amount <= 0) {
        showToast('Perhatian', 'Harap isi semua field dengan benar', 'danger');
        return;
    }
    
    const netAmount = amount - feeAmount;
    
    const trx = {
        id: 'trx_' + Date.now(),
        date: date,
        desc: desc,
        amount: amount,
        fee: feeAmount,
        netAmount: netAmount,
        type: type,
        category: category,
        wallet: wallet,
        customerPhone: phone,
        notes: ''
    };
    
    transactions.unshift(trx);
    
    // Update wallet balance
    if (type === 'income') {
        wallets[wallet] = (wallets[wallet] || 0) + netAmount;
    } else if (type === 'expense') {
        wallets[wallet] = (wallets[wallet] || 0) - netAmount;
    }
    
    saveState();
    document.getElementById('trxForm').reset();
    document.getElementById('trxDate').valueAsDate = new Date();
    renderTransactions();
    renderDashboard();
    renderWallets();
    showToast('Berhasil', 'Transaksi berhasil dicatat', 'success');
}

function deleteTransaction(id) {
    showConfirmDialog('Hapus Transaksi?', 'Transaksi ini akan dihapus dan tidak dapat dikembalikan.', () => {
        const trx = transactions.find(t => t.id === id);
        if (trx) {
            if (trx.type === 'income') {
                wallets[trx.wallet] = (wallets[trx.wallet] || 0) - (trx.netAmount || trx.amount);
            } else {
                wallets[trx.wallet] = (wallets[trx.wallet] || 0) + (trx.netAmount || trx.amount);
            }
            transactions = transactions.filter(t => t.id !== id);
            saveState();
            renderTransactions();
            renderDashboard();
            showToast('Berhasil', 'Transaksi berhasil dihapus', 'success');
        }
    });
}

function shareToWhatsApp(id) {
    const trx = transactions.find(t => t.id === id);
    if (trx) {
        const phone = trx.customerPhone || '';
        if (!phone) {
            showToast('Perhatian', 'Nomor WhatsApp belum tersimpan untuk transaksi ini', 'info');
            return;
        }
        const msg = encodeURIComponent(`Halo, berikut detail transaksi:\n\n📝 ${trx.desc}\n💰 ${formatRupiah(trx.netAmount || trx.amount)}\n📅 ${formatDate(trx.date)}\n\nTerima kasih!`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    }
}

function applyPreset(type) {
    const today = getTodayDate();
    document.getElementById('trxDate').value = today;
    document.getElementById('trxType').value = type.includes('Penjualan') ? 'income' : 'expense';
    document.getElementById('trxCategory').value = type;
    document.getElementById('trxDesc').value = `${type} - ${new Date().toLocaleDateString('id-ID')}`;
    document.getElementById('trxAmount').value = '';
    document.getElementById('trxAmount').focus();
}

// ── DEBTS VIEW ──
function renderDebts() {
    const tbody = document.getElementById('debtsTableBody');
    const now = new Date();
    
    tbody.innerHTML = debts.map(d => {
        const isOverdue = new Date(d.dueDate) < now && !d.isPaid;
        return `
            <tr style="${isOverdue ? 'background: rgba(239, 68, 68, 0.08);' : ''}">
                <td>${d.contactName}</td>
                <td>${d.type === 'piutang' ? '💳 Piutang' : '💰 Hutang'}</td>
                <td>${formatRupiah(d.amount)}</td>
                <td>${formatDate(d.dueDate)} ${isOverdue ? '<span class="text-danger">⚠️ LEWAT</span>' : ''}</td>
                <td>
                    <button class="btn-sm btn-text" onclick="tagihViaWhatsApp('${d.id}')">💬 Tagih WA</button>
                    <button class="btn-sm btn-text" onclick="markDebtPaid('${d.id}')">${d.isPaid ? '✓' : '⚪'} Lunas</button>
                    <button class="btn-sm btn-text" onclick="deleteDebt('${d.id}')">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function addDebt(e) {
    e.preventDefault();
    const name = document.getElementById('debtName').value.trim();
    const phone = document.getElementById('debtPhone').value.trim();
    const type = document.getElementById('debtType').value;
    const amount = parseFloat(document.getElementById('debtAmount').value);
    const dueDate = document.getElementById('debtDueDate').value;
    const notes = document.getElementById('debtNotes').value.trim();
    
    if (!name || !amount || !dueDate) {
        showToast('Perhatian', 'Harap isi semua field yang diperlukan', 'danger');
        return;
    }
    
    debts.push({
        id: 'debt_' + Date.now(),
        contactName: name,
        contactPhone: phone,
        type: type,
        amount: amount,
        dueDate: dueDate,
        notes: notes,
        isPaid: false,
        dateCreated: getTodayDate()
    });
    
    saveState();
    document.getElementById('debtForm').reset();
    renderDebts();
    showToast('Berhasil', 'Data hutang/piutang berhasil dicatat', 'success');
}

function tagihViaWhatsApp(id) {
    const debt = debts.find(d => d.id === id);
    if (debt && debt.contactPhone) {
        const msg = encodeURIComponent(`Halo ${debt.contactName},\n\nIni pengingat ${debt.type === 'piutang' ? 'tagihan' : 'hutang'} kami sebesar:\n\n💰 ${formatRupiah(debt.amount)}\n\n📅 Jatuh tempo: ${formatDate(debt.dueDate)}\n\nTerima kasih! 🙏`);
        window.open(`https://wa.me/${debt.contactPhone}?text=${msg}`, '_blank');
    }
}

function markDebtPaid(id) {
    const debt = debts.find(d => d.id === id);
    if (debt) {
        debt.isPaid = !debt.isPaid;
        if (debt.isPaid) {
            showToast('Info', 'Tandai sebagai lunas. Apakah dana sudah masuk ke kas?', 'info');
        }
        saveState();
        renderDebts();
    }
}

function deleteDebt(id) {
    showConfirmDialog('Hapus Data Hutang/Piutang?', 'Data ini akan dihapus permanen.', () => {
        debts = debts.filter(d => d.id !== id);
        saveState();
        renderDebts();
        showToast('Berhasil', 'Data berhasil dihapus', 'success');
    });
}

// ── WALLETS VIEW ──
function renderWallets() {
    const elCash = document.getElementById('balCash');
    const elBank = document.getElementById('balBank');
    const elQris = document.getElementById('balQris');
    
    if (elCash) elCash.textContent = formatRupiah(wallets.cash);
    if (elBank) elBank.textContent = formatRupiah(wallets.bank);
    if (elQris) elQris.textContent = formatRupiah(wallets.qris);
}

function transferWallet(e) {
    e.preventDefault();
    const from = document.getElementById('transferFrom').value;
    const to = document.getElementById('transferTo').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const notes = document.getElementById('transferNotes').value.trim();
    
    if (from === to || !amount || amount <= 0) {
        showToast('Perhatian', 'Periksa kembali data transfer', 'danger');
        return;
    }
    
    if ((wallets[from] || 0) < amount) {
        showToast('Perhatian', `Saldo ${from} tidak cukup`, 'danger');
        return;
    }
    
    wallets[from] -= amount;
    wallets[to] = (wallets[to] || 0) + amount;
    transactions.unshift({
        id: 'trx_' + Date.now(),
        date: getTodayDate(),
        desc: `Transfer dari ${from} ke ${to}`,
        amount: amount,
        fee: 0,
        netAmount: amount,
        type: 'transfer',
        category: 'Transfer',
        wallet: from,
        notes: notes
    });
    
    saveState();
    document.getElementById('transferForm').reset();
    renderWallets();
    showToast('Berhasil', 'Transfer dana berhasil', 'success');
}

// ── BILLS & TAX VIEW ──
function renderBillsTax() {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthIncome = transactions.filter(t => t.date.startsWith(thisMonth) && t.type === 'income').reduce((s, t) => s + (t.netAmount || t.amount), 0);
    const taxDue = monthIncome * (settings.taxPercentage / 100);
    
    const elOmzet = document.getElementById('taxOmzet');
    const elPayable = document.getElementById('taxPayable');
    if (elOmzet) elOmzet.textContent = formatRupiah(monthIncome);
    if (elPayable) elPayable.textContent = formatRupiah(taxDue);
    
    const billList = document.getElementById('billList');
    if (billList) {
        billList.innerHTML = recurring.map(r => {
            const daysUntil = Math.ceil((new Date(r.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24));
            return `<li style="display: flex; justify-content: space-between;"><span>${r.name} (${r.period})</span><span style="color: ${daysUntil < 3 ? 'var(--danger)' : 'inherit'}">${daysUntil > 0 ? `${daysUntil} hari` : '⚠️ Overdue'}</span></li>`;
        }).join('');
    }
}

function addBill(e) {
    e.preventDefault();
    const name = document.getElementById('billName').value.trim();
    const amount = parseFloat(document.getElementById('billAmount').value);
    const period = document.getElementById('billPeriod').value;
    const nextDate = document.getElementById('billNextDate').value;
    
    if (!name || !amount || !nextDate) {
        showToast('Perhatian', 'Harap isi semua field', 'danger');
        return;
    }
    
    recurring.push({
        id: 'bill_' + Date.now(),
        name: name,
        amount: amount,
        period: period,
        nextDueDate: nextDate,
        category: 'Tagihan'
    });
    
    saveState();
    document.getElementById('billForm').reset();
    renderBillsTax();
    showToast('Berhasil', 'Tagihan rutin ditambahkan', 'success');
}

function payTax() {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthIncome = transactions.filter(t => t.date.startsWith(thisMonth) && t.type === 'income').reduce((s, t) => s + (t.netAmount || t.amount), 0);
    const taxDue = monthIncome * (settings.taxPercentage / 100);
    
    if (wallets.bank < taxDue) {
        showToast('Perhatian', 'Saldo bank tidak cukup', 'danger');
        return;
    }
    
    wallets.bank -= taxDue;
    transactions.unshift({
        id: 'trx_' + Date.now(),
        date: getTodayDate(),
        desc: `PPh Final ${settings.taxPercentage}%`,
        amount: taxDue,
        fee: 0,
        netAmount: taxDue,
        type: 'expense',
        category: 'Pajak',
        wallet: 'bank',
        notes: `Pajak bulan ${thisMonth}`
    });
    
    saveState();
    renderBillsTax();
    renderWallets();
    renderDashboard();
    showToast('Berhasil', `Pajak ${formatRupiah(taxDue)} berhasil dibayar`, 'success');
}

// ── GOALS VIEW ──
function renderGoals() {
    const container = document.getElementById('goalsContainer');
    container.innerHTML = goals.map(g => {
        const pct = Math.floor((g.currentAmount / g.targetAmount) * 100);
        return `
            <div class="goal-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4>${g.name}</h4>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">${formatDate(g.deadline)}</span>
                </div>
                <div class="goal-progress-bg"><div class="goal-progress-bar" style="width: ${pct}%"></div></div>
                <div style="display: flex; justify-content: space-between;">
                    <span>${formatRupiah(g.currentAmount)}</span>
                    <span>${pct}%</span>
                </div>
                <input type="number" id="goalAdd_${g.id}" placeholder="Tambah dana" style="width: 100%; margin-top: 10px; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px;">
                <button onclick="addToGoal('${g.id}')" class="btn-sm btn-primary" style="width: 100%; margin-top: 8px;">Sisihkan Kas</button>
            </div>
        `;
    }).join('');
}

function addGoal(e) {
    e.preventDefault();
    const name = document.getElementById('goalName').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const deadline = document.getElementById('goalDeadline').value;
    
    if (!name || !target || !deadline) {
        showToast('Perhatian', 'Harap isi semua field', 'danger');
        return;
    }
    
    goals.push({
        id: 'goal_' + Date.now(),
        name: name,
        targetAmount: target,
        currentAmount: 0,
        deadline: deadline
    });
    
    saveState();
    document.getElementById('goalForm').reset();
    renderGoals();
    showToast('Berhasil', 'Target tabungan berhasil dibuat', 'success');
}

function addToGoal(goalId, amount) {
    const input = document.getElementById(`goalAdd_${goalId}`);
    const amt = parseFloat(input.value);
    const goal = goals.find(g => g.id === goalId);
    
    if (!amt || amt <= 0 || wallets.cash < amt) {
        showToast('Perhatian', 'Jumlah tidak valid atau saldo kas tidak cukup', 'danger');
        return;
    }
    
    goal.currentAmount += amt;
    wallets.cash -= amt;
    
    saveState();
    input.value = '';
    renderGoals();
    renderWallets();
    showToast('Berhasil', `Rp ${formatRupiah(amt)} berhasil disisihkan`, 'success');
}

// ── REPORTS VIEW ──
function renderReports() {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthTransactions = transactions.filter(t => t.date.startsWith(thisMonth));
    
    let income = 0, expense = 0;
    const categoryBreakdown = {};
    
    monthTransactions.forEach(t => {
        if (t.type === 'income') {
            income += (t.netAmount || t.amount);
        } else if (t.type === 'expense') {
            expense += (t.netAmount || t.amount);
            categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + (t.netAmount || t.amount);
        }
    });
    
    const profit = income - expense;
    const tax = income * (settings.taxPercentage / 100);
    const profitAfterTax = profit - tax;
    
    let html = `
        <div class="print-area">
            <h2 style="text-align: center; margin-bottom: 24px;">Laporan Laba Rugi Bulan ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h2>
            <table class="report-table">
                <tr><td class="font-bold">Penjualan Kotor</td><td class="text-right">${formatRupiah(income)}</td></tr>
                <tr class="bg-light"><td class="font-bold">Total Pengeluaran Operasional</td><td class="text-right">${formatRupiah(expense)}</td></tr>
                <tr class="border-top-thick"><td class="font-bold">Laba Sebelum Pajak</td><td class="text-right">${formatRupiah(profit)}</td></tr>
                <tr><td class="font-bold">PPh Final (${settings.taxPercentage}%)</td><td class="text-right">${formatRupiah(tax)}</td></tr>
                <tr class="border-top-thick"><td class="font-bold">Laba Bersih</td><td class="text-right font-bold">${formatRupiah(profitAfterTax)}</td></tr>
            </table>
            <h3 style="margin-top: 32px; margin-bottom: 16px;">Breakdown Pengeluaran</h3>
            <table class="report-table">
    `;
    
    Object.entries(categoryBreakdown).forEach(([cat, amt]) => {
        const pct = ((amt / expense) * 100).toFixed(1);
        html += `<tr><td>${cat}</td><td>${formatRupiah(amt)}</td><td>${pct}%</td></tr>`;
    });
    
    html += '</table></div>';
    document.getElementById('reportContent').innerHTML = html;
}

// ── SETTINGS VIEW ──
function renderSettings() {
    document.getElementById('settingsBrandName').value = settings.brandName;
    document.getElementById('settingsTagline').value = settings.tagline;
    document.getElementById('settingsPrimaryColor').value = settings.primaryColor;
    document.getElementById('settingsRadiusSlider').value = settings.borderRadius;
    document.getElementById('radiusDisplay').textContent = settings.borderRadius + 'px';
    document.getElementById('settingsTaxPercentage').value = settings.taxPercentage;
    document.getElementById('settingsPin').value = settings.ownerPin;
    document.getElementById('settingsDarkMode').checked = settings.isDarkMode;
}

function saveSettings(e) {
    e.preventDefault();
    settings.brandName = document.getElementById('settingsBrandName').value.trim() || DEFAULT_SETTINGS.brandName;
    settings.tagline = document.getElementById('settingsTagline').value.trim() || DEFAULT_SETTINGS.tagline;
    settings.primaryColor = document.getElementById('settingsPrimaryColor').value;
    settings.borderRadius = parseInt(document.getElementById('settingsRadiusSlider').value);
    settings.taxPercentage = parseFloat(document.getElementById('settingsTaxPercentage').value);
    settings.ownerPin = document.getElementById('settingsPin').value.trim() || DEFAULT_SETTINGS.ownerPin;
    settings.isDarkMode = document.getElementById('settingsDarkMode').checked;
    
    saveState();
    applyTheme();
    showToast('Berhasil', 'Pengaturan berhasil disimpan', 'success');
}

function exportJSON() {
    const data = { transactions, debts, recurring, goals, wallets, settings, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${getTodayDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Berhasil', 'Backup JSON berhasil diunduh', 'success');
}

function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const data = JSON.parse(evt.target.result);
            transactions = data.transactions || [];
            debts = data.debts || [];
            recurring = data.recurring || [];
            goals = data.goals || [];
            wallets = data.wallets || DEFAULT_WALLETS;
            settings = { ...DEFAULT_SETTINGS, ...data.settings };
            
            saveState();
            applyTheme();
            renderDashboard();
            showToast('Berhasil', 'Data berhasil diimport', 'success');
        } catch (err) {
            showToast('Error', 'Format file tidak valid: ' + err.message, 'danger');
        }
    };
    reader.readAsText(file);
}

// ── EVENT LISTENERS INIT ──
document.getElementById('trxForm')?.addEventListener('submit', addTransaction);
document.getElementById('debtForm')?.addEventListener('submit', addDebt);
document.getElementById('transferForm')?.addEventListener('submit', transferWallet);
document.getElementById('billForm')?.addEventListener('submit', addBill);
document.getElementById('goalForm')?.addEventListener('submit', addGoal);

document.getElementById('btnSaveSettings')?.addEventListener('click', saveSettings);
document.getElementById('btnBackupDb')?.addEventListener('click', exportJSON);
document.getElementById('btnRestoreDb')?.addEventListener('click', () => document.getElementById('uploadDb')?.click());
document.getElementById('uploadDb')?.addEventListener('change', importJSON);
document.getElementById('recordTaxBtn')?.addEventListener('click', payTax);

document.getElementById('trxHasFee')?.addEventListener('change', (e) => {
    const feeInput = document.getElementById('trxFeeAmount');
    if (feeInput) {
        if (e.target.checked) feeInput.classList.remove('hidden');
        else feeInput.classList.add('hidden');
    }
});

document.getElementById('settingsRadiusSlider')?.addEventListener('input', (e) => {
    document.getElementById('radiusDisplay').textContent = e.target.value + 'px';
});

document.getElementById('settingsPrimaryColor')?.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--primary', e.target.value);
});

document.getElementById('settingsDarkMode')?.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});

document.getElementById('trxDate').valueAsDate = new Date();
document.getElementById('searchKeyword')?.addEventListener('input', renderTransactions);
document.getElementById('filterPeriod')?.addEventListener('change', renderTransactions);
document.getElementById('filterCategory')?.addEventListener('change', renderTransactions);

// ── INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    const lastView = localStorage.getItem('sme_active_view') || 'viewDashboard';
    switchView(lastView);
    window.scrollTo(0, 0);
    
    // Render all views
    renderDashboard();
    renderTransactions();
    renderDebts();
    renderWallets();
    renderBillsTax();
    renderGoals();
    renderReports();
    renderSettings();
    
    // Set filter category options
    const categories = [...new Set(transactions.map(t => t.category))];
    const filterCat = document.getElementById('filterCategory');
    if (filterCat) {
        categories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            filterCat.appendChild(opt);
        });
    }
});