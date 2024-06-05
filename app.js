document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const mainContent = document.querySelector("main");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = e.target.dataset.page;
      loadPage(page);
    });
  });

  function loadPage(page) {
    mainContent.innerHTML = "";
    switch (page) {
      case "home":
        loadHomeContent();
        break;
      case "books":
        loadBooksContent();
        break;
      case "favorites":
        loadFavoritesContent();
        break;
      default:
        break;
    }
  }

  function loadHomeContent() {
    mainContent.innerHTML = `
        <div class="home-page">
          <div class="home-text">
            <p>Welcome to Business Books!</p>
            <h1>Explore a vast collection of business books and find your next great read.</h1>
          </div>
          <div class="home-image">
            <div class="image-shadow"></div>
            <img src="img/book.jpg" alt="Book Cover">
          </div>
        </div>
      `;
  }

  function loadBooksContent() {
    mainContent.innerHTML = `
        <div class="row">
          <div class="col-12 mb-3">
            <input type="text" class="form-control" id="searchBar" placeholder="Search books...">
          </div>
        </div>
        <div class="row row-cols-1 row-cols-md-3 g-4 text-center" id="bookList"></div>
      `;
    const searchBar = document.getElementById("searchBar");
    searchBar.addEventListener("input", filterBooks);
    fetchAndDisplayBooks();
  }

  async function fetchAndDisplayBooks() {
    try {
      const response1 = await fetch(
        "https://www.googleapis.com/books/v1/volumes?q=subject:business&maxResults=30"
      );
      const data1 = await response1.json();
      displayBooks(data1.items);

      const response2 = await fetch(
        "https://openlibrary.org/subjects/business.json?details=true"
      );
      const data2 = await response2.json();
      displayBooks(data2.works);
    } catch (error) {
      console.error("Error fetching book data:", error);
    }
  }

  function displayBooks(books) {
    const bookList = document.getElementById("bookList");
    books.forEach((book) => {
      const title = book.volumeInfo ? book.volumeInfo.title : book.title;
      const coverUrl =
        book.volumeInfo && book.volumeInfo.imageLinks
          ? book.volumeInfo.imageLinks.thumbnail
          : `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`;

      const bookItem = document.createElement("div");
      bookItem.classList.add("col");
      bookItem.innerHTML = `
            <div class="card h-100">
                <img src="${coverUrl.replace(
                  "http:",
                  "https:"
                )}" class="card-img-top book-thumbnail mx-auto" alt="${title}" data-book='${JSON.stringify(
        book
      )}' style="width: 128px; height: 192px;">
                <div class="card-body">
                    <h5 class="card-title book-title">${title}</h5>
                </div>
            </div>
        `;
      bookList.appendChild(bookItem);
    });

    const bookThumbnails = document.querySelectorAll(".book-thumbnail");
    bookThumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", (e) => {
        const book = JSON.parse(e.target.getAttribute("data-book"));
        loadBookDetail(book);
      });
    });
  }

  function filterBooks(event) {
    const searchQuery = event.target.value.toLowerCase();
    const bookItems = mainContent.querySelectorAll("#bookList .col");
    bookItems.forEach((item) => {
      const bookTitle = item
        .querySelector(".book-title")
        .textContent.toLowerCase();
      if (bookTitle.includes(searchQuery)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }

  function loadBookDetail(book) {
    const bookDetail = {
      title: book.volumeInfo?.title || book.title,
      coverUrl:
        book.volumeInfo?.imageLinks?.thumbnail ||
        `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`,
      previewLink:
        book.volumeInfo?.previewLink || `https://openlibrary.org${book.key}`,
      description: book.volumeInfo?.description || "No description available.",
      authors: book.volumeInfo?.authors?.join(", ") || "Unknown author(s)",
      publishedDate:
        book.volumeInfo?.publishedDate || "Unknown publication date",
    };
    mainContent.innerHTML = `
        <div class="text-center">
          <img src="${bookDetail.coverUrl
            .replace("http:", "https:")
            .replace(
              "zoom=1",
              "zoom=2"
            )}" class="img-fluid mb-3" style="width: 200px; height: 300px;" alt="${
      bookDetail.title
    }">
          <h1>${bookDetail.title}</h1>
          <p><strong>Authors:</strong> ${bookDetail.authors}</p>
          <p><strong>Published Date:</strong> ${bookDetail.publishedDate}</p>
          <p>${bookDetail.description}</p>
          <a href="${
            bookDetail.previewLink
          }" class="btn btn-primary mb-2" target="_blank">Read</a>
          <button class="btn btn-secondary mb-2" onclick='addToFavoritesDetail(${JSON.stringify(
            bookDetail
          )})'>Add to Favorites</button>
        </div>
      `;
    addBackButton();
  }

  function loadFavoritesContent() {
    mainContent.innerHTML = "<h1>Favorites</h1>";
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const favoritesList = document.createElement("div");
    favoritesList.classList.add(
      "row",
      "row-cols-1",
      "row-cols-md-3",
      "g-4",
      "text-center"
    );
    favorites.forEach((favorite) => {
      const favoriteItem = document.createElement("div");
      favoriteItem.classList.add("col");
      favoriteItem.innerHTML = `
          <div class="card h-100">
            <img src="${favorite.coverUrl
              .replace("http:", "https:")
              .replace(
                "zoom=1",
                "zoom=2"
              )}" class="card-img-top book-thumbnail mx-auto" alt="${
        favorite.title
      }" data-book='${JSON.stringify(
        favorite
      )}' style="width: 128px; height: 192px;">
            <div class="card-body">
              <h5 class="card-title book-title">${favorite.title}</h5>
              <button class="btn btn-danger mt-2" data-book='${JSON.stringify(
                favorite
              )}'>Remove from Favorites</button>
            </div>
          </div>
        `;
      favoritesList.appendChild(favoriteItem);
    });
    mainContent.appendChild(favoritesList);
    const bookThumbnails = document.querySelectorAll(".book-thumbnail");
    bookThumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", (e) => {
        const book = JSON.parse(e.target.getAttribute("data-book"));
        loadBookDetail(book);
      });
    });
    const removeButtons = document.querySelectorAll(".btn-danger");
    removeButtons.forEach((button) => {
      button.addEventListener("click", removeFromFavorites);
    });
  }

  function addBackButton() {
    const backButton = document.createElement("button");
    backButton.classList.add("btn", "btn-secondary", "my-3");
    backButton.textContent = "Back";
    backButton.addEventListener("click", () => loadPage("books"));
    mainContent.prepend(backButton);
  }

  window.addToFavoritesDetail = function (bookDetail) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const index = favorites.findIndex(
      (favorite) => favorite.title === bookDetail.title
    );

    if (index === -1) {
      favorites.push(bookDetail);
      alert(`${bookDetail.title} added to favorites`);
    } else {
      favorites.splice(index, 1);
      alert(`${bookDetail.title} removed from favorites`);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavoritesContent();
  };

  function removeFromFavorites(event) {
    const bookData = JSON.parse(event.target.dataset.book);
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const index = favorites.findIndex(
      (favorite) => favorite.title === bookData.title
    );
    if (index !== -1) {
      favorites.splice(index, 1);
      alert(`${bookData.title} removed from favorites`);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      loadFavoritesContent();
    }
  }

  const chatWindows = document.getElementById("chat-windows");
  createChatBox("Community Chat");

  function createChatBox(title) {
    const chatBox = document.createElement("div");
    chatBox.classList.add("chat-window");
    chatBox.innerHTML = `
        <div class="chat-header">
          <h3>${title}</h3>
          <button class="minimize-chat-btn">&minus;</button>
        </div>
        <div class="chat-messages"></div>
        <input type="text" class="chat-input" placeholder="Type your message..." />
      `;

    const chatInput = chatBox.querySelector(".chat-input");
    chatInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const message = event.target.value.trim();
        if (message) {
          const chatMessage = JSON.stringify({
            type: "chat",
            user: username,
            message: message,
          });
          socket.send(chatMessage);
          event.target.value = "";
        }
      }
    });

    const minimizeBtn = chatBox.querySelector(".minimize-chat-btn");
    minimizeBtn.addEventListener("click", () => {
      const chatMessages = chatBox.querySelector(".chat-messages");
      const chatInput = chatBox.querySelector(".chat-input");
      if (chatMessages.style.display === "none") {
        chatMessages.style.display = "block";
        chatInput.style.display = "block";
        minimizeBtn.textContent = "−";
        chatBox.style.height = "400px";
      } else {
        chatMessages.style.display = "none";
        chatInput.style.display = "none";
        minimizeBtn.textContent = "+";
        chatBox.style.height = "40px";
      }
    });

    chatWindows.appendChild(chatBox);
  }

  function displayMessage(sender, message) {
    const chatBox = document.querySelector(".chat-window");
    const chatMessages = chatBox.querySelector(".chat-messages");
    const messageElement = document.createElement("p");
    messageElement.textContent = `${sender}: ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  const socket = new WebSocket("ws://localhost:3000");

  socket.addEventListener("open", () => {
    console.log("WebSocket connection established");
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "history") {
      data.data.forEach((message) =>
        displayMessage(message.user, message.message)
      );
    } else if (data.type === "chat") {
      displayMessage(data.data.user, data.data.message);
    }
  });

  socket.addEventListener("close", () => {
    console.log("WebSocket connection closed");
  });

  const username = `User${Math.floor(Math.random() * 1000)}`;

  document.body.onload = () => {
    loadPage("home");
  };
});
