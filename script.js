/* ===================================================================
   SME Bookkeeping Pro – script.js
   Full-featured: CRUD, Chart, Customizer, Export, Auth, Filters
   =================================================================== */

// ── DEFAULT CONSTANTS ──
const DEFAULT_SETTINGS = {
    brandName: 'Buku Kas Pro UMKM',
    tagline: 'Sistem Pembukuan & Arus Kas Digital',
    currency: 'IDR',
    primaryColor: '#2563eb',
    isDarkMode: false,
    borderRadius: 12,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    compactView: false,
    ownerPin: '1234'
};

const DEFAULT_AUTH = {
    isLoggedIn: true,
    currentRole: 'Owner'
};

const DEFAULT_TRANSACTIONS = [
    {
        id: 'trx_1700000001',
        date: todayISO(),
        desc: 'Penjualan Kopi Susu',
        amount: 150000,
        type: 'income',
        category: 'Penjualan',
        notes: 'Tunai'
    },
    {
        id: 'trx_1700000002',
        date: todayISO(),
        desc: 'Beli Biji Kopi Arabika',
        amount: 85000,
        type: 'expense',
        category: 'Bahan Baku',
        notes: 'Supplier CV Kopi Nusantara'
    },
    {
        id: 'trx_1700000003',
        date: todayISO(),
        desc: 'Bayar WiFi Bulanan',
        amount: 100000,
        type: 'expense',
        category: 'Sewa & Listrik',
        notes: 'Invoice #INV-2026-01'
    }
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
    }).format(num);
}

function formatDateDisplay(isoStr) {
    if (!isoStr) return '-';
    const parts = isoStr.split('-');
    if (parts.length !== 3) return isoStr;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function generateId() {
    return 'trx_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

// ── STATE ──
let transactions = [];
let settings = {};
let auth = {};

function loadState() {
    try {
        const savedTrx = localStorage.getItem('sme_transactions');
        transactions = savedTrx ? JSON.parse(savedTrx) : JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS));
    } catch (e) {
        transactions = JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS));
    }
    try {
        const savedSettings = localStorage.getItem('sme_settings');
        settings = savedSettings ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(savedSettings)) : Object.assign({}, DEFAULT_SETTINGS);
    } catch (e) {
        settings = Object.assign({}, DEFAULT_SETTINGS);
    }
    try {
        const savedAuth = localStorage.getItem('sme_auth');
        auth = savedAuth ? Object.assign({}, DEFAULT_AUTH, JSON.parse(savedAuth)) : Object.assign({}, DEFAULT_AUTH);
    } catch (e) {
        auth = Object.assign({}, DEFAULT_AUTH);
    }
}

function saveTransactions() {
    localStorage.setItem('sme_transactions', JSON.stringify(transactions));
}

function saveSettings() {
    localStorage.setItem('sme_settings', JSON.stringify(settings));
}

function saveAuth() {
    localStorage.setItem('sme_auth', JSON.stringify(auth));
}

// ── APPLY SETTINGS TO DOM ──
function applySettings() {
    const root = document.documentElement;
    root.style.setProperty('--primary', settings.primaryColor);
    root.style.setProperty('--primary-hover', adjustColor(settings.primaryColor, -20));
    root.style.setProperty('--primary-light', settings.primaryColor + '1a');
    root.style.setProperty('--card-radius', settings.borderRadius + 'px');
    root.style.setProperty('--font-main', settings.fontFamily);
    document.body.style.fontFamily = settings.fontFamily;

    if (settings.isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    const brandEl = document.getElementById('brandNameDisplay');
    const taglineEl = document.getElementById('brandTaglineDisplay');
    if (brandEl) brandEl.textContent = settings.brandName;
    if (taglineEl) taglineEl.textContent = settings.tagline;
}

function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    let r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    let g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    let b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

// ── FINANCIALS ──
function calculateFinancials(list) {
    let totalIncome = 0;
    let totalExpense = 0;
    list.forEach(function (t) {
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else {
            totalExpense += t.amount;
        }
    });
    const totalBalance = totalIncome - totalExpense;
    const netProfit = totalBalance;
    return { totalIncome: totalIncome, totalExpense: totalExpense, totalBalance: totalBalance, netProfit: netProfit };
}

function updateMetricCards() {
    const fin = calculateFinancials(transactions);
    document.getElementById('statTotalBalance').textContent = formatRupiah(fin.totalBalance);
    document.getElementById('statTotalIncome').textContent = formatRupiah(fin.totalIncome);
    document.getElementById('statTotalExpense').textContent = formatRupiah(fin.totalExpense);

    const profitEl = document.getElementById('statNetProfit');
    profitEl.textContent = formatRupiah(fin.netProfit);
    if (fin.netProfit >= 0) {
        profitEl.style.color = 'var(--success)';
    } else {
        profitEl.style.color = 'var(--danger)';
    }
}

// ── CHART (Canvas) ──
function renderChart(income, expense) {
    const canvas = document.getElementById('financeChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = 180;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const total = income + expense;
    if (total === 0) {
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
        ctx.font = '500 14px ' + (settings.fontFamily || 'sans-serif');
        ctx.textAlign = 'center';
        ctx.fillText('Belum ada data arus kas', w / 2, h / 2);
        return;
    }

    // Draw donut chart
    const cx = w * 0.32;
    const cy = h / 2;
    const outerR = Math.min(cx - 20, cy - 15);
    const innerR = outerR * 0.55;
    const incomeAngle = (income / total) * Math.PI * 2;
    const startAngle = -Math.PI / 2;

    // Income arc
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, startAngle + incomeAngle);
    ctx.arc(cx, cy, innerR, startAngle + incomeAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--success').trim() || '#10b981';
    ctx.fill();

    // Expense arc
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle + incomeAngle, startAngle + Math.PI * 2);
    ctx.arc(cx, cy, innerR, startAngle + Math.PI * 2, startAngle + incomeAngle, true);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--danger').trim() || '#ef4444';
    ctx.fill();

    // Center text
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#0f172a';
    ctx.font = '700 14px ' + (settings.fontFamily || 'sans-serif');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatRupiah(income - expense), cx, cy);

    // Legend
    var legendX = w * 0.65;
    var legendY = h * 0.3;
    var incPct = Math.round((income / total) * 100);
    var expPct = 100 - incPct;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Income legend
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--success').trim() || '#10b981';
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#0f172a';
    ctx.font = '600 12px ' + (settings.fontFamily || 'sans-serif');
    ctx.fillText('Pemasukan (' + incPct + '%)', legendX + 14, legendY);
    ctx.font = '700 13px ' + (settings.fontFamily || 'sans-serif');
    ctx.fillText(formatRupiah(income), legendX + 14, legendY + 18);

    // Expense legend
    legendY = legendY + 48;
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--danger').trim() || '#ef4444';
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#0f172a';
    ctx.font = '600 12px ' + (settings.fontFamily || 'sans-serif');
    ctx.fillText('Pengeluaran (' + expPct + '%)', legendX + 14, legendY);
    ctx.font = '700 13px ' + (settings.fontFamily || 'sans-serif');
    ctx.fillText(formatRupiah(expense), legendX + 14, legendY + 18);
}

// ── TRANSACTION TABLE RENDER ──
function getFilteredTransactions() {
    var keyword = (document.getElementById('searchKeyword').value || '').toLowerCase().trim();
    var period = document.getElementById('filterPeriod').value;
    var category = document.getElementById('filterCategory').value;
    var now = new Date();
    var todayStr = todayISO();

    return transactions.filter(function (t) {
        // Keyword
        if (keyword && t.desc.toLowerCase().indexOf(keyword) === -1) return false;
        // Category
        if (category !== 'Semua' && t.category !== category) return false;
        // Period
        if (period === 'Hari Ini' && t.date !== todayStr) return false;
        if (period === '7 Hari Terakhir') {
            var trxDate = new Date(t.date);
            var diff = (now - trxDate) / (1000 * 60 * 60 * 24);
            if (diff > 7 || diff < 0) return false;
        }
        if (period === 'Bulan Ini') {
            var parts = t.date.split('-');
            if (parseInt(parts[0]) !== now.getFullYear() || parseInt(parts[1]) !== now.getMonth() + 1) return false;
        }
        return true;
    });
}

function renderTable() {
    var filtered = getFilteredTransactions();
    var tbody = document.getElementById('transactionTableBody');
    var emptyState = document.getElementById('emptyState');
    var table = document.getElementById('transactionTable');

    tbody.innerHTML = '';

    if (filtered.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    filtered.forEach(function (t) {
        var tr = document.createElement('tr');
        var sign = t.type === 'income' ? '+' : '-';
        var amtClass = t.type === 'income' ? 'amount-income' : 'amount-expense';
        var typeLabel = t.type === 'income' ? 'Masuk' : 'Keluar';
        var typeBadgeClass = t.type === 'income' ? 'income' : 'expense';

        tr.innerHTML =
            '<td>' + formatDateDisplay(t.date) + '</td>' +
            '<td>' + escapeHtml(t.desc) + '</td>' +
            '<td><span class="cat-badge">' + escapeHtml(t.category) + '</span></td>' +
            '<td>' + escapeHtml(t.notes || '-') + '</td>' +
            '<td><span class="type-badge ' + typeBadgeClass + '">' + typeLabel + '</span></td>' +
            '<td class="' + amtClass + '">' + sign + ' ' + formatRupiah(t.amount) + '</td>' +
            '<td><button class="btn-delete-row" data-id="' + t.id + '">Hapus</button></td>';
        tbody.appendChild(tr);
    });
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── FULL UI REFRESH ──
function refreshUI() {
    updateMetricCards();
    renderTable();
    var fin = calculateFinancials(transactions);
    renderChart(fin.totalIncome, fin.totalExpense);
    applyRoleUI();
}

// ── CRUD ──
function addTransaction(trxObj) {
    transactions.unshift(trxObj);
    saveTransactions();
    refreshUI();
}

function deleteTransaction(id) {
    transactions = transactions.filter(function (t) { return t.id !== id; });
    saveTransactions();
    refreshUI();
}

// ── FORM SUBMIT ──
function handleFormSubmit(e) {
    e.preventDefault();

    var dateVal = document.getElementById('inputDate').value;
    var typeVal = document.getElementById('inputType').value;
    var descVal = document.getElementById('inputDesc').value.trim();
    var amountVal = parseInt(document.getElementById('inputAmount').value, 10);
    var catVal = document.getElementById('inputCategory').value;
    var notesVal = document.getElementById('inputNotes').value.trim();

    if (!descVal || isNaN(amountVal) || amountVal <= 0) {
        alert('Mohon isi deskripsi dan nominal yang valid!');
        return;
    }
    if (!dateVal) dateVal = todayISO();

    var trx = {
        id: generateId(),
        date: dateVal,
        desc: descVal,
        amount: amountVal,
        type: typeVal,
        category: catVal,
        notes: notesVal
    };

    addTransaction(trx);

    document.getElementById('entryForm').reset();
    document.getElementById('inputDate').value = todayISO();
    document.getElementById('inputDesc').focus();
}

// ── PRESET BUTTONS ──
function handlePreset(btn) {
    var type = btn.getAttribute('data-type');
    var desc = btn.getAttribute('data-desc');
    var cat = btn.getAttribute('data-cat');

    document.getElementById('inputType').value = type;
    document.getElementById('inputDesc').value = desc;
    document.getElementById('inputCategory').value = cat;
    document.getElementById('inputAmount').value = '';
    document.getElementById('inputDate').value = todayISO();

    document.getElementById('inputAmount').focus();
    document.getElementById('transactionFormSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── CUSTOMIZER ENGINE ──
function openCustomizer() {
    var drawer = document.getElementById('customizerDrawer');
    var overlay = document.getElementById('drawerOverlay');
    drawer.classList.remove('hidden');
    overlay.classList.remove('hidden');

    // Populate controls with current settings
    document.getElementById('customBrandInput').value = settings.brandName;
    document.getElementById('customTaglineInput').value = settings.tagline;
    document.getElementById('customPrimaryColor').value = settings.primaryColor;
    document.getElementById('customDarkModeToggle').checked = settings.isDarkMode;
    document.getElementById('customRadiusSlider').value = settings.borderRadius;
    document.getElementById('radiusValDisplay').textContent = settings.borderRadius + 'px';
    // Set font select
    var fontSelect = document.getElementById('customFontSelect');
    for (var i = 0; i < fontSelect.options.length; i++) {
        if (fontSelect.options[i].value === settings.fontFamily) {
            fontSelect.selectedIndex = i;
            break;
        }
    }
}

function closeCustomizer() {
    document.getElementById('customizerDrawer').classList.add('hidden');
    document.getElementById('drawerOverlay').classList.add('hidden');
}

function livePreviewColor(val) {
    document.documentElement.style.setProperty('--primary', val);
    document.documentElement.style.setProperty('--primary-hover', adjustColor(val, -20));
    document.documentElement.style.setProperty('--primary-light', val + '1a');
}

function livePreviewDarkMode(checked) {
    document.body.classList.toggle('dark-mode', checked);
}

function livePreviewRadius(val) {
    document.documentElement.style.setProperty('--card-radius', val + 'px');
    document.getElementById('radiusValDisplay').textContent = val + 'px';
}

function livePreviewBrand(name) {
    document.getElementById('brandNameDisplay').textContent = name;
}

function livePreviewTagline(val) {
    document.getElementById('brandTaglineDisplay').textContent = val;
}

function livePreviewFont(val) {
    document.documentElement.style.setProperty('--font-main', val);
    document.body.style.fontFamily = val;
}

function saveCustomizerSettings() {
    settings.brandName = document.getElementById('customBrandInput').value || DEFAULT_SETTINGS.brandName;
    settings.tagline = document.getElementById('customTaglineInput').value || DEFAULT_SETTINGS.tagline;
    settings.primaryColor = document.getElementById('customPrimaryColor').value;
    settings.isDarkMode = document.getElementById('customDarkModeToggle').checked;
    settings.borderRadius = parseInt(document.getElementById('customRadiusSlider').value, 10);
    settings.fontFamily = document.getElementById('customFontSelect').value;
    saveSettings();
    applySettings();
    refreshUI();
    closeCustomizer();
}

function resetCustomizerSettings() {
    settings = Object.assign({}, DEFAULT_SETTINGS);
    saveSettings();
    applySettings();
    refreshUI();
    closeCustomizer();
}

// ── EXPORT / BACKUP ──
function exportToCSV() {
    if (transactions.length === 0) {
        alert('Tidak ada transaksi untuk diekspor.');
        return;
    }
    var bom = '\uFEFF';
    var header = 'Tanggal,Deskripsi,Kategori,Catatan,Jenis,Nominal\n';
    var rows = transactions.map(function (t) {
        return '"' + formatDateDisplay(t.date) + '","' + t.desc.replace(/"/g, '""') + '","' + t.category + '","' + (t.notes || '').replace(/"/g, '""') + '","' + (t.type === 'income' ? 'Pemasukan' : 'Pengeluaran') + '",' + t.amount;
    }).join('\n');
    var csv = bom + header + rows;
    downloadBlob(csv, 'laporan_keuangan_umkm.csv', 'text/csv;charset=utf-8');
}

function exportJSON() {
    var data = JSON.stringify({
        sme_transactions: transactions,
        sme_settings: settings,
        exportedAt: new Date().toISOString()
    }, null, 2);
    downloadBlob(data, 'backup_pembukuan.json', 'application/json');
}

function importJSON(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var parsed = JSON.parse(e.target.result);
            if (parsed.sme_transactions && Array.isArray(parsed.sme_transactions)) {
                transactions = parsed.sme_transactions;
                saveTransactions();
                if (parsed.sme_settings) {
                    settings = Object.assign({}, DEFAULT_SETTINGS, parsed.sme_settings);
                    saveSettings();
                    applySettings();
                }
                refreshUI();
                alert('Restore data berhasil! ' + transactions.length + ' transaksi dimuat.');
            } else {
                alert('Format file JSON tidak valid. Pastikan file berasal dari backup aplikasi ini.');
            }
        } catch (err) {
            alert('Gagal membaca file JSON: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function downloadBlob(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function printReport() {
    window.print();
}

// ── AUTH / ROLE ──
function applyRoleUI() {
    var badge = document.getElementById('userRoleBadge');
    badge.textContent = 'Role: ' + auth.currentRole;

    var custBtn = document.getElementById('openCustomizerBtn');
    var exportBtn = document.getElementById('exportCsvBtn');

    if (auth.currentRole === 'Kasir') {
        custBtn.style.display = 'none';
        exportBtn.style.display = 'none';
    } else {
        custBtn.style.display = '';
        exportBtn.style.display = '';
    }
}

function openAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('pinInput').value = '';
    document.getElementById('pinInput').focus();
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function confirmPin() {
    var pin = document.getElementById('pinInput').value;
    if (pin === settings.ownerPin) {
        // Toggle role
        if (auth.currentRole === 'Owner') {
            auth.currentRole = 'Kasir';
        } else {
            auth.currentRole = 'Owner';
        }
        saveAuth();
        applyRoleUI();
        closeAuthModal();
        alert('Role berhasil diubah ke: ' + auth.currentRole);
    } else {
        alert('PIN salah. Coba lagi.');
    }
}

// ── EVENT LISTENERS ──
function initEventListeners() {
    // Form
    document.getElementById('entryForm').addEventListener('submit', handleFormSubmit);

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { handlePreset(btn); });
    });

    // Delete transaction (event delegation on table body)
    document.getElementById('transactionTableBody').addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-delete-row')) {
            var id = e.target.getAttribute('data-id');
            if (confirm('Hapus transaksi ini?')) {
                deleteTransaction(id);
            }
        }
    });

    // Filter listeners
    document.getElementById('searchKeyword').addEventListener('input', renderTable);
    document.getElementById('filterPeriod').addEventListener('change', renderTable);
    document.getElementById('filterCategory').addEventListener('change', renderTable);

    // Customizer open/close
    document.getElementById('openCustomizerBtn').addEventListener('click', openCustomizer);
    document.getElementById('closeCustomizerBtn').addEventListener('click', closeCustomizer);
    document.getElementById('drawerOverlay').addEventListener('click', closeCustomizer);

    // Customizer live preview
    document.getElementById('customPrimaryColor').addEventListener('input', function (e) {
        livePreviewColor(e.target.value);
    });
    document.getElementById('customDarkModeToggle').addEventListener('change', function (e) {
        livePreviewDarkMode(e.target.checked);
    });
    document.getElementById('customRadiusSlider').addEventListener('input', function (e) {
        livePreviewRadius(e.target.value);
    });
    document.getElementById('customBrandInput').addEventListener('input', function (e) {
        livePreviewBrand(e.target.value);
    });
    document.getElementById('customTaglineInput').addEventListener('input', function (e) {
        livePreviewTagline(e.target.value);
    });
    document.getElementById('customFontSelect').addEventListener('change', function (e) {
        livePreviewFont(e.target.value);
    });

    // Quick palette buttons
    document.querySelectorAll('.palette-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var c = btn.getAttribute('data-color');
            document.getElementById('customPrimaryColor').value = c;
            livePreviewColor(c);
        });
    });

    // Save / Reset customizer
    document.getElementById('saveCustomizerBtn').addEventListener('click', saveCustomizerSettings);
    document.getElementById('resetCustomizerBtn').addEventListener('click', function () {
        if (confirm('Reset semua pengaturan ke nilai default?')) {
            resetCustomizerSettings();
        }
    });

    // Export / Backup
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    document.getElementById('downloadBackupBtn').addEventListener('click', exportJSON);
    document.getElementById('triggerRestoreBtn').addEventListener('click', function () {
        document.getElementById('uploadBackupInput').click();
    });
    document.getElementById('uploadBackupInput').addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            importJSON(e.target.files[0]);
            e.target.value = '';
        }
    });

    // Print
    document.getElementById('printReportBtn').addEventListener('click', printReport);

    // Auth
    document.getElementById('toggleAuthBtn').addEventListener('click', openAuthModal);
    document.getElementById('confirmPinBtn').addEventListener('click', confirmPin);
    document.getElementById('closeAuthModalBtn').addEventListener('click', closeAuthModal);
    document.getElementById('pinInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') confirmPin();
    });

    // Chart resize
    window.addEventListener('resize', function () {
        var fin = calculateFinancials(transactions);
        renderChart(fin.totalIncome, fin.totalExpense);
    });
}

// ── INIT ──
function init() {
    loadState();
    applySettings();
    document.getElementById('inputDate').value = todayISO();
    initEventListeners();
    refreshUI();
}

document.addEventListener('DOMContentLoaded', init);