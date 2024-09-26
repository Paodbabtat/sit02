document.getElementById('dividir').addEventListener('click', async function () {
    const texto = document.getElementById('texto').value;
    const tamanhoCorte = parseInt(document.getElementById('tamanho_corte').value);
    const traduzir = document.getElementById('traduzir_check').checked;
    const idiomaOrigem = document.getElementById('idioma_origem').value;
    const idiomaDestino = document.getElementById('idioma_destino').value;

    // Verificação inicial
    if (!texto || !tamanhoCorte || tamanhoCorte <= 0) {
        alert("Por favor, insira um texto válido e tamanho de corte.");
        return;
    }

    // Limpa o conteúdo anterior
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = 'Processando...'; // Feedback visual enquanto o processamento ocorre

    const partes = dividirTexto(texto, tamanhoCorte);
    let partesTraduzidas = partes;

    if (traduzir) {
        partesTraduzidas = [];
        for (const parte of partes) {
            try {
                const parteTraduzida = await traduzirTexto(parte, idiomaOrigem, idiomaDestino);
                partesTraduzidas.push(parteTraduzida);
            } catch (error) {
                partesTraduzidas.push("Erro na tradução");
            }
        }
    }

    exibirResultado(partesTraduzidas);
});

function dividirTexto(texto, tamanhoCorte) {
    const partes = [];
    while (texto.length > tamanhoCorte) {
        let corte = texto.substring(0, tamanhoCorte);
        const ultimaPalavraIndex = corte.lastIndexOf(' ');
        if (ultimaPalavraIndex > -1) {
            corte = corte.substring(0, ultimaPalavraIndex); // Evitar quebra de palavras
        }
        partes.push(corte);
        texto = texto.substring(corte.length).trim(); // Remove o texto já processado
    }
    partes.push(texto); // Adiciona o restante do texto
    return partes;
}

function exibirResultado(partes) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = ''; // Limpa o conteúdo anterior

    partes.forEach(parte => {
        const parteDiv = document.createElement('div');
        parteDiv.textContent = parte;
        resultadoDiv.appendChild(parteDiv); // Adiciona cada parte à página
    });
}

async function traduzirTexto(texto, idiomaOrigem, idiomaDestino) {
    const apiKey = 'SUA_CHAVE_API_AQUI'; // Substitua com sua chave
    const url = 'https://api.openai.com/v1/chat/completions';

    const body = JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: `Você é um tradutor de texto. Traduza o texto de ${idiomaOrigem} para ${idiomaDestino}.`
            },
            {
                role: "user",
                content: texto
            }
        ]
    });

    try {
        const resposta = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (!resposta.ok) {
            const errorData = await resposta.json();
            return `Erro na tradução: ${errorData.error.message}`;
        }

        const dados = await resposta.json();
        if (dados.choices && dados.choices.length > 0) {
            return dados.choices[0].message.content.trim();
        } else {
            return "Erro na resposta da API";
        }
    } catch (error) {
        return `Erro ao chamar a API: ${error.message}`;
    }
}
