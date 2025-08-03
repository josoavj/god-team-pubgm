// --- 1. Importation des fonctions nécessaires depuis les SDK Firebase ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// --- 2. Variables globales fournies par l'environnement Canvas ---
// Ces variables sont fournies par l'environnement d'exécution du Canvas.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Instances et variables globales qui seront initialisées plus tard
let db;
let auth;
let userId;

// --- 3. Fonction pour afficher les messages à l'utilisateur ---
/**
 * Affiche un message d'information, de succès ou d'erreur à l'utilisateur.
 * @param {string} message - Le message à afficher.
 * @param {'success'|'error'|'info'} type - Le type de message pour le style CSS.
 */
function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('form-message');
  if (messageDiv) {
    messageDiv.textContent = message;
    // Supprime toutes les classes de type précédentes et ajoute la nouvelle
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';

    // Cache le message après 5 secondes
    setTimeout(() => {
      messageDiv.style.display = 'none';
      messageDiv.textContent = '';
    }, 5000);
  } else {
    console.log(`Message (${type}): ${message}`);
  }
}

// --- 4. Point d'entrée de l'application après le chargement du DOM ---
document.addEventListener('DOMContentLoaded', async () => {
  // Sélection du formulaire et des boutons
  const registrationForm = document.querySelector('.registration-form-section form');
  const resetButton = document.querySelector('.btn-reset');

  // Initialisation de Firebase
  if (Object.keys(firebaseConfig).length > 0) {
    try {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);

      // Authentification de l'utilisateur
      if (initialAuthToken) {
        // Authentification avec le jeton personnalisé
        await signInWithCustomToken(auth, initialAuthToken);
      } else {
        // Authentification anonyme si le jeton n'est pas disponible
        await signInAnonymously(auth);
      }
      // Récupère l'UID de l'utilisateur authentifié. Pour les utilisateurs anonymes,
      // on utilise l'UID fourni par Firebase.
      userId = auth.currentUser?.uid;
      console.log('Firebase initialisé et authentifié. ID utilisateur:', userId);

    } catch (error) {
      console.error('Échec de l\'initialisation ou de l\'authentification Firebase:', error);
      showMessage('Erreur de connexion aux services Firebase. Veuillez réessayer plus tard.', 'error');
      // Désactive le formulaire si l'authentification échoue
      if (registrationForm) {
        registrationForm.style.pointerEvents = 'none';
        registrationForm.style.opacity = '0.5';
      }
      return;
    }
  } else {
    console.error('Configuration Firebase non trouvée. Assurez-vous que __firebase_config est défini.');
    showMessage('Erreur: La configuration Firebase est manquante. L\'inscription ne peut pas fonctionner.', 'error');
    if (registrationForm) {
      registrationForm.style.pointerEvents = 'none';
      registrationForm.style.opacity = '0.5';
    }
    return;
  }

  // --- 5. Gestion de la soumission du formulaire ---
  if (registrationForm) {
    registrationForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Récupération des valeurs des champs
      const nom = document.getElementById('ls_nm').value.trim();
      const prenom = document.getElementById('ls_fn').value.trim();
      const dateNaissance = document.getElementById('ls_dt').value;
      const genderRadio = document.querySelector('input[name="gender"]:checked');
      const sexe = genderRadio ? genderRadio.value : '';
      const pays = document.getElementById('ls_pays').value.trim();
      const city = document.getElementById('ls_cpt').value.trim();
      const postalCode = document.getElementById('ls_cps').value.trim();
      const email = document.getElementById('email').value.trim();
      const pubgmPseudo = document.getElementById('ls_pseudo').value.trim();
      const pubgmId = document.getElementById('ls_id').value.trim();
      const device = document.getElementById('ls_app').value;
      const level = document.getElementById('level').value;
      const ranking = document.getElementById('ranking').value;
      const host = document.getElementById('host').value;
      const region = document.getElementById('region').value;
      const username = document.getElementById('ls_usr').value.trim();
      const password = document.getElementById('ls_pwd').value;
      const confirmPassword = document.getElementById('ls_cpwd').value;
      const specialities = Array.from(document.querySelectorAll('input[name="speciality[]"]:checked')).map(cb => cb.value);

      // --- 6. Validation des champs ---
      if (!nom || !prenom || !dateNaissance || !sexe || !pays || !city || !email || !pubgmPseudo || !pubgmId || !device || !level || !ranking || !host || !region || !username || !password || !confirmPassword || specialities.length === 0) {
        showMessage('Veuillez remplir tous les champs obligatoires et sélectionner au moins une spécialité.', 'error');
        return;
      }

      if (pubgmId.length !== 10 || !/^\d{10}$/.test(pubgmId)) {
        showMessage('L\'ID PUBG doit être composé de 10 chiffres.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showMessage('Les mots de passe ne correspondent pas.', 'error');
        return;
      }

      if (password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères.', 'error');
        return;
      }

      // --- 7. Construction de l'objet de données utilisateur ---
      const userData = {
        personal: {
          name: nom,
          firstName: prenom,
          birthDate: dateNaissance,
          gender: sexe,
          country: pays,
          city: city,
          postalCode: postalCode,
          email: email
        },
        pubgProfile: {
          pseudo: pubgmPseudo,
          id: pubgmId,
          device: device,
          level: level,
          ranking: ranking,
          specialties: specialities,
          host: host,
          region: region
        },
        account: {
          username: username,
          password: password
        },
        createdAt: new Date().toISOString(),
        userId: userId
      };

      // --- 8. Enregistrement des données dans Firestore ---
      try {
        if (!db) {
          throw new Error("L'instance Firestore n'est pas disponible.");
        }
        // Chemin de la collection : /artifacts/{appId}/users/{userId}/registrations
        const userRegistrationsCollection = collection(db, `artifacts/${appId}/users/${userId}/registrations`);
        await addDoc(userRegistrationsCollection, userData);

        showMessage('Votre compte a été créé avec succès !', 'success');
        registrationForm.reset();
      } catch (e) {
        console.error('Erreur lors de l\'enregistrement des données dans Firestore:', e);
        showMessage('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.', 'error');
      }
    });

    // Gestion du bouton de réinitialisation
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        registrationForm.reset();
        showMessage('Le formulaire a été réinitialisé.', 'info');
      });
    }
  } else {
    console.error('Erreur: Le formulaire d\'inscription n\'a pas été trouvé dans le DOM.');
    showMessage('Erreur interne: Le formulaire n\'a pas pu être chargé.', 'error');
  }
});
