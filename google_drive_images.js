// google_drive_images.js

var FD_FOLDER_ID = '1TqOFWuxZwtdUt1yrvdrRoumwwllgVosX'; // ID da pasta FD

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
                alert(`Processando imagens da subpasta ${subfolderName}`); // Notificação de início de processamento
            });
        } else {
            alert(`Nenhuma imagem encontrada na subpasta ${subfolderName}.`); // Notificação de aviso
        }
    }).catch(function (error) {
        alert('Erro ao listar imagens: ' + error); // Notificação de erro
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
        alert(`Pasta ${folderName} criada com sucesso em FD!`); // Notificação de sucesso
        return response.result.id;
    }).catch(function (error) {
        alert('Erro ao criar pasta: ' + error); // Notificação de erro
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
        alert('Erro ao baixar a imagem: ' + error); // Notificação de erro
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
            alert(`Imagem ${fileName} cortada e enviada para a FD com sucesso!`); // Notificação de sucesso
        } else {
            alert('Erro ao enviar a imagem cortada'); // Notificação de erro
            console.error('Erro ao enviar a imagem cortada');
        }
    }).catch(function (error) {
        alert('Erro na requisição de upload: ' + error); // Notificação de erro
        console.error('Erro na requisição de upload', error);
    });
}

// Exportando as funções para uso nos outros scripts
export { processSubfolder, createFolderInFD, downloadAndCutImage, uploadCutImage };
