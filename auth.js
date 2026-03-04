import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc, getDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


// ── Inject modals (skip if already present, e.g. on index.html) ───────────────
if (!document.getElementById("loginModal")) {
  document.body.insertAdjacentHTML("beforeend", `
    <div id="loginModal" class="modal">
      <div class="modal-content">
        <span class="close" data-modal="loginModal">&times;</span>
        <h2>Connexion</h2>
        <p class="modal-subtitle">Bienvenue ! Entrez vos identifiants.</p>
        <form id="loginForm">
          <div class="form-group">
            <label>Pseudo</label>
            <input type="text" name="username" placeholder="Votre pseudo" required autocomplete="username">
            <i class="fas fa-user input-icon"></i>
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" name="password" placeholder="••••••••" required autocomplete="current-password">
            <i class="fas fa-lock input-icon"></i>
          </div>
          <button type="submit">Se connecter</button>
        </form>
        <p class="form-footer">Pas encore de compte ? <a id="switchToSignup">Créer un compte</a></p>
      </div>
    </div>

    <div id="signupModal" class="modal">
      <div class="modal-content">
        <span class="close" data-modal="signupModal">&times;</span>
        <h2>Créer un compte</h2>
        <p class="modal-subtitle">Rejoignez Ski Alpin Fantasy 2026 !</p>
        <form id="signupForm">
          <div class="form-group">
            <label>Pseudo</label>
            <input type="text" name="username" placeholder="Choisissez un pseudo" required autocomplete="username">
            <i class="fas fa-user input-icon"></i>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="votre@email.com" required autocomplete="email">
            <i class="fas fa-envelope input-icon"></i>
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" name="password" placeholder="Minimum 6 caractères" required autocomplete="new-password">
            <i class="fas fa-lock input-icon"></i>
          </div>
          <div class="form-group">
            <label>Confirmer le mot de passe</label>
            <input type="password" name="confirmPassword" placeholder="••••••••" required autocomplete="new-password">
            <i class="fas fa-lock input-icon"></i>
          </div>
          <button type="submit">Créer mon compte</button>
        </form>
        <p class="form-footer">Déjà inscrit ? <a id="switchToLogin">Se connecter</a></p>
      </div>
    </div>
  `);

  // Close on backdrop click or × button
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) e.target.style.display = "none";
    if (e.target.classList.contains("close")) {
      document.getElementById(e.target.dataset.modal).style.display = "none";
    }
  });

  // Switch between modals
  document.getElementById("switchToSignup").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("signupModal").style.display = "block";
  });
  document.getElementById("switchToLogin").addEventListener("click", () => {
    document.getElementById("signupModal").style.display = "none";
    document.getElementById("loginModal").style.display = "block";
  });

  // Login form
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const password = e.target.password.value;
    const q = query(collection(db, "users"), where("username", "==", username));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return alert("Utilisateur inconnu");
    const email = snapshot.docs[0].data().email;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      document.getElementById("loginModal").style.display = "none";
      e.target.reset();
    } catch {
      alert("Mot de passe incorrect");
    }
  });

  // Signup form
  document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    if (password !== confirmPassword) return alert("Mots de passe différents");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), { username, email, points: 0 });
      alert("Inscription réussie ! Connectez-vous maintenant.");
      e.target.reset();
      document.getElementById("signupModal").style.display = "none";
      document.getElementById("loginModal").style.display = "block";
    } catch (err) {
      alert(err.message);
    }
  });
}

// ── Auth state → update nav ───────────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  const nav = document.getElementById("nav-auth");
  if (!nav) return;

  if (user) {
    let username = user.email;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().username) username = userDoc.data().username;
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
        <a href="#" id="openLogin"><i class="fas fa-sign-in-alt"></i> Connexion</a>
        <a href="#" id="openSignup"><i class="fas fa-user-plus"></i> Inscription</a>
      </div>`;

    document.getElementById("openLogin").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("loginModal").style.display = "block";
    });
    document.getElementById("openSignup").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("signupModal").style.display = "block";
    });
  }
});
