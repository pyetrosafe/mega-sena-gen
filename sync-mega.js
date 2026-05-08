const axios = require('axios');
const fs = require('fs');

const DATA_FILE = './mega-sena-stats.json';
const API_URL = 'https://loteriascaixa-api.herokuapp.com/api/megasena/';

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
        const responseAPI = await axios.get(`${API_URL}`);
        const totalSorteios = responseAPI.data.length;

        if (!responseAPI.data || responseAPI.data.length <= 0) {
            buscando = false;
        }

        while (buscando) {

            const response = responseAPI.data[totalSorteios-proximoSorteio]

            if (response.dezenas) {
                const dezenas = response.dezenas.map(Number);

                // Incrementa a contagem de cada número sorteado
                dezenas.forEach(num => {
                    stats.contagem[num]++;
                });

                stats.ultimoSorteio = proximoSorteio;
                stats.lastDate = response.data;
                console.log(`Concurso ${proximoSorteio} processado.`);

                proximoSorteio++;

                // Pequeno delay para não sobrecarregar a API pública
                // await new Promise(resolve => setTimeout(resolve, 100));
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