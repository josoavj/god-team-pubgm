
 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 const firebaseConfig = {
   apiKey: "AIzaSyAqaCu5aaiMVGtn8f7eNtEzlkJLnEKAFHc",
   authDomain: "pubgm-team-web.firebaseapp.com",
   projectId: "pubgm-team-web",
   storageBucket: "pubgm-team-web.appspot.com",
   messagingSenderId: "564225687482",
   appId: "1:564225687482:web:41b9e26227b2e3ae49e783"
 };

 // Créer une référence à la base de données
var database = firebase.database();

// Fonction pour créer un nouvel utilisateur
function createUser() {
  // Récupérer les valeurs des champs du formulaire
  var nom = document.getElementById('ls_nm').value;
  var prenom = document.getElementById('ls_fn').value;
  var dateNaissance = document.getElementById('ls_dt').value;
  var sexe = document.querySelector('input[name="sexe"]:checked').value;
  var pays = document.getElementById('ls_pays').value;
  var adresse = document.getElementById('ls_cpt').value;
  var codePostal = document.getElementById('ls_cps').value;
  var email = document.getElementById('ls_email').value; // Assurez-vous d'avoir un champ d'email dans votre formulaire
  var pseudo = document.getElementById('ls_pseudo').value;
  var idPubg = document.getElementById('ls_id').value;
  var appareil = document.getElementById('ls_app').value;
  var niveau = document.querySelector('#niveau select').value; // Amélioration pour récupérer la valeur du niveau
  var echelon = document.querySelector('#echelon select').value; // Amélioration pour récupérer la valeur de l'échelon
  var specialites = []; // Tableau pour stocker les spécialités sélectionnées
  var checkboxes = document.querySelectorAll('#bar input[type="checkbox"]');
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      specialites.push(checkboxes[i].value);
    }
  }
  var hote = document.querySelector('#hote select').value;
  var region = document.querySelector('#region select').value;
  var username = document.getElementById('ls_usr').value;
  var password = document.getElementById('ls_pwd').value;
  var confirmPassword = document.getElementById('ls_cpwd').value;

  // Validation des champs (à améliorer selon vos besoins)
  if (!nom || !prenom || !dateNaissance || !sexe || !pays || !adresse || !codePostal || !email || !pseudo || !idPubg || !appareil || !niveau || !echelon || !specialites.length || !hote || !region || !username || !password || !confirmPassword) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Les mots de passe ne correspondent pas.");
    return;
  }

  // Créer un objet avec les données de l'utilisateur
  var user = {
    nom: nom,
    prenom: prenom,
    dateNaissance: dateNaissance,
    sexe: sexe,
    pays: pays,
    adresse: adresse,
    codePostal: codePostal,
    email: email,
    pubg: {
      pseudo: pseudo,
      id: idPubg,
      appareil: appareil,
      niveau: niveau,
      echelon: echelon,
      specialites: specialites
    },
    hote: hote,
    region: region,
    username: username,
    password: password 
  };

  // Enregistrer l'utilisateur dans la base de données (vérifiez les règles de sécurité Firebase)
  database.ref('users').push(user)
    .then(() => {
      alert("Utilisateur créé avec succès!");
      document.getElementById('ls_nm').value = "";
      document.getElementById('ls_fn').value = "";
    })
    .catch((error) => {
      console.error("Erreur lors de l'enregistrement de l'utilisateur:", error);
})}