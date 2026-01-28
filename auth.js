// Authentication functions
document.addEventListener('DOMContentLoaded', function() {
    console.log("Auth.js loaded, checking Firebase:", typeof firebase);
    
    // Check if we're on the login page
    if (document.getElementById('google-login')) {
        document.getElementById('google-login').addEventListener('click', googleLogin);
    }
});

function googleLogin() {
    console.log("Google login button clicked!");
    
    // Kiểm tra Firebase đã load chưa
    if (typeof firebase === 'undefined') {
        console.error("Firebase chưa được load!");
        alert('Lỗi: Firebase chưa khởi tạo. Vui lòng thử lại.');
        return;
    }
    
    if (typeof firebase.auth === 'undefined') {
        console.error("Firebase Auth chưa được load!");
        alert('Lỗi: Firebase Auth chưa khởi tạo. Vui lòng thử lại.');
        return;
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    
    // Thêm scopes nếu cần
    provider.addScope('email');
    provider.addScope('profile');
    
    console.log("Starting Google login...");
    
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            console.log("Login successful:", result.user);
            // Chuyển hướng sau khi login thành công
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error during Google login:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            let errorMessage = 'Đăng nhập thất bại: ';
            
            switch(error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage += 'Bạn đã đóng cửa sổ đăng nhập.';
                    break;
                case 'auth/popup-blocked':
                    errorMessage += 'Cửa sổ đăng nhập bị chặn. Vui lòng cho phép popup.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage += 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            alert(errorMessage);
        });
}

// Hàm kiểm tra trạng thái đăng nhập (dùng cho các page khác)
function checkAuthState() {
    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined') {
        console.error("Firebase Auth không khả dụng");
        return;
    }
    
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("User is logged in:", user.email);
            // User is signed in
        } else {
            console.log("User is logged out");
            // User is signed out
        }
    });
}