const ambientVideoSources = [
  "img/words_1.webm",
  "img/words_2.webm",
  "img/words_3.webm",
  "img/words_4.webm",
];

let ambientVideosStarted = false;

function startAmbientVideos() {
  if (ambientVideosStarted) return;

  const layer = document.getElementById("ambient-videos");
  if (!layer) return;

  ambientVideosStarted = true;

  ambientVideoSources.forEach((src, index) => {
    const video = document.createElement("video");

    video.className = "ambient-video";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";

    layer.append(video);

    function placeVideo() {
      const screenW = layer.clientWidth;
      const screenH = layer.clientHeight;
      const sectionW = screenW / ambientVideoSources.length;

      const width = video.getBoundingClientRect().width;
      const height = video.getBoundingClientRect().height;


      const centerLeft = screenW / 2 - 200;
      const centerRight = screenW / 2 + 200;
      const centerTop = screenH / 2 - 200;
      const centerBottom = screenH / 2 + 200;


      const minX = index * sectionW;
      const maxX = (index + 1) * sectionW - width;
      const minY = 0;
      const maxY = screenH * 0.7 - height;


      const ranges = [
        [minX, Math.min(maxX, centerLeft - width), minY, maxY],
        [Math.max(minX, centerRight), maxX, minY, maxY],
        [minX, maxX, minY, Math.min(maxY, centerTop - height)],
        [minX, maxX, Math.max(minY, centerBottom), maxY],
      ].filter(([x1, x2, y1, y2]) => x2 >= x1 && y2 >= y1);


      if (ranges.length === 0) {
        video.style.visibility = "hidden";
        return;
      }

      video.style.visibility = "visible";

      const [x1, x2, y1, y2] =
        ranges[Math.floor(Math.random() * ranges.length)];

      video.style.left = `${x1 + Math.random() * (x2 - x1)}px`;
      video.style.top = `${y1 + Math.random() * (y2 - y1)}px`;
    }

    function showVideo() {
      placeVideo();
      video.play().catch(() => {});


      video.classList.remove("is-visible");
      void video.offsetWidth;
      video.classList.add("is-visible");
    }

    video.addEventListener("animationend", (event) => {
      if (event.animationName !== "ambient-fade") return;

      video.classList.remove("is-visible");
      video.pause();


      setTimeout(showVideo, 1000 + Math.random() * 3000);
    });

    video.addEventListener("loadeddata", () => {
      placeVideo();


      setTimeout(showVideo, Math.random() * 2000);
    }, { once: true });

    window.addEventListener("resize", placeVideo);

    video.src = src;
    video.load();
  });
}