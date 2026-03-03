import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc, getDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ── Inject CSS ────────────────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
  .auth-links { display: flex; gap: 1.2rem; }
  .auth-links a {
    font-weight: 600; color: var(--main-red); text-decoration: none;
    padding: 10px 20px; border: 2px solid var(--main-red); border-radius: 30px;
    transition: background-color 0.35s, color 0.35s, box-shadow 0.35s;
    display: flex; align-items: center; gap: 0.5rem; font-size: 1rem;
    white-space: nowrap; cursor: pointer;
  }
  .auth-links a:hover { background-color: var(--main-red); color: #fff; box-shadow: 0 4px 12px var(--main-red); }

  .user-menu { position: relative; display: inline-block; }
  #user-menu-button {
    background: none; border: 2px solid var(--main-red); color: var(--main-red);
    padding: 10px 20px; border-radius: 30px; font-weight: 600;
    font-family: var(--font-primary, 'Montserrat', sans-serif); cursor: pointer;
    display: flex; align-items: center; gap: 6px; user-select: none;
    transition: background-color 0.3s, color 0.3s;
  }
  #user-menu-button:hover { background-color: var(--main-red); color: #fff; }
  #user-dropdown {
    position: absolute; top: calc(100% + 6px); right: 0; background: #fff;
    box-shadow: 0 5px 15px rgba(0,0,0,0.18); border-radius: 10px;
    list-style: none; margin: 0; padding: 0; min-width: 160px; z-index: 300; display: none;
  }
  #user-dropdown li { border-bottom: 1px solid #eee; }
  #user-dropdown li:last-child { border-bottom: none; }
  #user-dropdown a, #user-dropdown button {
    display: block; padding: 12px 16px; color: var(--main-red); text-decoration: none;
    font-weight: 600; background: none; border: none; width: 100%; text-align: left;
    cursor: pointer; font-family: var(--font-primary, 'Montserrat', sans-serif);
    transition: background-color 0.2s;
  }
  #user-dropdown a:hover, #user-dropdown button:hover { background-color: var(--main-red); color: #fff; }

  .modal {
    display: none; position: fixed; z-index: 400; inset: 0;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(3px);
    animation: fadeInModal 0.2s ease;
  }
  @keyframes fadeInModal { from { opacity:0 } to { opacity:1 } }
  .modal-content {
    background: #fff; margin: 8% auto; padding: 40px 36px 36px;
    border-top: 4px solid var(--main-red); width: 90%; max-width: 420px;
    position: relative; box-shadow: 0 8px 30px rgba(0,0,0,0.18);
    animation: slideUpModal 0.25s ease;
  }
  @keyframes slideUpModal { from { transform:translateY(24px); opacity:0 } to { transform:translateY(0); opacity:1 } }
  .modal-content h2 { font-size: 1.8rem; font-weight: 900; color: #1a1a1a; margin: 0 0 6px; }
  .modal-subtitle { color: #888; font-size: 0.95rem; margin: 0 0 28px; }
  .modal .close { position: absolute; top: 16px; right: 20px; font-size: 1.4rem; color: #bbb; cursor: pointer; line-height: 1; transition: color 0.2s; }
  .modal .close:hover { color: #333; }
  .modal .form-group { position: relative; margin-bottom: 18px; }
  .modal .form-group label { display: block; font-size: 0.82rem; font-weight: 700; color: #555; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .modal .form-group input {
    width: 100%; padding: 13px 14px 13px 40px; border: 1.5px solid #e0e0e0;
    border-radius: 10px; font-size: 0.97rem; font-family: var(--font-primary, 'Montserrat', sans-serif);
    background: #fafafa; outline: none; box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .modal .form-group input:focus { border-color: var(--main-red); box-shadow: 0 0 0 3px rgba(198,40,40,0.12); background: #fff; }
  .modal .input-icon { position: absolute; left: 14px; bottom: 13px; color: #bbb; font-size: 0.95rem; pointer-events: none; }
  .modal .form-group input:focus ~ .input-icon { color: var(--main-red); }
  .modal form button[type="submit"] {
    background: linear-gradient(135deg, #c62828, #e53935); color: #fff; border: none;
    padding: 14px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1rem;
    font-family: var(--font-primary, 'Montserrat', sans-serif); width: 100%; margin-top: 6px;
    box-shadow: 0 4px 14px rgba(198,40,40,0.35); transition: opacity 0.2s, transform 0.15s;
  }
  .modal form button[type="submit"]:hover { opacity: 0.92; transform: translateY(-1px); }
  .modal .form-footer { text-align: center; margin-top: 18px; font-size: 0.9rem; color: #888; }
  .modal .form-footer a { color: var(--main-red); font-weight: 700; text-decoration: none; cursor: pointer; }
  .modal .form-footer a:hover { text-decoration: underline; }
`;
document.head.appendChild(style);

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
