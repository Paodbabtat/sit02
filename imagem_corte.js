document.getElementById('cortar_imagem').addEventListener('click', function () {
    const input = document.getElementById('imagem_input');
    const imagemCortadaDiv = document.getElementById('imagem_cortada');

    // Verificar se há um arquivo de imagem carregado
    if (input.files && input.files[0]) {
        // Verificar se o arquivo carregado é realmente uma imagem
        if (!input.files[0].type.startsWith('image/')) {
            alert("Por favor, selecione um arquivo de imagem válido.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                // Criar o canvas para cortar a imagem
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Definir o tamanho do corte (ajustável)
                const corteLargura = 1500;
                const corteAltura = 1500;

                canvas.width = corteLargura;
                canvas.height = corteAltura;

                // Desenhar a imagem cortada no canvas
                ctx.drawImage(img, 0, 0, corteLargura, corteAltura, 0, 0, corteLargura, corteAltura);

                // Exibir a imagem cortada
                const cortada = new Image();
                cortada.src = canvas.toDataURL();
                imagemCortadaDiv.innerHTML = ''; // Limpar a imagem anterior
                imagemCortadaDiv.appendChild(cortada);
            };
        };

        // Ler a imagem como URL base64
        reader.readAsDataURL(input.files[0]);
    } else {
        alert("Por favor, selecione uma imagem para cortar.");
    }
});
