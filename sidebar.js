// sidebar.js - Xử lý responsive sidebar và navigation
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    // Tạo mobile menu button nếu chưa có
    if (!mobileMenuBtn) {
        createMobileMenuButton();
    }
    
    // Mở/đóng sidebar trên mobile
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
    }
    
    // Đóng sidebar
    function closeSidebar() {
        sidebar.classList.remove('active');
        mobileOverlay.classList.remove('active');
    }
    
    // Xử lý click mobile menu button
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
    
    // Đóng sidebar khi click overlay
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeSidebar);
    }
    
    // Xử lý navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Ẩn tất cả sections
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Hiện section được chọn
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Cập nhật active class cho nav links
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
            
            // Đóng sidebar trên mobile
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Đóng sidebar khi resize window lớn hơn 768px
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
    
    // Tạo mobile menu button
    function createMobileMenuButton() {
        const btn = document.createElement('button');
        btn.className = 'mobile-menu-btn';
        btn.innerHTML = '☰';
        btn.style.cssText = `
            display: none;
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 1001;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 20px;
            padding: 10px 15px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            cursor: pointer;
        `;
        document.body.appendChild(btn);
        
        btn.addEventListener('click', toggleSidebar);
    }
});