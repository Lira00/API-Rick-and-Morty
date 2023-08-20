const apiUrl = "https://rickandmortyapi.com/api/";
const campoBusca = document.getElementById("campoBusca");
const resultado = document.getElementById("resultado");
const opcoesBusca = document.getElementById("opcoesBusca");
const homeDiv = document.getElementById("home");
const pag = document.getElementById("pag");
const numeroPa = document.getElementById("numero-pa");
const apiLink = document.getElementById("api-link");
let currentPage = 1;
// const body = document.body;

// informações da API - quantidade
axios
  .get(apiUrl + "character")
  .then((response) => {
    const quantidadePersonagens = response.data.info.count;
    const nper = document.getElementById("nper");
    nper.innerHTML = `${quantidadePersonagens}`;
  })
  .catch((error) => {
    console.error("Erro ao obter quantidade de personagens:", error);
  });

axios
  .get(apiUrl + "location")
  .then((response) => {
    const quantidadeLocalizacoes = response.data.info.count;
    const nloc = document.getElementById("nloc");
    nloc.innerHTML = `${quantidadeLocalizacoes}`;
  })
  .catch((error) => {
    console.error("Error getting number of locations:", error);
  });

axios
  .get(apiUrl + "episode")
  .then((response) => {
    const quantidadeEpisodios = response.data.info.count;
    const nep = document.getElementById("nep");
    nep.innerHTML = `${quantidadeEpisodios}`;
  })
  .catch((error) => {
    console.error("Error getting number of episodes:", error);
  });

// campo de pesquisa ----------------------------------------------------------------

async function buscarNomeUltimoEpisodio(urlEpisodio) {
  try {
    const response = await axios.get(urlEpisodio);
    const ultimoEpisodio = response.data;
    return ultimoEpisodio.name;
  } catch (error) {
    console.error("Error getting last episode details:", error);
    return "Error getting episode details";
  }
}

async function mostrarPersonagem(personagem) {
  try {
    const ultimoEpisodioName = await buscarNomeUltimoEpisodio(
      personagem.episode[personagem.episode.length - 1]
    );

    let estadoPersonagem = "";
    switch (personagem.status) {
      case "Alive":
        estadoPersonagem = "background-color: #00FF00";
        break;
      case "Dead":
        estadoPersonagem = "background-color: #FF0000";
        break;
      default:
        estadoPersonagem = "background-color: #AAAAAA";
    }

    resultado.innerHTML = `
    <div class="personagem">
    <img class="personagem-imagem" src="${personagem.image}" alt="${personagem.name}">
    <div class="personagem-dados"> 
    <h2>${personagem.name}</h2>
      <div class="status">
        <div class="exibirStatus" style="${estadoPersonagem}"></div>
          <p>
          ${personagem.status} - ${personagem.species}
          </p>
      </div>
      <p> <span>Last Known Location:</span><br>${personagem.location.name}</p>
      <p> <span>Last seen:</span><br>${ultimoEpisodioName}</p>
      </div> 
      </div>
    `;
    campoBusca.innerHTML = "";
  } catch (error) {
    console.error("Error showing character:", error);
    resultado.innerHTML = "An error occurred while displaying the character.";
  }
}

function buscarPersonagem(nome) {
  axios
    .get(apiUrl + "character", {
      params: { name: nome },
    })
    .then((response) => {
      const personagens = response.data.results;

      if (personagens.length > 0) {
        mostrarPersonagem(personagens[0]);
      } else {
        resultado.innerHTML = "Character not found.";
      }

      exibirOpcoesBusca(personagens);
    })
    .catch((error) => {
      console.error("Error fetching character:", error);
      resultado.innerHTML = "An error occurred while fetching the character.";
    });
}

function exibirOpcoesBusca(personagens) {
  opcoesBusca.innerHTML = "";
  personagens.forEach((personagem) => {
    const opcao = document.createElement("div");
    opcao.textContent = personagem.name;
    opcao.classList.add("opcao-busca");
    opcao.addEventListener("click", () => {
      campoBusca.value = personagem.name;
      buscarPersonagem(personagem.name);
      opcoesBusca.innerHTML = ""; // Remover opções após seleção
    });
    opcoesBusca.appendChild(opcao);
  });
}

campoBusca.addEventListener("input", () => {
  opcoesBusca.style.display = "block";
  resultado.style.display = "none";
  const nomePersonagem = campoBusca.value.trim();
  if (!nomePersonagem) {
    opcoesBusca.innerHTML = "";
    resultado.innerHTML = "";
  } else {
    opcoesBusca.innerHTML = ""; // Limpar opções de busca quando o usuário digitar algo
    buscarPersonagem(nomePersonagem);
  }
});

opcoesBusca.addEventListener("click", () => {
  opcoesBusca.style.display = "none";
  resultado.style.display = "block";
  mostrarPersonagem();
});

// exibição dos personagens na home --------------------------------
function criarElementoPersonagem(personagem, ultimoEpisodioName) {
  const personagemDiv = document.createElement("div");
  const textoDiv = document.createElement("div");
  const imagemDiv = document.createElement("div");

  let estadoPersonagem = "";
  switch (personagem.status) {
    case "Alive":
      estadoPersonagem = "background-color: #00FF00";
      break;
    case "Dead":
      estadoPersonagem = "background-color: #FF0000";
      break;
    default:
      estadoPersonagem = "background-color: #AAAAAA";
  }

  personagemDiv.classList.add("personagem");
  textoDiv.classList.add("personagem-dados");
  imagemDiv.classList.add("personagem-imagem");

  textoDiv.innerHTML = `
      <h2>${personagem.name}</h2>
      <div class="status">
        <div class="exibirStatus" style="${estadoPersonagem}"></div>
          <p>
          ${personagem.status} - ${personagem.species}
          </p>
      </div>
      <p> <span> Last Known Location: </span><br>${personagem.location.name}</p>
      <p><span> Last seen:</span><br>${ultimoEpisodioName}</p>
    `;
  imagemDiv.innerHTML = `<img src="${personagem.image}" alt="${personagem.name}">`;

  personagemDiv.innerHTML += imagemDiv.innerHTML;
  personagemDiv.appendChild(textoDiv);

  return personagemDiv;
}

async function buscarPersonagensPaginados(pageNumber) {
  try {
    const pageSize = 20;
    const response = await axios.get(
      `https://rickandmortyapi.com/api/character/?page=${pageNumber}`
    );
    const data = response.data;

    // Retornar a lista de personagens e informações de paginação
    return {
      personagens: data.results,
      info: {
        currentPage: data.info.page,
        totalPages: Math.ceil(data.info.count / pageSize),
      },
    };
  } catch (error) {
    console.error("Error when fetching paginated characters:", error);
    return {
      personagens: [],
      info: {
        currentPage: 1,
        totalPages: 1,
      },
    };
  }
}

async function carregarPersonagens(currentPage) {
  try {
    const { personagens, info } = await buscarPersonagensPaginados(currentPage);

    for (const personagem of personagens) {
      const ultimoEpisodioName = await buscarNomeUltimoEpisodio(
        personagem.episode[personagem.episode.length - 1]
      );
      const personagemDiv = criarElementoPersonagem(
        personagem,
        ultimoEpisodioName
      );
      homeDiv.appendChild(personagemDiv);
    }
  } catch (error) {
    console.error("Error loading characters:", error);
  }
}

// Paginação --------------------------------

function carregarPaginaAnterior() {
  if (currentPage > 1) {
    currentPage--;
    console.log(currentPage);
    numeroPa.innerHTML = `${currentPage}`;
    homeDiv.innerHTML = "";
    carregarPersonagens(currentPage);
  }
}

function carregarProximaPagina() {
  currentPage++;
  console.log(currentPage);
  numeroPa.innerHTML = `${currentPage}`;

  homeDiv.innerHTML = "";
  carregarPersonagens(currentPage);
}

document
  .getElementById("pagina-anterior")
  .addEventListener("click", carregarPaginaAnterior);
document
  .getElementById("proxima-pagina")
  .addEventListener("click", carregarProximaPagina);

carregarPersonagens(currentPage);
