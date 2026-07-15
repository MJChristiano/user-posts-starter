const MIN_USER_ID = 1;
const MAX_USER_ID = 10;
const SEARCH_DEBOUNCE_MS = 300;

const hasDocument = typeof document !== "undefined";
const postListEl = hasDocument ? document.getElementById("post-list") : null;
const searchInputEl = hasDocument
  ? document.getElementById("search-input")
  : null;
const validationMessageEl = hasDocument
  ? document.getElementById("search-input-message")
  : null;

const storedUserId = getStoredUserId();
let debounceTimer = null;

function onSearchChange(event) {
  const rawValue = event.target.value;

  if (!rawValue) {
    showValidationMessage("Enter a user ID from 1 to 10.");
    return;
  }

  const userId = parseUserId(rawValue);
  if (!isValidUserId(userId)) {
    showValidationMessage("User ID must be a whole number from 1 to 10.");
    return;
  }

  clearValidationMessage();
  localStorage.setItem("id", String(userId));

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    renderPosts(userId);
  }, SEARCH_DEBOUNCE_MS);
}

async function renderPosts(userId) {
  if (!postListEl) {
    return;
  }

  postListEl.setAttribute("aria-busy", "true");
  postListEl.innerHTML = loadingStateHTML();

  try {
    const posts = await fetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${userId}`,
    );

    if (!posts.ok) {
      throw new Error("Request failed");
    }

    const postsData = await posts.json();

    if (!postsData.length) {
      postListEl.innerHTML = emptyStateHTML("They never posted.");
      return;
    }

    postListEl.innerHTML = postsData.map((post) => postHTML(post)).join("");
  } catch {
    postListEl.innerHTML = emptyStateHTML(
      "Unable to load posts right now. Please try again.",
    );
  } finally {
    postListEl.setAttribute("aria-busy", "false");
  }
}

function postHTML(post) {
  return `
        <div class="post">
          <div class="post__title">
          ${post.title}
          </div>
          <p class="post__body">
          ${post.body}
          </p>
        </div>
      `;
}

function emptyStateHTML(message) {
  return `<p class="post-list__empty">${message}</p>`;
}

function loadingStateHTML() {
  return '<p class="post-list__status">Loading posts...</p>';
}

function parseUserId(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return NaN;
  }

  const userId = Number(value);
  return Number.isInteger(userId) ? userId : NaN;
}

function isValidUserId(userId) {
  return userId >= MIN_USER_ID && userId <= MAX_USER_ID;
}

function showValidationMessage(message) {
  if (!validationMessageEl) {
    return;
  }

  validationMessageEl.textContent = message;
}

function clearValidationMessage() {
  if (!validationMessageEl) {
    return;
  }

  validationMessageEl.textContent = "";
}

function getStoredUserId() {
  if (typeof localStorage === "undefined") {
    return MIN_USER_ID;
  }

  const savedUserId = parseUserId(localStorage.getItem("id"));
  return isValidUserId(savedUserId) ? savedUserId : MIN_USER_ID;
}

if (searchInputEl) {
  searchInputEl.value = String(storedUserId);
  searchInputEl.addEventListener("input", onSearchChange);
}

if (hasDocument) {
  renderPosts(storedUserId);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseUserId,
    isValidUserId,
    emptyStateHTML,
    loadingStateHTML,
  };
}
