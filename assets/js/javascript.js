const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let playerYTB, getDataItem;
let playListSong = new Array;

const KEY_API = [
    "AIzaSyAKkNJJh2kbSgl31RObQuuEaS_6oRzT30Q", 
	"AIzaSyAvPUsjjqCxjx9ZlIZh-EcdiBAFbJOeoO0", 
	"AIzaSyB56E3cgBh0TMpNi5WQJT9AMFtChFIeEIo"
];

const KEY_PLAYLIST = [
    "PLWZvGxtWFBkgx1yH3KmVmqdDqjk1mJ95t"
];

const playlist = $('.playlist');
const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');

const playBtn = $('.btn-toggle-play');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const timeCurrent = $('.currentTime');
const timeDuration = $('.durationTime');
const progress = $('#progress');

console.log(playListSong);

const getPlayListItems = async function (keyAPI, keyPlayList) {
    let token;
    let resultArr = [];

    const result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
        params: {
            part: 'id,snippet',
            maxResults: 50,
            playlistId: keyPlayList,
            key: keyAPI
        }
    });

    token = result.data.nextPageToken;
    resultArr.push(result.data);

    while (token) {
        let result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
            params: {
                part: 'id,snippet',
                maxResults: 50,
                playlistId: keyPlayList,
                key: keyAPI,
                pageToken: token
            }
        })

        token = result.data.nextPageToken;
        resultArr.push(result.data);
    }	
    
    return resultArr;
}

const keyAPI = KEY_API[Math.floor(Math.random()*KEY_API.length)]
const keyPlayList = KEY_PLAYLIST[Math.floor(Math.random()*KEY_PLAYLIST.length)]

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    render: function() {
        const htmls = playListSong.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        });

        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return playListSong[this.currentIndex];
            }
        });
    },
    handleEvent: function() {

        const _this = this;

        const cdWidth = cd.offsetWidth;

        // Xử lý Spin CD
        const cdThumbAnimate = cdThumb.animate([{ 
            transform: 'rotate(360deg)'
        }], {
            duration: 10000, // 10 second
            iterations: Infinity,
        });

        cdThumbAnimate.pause();

        // xử lý phóng to / thu nhỏ CD Thumb
        document.onscroll = function() {
            const scroll = window.screenY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scroll;

            cd.style.width = newCdWidth > 0 ? `${newCdWidth}px` : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        getPlayListItems(keyAPI, keyPlayList)
        .then(data => {
            data.forEach((dataItem) => {
                dataItem.items.forEach((item) => playListSong.push(
                    {
                        name: item.snippet.title,
                        singer: item.snippet.videoOwnerChannelTitle,
                        path: item.snippet.resourceId.videoId,
                        image: item.snippet.thumbnails.standard.url,
                    }
                ));
            });

            playerYTB = new YT.Player('audio', {
                height: '0',
                width: '0',
                videoId: `${playListSong[this.currentIndex].path}`,
                playerVars: {
                  'playsinline': 1
                },
            });

            playBtn.onclick = function() {
                _this.isPlaying ? playerYTB.pause() : playerYTB.play();
            }

            // Khi bài hát được play
            playerYTB.play = function () {
                _this.isPlaying = true;
                player.classList.add('playing');
                cdThumbAnimate.play();
                playerYTB.playVideo();
            }

            // khi bài hát được pause
            playerYTB.pause = function () {
                _this.isPlaying = false;
                player.classList.remove('playing');
                cdThumbAnimate.pause();
                playerYTB.pauseVideo();
            }

            app.render();
        })
        .catch(err => console.log(err));
    },
    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        })
    },
    loadCurrentSong: function(){           
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;   
    },
    start: function() {

        // đĩnh nghĩa các thuộc tính
        // this.defineProperties();

        // xử lý các sự kiện
        this.handleEvent();

        // Tải thông tin bài hát đồng tiền vào UI khi chạy ứng dụng
        // this.loadCurrentSong();

        this.render();
    }
}

app.start();

console.log("Type app: " + typeof app)