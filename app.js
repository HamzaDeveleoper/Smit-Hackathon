document.addEventListener('DOMContentLoaded', () => {

    
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');


    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');


    const userNameSpan = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const searchBar = document.getElementById('search-bar');
    const createPostBtn = document.getElementById('create-post-btn');
    const postTextInput = document.getElementById('post-text');
    const postImageUrlInput = document.getElementById('post-image-url');
    const postsFeed = document.getElementById('posts-feed');
    const sortOptions = document.getElementById('sort-options');


    let currentUser = null;
    let posts = [];
    let currentSort = 'latest';
    let currentSearchTerm = '';

    
    const getStoredUsers = () => JSON.parse(localStorage.getItem('users')) || [];
    const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));
    
    const getStoredPosts = () => JSON.parse(localStorage.getItem('posts')) || [];
    const savePosts = (postsToSave) => localStorage.setItem('posts', JSON.stringify(postsToSave));

    const getStoredCurrentUser = () => JSON.parse(localStorage.getItem('currentUser'));
    const saveCurrentUser = (user) => localStorage.setItem('currentUser', JSON.stringify(user));
    const clearCurrentUser = () => localStorage.removeItem('currentUser');
    
    
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
        localStorage.setItem('theme', theme);
    };

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);


    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        const users = getStoredUsers();
        if (users.find(user => user.email === email)) {
            alert('User with this email already exists!');
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        saveUsers(users);
        alert('Signup successful! Please login.');
        signupForm.reset();
        showLoginLink.click();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const users = getStoredUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            login(user);
        } else {
            alert('Invalid email or password.');
        }
    });

    logoutBtn.addEventListener('click', () => {
        logout();
    });
    
    function login(user) {
        currentUser = user;
        saveCurrentUser(user);
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        userNameSpan.textContent = user.name;
        loadPosts();
    }

    function logout() {
        currentUser = null;
        clearCurrentUser();
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
    }

    function checkLoggedInUser() {
        const user = getStoredCurrentUser();
        if (user) {
            login(user);
        }
    }


    
    function loadPosts() {
        posts = getStoredPosts();
        renderPosts();
    }

    createPostBtn.addEventListener('click', () => {
        const text = postTextInput.value.trim();
        const imageUrl = postImageUrlInput.value.trim();

        if (!text) {
            alert('Post text cannot be empty.');
            return;
        }

        const newPost = {
            id: Date.now(),
            author: currentUser.name,
            text: text,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString(),
            likes: [], // Store user emails who liked
        };

        posts.unshift(newPost); // Add to the beginning
        savePosts(posts);
        renderPosts();
        postTextInput.value = '';
        postImageUrlInput.value = '';
    });
    

    postsFeed.addEventListener('click', (e) => {
        const target = e.target;
        
    
        if(target.classList.contains('like-btn')) {
            const postId = parseInt(target.closest('.post').dataset.id);
            toggleLike(postId);
        }

        if(target.classList.contains('delete-btn')) {
            const postId = parseInt(target.closest('.post').dataset.id);
            if (confirm('Are you sure you want to delete this post?')) {
                deletePost(postId);
            }
        }
    });

    function toggleLike(postId) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const userEmail = currentUser.email;
        const likeIndex = post.likes.indexOf(userEmail);

        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1); // Unlike
        } else {
            post.likes.push(userEmail); // Like
        }
        
        savePosts(posts);
        renderPosts();
    }

    function deletePost(postId) {
        posts = posts.filter(p => p.id !== postId);
        savePosts(posts);
        renderPosts();
    }


    searchBar.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase();
        renderPosts();
    });

    sortOptions.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderPosts();
    });

    
    function renderPosts() {
        postsFeed.innerHTML = '';

    
        let filteredPosts = posts.filter(post => 
            post.text.toLowerCase().includes(currentSearchTerm) ||
            post.author.toLowerCase().includes(currentSearchTerm)
        );

    
        switch (currentSort) {
            case 'latest':
                filteredPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'oldest':
                filteredPosts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'most-liked':
                filteredPosts.sort((a, b) => b.likes.length - a.likes.length);
                break;

        }

        if (filteredPosts.length === 0) {
            postsFeed.innerHTML = '<p>No posts found. Create one!</p>';
            return;
        }

        filteredPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.dataset.id = post.id;

            const isLiked = post.likes.includes(currentUser.email);
            const likeCount = post.likes.length;

            postElement.innerHTML = `
                <div class="post-header">
                    <span class="post-author">${post.author}</span>
                    <span class="post-timestamp">${new Date(post.timestamp).toLocaleString()}</span>
                </div>
                <div class="post-content">
                    <p>${post.text}</p>
                    ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image">` : ''}
                </div>
                <div class="post-actions">
                    <div class="like-section">
                        <button class="like-btn ${isLiked ? 'liked' : ''}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <span class="like-counter">${likeCount} ${likeCount === 1 ? 'Like' : 'Likes'}</span>
                    </div>
                    ${post.author === currentUser.name ? `<button class="delete-btn"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            `;
            postsFeed.appendChild(postElement);
        });
    }


    checkLoggedInUser();
});
