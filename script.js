// ==========================
// Part 1 - Firebase + Auth
// ==========================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// ==========================
// Global Variables
// ==========================

let trades = [];
let currentDate = new Date();
let editingId = null;
const startingBalance = 0;

// ==========================
// Dashboard Elements
// ==========================

const totalPL = document.getElementById("totalPL");
const totalTrades = document.getElementById("totalTrades");
const wins = document.getElementById("wins");
const losses = document.getElementById("losses");
const winRate = document.getElementById("winRate");
const balance = document.getElementById("balance");

const tradeBody = document.getElementById("tradeBody");
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

// ==========================
// Authentication
// ==========================

onAuthStateChanged(auth, async (user) => {
    
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    
    document.getElementById("userEmail").textContent = user.email;
    
    await loadTrades();
    renderTrades();
    renderCalendar();
    
});

// ==========================
// Logout
// ==========================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    
    logoutBtn.addEventListener("click", async () => {
        
        await signOut(auth);
        
        window.location.href = "index.html";
        
    });
    
}

// ==========================
// Load Trades
// ==========================

async function loadTrades() {
    
    trades = [];
    
    const q = query(
        collection(db, "trades"),
        where("email", "==", auth.currentUser.email)
    );
    
    const snapshot = await getDocs(q);
    
    snapshot.forEach((docSnap) => {
        
        trades.push({
            id: docSnap.id,
            ...docSnap.data()
        });
        
    });
    
}


// ==========================
// Part 2 - Add / Update Trade
// ==========================

window.addTrade = async function () {

    const trade = {
        pair: document.getElementById("pair").value.trim(),
        date: document.getElementById("date").value,
        count: Number(document.getElementById("trades").value),
        side: document.getElementById("side").value,
        result: document.getElementById("result").value,
        pl: Number(document.getElementById("pl").value),
        reason: document.getElementById("reason").value.trim(),
        email: auth.currentUser.email,
        createdAt: Date.now()
    };

    if (!trade.pair || !trade.date) {
        alert("Please fill all required fields.");
        return;
    }

    try {

        if (editingId && trades.find(t => t.id === editingId)) {
    await updateDoc(doc(db, "trades", editingId), trade);
    editingId = null;
} else {
    await addDoc(collection(db, "trades"), trade);
    editingId = null;
}

        document.querySelector(".form-box").reset();

        await loadTrades();

        renderTrades();

        renderCalendar();

    } catch (err) {

        alert(err.message);

    }

};

// ==========================
// Edit Trade
// ==========================

window.editTrade = function (index) {

    const trade = trades[index];

    editingId = trade.id;

    document.getElementById("pair").value = trade.pair;
    document.getElementById("date").value = trade.date;
    document.getElementById("trades").value = trade.count;
    document.getElementById("side").value = trade.side;
    document.getElementById("result").value = trade.result;
    document.getElementById("pl").value = trade.pl;
    document.getElementById("reason").value = trade.reason;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

};


// ==========================
// Part 3 - Render Dashboard
// ==========================

window.renderTrades = function () {

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
            <td>${Number(trade.pl).toFixed(2)}</td>
            <td>${trade.count}</td>
            <td>${trade.reason || ""}</td>
            <td>
              <button class="edit-btn" onclick="editTrade(${index})">
    ✏️ Edit
</button>

<button class="delete-btn" onclick="deleteTrade('${trade.id}')">
    🗑 Delete
</button>
            </td>
        </tr>
        `;

    });

    totalPL.textContent = total.toFixed(2);

    balance.textContent = (startingBalance + total).toFixed(2);

    totalTrades.textContent = trades.length;

    wins.textContent = win;

    losses.textContent = loss;

    winRate.textContent =
        trades.length === 0
            ? "0%"
            : ((win / trades.length) * 100).toFixed(1) + "%";

};

// ==========================
// Delete Trade
// ==========================

window.deleteTrade = async function (id) {

    if (!confirm("Delete this trade?")) return;

    try {

        await deleteDoc(doc(db, "trades", id));

        await loadTrades();

        renderTrades();

        renderCalendar();

    } catch (err) {

        alert(err.message);

    }

};


// ==========================
// Part 4 - Calendar
// ==========================

window.renderCalendar = function () {

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

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayTrades = trades.filter(t => t.date === dateString);

        let totalDayPL = 0;

        dayTrades.forEach(t => {
            totalDayPL += Number(t.pl);
        });

        cell.innerHTML = `
            <div class="day-number">${day}</div>
            ${
                dayTrades.length
                    ? `<div class="day-pl">${totalDayPL > 0 ? "+" : ""}${totalDayPL.toFixed(2)}</div>`
                    : ""
            }
        `;

        if (dayTrades.length) {
            cell.style.background =
                totalDayPL >= 0 ? "#2e7d32" : "#c62828";
            cell.style.color = "#fff";
        }

        cell.onclick = () => {

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
                    }, 1500);

                }

            });

        };

        calendar.appendChild(cell);

    }

};

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

// ==========================
// Part 5 - PDF + Search
// ==========================

// Download PDF
window.downloadPDF = function () {

    const element = document.querySelector(".container");

    html2pdf()
        .set({
            margin: 0.5,
            filename: "Trading_Journal.pdf",
            image: { type: "jpeg", quality: 1 },
            html2canvas: { scale: 2 },
            jsPDF: {
                unit: "in",
                format: "a4",
                orientation: "portrait"
            }
        })
        .from(element)
        .save();

};

// Search Trades
window.searchTrades = function (keyword) {

    keyword = keyword.toLowerCase();

    document
        .querySelectorAll("#tradeBody tr")
        .forEach(row => {

            row.style.display =
                row.innerText.toLowerCase().includes(keyword)
                    ? ""
                    : "none";

        });

};

// Clear Form
window.clearForm = function () {

    document.querySelector(".form-box").reset();

    editingId = null;

};

// Start
window.addEventListener("load", () => {

    console.log("Trading Journal Ready");

});