// Fonction pour démarrer le scanner
function startScanner() {
    // Vérifier la disponibilité de la caméra
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            const video = document.getElementById('preview');
            video.srcObject = stream;

            // Créer une instance de Instascan Scanner
            let scanner = new Instascan.Scanner({ video: video });

            // Gestion du scan
            scanner.addListener('scan', function (content) {
                console.log('QR Code détecté ! Contenu: ' + content);
                document.getElementById('qr-code-content').innerText = content;

                // Récupérer l'heure d'entrée au moment du scan
                const entryTime = new Date().toLocaleString();
                document.getElementById('entry-time-content').innerText = entryTime;

                // Afficher les détails du QR Code
                document.getElementById('qr-details').style.display = "block";

                // Désactiver temporairement le scanner pour éviter les doublons
                scanner.stop();
                setTimeout(() => scanner.start(), 3000); // Redémarrage après 3 sec

                // Envoyer les données au backend
                saveEntry(content, entryTime);
            });

            // Vérifier et démarrer la caméra
            Instascan.Camera.getCameras()
                .then(function (cameras) {
                    if (cameras.length > 0) {
                        console.log('Caméra trouvée, démarrage du scanner...');
                        scanner.start(cameras[0]).catch((e) => {
                            console.error('Erreur de démarrage du scanner: ', e);
                        });
                    } else {
                        alert("Aucune caméra disponible !");
                    }
                })
                .catch(error => {
                    console.error("Erreur lors de la détection des caméras:", error);
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
    .catch(error => console.error('Erreur lors de l\'enregistrement:', error));
}
