
document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Défilement fluide (Smooth Scrolling) --- */
    document.querySelectorAll('a[href^="#"], a[href^="./#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Vérifie si le lien est un lien interne vers une section de la page actuelle
            const href = this.getAttribute('href');
            const targetId = href.startsWith('./#') ? href.substring(3) : href.substring(1); // Gère ./# et #
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault(); // Empêche le comportement par défaut (saut direct)

                // Calcule la position de défilement en tenant compte de la hauteur du header fixe
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset - 20; // -20 pour un petit espace supplémentaire

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth" // Active le défilement fluide
                });
            }
        });
    });


    /* --- 2. Barre de navigation adaptative (Shrink/Change on Scroll) --- */
    const mainNav = document.querySelector('.main-nav');
    const header = document.querySelector('header');
    const navHeight = header.offsetHeight; // Hauteur initiale du header

    window.addEventListener('scroll', () => {
        if (window.scrollY > navHeight / 2) { // Si on a défilé de plus de la moitié de la hauteur de la nav
            mainNav.classList.add('scrolled');
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)'; // Assure le fond sombre pour le header entier
        } else {
            mainNav.classList.remove('scrolled');
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Revenir au fond initial
        }
    });


    /* --- 3. Bouton "Retour en haut" (Scroll-to-Top) --- */
    const scrollToTopButton = document.getElementById('scroll-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight / 2) { // Apparaît après avoir défilé la moitié de la hauteur de la fenêtre
            scrollToTopButton.classList.add('show');
        } else {
            scrollToTopButton.classList.remove('show');
        }
    });

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    /* --- 4. Animations d'apparition au défilement (Fade-in on Scroll) --- */
    const animatedSections = document.querySelectorAll('main section:not(.hero-section)'); // Cible toutes les sections sauf la hero

    const observerOptions = {
        root: null, // La fenêtre d'affichage (viewport) est la racine
        rootMargin: '0px',
        threshold: 0.1 // 10% de la section doit être visible pour déclencher l'animation
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Arrête d'observer une fois l'animation déclenchée
            }
        });
    }, observerOptions);

    animatedSections.forEach(section => {
        section.classList.add('animated-section');
        sectionObserver.observe(section);
    });

});