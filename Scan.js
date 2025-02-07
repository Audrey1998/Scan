// Fonction pour démarrer le scanner
function startScanner() {
    // Demander l'accès à la caméra
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            const video = document.getElementById('preview');
            video.srcObject = stream;

            // Créer une instance de Instascan Scanner
            let scanner = new Instascan.Scanner({ video: video });

            // Lorsque le QR code est scanné, cette fonction est exécutée
            scanner.addListener('scan', function (content) {
                console.log('QR Code détecté ! Contenu: ' + content);  // Log pour vérifier que le QR code est scanné
                document.getElementById('qr-code-content').innerText = content;

                // Récupérer l'heure d'entrée au moment du scan
                const entryTime = new Date().toLocaleString();
                document.getElementById('entry-time-content').innerText = entryTime;

                // Sauvegarder l'entrée dans la base de données ou effectuer une action ici
                saveEntry(content, entryTime);
            });

            // Vérifier les caméras disponibles et démarrer le scanner
            Instascan.Camera.getSources().then(function (sources) {
                if (sources.length > 0) {
                    console.log('Caméra trouvée, démarrage du scanner...');  // Log pour vérifier que la caméra a bien été trouvée
                    // Si plusieurs caméras sont disponibles, on prend la première
                    scanner.start(sources[0]).catch((e) => {
                        console.error('Erreur de démarrage du scanner: ', e);
                    });
                } else {
                    alert("Aucune caméra disponible !");
                }
            });
        })
        .catch(function (error) {
            console.error('Erreur d\'accès à la caméra:', error);
            alert("Impossible d'accéder à la caméra.");
        });
}

// Lancer le scanner dès que la page est chargée
window.onload = startScanner;

// Fonction pour envoyer les informations d'entrée à un serveur backend
function saveEntry(qrCodeId, entryTime) {
    // Exemple de requête POST pour envoyer les données au backend
    fetch('/api/entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            qrCodeId: qrCodeId,
            entryTime: entryTime,
        }),
    })
    .then(response => response.json())
    .then(data => console.log('Entrée enregistrée:', data))
    .catch(error => console.error('Erreur:', error));
}
