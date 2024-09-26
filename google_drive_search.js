// google_drive_search.js

var F1_FOLDER_ID = '1yYedANca20yH4sfUy3o_52Jh-gejIhXK';

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
