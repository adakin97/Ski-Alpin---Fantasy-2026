import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Inject dropdown styles once
const style = document.createElement("style");
style.textContent = `
  #nav-auth .user-menu { position: relative; display: inline-block; }
  #user-menu-button {
    background: none;
    border: 1.5px solid #ccc;
    color: #333;
    padding: 7px 14px;
    font-weight: 700;
    font-family: var(--font-primary, 'Montserrat', sans-serif);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    transition: border-color 0.2s, color 0.2s;
    white-space: nowrap;
  }
  #user-menu-button:hover { border-color: #c62828; color: #c62828; }
  #user-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: #fff;
    border: 1px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    list-style: none;
    margin: 0;
    padding: 4px 0;
    min-width: 170px;
    z-index: 300;
    display: none;
  }
  #user-dropdown li a,
  #user-dropdown li button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    color: #333;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.85rem;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-family: var(--font-primary, 'Montserrat', sans-serif);
    transition: background 0.15s, color 0.15s;
  }
  #user-dropdown li a:hover,
  #user-dropdown li button:hover { background: #f5f5f5; color: #c62828; }
  #user-dropdown li:not(:last-child) { border-bottom: 1px solid #f0f0f0; }
`;
document.head.appendChild(style);

onAuthStateChanged(auth, async (user) => {
    const nav = document.getElementById("nav-auth");
    if (!nav) return;

    if (user) {
        let username = user.email;
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().username) {
                username = userDoc.data().username;
            }
        } catch (e) { /* fall back to email */ }

        nav.innerHTML = `
            <div class="auth-links">
                <div class="user-menu">
                    <button id="user-menu-button">
                        <i class="fas fa-user"></i> ${username} <i class="fas fa-caret-down"></i>
                    </button>
                    <ul id="user-dropdown">
                        <li><a href="Mon Compte.html"><i class="fas fa-user-cog"></i> Mon Compte</a></li>
                        <li><a href="Paramètres.html"><i class="fas fa-cog"></i> Paramètres</a></li>
                        <li><button id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Déconnexion</button></li>
                    </ul>
                </div>
            </div>`;

        document.getElementById("user-menu-button").addEventListener("click", () => {
            const dd = document.getElementById("user-dropdown");
            dd.style.display = dd.style.display === "block" ? "none" : "block";
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            const menu = nav.querySelector(".user-menu");
            if (menu && !menu.contains(e.target)) {
                const dd = document.getElementById("user-dropdown");
                if (dd) dd.style.display = "none";
            }
        });

        document.getElementById("logoutBtn").addEventListener("click", async () => {
            if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
                await signOut(auth);
                window.location.href = "index.html";
            }
        });

    } else {
        nav.innerHTML = `
            <div class="auth-links">
                <a href="index.html" id="loginBtn"><i class="fas fa-sign-in-alt"></i> Connexion</a>
            </div>`;
    }
});
