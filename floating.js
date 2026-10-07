const floatingImages = [
  "img/floating_1.svg",
  "img/floating_2.svg",
  "img/floating_3.svg",
  "img/floating_4.svg",
  "img/floating_5.svg"
];

const floatingLayer = document.getElementById("floating-images");

const randomBetween = (min, max) =>
  min + Math.random() * (max - min);

function spawnFloatingImage() {
  if (!floatingLayer || floatingImages.length === 0) return;

  const wrapper = document.createElement("div");
  const image = document.createElement("img");

  const size = randomBetween(47, 55);
  const duration = randomBetween(6, 12);

  image.src =
    floatingImages[Math.floor(Math.random() * floatingImages.length)];
  image.alt = "";
  image.draggable = false;

  wrapper.className = "floating-image";


  wrapper.style.left = `calc(${randomBetween(10, 90)}% - ${size / 2}px)`;
  wrapper.style.setProperty("--size", `${size}px`);
  wrapper.style.setProperty("--duration", `${duration}s`);
  wrapper.style.setProperty("--sway", `${randomBetween(12, 35)}px`);
  wrapper.style.setProperty("--sway-duration", `${randomBetween(1, 2.5)}s`);

  wrapper.append(image);


  image.onload = () => {
    floatingLayer.append(wrapper);

    wrapper.addEventListener("animationend", (event) => {
      if (event.target === wrapper) wrapper.remove();
    });

    setTimeout(() => wrapper.remove(), duration * 1000 + 1000);
  };
}

function spawnFloatingImages() {
  const count = Math.floor(randomBetween(4, 10));

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      spawnFloatingImage();
    }, randomBetween(0, 500));
  }
}

spawnFloatingImages();

// const floatingTimer = setInterval(spawnFloatingImages, 7000);