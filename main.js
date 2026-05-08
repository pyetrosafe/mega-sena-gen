function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

// Lista com números mais sorteados em ordem decrescente. Lista de 09/12/2023
let listSortAscend = [10, 53, 5, 37, 23, 34, 33, 32, 30, 41, 35, 44, 38, 42, 4, 17, 28, 56, 43, 27, 29, 11, 54, 49, 36, 16, 13, 51, 8, 2, 6, 24, 46, 52, 58, 59, 50, 25, 14, 45, 18, 20, 39, 12, 60, 1, 57, 9, 47, 19, 40, 7, 31, 3, 48, 22, 15, 55, 26, 21];

// Lista com números mais sorteados em ordem decrescente
async function carregarDados() {
  try {
    const response = await fetch('./mega-sena-stats.json');
    const data = await response.json();

    if (!data.contagem) return;

    // Reseta e Alimenta a variável global
    listSortAscend = [];
    listSortAscend = Object.entries(data.contagem)
      .sort((a, b) => b[1] - a[1])
      .map(entry => [parseInt(entry[0]), entry[1]]);

    console.log("Dados carregados e salvos globalmente!");

    const listaElement = document.querySelector('.list-group.list-group-numbered');
    listaElement.innerHTML = ''; // Limpa a lista atual

    listSortAscend.forEach(num => {
      const li = `<li class="list-group-item col-12 col-sm-6"><b>${String(num[0]).padStart(2, '0')} </b> &emsp; saiu <b>${num[1]}</b> vezes</li>`;
      listaElement.innerHTML += li;
    });

    // Transforma o listSortAscend em uma lista apenas com os números, em ordem crescente
    listSortAscend = listSortAscend.map(num => num[0]);

    document.getElementById('dados-sorteio').innerHTML = `Números mais sorteados até ${data.lastDate}`;

  } catch (error) {
    console.error('Erro ao carregar JSON:', error);
  }
}

// Inicia o processo
carregarDados();

// Total de combinações possíveis
const totalTestes = 50_063_860 * 10; //50_063_860;

function criarJogos(test = false) {
  // Armazena números dos jogos
  let jogos = [],
    qtdJogos = document.getElementById('campo1')?.value || 1,
    NumsPorJogo = document.getElementById('campo6')?.value || 6;
  // Quantidade de números mais sorteados deve ter no jogo, e de números medianos.
  let qtdBestNums = document.getElementById('campo2')?.value || 2,
    qtdMiddleNums = document.getElementById('campo4')?.value || 2;
  // Define o índice máximo dos BestNums e MiddleNums
  let indexBestNums = document.getElementById('campo3')?.value || 15,
    indexMiddleNums = document.getElementById('campo5')?.value || 40;

  qtdJogos = test ? 1 : parseInt(qtdJogos);
  NumsPorJogo = parseInt(NumsPorJogo);
  qtdBestNums = parseInt(qtdBestNums);
  qtdMiddleNums = parseInt(qtdMiddleNums);
  indexBestNums = parseInt(indexBestNums);
  indexMiddleNums = parseInt(indexMiddleNums);

  // Número de jogos
  for (let i = 0; i < qtdJogos; i++) {
    let jogoAtual = [];

    // Quantidade de números por jogo
    for (let k = 0; k < NumsPorJogo; k++) {
      let num, max;
      // Evita números repetidos
      do {
        if (qtdBestNums > 0 && k < qtdBestNums)
          max = indexBestNums;
        else if ((qtdMiddleNums > 0) && k < (qtdBestNums + qtdMiddleNums))
          max = indexMiddleNums;
        else
          max = 60;
        num = getRandomInt(0, max);
        let indexNum = num;
        num = listSortAscend[num];
        // console.log('k: ', k, 'max: ', max, '(qtdBestNums + qtdMiddleNums)', (qtdBestNums + qtdMiddleNums), 'k < (qtdBestNums + qtdMiddleNums)', k < (qtdBestNums + qtdMiddleNums));
        // console.log('k: ', k, 'num: ', num, 'indexNum: ', indexNum, 'max: ', max, 'Jogo: ', jogoAtual.join(', '));
      } while (jogoAtual.includes(num)); // || jogoAtual.includes('0' + num)

      // Inlcui número
      jogoAtual.push(num);
    }

    jogoAtual.sort((a, b) => {return a - b;});
    // console.log('Jogo gerado: ', jogoAtual);

    if (!test) {
      jogoAtual.forEach((v, i, a) => a[i] = (v < 10 ? '0' + v : v.toString()));
      jogos.push(jogoAtual.join(', '));
    } else {
      jogos.push(jogoAtual);
    }
  }

  if (!test) {
    let result = jogos.map(function(val, idx) {
      return '<li class="list-group-item col-12 col-sm-6"><span class="float-start">Jogo ' + (idx + 1) + ': &emsp;</span><span class="result-item">' + val + '</span></li>';
    });

    document.querySelector('.resultados').innerHTML = result.join("\n");
  }
  else {
    let res = jogos[0];
    res.forEach((v, i, a) => a[i] = parseInt(v));
    return res;
  }

  return;
}

function ready(callback) {
  // in case the document is already rendered
  if (document.readyState != 'loading')
    callback();
  // modern browsers
  else if (document.addEventListener)
    document.addEventListener('DOMContentLoaded', callback);
  // IE <= 8
  else document.attachEvent('onreadystatechange', function() {
    if (document.readyState == 'complete') callback();
  });
}

async function testarJogos() {
  document.getElementById('TestarResultado').classList.add('disabled');

  let jogosFeitos = 0;
  let contain = false;
  let resultExpected = []; //[21, 24, 33, 41, 48, 56]
  let pgbWidth = 0;

  const divResult = document.querySelector('.teste-resultados');

  // Define se tem setTimeout, deixando mais lento
  let testarComPausa = true;

  resultExpected = document.getElementById('campo8').value?.trim();

  if (!/^[\d ]+$/.test(resultExpected))
    return alert('O campo Número da Mega Sena Sorteado, deve ter apenas números e espaços!');

  resultExpected = resultExpected.split(' ');
  resultExpected.forEach((v, i, a) => a[i] = parseInt(v));

  console.log(resultExpected, !resultExpected.every(v => v <= 60));

  // const achou = getRandomInt(500000, 1000000);

  if (resultExpected.length < 6 || !resultExpected.every(v => v <= 60))
    return alert('Campo Número da Mega Sena Sorteado, deve ter 6 números entre 1 e 60!');

  do {
    jogosFeitos++;
    jogo = criarJogos(true);

    // Para visualizar HTML quando resultado é encontrado
    // if (jogosFeitos === achou) {
    // jogo = [...resultExpected];
    // }

    pgbWidth = jogosFeitos / totalTestes * 100;

    if (!testarComPausa && (jogosFeitos % 1000) == 0) {
      console.log('Jogo Feitos (x1.000)');
      progressBarUpdate(pgbWidth);
    }

    if (testarComPausa && (jogosFeitos % 50000) == 0) {
      console.log('Jogo Feitos (x50.000)');
      progressBarUpdate(pgbWidth);
      await new Promise(r => setTimeout(r, 0));
    }

    contain = arrayContains(jogo, resultExpected);
  } while (!contain && jogosFeitos < totalTestes);

  progressBarUpdate(pgbWidth);

  console.log('Jogos Feitos: ', jogosFeitos);

  if (contain)
    divResult.innerHTML = `<h4 class="text-success">Resultado Gerado com Sucesso!!!</h4><p>Jogos gerados até obter o resultado do sorteio: ${jogosFeitos.toLocaleString()}!</p>`;
  else
    divResult.innerHTML = `<h4 class="text-danger">Resultado Não Encontrado</h4><p>Após ${jogosFeitos.toLocaleString()} jogos gerados</p>`;

  $btnTeste = document.getElementById('TestarResultado');
  $btnTeste.classList.remove('disabled');
  $btnTeste.innerHTML = 'Testar Gerador';
}

function btnTestarJogos(elm) {
  console.log(elm);
  // elm.innerHTML = 'Aguarde... <i class="bi bi-arrow-clockwise spinner-custom"></i>';
  elm.innerHTML = 'Aguarde... <i class="spinner-arrow"></i>';

  // ProgressBar
  progressBarReset();

  $res = document.getElementById('resultados');
  $res.classList.remove('d-none');

  $res.querySelector('h5').innerText = 'Testando a geração de ' + totalTestes.toLocaleString() + ' jogos';

  elm.classList.add('disabled');
  setTimeout(testarJogos, 700);
}

function progressBarUpdate(percent) {
  const $pgb = document.querySelector('.progress-bar');
  const $pgbText = document.querySelector('.progress-bar-text');
  $pgb.style.width = percent + '%';
  $pgbText.innerText = Math.floor(percent) + '%';
  if (percent > 50)
    $pgbText.classList.add('text-white');

  if (percent == 100) {
    $res.querySelector('#resultados h5').innerText = 'Teste encerrado...';
    $pgbText.classList.add('text-white');
  }
}

function progressBarReset() {
  const $pgb = document.querySelector('.progress-bar');
  const $pgbText = document.querySelector('.progress-bar-text');
  $pgb.style.width = '0%';
  $pgbText.innerText = '0%';
  $pgbText.classList.remove('text-white');
}

function arraysEquals(a, b) {
  return a.length === b.length && a.every((element, index) => element === b[index]);
}

function arrayContains(a, b) {
  if (b.length < a.length) {
    return b.every(function(av) {
      return a.includes(av);
    });
  } else {
    return a.every(function(av) {
      return b.includes(av);
    });
  }
}
