// Import des fonctions nécessaires depuis les SDK Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Variables globales fournies par l'environnement Canvas
// Assurez-vous que ces variables sont définies dans l'environnement d'exécution.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let db; // Instance Firestore
let auth; // Instance Auth
let userId; // ID de l'utilisateur authentifié

/**
 * Affiche un message à l'utilisateur dans le conteneur prévu à cet effet.
 * @param {string} message - Le message à afficher.
 * @param {'success'|'error'|'info'} type - Le type de message pour le style CSS.
 */
function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('form-message');
  if (messageDiv) {
    messageDiv.textContent = message;
    // Supprime toutes les classes de type précédentes et ajoute la nouvelle
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block'; // Rend le message visible

    // Cache le message après 5 secondes
    setTimeout(() => {
      messageDiv.style.display = 'none';
      messageDiv.textContent = ''; // Efface le texte
    }, 5000);
  } else {
    // Fallback en console si le div de message n'est pas trouvé
    console.log(`Message (${type}): ${message}`);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Initialisation de Firebase
  if (Object.keys(firebaseConfig).length > 0) {
    try {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);

      // Authentification de l'utilisateur
      if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken);
      } else {
        await signInAnonymously(auth);
      }
      userId = auth.currentUser?.uid || crypto.randomUUID(); // Récupère l'UID ou génère un ID aléatoire pour les utilisateurs anonymes
      console.log('Firebase initialisé et authentifié. ID utilisateur:', userId);

    } catch (error) {
      console.error('Échec de l\'initialisation ou de l\'authentification Firebase:', error);
      showMessage('Erreur de connexion aux services Firebase. Veuillez réessayer plus tard.', 'error');
      // Désactiver le formulaire si l'authentification échoue
      const form = document.querySelector('.registration-form-section form');
      if (form) {
        form.style.pointerEvents = 'none';
        form.style.opacity = '0.5';
      }
      return; // Arrête l'exécution si Firebase n'est pas initialisé
    }
  } else {
    console.error('Configuration Firebase non trouvée. Assurez-vous que __firebase_config est défini.');
    showMessage('Erreur: La configuration Firebase est manquante. L\'inscription ne peut pas fonctionner.', 'error');
    const form = document.querySelector('.registration-form-section form');
    if (form) {
      form.style.pointerEvents = 'none';
      form.style.opacity = '0.5';
    }
    return; // Arrête l'exécution si la config est manquante
  }

  const registrationForm = document.querySelector('.registration-form-section form');
  const resetButton = document.querySelector('.btn-reset');

  if (registrationForm) {
    registrationForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Empêche la soumission par défaut du formulaire

      // Récupération des valeurs des champs du formulaire
      const nom = document.getElementById('ls_nm').value.trim();
      const prenom = document.getElementById('ls_fn').value.trim();
      const dateNaissance = document.getElementById('ls_dt').value;
      const genderRadio = document.querySelector('input[name="gender"]:checked');
      const sexe = genderRadio ? genderRadio.value : ''; // Gère le cas où aucun genre n'est sélectionné
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

      // Récupération des spécialités sélectionnées (checkboxes)
      const specialities = Array.from(document.querySelectorAll('input[name="speciality[]"]:checked')).map(cb => cb.value);

      // --- Validation des champs ---
      // Vérification des champs obligatoires
      if (!nom || !prenom || !dateNaissance || !sexe || !pays || !city || !email || !pubgmPseudo || !pubgmId || !device || !level || !ranking || !host || !region || !username || !password || !confirmPassword || specialities.length === 0) {
        showMessage('Veuillez remplir tous les champs obligatoires et sélectionner au moins une spécialité.', 'error');
        return; // Arrête la soumission du formulaire
      }

      // Validation de l'ID PUBG (10 chiffres)
      if (pubgmId.length !== 10 || !/^\d{10}$/.test(pubgmId)) {
        showMessage('L\'ID PUBG doit être composé de 10 chiffres.', 'error');
        return;
      }

      // Validation de la correspondance des mots de passe
      if (password !== confirmPassword) {
        showMessage('Les mots de passe ne correspondent pas.', 'error');
        return;
      }

      // Validation de la longueur du mot de passe (exemple)
      if (password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères.', 'error');
        return;
      }

      // --- Construction de l'objet de données utilisateur ---
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
          // ATTENTION: Dans une application réelle, ne stockez JAMAIS les mots de passe en clair.
          // Utilisez Firebase Authentication pour la gestion des utilisateurs ou hachez les mots de passe côté serveur.
          // Pour cet exemple de site vitrine, nous le stockons pour la démonstration.
          password: password // Stockage en clair pour l'exemple, à sécuriser en production!
        },
        createdAt: new Date().toISOString(), // Horodatage de la création
        userId: userId // Stocke l'ID utilisateur lié à cette inscription
      };

      // --- Enregistrement des données dans Firestore ---
      try {
        // Chemin de la collection Firestore: /artifacts/{appId}/users/{userId}/registrations
        // Cela assure que chaque utilisateur authentifié a sa propre sous-collection de registrations.
        const userRegistrationsCollection = collection(db, `artifacts/${appId}/users/${userId}/registrations`);
        await addDoc(userRegistrationsCollection, userData);

        showMessage('Votre compte a été créé avec succès !', 'success');
        registrationForm.reset(); // Réinitialise le formulaire après succès
      } catch (e) {
        console.error('Erreur lors de l\'enregistrement des données dans Firestore:', e);
        showMessage('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.', 'error');
      }
    });

    // Fonctionnalité du bouton de réinitialisation
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        registrationForm.reset(); // Réinitialise tous les champs du formulaire
        showMessage('Le formulaire a été réinitialisé.', 'info');
      });
    }
  } else {
    console.error('Erreur: Le formulaire d\'inscription n\'a pas été trouvé dans le DOM.');
    showMessage('Erreur interne: Le formulaire n\'a pas pu être chargé.', 'error');
  }
});
