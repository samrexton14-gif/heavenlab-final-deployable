
function showPage(pageId) {
  document.querySelectorAll("main").forEach(page => page.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
}

function goToHome() { showPage("home-page"); }
function goToProfile() { showPage("profile-page"); }
function goToTrend() { showPage("trend-page"); loadReels(); }

// Login
document.getElementById("login-form")?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const email = this.querySelector('input[type="email"]').value;
  const password = this.querySelector('input[type="password"]').value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.success) {
    showPage("home-page");
    this.reset();
  } else {
    alert(data.message || "Login failed");
  }
});

// Register
document.getElementById("register-form")?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const email = this.querySelector('input[type="email"]').value;
  const password = this.querySelector('input[type="password"]').value;

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  alert(data.message);
  if (data.success) {
    showPage("login-page");
    this.reset();
  }
});

// Upload Reels
document.getElementById('upload-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    alert(data.message);
    if (data.success) {
      this.reset();
      loadReels();
    }
  } catch (err) {
    alert('Upload failed');
  }
});

// Load Reels
async function loadReels() {
  const container = document.getElementById('reels-container');
  container.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch('/api/reels');
    const reels = await res.json();

    container.innerHTML = "";
    if (reels.length === 0) {
      container.innerHTML = "<p>No reels uploaded yet.</p>";
      return;
    }

    reels.forEach(reel => {
      container.innerHTML += ` +
      '`
        <div class="reel">
          <video controls width="100%">
            <source src="/uploads/reels/${reel.filename}" type="video/mp4">
          </video>
          <p>${reel.title || ""}</p>
        </div>`' +
      `;
    });
  } catch {
    container.innerHTML = "<p>Error loading reels</p>";
  }
}
