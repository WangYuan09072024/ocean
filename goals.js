// Toast Notification System - MỚI
function showToast(message, type = 'info') {
    // Tạo container nếu chưa có
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Tạo toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success':
            icon = '✅';
            break;
        case 'error':
            icon = '❌';
            break;
        case 'warning':
            icon = '⚠️';
            break;
        case 'info':
            icon = 'ℹ️';
            break;
    }
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Tự động xóa sau 3 giây
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// Goals Module - NÂNG CAO
let goalsData = {
    goals: [],
    filters: {
        category: 'all',
        priority: 'all',
        status: 'all'
    }
};

function initGoals() {
    console.log("Initializing Goals module...");
    setupGoalsListeners();
}

function setupGoalsListeners() {
    // Add new goal
    const addBtn = document.getElementById('add-goal-btn');
    if (addBtn) {
        addBtn.removeEventListener('click', showAddGoalModal); // Xóa listener cũ
        addBtn.addEventListener('click', showAddGoalModal);
    }
    
    // Modal events
    const cancelBtn = document.getElementById('goal-modal-cancel');
    const saveBtn = document.getElementById('goal-modal-save');
    const deadlineInput = document.getElementById('goal-modal-deadline');
    
    if (cancelBtn) {
        cancelBtn.removeEventListener('click', hideAddGoalModal);
        cancelBtn.addEventListener('click', hideAddGoalModal);
    }
    
    if (saveBtn) {
        saveBtn.removeEventListener('click', handleSaveGoal);
        saveBtn.addEventListener('click', handleSaveGoal);
    }
    
    if (deadlineInput) {
        deadlineInput.removeEventListener('change', updateDeadlinePreview);
        deadlineInput.addEventListener('change', updateDeadlinePreview);
    }
    
    // Progress slider - MỚI
    const progressSlider = document.getElementById('goal-modal-progress');
    if (progressSlider) {
        progressSlider.removeEventListener('input', handleProgressInput);
        progressSlider.addEventListener('input', handleProgressInput);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('goal-modal');
    if (modal) {
        modal.removeEventListener('click', handleModalClick);
        modal.addEventListener('click', handleModalClick);
    }

    // Filter listeners - MỚI
    const categoryFilter = document.getElementById('category-filter');
    const priorityFilter = document.getElementById('priority-filter');
    
    if (categoryFilter) {
        categoryFilter.removeEventListener('change', handleCategoryFilter);
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }
    
    if (priorityFilter) {
        priorityFilter.removeEventListener('change', handlePriorityFilter);
        priorityFilter.addEventListener('change', handlePriorityFilter);
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.removeEventListener('click', handleFilterBtn);
        btn.addEventListener('click', handleFilterBtn);
    });

    // Goals list actions - EVENT DELEGATION (chỉ đăng ký 1 lần)
    const goalsList = document.getElementById('goals-list');
    if (goalsList) {
        goalsList.removeEventListener('click', handleGoalsListClick);
        goalsList.addEventListener('click', handleGoalsListClick);
    }
}

// Helper functions cho event listeners
function handleProgressInput() {
    document.getElementById('progress-value-display').textContent = this.value;
}

function handleModalClick(e) {
    if (e.target.id === 'goal-modal') {
        hideAddGoalModal();
    }
}

function handleCategoryFilter() {
    goalsData.filters.category = this.value;
    applyFilters();
}

function handlePriorityFilter() {
    goalsData.filters.priority = this.value;
    applyFilters();
}

function handleFilterBtn() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    goalsData.filters.status = this.dataset.filter;
    applyFilters();
}

function handleGoalsListClick(e) {
    const goalItem = e.target.closest('.goal-item');
    if (!goalItem) return;
    
    const goalId = goalItem.dataset.goalId;
    
    // Complete button
    if (e.target.closest('.complete-btn')) {
        e.stopPropagation(); // Ngăn event bubble
        toggleGoalCompletion(goalId);
        return;
    }
    
    // Edit button
    if (e.target.closest('.edit-goal-btn')) {
        e.stopPropagation();
        showEditGoalModal(goalId);
        return;
    }
    
    // Progress button
    if (e.target.closest('.progress-btn')) {
        e.stopPropagation();
        showProgressModal(goalId);
        return;
    }
    
    // Delete button
    if (e.target.closest('.delete-goal-btn')) {
        e.stopPropagation();
        showCustomConfirm('Bạn có chắc muốn xóa mục tiêu này?', () => {
            deleteGoal(goalId);
        });
        return;
    }
}

// Custom Confirm Modal - MỚI
function showCustomConfirm(message, onConfirm) {
    const modal = document.getElementById('custom-confirm-modal');
    const messageEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('confirm-cancel');
    const okBtn = document.getElementById('confirm-ok');
    
    messageEl.textContent = message;
    modal.classList.add('active');
    
    // Remove old listeners
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newOkBtn = okBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    
    // Add new listeners
    newCancelBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    newOkBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        if (onConfirm) onConfirm();
    });
    
    // Close when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target.id === 'custom-confirm-modal') {
            modal.classList.remove('active');
        }
    });
}

function showAddGoalModal() {
    const modal = document.getElementById('goal-modal');
    const today = new Date();
    const defaultDeadline = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    document.getElementById('goal-modal-title').textContent = 'Thêm Mục Tiêu Mới';
    document.getElementById('goal-modal-text').value = '';
    document.getElementById('goal-modal-category').value = 'personal';
    document.getElementById('goal-modal-priority').value = 'medium';
    document.getElementById('goal-modal-deadline').value = formatDate(defaultDeadline);
    document.getElementById('goal-modal-progress').value = 0;
    document.getElementById('progress-value-display').textContent = 0;
    
    // Ẩn progress group khi thêm mới
    document.getElementById('progress-group').style.display = 'none';
    
    delete modal.dataset.editingGoalId;
    
    updateDeadlinePreview();
    modal.classList.add('active');
    document.getElementById('goal-modal-text').focus();
}

function hideAddGoalModal() {
    const modal = document.getElementById('goal-modal');
    modal.classList.remove('active');
    delete modal.dataset.editingGoalId;
}

function updateDeadlinePreview() {
    const deadlineInput = document.getElementById('goal-modal-deadline');
    const deadlinePreview = document.getElementById('deadline-preview');
    const deadlineDate = new Date(deadlineInput.value + 'T00:00:00');
    
    if (!isNaN(deadlineDate.getTime())) {
        const countdown = getCountdownText(deadlineDate);
        deadlinePreview.textContent = `📅 ${formatDateDisplay(deadlineInput.value)} - ${countdown}`;
        deadlinePreview.className = 'deadline-preview';
        
        if (deadlineDate < new Date()) {
            deadlinePreview.classList.add('warning');
        }
    } else {
        deadlinePreview.textContent = 'Chọn ngày deadline';
        deadlinePreview.className = 'deadline-preview';
    }
}

function handleSaveGoal() {
    const modal = document.getElementById('goal-modal');
    const isEditing = modal.dataset.editingGoalId;
    
    if (isEditing) {
        saveEditedGoal(isEditing);
    } else {
        saveNewGoal();
    }
}

function saveNewGoal() {
    const goalText = document.getElementById('goal-modal-text').value.trim();
    const category = document.getElementById('goal-modal-category').value;
    const priority = document.getElementById('goal-modal-priority').value;
    const deadlineValue = document.getElementById('goal-modal-deadline').value;
    
    if (!goalText) {
        showToast('Vui lòng nhập nội dung mục tiêu!', 'warning');
        document.getElementById('goal-modal-text').focus();
        return;
    }
    
    if (!deadlineValue) {
        showToast('Vui lòng chọn ngày deadline!', 'warning');
        document.getElementById('goal-modal-deadline').focus();
        return;
    }
    
    const deadlineDate = new Date(deadlineValue + 'T00:00:00');
    if (isNaN(deadlineDate.getTime())) {
        showToast('Ngày deadline không hợp lệ!', 'error');
        return;
    }
    
    const goalId = 'goal_' + Date.now();
    
    const emptyState = document.querySelector('.goals-empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const newGoal = {
        id: goalId,
        text: goalText,
        category: category,
        priority: priority,
        deadline: deadlineDate.toISOString(),
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    goalsData.goals.push(newGoal);
    
    saveModuleData('goals', goalsData.goals);
    
    hideAddGoalModal();
    
    renderGoalsList();
    updateStats();
    checkDeadlineAlerts();
    
    showToast('Mục tiêu đã được thêm thành công!', 'success');
}

function saveEditedGoal(goalId) {
    const goalText = document.getElementById('goal-modal-text').value.trim();
    const category = document.getElementById('goal-modal-category').value;
    const priority = document.getElementById('goal-modal-priority').value;
    const deadlineValue = document.getElementById('goal-modal-deadline').value;
    const progress = parseInt(document.getElementById('goal-modal-progress').value);
    
    if (!goalText) {
        showToast('Vui lòng nhập nội dung mục tiêu!', 'warning');
        document.getElementById('goal-modal-text').focus();
        return;
    }
    
    if (!deadlineValue) {
        showToast('Vui lòng chọn ngày deadline!', 'warning');
        document.getElementById('goal-modal-deadline').focus();
        return;
    }
    
    const deadlineDate = new Date(deadlineValue + 'T00:00:00');
    if (isNaN(deadlineDate.getTime())) {
        showToast('Ngày deadline không hợp lệ!', 'error');
        return;
    }
    
    const goalIndex = goalsData.goals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) {
        showToast('Không tìm thấy mục tiêu để chỉnh sửa!', 'error');
        hideAddGoalModal();
        return;
    }
    
    goalsData.goals[goalIndex].text = goalText;
    goalsData.goals[goalIndex].category = category;
    goalsData.goals[goalIndex].priority = priority;
    goalsData.goals[goalIndex].deadline = deadlineDate.toISOString();
    goalsData.goals[goalIndex].progress = progress;
    goalsData.goals[goalIndex].updatedAt = new Date().toISOString();
    
    saveModuleData('goals', goalsData.goals);
    
    hideAddGoalModal();
    
    renderGoalsList();
    updateStats();
    checkDeadlineAlerts();
    
    showToast('Mục tiêu đã được cập nhật!', 'success');
}

function showEditGoalModal(goalId) {
    const goalIndex = goalsData.goals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) return;
    
    const goal = goalsData.goals[goalIndex];
    const modal = document.getElementById('goal-modal');
    
    document.getElementById('goal-modal-title').textContent = 'Chỉnh Sửa Mục Tiêu';
    document.getElementById('goal-modal-text').value = goal.text;
    document.getElementById('goal-modal-category').value = goal.category || 'personal';
    document.getElementById('goal-modal-priority').value = goal.priority || 'medium';
    document.getElementById('goal-modal-deadline').value = formatDate(new Date(goal.deadline));
    document.getElementById('goal-modal-progress').value = goal.progress || 0;
    document.getElementById('progress-value-display').textContent = goal.progress || 0;
    
    // Hiện progress group khi edit
    document.getElementById('progress-group').style.display = 'block';
    
    modal.dataset.editingGoalId = goalId;
    
    updateDeadlinePreview();
    modal.classList.add('active');
    document.getElementById('goal-modal-text').focus();
}

// Progress Modal - MỚI
function showProgressModal(goalId) {
    const goalIndex = goalsData.goals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) return;
    
    const goal = goalsData.goals[goalIndex];
    const currentProgress = goal.progress || 0;
    
    const newProgress = prompt(`Cập nhật tiến độ mục tiêu:\n"${goal.text}"\n\nNhập % hoàn thành (0-100):`, currentProgress);
    
    if (newProgress !== null) {
        const progress = parseInt(newProgress);
        if (!isNaN(progress) && progress >= 0 && progress <= 100) {
            goalsData.goals[goalIndex].progress = progress;
            goalsData.goals[goalIndex].updatedAt = new Date().toISOString();
            
            // Tự động đánh dấu hoàn thành nếu đạt 100%
            if (progress === 100 && !goal.completed) {
                goalsData.goals[goalIndex].completed = true;
                showToast('Chúc mừng! Mục tiêu đã hoàn thành 100%!', 'success');
            }
            
            saveModuleData('goals', goalsData.goals);
            renderGoalsList();
            updateStats();
            
            showToast(`Tiến độ đã cập nhật: ${progress}%`, 'success');
        } else {
            showToast('Vui lòng nhập số từ 0 đến 100!', 'error');
        }
    }
}

function getCategoryIcon(category) {
    const icons = {
        personal: '🙂',
        work: '💼',
        study: '📚',
        health: '💪',
        finance: '💰',
        other: '📌'
    };
    return icons[category] || '📌';
}

function getCategoryName(category) {
    const names = {
        personal: 'Cá nhân',
        work: 'Công việc',
        study: 'Học tập',
        health: 'Sức khỏe',
        finance: 'Tài chính',
        other: 'Khác'
    };
    return names[category] || 'Khác';
}

function getPriorityName(priority) {
    const names = {
        high: 'Cao',
        medium: 'Trung bình',
        low: 'Thấp'
    };
    return names[priority] || 'Trung bình';
}

function createGoalHTML(goal) {
    const deadlineDate = new Date(goal.deadline);
    const countdown = getCountdownText(deadlineDate);
    const isOverdue = deadlineDate < new Date() && !goal.completed;
    const progress = goal.progress || 0;
    const category = goal.category || 'personal';
    const priority = goal.priority || 'medium';
    const isCompleted = goal.completed === true;
    
    return `
        <div class="goal-item ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} priority-${priority}" data-goal-id="${goal.id}">
            <div class="goal-content">
                <div class="goal-checkbox">
                    <button class="complete-btn ${isCompleted ? 'completed' : ''}" title="${isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}">
                        <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-circle'}"></i>
                    </button>
                </div>
                <div class="goal-text">
                    <div class="goal-header">
                        <span class="goal-title">${escapeHtml(goal.text)}</span>
                    </div>
                    
                    <div class="goal-badges">
                        <span class="badge category-badge">
                            ${getCategoryIcon(category)} ${getCategoryName(category)}
                        </span>
                        <span class="badge priority-badge ${priority}">
                            ${priority === 'high' ? '🔴' : priority === 'medium' ? '🟠' : '🟢'} ${getPriorityName(priority)}
                        </span>
                    </div>
                    
                    <div class="goal-progress">
                        <div class="progress-header">
                            <span>Tiến độ</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="goal-meta">
                        <span class="deadline">
                            <i class="fas fa-calendar-day"></i>
                            <span class="deadline-date">${formatDateDisplay(formatDate(deadlineDate))}</span>
                        </span>
                        <span class="countdown ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-clock"></i>
                            <span class="countdown-text">${countdown}</span>
                        </span>
                    </div>
                </div>
            </div>
            <div class="goal-actions">
                <button class="progress-btn" title="Cập nhật tiến độ">
                    <i class="fas fa-chart-line"></i> Tiến độ
                </button>
                <button class="edit-goal-btn" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-goal-btn" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function getCountdownText(deadlineDate) {
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `Quá hạn ${Math.abs(diffDays)} ngày`;
    } else if (diffDays === 0) {
        return 'Hôm nay';
    } else if (diffDays === 1) {
        return '1 ngày nữa';
    } else if (diffDays < 7) {
        return `${diffDays} ngày nữa`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} tuần nữa`;
    } else {
        const months = Math.floor(diffDays / 30);
        return `${months} tháng nữa`;
    }
}

function toggleGoalCompletion(goalId) {
    const goalIndex = goalsData.goals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) return;
    
    const wasCompleted = goalsData.goals[goalIndex].completed;
    goalsData.goals[goalIndex].completed = !wasCompleted;
    goalsData.goals[goalIndex].updatedAt = new Date().toISOString();
    
    // Nếu đánh dấu hoàn thành, set progress = 100
    if (!wasCompleted) {
        // Đang chuyển từ chưa hoàn thành -> hoàn thành
        goalsData.goals[goalIndex].progress = 100;
        showToast('Chúc mừng! Bạn đã hoàn thành mục tiêu!', 'success');
    } else {
        // Đang chuyển từ hoàn thành -> chưa hoàn thành
        showToast('Mục tiêu đã được đánh dấu chưa hoàn thành', 'info');
    }
    
    saveModuleData('goals', goalsData.goals);
    renderGoalsList();
    updateStats();
    checkDeadlineAlerts();
}

function deleteGoal(goalId) {
    const goalIndex = goalsData.goals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) return;
    
    const goalItem = document.querySelector(`[data-goal-id="${goalId}"]`);
    if (!goalItem) return;
    
    goalItem.style.opacity = '0';
    goalItem.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        goalItem.remove();
        goalsData.goals.splice(goalIndex, 1);
        saveModuleData('goals', goalsData.goals);
        
        renderGoalsList();
        updateStats();
        checkDeadlineAlerts();
        
        showToast('Mục tiêu đã được xóa', 'info');
    }, 300);
}

// Filter & Sort - MỚI
function applyFilters() {
    const { category, priority, status } = goalsData.filters;
    
    const filteredGoals = goalsData.goals.filter(goal => {
        const matchCategory = category === 'all' || goal.category === category;
        const matchPriority = priority === 'all' || goal.priority === priority;
        
        let matchStatus = true;
        if (status === 'active') {
            matchStatus = !goal.completed;
        } else if (status === 'completed') {
            matchStatus = goal.completed === true;
        }
        // status === 'all' thì matchStatus = true (hiện tất cả)
        
        return matchCategory && matchPriority && matchStatus;
    });
    
    renderFilteredGoals(filteredGoals);
}

function renderFilteredGoals(goals) {
    const goalsList = document.getElementById('goals-list');
    goalsList.innerHTML = '';
    
    console.log('🔍 Rendering filtered goals:', goals.length);
    console.log('Current filter:', goalsData.filters);
    
    if (goals.length > 0) {
        const sortedGoals = sortGoals(goals);
        sortedGoals.forEach(goal => {
            console.log('Rendering goal:', goal.id, 'completed:', goal.completed);
            const goalHTML = createGoalHTML(goal);
            goalsList.insertAdjacentHTML('beforeend', goalHTML);
        });
    } else {
        goalsList.innerHTML = `
            <div class="goals-empty-state">
                <i class="fas fa-filter"></i>
                <h3>Không tìm thấy mục tiêu</h3>
                <p>Không có mục tiêu nào phù hợp với bộ lọc hiện tại</p>
            </div>
        `;
    }
}

function sortGoals(goals) {
    return [...goals].sort((a, b) => {
        const aDeadline = new Date(a.deadline);
        const bDeadline = new Date(b.deadline);
        const now = new Date();
        
        // Completed last
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        
        // Priority order
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const aPriority = priorityOrder[a.priority] || 1;
        const bPriority = priorityOrder[b.priority] || 1;
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        // Overdue first
        const aIsOverdue = aDeadline < now;
        const bIsOverdue = bDeadline < now;
        if (aIsOverdue && !bIsOverdue) return -1;
        if (!aIsOverdue && bIsOverdue) return 1;
        
        // By deadline
        return aDeadline - bDeadline;
    });
}

// Statistics - MỚI
function updateStats() {
    const total = goalsData.goals.length;
    const completed = goalsData.goals.filter(g => g.completed).length;
    const inProgress = goalsData.goals.filter(g => !g.completed).length;
    const overdue = goalsData.goals.filter(g => {
        const deadline = new Date(g.deadline);
        return deadline < new Date() && !g.completed;
    }).length;
    
    document.getElementById('total-goals').textContent = total;
    document.getElementById('completed-goals').textContent = completed;
    document.getElementById('inprogress-goals').textContent = inProgress;
    document.getElementById('overdue-goals').textContent = overdue;
}

function checkDeadlineAlerts() {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingDeadlines = goalsData.goals.filter(goal => {
        if (goal.completed) return false;
        const deadline = new Date(goal.deadline);
        return deadline <= sevenDaysFromNow && deadline > now;
    });
    
    const overdueGoals = goalsData.goals.filter(goal => {
        if (goal.completed) return false;
        const deadline = new Date(goal.deadline);
        return deadline < now;
    });
    
    if (upcomingDeadlines.length > 0 || overdueGoals.length > 0) {
        showDeadlineAlerts(upcomingDeadlines, overdueGoals);
    }
}

function showDeadlineAlerts(upcoming, overdue) {
    const existingAlert = document.querySelector('.deadline-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    let alertMessage = '';
    
    if (overdue.length > 0) {
        alertMessage += `⚠️ Có ${overdue.length} mục tiêu đã quá hạn! `;
    }
    
    if (upcoming.length > 0) {
        alertMessage += `⏰ Có ${upcoming.length} mục tiêu sắp đến hạn trong 7 ngày tới!`;
    }
    
    if (alertMessage) {
        const alertElement = document.createElement('div');
        alertElement.className = 'deadline-alert';
        alertElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${alertMessage}</span>
            <button class="close-alert">&times;</button>
        `;
        
        const goalsContainer = document.querySelector('.goals-container');
        goalsContainer.insertBefore(alertElement, goalsContainer.firstChild);
        
        alertElement.querySelector('.close-alert').addEventListener('click', function() {
            alertElement.remove();
        });
        
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 10000);
    }
}

function loadGoalsData(userData) {
    console.log('🎯 Loading goals data:', userData);
    
    if (userData && userData.goals) {
        goalsData.goals = userData.goals.map(goal => ({
            ...goal,
            category: goal.category || 'personal',
            priority: goal.priority || 'medium',
            progress: goal.progress || 0
        }));
    } else {
        goalsData.goals = [];
    }
    
    renderGoalsList();
    updateStats();
    checkDeadlineAlerts();
    
    setInterval(() => {
        updateStats();
    }, 60000);
}

function renderGoalsList() {
    applyFilters();
}

function showGoalsEmptyState() {
    const goalsList = document.getElementById('goals-list');
    goalsList.innerHTML = `
        <div class="goals-empty-state">
            <i class="fas fa-bullseye"></i>
            <h3>Chưa có mục tiêu nào</h3>
            <p>Hãy thêm mục tiêu đầu tiên để bắt đầu hành trình của bạn!</p>
            <p class="empty-tip">"Mục tiêu rõ ràng + Deadline cụ thể = Thành công"</p>
        </div>
    `;
}

function saveGoalsData() {
    return {
        goals: goalsData.goals
    };
}