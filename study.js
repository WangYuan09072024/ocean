/**
 * study.js - PHIÊN BẢN ĐÃ CẢI TIẾN HOÀN TOÀN
 * ✅ Sticky Notes có cấu trúc đẹp (title, content, tags)
 * ✅ Toast notification góc phải màn hình
 * ✅ Vòng tròn Pomodoro fill theo thời gian
 * ✅ Bar chart có chiều cao tương ứng giá trị
 * ✅ Màu sắc tối ưu, dễ nhìn
 */

// ===================================
// STATE MANAGEMENT
// ===================================
let studyState = {
  subjects: [],
  resources: [],
  studyHistory: [],
  stickyNotes: [],
  pomodoro: {
    currentSubjectId: null,
    isStudying: false,
    isBreak: false,
    time: 0,
    initialTime: 0,
    intervalId: null,
    studyMins: 25,
    breakMins: 5,
    sessionLogs: [],
    startTime: null,
    elapsedSeconds: 0,
    autoBreak: true,
  },
};

// ===================================
// DATA STRUCTURE VALIDATION
// ===================================
function ensureStudyDataStructure() {
  if (!studyState.subjects || !Array.isArray(studyState.subjects)) {
    studyState.subjects = [];
  }
  if (!studyState.resources || !Array.isArray(studyState.resources)) {
    studyState.resources = [];
  }
  if (!studyState.studyHistory || !Array.isArray(studyState.studyHistory)) {
    studyState.studyHistory = [];
  }
  if (!studyState.stickyNotes || !Array.isArray(studyState.stickyNotes)) {
    studyState.stickyNotes = [];
  }

  if (!studyState.pomodoro || typeof studyState.pomodoro !== "object") {
    studyState.pomodoro = {
      currentSubjectId: null,
      isStudying: false,
      isBreak: false,
      time: 0,
      initialTime: 0,
      intervalId: null,
      studyMins: 25,
      breakMins: 5,
      sessionLogs: [],
      startTime: null,
      elapsedSeconds: 0,
      autoBreak: true,
    };
  }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getToday() {
  return formatDate(new Date());
}

function formatDateDisplay(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
}

function formatDuration(minutes) {
  if (minutes === 0) return "0p";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  let result = "";
  if (h > 0) result += `${h}h`;
  if (m > 0) result += `${m}p`;
  return result;
}

function formatTimeRange(startTime, endTime) {
  try {
    const start = new Date(startTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const end = new Date(endTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${start} - ${end}`;
  } catch (e) {
    return "--:-- - --:--";
  }
}

function generateId() {
  return (
    "id_" +
    Math.random().toString(36).substr(2, 9) +
    "_" +
    Date.now().toString(36)
  );
}

// ===================================
// TOAST NOTIFICATION SYSTEM - MỚI
// ===================================
function showStudyToast(title, message, type = "info") {
  const container = document.getElementById("studyToastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `study-toast ${type}`;

  let icon = "";
  switch (type) {
    case "success":
      icon = '<i class="fas fa-check-circle"></i>';
      break;
    case "error":
      icon = '<i class="fas fa-exclamation-circle"></i>';
      break;
    case "warning":
      icon = '<i class="fas fa-exclamation-triangle"></i>';
      break;
    default:
      icon = '<i class="fas fa-info-circle"></i>';
      break;
  }

  toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

  container.appendChild(toast);

  // Tự động xóa sau 4 giây
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add("hiding");
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

// ===================================
// INITIALIZATION
// ===================================
function initStudy() {
  console.log("✨ Initializing Study Tracker module...");

  ensureStudyDataStructure();

  // Timer Selects
  const studyTimeSelect = document.getElementById("studyTimeSelect");
  const breakTimeSelect = document.getElementById("breakTimeSelect");

  if (studyTimeSelect) {
    studyTimeSelect.addEventListener("change", (e) => {
      studyState.pomodoro.studyMins = parseInt(e.target.value);
      if (!studyState.pomodoro.isStudying) {
        studyState.pomodoro.time = studyState.pomodoro.studyMins * 60;
        studyState.pomodoro.initialTime = studyState.pomodoro.studyMins * 60;
        updateTimerDisplay();
      }
    });
  }

  if (breakTimeSelect) {
    breakTimeSelect.addEventListener("change", (e) => {
      studyState.pomodoro.breakMins = parseInt(e.target.value);
    });
  }

  // Subject Management
  const addSubjectBtn = document.getElementById("addSubjectBtn");
  if (addSubjectBtn) {
    addSubjectBtn.addEventListener("click", addSubject);
  }

  // Pomodoro Timer
  const startTimerBtn = document.getElementById("startTimerBtn");
  const toggleTimerBtn = document.getElementById("toggleTimerBtn");
  const resetTimerBtn = document.getElementById("resetTimerBtn");

  if (startTimerBtn) startTimerBtn.addEventListener("click", startNewSession);
  if (toggleTimerBtn) toggleTimerBtn.addEventListener("click", toggleTimer);
  if (resetTimerBtn) resetTimerBtn.addEventListener("click", handleResetTimer);

  // Auto break toggle
  const autoBreakToggle = document.getElementById("autoBreakToggle");
  if (autoBreakToggle) {
    autoBreakToggle.checked = studyState.pomodoro.autoBreak;
    autoBreakToggle.addEventListener("change", function () {
      studyState.pomodoro.autoBreak = this.checked;
    });
  }

  // Resource buttons
  const addGeneralResourceBtn = document.getElementById(
    "addGeneralResourceBtn",
  );
  const addSubjectResourceBtn = document.getElementById(
    "addSubjectResourceBtn",
  );

  if (addGeneralResourceBtn)
    addGeneralResourceBtn.addEventListener("click", addResource);
  if (addSubjectResourceBtn)
    addSubjectResourceBtn.addEventListener("click", addResource);

  // Initial display
  studyState.pomodoro.time = studyState.pomodoro.studyMins * 60;
  studyState.pomodoro.initialTime = studyState.pomodoro.studyMins * 60;
  updateTimerDisplay();

  // Resources với tabs
  const resourceTabs = document.querySelectorAll(".resource-tab");
  resourceTabs.forEach((tab) => {
    tab.addEventListener("click", switchResourceTab);
  });

  const resourceSearchInput = document.getElementById("resourceSearchInput");
  if (resourceSearchInput)
    resourceSearchInput.addEventListener("input", searchResources);

  // Sticky Notes
  const saveNoteBtn = document.getElementById("saveNoteBtn");
  if (saveNoteBtn) saveNoteBtn.addEventListener("click", addStickyNote);

  // Today/History Tabs
  const todayTabBtn = document.getElementById("todayTabBtn");
  const historyTabBtn = document.getElementById("historyTabBtn");

  if (todayTabBtn)
    todayTabBtn.addEventListener("click", () => switchOverviewTab("today"));
  if (historyTabBtn)
    historyTabBtn.addEventListener("click", () => switchOverviewTab("history"));

  // Chart Tabs
  const chartTabs = document.querySelectorAll(".chart-tab");
  chartTabs.forEach((tab) => {
    tab.addEventListener("click", switchChartTab);
  });

  // Initial renders
  renderSubjects();
  renderResources();
  renderStickyNotes();
  renderTodayOverview();
  renderStudyCharts();
}

function loadStudyData(userData) {
  console.log("📥 Loading study data from Firebase:", userData);

  ensureStudyDataStructure();

  if (userData && userData.study) {
    studyState.subjects = Array.isArray(userData.study.subjects)
      ? userData.study.subjects
      : [];
    studyState.resources = Array.isArray(userData.study.resources)
      ? userData.study.resources
      : [];
    studyState.studyHistory = Array.isArray(userData.study.studyHistory)
      ? userData.study.studyHistory
      : [];
    studyState.stickyNotes = Array.isArray(userData.study.stickyNotes)
      ? userData.study.stickyNotes
      : [];

    if (
      userData.study.pomodoro &&
      typeof userData.study.pomodoro === "object"
    ) {
      studyState.pomodoro = {
        ...studyState.pomodoro,
        ...userData.study.pomodoro,
      };
    }
  }

  ensureStudyDataStructure();

  renderSubjects();
  renderResources();
  renderStickyNotes();
  renderTodayOverview();
  renderStudyCharts();

  if (!studyState.pomodoro.isStudying) {
    studyState.pomodoro.time = studyState.pomodoro.studyMins * 60;
    studyState.pomodoro.initialTime = studyState.pomodoro.studyMins * 60;
    updateTimerDisplay();
  }
}

// ===================================
// SUBJECT MANAGEMENT
// ===================================
function addSubject() {
  ensureStudyDataStructure();

  const input = document.getElementById("newSubjectInput");
  if (!input) return;

  const name = input.value.trim();
  if (!name) {
    showCustomAlert("Vui lòng nhập tên môn học.", "warning");
    return;
  }

  if (
    studyState.subjects.some((s) => s.name.toLowerCase() === name.toLowerCase())
  ) {
    showCustomAlert("Môn học này đã tồn tại!", "warning");
    return;
  }

  const newSubject = {
    id: generateId(),
    name: name,
  };
  studyState.subjects.push(newSubject);
  input.value = "";

  renderSubjects();
  saveStudyState();
  showStudyToast("Thành công!", `Đã thêm môn học: ${name}`, "success");
}

function deleteSubject(id) {
  showCustomConfirm("Bạn có chắc chắn muốn xóa môn học này không?", () => {
    ensureStudyDataStructure();

    const subjectName =
      studyState.subjects.find((s) => s.id === id)?.name || "Môn học";
    studyState.subjects = studyState.subjects.filter((s) => s.id !== id);
    studyState.resources = studyState.resources.filter(
      (r) => r.subjectId !== id,
    );

    if (studyState.pomodoro.currentSubjectId === id) {
      resetPomodoroState();
    }

    renderSubjects();
    renderResources();
    saveStudyState();
    showStudyToast("Đã xóa", `Môn học "${subjectName}" đã được xóa`, "info");
  });
}

function renderSubjects() {
  ensureStudyDataStructure();

  const list = document.getElementById("subjectList");
  const pomodoroSelect = document.getElementById("pomodoroSubjectSelect");
  const resourceSubjectSelect = document.getElementById(
    "resourceSubjectSelect",
  );
  const subjectResourceSelect = document.getElementById(
    "subjectResourceSelect",
  );

  if (!list || !pomodoroSelect) return;

  list.innerHTML = "";
  pomodoroSelect.innerHTML = '<option value="">-- Chọn môn học --</option>';

  const dropdowns = [resourceSubjectSelect, subjectResourceSelect];
  dropdowns.forEach((select) => {
    if (select) {
      select.innerHTML = '<option value="">-- Chọn môn học --</option>';
    }
  });

  if (studyState.subjects.length === 0) {
    list.innerHTML =
      '<p class="no-data-msg">Chưa có môn học nào. Hãy thêm môn học!</p>';
    return;
  }

  studyState.subjects.forEach((subject) => {
    const li = document.createElement("li");
    li.className = "subject-item";
    li.innerHTML = `
            <div class="subject-info">
                <i class="fas fa-book"></i>
                <span>${subject.name}</span>
            </div>
            <span class="subject-item-actions">
                <button onclick="deleteSubject('${subject.id}')" title="Xóa môn học">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </span>
        `;
    list.appendChild(li);

    const pomodoroOption = document.createElement("option");
    pomodoroOption.value = subject.id;
    pomodoroOption.textContent = subject.name;
    pomodoroSelect.appendChild(pomodoroOption);

    dropdowns.forEach((select) => {
      if (select) {
        const option = document.createElement("option");
        option.value = subject.id;
        option.textContent = subject.name;
        select.appendChild(option);
      }
    });
  });

  if (studyState.pomodoro.currentSubjectId) {
    pomodoroSelect.value = studyState.pomodoro.currentSubjectId;
  }
}

// ===================================
// RESOURCES MANAGEMENT
// ===================================
function switchResourceTab(e) {
  const tab = e.target.closest(".resource-tab");
  if (!tab) return;

  document
    .querySelectorAll(".resource-tab")
    .forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");

  const tabType = tab.dataset.tab;
  document.querySelectorAll(".resource-tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(`${tabType}Resources`).classList.add("active");

  renderResources();
}

function addResource() {
  ensureStudyDataStructure();

  const activeTab = document.querySelector(".resource-tab.active").dataset.tab;

  let urlInput, nameInput, subjectSelect;

  if (activeTab === "general") {
    urlInput = document.getElementById("newGeneralResourceLink");
    nameInput = document.getElementById("newGeneralResourceName");
    subjectSelect = null;
  } else {
    urlInput = document.getElementById("newSubjectResourceLink");
    nameInput = document.getElementById("newSubjectResourceName");
    subjectSelect = document.getElementById("subjectResourceSelect");
  }

  if (!urlInput || !nameInput) {
    showCustomAlert("Không tìm thấy các trường nhập liệu!", "error");
    return;
  }

  const url = urlInput.value.trim();
  const name = nameInput.value.trim();
  const subjectId = subjectSelect ? subjectSelect.value : null;

  if (!url || !name) {
    showCustomAlert("Vui lòng nhập đủ Tên và URL tài liệu.", "error");
    return;
  }

  if (!isValidUrl(url)) {
    showCustomAlert(
      "Vui lòng nhập URL hợp lệ (bắt đầu bằng http:// hoặc https://)",
      "error",
    );
    return;
  }

  const subject = studyState.subjects.find((s) => s.id === subjectId);
  const subjectName = subject ? subject.name : "Chung";

  const newResource = {
    id: generateId(),
    url: url,
    name: name,
    subjectId: subjectId,
    subjectName: subjectName,
    type: subjectId ? "subject" : "general",
    addedAt: new Date().toISOString(),
  };

  studyState.resources.push(newResource);

  urlInput.value = "";
  nameInput.value = "";
  if (subjectSelect) subjectSelect.value = "";

  renderResources();
  saveStudyState();
  showStudyToast("Thành công!", `Đã thêm tài liệu: ${name}`, "success");
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function deleteResource(id) {
  showCustomConfirm("Bạn có chắc chắn muốn xóa tài liệu này không?", () => {
    ensureStudyDataStructure();

    const resource = studyState.resources.find((r) => r.id === id);
    studyState.resources = studyState.resources.filter((r) => r.id !== id);
    renderResources();
    saveStudyState();
    showStudyToast(
      "Đã xóa",
      `Tài liệu "${resource?.name || "Tài liệu"}" đã được xóa`,
      "info",
    );
  });
}

function searchResources() {
  ensureStudyDataStructure();

  const searchInput = document.getElementById("resourceSearchInput");
  const searchTerm = searchInput.value.toLowerCase().trim();

  const activeTab = document.querySelector(".resource-tab.active").dataset.tab;
  const resourceList = document.getElementById(`${activeTab}ResourceList`);

  if (!resourceList) return;

  resourceList.innerHTML = "";

  let filteredResources = [...studyState.resources];

  if (activeTab === "general") {
    filteredResources = filteredResources.filter((r) => !r.subjectId);
  } else if (activeTab === "subject") {
    filteredResources = filteredResources.filter((r) => r.subjectId);
  }

  if (searchTerm) {
    filteredResources = filteredResources.filter(
      (resource) =>
        resource.name.toLowerCase().includes(searchTerm) ||
        resource.url.toLowerCase().includes(searchTerm) ||
        resource.subjectName.toLowerCase().includes(searchTerm),
    );
  }

  if (filteredResources.length === 0) {
    resourceList.innerHTML =
      '<p class="no-data-msg">Không tìm thấy tài liệu phù hợp.</p>';
    return;
  }

  if (activeTab === "subject") {
    const resourcesBySubject = {};
    filteredResources.forEach((resource) => {
      const subjectKey = resource.subjectName;
      if (!resourcesBySubject[subjectKey]) {
        resourcesBySubject[subjectKey] = [];
      }
      resourcesBySubject[subjectKey].push(resource);
    });

    Object.entries(resourcesBySubject).forEach(([subjectName, resources]) => {
      const subjectSection = document.createElement("div");
      subjectSection.className = "subject-resources-section";
      subjectSection.innerHTML = `
                <h4 class="subject-resources-title">
                    <i class="fas fa-book"></i> ${subjectName}
                </h4>
                <ul class="resource-list">
                    ${resources
                      .map(
                        (resource) => `
                        <li class="resource-item">
                            <i class="fas fa-link"></i>
                            <a href="${resource.url}" target="_blank" title="${resource.url}">${resource.name}</a>
                            <button onclick="deleteResource('${resource.id}')" title="Xóa tài liệu">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </li>
                    `,
                      )
                      .join("")}
                </ul>
            `;
      resourceList.appendChild(subjectSection);
    });
  } else {
    filteredResources.forEach((resource) => {
      const li = document.createElement("li");
      li.className = "resource-item";
      li.innerHTML = `
                <i class="fas fa-link"></i>
                <a href="${resource.url}" target="_blank" title="${resource.url}">${resource.name}</a>
                <button onclick="deleteResource('${resource.id}')" title="Xóa tài liệu">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
      resourceList.appendChild(li);
    });
  }
}

function renderResources() {
  ensureStudyDataStructure();

  const searchInput = document.getElementById("resourceSearchInput");
  if (searchInput && searchInput.value.trim() !== "") {
    searchResources();
    return;
  }

  const generalList = document.getElementById("generalResourceList");
  const subjectList = document.getElementById("subjectResourceList");

  if (!generalList || !subjectList) return;

  generalList.innerHTML = "";
  subjectList.innerHTML = "";

  const generalResources = studyState.resources.filter((r) => !r.subjectId);
  const subjectResources = studyState.resources.filter((r) => r.subjectId);

  if (generalResources.length === 0) {
    generalList.innerHTML =
      '<p class="no-data-msg">Chưa có tài liệu chung nào.</p>';
  } else {
    generalResources.forEach((resource) => {
      const li = document.createElement("li");
      li.className = "resource-item";
      li.innerHTML = `
                <i class="fas fa-link"></i>
                <a href="${resource.url}" target="_blank" title="${resource.url}">${resource.name}</a>
                <button onclick="deleteResource('${resource.id}')" title="Xóa tài liệu">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
      generalList.appendChild(li);
    });
  }

  if (subjectResources.length === 0) {
    subjectList.innerHTML =
      '<p class="no-data-msg">Chưa có tài liệu theo môn học nào.</p>';
  } else {
    const resourcesBySubject = {};
    subjectResources.forEach((resource) => {
      const subjectKey = resource.subjectName;
      if (!resourcesBySubject[subjectKey]) {
        resourcesBySubject[subjectKey] = [];
      }
      resourcesBySubject[subjectKey].push(resource);
    });

    Object.entries(resourcesBySubject).forEach(([subjectName, resources]) => {
      const subjectSection = document.createElement("div");
      subjectSection.className = "subject-resources-section";
      subjectSection.innerHTML = `
                <h4 class="subject-resources-title">
                    <i class="fas fa-book"></i> ${subjectName}
                </h4>
                <ul class="resource-list">
                    ${resources
                      .map(
                        (resource) => `
                        <li class="resource-item">
                            <i class="fas fa-link"></i>
                            <a href="${resource.url}" target="_blank" title="${resource.url}">${resource.name}</a>
                            <button onclick="deleteResource('${resource.id}')" title="Xóa tài liệu">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </li>
                    `,
                      )
                      .join("")}
                </ul>
            `;
      subjectList.appendChild(subjectSection);
    });
  }
}

// ===================================
// STICKY NOTES - CẢI TIẾN HOÀN TOÀN
// ===================================
function addStickyNote() {
  ensureStudyDataStructure();

  if (studyState.stickyNotes.length >= 8) {
    showCustomAlert(
      "Đã đạt tối đa 8 tờ ghi chú! Vui lòng xóa bớt để thêm mới.",
      "warning",
    );
    return;
  }

  const titleInput = document.getElementById("newNoteTitle");
  const contentInput = document.getElementById("newNoteContent");
  const tagsInput = document.getElementById("newNoteTags");
  const saveBtn = document.getElementById("saveNoteBtn");

  if (!titleInput || !contentInput || !saveBtn) return;

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const tagsText = tagsInput ? tagsInput.value.trim() : "";

  if (!title && !content) {
    showCustomAlert(
      "Vui lòng nhập ít nhất tiêu đề hoặc nội dung ghi chú.",
      "warning",
    );
    return;
  }

  const originalText = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG THÊM...';
  saveBtn.disabled = true;

  setTimeout(() => {
    const colors = [
      "#fff9c4",
      "#c8e6c9",
      "#bbdefb",
      "#f8bbd0",
      "#e1bee7",
      "#ffecb3",
      "#c5e1a5",
      "#90caf9",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Parse tags
    const tags = tagsText
      ? tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [];

    const newNote = {
      id: generateId(),
      title: title || "Ghi chú",
      content: content,
      tags: tags,
      color: randomColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    studyState.stickyNotes.unshift(newNote);

    titleInput.value = "";
    contentInput.value = "";
    if (tagsInput) tagsInput.value = "";

    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;

    renderStickyNotes();
    saveStudyState();
    showStudyToast("Thành công!", "Đã thêm ghi chú mới", "success");
  }, 500);
}

function deleteStickyNote(id) {
  showCustomConfirm("Bạn có chắc chắn muốn xóa ghi chú này không?", () => {
    ensureStudyDataStructure();

    studyState.stickyNotes = studyState.stickyNotes.filter(
      (note) => note.id !== id,
    );
    renderStickyNotes();
    saveStudyState();
    showStudyToast("Đã xóa", "Ghi chú đã được xóa", "info");
  });
}

function editStickyNote(id) {
  ensureStudyDataStructure();

  const note = studyState.stickyNotes.find((n) => n.id === id);
  if (!note) return;

  showEditNoteModal(note);
}

function changeNoteColor(id) {
  ensureStudyDataStructure();

  const note = studyState.stickyNotes.find((n) => n.id === id);
  if (!note) return;

  const colors = [
    "#fff9c4",
    "#c8e6c9",
    "#bbdefb",
    "#f8bbd0",
    "#e1bee7",
    "#ffecb3",
    "#c5e1a5",
    "#90caf9",
  ];
  const currentIndex = colors.indexOf(note.color);
  const nextIndex = (currentIndex + 1) % colors.length;

  note.color = colors[nextIndex];
  note.updatedAt = new Date().toISOString();
  renderStickyNotes();
  saveStudyState();
}

function showEditNoteModal(note) {
  const modal = document.getElementById("editNoteModal");
  const titleInput = document.getElementById("editNoteTitle");
  const contentInput = document.getElementById("editNoteContent");
  const tagsInput = document.getElementById("editNoteTags");

  if (!modal || !titleInput || !contentInput) return;

  titleInput.value = note.title || "";
  contentInput.value = note.content || "";
  if (tagsInput) {
    tagsInput.value = note.tags ? note.tags.join(", ") : "";
  }

  modal.style.display = "flex";

  const saveHandler = () => {
    const newTitle = titleInput.value.trim();
    const newContent = contentInput.value.trim();
    const newTagsText = tagsInput ? tagsInput.value.trim() : "";

    if (!newTitle && !newContent) {
      showCustomAlert(
        "Vui lòng nhập ít nhất tiêu đề hoặc nội dung.",
        "warning",
      );
      return;
    }

    const newTags = newTagsText
      ? newTagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [];

    note.title = newTitle || "Ghi chú";
    note.content = newContent;
    note.tags = newTags;
    note.updatedAt = new Date().toISOString();

    renderStickyNotes();
    saveStudyState();
    showStudyToast("Thành công!", "Ghi chú đã được cập nhật", "success");

    modal.style.display = "none";
    document
      .getElementById("saveNoteEdit")
      .removeEventListener("click", saveHandler);
    document
      .getElementById("cancelNoteEdit")
      .removeEventListener("click", cancelHandler);
  };

  const cancelHandler = () => {
    modal.style.display = "none";
    document
      .getElementById("saveNoteEdit")
      .removeEventListener("click", saveHandler);
    document
      .getElementById("cancelNoteEdit")
      .removeEventListener("click", cancelHandler);
  };

  document
    .getElementById("saveNoteEdit")
    .addEventListener("click", saveHandler);
  document
    .getElementById("cancelNoteEdit")
    .addEventListener("click", cancelHandler);

  // Close modal when clicking X
  const closeBtn = modal.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.onclick = cancelHandler;
  }
}

function renderStickyNotes() {
  ensureStudyDataStructure();

  const container = document.getElementById("stickyNotesContainer");
  const counter = document.getElementById("notesCounter");

  if (!container) return;

  container.innerHTML = "";

  if (counter) {
    counter.textContent = `${studyState.stickyNotes.length}/8`;
  }

  if (studyState.stickyNotes.length === 0) {
    container.innerHTML = `
            <div class="no-notes-message">
                <i class="fas fa-sticky-note"></i>
                <p>Chưa có ghi chú nào</p>
                <small>Thêm ghi chú đầu tiên của bạn!</small>
            </div>
        `;
    return;
  }

  studyState.stickyNotes.forEach((note) => {
    const noteElement = document.createElement("div");
    noteElement.className = "sticky-note-item";
    noteElement.style.backgroundColor = note.color;

    // Render tags
    let tagsHTML = "";
    if (note.tags && note.tags.length > 0) {
      tagsHTML = `
                <div class="sticky-note-tags">
                    ${note.tags.map((tag) => `<span class="note-tag">${tag}</span>`).join("")}
                </div>
            `;
    }

    noteElement.innerHTML = `
            <div class="sticky-note-title">${note.title || "Ghi chú"}</div>
            ${note.content ? `<div class="sticky-note-content">${note.content}</div>` : ""}
            ${tagsHTML}
            <div class="sticky-note-footer">
                <div class="sticky-note-date">
                    ${new Date(note.updatedAt).toLocaleDateString("vi-VN")}
                </div>
                <div class="sticky-note-actions">
                    <button onclick="editStickyNote('${note.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="changeNoteColor('${note.id}')" title="Đổi màu">
                        <i class="fas fa-palette"></i>
                    </button>
                    <button onclick="deleteStickyNote('${note.id}')" title="Xóa">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    container.appendChild(noteElement);
  });
}

// ===================================
// STUDY SESSIONS MANAGEMENT
// ===================================
function saveStudySession(
  subjectId,
  durationMins,
  startTime,
  endTime,
  rating = null,
  notes = "",
) {
  ensureStudyDataStructure();

  const today = getToday();
  const subject = studyState.subjects.find((s) => s.id === subjectId);

  const session = {
    id: generateId(),
    date: today,
    subjectId: subjectId,
    subjectName: subject ? subject.name : "Unknown",
    durationMins: durationMins,
    startTime: startTime,
    endTime: endTime,
    rating: rating,
    notes: notes,
    timestamp: new Date().toISOString(),
  };

  studyState.studyHistory.unshift(session);

  renderTodayOverview();
  renderStudyCharts();
  saveStudyState();

  console.log("✅ Đã lưu phiên học:", session);
  return session;
}

function deleteStudySession(sessionId) {
  showCustomConfirm("Bạn có chắc chắn muốn xóa phiên học này không?", () => {
    ensureStudyDataStructure();

    const session = studyState.studyHistory.find((s) => s.id === sessionId);
    studyState.studyHistory = studyState.studyHistory.filter(
      (session) => session.id !== sessionId,
    );
    renderTodayOverview();
    renderStudyCharts();
    saveStudyState();
    showStudyToast(
      "Đã xóa",
      `Phiên học ${session?.subjectName || ""} đã được xóa`,
      "info",
    );
  });
}

function showRatingModal(sessionId) {
  ensureStudyDataStructure();

  const session = studyState.studyHistory.find((s) => s.id === sessionId);
  if (!session) return;

  const modal = document.getElementById("ratingModal");
  const starsContainer = document.getElementById("ratingStars");
  const notesInput = document.getElementById("ratingNotes");

  if (!modal || !starsContainer || !notesInput) return;

  notesInput.value = session.notes || "";

  starsContainer.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.className = `rating-star ${i <= (session.rating || 0) ? "active" : ""}`;
    star.innerHTML = '<i class="fas fa-star"></i>';
    star.dataset.rating = i;
    star.addEventListener("click", () => setRating(i));
    starsContainer.appendChild(star);
  }

  modal.style.display = "flex";

  let currentRating = session.rating || 0;

  function setRating(rating) {
    currentRating = rating;
    starsContainer.querySelectorAll(".rating-star").forEach((star, index) => {
      star.classList.toggle("active", index < rating);
    });
  }

  const saveHandler = () => {
    session.rating = currentRating;
    session.notes = notesInput.value.trim();
    renderTodayOverview();
    saveStudyState();
    showStudyToast("Thành công!", "Đánh giá đã được cập nhật", "success");
    modal.style.display = "none";
    document
      .getElementById("saveRating")
      .removeEventListener("click", saveHandler);
    document
      .getElementById("cancelRating")
      .removeEventListener("click", cancelHandler);
  };

  const cancelHandler = () => {
    modal.style.display = "none";
    document
      .getElementById("saveRating")
      .removeEventListener("click", saveHandler);
    document
      .getElementById("cancelRating")
      .removeEventListener("click", cancelHandler);
  };

  document.getElementById("saveRating").addEventListener("click", saveHandler);
  document
    .getElementById("cancelRating")
    .addEventListener("click", cancelHandler);

  // Close modal when clicking X
  const closeBtn = modal.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.onclick = cancelHandler;
  }
}

function switchOverviewTab(tab) {
  const todayBtn = document.getElementById("todayTabBtn");
  const historyBtn = document.getElementById("historyTabBtn");
  const todayContent = document.getElementById("todayOverviewContent");
  const historyContent = document.getElementById("historyOverviewContent");

  if (todayBtn && historyBtn && todayContent && historyContent) {
    todayBtn.classList.toggle("active", tab === "today");
    historyBtn.classList.toggle("active", tab === "history");
    todayContent.classList.toggle("active", tab === "today");
    historyContent.classList.toggle("active", tab === "history");
  }

  renderTodayOverview();
}

function renderTodayOverview() {
  ensureStudyDataStructure();

  const todayContent = document.getElementById("todayOverviewContent");
  const historyContent = document.getElementById("historyOverviewContent");

  if (!todayContent || !historyContent) return;

  const today = getToday();
  const todaySessions = studyState.studyHistory.filter(
    (session) => session.date === today,
  );
  const historySessions = studyState.studyHistory.filter(
    (session) => session.date !== today,
  );

  if (todaySessions.length === 0) {
    todayContent.innerHTML = `
            <div class="overview-empty">
                <i class="fas fa-book-open"></i>
                <p>Hôm nay bạn chưa học gì cả.</p>
                <small>Hãy bắt đầu một phiên học mới!</small>
            </div>
        `;
  } else {
    const totalMins = todaySessions.reduce(
      (sum, session) => sum + session.durationMins,
      0,
    );
    const subjectsToday = [...new Set(todaySessions.map((s) => s.subjectName))];

    let sessionsHTML = "";
    todaySessions.forEach((session) => {
      const stars = session.rating
        ? "★".repeat(session.rating) + "☆".repeat(5 - session.rating)
        : '<span class="no-rating">Chưa đánh giá</span>';

      sessionsHTML += `
                <div class="study-session-card">
                    <div class="session-header">
                        <div class="session-info">
                            <h4><i class="fas fa-book"></i> ${session.subjectName}</h4>
                            <span class="session-time">
                                <i class="far fa-clock"></i> ${formatTimeRange(session.startTime, session.endTime)}
                            </span>
                        </div>
                        <div class="session-duration">
                            <i class="fas fa-hourglass-half"></i> ${formatDuration(session.durationMins)}
                        </div>
                    </div>
                    <div class="session-details">
                        <div class="session-rating" onclick="showRatingModal('${session.id}')">
                            <span class="stars">${stars}</span>
                            <i class="fas fa-edit edit-rating"></i>
                        </div>
                        ${
                          session.notes
                            ? `
                            <div class="session-notes">
                                <i class="fas fa-sticky-note"></i> ${session.notes}
                            </div>
                        `
                            : ""
                        }
                    </div>
                    <button class="session-delete-btn" onclick="deleteStudySession('${session.id}')" title="Xóa phiên học">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
    });

    todayContent.innerHTML = `
            <div class="overview-stats">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${formatDuration(totalMins)}</h3>
                        <span>Tổng thời gian</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${subjectsToday.length}</h3>
                        <span>Môn học</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-list"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${todaySessions.length}</h3>
                        <span>Phiên học</span>
                    </div>
                </div>
            </div>
            <div class="sessions-list">
                ${sessionsHTML}
            </div>
        `;
  }

  if (historySessions.length === 0) {
    historyContent.innerHTML = `
            <div class="overview-empty">
                <i class="fas fa-history"></i>
                <p>Chưa có lịch sử học tập nào.</p>
                <small>Các phiên học của bạn sẽ được lưu ở đây!</small>
            </div>
        `;
  } else {
    const historyByDate = {};
    historySessions.forEach((session) => {
      if (!historyByDate[session.date]) {
        historyByDate[session.date] = [];
      }
      historyByDate[session.date].push(session);
    });

    let historyHTML = "";
    Object.entries(historyByDate).forEach(([date, sessions]) => {
      const totalMins = sessions.reduce(
        (sum, session) => sum + session.durationMins,
        0,
      );
      const subjects = [...new Set(sessions.map((s) => s.subjectName))];

      let dateSessionsHTML = "";
      sessions.forEach((session) => {
        const stars = session.rating
          ? "★".repeat(session.rating) + "☆".repeat(5 - session.rating)
          : '<span class="no-rating">Chưa đánh giá</span>';

        dateSessionsHTML += `
                    <div class="study-session-card">
                        <div class="session-header">
                            <div class="session-info">
                                <h4><i class="fas fa-book"></i> ${session.subjectName}</h4>
                                <span class="session-time">
                                    <i class="far fa-clock"></i> ${formatTimeRange(session.startTime, session.endTime)}
                                </span>
                            </div>
                            <div class="session-duration">
                                <i class="fas fa-hourglass-half"></i> ${formatDuration(session.durationMins)}
                            </div>
                        </div>
                        <div class="session-details">
                            <div class="session-rating" onclick="showRatingModal('${session.id}')">
                                <span class="stars">${stars}</span>
                                <i class="fas fa-edit edit-rating"></i>
                            </div>
                            ${
                              session.notes
                                ? `
                                <div class="session-notes">
                                    <i class="fas fa-sticky-note"></i> ${session.notes}
                                </div>
                            `
                                : ""
                            }
                        </div>
                        <button class="session-delete-btn" onclick="deleteStudySession('${session.id}')" title="Xóa phiên học">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
      });

      historyHTML += `
                <div class="history-date-section">
                    <div class="history-date-header">
                        <h3><i class="far fa-calendar"></i> ${formatDateDisplay(date)}</h3>
                        <div class="date-stats">
                            <span><i class="fas fa-list"></i> ${sessions.length} phiên</span>
                            <span>•</span>
                            <span><i class="fas fa-clock"></i> ${formatDuration(totalMins)}</span>
                            <span>•</span>
                            <span><i class="fas fa-book"></i> ${subjects.length} môn</span>
                        </div>
                    </div>
                    <div class="date-sessions">
                        ${dateSessionsHTML}
                    </div>
                </div>
            `;
    });

    historyContent.innerHTML = historyHTML;
  }
}

// ===================================
// STUDY CHARTS - ĐÃ SỬA BAR HEIGHT
// ===================================
function switchChartTab(e) {
  const tab = e.target.closest(".chart-tab");
  if (!tab) return;

  document
    .querySelectorAll(".chart-tab")
    .forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");

  const chartType = tab.dataset.chart;
  document.querySelectorAll(".chart-container").forEach((chart) => {
    chart.classList.remove("active");
  });
  document.getElementById(`${chartType}Chart`).classList.add("active");

  renderStudyCharts();
}

function renderStudyCharts() {
  ensureStudyDataStructure();

  renderDailyChart();
  renderMonthlyChart();
  renderYearlyChart();
}

function renderDailyChart() {
  const container = document.getElementById("dailyChart");
  if (!container) return;

  const last7Days = getLastNDays(7);
  const data = last7Days.map((day) => {
    const daySessions = studyState.studyHistory.filter(
      (session) => session.date === day,
    );
    const totalMins = daySessions.reduce(
      (sum, session) => sum + session.durationMins,
      0,
    );

    return {
      date: day,
      label: new Date(day + "T00:00:00").toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
      }),
      value: totalMins,
    };
  });

  container.innerHTML = createBarChart(data, "Thời gian học (phút)");
}

function renderMonthlyChart() {
  const container = document.getElementById("monthlyChart");
  if (!container) return;

  const last6Months = getLastNMonths(6);
  const data = last6Months.map((month) => {
    const monthData = getStudyTimeForMonth(month.year, month.month);
    return {
      date: `${month.year}-${month.month}`,
      label: `T${month.month}/${month.year.toString().slice(2)}`,
      value: monthData,
    };
  });

  container.innerHTML = createBarChart(data, "Thời gian học (giờ)", true);
}

function renderYearlyChart() {
  const container = document.getElementById("yearlyChart");
  if (!container) return;

  const currentYear = new Date().getFullYear();
  const data = [];

  for (let month = 1; month <= 12; month++) {
    const monthData = getStudyTimeForMonth(currentYear, month);
    data.push({
      date: `${currentYear}-${month}`,
      label: `T${month}`,
      value: monthData,
    });
  }

  container.innerHTML = createBarChart(data, "Thời gian học (giờ)", true);
}

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(formatDate(date));
  }
  return days;
}

function getLastNMonths(n) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }
  return months;
}

function getStudyTimeForMonth(year, month) {
  let total = 0;
  studyState.studyHistory.forEach((session) => {
    const dateObj = new Date(session.date + "T00:00:00");
    if (dateObj.getFullYear() === year && dateObj.getMonth() + 1 === month) {
      total += session.durationMins;
    }
  });
  return Math.round(total / 60);
}

function createBarChart(data, label, convertToHours = false) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return `
        <div class="chart-bars-container">
            ${data
              .map((item) => {
                // TÍNH CHIỀU CAO THỰC TẾ DỰA TRÊN GIÁ TRỊ
                const heightPercentage = (item.value / maxValue) * 100;
                const displayValue = convertToHours
                  ? `${item.value}h`
                  : `${item.value}p`;

                return `
                    <div class="chart-bar">
                        <div class="bar-value">${displayValue}</div>
                        <div class="bar-container" style="height: ${heightPercentage}%">
                            <div class="bar-fill" style="height: 100%"></div>
                        </div>
                        <div class="bar-label">${item.label}</div>
                    </div>
                `;
              })
              .join("")}
        </div>
    `;
}

// ===================================
// POMODORO TIMER - VÒNG TRÒN FILL
// ===================================
function updateTimerDisplay() {
  const display = document.getElementById("timerDisplay");
  const typeDisplay = document.getElementById("sessionType");
  const progressCircle = document.querySelector(".progress-ring-circle");

  if (!display || !typeDisplay) return;

  display.textContent = formatTime(studyState.pomodoro.time);

  // Update session type text
  if (studyState.pomodoro.isStudying) {
    typeDisplay.innerHTML = studyState.pomodoro.isBreak
      ? '<i class="fas fa-coffee"></i> Thời gian nghỉ'
      : '<i class="fas fa-graduation-cap"></i> Đang học tập';
  } else {
    typeDisplay.innerHTML =
      '<i class="fas fa-play-circle"></i> Sẵn sàng học tập';
  }

  // CẬP NHẬT VÒNG TRÒN - FILL DẦN THEO THỜI GIAN
  if (progressCircle && studyState.pomodoro.initialTime > 0) {
    const circumference = 2 * Math.PI * 90; // 2 * PI * r (r=90)
    const progress =
      (studyState.pomodoro.initialTime - studyState.pomodoro.time) /
      studyState.pomodoro.initialTime;
    const offset = circumference - progress * circumference;

    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;
  }

  // Update page title
  document.title = studyState.pomodoro.isStudying
    ? `(${formatTime(studyState.pomodoro.time)}) - Study Tracker`
    : "Study Tracker";
}

function startNewSession() {
  const select = document.getElementById("pomodoroSubjectSelect");
  if (!select) return;

  const subjectId = select.value;

  if (!subjectId) {
    showCustomAlert("Vui lòng chọn môn học để bắt đầu!", "error");
    return;
  }

  if (studyState.pomodoro.isStudying) {
    showCustomAlert(
      "Phiên học đang chạy, vui lòng tạm dừng hoặc kết thúc trước!",
      "warning",
    );
    return;
  }

  studyState.pomodoro.currentSubjectId = subjectId;
  studyState.pomodoro.isStudying = true;
  studyState.pomodoro.isBreak = false;
  studyState.pomodoro.startTime = new Date().toISOString();
  studyState.pomodoro.elapsedSeconds = 0;

  const studyTimeSelect = document.getElementById("studyTimeSelect");
  const breakTimeSelect = document.getElementById("breakTimeSelect");

  if (studyTimeSelect)
    studyState.pomodoro.studyMins = parseInt(studyTimeSelect.value);
  if (breakTimeSelect)
    studyState.pomodoro.breakMins = parseInt(breakTimeSelect.value);

  studyState.pomodoro.time = studyState.pomodoro.studyMins * 60;
  studyState.pomodoro.initialTime = studyState.pomodoro.studyMins * 60;

  clearInterval(studyState.pomodoro.intervalId);
  studyState.pomodoro.intervalId = setInterval(tick, 1000);

  updateTimerUI();

  const subject = studyState.subjects.find((s) => s.id === subjectId);
  showStudyToast(
    "Phiên học bắt đầu!",
    `Học ${subject?.name || "môn học"} - ${studyState.pomodoro.studyMins} phút`,
    "info",
  );
}

function toggleTimer() {
  if (!studyState.pomodoro.currentSubjectId) return;

  const toggleBtn = document.getElementById("toggleTimerBtn");
  if (!toggleBtn) return;

  if (studyState.pomodoro.isStudying) {
    clearInterval(studyState.pomodoro.intervalId);
    studyState.pomodoro.isStudying = false;
    studyState.pomodoro.elapsedSeconds +=
      studyState.pomodoro.initialTime - studyState.pomodoro.time;
    toggleBtn.innerHTML = '<i class="fas fa-play"></i> TIẾP TỤC';
    showStudyToast("Tạm dừng", "Timer đã được tạm dừng", "info");
  } else {
    studyState.pomodoro.isStudying = true;
    studyState.pomodoro.intervalId = setInterval(tick, 1000);
    toggleBtn.innerHTML = '<i class="fas fa-pause"></i> TẠM DỪNG';
    showStudyToast("Tiếp tục", "Timer đã được tiếp tục", "success");
  }
  updateTimerDisplay();
}

function handleResetTimer() {
  if (!studyState.pomodoro.currentSubjectId) return;

  showCustomConfirm("Bạn có muốn KẾT THÚC phiên học hiện tại không?", () => {
    clearInterval(studyState.pomodoro.intervalId);

    const endTime = new Date().toISOString();
    const actualDurationMins = Math.ceil(
      studyState.pomodoro.elapsedSeconds / 60,
    );

    if (actualDurationMins > 0) {
      const subject = studyState.subjects.find(
        (s) => s.id === studyState.pomodoro.currentSubjectId,
      );
      saveStudySession(
        studyState.pomodoro.currentSubjectId,
        actualDurationMins,
        studyState.pomodoro.startTime,
        endTime,
      );
      showStudyToast(
        "Hoàn thành!",
        `Đã lưu phiên học ${subject?.name || ""} - ${actualDurationMins} phút`,
        "success",
      );
    } else {
      showStudyToast("Đã hủy", "Phiên học đã được hủy", "info");
    }

    resetPomodoroState();
  });
}

function tick() {
  studyState.pomodoro.time--;
  studyState.pomodoro.elapsedSeconds++;
  updateTimerDisplay();

  if (studyState.pomodoro.time <= 0) {
    clearInterval(studyState.pomodoro.intervalId);

    const endTime = new Date().toISOString();
    const actualDurationMins = Math.ceil(
      studyState.pomodoro.elapsedSeconds / 60,
    );

    if (!studyState.pomodoro.isBreak) {
      const subject = studyState.subjects.find(
        (s) => s.id === studyState.pomodoro.currentSubjectId,
      );
      saveStudySession(
        studyState.pomodoro.currentSubjectId,
        actualDurationMins,
        studyState.pomodoro.startTime,
        endTime,
      );

      showStudyToast(
        "Hoàn thành phiên học!",
        `Bạn đã học ${subject?.name || ""} - ${actualDurationMins} phút`,
        "success",
      );

      if (studyState.pomodoro.autoBreak) {
        setTimeout(() => startBreak(), 1000);
      } else {
        studyState.pomodoro.isStudying = false;
        updateTimerUI();
        showStudyToast(
          "Thời gian học hết",
          "Bạn có thể bắt đầu phiên mới!",
          "info",
        );
      }
    } else {
      showStudyToast("Hết giờ nghỉ!", "Quay lại học thôi! 📚", "warning");
      resetPomodoroStateForNext();
    }
  }
}

function startBreak() {
  studyState.pomodoro.isBreak = true;
  studyState.pomodoro.time = studyState.pomodoro.breakMins * 60;
  studyState.pomodoro.initialTime = studyState.pomodoro.breakMins * 60;
  studyState.pomodoro.startTime = new Date().toISOString();
  studyState.pomodoro.elapsedSeconds = 0;

  studyState.pomodoro.intervalId = setInterval(tick, 1000);
  studyState.pomodoro.isStudying = true;

  updateTimerUI();
  showStudyToast(
    "Thời gian nghỉ!",
    `Nghỉ ngơi ${studyState.pomodoro.breakMins} phút nhé! ☕`,
    "info",
  );
}

function updateTimerUI() {
  const toggleBtn = document.getElementById("toggleTimerBtn");
  const resetBtn = document.getElementById("resetTimerBtn");
  const startBtn = document.getElementById("startTimerBtn");
  const select = document.getElementById("pomodoroSubjectSelect");
  const studyTimeSelect = document.getElementById("studyTimeSelect");
  const breakTimeSelect = document.getElementById("breakTimeSelect");

  if (studyState.pomodoro.isStudying) {
    if (toggleBtn) {
      toggleBtn.innerHTML = studyState.pomodoro.isBreak
        ? '<i class="fas fa-pause"></i> TẠM DỪNG NGHỈ'
        : '<i class="fas fa-pause"></i> TẠM DỪNG HỌC';
      toggleBtn.disabled = false;
    }
    if (resetBtn) resetBtn.disabled = false;
    if (startBtn) startBtn.disabled = true;
    if (select) select.disabled = true;
    if (studyTimeSelect) studyTimeSelect.disabled = true;
    if (breakTimeSelect) breakTimeSelect.disabled = true;
  } else {
    if (toggleBtn) {
      toggleBtn.innerHTML = studyState.pomodoro.isBreak
        ? '<i class="fas fa-play"></i> BẮT ĐẦU NGHỈ'
        : '<i class="fas fa-play"></i> TIẾP TỤC HỌC';
      toggleBtn.disabled = !studyState.pomodoro.currentSubjectId;
    }
    if (resetBtn) resetBtn.disabled = !studyState.pomodoro.currentSubjectId;
    if (startBtn)
      startBtn.disabled = studyState.pomodoro.currentSubjectId !== null;
    if (select) select.disabled = false;
    if (studyTimeSelect) studyTimeSelect.disabled = false;
    if (breakTimeSelect) breakTimeSelect.disabled = false;
  }
}

function resetPomodoroState() {
  studyState.pomodoro = {
    ...studyState.pomodoro,
    currentSubjectId: null,
    isStudying: false,
    isBreak: false,
    time: studyState.pomodoro.studyMins * 60,
    initialTime: studyState.pomodoro.studyMins * 60,
    intervalId: null,
    sessionLogs: [],
    startTime: null,
    elapsedSeconds: 0,
  };

  updateTimerUI();
  updateTimerDisplay();
}

function resetPomodoroStateForNext() {
  studyState.pomodoro.isStudying = false;
  studyState.pomodoro.isBreak = false;
  studyState.pomodoro.time = studyState.pomodoro.studyMins * 60;
  studyState.pomodoro.initialTime = studyState.pomodoro.studyMins * 60;
  studyState.pomodoro.intervalId = null;
  studyState.pomodoro.startTime = null;
  studyState.pomodoro.elapsedSeconds = 0;

  updateTimerUI();
}

// ===================================
// FIREBASE SAVING
// ===================================
function saveStudyState() {
  ensureStudyDataStructure();

  const dataToSave = {
    subjects: studyState.subjects,
    resources: studyState.resources,
    studyHistory: studyState.studyHistory,
    stickyNotes: studyState.stickyNotes,
    pomodoro: {
      studyMins: studyState.pomodoro.studyMins,
      breakMins: studyState.pomodoro.breakMins,
      autoBreak: studyState.pomodoro.autoBreak,
    },
  };

  if (typeof saveModuleData === "function") {
    saveModuleData("study", dataToSave);
    console.log("✅ Study data saved to Firebase");
  } else {
    console.warn("saveModuleData function not available");
    try {
      localStorage.setItem("study_backup", JSON.stringify(dataToSave));
      console.log("📦 Study data saved to localStorage as backup");
    } catch (e) {
      console.error("❌ Cannot save to localStorage:", e);
    }
  }
}

// ===================================
// GLOBAL FUNCTION DECLARATIONS
// ===================================
window.initStudy = initStudy;
window.loadStudyData = loadStudyData;
window.addSubject = addSubject;
window.deleteSubject = deleteSubject;
window.addResource = addResource;
window.deleteResource = deleteResource;
window.searchResources = searchResources;
window.switchResourceTab = switchResourceTab;
window.addStickyNote = addStickyNote;
window.deleteStickyNote = deleteStickyNote;
window.editStickyNote = editStickyNote;
window.changeNoteColor = changeNoteColor;
window.deleteStudySession = deleteStudySession;
window.showRatingModal = showRatingModal;
window.switchOverviewTab = switchOverviewTab;
window.switchChartTab = switchChartTab;
window.startNewSession = startNewSession;
window.toggleTimer = toggleTimer;
window.handleResetTimer = handleResetTimer;
window.showStudyToast = showStudyToast;

console.log("🎉 study.js loaded successfully - COMPLETE ENHANCED VERSION");
