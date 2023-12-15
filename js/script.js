const elements = {
  play: document.querySelector(".music .fa-play"),
  h3: document.querySelector("h3"),
  h2: document.querySelector("h2"),
  audio: document.querySelector("audio"),
  range: document.querySelector('.music .range'),
  timeInicial: document.querySelector(".music .timeinicial"),
  timeFinal: document.querySelector(".music .timefinal"),
  backward: document.querySelector(".music .backward"),
  forward: document.querySelector(".music .forward"),
  progress: document.querySelector(".music progress"),
  repeat: document.querySelector(".music .repeat"),
  random: document.querySelector(".music .random"),
  selectDrop: document.querySelector(".music .select"),
  dropElement: document.querySelectorAll(".music .drop"),
  dropDown: document.querySelector(".music .drop-down"),
  img: document.querySelector("img"),
  canvas: document.getElementById("canvas-color"),
  musicback: document.querySelector(".music"),
};

  
let fetchfile = `./rey.json`;
let index = 0;

const ctx = elements.canvas.getContext("2d", {willReadFrequently: true});

// Função para obter a cor da imagem
function getCorDaImagem() {
  ctx.drawImage(elements.img, 0, 0, elements.canvas.width, elements.canvas.height);
  const pixelData = ctx.getImageData(0, 0, 1, 1).data;
  const cor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
  elements.musicback.style.background = `linear-gradient(-30deg, transparent, transparent, ${cor}, ${cor})`;
  elements.musicback.style.boxShadow = `0 0rem 1rem 0rem ${cor} inset`;
}

// Função para definir largura e altura do canvas
function setCanvasWidthHeight() {
  elements.canvas.width = elements.img.width;
  elements.canvas.height = elements.img.height;
}

window.onload = () => {
  setCanvasWidthHeight();
  getCorDaImagem();
};

elements.img.onload = () => {
  setCanvasWidthHeight();
  getCorDaImagem();
};

// Função para fazer a requisição à API
async function fetchApi(value) {
  try {
    const response = await fetch(value);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

// Função para atualizar os elementos da música
function updateMusic(data) {
  const item = data[index];
  elements.img.src = item.capa;
  elements.h3.innerText = item.nome;
  elements.h2.innerText = item.artista;
  elements.audio.src = item.audioSrc;
  music();
  setCanvasWidthHeight();
  getCorDaImagem();
}

// Função para reproduzir a música anterior
function prev() {
  fetchApi(fetchfile).then((data) => {
    if (elements.random.classList.contains("active")) {
      randomNext();
      return false;
    } else if (index === 0) {
      index = data.length - 1;
    } else {
      index -= 1;
    }
    updateMusic(data);
  });
}

// Função para reproduzir a próxima música
function next() {
  fetchApi(fetchfile).then((data) => {
    if (elements.random.classList.contains("active")) {
      randomNext();
      return false;
    } else if (index === data.length - 1) {
      index = 0;
    } else {
      index += 1;
    }
    updateMusic(data);
  });
}

// Função para obter um índice aleatório
function getRandomIndex(data) {
  const currentIndex = index;
  index = Math.floor(Math.random() * data.length);
  const previousIndex = index;
  if (currentIndex === previousIndex && currentIndex !== 0) {
    index -= 1;
  } else if (currentIndex === 0 && previousIndex === 0) {
    index = data.length - 1;
  }
}

// Função para reproduzir uma música aleatória
function randomNext() {
  fetchApi(fetchfile).then((data) => {
    getRandomIndex(data);
    updateMusic(data);
  });
}

// Função para atualizar o tempo da música
function updateMusicTime() {
  const currentTime = Math.ceil(elements.audio.currentTime);
  const timeSeconds = Math.floor(elements.audio.currentTime % 60);
  const timeMinutes = Math.floor(elements.audio.currentTime / 60);
  const duration = Math.floor(elements.audio.duration);

  elements.progress.value = currentTime === 0 ? 0 : (currentTime / duration) * 100;
  elements.range.value = currentTime;
  elements.range.max = duration;
  elements.timeInicial.innerText = `${timeMinutes}:${timeSeconds}`;

  elements.audio.oncanplaythrough = () => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);

    if (seconds < 10) {
      elements.timeFinal.innerText = `${minutes}:0${seconds}`;
    } else {
      elements.timeFinal.innerText = `${minutes}:${seconds}`;
    }
  };

  if (timeSeconds < 10) {
    elements.timeInicial.innerText = `${timeMinutes}:0${timeSeconds}`;
  }
}

// Função para reproduzir a música
function playMusic() {
  elements.audio.play();
  elements.play.classList.replace("fa-play", "fa-pause");
  elements.play.style.boxShadow = "0 0rem 1.5rem 0 #f75a13";
}

// Função para pausar a música
function stopMusic() {
  elements.audio.pause();
  elements.play.classList.replace("fa-pause", "fa-play");
  elements.play.style.boxShadow = "none";
}

// Função para reproduzir ou pausar a música
function music() {
  elements.audio.paused ? playMusic() : stopMusic();
}

// Função para reproduzir a música a partir do tempo selecionado pelo usuário
function playRange() {
  elements.audio.currentTime = elements.range.value;
  updateMusicTime();
}

// Função para repetir a música atual
function repeatMusic() {
  elements.repeat.classList.toggle("active");
  elements.random.classList.remove("active");
  if (elements.repeat.classList.contains("active")) {
    elements.audio.onended = () => {
      elements.audio.currentTime = 0;
      elements.audio.play();
    };
  } else {
    elements.audio.onended = next;
  }
}

// Função para reproduzir músicas aleatoriamente
function randomMusic() {
  elements.random.classList.toggle("active");
  elements.repeat.classList.remove("active");
  if (elements.random.classList.contains("active")) {
    elements.audio.onended = randomNext;
  }
}

// Função para mostrar o dropdown de seleção
function showDropDown() {
  elements.selectDrop.classList.toggle("active");
  elements.dropDown.classList.toggle("active");
}

// Função para atualizar o dropdown com base no item selecionado
function attrDrop() {
  const attrName = this.dataset.name;
  const attrFetch = this.dataset.fetch;
  fetchfile = attrFetch;
  elements.selectDrop.querySelector("span").innerText = attrName;
  fetchApi(fetchfile).then((data) => {
    index = 0;
    updateMusic(data);
  });
  showDropDown();
}

// Associação dos eventos aos elementos

elements.backward.onclick = prev;
elements.forward.onclick = next;
elements.random.onclick = randomMusic;
elements.repeat.onclick = repeatMusic;
elements.audio.oncanplaythrough = music;
elements.audio.ontimeupdate = updateMusicTime;
elements.audio.onloadedmetadata = updateMusicTime;
elements.audio.onended = next;
elements.play.onclick = music;
elements.range.oninput = playRange;
elements.range.onchange = playRange;
elements.range.onmouseenter = updateMusicTime;
elements.selectDrop.onclick = showDropDown;
elements.dropElement.forEach((drop) => (drop.onclick = attrDrop));
window.onkeydown = (event) => (event.code === "Space" ? music() : null);