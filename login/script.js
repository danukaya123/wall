// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2vYzivm2Gbgl_ee0t81d6r5GPHeI4Gqs",
    authDomain: "quizontal-de977.firebaseapp.com",
    projectId: "quizontal-de977",
    storageBucket: "quizontal-de977.firebasestorage.app",
    messagingSenderId: "448533191404",
    appId: "1:448533191404:web:f13787dc074def891fe3c9"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Your Google OAuth Client ID
const GOOGLE_CLIENT_ID = '1053520824725-at3vm404ps6i8v3ur946lh9ghuaiards.apps.googleusercontent.com';

// DOM Elements
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

// Check authentication status immediately
checkAuthStatus();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing authentication...');
    initializeGoogleSignIn();
    setupFormHandlers();
    setupEmailAuth();
});

// Toggle between sign-in and sign-up forms
registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Initialize Google Sign In
function initializeGoogleSignIn() {
    console.log('Initializing Google Sign-In...');
    
    // Check if Google library is loaded
    if (typeof google === 'undefined') {
        console.error('Google Sign-In library not loaded, retrying...');
        setTimeout(initializeGoogleSignIn, 1000);
        return;
    }
    
    try {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            ux_mode: 'popup'
        });
        
        console.log('Google Sign-In initialized');
        
        // Render buttons
        renderGoogleButtons();
        
    } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        createFallbackGoogleButtons();
    }
}

// Render Google buttons
function renderGoogleButtons() {
    const loginForm = document.querySelector('.sign-in form');
    const signupForm = document.querySelector('.sign-up form');
    
    // Create Google button containers
    const loginGoogleDiv = document.createElement('div');
    loginGoogleDiv.className = 'google-auth-container';
    loginGoogleDiv.innerHTML = `
        <div class="google-btn-wrapper">
            <div id="googleLoginBtn"></div>
        </div>
    `;
    
    const signupGoogleDiv = document.createElement('div');
    signupGoogleDiv.className = 'google-auth-container';
    signupGoogleDiv.innerHTML = `
        <div class="google-btn-wrapper">
            <div id="googleSignupBtn"></div>
        </div>
    `;
    
    // Insert Google buttons before social icons
    const loginSocialIcons = loginForm.querySelector('.social-icons');
    const signupSocialIcons = signupForm.querySelector('.social-icons');
    
    if (loginSocialIcons) {
        loginForm.insertBefore(loginGoogleDiv, loginSocialIcons);
    }
    
    if (signupSocialIcons) {
        signupForm.insertBefore(signupGoogleDiv, signupSocialIcons);
    }
    
    // Add dividers
    const loginDivider = document.createElement('div');
    loginDivider.className = 'divider';
    loginDivider.innerHTML = '<span>or</span>';
    loginForm.insertBefore(loginDivider, loginGoogleDiv);
    
    const signupDivider = document.createElement('div');
    signupDivider.className = 'divider';
    signupDivider.innerHTML = '<span>or</span>';
    signupForm.insertBefore(signupDivider, signupGoogleDiv);
    
    // Render the actual Google buttons
    setTimeout(() => {
        if (google.accounts.id) {
            try {
                google.accounts.id.renderButton(
                    document.getElementById('googleLoginBtn'),
                    { 
                        theme: "filled_blue", 
                        size: "large", 
                        text: "signin_with", 
                        width: 300,
                        type: "standard"
                    }
                );
                
                google.accounts.id.renderButton(
                    document.getElementById('googleSignupBtn'),
                    { 
                        theme: "filled_blue", 
                        size: "large", 
                        text: "signup_with", 
                        width: 300,
                        type: "standard"
                    }
                );
                
                console.log('Google buttons rendered successfully');
            } catch (error) {
                console.error('Error rendering Google buttons:', error);
                createFallbackGoogleButtons();
            }
        }
    }, 100);
}

// Fallback Google buttons
function createFallbackGoogleButtons() {
    console.log('Creating fallback Google buttons...');
    
    const loginGoogleBtn = document.getElementById('googleLoginBtn');
    const signupGoogleBtn = document.getElementById('googleSignupBtn');
    
    if (loginGoogleBtn) {
        loginGoogleBtn.innerHTML = `
            <button class="custom-google-btn" onclick="handleGoogleSignInFallback()">
                <i class="fab fa-google"></i>
                Sign in with Google
            </button>
        `;
    }
    
    if (signupGoogleBtn) {
        signupGoogleBtn.innerHTML = `
            <button class="custom-google-btn" onclick="handleGoogleSignInFallback()">
                <i class="fab fa-google"></i>
                Sign up with Google
            </button>
        `;
    }
}

// Fallback Google Sign-In handler
function handleGoogleSignInFallback() {
    alert('Google Sign-In is not available in this browser. Please try using a different browser or contact support.');
}

// Handle Google Sign In
async function handleGoogleSignIn(response) {
    console.log('Google Sign-In response received');
    
    try {
        showLoading(true);
        
        // Decode the JWT token to get user info
        const credential = response.credential;
        const payload = JSON.parse(atob(credential.split('.')[1]));
        
        const userData = {
            uid: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            email_verified: payload.email_verified,
            loginTime: new Date().toISOString(),
            provider: 'google'
        };
        
        console.log('User data:', userData);
        
        // Store user data
        const storeSuccess = await storeUserData(userData);
        
        if (storeSuccess) {
            showMessage('Login successful! Redirecting...', 'success');
            
            // Store session data
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loginTime', new Date().toISOString());
            
            setTimeout(() => {
                redirectToMainWebsite();
            }, 1500);
            
        } else {
            throw new Error('Failed to store user data');
        }
        
    } catch (error) {
        console.error('Google Sign-In error:', error);
        showMessage('Authentication failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Setup email/password authentication
function setupEmailAuth() {
    console.log('Setting up email authentication...');
}

// Setup form handlers for email/password auth
function setupFormHandlers() {
    const signInForm = document.querySelector('.sign-in form');
    const signUpForm = document.querySelector('.sign-up form');
    
    // Sign In form
    signInForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleEmailSignIn(signInForm);
    });
    
    // Sign Up form
    signUpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleEmailSignUp(signUpForm);
    });
}

// Handle email sign in
async function handleEmailSignIn(form) {
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // For demo purposes - in real implementation, use Firebase Auth
        const userData = {
            uid: 'email_' + Date.now(),
            name: email.split('@')[0],
            email: email,
            picture: 'https://github.com/danukaya123/wall/blob/main/favicon-32x32.png?raw=true',
            email_verified: false,
            loginTime: new Date().toISOString(),
            provider: 'email'
        };
        
        // Store user data
        const storeSuccess = await storeUserData(userData);
        
        if (storeSuccess) {
            showMessage('Login successful! Redirecting...', 'success');
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loginTime', new Date().toISOString());
            
            setTimeout(() => {
                redirectToMainWebsite();
            }, 1500);
        } else {
            throw new Error('Failed to store user data');
        }
        
    } catch (error) {
        console.error('Email sign in error:', error);
        showMessage('Login failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Handle email sign up
async function handleEmailSignUp(form) {
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    if (!name || !email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // For demo purposes - in real implementation, use Firebase Auth
        const userData = {
            uid: 'email_' + Date.now(),
            name: name,
            email: email,
            picture: 'https://github.com/danukaya123/wall/blob/main/favicon-32x32.png?raw=true',
            email_verified: false,
            loginTime: new Date().toISOString(),
            provider: 'email'
        };
        
        // Store user data
        const storeSuccess = await storeUserData(userData);
        
        if (storeSuccess) {
            showMessage('Account created successfully! Redirecting...', 'success');
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loginTime', new Date().toISOString());
            
            setTimeout(() => {
                redirectToMainWebsite();
            }, 1500);
        } else {
            throw new Error('Failed to store user data');
        }
        
    } catch (error) {
        console.error('Email sign up error:', error);
        showMessage('Registration failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Store user data
async function storeUserData(userData) {
    const firebaseSuccess = await storeUserInFirebase(userData);
    if (firebaseSuccess) return true;
    
    return storeUserInLocalStorage(userData);
}

// Store user data in Firebase Firestore
async function storeUserInFirebase(userData) {
    try {
        const userRef = db.collection('users').doc(userData.uid);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            await userRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                provider: userData.provider
            });
            console.log('User updated in Firebase');
        } else {
            await userRef.set({
                uid: userData.uid,
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                email_verified: userData.email_verified,
                provider: userData.provider,
                joined: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                plan: 'starter',
                status: 'active'
            });
            console.log('New user created in Firebase');
        }
        return true;
    } catch (error) {
        console.error('Firebase error:', error);
        return false;
    }
}

// Fallback to localStorage
function storeUserInLocalStorage(userData) {
    try {
        let users = JSON.parse(localStorage.getItem('quizontalUsers') || '{}');
        
        users[userData.uid] = {
            ...userData,
            joined: new Date().toISOString(),
            plan: 'starter',
            status: 'active'
        };
        
        localStorage.setItem('quizontalUsers', JSON.stringify(users));
        console.log('User stored in localStorage');
        return true;
    } catch (error) {
        console.error('LocalStorage error:', error);
        return false;
    }
}

// Utility functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showLoading(show) {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (show) {
            form.classList.add('loading');
        } else {
            form.classList.remove('loading');
        }
    });
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Add message to both forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.insertBefore(messageDiv.cloneNode(true), form.firstChild);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => {
            if (msg.textContent === message) {
                msg.remove();
            }
        });
    }, 5000);
}

// Check if user is already logged in
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('currentUser');
    const loginTime = localStorage.getItem('loginTime');
    
    if (isLoggedIn === 'true' && userData && loginTime) {
        const loginDate = new Date(loginTime);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - loginDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 30) {
            console.log('User already logged in, redirecting to main website...');
            redirectToMainWebsite();
        } else {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('loginTime');
            console.log('Session expired');
        }
    }
}

// Redirect to main website
function redirectToMainWebsite() {
    window.location.href = '../index.html';
}

// Make functions available globally
window.handleGoogleSignInFallback = handleGoogleSignInFallback;
window.logout = function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    window.location.href = 'index.html';
};
