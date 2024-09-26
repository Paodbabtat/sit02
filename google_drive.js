// Configurações da API do Google Drive
var CLIENT_ID = '533757513621-n6vdm3e4j6h9r205notvuu1qc68gt85n.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBHnu3JR3yxeqdk-vMKWo_RhansfxpvF9Q';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive';

var F1_FOLDER_ID = '1yYedANca20yH4sfUy3o_52Jh-gejIhXK'; // ID da pasta F1
var FD_FOLDER_ID = '1TqOFWuxZwtdUt1yrvdrRoumwwllgVosX'; // ID da pasta FD

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

// Função para listar subpastas da pasta F1
function listSubfoldersInF1() {
    gapi.client.drive.files.list({
        'q': `'${F1_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
        'fields': 'nextPageToken, files(id, name)'
    }).then(function (response) {
        var subfolders = response.result.files;
        var output = '<h3>Subpastas na pasta F1:</h3><ul>';
        if (subfolders.length > 0) {
            subfolders.forEach(function (subfolder) {
                output += `<li>${subfolder.name} <button onclick="processSubfolder('${subfolder.id}', '${subfolder.name}')">Processar</button></li>`;
            });
            output += '</ul>';
            document.getElementById('content').innerHTML = output;
        } else {
            document.getElementById('content').innerHTML = 'Nenhuma subpasta encontrada na pasta F1.';
        }
    }).catch(function (error) {
        console.error("Erro ao listar subpastas na pasta F1", error);
    });
}

// Função para acessar as imagens dentro de uma subpasta de F1 e processá-las
function processSubfolder(subfolderId, subfolderName) {
    gapi.client.drive.files.list({
        'q': `'${subfolderId}' in parents and mimeType contains 'image/'`,
        'fields': 'nextPageToken, files(id, name, mimeType)'
    }).then(function (response) {
        var images = response.result.files;
        if (images.length > 0) {
            // Cria uma nova pasta com o nome da subpasta original dentro de FD
            createFolderInFD(subfolderName).then(function (newFolderId) {
                images.forEach(function (image, index) {
                    // Para cada imagem, baixamos e realizamos o corte
                    downloadAndCutImage(image.id, newFolderId, `${image.name}_c${index + 1}`);
                });
            });
        } else {
            console.log(`Nenhuma imagem encontrada na subpasta: ${subfolderName}`);
        }
    }).catch(function (error) {
        console.error("Erro ao listar imagens na subpasta", error);
    });
}

// Função para criar uma nova pasta na FD com o mesmo nome da subpasta original
function createFolderInFD(folderName) {
    return gapi.client.drive.files.create({
        resource: {
            'name': folderName,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [FD_FOLDER_ID]
        },
        fields: 'id'
    }).then(function (response) {
        console.log('Pasta criada na FD:', response.result.id);
        return response.result.id;
    }).catch(function (error) {
        console.error("Erro ao criar pasta na FD", error);
    });
}

// Função para baixar, cortar e fazer o upload das imagens cortadas para a pasta FD
function downloadAndCutImage(fileId, newFolderId, newFileName) {
    gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
    }).then(function (response) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.src = e.target.result;

            img.onload = function() {
                // Criar o canvas para cortar a imagem
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const corteLargura = 1500; // Ajuste o tamanho do corte conforme necessário
                const corteAltura = 1500;

                canvas.width = corteLargura;
                canvas.height = corteAltura;

                // Desenhar a imagem cortada no canvas
                ctx.drawImage(img, 0, 0, corteLargura, corteAltura, 0, 0, corteLargura, corteAltura);

                // Converter o canvas para um blob e fazer o upload para a nova pasta
                canvas.toBlob(function (blob) {
                    uploadCutImage(blob, newFolderId, newFileName);
                }, 'image/jpeg');
            };
        };

        // Converte o blob de imagem recebido para base64
        var blob = new Blob([response.body], { type: 'image/jpeg' });
        reader.readAsDataURL(blob);
    }).catch(function (error) {
        console.error("Erro ao baixar a imagem", error);
    });
}

// Função para fazer o upload da imagem cortada para a nova pasta em FD
function uploadCutImage(blob, folderId, fileName) {
    var metadata = {
        'name': fileName,
        'parents': [folderId],
        'mimeType': 'image/jpeg'
    };

    var formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', blob);

    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + gapi.auth.getToken().access_token,
        },
        body: formData
    }).then(function (response) {
        if (response.ok) {
            console.log('Imagem cortada e enviada para a FD:', fileName);
        } else {
            console.error('Erro ao enviar a imagem cortada');
        }
    }).catch(function (error) {
        console.error('Erro na requisição de upload', error);
    });
}

// Função para excluir a subpasta original após o processo
function deleteFolderInF1(subfolderId) {
    gapi.client.drive.files.delete({
        fileId: subfolderId
    }).then(function () {
        console.log('Subpasta excluída de F1:', subfolderId);
    }).catch(function (error) {
        console.error('Erro ao excluir a subpasta', error);
    });
}
