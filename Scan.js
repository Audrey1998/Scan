<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scanner QR Code</title>
    <script src="https://cdn.jsdelivr.net/npm/instascan@0.0.5/instascan.min.js"></script>
</head>
<body>

    <h2>Scanner un QR Code</h2>
    <video id="preview" style="width: 100%; max-width: 400px; border: 2px solid black;"></video>
    <button id="start-scan">📷 Démarrer le Scanner</button>

    <div id="qr-details" style="display:none;">
        <h3>Informations du QR Code :</h3>
        <p><strong>Contenu :</strong> <span id="qr-code-content"></span></p>
        <p><strong>Heure d'entrée :</strong> <span id="entry-time-content"></span></p>
    </div>

    <script>
        let scanner;

        document.getElementById("start-scan").addEventListener("click", function() {
            startScanner();
        });

        function startScanner() {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    const video = document.getElementById('preview');
                    video.srcObject = stream;

                    scanner = new Instascan.Scanner({ video: video });

                    scanner.addListener('scan', function (content) {
                        console.log('QR Code détecté ! Contenu:', content);
                        document.getElementById('qr-code-content').innerText = content;
                        document.getElementById('entry-time-content').innerText = new Date().toLocaleString();
                        document.getElementById('qr-details').style.display = "block";

                        // Désactiver temporairement pour éviter les doublons
                        scanner.stop();
                        setTimeout(() => scanner.start(), 3000);

                        // Envoi des données au serveur
                        saveEntry(content, new Date().toLocaleString());
                    });

                    // Vérifier si des caméras sont disponibles
                    navigator.mediaDevices.enumerateDevices().then(devices => {
                        let cameras = devices.filter(device => device.kind === "videoinput");
                        if (cameras.length > 0) {
                            console.log("Caméra trouvée, démarrage...");
                            scanner.start(cameras[0]).catch((e) => console.error('Erreur démarrage caméra:', e));
                        } else {
                            alert("Aucune caméra trouvée !");
                        }
                    }).catch(error => {
                        console.error("Erreur lors de la détection des caméras:", error);
                    });

                }).catch(function (error) {
                    console.error('Erreur accès caméra:', error);
                    alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
                });
        }

        function saveEntry(qrCodeId, entryTime) {
            fetch('/api/entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCodeId: qrCodeId, entryTime: entryTime }),
            })
            .then(response => response.json())
            .then(data => console.log('Entrée enregistrée:', data))
            .catch(error => console.error('Erreur enregistrement:', error));
        }
    </script>

</body>
</html>
