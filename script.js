console.log("lets write javascript")
let CurrentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Show all the Songs in the PlayList.
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Arnab</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div> </li>`;
    }

    //Attach an Event Listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    CurrentSong.src = `/${currfolder}/` + track
    if (!pause) {
        CurrentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    console.log("displayAlbums")
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML += ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                    <!-- Circular green background -->
                    <circle cx="12" cy="12" r="12" fill="#1fdf64" />
                    <!-- Play button SVG icon -->
                    <path d="M7 5v14l11-7z" fill="#000000" transform="translate(3, 3) scale(0.8)" />
                </svg>
            </div>
            
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div> `
        }
    }

    //Load the playlist whenever card is Clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}

async function main() {
    // Get the list of all the Songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums()

    //Attach an Event listener to play, next and previous 
    play.addEventListener("click", () => {
        if (CurrentSong.paused) {
            CurrentSong.play()
            play.src = "pause.svg"
        }
        else {
            CurrentSong.pause()
            play.src = "play.svg"
        }
    })

    //Listen for time Update event
    CurrentSong.addEventListener("timeupdate", () => {
        // console.log(CurrentSong.currentTime, CurrentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(CurrentSong.currentTime)} / ${secondsToMinutesSeconds(CurrentSong.duration)}`
        document.querySelector(".circle").style.left = (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
    })

    //Add an event Listener to Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        CurrentSong.currentTime = ((CurrentSong.duration) * percent) / 100;
    })

    //Add an event Listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    // previous.addEventListener("click", () => {
    //     CurrentSong.pause()
    //     let index = songs.indexOf(CurrentSong.src.split("/").slice(-1)[0])
    //     if ((index - 1) >= 0) {
    //         playMusic(songs[index - 1])
    //     }
    // })

    previous.addEventListener("click", async () => {
        CurrentSong.pause();
        let folder = CurrentSong.src.split("/").slice(-2)[0]; // Extract folder name from the current song's src
        let response = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
        
        if (!response.ok) {
            console.error("Failed to fetch songs data:", response.statusText);
            return;
        }
        
        let songsData = await response.json(); // Assuming the server returns a JSON object of song filenames
        
        // Log the songsData object to inspect its contents
        console.log("songsData:", songsData);
        
        // Check if the current song exists in the object
        if (songsData.hasOwnProperty(CurrentSong.src.split("/").slice(-1)[0])) {
            // Continue with previous song logic
        } else {
            console.error("Current song not found in the list of songs");
        }
    });
    

    // Add an event listener to next
    next.addEventListener("click", () => {
        CurrentSong.pause()
        let index = songs.indexOf(CurrentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

}
main()