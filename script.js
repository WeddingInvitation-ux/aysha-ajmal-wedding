const targetDate = new Date("2026-05-11T12:00:00+05:30");
const countdownParts = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};
const countdownNote = document.getElementById("countdown-note");

const musicToggle = document.getElementById("music-toggle");
const musicLabel = document.getElementById("music-label");
const weddingAudio = document.getElementById("wedding-audio");
const entryGate = document.getElementById("entry-gate");
const enterSiteButton = document.getElementById("enter-site");
const siteShell = document.getElementById("site-shell");

const progressBar = document.getElementById("scroll-progress-bar");

function setMusicUi(isPlaying, message) {
  if (!musicToggle || !musicLabel) return;

  musicToggle.classList.toggle("playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicLabel.textContent = message || (isPlaying ? "Music On" : "Music Off");
}

function updateCountdown() {
  const now = new Date();
  const distance = targetDate.getTime() - now.getTime();

  if (distance <= 0) {
    Object.values(countdownParts).forEach((el) => {
      if (el) el.textContent = "0";
    });

    if (countdownNote) {
      countdownNote.textContent = "The wedding day has arrived. Welcome and blessings.";
    }

    return;
  }

  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;

  const days = Math.floor(distance / day);
  const hours = Math.floor((distance % day) / hour);
  const minutes = Math.floor((distance % hour) / minute);
  const seconds = Math.floor((distance % minute) / 1000);

  countdownParts.days.textContent = String(days);
  countdownParts.hours.textContent = String(hours).padStart(2, "0");
  countdownParts.minutes.textContent = String(minutes).padStart(2, "0");
  countdownParts.seconds.textContent = String(seconds).padStart(2, "0");

  if (countdownNote) {
    countdownNote.textContent = "Counting down to Monday, 11 May 2026 at 12:00 PM.";
  }
}

function initReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
    return;
  }

  document.querySelectorAll(".reveal").forEach((el) => {
    const delay = el.getAttribute("data-delay");
    if (delay) {
      el.style.transitionDelay = delay;
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

let motionTicking = false;

function updateScrollMotion() {
  const viewport = window.innerHeight;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - viewport);
  const progress = Math.min(1, window.scrollY / maxScroll);

  if (progressBar) {
    progressBar.style.transform = `scaleX(${progress})`;
  }
}

function queueScrollMotion() {
  if (motionTicking) return;
  motionTicking = true;

  requestAnimationFrame(() => {
    updateScrollMotion();
    motionTicking = false;
  });
}

async function tryPlayMusic(source) {
  if (!weddingAudio) return false;

  try {
    await weddingAudio.play();
    localStorage.setItem("wedding_music", "on");
    setMusicUi(true, "Music On");
    return true;
  } catch (error) {
    if (source === "autoplay") {
      setMusicUi(false, "Tap For Music");
    } else {
      setMusicUi(false, "Tap Again");
    }
    return false;
  }
}

function stopMusic() {
  if (!weddingAudio) return;

  weddingAudio.pause();
  localStorage.setItem("wedding_music", "off");
  setMusicUi(false, "Music Off");
}

function enterInvitation() {
  document.body.classList.add("entered");
  if (entryGate) {
    entryGate.classList.add("hidden");
    window.setTimeout(() => {
      entryGate.style.display = "none";
    }, 760);
  }
  if (siteShell) {
    siteShell.removeAttribute("aria-hidden");
  }
}

async function initEntryGate() {
  if (!entryGate || !enterSiteButton || !weddingAudio) {
    document.body.classList.add("entered");
    return;
  }

  if (siteShell) {
    siteShell.setAttribute("aria-hidden", "true");
  }

  window.setTimeout(() => {
    entryGate.classList.add("ready");
  }, 700);

  const onEnter = async () => {
    enterSiteButton.disabled = true;
    enterSiteButton.textContent = "Entering...";

    await tryPlayMusic("manual");
    entryGate.classList.remove("ready");
    entryGate.classList.add("exiting");

    window.setTimeout(() => {
      enterInvitation();
    }, 620);
  };

  enterSiteButton.addEventListener("click", onEnter);
}

function initMusic() {
  if (!musicToggle || !musicLabel || !weddingAudio) return;

  weddingAudio.volume = 0.52;
  setMusicUi(false, "Music Off");

  musicToggle.addEventListener("click", async () => {
    if (weddingAudio.paused) {
      await tryPlayMusic("manual");
      return;
    }

    stopMusic();
  });

  weddingAudio.addEventListener("play", () => setMusicUi(true, "Music On"));
  weddingAudio.addEventListener("pause", () => {
    if (localStorage.getItem("wedding_music") === "off") {
      setMusicUi(false, "Music Off");
      return;
    }
    setMusicUi(false, "Music Off");
  });

  weddingAudio.addEventListener("error", () => setMusicUi(false, "Music Error"));
}

updateCountdown();
setInterval(updateCountdown, 1000);
initReveal();
initMusic();
initEntryGate();
updateScrollMotion();

window.addEventListener("scroll", queueScrollMotion, { passive: true });
window.addEventListener("resize", queueScrollMotion);
