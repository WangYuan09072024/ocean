# OceanFlow - Trang Web Quản Lý Cá Nhân

OceanFlow là một ứng dụng web giúp bạn quản lý cuộc sống cá nhân với giao diện đẹp mắt và dễ sử dụng.

## Tính năng

- **Home**: Lịch ngày và 3 việc quan trọng nhất
- **Goals**: Quản lý mục tiêu lớn
- **Planner**: Lập kế hoạch tuần và tháng
- **Mood & Journal**: Theo dõi tâm trạng và ghi chú hàng ngày
- **Creative Corner**: Lưu trữ sáng tạo cá nhân
- **Study Tracker**: Theo dõi việc học tập
- **Bucket List**: Danh sách 100 điều muốn làm trước tuổi 32

## Cài đặt Firebase

Để sử dụng tính năng đăng nhập và lưu trữ dữ liệu, bạn cần:

1. Tạo một dự án trên [Firebase Console](https://console.firebase.google.com)
2. Bật Authentication với phương thức Google
3. Tạo Firestore Database
4. Thay thế cấu hình Firebase trong file `js/app.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};