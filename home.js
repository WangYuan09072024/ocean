// Home Module - CẬP NHẬT
let homeData = {
    tasks: {},
    currentDate: getToday(),
    selectedDate: getToday(),
    // PHẦN MỚI: Theo dõi tháng đang hiển thị
    displayMonth: new Date().getMonth(),
    displayYear: new Date().getFullYear()
};

function initHome() {
    console.log("Initializing Home module...");
    
    // Initialize current date display
    document.getElementById('current-date').textContent = formatDateDisplay(homeData.selectedDate);
    
    // Initialize calendar với chức năng chọn ngày
    renderCalendar();
    
    // Initialize tasks
    setupTaskListeners();
    
    // Load tasks for selected date
    loadTasksForSelectedDate();
}

// PHẦN MỚI: Render calendar với khả năng chuyển tháng
function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    const displayDate = new Date(homeData.displayYear, homeData.displayMonth, 1);
    
    // Get first day of month and number of days
    const firstDay = new Date(homeData.displayYear, homeData.displayMonth, 1);
    const lastDay = new Date(homeData.displayYear, homeData.displayMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get previous month's last days
    const prevMonthLastDay = new Date(homeData.displayYear, homeData.displayMonth, 0);
    const prevMonthDays = prevMonthLastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    let calendarHTML = `
        <div class="calendar-header">
            <button class="month-nav-btn" id="prev-month-btn">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="calendar-nav">
                <div class="month-year">${displayDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</div>
            </div>
            <button class="month-nav-btn" id="next-month-btn">
                <i class="fas fa-chevron-right"></i>
            </button>
            <button id="today-btn" class="today-btn">Hôm nay</button>
        </div>
        <div class="calendar-grid">
            <div class="day-header">CN</div>
            <div class="day-header">T2</div>
            <div class="day-header">T3</div>
            <div class="day-header">T4</div>
            <div class="day-header">T5</div>
            <div class="day-header">T6</div>
            <div class="day-header">T7</div>
    `;
    
    // Add previous month's days (mờ đi)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = formatDate(new Date(homeData.displayYear, homeData.displayMonth, day));
        const isToday = dateString === getToday();
        const isSelected = dateString === homeData.selectedDate;
        const hasTasks = homeData.tasks[dateString] && Object.keys(homeData.tasks[dateString]).length > 0;
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasTasks ? 'has-tasks' : ''}" 
                 data-date="${dateString}">
                ${day}
                ${isToday ? '<div class="today-indicator"></div>' : ''}
            </div>
        `;
    }
    
    // Add next month's days (mờ đi)
    const totalCells = firstDayOfWeek + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    calendarHTML += '</div>';
    calendarEl.innerHTML = calendarHTML;
    
    // PHẦN MỚI: Event listeners cho nút chuyển tháng
    document.getElementById('prev-month-btn').addEventListener('click', function() {
        if (homeData.displayMonth === 0) {
            homeData.displayMonth = 11;
            homeData.displayYear--;
        } else {
            homeData.displayMonth--;
        }
        renderCalendar();
    });
    
    document.getElementById('next-month-btn').addEventListener('click', function() {
        if (homeData.displayMonth === 11) {
            homeData.displayMonth = 0;
            homeData.displayYear++;
        } else {
            homeData.displayMonth++;
        }
        renderCalendar();
    });
    
    // Event listener cho các ngày trong lịch
    calendarEl.addEventListener('click', function(e) {
        const dayElement = e.target.closest('.calendar-day:not(.empty):not(.other-month)');
        if (dayElement && dayElement.dataset.date) {
            selectDate(dayElement.dataset.date);
        }
    });
    
    // Event listener cho nút "Hôm nay"
    document.getElementById('today-btn').addEventListener('click', function() {
        const today = new Date();
        homeData.displayMonth = today.getMonth();
        homeData.displayYear = today.getFullYear();
        selectDate(getToday());
    });
}

function selectDate(dateString) {
    homeData.selectedDate = dateString;
    
    // Cập nhật hiển thị ngày
    document.getElementById('current-date').textContent = formatDateDisplay(dateString);
    
    // Render lại lịch để highlight ngày được chọn
    renderCalendar();
    
    // Load tasks cho ngày được chọn
    loadTasksForSelectedDate();
}

function setupTaskListeners() {
    const tasksList = document.getElementById('tasks-list');
    
    // Add new task - PHẦN SỬA: Cho phép thêm task vào bất kỳ ngày nào
    document.getElementById('add-task-btn').addEventListener('click', addNewTask);
    document.getElementById('new-task-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewTask();
        }
    });
    
    // Task actions
    tasksList.addEventListener('click', function(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = taskItem.dataset.taskId;
        
        // Edit button
        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            makeTaskEditable(taskItem, taskId);
        }
        
        // Delete button
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            deleteTask(taskId);
        }
        
        // Checkbox
        if (e.target.type === 'checkbox') {
            updateTaskCompletion(taskId, e.target.checked);
        }
    });
    
    // Double click to edit
    tasksList.addEventListener('dblclick', function(e) {
        if (e.target.classList.contains('task-text')) {
            const taskItem = e.target.closest('.task-item');
            const taskId = taskItem.dataset.taskId;
            makeTaskEditable(taskItem, taskId);
        }
    });
}

// PHẦN SỬA: Cho phép thêm task vào bất kỳ ngày nào
function addNewTask() {
    const input = document.getElementById('new-task-input');
    const taskText = input.value.trim();
    
    if (!taskText) {
        input.focus();
        return;
    }
    
    const selectedDate = homeData.selectedDate;
    const taskId = 'task_' + Date.now();
    
    console.log('🔍 DEBUG - Adding task to date:', selectedDate);
    
    // Remove empty state if exists
    const emptyState = document.getElementById('tasks-empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Create new task element
    const taskHTML = createTaskHTML(taskId, taskText, false, true);
    document.getElementById('tasks-list').insertAdjacentHTML('beforeend', taskHTML);
    
    // Save to data
    if (!homeData.tasks[selectedDate]) {
        homeData.tasks[selectedDate] = {};
    }
    
    homeData.tasks[selectedDate][taskId] = {
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Save to Firebase
    console.log('🔍 DEBUG - Calling saveModuleData with tasks:', homeData.tasks);
    saveModuleData('tasks', homeData.tasks);
    
    // Render lại lịch để cập nhật indicator
    renderCalendar();
    
    // Clear input
    input.value = '';
    input.focus();
}

function createTaskHTML(taskId, text, completed, isEditable = true) {
    return `
        <div class="task-item" data-task-id="${taskId}">
            <input type="checkbox" id="${taskId}" ${completed ? 'checked' : ''}>
            <label for="${taskId}" class="task-text">${text}</label>
            <div class="task-actions">
                <button class="edit-btn" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function makeTaskEditable(taskItem, taskId) {
    const label = taskItem.querySelector('.task-text');
    const currentText = label.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'task-edit-input';
    
    input.addEventListener('blur', function() {
        saveTaskEdit(taskItem, taskId, input.value);
    });
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            input.blur();
        }
        if (e.key === 'Escape') {
            taskItem.replaceChild(label, input);
        }
    });
    
    taskItem.replaceChild(input, label);
    input.focus();
    input.select();
}

function saveTaskEdit(taskItem, taskId, newText) {
    const selectedDate = homeData.selectedDate;
    
    if (newText.trim()) {
        const label = document.createElement('label');
        label.className = 'task-text';
        label.textContent = newText.trim();
        label.htmlFor = taskId;
        
        taskItem.replaceChild(label, taskItem.querySelector('.task-edit-input'));
        
        // Update data
        if (homeData.tasks[selectedDate] && homeData.tasks[selectedDate][taskId]) {
            homeData.tasks[selectedDate][taskId].text = newText.trim();
            homeData.tasks[selectedDate][taskId].updatedAt = new Date().toISOString();
            // Save to Firebase
            saveModuleData('tasks', homeData.tasks);
        }
    } else {
        // If empty text, delete the task
        deleteTask(taskId);
    }
}

function deleteTask(taskId) {
    const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskItem) return;
    
    // Add delete animation
    taskItem.style.opacity = '0';
    taskItem.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        taskItem.remove();
        
        // Remove from data
        const selectedDate = homeData.selectedDate;
        if (homeData.tasks[selectedDate] && homeData.tasks[selectedDate][taskId]) {
            delete homeData.tasks[selectedDate][taskId];
            // Save to Firebase
            saveModuleData('tasks', homeData.tasks);
            
            // Render lại lịch để cập nhật indicator
            renderCalendar();
        }
        
        // If no tasks left, show empty state
        checkEmptyState();
    }, 300);
}

function updateTaskCompletion(taskId, isCompleted) {
    const selectedDate = homeData.selectedDate;
    if (homeData.tasks[selectedDate] && homeData.tasks[selectedDate][taskId]) {
        homeData.tasks[selectedDate][taskId].completed = isCompleted;
        homeData.tasks[selectedDate][taskId].updatedAt = new Date().toISOString();
        // Save to Firebase
        saveModuleData('tasks', homeData.tasks);
    }
}

// PHẦN SỬA: Hiển thị thông báo phù hợp với ngày đã chọn
function loadTasksForSelectedDate() {
    const selectedDate = homeData.selectedDate;
    const tasksList = document.getElementById('tasks-list');
    const today = getToday();
    
    // Clear current tasks
    tasksList.innerHTML = '';
    
    // Xác định loại ngày
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const todayDateObj = new Date(today + 'T00:00:00');
    const isPast = selectedDateObj < todayDateObj;
    const isFuture = selectedDateObj > todayDateObj;
    const isToday = selectedDate === today;
    
    // Hiển thị thông báo phù hợp
    if (!isToday) {
        let notificationHTML = '';
        if (isPast) {
            notificationHTML = `
                <div class="date-notification">
                    <i class="fas fa-history"></i>
                    <span>Đang xem tasks ngày ${formatDateDisplay(selectedDate)} (Quá khứ)</span>
                    <button class="back-to-today" onclick="selectDate('${today}')">
                        Quay về hôm nay
                    </button>
                </div>
            `;
        } else if (isFuture) {
            notificationHTML = `
                <div class="date-notification future">
                    <i class="fas fa-calendar-plus"></i>
                    <span>Lên kế hoạch cho ngày ${formatDateDisplay(selectedDate)}</span>
                    <button class="back-to-today" onclick="selectDate('${today}')">
                        Quay về hôm nay
                    </button>
                </div>
            `;
        }
        tasksList.innerHTML = notificationHTML;
    }
    
    // Load tasks
    if (homeData.tasks[selectedDate] && Object.keys(homeData.tasks[selectedDate]).length > 0) {
        Object.entries(homeData.tasks[selectedDate]).forEach(([taskId, taskData]) => {
            const taskHTML = createTaskHTML(taskId, taskData.text, taskData.completed, true);
            tasksList.insertAdjacentHTML('beforeend', taskHTML);
        });
    } else {
        // Show empty state
        showEmptyState(selectedDate, isToday, isFuture, isPast);
    }
    
    checkEmptyState();
}

function showEmptyState(selectedDate, isToday, isFuture, isPast) {
    const tasksList = document.getElementById('tasks-list');
    let emptyStateHTML = '';
    
    if (isToday) {
        emptyStateHTML = `
            <div id="tasks-empty-state" class="tasks-empty-state">
                <i class="fas fa-tasks"></i>
                <p>Chưa có việc quan trọng nào. Hãy thêm việc cần làm!</p>
            </div>
        `;
    } else if (isFuture) {
        emptyStateHTML = `
            <div id="tasks-empty-state" class="tasks-empty-state">
                <i class="fas fa-calendar-plus"></i>
                <p>Chưa có kế hoạch cho ngày ${formatDateDisplay(selectedDate)}. Thêm ngay!</p>
            </div>
        `;
    } else if (isPast) {
        emptyStateHTML = `
            <div id="tasks-empty-state" class="tasks-empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>Không có task nào được ghi nhận vào ngày ${formatDateDisplay(selectedDate)}</p>
            </div>
        `;
    }
    
    tasksList.insertAdjacentHTML('beforeend', emptyStateHTML);
}

function checkEmptyState() {
    const tasksList = document.getElementById('tasks-list');
    const taskItems = tasksList.querySelectorAll('.task-item');
    const emptyState = tasksList.querySelector('.tasks-empty-state');
    const dateNotification = tasksList.querySelector('.date-notification');
    
    if (taskItems.length === 0 && !emptyState && !dateNotification) {
        const selectedDate = homeData.selectedDate;
        const today = getToday();
        const selectedDateObj = new Date(selectedDate + 'T00:00:00');
        const todayDateObj = new Date(today + 'T00:00:00');
        const isPast = selectedDateObj < todayDateObj;
        const isFuture = selectedDateObj > todayDateObj;
        const isToday = selectedDate === today;
        
        showEmptyState(selectedDate, isToday, isFuture, isPast);
    }
}

// Firebase integration
function loadHomeData(userData) {
    console.log('🏠 Loading home data:', userData);
    
    if (userData && userData.tasks) {
        homeData.tasks = userData.tasks;
    } else {
        homeData.tasks = {};
    }
    
    loadTasksForSelectedDate();
    renderCalendar();
}

function saveHomeData() {
    return {
        tasks: homeData.tasks
    };
}

// Auto-refresh functionality
function checkDayChange() {
    const today = getToday();
    if (today !== homeData.currentDate) {
        homeData.currentDate = today;
        
        // Nếu đang xem ngày hôm qua, tự động chuyển về hôm nay
        if (homeData.selectedDate !== today) {
            const todayDate = new Date();
            homeData.displayMonth = todayDate.getMonth();
            homeData.displayYear = todayDate.getFullYear();
            selectDate(today);
        }
        
        showDayChangeNotification();
    }
}

function showDayChangeNotification() {
    const notification = document.createElement('div');
    notification.className = 'day-change-notification';
    notification.innerHTML = `
        <i class="fas fa-calendar-day"></i>
        <span>Chào ngày mới! Hãy bắt đầu với những việc quan trọng nhất hôm nay</span>
    `;
    
    document.querySelector('.home-container').prepend(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Check for day change every minute
setInterval(checkDayChange, 60000);