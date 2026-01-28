// Khai báo global variables (dùng let để có thể gán lại sau)
let auth;
let db;
let storage;
let currentUser = null;

// Thêm vào phần khai báo global
let moodData = {};
let studyData = {};
let bucketListData = [];

// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
    console.error('Firebase is not loaded!');
    showCustomAlert('Lỗi: Firebase chưa được tải. Vui lòng tải lại trang.', 'error');
    throw new Error('Firebase is not loaded');
}

// Firebase configuration - GIỮ NGUYÊN CẤU HÌNH HIỆN TẠI
const firebaseConfig = {
    apiKey: "AIzaSyAmme36gXadVamFTCbMguhwRaSf1RD7N1I",
    authDomain: "oceanflow-app.firebaseapp.com",
    projectId: "oceanflow-app",
    storageBucket: "oceanflow-app.firebasestorage.app",
    messagingSenderId: "453860169723",
    appId: "1:453860169723:web:bccc443e6174818ab01d5e"
};

// Initialize Firebase với error handling - PHIÊN BẢN ĐÃ SỬA
try {
    console.log('🔄 Đang khởi tạo Firebase...');
    
    // Kiểm tra xem Firebase services có sẵn không
    console.log('Firebase services check:');
    console.log('- firebase.auth:', typeof firebase.auth);
    console.log('- firebase.firestore:', typeof firebase.firestore); 
    console.log('- firebase.storage:', typeof firebase.storage);
    
    // Khởi tạo app
    let app;
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase app initialized successfully");
    } else {
        app = firebase.app();
        console.log("✅ Firebase app already exists");
    }
    
    // Khởi tạo services với try-catch riêng cho từng service
    try {
        auth = firebase.auth();
        console.log("✅ Firebase Auth initialized");
    } catch (authError) {
        console.error("❌ Firebase Auth initialization failed:", authError);
    }
    
    try {
        db = firebase.firestore();
        console.log("✅ Firebase Firestore initialized");
        
        // Cấu hình Firestore
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
            experimentalForceLongPolling: true
        });
        
        // Bật persistence với error handling
        db.enablePersistence()
            .then(() => console.log('✅ Firestore persistence enabled'))
            .catch((err) => {
                console.log('⚠️ Firestore persistence error:', err.code);
            });
            
    } catch (firestoreError) {
        console.error("❌ Firebase Firestore initialization failed:", firestoreError);
    }
    
    try {
        // THỬ khởi tạo storage, nhưng không bắt lỗi nếu không có
        if (typeof firebase.storage === 'function') {
            storage = firebase.storage();
            console.log("✅ Firebase Storage initialized");
        } else {
            console.warn('⚠️ Firebase Storage not available - skipping initialization');
            storage = null;
        }
    } catch (storageError) {
        console.warn('⚠️ Firebase Storage initialization failed, but continuing without it:', storageError);
        storage = null;
    }
        
} catch (error) {
    console.error("❌ Firebase app initialization error:", error);
    
    // Hiển thị lỗi thân thiện
    if (error.code === 'app/duplicate-app') {
        console.log('ℹ️ Firebase app already initialized elsewhere');
        // Vẫn tiếp tục vì app đã được khởi tạo
    } else {
        showCustomAlert('Lỗi khởi tạo Firebase: ' + error.message, 'error');
    }
}

// Utility functions - GIỮ NGUYÊN
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getToday() {
    return formatDate(new Date());
}

function formatDateDisplay(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return dateString;
    }
}

// Custom Alert System thay thế alert()
function showCustomAlert(message, type = 'info') {
    const alertContainer = document.getElementById('customAlertContainer') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-bell"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
            break;
    }

    alert.innerHTML = `
        <div class="custom-alert-content">
            ${icon}
            <span>${message}</span>
            <button class="custom-alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    alertContainer.appendChild(alert);
    
    // Tự động xóa sau 5 giây
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'customAlertContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
}

// Custom Confirm System thay thế confirm()
function showCustomConfirm(message, onConfirm, onCancel = null) {
    const confirmContainer = document.getElementById('customConfirmContainer') || createConfirmContainer();
    
    const confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'custom-confirm-overlay';
    
    const confirmBox = document.createElement('div');
    confirmBox.className = 'custom-confirm-box';
    
    confirmBox.innerHTML = `
        <div class="custom-confirm-content">
            <i class="fas fa-question-circle"></i>
            <p>${message}</p>
            <div class="custom-confirm-buttons">
                <button class="custom-confirm-btn confirm-no">Hủy</button>
                <button class="custom-confirm-btn confirm-yes">Xác nhận</button>
            </div>
        </div>
    `;
    
    confirmOverlay.appendChild(confirmBox);
    confirmContainer.appendChild(confirmOverlay);
    
    // Xử lý sự kiện
    const yesBtn = confirmBox.querySelector('.confirm-yes');
    const noBtn = confirmBox.querySelector('.confirm-no');
    
    yesBtn.onclick = () => {
        confirmOverlay.remove();
        if (onConfirm) onConfirm();
    };
    
    noBtn.onclick = () => {
        confirmOverlay.remove();
        if (onCancel) onCancel();
    };
    
    // Đóng khi click ra ngoài
    confirmOverlay.onclick = (e) => {
        if (e.target === confirmOverlay) {
            confirmOverlay.remove();
            if (onCancel) onCancel();
        }
    };
}

function createConfirmContainer() {
    const container = document.createElement('div');
    container.id = 'customConfirmContainer';
    document.body.appendChild(container);
    return container;
}

// DOM Content Loaded - PHIÊN BẢN ỔN ĐỊNH
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Starting initialization');
    
    // Navigation - GIỮ NGUYÊN
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    // Khởi tạo module khi chuyển section
                    const moduleName = targetId.charAt(0).toUpperCase() + targetId.slice(1);
                    const initFunc = window[`init${moduleName}`];
                    if (typeof initFunc === 'function') {
                        try {
                            initFunc();
                        } catch (error) {
                            console.error(`❌ Error initializing ${moduleName} on switch:`, error);
                        }
                    }
                }
            });
        });
    });
    
    // Check authentication state với error handling
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(user => {
            console.log('🔐 Auth state changed:', user ? 'User logged in' : 'No user');
            if (user) {
                currentUser = user;
                console.log('👤 User logged in:', user.uid);
                
                // Update UI
                const userNameElement = document.getElementById('user-name');
                const userAvatarElement = document.getElementById('user-avatar');
                
                if (userNameElement) {
                    userNameElement.textContent = user.displayName || 'Người dùng';
                }
                if (userAvatarElement) {
                    userAvatarElement.src = user.photoURL || 'https://via.placeholder.com/40';
                }
                
                // Initialize all modules ONLY after login
                setTimeout(() => {
                    initAllModules();
                    loadUserData();
                }, 100);
                
            } else {
                console.log('👤 No user logged in');
                // Redirect to login page chỉ khi không phải đang ở trang login
                if (!window.location.href.includes('login.html')) {
                    window.location.href = 'login.html';
                } else {
                    // Vẫn khởi tạo module nếu đang ở trang login để đảm bảo UI hoạt động
                    initAllModules();
                }
            }
        }, error => {
            console.error('Auth state change error:', error);
            // Vẫn cho phép sử dụng app offline
            setTimeout(() => {
                initAllModules();
            }, 100);
        });
    } else {
        console.error('❌ Firebase Auth not initialized. Cannot check auth state.');
        // Vẫn cố gắng khởi tạo module nếu không có Firebase để app không bị treo
        initAllModules();
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showCustomConfirm('Bạn có chắc chắn muốn đăng xuất?', () => {
                if (typeof auth !== 'undefined') {
                    auth.signOut().then(() => {
                        window.location.href = 'login.html';
                    }).catch(error => {
                        console.error('Logout error:', error);
                        showCustomAlert('Lỗi khi đăng xuất: ' + error.message, 'error');
                    });
                } else {
                    showCustomAlert('Lỗi: Firebase Auth chưa được khởi tạo.', 'error');
                }
            });
        });
    }
});

function initAllModules() {
    console.log('🔄 Initializing all modules...');
    
    // Kiểm tra xem section có tồn tại không trước khi khởi tạo
    const modules = [
        { id: 'home', init: 'initHome' },
        { id: 'goals', init: 'initGoals' },
        { id: 'planner', init: 'initPlanner' },
        { id: 'mood', init: 'initMood' },
        { id: 'creative', init: 'initCreative' },
        { id: 'study', init: 'initStudy' },
        { id: 'bucketlist', init: 'initBucketList' }
    ];
    
    modules.forEach(module => {
        const section = document.getElementById(module.id);
        if (section) { // Chỉ cần check tồn tại để load data
            if (typeof window[module.init] === 'function') {
                try {
                    window[module.init]();
                    console.log(`✅ ${module.init} initialized`);
                } catch (error) {
                    console.error(`❌ Error initializing ${module.init}:`, error);
                }
            } else {
                console.log(`⚠️ ${module.init} function not found for ${module.id}`);
            }
        }
    });
}

// Load user data from Firestore với error handling mạnh mẽ - GIỮ NGUYÊN
function loadUserData() {
    if (!currentUser || typeof db === 'undefined') {
        console.log('🚫 User not logged in or DB not initialized, cannot load data');
        initializeNewUser(true); // Khởi tạo data local
        return;
    }
    
    const userRef = db.collection('users').doc(currentUser.uid);
    
    userRef.get().then(doc => {
        if (doc.exists) {
            const userData = doc.data();
            console.log('📥 Loaded user data from Firebase:', userData);
            
            // Load data for each section với error handling
            const loadModules = [
                { id: 'home', load: 'loadHomeData' },
                { id: 'goals', load: 'loadGoalsData' },
                { id: 'planner', load: 'loadPlannerData' },
                { id: 'mood', load: 'loadMoodData' },
                { id: 'creative', load: 'loadCreativeData' },
                { id: 'study', load: 'loadStudyData' },
                { id: 'bucketlist', load: 'loadBucketListData' }
            ];
            
            loadModules.forEach(module => {
                const section = document.getElementById(module.id);
                if (section && typeof window[module.load] === 'function') {
                    try {
                        window[module.load](userData);
                    } catch (error) {
                        console.error(`❌ Error loading ${module.load}:`, error);
                    }
                }
            });
            
        } else {
            console.log('👤 New user, initializing empty data');
            initializeNewUser();
        }
    }).catch(error => {
        console.error('❌ Error loading user data:', error);
        console.log('🔄 Initializing with local data due to error');
        initializeNewUser(true);
    });
}

function initializeNewUser(localOnly = false) {
    console.log('🆕 Initializing new user data...');
    
    const initialData = {
        tasks: {},
        goals: [],
        events: [],
        mood: {
            entries: [],
            journal: []
        },
        creative: [],
        study: {
            subjects: [],
            resources: [],
            studyHistory: [],
            importantNotes: '',
            stickyNotes: []
        },
        bucketlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (!localOnly && currentUser && typeof db !== 'undefined') {
        saveUserData(initialData);
    }
    
    // Vẫn load data local để app có thể hoạt động offline
    const loadModules = [
        { id: 'bucketlist', load: 'loadBucketListData' }
    ];
    
    loadModules.forEach(module => {
        const section = document.getElementById(module.id);
        if (section && typeof window[module.load] === 'function') {
            try {
                window[module.load](initialData);
            } catch (error) {
                console.error(`❌ Error loading ${module.load} for new user:`, error);
            }
        }
    });
}

// Save user data to Firestore với retry logic - GIỮ NGUYÊN
function saveUserData(data) {
    if (!currentUser || typeof db === 'undefined') {
        console.log('🚫 User not logged in or DB not initialized, cannot save data');
        return;
    }
    
    const userRef = db.collection('users').doc(currentUser.uid);
    
    const dataToSave = {
        ...data,
        updatedAt: new Date().toISOString()
    };
    
    const savePromise = userRef.set(dataToSave, { merge: true });
    
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Save timeout')), 10000);
    });
    
    Promise.race([savePromise, timeoutPromise])
        .then(() => console.log('✅ Data saved successfully to Firebase'))
        .catch(error => {
            console.error('❌ Error saving data to Firebase:', error);
            showCustomAlert('Lỗi khi lưu dữ liệu lên đám mây.', 'error');
        });
}

// Global function to save specific module data - GIỮ NGUYÊN
function saveModuleData(moduleName, moduleData) {
    if (!currentUser || typeof db === 'undefined') {
        console.log(`🚫 User not logged in or DB not initialized, cannot save ${moduleName} data`);
        
        // Fallback: lưu vào localStorage
        try {
            localStorage.setItem(`${moduleName}_backup`, JSON.stringify(moduleData));
            console.log(`📦 ${moduleName} data saved to localStorage as backup`);
            showCustomAlert('Không thể kết nối với Cloud. Dữ liệu được lưu trữ cục bộ.', 'warning');
        } catch (e) {
            console.error('❌ Cannot save to localStorage:', e);
        }
        return;
    }
    
    const userRef = db.collection('users').doc(currentUser.uid);
    
    const updateData = {
        [moduleName]: moduleData,
        updatedAt: new Date().toISOString()
    };
    
    userRef.set(updateData, { merge: true })
        .then(() => console.log(`✅ ${moduleName} data saved to Firebase`))
        .catch(error => {
            console.error(`❌ Error saving ${moduleName} data:`, error);
            showCustomAlert(`Lỗi khi lưu ${moduleName}: ${error.message}`, 'error');
            // Fallback: lưu vào localStorage
            try {
                localStorage.setItem(`${moduleName}_backup`, JSON.stringify(moduleData));
                console.log(`📦 ${moduleName} data saved to localStorage as backup`);
            } catch (e) {
                console.error('❌ Cannot save to localStorage:', e);
            }
        });
}

// Hàm utility để load backup data từ localStorage - GIỮ NGUYÊN
function loadModuleBackup(moduleName) {
    try {
        const backup = localStorage.getItem(`${moduleName}_backup`);
        if (backup) {
            console.log(`📦 Loaded ${moduleName} data from localStorage backup`);
            return JSON.parse(backup);
        }
    } catch (e) {
        console.error(`❌ Error loading ${moduleName} backup:`, e);
    }
    return null;
}

// Utility function for HTML escaping - GIỮ NGUYÊN
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Generate unique ID - GIỮ NGUYÊN
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Close all modals utility function - GIỮ NGUYÊN
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Thêm hàm kiểm tra storage an toàn
function isStorageAvailable() {
    return storage !== null && typeof storage !== 'undefined' && typeof storage.ref === 'function';
}

// Hàm upload file an toàn
function uploadFile(file, path) {
    if (!isStorageAvailable()) {
        console.error('❌ Storage không khả dụng');
        return Promise.reject(new Error('Storage không khả dụng'));
    }
    
    return storage.ref(path).put(file);
}

// Bucket List Data Management - GIỮ NGUYÊN
function saveBucketListData() {
    saveModuleData('bucketlist', window.bucketListData);
}

function loadBucketListData(userData = null) {
    try {
        let loadedData = [];
        if (userData && Array.isArray(userData.bucketlist)) {
            loadedData = userData.bucketlist;
        } else {
            const backup = loadModuleBackup('bucketlist');
            loadedData = (backup && Array.isArray(backup)) ? backup : [];
        }
        
        window.bucketListData = loadedData;
        
        console.log('📥 Loaded bucket list data:', window.bucketListData);
        
        // Render bucket list nếu section đang active
        if (document.getElementById('bucketlist')?.classList.contains('active')) {
            if (typeof window.renderBucketList === 'function') {
                window.renderBucketList();
            }
            if (typeof window.updateProgressCounts === 'function') {
                window.updateProgressCounts();
            }
        }
        
    } catch (error) {
        console.error('❌ Error loading bucket list data:', error);
        window.bucketListData = [];
    }
}

function initBucketList() {
    console.log('🎯 Initializing Bucket List...');
    loadBucketListData();
    
    // Gọi hàm từ bucketlist.js nếu tồn tại
    if (typeof window.setupBucketListEventListeners === 'function') {
        window.setupBucketListEventListeners();
    }
    if (typeof window.loadDailyMotivation === 'function') {
        window.loadDailyMotivation();
    }
    if (typeof window.updateProgressCounts === 'function') {
        window.updateProgressCounts();
    }
}

// Make functions globally available - CẬP NHẬT
window.auth = auth;
window.db = db;
window.storage = storage;
window.currentUser = currentUser;
window.isStorageAvailable = isStorageAvailable;
window.uploadFile = uploadFile;
window.saveModuleData = saveModuleData;
window.formatDateDisplay = formatDateDisplay;
window.getToday = getToday;
window.showCustomAlert = showCustomAlert;
window.showCustomConfirm = showCustomConfirm;
window.escapeHtml = escapeHtml;
window.generateId = generateId;
window.closeAllModals = closeAllModals;
window.initAllModules = initAllModules;

// Bucket List globals - GIỮ NGUYÊN
window.bucketListData = bucketListData;
window.initBucketList = initBucketList;
window.loadBucketListData = loadBucketListData;
window.saveBucketListData = saveBucketListData;

console.log('🎉 app.js loaded successfully - Fixed storage version');