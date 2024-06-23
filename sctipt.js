document.addEventListener('DOMContentLoaded', async () => {
    const viewer = document.querySelector('.manga-viewer');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const newsLink = document.getElementById('news-link');
    let currentSlide = 0;
    let slides = [];

    // JSONデータを読み込む関数
    async function loadMangaData() {
        try {
            const response = await fetch('https://syachi-progate-449933683609.s3-us-west-2.amazonaws.com/api_responses/20240623/manga_api.json');
            return await response.json();
        } catch (error) {
            console.error('Error loading manga data:', error);
            return [];
        }
    }

    // スライドを動的に生成する関数
    function createSlides(mangaData) {
        viewer.innerHTML = ''; // 既存のスライドをクリア
        mangaData.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = 'manga-slide';
            slide.dataset.newsUrl = item.article_url;
            slide.innerHTML = `
                <img id="news${index + 1}" src="${item.manga_url}" alt="4コマ漫画${index + 1}">
            `;
            viewer.appendChild(slide);
        });
        slides = document.querySelectorAll('.manga-slide');
    }

    // 以下は既存のコードを維持
    function updateSlides(offset = 0) {
        slides.forEach((slide, index) => {
            slide.style.transform = `translateY(${100 * (index - currentSlide) + offset}%)`;
        });
        updateNewsLink();
    }

    function updateNewsLink() {
        const currentNewsUrl = slides[currentSlide].dataset.newsUrl;
        newsLink.href = currentNewsUrl;
    }

    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            updateSlides();
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlides();
        }
    }

    // タッチスワイプの処理
    let startY;
    let isDragging = false;
    viewer.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
    });

    viewer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diff = startY - currentY;
        const translateY = -diff / viewer.clientHeight * 100;
        updateSlides(translateY);
    });

    viewer.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const endY = e.changedTouches[0].clientY;
        const diff = startY - endY;
        if (Math.abs(diff) > 50) { // 50px以上のスワイプで切り替え
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            updateSlides(); // 元の位置に戻す
        }
    });

    // フルスクリーン機能
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
                document.documentElement.msRequestFullscreen();
            }
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // ナビゲーションボタンのイベントリスナーを追加
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // JSONデータを読み込んでスライドを生成
    const mangaData = await loadMangaData();
    createSlides(mangaData);

    // 初期表示
    updateSlides();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered: ', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed: ', error);
            });
    });
}