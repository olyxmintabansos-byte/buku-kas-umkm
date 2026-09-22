const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const trxCountEl = document.getElementById('trxCount');
const descInput = document.getElementById('descInput');
const amountInput = document.getElementById('amountInput');
const typeInput = document.getElementById('typeInput');
const addButton = document.getElementById('addButton');
const transactionList = document.getElementById('transactionList');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function formatIDR(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(num);
}

function updateUI() {
    transactionList.innerHTML = '';
    let balance = 0;
    let income = 0;
    let expense = 0;

    if (transactions.length === 0) {
        transactionList.innerHTML = '<li class="empty-state">Belum ada transaksi tercatat</li>';
    } else {
        transactions.forEach((trx, index) => {
            const isIncome = trx.type === 'income';
            if (isIncome) {
                income += trx.amount;
                balance += trx.amount;
            } else {
                expense += trx.amount;
                balance -= trx.amount;
            }

            const li = document.createElement('li');
            const sign = isIncome ? '+' : '-';
            const colorClass = isIncome ? 'income-text' : 'expense-text';

            li.innerHTML = `
                <div class="trx-main">
                    <span class="trx-desc">${trx.desc}</span>
                </div>
                <div class="trx-side">
                    <span class="${colorClass}">${sign} ${formatIDR(trx.amount)}</span>
                    <button class="delete-btn" onclick="deleteTrx(${index})" title="Hapus">Hapus</button>
                </div>
            `;
            transactionList.appendChild(li);
        });
    }

    totalBalanceEl.innerText = formatIDR(balance);
    if (totalIncomeEl) totalIncomeEl.innerText = formatIDR(income);
    if (totalExpenseEl) totalExpenseEl.innerText = formatIDR(expense);
    if (trxCountEl) trxCountEl.innerText = `${transactions.length} transaksi`;
}

function addTransaction() {
    const desc = descInput.value.trim();
    const amount = parseInt(amountInput.value, 10);
    const type = typeInput.value;

    if (desc === '' || isNaN(amount) || amount <= 0) {
        alert('Mohon isi deskripsi dan nominal yang valid!');
        return;
    }

    transactions.unshift({ desc, amount, type });
    localStorage.setItem('transactions', JSON.stringify(transactions));

    descInput.value = '';
    amountInput.value = '';
    descInput.focus();
    updateUI();
}

function deleteTrx(index) {
    transactions.splice(index, 1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

addButton.addEventListener('click', addTransaction);

descInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') amountInput.focus();
});

amountInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTransaction();
});

updateUI();