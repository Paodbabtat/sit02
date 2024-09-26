// Configurações da API do Google Drive
var CLIENT_ID = '533757513621-n6vdm3e4j6h9r205notvuu1qc68gt85n.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBHnu3JR3yxeqdk-vMKWo_RhansfxpvF9Q';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive';

var F1_FOLDER_ID = '1yYedANca20yH4sfUy3o_52Jh-gejIhXK'; // ID da pasta F1

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

// Função para listar subpastas na pasta F1
function listFolders(folderId) {
    gapi.client.drive.files.list({
        'q': `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
        'fields': 'nextPageToken, files(id, name)'
    }).then(function (response) {
        var folders = response.result.files;
        var output = '<h3>Subpastas encontradas:</h3><ul>';
        if (folders.length > 0) {
            folders.forEach(function (folder) {
                output += `<li>${folder.name} <button onclick="listFiles('${folder.id}')">Ver Arquivos</button></li>`;
            });
            output += '</ul>';
            document.getElementById('content').innerHTML = output;
        } else {
            document.getElementById('content').innerHTML = 'Nenhuma subpasta encontrada.';
        }
    }).catch(function (error) {
        console.error("Erro ao listar subpastas", error);
    });
}

// Função para listar arquivos de imagem dentro de uma subpasta
function listFiles(folderId) {
    gapi.client.drive.files.list({
        'q': `'${folderId}' in parents and mimeType contains 'image/'`,
        'fields': 'nextPageToken, files(id, name, mimeType)'
    }).then(function (response) {
        var files = response.result.files;
        var output = '<h3>Arquivos de Imagem:</h3><ul>';
        if (files.length > 0) {
            files.forEach(function (file) {
                output += `<li>${file.name} <button onclick="downloadAndCutFile('${file.id}')">Cortar</button></li>`;
            });
            output += '</ul>';
            document.getElementById('content').innerHTML = output;
        } else {
            document.getElementById('content').innerHTML = 'Nenhum arquivo de imagem encontrado.';
        }
    }).catch(function (error) {
        console.error("Erro ao listar arquivos", error);
    });
}

// Função para baixar e cortar o arquivo de imagem do Google Drive
function downloadAndCutFile(fileId) {
    gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
    }).then(function (response) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.src = e.target.result;

            img.onload = function() {
                // Aqui vamos cortar a imagem
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const corteLargura = 1500; // Ajuste isso para o tamanho do corte desejado
                const corteAltura = 1500;

                canvas.width = corteLargura;
                canvas.height = corteAltura;

                // Desenhar a imagem cortada no canvas (ajuste os valores de corte conforme necessário)
                ctx.drawImage(img, 0, 0, corteLargura, corteAltura, 0, 0, corteLargura, corteAltura);

                // Exibir a imagem cortada
                const cortada = new Image();
                cortada.src = canvas.toDataURL();
                document.getElementById('imagem_drive_cortada').innerHTML = ''; // Limpa imagens anteriores
                document.getElementById('imagem_drive_cortada').appendChild(cortada);
            };
        };

        // Converte o blob de imagem recebido para base64
        var blob = new Blob([response.body], { type: 'image/jpeg' });
        reader.readAsDataURL(blob);
    }).catch(function (error) {
        console.error("Erro ao baixar o arquivo", error);
    });
}
