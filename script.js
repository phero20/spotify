let songfolders = [
    "songs/mix/info.json",
    "songs/atif aslam/info.json",
    "songs/arijit singh/info.json",
    "songs/KK/info.json",
    "songs/english songs/info.json",
    "songs/ncs/info.json",
    "songs/honey/info.json",
    "songs/pritam/info.json",
    "songs/anuv jain/info.json", 
];

let currentAudio = null;
let currentIndex = 0;
let currentPlaylistIndex = null;

async function cardd() {
    let cardsHTML = ""; // Use a temporary variable to store all cards' HTML
    for (let i = 0; i < songfolders.length; i++) {
        try {
            const response = await fetch(`${songfolders[i]}`);
            const data = await response.json();

            let imgs = data.img;
            let name = data.title;

            let cards = `
                <div class="playlist-card">
                    <img src="${imgs}" alt="playlist1" width="100%">
                    <h4>${name}</h4>
                    <div class="imgplay" data-index="${i}">
                        <img src="images/play.png" alt="" width="50%">
                    </div>
                </div>`;
            cardsHTML += cards; // Append the card's HTML to the variable
        } catch (error) {
            console.error('Error fetching the JSON data:', error);
        }
    }
    let a = document.querySelector(".playlist-cards");
    a.innerHTML = cardsHTML;
    document.querySelectorAll(".imgplay").forEach(element => {
        element.addEventListener("click", function() {
            main(this.getAttribute("data-index"));
        });
    });
    document.querySelectorAll(".imgplay").forEach(element => {
        element.addEventListener("click", function() {
            if (window.innerWidth < 1100) {
                const left = document.querySelector(".left");
                left.style.position = "absolute";
                left.style.zIndex = "10";
                left.style.backgroundColor = "black";
                left.style.left = "0"; // Adjust as needed
            }
            main(this.getAttribute("data-index"));
        });
    }) // Update innerHTML once after the loop
}

cardd();

function main(i) {
    if (currentPlaylistIndex === parseInt(i)) {
        // If switching to the same playlist, do nothing
        return;
    }

    currentPlaylistIndex = parseInt(i); // Update the current playlist index
    currentIndex = 0; // Reset the current index

    fetch(`${songfolders[i]}`)
        .then(response => response.json())
        .then(data => {
            const songs = data.song;
            let ul = document.querySelector(".list-ul");
            ul.innerHTML = ""; // Clear the list before adding new songs
            songs.forEach(song => {
                let songname = `<li> 
        <div class="my-song-list-cards">
            <img src="images/musical-note.png" alt="music" width="30px">
            <h3>${song.name}</h3>
            <div class="left-play">
                <img src="images/play.png" alt="play" width="16px">
            </div>
            <audio src="${song.link}"></audio>
        </div>
    </li>`;
                ul.innerHTML += songname;
            });

            function togglePlayPause(audio, playButton, songName) {
                const barPlayButton = document.querySelector(".barplay img");
                const songInfo = document.querySelector(".songinfo");

                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause();
                    currentAudio.closest('.my-song-list-cards').querySelector('.left-play img').src = "images/play.png";
                    barPlayButton.src = "images/play.png"; // Update barplay button
                }

                if (audio.paused) {
                    audio.play();
                    playButton.src = "images/pause.png"; // Change the image source to pause.png
                    barPlayButton.src = "images/pause.png"; // Update barplay button
                    songInfo.textContent = songName; // Update song info
                    currentAudio = audio;
                } else {
                    audio.pause();
                    playButton.src = "images/play.png"; // Change the image source back to play.png
                    barPlayButton.src = "images/play.png"; // Update barplay button
                    currentAudio = null;
                }
            }

            function formatTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
            }

            function updateSongTime(audio) {
                const songTime = document.querySelector(".songtime");
                const currentTime = formatTime(audio.currentTime);
                const duration = formatTime(audio.duration);
                songTime.textContent = `${currentTime} / ${duration}`;

                const seekbar = document.querySelector(".seekbar");
                const circle = seekbar.querySelector(".circle");
                const played = seekbar.querySelector(".played");
                const progress = (audio.currentTime / audio.duration) * 100;
                circle.style.left = `${progress}%`;
                played.style.width = `${progress}%`;
            }

            function handleSeek(audio, event) {
                const seekbar = document.querySelector(".seekbar");
                const rect = seekbar.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const percentage = Math.max(0, Math.min(offsetX / rect.width, 1));
                audio.currentTime = percentage * audio.duration;
            }

            function playNextSong() {
                currentIndex = (currentIndex + 1) % songs.length;
                const nextAudio = document.querySelectorAll('.my-song-list-cards audio')[currentIndex];
                const nextPlayButton = document.querySelectorAll('.left-play img')[currentIndex];
                const nextSongName = songs[currentIndex].name;
                togglePlayPause(nextAudio, nextPlayButton, nextSongName);
                nextAudio.addEventListener('timeupdate', () => updateSongTime(nextAudio));
                nextAudio.addEventListener('ended', playNextSong);
            }

            document.querySelectorAll(".left-play img").forEach((playButton, index) => {
                playButton.addEventListener("click", function () {
                    const audio = this.closest('.my-song-list-cards').querySelector('audio');
                    const songName = songs[index].name;
                    togglePlayPause(audio, this, songName);
                    audio.addEventListener('timeupdate', () => updateSongTime(audio));
                    audio.addEventListener('ended', playNextSong);
                });
            });

            const barPlayButton = document.querySelector(".barplay img");
            barPlayButton.addEventListener("click", function () {
                if (currentAudio) {
                    if (currentAudio.paused) {
                        currentAudio.play();
                        barPlayButton.src = "images/pause.png";
                    } else {
                        currentAudio.pause();
                        barPlayButton.src = "images/play.png";
                    }
                }
            });

            const nextButton = document.querySelector(".next img");
            nextButton.addEventListener("click", function () {
                if (currentAudio) {
                    playNextSong();
                }
            });

            const previousButton = document.querySelector(".previous img");
            previousButton.addEventListener("click", function () {
                if (currentAudio) {
                    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
                    const prevAudio = document.querySelectorAll('.my-song-list-cards audio')[currentIndex];
                    const prevPlayButton = document.querySelectorAll('.left-play img')[currentIndex];
                    const prevSongName = songs[currentIndex].name;
                    togglePlayPause(prevAudio, prevPlayButton, prevSongName);
                    prevAudio.addEventListener('timeupdate', () => updateSongTime(prevAudio));
                    prevAudio.addEventListener('ended', playNextSong);
                }
            });

            const volumeSlider = document.querySelector(".range input[type='range']");
            const volumeIcon = document.getElementById("volume-icon");

            volumeSlider.addEventListener("input", function () {
                if (currentAudio) {
                    currentAudio.volume = this.value;
                }
                if (this.value == 0) {
                    volumeIcon.src = "images/sound-off.png";
                } else {
                    volumeIcon.src = "images/volume-up.png";
                }
            });

            volumeIcon.addEventListener("click", function () {
                if (currentAudio) {
                    if (currentAudio.volume > 0) {
                        currentAudio.volume = 0;
                        volumeSlider.value = 0;
                        volumeIcon.src = "images/sound-off.png";
                    } else {
                        currentAudio.volume = 0.5;
                        volumeSlider.value = 0.5;
                        volumeIcon.src = "images/volume-up.png";
                    }
                }
            });

            const seekbar = document.querySelector(".seekbar");
            const circle = seekbar.querySelector(".circle");

            seekbar.addEventListener("click", function (event) {
                if (currentAudio) {
                    handleSeek(currentAudio, event);
                }
            });

            circle.addEventListener("mousedown", function (event) {
                event.preventDefault();

                function onMouseMove(e) {
                    if (currentAudio) {
                        handleSeek(currentAudio, e);
                    }
                }

                function onMouseUp() {
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                }

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });
        })
        .catch(error => console.error('Error fetching the JSON data:', error));
}

// Initialize the playbar event listeners once
function initializePlaybar() {
    const barPlayButton = document.querySelector(".barplay img");
    const nextButton = document.querySelector(".next img");
    const previousButton = document.querySelector(".previous img");
    const volumeSlider = document.querySelector(".range input[type='range']");
    const volumeIcon = document.getElementById("volume-icon");
    const seekbar = document.querySelector(".seekbar");
    const circle = seekbar.querySelector(".circle");

    barPlayButton.addEventListener("click", function () {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                barPlayButton.src = "images/pause.png";
            } else {
                currentAudio.pause();
                barPlayButton.src = "images/play.png";
            }
        }
    });

    nextButton.addEventListener("click", function () {
        if (currentAudio) {
            currentIndex = (currentIndex + 1) % document.querySelectorAll('.my-song-list-cards audio').length;
            const nextAudio = document.querySelectorAll('.my-song-list-cards audio')[currentIndex];
            const nextPlayButton = document.querySelectorAll('.left-play img')[currentIndex];
            const nextSongName = document.querySelectorAll('.my-song-list-cards h3')[currentIndex].textContent;
            togglePlayPause(nextAudio, nextPlayButton, nextSongName);
            nextAudio.addEventListener('timeupdate', () => updateSongTime(nextAudio));
            nextAudio.addEventListener('ended', playNextSong);
        }
    });

    previousButton.addEventListener("click", function () {
        if (currentAudio) {
            currentIndex = (currentIndex - 1 + document.querySelectorAll('.my-song-list-cards audio').length) % document.querySelectorAll('.my-song-list-cards audio').length;
            const prevAudio = document.querySelectorAll('.my-song-list-cards audio')[currentIndex];
            const prevPlayButton = document.querySelectorAll('.left-play img')[currentIndex];
            const prevSongName = document.querySelectorAll('.my-song-list-cards h3')[currentIndex].textContent;
            togglePlayPause(prevAudio, prevPlayButton, prevSongName);
            prevAudio.addEventListener('timeupdate', () => updateSongTime(prevAudio));
            prevAudio.addEventListener('ended', playNextSong);
        }
    });

    volumeSlider.addEventListener("input", function () {
        if (currentAudio) {
            currentAudio.volume = this.value;
        }
        if (this.value == 0) {
            volumeIcon.src = "images/sound-off.png";
        } else {
            volumeIcon.src = "images/volume-up.png";
        }
    });

    volumeIcon.addEventListener("click", function () {
        if (currentAudio) {
            if (currentAudio.volume > 0) {
                currentAudio.volume = 0;
                volumeSlider.value = 0;
                volumeIcon.src = "images/sound-off.png";
            } else {
                currentAudio.volume = 0.5;
                volumeSlider.value = 0.5;
                volumeIcon.src = "images/volume-up.png";
            }
        }
    });

    seekbar.addEventListener("click", function (event) {
        if (currentAudio) {
            handleSeek(currentAudio, event);
        }
    });

    circle.addEventListener("mousedown", function (event) {
        event.preventDefault();

        function onMouseMove(e) {
            if (currentAudio) {
                handleSeek(currentAudio, e);
            }
        }

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}

// Initialize the playbar event listeners once
initializePlaybar();
document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.querySelector(".hamburger");
    const left = document.querySelector(".left");
    const right = document.querySelector(".right");

    hamburger.addEventListener("click", function() {
        if (left.style.left === "-40vw" || left.style.left === "" || left.style.left === "-50vw"|| left.style.left === "-60vw") {
            left.style.position = "absolute";
            left.style.zIndex = "10";
            left.style.backgroundColor = "black";
            left.style.left = "0"; // Adjust as needed
        } else {
            if(window.innerWidth < 650) {
                left.style.left = "-60vw";
            }
          else if (window.innerWidth < 760) {
                left.style.left = "-50vw";
            } else if (window.innerWidth < 1100) {
                left.style.left = "-40vw";
            }
            right.style.marginLeft = "0";
        }
    });

    document.querySelector(".cross").addEventListener("click", function() {
        if(window.innerWidth < 650) {
            document.querySelector(".left").style.left = "-60vw";
        }
       else if (window.innerWidth < 760) {
            document.querySelector(".left").style.left = "-50vw";
        } else if (window.innerWidth < 1100) {
            document.querySelector(".left").style.left = "-40vw";
        }
    });
});
document.addEventListener("DOMContentLoaded", function() {
    const rangeInput = document.querySelector(".range input[type='range']");

    function updateRangeBackground() {
        const value = (rangeInput.value - rangeInput.min) / (rangeInput.max - rangeInput.min) * 100;
        rangeInput.style.setProperty('--value', `${value}%`);
    }

    rangeInput.addEventListener("input", updateRangeBackground);
    updateRangeBackground(); // Initialize on page load
});
