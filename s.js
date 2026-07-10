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
              
            </td>
        </tr>
        `;

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

});}