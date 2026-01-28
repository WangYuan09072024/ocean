// Planner Module - PHIÊN BẢN HOÀN CHỈNH (ĐÃ SỬA STATS VÀ THANH THỜI GIAN)
let plannerData = {
    events: [],
    currentDate: new Date(),
    calendarDate: new Date(),
    isCalendarOpen: false
};

let currentEditingEvent = null;
let currentTimeLineInterval = null;

// Hệ thống màu phong phú cho events
const eventColors = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '#5a6fd8', text: '#fff' },
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: '#e882f0', text: '#fff' },
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: '#3a9bf4', text: '#fff' },
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', border: '#34d46c', text: '#333' },
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', border: '#f86492', text: '#333' },
    { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', border: '#2bb8b9', text: '#fff' },
    { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', border: '#97dcd9', text: '#333' },
    { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', border: '#ff8a8e', text: '#333' },
    { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', border: '#ffdfb8', text: '#333' },
    { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', border: '#97dcd9', text: '#333' },
    { bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', border: '#c4e86a', text: '#333' },
    { bg: 'linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)', border: '#7db4f2', text: '#333' }
];

// Danh mục với icon
const categories = [
    { id: 'work', name: '💼 Công việc', color: '#4CAF50' },
    { id: 'study', name: '📚 Học tập', color: '#2196F3' },
    { id: 'personal', name: '👤 Cá nhân', color: '#FF9800' },
    { id: 'health', name: '💪 Sức khỏe', color: '#E91E63' },
    { id: 'social', name: '👥 Xã hội', color: '#9C27B0' },
    { id: 'family', name: '👨‍👩‍👧‍👦 Gia đình', color: '#3F51B5' },
    { id: 'hobby', name: '🎨 Sở thích', color: '#00BCD4' },
    { id: 'shopping', name: '🛍️ Mua sắm', color: '#FF5722' },
    { id: 'meal', name: '🍽️ Ăn uống', color: '#795548' },
    { id: 'sleep', name: '😴 Ngủ', color: '#673AB7' },
    { id: 'exercise', name: '🏃‍♂️ Tập thể dục', color: '#009688' },
    { id: 'other', name: '✨ Khác', color: '#607D8B' }
];

// Ưu tiên
const priorities = [
    { id: 'high', name: '⚠️ Cao', color: '#F44336' },
    { id: 'medium', name: '📌 Trung bình', color: '#FF9800' },
    { id: 'low', name: '📝 Thấp', color: '#4CAF50' }
];

// Notification system - FIX LỖI LẶP
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    
    // XÓA tất cả notification cũ trước khi tạo mới
    const existingNotifications = container.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: relative;
        background: ${type === 'success' ? '#4CAF50' : 
                    type === 'error' ? '#F44336' : 
                    type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease, fadeOut 0.5s ease ${duration}ms forwards;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
        font-weight: 500;
    `;
    
    let icon = '';
    switch(type) {
        case 'success': icon = '✅'; break;
        case 'error': icon = '❌'; break;
        case 'warning': icon = '⚠️'; break;
        default: icon = 'ℹ️'; break;
    }
    
    notification.innerHTML = `
        <span style="font-size: 1.2em;">${icon}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Tự động xóa sau duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration + 500);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(container);
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
    
    return container;
}

function initPlanner() {
    console.log("📅 Enhanced Planner initialized");
    setupPlannerListeners();
    populateCategoryDropdowns();
    updateDayDisplay();
    generateTimeline();
    updatePlannerQuickStats(); // Cập nhật thống kê ngay khi khởi tạo
    updateStatistics();
    renderEventsList();
    updateCalendarEvents();
    
    // Auto-scroll đến thời gian hiện tại
    setTimeout(() => {
        scrollToCurrentTime();
    }, 300);
    
    // Bắt đầu cập nhật thanh thời gian thực
    startCurrentTimeLine();
    
    // Hiển thị thông báo chào mừng
}

function setupPlannerListeners() {
    // Day navigation
    document.getElementById('prev-day')?.addEventListener('click', goToPreviousDay);
    document.getElementById('next-day')?.addEventListener('click', goToNextDay);
    
    // Calendar toggle
    document.getElementById('toggle-calendar')?.addEventListener('click', toggleCalendar);
    document.getElementById('prev-month')?.addEventListener('click', () => {
        plannerData.calendarDate.setMonth(plannerData.calendarDate.getMonth() - 1);
        renderMiniCalendar();
    });
    document.getElementById('next-month')?.addEventListener('click', () => {
        plannerData.calendarDate.setMonth(plannerData.calendarDate.getMonth() + 1);
        renderMiniCalendar();
    });
    
    // Quick add - form chính
    document.getElementById('quick-add-btn')?.addEventListener('click', addQuickEvent);
    document.getElementById('quick-title')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addQuickEvent();
    });
    
    // Modal events
    document.getElementById('event-save-btn')?.addEventListener('click', saveEventFromModal);
    document.getElementById('event-cancel-btn')?.addEventListener('click', closeEventModal);
    document.querySelector('.close-modal-btn')?.addEventListener('click', closeEventModal);
    
    // Close modal khi click ra ngoài
    document.getElementById('event-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'event-modal') closeEventModal();
    });
}

function populateCategoryDropdowns() {
    const quickCategory = document.getElementById('quick-category');
    const modalCategory = document.getElementById('event-category');
    
    if (quickCategory) {
        quickCategory.innerHTML = categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    }
    
    if (modalCategory) {
        modalCategory.innerHTML = categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    }
}

function goToPreviousDay() {
    plannerData.currentDate.setDate(plannerData.currentDate.getDate() - 1);
    updatePlannerView();
}

function goToNextDay() {
    plannerData.currentDate.setDate(plannerData.currentDate.getDate() + 1);
    updatePlannerView();
}

function goToToday() {
    plannerData.currentDate = new Date();
    updatePlannerView();
    showNotification('Đã quay về hôm nay! 📅', 'success', 1500);
}

function updatePlannerView() {
    updateDayDisplay();
    generateTimeline();
    updatePlannerQuickStats(); // Cập nhật thống kê mỗi lần view thay đổi
    updateStatistics();
    renderEventsList();
    updateCalendarEvents();
}

function toggleCalendar() {
    const calendarView = document.getElementById('calendar-view');
    if (!calendarView) return;
    
    plannerData.isCalendarOpen = !plannerData.isCalendarOpen;
    
    if (plannerData.isCalendarOpen) {
        plannerData.calendarDate = new Date(plannerData.currentDate);
        renderMiniCalendar();
        calendarView.style.display = 'block';
        calendarView.style.animation = 'slideDown 0.3s ease';
        showNotification('Đã mở lịch', 'info', 1000);
    } else {
        calendarView.style.display = 'none';
    }
}

function renderMiniCalendar() {
    const monthYear = document.getElementById('calendar-month-year');
    const grid = document.getElementById('calendar-grid');
    
    if (!monthYear || !grid) return;
    
    const year = plannerData.calendarDate.getFullYear();
    const month = plannerData.calendarDate.getMonth();
    
    monthYear.textContent = plannerData.calendarDate.toLocaleDateString('vi-VN', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    grid.innerHTML = '';
    
    // Day headers
    const dayHeaders = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Get first day and days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    const today = formatDate(new Date());
    const selectedDate = formatDate(plannerData.currentDate);
    
    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day-cell other-month';
        grid.appendChild(emptyDay);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(new Date(year, month, day));
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day-cell';
        dayEl.textContent = day;
        
        if (dateStr === today) dayEl.classList.add('today');
        if (dateStr === selectedDate) dayEl.classList.add('selected');
        
        // Check for events
        const dayEvents = plannerData.events.filter(e => e.date === dateStr);
        if (dayEvents.length > 0) {
            dayEl.classList.add('has-events');
            dayEl.title = `${dayEvents.length} sự kiện`;
            
            // Add event count badge
            const countBadge = document.createElement('div');
            countBadge.className = 'event-count';
            countBadge.textContent = dayEvents.length;
            dayEl.appendChild(countBadge);
        }
        
        dayEl.addEventListener('click', () => {
            plannerData.currentDate = new Date(year, month, day);
            toggleCalendar();
            updatePlannerView();
            showNotification(`Đã chọn ngày ${day}/${month + 1}`, 'info', 1500);
        });
        
        grid.appendChild(dayEl);
    }
}

function updateDayDisplay() {
    const dayName = document.getElementById('day-display');
    const dayDate = document.getElementById('date-display');
    
    if (!dayName || !dayDate) return;
    
    const today = formatDate(new Date());
    const currentDateStr = formatDate(plannerData.currentDate);
    
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    
    if (currentDateStr === today) {
        dayName.textContent = 'Hôm nay';
    } else {
        dayName.textContent = dayNames[plannerData.currentDate.getDay()];
    }
    
    dayDate.textContent = plannerData.currentDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function generateTimeline() {
    const hoursContainer = document.getElementById('timeline-hours');
    const eventsContainer = document.getElementById('timeline-events');
    
    if (!hoursContainer || !eventsContainer) return;
    
    hoursContainer.innerHTML = '';
    eventsContainer.innerHTML = '';
    
    // Tạo container cho timeline grid lines
    const timelineGrid = document.createElement('div');
    timelineGrid.id = 'timeline-grid';
    timelineGrid.style.position = 'absolute';
    timelineGrid.style.top = '0';
    timelineGrid.style.left = '0';
    timelineGrid.style.right = '0';
    timelineGrid.style.bottom = '0';
    timelineGrid.style.pointerEvents = 'none';
    eventsContainer.appendChild(timelineGrid);
    
    // Generate hours 0:00 - 24:00 (25 hours, vì có 24:00)
    for (let hour = 0; hour <= 24; hour++) {
        // Hour label
        const hourLabel = document.createElement('div');
        hourLabel.className = 'hour-label';
        hourLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
        hourLabel.style.setProperty('--hour-index', hour);
        hourLabel.style.top = `${hour * 60}px`;
        hoursContainer.appendChild(hourLabel);
        
        // Hour line
        const hourLine = document.createElement('div');
        hourLine.className = 'hour-line';
        hourLine.style.setProperty('--hour-index', hour);
        hourLine.style.top = `${hour * 60}px`;
        eventsContainer.appendChild(hourLine);
        
        // Half hour line - chỉ đến 23:30
        if (hour < 24) {
            const halfHourLine = document.createElement('div');
            halfHourLine.className = 'hour-line half';
            halfHourLine.style.top = `${hour * 60 + 30}px`;
            eventsContainer.appendChild(halfHourLine);
        }
    }
    
    // Load events for current date
    loadEventsForDay(formatDate(plannerData.currentDate));
    
    // Thêm thanh thời gian thực (chỉ hiển thị nếu là hôm nay)
    addCurrentTimeLine();
}

function loadEventsForDay(dateStr) {
    const eventsContainer = document.getElementById('timeline-events');
    if (!eventsContainer) return;
    
    const dayEvents = plannerData.events.filter(e => e.date === dateStr);
    
    if (dayEvents.length === 0) return;
    
    // Sắp xếp theo thời gian bắt đầu
    dayEvents.sort((a, b) => {
        const [aHour, aMin] = a.startTime.split(':').map(Number);
        const [bHour, bMin] = b.startTime.split(':').map(Number);
        return (aHour * 60 + aMin) - (bHour * 60 + bMin);
    });
    
    // Render từng event
    dayEvents.forEach(event => {
        createEventBlock(event);
    });
}

function createEventBlock(event) {
    const eventsContainer = document.getElementById('timeline-events');
    if (!eventsContainer) return;
    
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);
    
    // Calculate position (60px per hour, bắt đầu từ 0:00)
    const startMinutes = startHour * 60 + startMin;
    const durationMinutes = (endHour * 60 + endMin) - startMinutes;
    
    if (durationMinutes <= 0) return;
    
    // Vị trí cố định
    const topPos = startMinutes;
    const height = Math.max(durationMinutes, 40); // Minimum 40px
    
    const eventBlock = document.createElement('div');
    eventBlock.className = `event-block ${event.completed ? 'completed' : ''}`;
    eventBlock.dataset.eventId = event.id;
    
    // Áp dụng màu - Mỗi event có màu riêng
    const color = event.color || eventColors[Math.floor(Math.random() * eventColors.length)];
    eventBlock.style.background = color.bg;
    eventBlock.style.borderLeftColor = color.border;
    eventBlock.style.color = color.text;
    eventBlock.style.top = `${topPos}px`;
    eventBlock.style.height = `${height}px`;
    eventBlock.style.position = 'absolute';
    eventBlock.style.zIndex = '2';
    eventBlock.style.left = '10px';
    eventBlock.style.right = '10px';
    
    // Tìm category info
    const category = categories.find(c => c.id === event.category) || categories[categories.length - 1];
    const priority = priorities.find(p => p.id === event.priority) || priorities[1];
    
    // Tính duration text
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    let durationText = '';
    if (hours > 0) durationText += `${hours}h`;
    if (mins > 0) durationText += `${mins}m`;
    
    // Event content
    eventBlock.innerHTML = `
        <div class="event-block-header">
            <div class="event-block-time">${event.startTime} - ${event.endTime}</div>
            <div class="event-block-priority" style="background: ${priority.color};">
                ${priority.name}
            </div>
        </div>
        <div class="event-block-title">
            ${category.name.split(' ')[0]} ${escapeHtml(event.title)}
        </div>
        ${event.notes ? `<div class="event-block-notes">${escapeHtml(event.notes.substring(0, 30))}${event.notes.length > 30 ? '...' : ''}</div>` : ''}
        ${durationText ? `<div class="event-block-duration">⏱️ ${durationText}</div>` : ''}
        <div class="event-block-actions">
            <button class="event-action-btn complete-btn" title="${event.completed ? 'Bỏ hoàn thành' : 'Hoàn thành'}">
                <i class="fas fa-${event.completed ? 'undo' : 'check'}"></i>
            </button>
            <button class="event-action-btn edit-btn" title="Chỉnh sửa">
                <i class="fas fa-edit"></i>
            </button>
            <button class="event-action-btn delete-btn" title="Xóa">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Thêm event listeners cho các nút
    const completeBtn = eventBlock.querySelector('.complete-btn');
    const editBtn = eventBlock.querySelector('.edit-btn');
    const deleteBtn = eventBlock.querySelector('.delete-btn');
    
    completeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleEventComplete(event.id);
    });
    
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEventModal('edit', event);
    });
    
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteEvent(event.id);
    });
    
    eventBlock.addEventListener('click', (e) => {
        if (!e.target.closest('.event-action-btn')) {
            openEventModal('edit', event);
        }
    });
    
    eventsContainer.appendChild(eventBlock);
}

function addQuickEvent() {
    const titleInput = document.getElementById('quick-title');
    const categorySelect = document.getElementById('quick-category');
    const startInput = document.getElementById('quick-start');
    const endInput = document.getElementById('quick-end');
    
    if (!titleInput || !categorySelect || !startInput || !endInput) return;
    
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const startTime = startInput.value;
    const endTime = endInput.value;
    
    if (!title) {
        showNotification('Vui lòng nhập tiêu đề sự kiện', 'warning', 2000);
        titleInput.focus();
        return;
    }
    
    if (!startTime || !endTime) {
        showNotification('Vui lòng chọn thời gian', 'warning', 2000);
        return;
    }
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    if (startH * 60 + startM >= endH * 60 + endM) {
        showNotification('Thời gian kết thúc phải sau thời gian bắt đầu', 'error', 2000);
        return;
    }
    
    const event = {
        id: generateId(),
        title: title,
        date: formatDate(plannerData.currentDate),
        startTime: startTime,
        endTime: endTime,
        category: category,
        priority: 'medium',
        notes: '',
        completed: false,
        color: eventColors[Math.floor(Math.random() * eventColors.length)],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    plannerData.events.push(event);
    savePlannerData();
    updatePlannerView();
    
    // Reset form
    titleInput.value = '';
    startInput.value = '09:00';
    endInput.value = '10:00';
    
    showNotification('✅ Đã thêm sự kiện thành công!', 'success', 2000);
}

function openEventModal(mode = 'add', event = null) {
    const modal = document.getElementById('event-modal');
    const title = document.getElementById('event-modal-title');
    
    if (!modal || !title) return;
    
    if (mode === 'add') {
        title.textContent = 'Thêm sự kiện mới';
        currentEditingEvent = null;
        
        // Reset form
        document.getElementById('event-title').value = '';
        document.getElementById('event-date').value = formatDate(plannerData.currentDate);
        document.getElementById('event-start').value = '09:00';
        document.getElementById('event-end').value = '10:00';
        document.getElementById('event-category').value = 'work';
        document.getElementById('event-notes').value = '';
        document.getElementById('event-completed').checked = false;
        
    } else if (mode === 'edit' && event) {
        title.textContent = 'Chỉnh sửa sự kiện';
        currentEditingEvent = event;
        
        // Fill form
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-start').value = event.startTime;
        document.getElementById('event-end').value = event.endTime;
        document.getElementById('event-category').value = event.category || 'work';
        document.getElementById('event-notes').value = event.notes || '';
        document.getElementById('event-completed').checked = event.completed || false;
    }
    
    modal.classList.add('active');
}

function closeEventModal() {
    const modal = document.getElementById('event-modal');
    if (modal) modal.classList.remove('active');
    currentEditingEvent = null;
}

function saveEventFromModal() {
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const startTime = document.getElementById('event-start').value;
    const endTime = document.getElementById('event-end').value;
    const category = document.getElementById('event-category').value;
    const notes = document.getElementById('event-notes').value.trim();
    const completed = document.getElementById('event-completed').checked;
    
    if (!title) {
        showNotification('Vui lòng nhập tiêu đề', 'warning', 2000);
        return;
    }
    
    if (!startTime || !endTime) {
        showNotification('Vui lòng chọn thời gian', 'warning', 2000);
        return;
    }
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    if (startH * 60 + startM >= endH * 60 + endM) {
        showNotification('Thời gian kết thúc phải sau thời gian bắt đầu', 'error', 2000);
        return;
    }
    
    if (currentEditingEvent) {
        // Update existing event
        const eventIndex = plannerData.events.findIndex(e => e.id === currentEditingEvent.id);
        if (eventIndex !== -1) {
            plannerData.events[eventIndex] = {
                ...plannerData.events[eventIndex],
                title,
                date,
                startTime,
                endTime,
                category,
                notes,
                completed,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Add new event
        const event = {
            id: generateId(),
            title,
            date,
            startTime,
            endTime,
            category,
            priority: 'medium',
            notes,
            completed,
            color: eventColors[Math.floor(Math.random() * eventColors.length)],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        plannerData.events.push(event);
    }
    
    savePlannerData();
    updatePlannerView();
    closeEventModal();
    
    showNotification(currentEditingEvent ? '✅ Đã cập nhật sự kiện!' : '✅ Đã thêm sự kiện mới!', 'success', 2000);
}

function toggleEventComplete(eventId) {
    const eventIndex = plannerData.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    
    const wasCompleted = plannerData.events[eventIndex].completed;
    plannerData.events[eventIndex].completed = !wasCompleted;
    plannerData.events[eventIndex].updatedAt = new Date().toISOString();
    
    savePlannerData();
    updatePlannerView();
    
    showNotification(
        wasCompleted ? '🔄 Đã bỏ hoàn thành!' : '✅ Đã đánh dấu hoàn thành!',
        'success',
        1500
    );
}

function deleteEvent(eventId) {
    const eventIndex = plannerData.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    
    const eventTitle = plannerData.events[eventIndex].title;
    
    plannerData.events.splice(eventIndex, 1);
    
    savePlannerData();
    updatePlannerView();
    
    showNotification(`🗑️ Đã xóa sự kiện "${eventTitle}"`, 'info', 1500);
}

function updatePlannerQuickStats() {
    console.log('🔄 updatePlannerQuickStats() được gọi');
    
    const dateStr = formatDate(plannerData.currentDate);
    const dayEvents = plannerData.events.filter(e => e.date === dateStr);
    const completedEvents = dayEvents.filter(e => e.completed).length;
    
    console.log('📊 Events hôm nay:', dayEvents.length);
    console.log('✅ Completed:', completedEvents);
    
    // Tính tổng thời gian
    let totalMinutes = 0;
    dayEvents.forEach(event => {
        const [startH, startM] = event.startTime.split(':').map(Number);
        const [endH, endM] = event.endTime.split(':').map(Number);
        const duration = (endH * 60 + endM) - (startH * 60 + startM);
        totalMinutes += duration;
    });
    
    // Format tổng thời gian
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;
    
    // Cập nhật Tổng thời gian
    const totalHoursElement = document.getElementById('total-hours');
    if (totalHoursElement) {
        if (totalHours > 0 && totalMins > 0) {
            totalHoursElement.textContent = `${totalHours}h${totalMins}m`;
        } else if (totalHours > 0) {
            totalHoursElement.textContent = `${totalHours}h`;
        } else if (totalMins > 0) {
            totalHoursElement.textContent = `${totalMins}m`;
        } else {
            totalHoursElement.textContent = '0h';
        }
        console.log('✅ total-hours:', totalHoursElement.textContent);
    }
    
    // Cập nhật Tổng sự kiện
    const totalEventsElement = document.getElementById('total-events');
    if (totalEventsElement) {
        totalEventsElement.textContent = dayEvents.length;
        console.log('✅ total-events:', totalEventsElement.textContent);
    }
    
    // Cập nhật Sự kiện hoàn thành
    const completedEventsElement = document.getElementById('completed-events');
    if (completedEventsElement) {
        completedEventsElement.textContent = completedEvents;
        console.log('✅ completed-events:', completedEventsElement.textContent);
    }
    
    // Cập nhật Hiệu suất
    const productivityElement = document.getElementById('productivity');
    if (productivityElement) {
        const productivity = dayEvents.length > 0 ? Math.round((completedEvents / dayEvents.length) * 100) : 0;
        productivityElement.textContent = `${productivity}%`;
        console.log('✅ productivity:', productivityElement.textContent);
        
        // Thay đổi màu sắc theo hiệu suất
        if (productivity >= 80) {
            productivityElement.style.color = '#4CAF50';
        } else if (productivity >= 50) {
            productivityElement.style.color = '#FF9800';
        } else {
            productivityElement.style.color = '#F44336';
        }
    }
    
    // Cập nhật màu sắc cho các stat cards
    const statCards = document.querySelectorAll('.stat-card-mini');
    statCards.forEach(card => {
        const valueElement = card.querySelector('.stat-value-mini');
        if (valueElement) {
            // Tổng thời gian
            if (valueElement.id === 'total-hours') {
                if (totalHours >= 4) {
                    card.style.borderLeft = '4px solid #4CAF50';
                } else if (totalHours >= 1) {
                    card.style.borderLeft = '4px solid #FF9800';
                } else {
                    card.style.borderLeft = '4px solid #F44336';
                }
            }
            
            // Sự kiện hoàn thành
            if (valueElement.id === 'completed-events') {
                const completionRate = dayEvents.length > 0 ? (completedEvents / dayEvents.length) * 100 : 0;
                if (completionRate === 100) {
                    card.style.borderLeft = '4px solid #4CAF50';
                } else if (completionRate >= 50) {
                    card.style.borderLeft = '4px solid #FF9800';
                } else {
                    card.style.borderLeft = '4px solid #F44336';
                }
            }
            
            // Hiệu suất
            if (valueElement.id === 'productivity') {
                const productivity = dayEvents.length > 0 ? Math.round((completedEvents / dayEvents.length) * 100) : 0;
                if (productivity >= 80) {
                    card.style.borderLeft = '4px solid #4CAF50';
                } else if (productivity >= 50) {
                    card.style.borderLeft = '4px solid #FF9800';
                } else {
                    card.style.borderLeft = '4px solid #F44336';
                }
            }
        }
    });
}




function renderEventsList() {
    const container = document.getElementById('events-list');
    if (!container) return;
    
    const dateStr = formatDate(plannerData.currentDate);
    const dayEvents = plannerData.events.filter(e => e.date === dateStr);
    
    if (dayEvents.length === 0) {
        container.innerHTML = `
            <div class="events-empty">
                <i class="fas fa-calendar-plus"></i>
                <p>Chưa có sự kiện nào cho ngày hôm nay</p>
            </div>
        `;
        return;
    }
    
    // Sắp xếp theo thời gian
    dayEvents.sort((a, b) => {
        const [aHour, aMin] = a.startTime.split(':').map(Number);
        const [bHour, bMin] = b.startTime.split(':').map(Number);
        return (aHour * 60 + aMin) - (bHour * 60 + bMin);
    });
    
    container.innerHTML = dayEvents.map(event => {
        const category = categories.find(c => c.id === event.category) || categories[categories.length - 1];
        const priority = priorities.find(p => p.id === event.priority) || priorities[1];
        
        const [startH, startM] = event.startTime.split(':').map(Number);
        const [endH, endM] = event.endTime.split(':').map(Number);
        const duration = (endH * 60 + endM) - (startH * 60 + startM);
        const durationText = duration >= 60 ? 
            `${Math.floor(duration / 60)}h ${duration % 60}m` : 
            `${duration}m`;
        
        return `
            <div class="event-list-item ${event.completed ? 'completed' : ''}" data-event-id="${event.id}">
                <div class="event-list-header">
                    <div class="event-list-title">
                        <span style="color: ${category.color}; margin-right: 8px;">${category.name.split(' ')[0]}</span>
                        ${escapeHtml(event.title)}
                    </div>
                    <div class="event-list-time">${event.startTime} - ${event.endTime} (${durationText})</div>
                </div>
                ${event.notes ? `<div class="event-list-notes">${escapeHtml(event.notes.substring(0, 100))}${event.notes.length > 100 ? '...' : ''}</div>` : ''}
                <div class="event-list-meta">
                    <span class="event-list-category" style="color: ${category.color}; background: ${category.color}15;">
                        <i class="fas fa-tag"></i> ${category.name}
                    </span>
                    <span class="event-list-priority" style="color: ${priority.color}; background: ${priority.color}15;">
                        <i class="fas fa-flag"></i> ${priority.name}
                    </span>
                    <span class="event-list-status ${event.completed ? 'completed' : 'pending'}">
                        <i class="fas fa-${event.completed ? 'check-circle' : 'clock'}"></i>
                        ${event.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                    </span>
                </div>
                <div class="event-list-actions">
                    <button class="event-list-btn complete-event-btn" onclick="toggleEventComplete('${event.id}')">
                        <i class="fas fa-${event.completed ? 'undo' : 'check'}"></i>
                        ${event.completed ? 'Bỏ hoàn thành' : 'Hoàn thành'}
                    </button>
                    <button class="event-list-btn edit-event-btn" onclick="openEventModal('edit', ${JSON.stringify(event).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="event-list-btn delete-event-btn" onclick="deleteEvent('${event.id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateStatistics() {
    const container = document.getElementById('category-breakdown');
    if (!container) return;
    
    const dateStr = formatDate(plannerData.currentDate);
    const dayEvents = plannerData.events.filter(e => e.date === dateStr);
    
    if (dayEvents.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-light);">
                <i class="fas fa-chart-pie" style="font-size: 3em; opacity: 0.3; margin-bottom: 10px;"></i>
                <p>Chưa có dữ liệu thống kê</p>
                <small>Thêm sự kiện để xem phân tích chi tiết</small>
            </div>
        `;
        return;
    }
    
    // Tính thống kê theo category
    const categoryStats = {};
    let totalMinutes = 0;
    
    dayEvents.forEach(event => {
        const [startH, startM] = event.startTime.split(':').map(Number);
        const [endH, endM] = event.endTime.split(':').map(Number);
        const duration = (endH * 60 + endM) - (startH * 60 + startM);
        
        if (!categoryStats[event.category]) {
            categoryStats[event.category] = {
                minutes: 0,
                events: 0,
                completed: 0
            };
        }
        
        categoryStats[event.category].minutes += duration;
        categoryStats[event.category].events++;
        if (event.completed) categoryStats[event.category].completed++;
        
        totalMinutes += duration;
    });
    
    // Tạo HTML cho statistics
    let statsHTML = '<div class="stats-grid">';
    
    Object.entries(categoryStats).forEach(([catId, stats]) => {
        const category = categories.find(c => c.id === catId) || categories[categories.length - 1];
        const percentage = totalMinutes > 0 ? (stats.minutes / totalMinutes * 100) : 0;
        const hours = Math.floor(stats.minutes / 60);
        const mins = stats.minutes % 60;
        const completionRate = stats.events > 0 ? Math.round((stats.completed / stats.events) * 100) : 0;
        
        statsHTML += `
            <div class="stat-card-category">
                <div class="stat-category-header">
                    <div class="stat-category-icon" style="background: ${category.color};">
                        ${category.name.split(' ')[0]}
                    </div>
                    <div class="stat-category-info">
                        <h4>${category.name}</h4>
                        <div class="stat-category-meta">
                            <span>${stats.events} sự kiện</span>
                            <span>•</span>
                            <span>${completionRate}% hoàn thành</span>
                        </div>
                    </div>
                </div>
                <div class="stat-category-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%; background: ${category.color};"></div>
                    </div>
                    <div class="progress-time">${hours}h${mins}m</div>
                </div>
            </div>
        `;
    });
    
    statsHTML += '</div>';
    
    // Thêm vào container
    container.innerHTML = statsHTML;
}

function updateCalendarEvents() {
    // Cập nhật dấu chấm trên calendar
    const calendarDays = document.querySelectorAll('.calendar-day-cell:not(.other-month)');
    calendarDays.forEach(dayEl => {
        const day = parseInt(dayEl.textContent);
        if (!isNaN(day)) {
            const year = plannerData.calendarDate.getFullYear();
            const month = plannerData.calendarDate.getMonth();
            const dateStr = formatDate(new Date(year, month, day));
            
            const dayEvents = plannerData.events.filter(e => e.date === dateStr);
            
            // Remove old badges
            const oldBadge = dayEl.querySelector('.event-count');
            if (oldBadge) oldBadge.remove();
            
            // Update classes
            dayEl.classList.toggle('has-events', dayEvents.length > 0);
            
            // Add new badge if there are events
            if (dayEvents.length > 0) {
                const countBadge = document.createElement('div');
                countBadge.className = 'event-count';
                countBadge.textContent = dayEvents.length;
                dayEl.appendChild(countBadge);
            }
        }
    });
}

function savePlannerData() {
    if (typeof saveModuleData === 'function') {
        saveModuleData('events', plannerData.events);
    }
    
    // Cũng lưu vào localStorage để backup
    try {
        localStorage.setItem('planner_events_backup', JSON.stringify(plannerData.events));
    } catch (e) {
        console.error('Cannot save to localStorage:', e);
    }
}

function loadPlannerData(userData) {
    try {
        if (userData && userData.events) {
            plannerData.events = userData.events.map(event => ({
                ...event,
                color: event.color || eventColors[Math.floor(Math.random() * eventColors.length)]
            }));
            console.log('📥 Loaded planner data:', plannerData.events.length, 'events');
        } else {
            // Thử load từ localStorage
            const backup = localStorage.getItem('planner_events_backup');
            if (backup) {
                plannerData.events = JSON.parse(backup);
                console.log('📥 Loaded planner data from localStorage backup');
            } else {
                plannerData.events = [];
            }
        }
        
        updatePlannerView();
        
    } catch (error) {
        console.error('❌ Error loading planner data:', error);
        plannerData.events = [];
    }
}

// THÊM: Thanh thời gian thực (ĐÃ BỎ ANIMATION NHẤP NHÁY)
function addCurrentTimeLine() {
    const eventsContainer = document.getElementById('timeline-events');
    if (!eventsContainer) return;
    
    // Xóa thanh cũ nếu có
    const oldLine = document.getElementById('current-time-line');
    if (oldLine) oldLine.remove();
    
    // Kiểm tra có phải là hôm nay không
    const today = formatDate(new Date());
    const currentDateStr = formatDate(plannerData.currentDate);
    
    if (today !== currentDateStr) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentPosition = currentHour * 60 + currentMinute;
    
    // Tạo thanh thời gian thực (KHÔNG CÓ ANIMATION NHẤP NHÁY)
    const timeLine = document.createElement('div');
    timeLine.id = 'current-time-line';
    timeLine.style.cssText = `
        position: absolute;
        left: 0;
        right: 0;
        top: ${currentPosition}px;
        height: 2px;
        background: #FF5722;
        z-index: 10;
        pointer-events: none;
        box-shadow: 0 0 5px rgba(255, 87, 34, 0.5);
    `;
    
    // Thêm marker ở đầu thanh
    const timeMarker = document.createElement('div');
    timeMarker.style.cssText = `
        position: absolute;
        left: 0;
        top: -8px;
        background: #FF5722;
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    timeMarker.textContent = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    timeLine.appendChild(timeMarker);
    eventsContainer.appendChild(timeLine);
}

function startCurrentTimeLine() {
    // Dừng interval cũ nếu có
    if (currentTimeLineInterval) {
        clearInterval(currentTimeLineInterval);
    }
    
    // Cập nhật thanh thời gian thực mỗi phút
    currentTimeLineInterval = setInterval(() => {
        addCurrentTimeLine();
    }, 60000); // 1 phút
    
    // Cập nhật ngay lập tức
    addCurrentTimeLine();
}

// Scroll functions
function scrollToCurrentTime() {
    const timelineWrapper = document.querySelector('.planner-timeline-wrapper');
    if (!timelineWrapper) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentPosition = (currentHour * 60 + currentMinute) - 150; // Scroll lên 2.5h trước
    
    timelineWrapper.scrollTo({
        top: currentPosition,
        behavior: 'smooth'
    });
}

// Utility functions
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
    const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    return dateObj.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });
}

function generateId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available
window.initPlanner = initPlanner;
window.loadPlannerData = loadPlannerData;
window.closeEventModal = closeEventModal;
window.openEventModal = openEventModal;
window.toggleEventComplete = toggleEventComplete;
window.deleteEvent = deleteEvent;
window.goToToday = goToToday;
window.showNotification = showNotification;

console.log('🎉 Enhanced Planner 24h với thống kê real-time & thanh thời gian thực đã sẵn sàng!');



///////////////////////////////
