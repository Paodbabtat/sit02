// google_drive_access.js

// Configurações da API do Google Drive
var CLIENT_ID = '533757513621-n6vdm3e4j6h9r205notvuu1qc68gt85n.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBHnu3JR3yxeqdk-vMKWo_RhansfxpvF9Q';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive';

// Inicializar a API do Google
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Inicializa o cliente da API do Google
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function (error) {
        console.error("Erro ao inicializar a API Google Drive", error);
    });
}

// Atualiza o status de autenticação
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        console.log("Usuário autenticado com sucesso.");
    } else {
        gapi.auth2.getAuthInstance().signIn().then(function () {
            console.log("Usuário autenticado.");
        }).catch(function (error) {
            console.error("Erro na autenticação", error);
        });
    }
}
