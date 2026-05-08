const axios = require('axios');
const fs = require('fs');

const DATA_FILE = './mega-sena-stats.json';
const API_URL = 'https://loteriascaixa-api.herokuapp.com/api/megasena/';

// Simple request wrapper with retries and exponential backoff
async function requestWithRetry(url, retries = 3, backoffMs = 500) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await axios.get(url);
        } catch (err) {
            if (attempt === retries) throw err;
            const wait = backoffMs * Math.pow(2, attempt);
            console.log(`Request failed (attempt ${attempt + 1}). Retrying in ${wait}ms...`);
            await new Promise(r => setTimeout(r, wait));
        }
    }
}

// Estrutura inicial se o arquivo não existir
let stats = {
    ultimoSorteio: 0,
    lastDate: null,
    contagem: Object.fromEntries((Array(61).fill(0)).map((valor, index) => [index, valor]).slice(1))
};

// Carrega dados existentes
if (fs.existsSync(DATA_FILE)) {
    stats = JSON.parse(fs.readFileSync(DATA_FILE));
}

async function sync() {
    let proximoSorteio = stats.ultimoSorteio + 1;
    let buscando = true;

    console.log(`Iniciando sincronização a partir do concurso: ${proximoSorteio}`);

    try {
        // Fetch all contests once and reuse
        const responseAPI = await requestWithRetry(API_URL);
        const allContests = responseAPI.data;

        if (!allContests || allContests.length <= 0) {
            buscando = false;
        }

        while (buscando) {
            // Try to find the contest by contest number (some APIs provide 'concurso' or 'numero')
            const contestItem = allContests.find(item => {
                // Try multiple common fields
                return item.concurso == proximoSorteio;
            });

            if (!contestItem) {
                // If not found, assume we reached the last available contest
                console.log(`Concurso ${proximoSorteio} não encontrado na API. Encerrando.`);
                buscando = false;
                break;
            }

            if (contestItem.dezenas) {
                const dezenas = contestItem.dezenas.map(Number);

                // Incrementa a contagem de cada número sorteado
                dezenas.forEach(num => {
                    if (stats.contagem[num] !== undefined) stats.contagem[num]++;
                });

                stats.ultimoSorteio = proximoSorteio;
                // lastDate handling deferred as requested
                stats.lastDate = contestItem.data;
                console.log(`Concurso ${proximoSorteio} processado.`);

                proximoSorteio++;

                // Pequeno delay para não sobrecarregar a API pública
                // await new Promise(resolve => setTimeout(resolve, 50));
            } else {
                buscando = false;
            }
        }
    } catch (error) {
        // Se der 404 ou erro, assumimos que chegamos no último sorteio disponível
        console.log(`Fim da sincronização ou sorteio ${proximoSorteio} ainda não disponível.`);
        buscando = false;
    }

    // Salva os dados atualizados
    fs.writeFileSync(DATA_FILE, JSON.stringify(stats, null, 2));
    console.log('Estatísticas salvas com sucesso!');
}

sync();