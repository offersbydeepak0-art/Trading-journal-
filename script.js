// ===========================
// Trading Journal - Part 1
// ===========================

// Load trades from Local Storage
let trades = JSON.parse(localStorage.getItem("trades")) || [];

// Current month
let currentDate = new Date();

// Dashboard Elements
const totalPL = document.getElementById("totalPL");
const totalTrades = document.getElementById("totalTrades");
const wins = document.getElementById("wins");
const losses = document.getElementById("losses");
const winRate = document.getElementById("winRate");

// Table
const tradeBody = document.getElementById("tradeBody");

// Calendar
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

// Initialize App
window.onload = function() {
  renderTrades();
  renderCalendar();
};

// Save Local Storage
function saveTrades() {
  localStorage.setItem("trades", JSON.stringify(trades));
}

// Add Trade
function addTrade() {
  
  const trade = {
    id: Date.now(),
    pair: document.getElementById("pair").value,
    date: document.getElementById("date").value,
    count: document.getElementById("trades").value,
    side: document.getElementById("side").value,
    result: document.getElementById("result").value,
    pl: parseFloat(document.getElementById("pl").value) || 0,
    reason: document.getElementById("reason").value
  };
  
  if (!trade.pair || !trade.date) {
    alert("Please fill Pair and Date.");
    return;
  }
  
  trades.push(trade);
  
  saveTrades();
  
  renderTrades();
  
  renderCalendar();
  
  document.querySelector(".form-box").reset();
}
// ===========================
// Render Trades & Dashboard
// ===========================

function renderTrades() {

    tradeBody.innerHTML = "";

    let total = 0;
    let win = 0;
    let loss = 0;

    trades.forEach((trade, index) => {

        total += Number(trade.pl);

        if (trade.result === "Win") {
            win++;
        } else {
            loss++;
        }

        tradeBody.innerHTML += `
        <tr>

            <td>${trade.date}</td>

            <td>${trade.pair}</td>

            <td>${trade.side}</td>

            <td class="${trade.result === "Win" ? "win" : "loss"}">
                ${trade.result}
            </td>

            <td>${trade.pl.toFixed(2)}</td>

            <td>${trade.count}</td>

            <td>${trade.reason}</td>

            <td>
                <button class="edit-btn"
                    onclick="editTrade(${index})">
                    Edit
                </button>

                <button class="delete-btn"
                    onclick="deleteTrade(${index})">
                    Delete
                </button>
            </td>

        </tr>
        `;
    });

    totalPL.textContent = total.toFixed(2);
    const currentBalance = startingBalance + total;
balance.textContent = currentBalance.toFixed(2);
    totalTrades.textContent = trades.length;
    wins.textContent = win;
    losses.textContent = loss;

    if (trades.length > 0) {
        winRate.textContent =
            ((win / trades.length) * 100).toFixed(1) + "%";
    } else {
        winRate.textContent = "0%";
    }
}


// ===========================
// Delete Trade
// ===========================

function deleteTrade(index) {

    if (!confirm("Delete this trade?")) return;

    trades.splice(index, 1);

    saveTrades();

    renderTrades();

    renderCalendar();

}

// ===========================
// Edit Trade
// ===========================

function editTrade(index) {

    const trade = trades[index];

    document.getElementById("pair").value = trade.pair;
    document.getElementById("date").value = trade.date;
    document.getElementById("trades").value = trade.count;
    document.getElementById("side").value = trade.side;
    document.getElementById("result").value = trade.result;
    document.getElementById("pl").value = trade.pl;
    document.getElementById("reason").value = trade.reason;

    trades.splice(index, 1);

    saveTrades();

    renderTrades();

    renderCalendar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ===========================
// Calendar
// ===========================

function renderCalendar() {

    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYear.textContent = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric"
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "empty";
        calendar.appendChild(empty);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {

        const cell = document.createElement("div");

        cell.className = "day";

        cell.textContent = day;

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        // Highlight dates that have trades
        const dayTrades = trades.filter(t => t.date === dateString);

if (dayTrades.length > 0) {
    
    const totalPL = dayTrades.reduce((sum, t) => sum + Number(t.pl), 0);
    
    cell.innerHTML = `
<div class="day-number">${day}</div>
<div class="day-pl">
${totalPL > 0 ? "+" : ""}${totalPL.toFixed(2)}
</div>
`;
    
    if (totalPL >= 0) {
        cell.style.background = "#359638"; // Green
    } else {
        cell.style.background = "#c43939"; // Red
    }
    
    cell.style.color = "#fff";
}

        // Highlight today
        const today = new Date();

        if (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        ) {
            cell.classList.add("today");
        }

        // Click a day to show its trades
        cell.onclick = function () {

            const rows = tradeBody.querySelectorAll("tr");

            rows.forEach(row => {
                if (row.cells[0].textContent === dateString) {
                    row.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                    row.style.outline = "2px solid #00e676";
                    setTimeout(() => {
                        row.style.outline = "";
                    }, 2000);
                }
            });

        };

        calendar.appendChild(cell);
    }
}

// Previous Month
document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

// Next Month
document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});


// ===========================
// PDF Export
// ===========================

function downloadPDF() {

    const element = document.querySelector(".container");

    const options = {
        margin: 0.5,
        filename: "Trading_Journal.pdf",
        image: {
            type: "jpeg",
            quality: 1
        },
        html2canvas: {
            scale: 2
        },
        jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait"
        }
    };

    html2pdf().set(options).from(element).save();
}

// ===========================
// Search Trades
// ===========================

function searchTrades(keyword) {

    keyword = keyword.toLowerCase();

    const rows = tradeBody.querySelectorAll("tr");

    rows.forEach(row => {

        const text = row.innerText.toLowerCase();

        row.style.display =
            text.includes(keyword) ? "" : "none";

    });

}

// ===========================
// Clear Form
// ===========================

function clearForm() {

    document.querySelector(".form-box").reset();

}

// ===========================
// Final Start
// ===========================

window.addEventListener("load", () => {

    renderTrades();

    renderCalendar();

    console.log("Trading Journal Loaded Successfully");

});

const startingBalance = 0; // Change this to your starting balance
const balance = document.getElementById("balance");