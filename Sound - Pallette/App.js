const playlist = document.getElementById("playlist");
const audio = document.querySelector(".audio");
const plusBtn = document.querySelector(".plus");
const libraryBtn = document.querySelector(".library");

let selectedSongs = [];      // seçilmiş musiqilər
let favorites = [];          // favoritlər
let customPlaylists = [];    // yaratdığın playlistlər

/* LOAD LOCAL SONGS */
function addSongToPlaylist(title, artist, src) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
    <div class="card-header">
      <div class="song-info">
        <h4>${title}</h4>
        <p>${artist}</p>
      </div>
      <button class="remove-btn">✖</button>
    </div>
  `;

    // 1 klik → play + seçilir (amma PLUS / LIBRARY basılmadan əlavə olunmur)
    card.onclick = () => {
        playSong(src);

        // toggle seçilmiş musiqi (selectedSongs array-də qalır amma avtomatik əlavə etmir)
        const exists = selectedSongs.find(s => s.src === src);
        if (!exists) {
            selectedSongs.push({ title, artist, src });
            card.classList.add("selected");
        } else {
            selectedSongs = selectedSongs.filter(s => s.src !== src);
            card.classList.remove("selected");
        }
    };

    // ❌ sil düyməsi
    const removeBtn = card.querySelector(".remove-btn");
    removeBtn.onclick = (e) => {
        e.stopPropagation(); // play olmasın
        const confirmDelete = confirm("Bu musiqi playlistdən silinsin?");
        if (confirmDelete) {
            card.remove();
            selectedSongs = selectedSongs.filter(s => s.src !== src);
        }
    };

    playlist.appendChild(card);
};


/* PLAY */
function playSong(src) {
    audio.src = src;
    audio.play();
    startVisualizer();
}

/* VISUALIZER */
function startVisualizer() {
    const canvas = document.getElementById("visual");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = 200;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();

    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 128;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        dataArray.forEach((value, i) => {
            ctx.fillStyle = `hsl(${value * 2},100%,50%)`;
            ctx.fillRect(i * 6, canvas.height - value, 4, value);
        });
    }

    draw();
}

/* PLUS BUTTON -> Yeni Playlist yarat */
plusBtn.onclick = () => {
    if (selectedSongs.length === 0) return; // alerti sildim

    const name = prompt("Yeni playlist adı:");
    if (!name) return;

    customPlaylists.push({ name, songs: [...selectedSongs] });
    selectedSongs = [];
    document.querySelectorAll(".card.selected").forEach(c => c.classList.remove("selected"));
}

/* LIBRARY BUTTON -> Favorilere əlavə et və ya Yeni Playlist yarat */
libraryBtn.onclick = () => {
    let libContainer = document.getElementById("libraryActions");

    if (!libContainer) {
        libContainer = document.createElement("div");
        libContainer.id = "libraryActions";
        libContainer.style.display = "flex";
        libContainer.style.flexDirection = "column";
        libContainer.style.gap = "10px";
        libContainer.style.position = "fixed";
        libContainer.style.top = "100px";
        libContainer.style.left = "100px";
        libContainer.style.background = "rgba(0,0,0,0.8)";
        libContainer.style.padding = "10px";
        libContainer.style.borderRadius = "10px";
        document.body.appendChild(libContainer);

        const favBtn = document.createElement("button");
        favBtn.innerText = "Favorilere əlavə et";
        favBtn.onclick = () => {
            if (selectedSongs.length === 0) return; // alert silindi
            favorites.push(...selectedSongs);
            selectedSongs = [];
            document.querySelectorAll(".card.selected").forEach(c => c.classList.remove("selected"));
        }

        const createBtn = document.createElement("button");
        createBtn.innerText = "Yeni playlist yarat";
        createBtn.onclick = () => {
            if (selectedSongs.length === 0) return; // alert silindi
            const name = prompt("Yeni playlist adı:");
            if (!name) return;

            customPlaylists.push({ name, songs: [...selectedSongs] });
            selectedSongs = [];
            document.querySelectorAll(".card.selected").forEach(c => c.classList.remove("selected"));
        }

        libContainer.appendChild(favBtn);
        libContainer.appendChild(createBtn);
    } else {
        libContainer.style.display = libContainer.style.display === "none" ? "flex" : "none";
    }
}

const searchInput = document.querySelector(".search-box input");

/* DEEZER SEARCH */
function deezerJSONP(url) {
    return new Promise((resolve, reject) => {
        const cb = "cb_" + Math.random().toString(36).slice(2);
        window[cb] = data => {
            resolve(data);
            delete window[cb];
            script.remove();
        };

        const script = document.createElement("script");
        script.src = url + "&callback=" + cb;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

async function searchDeezer(term) {
    if (!term.trim()) return;

    const data = await deezerJSONP(
        `https://api.deezer.com/search?q=${encodeURIComponent(term)}&output=jsonp`
    );

    playlist.innerHTML = ""; // main hissəni təmizlə

    data.data.forEach(track => {
        const card = document.createElement("div");
        card.className = "card deezer-card";

        card.innerHTML = `
      <img src="${track.album.cover_medium}" class="deezer-cover">
      <h4>${track.title}</h4>
      <p>${track.artist.name}</p>
    `;

        card.onclick = () => playSong(track.preview);

        playlist.appendChild(card);
    });
}

/* SEARCH INPUT */
let t;
searchInput.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => searchDeezer(searchInput.value), 500);
});



// Playlist-i təmizlə
playlist.innerHTML = "";

tracks.forEach(track => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h4>${track.title}</h4><p>${track.artist.name}</p>`;
    playlist.appendChild(card);

    if (track.preview) {
        card.onclick = () => playSong(track.preview);
    }
});



