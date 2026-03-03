import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    onAuthStateChanged(auth, (user) => {
        if (!loginBtn || !logoutBtn) return;
        if (user) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                await signOut(auth);
                window.location.reload();
            }
        });
    }
});
