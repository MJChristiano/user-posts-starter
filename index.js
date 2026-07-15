const userListEl = document.getElementById("user-list");
const searchInputEl = document.getElementById("user-search");
const searchStatusEl = document.getElementById("user-search-status");

let allUsers = [];

function openUserPosts(id) {
  localStorage.setItem("id", String(id));
  window.location.href = "./user.html";
}

function normalizeWebsite(website) {
  if (!website) {
    return "";
  }

  return website.startsWith("http") ? website : `https://${website}`;
}

function userHTML(user) {
  return `
    <div class="user">
      <button class="user-card" data-user-id="${user.id}" type="button" aria-label="Open posts by ${user.name}">
        <div class="user-card__container">
          <h3>${user.name}</h3>
          <p><b>Email:</b> ${user.email}</p>
          <p><b>Phone:</b> ${user.phone}</p>
          <p><b>Website:</b> ${user.website}</p>
          <p class="user-card__meta">View posts</p>
        </div>
      </button>
    </div>
  `;
}

function loadingStateHTML() {
  return '<p class="user-list__status">Loading users...</p>';
}

function statusHTML(message) {
  return `<p class="user-list__status">${message}</p>`;
}

function updateSearchStatus(message) {
  if (!searchStatusEl) {
    return;
  }

  searchStatusEl.textContent = message;
}

function renderUsers(users) {
  if (!userListEl) {
    return;
  }

  if (!users.length) {
    userListEl.innerHTML = statusHTML("No users match your search.");
    return;
  }

  userListEl.innerHTML = users.map((user) => userHTML(user)).join("");
}

function applyUserFilter() {
  if (!searchInputEl) {
    renderUsers(allUsers);
    return;
  }

  const query = searchInputEl.value.trim().toLowerCase();
  const filteredUsers = allUsers.filter((user) => {
    const nameMatch = user.name.toLowerCase().includes(query);
    const emailMatch = user.email.toLowerCase().includes(query);
    return nameMatch || emailMatch;
  });

  renderUsers(filteredUsers);
  updateSearchStatus(`${filteredUsers.length} user${filteredUsers.length === 1 ? "" : "s"} shown`);
}

async function loadUsers() {
  if (!userListEl) {
    return;
  }

  userListEl.setAttribute("aria-busy", "true");
  userListEl.innerHTML = loadingStateHTML();

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const usersData = await response.json();
    allUsers = usersData.map((user) => ({
      ...user,
      website: normalizeWebsite(user.website).replace(/^https?:\/\//, ""),
    }));

    applyUserFilter();
  } catch {
    userListEl.innerHTML = statusHTML("Unable to load users right now. Please refresh and try again.");
    updateSearchStatus("Could not load users.");
  } finally {
    userListEl.setAttribute("aria-busy", "false");
  }
}

if (searchInputEl) {
  searchInputEl.addEventListener("input", applyUserFilter);
}

if (userListEl) {
  userListEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const card = target.closest(".user-card");
    if (!card) {
      return;
    }

    const userId = Number(card.getAttribute("data-user-id"));
    if (!Number.isInteger(userId)) {
      return;
    }

    openUserPosts(userId);
  });
}

loadUsers();


