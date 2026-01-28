// Bucket List Module (Sử dụng biến global bucketListData từ app.js)

const MAX_ACTIVE_DREAMS = 5;

// Danh sách 108 câu truyền động lực
const MOTIVATIONAL_QUOTES = [
  "Hôm nay là một trang giấy trắng. Hãy viết lên đó câu chuyện tuyệt vời nhất! 📖",
  "Ước mơ không có deadline. Hãy cứ ước và thực hiện từng chút một 🌟",
  "Mỗi bước nhỏ đều đưa bạn đến gần hơn với ước mơ lớn 🚶‍♀️",
  "Đừng sợ thất bại. Sợ hãi thứ bạn có thể không bao giờ thử 😊",
  "Cuộc sống là những chuyến phiêu lưu. Hãy dũng cảm bước đi 🗺️",
  "Bạn mạnh mẽ hơn bạn nghĩ. Mạnh mẽ hơn mọi trở ngại 💪",
  "Hạnh phúc thực sự đến từ việc theo đuổi đam mê, không phải sở hữu nó ❤️",
  "Mỗi ngày mới là một cơ hội mới để bắt đầu lại 🌅",
  "Thành công là tổng của những nỗ lực nhỏ được lặp lại mỗi ngày 📈",
  "Hãy là phiên bản tốt nhất của chính mình, không phải bản sao của ai khác 🌸",
  "Ước mơ không biến mất, trừ khi bạn từ bỏ chúng ✨",
  "Cuộc sống ngắn ngủi lắm. Đừng lãng phí thời gian sống cuộc đời của người khác ⏳",
  "Mọi thứ bạn muốn đều nằm ở vùng đất bên kia nỗi sợ hãi 🏞️",
  "Hãy sống như thể hôm nay là ngày cuối cùng 🎯",
  "Thất bại chỉ là cơ hội để bắt đầu lại một cách thông minh hơn 🔁",
  "Đam mê + Kiên trì = Không gì là không thể 🎯",
  "Cuộc sống không phải là tìm kiếm chính mình, mà là tạo ra chính mình 🎨",
  "Hãy làm những gì bạn có thể, với những gì bạn có, ở nơi bạn đang ở 🌍",
  "Thời điểm hoàn hảo không bao giờ đến. Hãy bắt đầu ngay bây giờ! ⏰",
  "Bạn xứng đáng với tất cả những điều tốt đẹp mà cuộc sống mang lại 🌈",
  "Chỉ có một cách để làm việc lớn, đó là yêu điều bạn làm. 💖",
  "Tương lai thuộc về những người tin vào vẻ đẹp của ước mơ. 🦋",
  "Đừng đếm những ngày bạn sống, hãy làm cho những ngày bạn sống có ý nghĩa. 💡",
  "Hãy theo đuổi tầm nhìn, không phải tiền bạc. Tiền bạc sẽ theo đuổi bạn. 💰",
  "Sự khác biệt giữa người thường và người thành công là sự kiên trì. 🦁",
  "Hãy nhớ rằng không đạt được những gì bạn muốn đôi khi lại là một điều may mắn. 🍀",
  "Sự sáng tạo là trí thông minh đang vui đùa. 🧠",
  "Hành động là chìa khóa cơ bản dẫn đến mọi thành công. 🔑",
  "Cách tốt nhất để dự đoán tương lai là tạo ra nó. 🛠️",
  "Đừng chờ đợi cơ hội. Hãy tạo ra nó. 🔨",
  "Sự hoàn hảo không phải là nhỏ bé, mà là kiên trì trong những việc nhỏ. 🔎",
  "Không bao giờ là quá muộn để trở thành người bạn muốn. 🌱",
  "Nếu bạn có thể mơ thấy nó, bạn có thể làm được. 🚀",
  "Hãy thay đổi suy nghĩ, thay đổi thế giới. 🌐",
  "Cuộc sống bắt đầu khi bạn bước ra khỏi vùng an toàn. 🚪",
  "Mục tiêu là những ước mơ có thời hạn. 🗓️",
  "Sức mạnh không đến từ chiến thắng. Đấu tranh tạo ra sức mạnh của bạn. 🥊",
  "Sống chậm lại, và tận hưởng khoảnh khắc. ☕",
  "Điều tuyệt vời nhất trong cuộc sống là tìm thấy chính mình. 🧘‍♀️",
  "Hãy luôn tò mò. Tò mò là chìa khóa thành công. 🗝️",
  "Hãy là sự thay đổi mà bạn muốn thấy trên thế giới. 🕊️",
  "Thử thách là điều làm cho cuộc sống thú vị; vượt qua chúng là điều làm cho cuộc sống có ý nghĩa. ⛰️",
  "Học hỏi từ hôm qua, sống cho hôm nay, hy vọng vào ngày mai. 📚",
  "Mọi bí mật đều nằm ở sự nỗ lực. 汗",
  "Lòng dũng cảm là khả năng hành động mặc dù sợ hãi. 🛡️",
  "Hãy tận hưởng cuộc hành trình, không chỉ đích đến. 🛤️",
  "Hãy tử tế, vì mọi người bạn gặp đều đang chiến đấu một trận chiến khó khăn. 😇",
  "Điều không giết chết bạn sẽ làm bạn mạnh mẽ hơn. 🔥",
  "Bạn không thể bắt đầu chương tiếp theo của cuộc đời mình nếu bạn cứ đọc lại chương cũ. 🔄",
  "Để có được điều bạn chưa từng có, bạn phải làm điều bạn chưa từng làm. 💫",
  "Đừng để hôm qua chiếm hết hôm nay. 🛑",
  "Đừng bao giờ từ bỏ một ước mơ chỉ vì thời gian cần thiết để đạt được nó. ⏳",
  "Sống là dám. Dám là hành động. Hành động là thành công. 🌟",
  "Thành công không phải là cuối cùng, thất bại không phải là chí mạng. Sự can đảm để tiếp tục mới là quan trọng. 🏃‍♂️",
  "Bắt đầu ngay bây giờ. Đừng chờ đợi. ⏳",
  "Chính thái độ của bạn, chứ không phải năng lực, quyết định độ cao của bạn. 🎈",
  "Sống hết mình, yêu thương hết mình và không bao giờ hối tiếc. ❤️",
  "Đừng sợ đi chậm, chỉ sợ đứng yên. 🐢",
  "Sự kiên nhẫn là chìa khóa. 🔑",
  "Bạn không cần phải thấy toàn bộ cầu thang, chỉ cần bước bước đầu tiên. 👣",
  "Mọi công việc đều là tự họa của người làm ra nó. Hãy vẽ nó bằng sự xuất sắc. 🖼️",
  "Không có gì là không thể với một trái tim sẵn sàng. 💖",
  "Một ngày nào đó, 'sớm thôi' sẽ trở thành 'không bao giờ'. Hành động ngay! 🏃‍♀️",
  "Thay vì đợi sóng, hãy học cách lướt sóng. 🏄‍♀️",
  "Đừng tìm kiếm hạnh phúc. Hãy tạo ra nó. ✨",
  "Hãy trân trọng những nỗ lực của bạn. Chúng đáng giá. 🏅",
  "Bạn không thể vượt đại dương nếu không có can đảm rời xa bờ. 🌊",
  "Mỗi khoảnh khắc đều là một khởi đầu mới. 🔄",
  "Hãy là ánh sáng của chính mình. 💡",
  "Kỷ luật là cầu nối giữa mục tiêu và thành tựu. 🌉",
  "Nếu muốn bay, hãy từ bỏ những thứ đang kéo bạn xuống. 🦅",
  "Không có thất bại, chỉ có những bài học. 📝",
  "Sự lạc quan là đức tin dẫn đến thành tựu. ☀️",
  "Hãy biến những vết thương thành sự khôn ngoan. 🦉",
  "Tư duy của bạn là giới hạn duy nhất. 🚧",
  "Ước mơ lớn, và dám thất bại. 🌠",
  "Hôm nay, hãy làm điều gì đó mà tương lai bạn sẽ cảm ơn. 🙏",
  "Hãy nhớ lý do tại sao bạn bắt đầu. 🤔",
  "Mỗi hơi thở là một cơ hội thứ hai. 🌬️",
  "Vẽ cuộc đời bằng màu sắc của riêng bạn. 🎨",
  "Đừng chỉ mong ước. Hãy hành động. 🚀",
  "Hãy cười lớn. Tình yêu thường xuyên. Sống trọn vẹn. 😄",
  "Sự thay đổi không bao giờ đau đớn như việc đứng yên. 🧘",
  "Tạo ra một cuộc đời mà bạn yêu thích. ❤️",
  "Chất lượng của cuộc sống không phải là may mắn, mà là sự lựa chọn. ⚖️",
  "Hãy tự tin vào hành trình của mình. 🧭",
  "Hãy biến ngày hôm nay thành kiệt tác của bạn. 🖼️",
  "Sự phát triển không phải là tự động. 💪",
  "Điều tuyệt vời nhất đang chờ bạn ở phía trước. 🔜",
  "Hãy tập trung vào nơi bạn muốn đến, không phải nơi bạn vừa rời đi. ➡️",
  "Kiên trì là bí mật của mọi thành công. 🤫",
  "Nghĩ lớn. Mơ lớn. Hành động lớn. 💡",
  "Hãy tìm ra điều khiến bạn hạnh phúc và làm điều đó. 😊",
  "Giá trị của cuộc sống nằm ở việc bạn làm gì với nó. 🌟",
  "Hãy để sự lạc quan trở thành sức mạnh. 🔋",
  "Bạn là kiến trúc sư của định mệnh mình. 🏗️",
  "Hãy bước đi với niềm tin, ngay cả khi bạn không nhìn thấy toàn bộ con đường. 🌫️",
  "Khó khăn thường chuẩn bị cho những người bình thường một số phận phi thường. 🥇",
  "Đừng chỉ tồn tại, hãy phát triển. 🌱",
  "Hãy làm việc chăm chỉ trong im lặng, để thành công nói lên tất cả. 🤫",
  "Cánh cửa tri thức luôn mở. 🚪",
  "Nếu bạn không thể làm điều lớn, hãy làm điều nhỏ với tình yêu lớn. 💗",
  "Hãy tin vào chính mình hơn bất cứ ai. 💖",
  "Mỗi ngày là một món quà. 🎁",
  "Đừng để nỗi sợ quyết định số phận bạn. 🚫",
  "Làm cho mỗi ngày có giá trị. ✨",
  "Thử thách là cơ hội. 🏆",
  "Hãy tìm ánh sáng trong chính mình. ☀️",
  "Bạn có thể làm được nhiều hơn những gì bạn nghĩ. 💡",
  "Hôm nay, hãy là người tốt hơn hôm qua. 📈",
  "Hãy yêu những gì bạn làm, và bạn sẽ không bao giờ phải làm việc. 😌",
  "Đừng bao giờ hối tiếc điều đã làm, chỉ hối tiếc điều đã không làm. 💭",
  "Chỉ cần bước tới, cánh cửa sẽ mở ra. 🚪",
];

// Biến lưu trữ ID ước mơ đang được chỉnh sửa
let currentEditingDreamId = null;

// Initialize Bucket List
function initBucketList() {
  console.log("🎯 Initializing Bucket List...");
  loadBucketListData();
  setupBucketListEventListeners();
  loadDailyMotivation();
  updateProgressCounts();
  updateQuickStats();
}

// Load Bucket List Data
function loadBucketListData(userData = null) {
  let loadedData = [];

  if (userData && Array.isArray(userData.bucketlist)) {
    loadedData = userData.bucketlist;
  } else if (typeof window.currentUser === "undefined" || !window.currentUser) {
    const backup = window.loadModuleBackup
      ? window.loadModuleBackup("bucketlist")
      : null;
    loadedData = backup && Array.isArray(backup) ? backup : [];
  }

  window.bucketListData = loadedData;

  console.log("📥 Loaded bucket list data:", window.bucketListData);
  renderBucketList();
}

// Setup Event Listeners
function setupBucketListEventListeners() {
  console.log("🔧 Setting up event listeners...");

  const addDreamBtn = document.getElementById("add-dream-btn");
  if (addDreamBtn) {
    addDreamBtn.removeEventListener("click", showAddDreamModal);
    addDreamBtn.addEventListener("click", showAddDreamModal);
    console.log("✅ Add dream button listener added");
  }

  document.querySelectorAll(".close-btn, .cancel-btn").forEach((btn) => {
    btn.removeEventListener("click", closeAllModals);
    btn.addEventListener("click", closeAllModals);
  });

  const saveDreamBtn = document.getElementById("save-dream-btn");
  if (saveDreamBtn) {
    saveDreamBtn.removeEventListener("click", saveNewDream);
    saveDreamBtn.addEventListener("click", saveNewDream);
  }

  const addStepBtn = document.getElementById("add-step-btn");
  if (addStepBtn) {
    addStepBtn.removeEventListener("click", addStepInput);
    addStepBtn.addEventListener("click", addStepInput);
  }

  const saveCompletionBtn = document.getElementById("save-completion-btn");
  if (saveCompletionBtn) {
    saveCompletionBtn.removeEventListener("click", completeDream);
    saveCompletionBtn.addEventListener("click", completeDream);
  }

  setupCategorySelection();
}

function setupCategorySelection() {
  const categoryOptions = document.querySelectorAll(".category-option");
  const categoryInput = document.getElementById("dream-category");

  categoryOptions.forEach((option) => {
    option.removeEventListener("click", handleCategoryClick);
    option.addEventListener("click", handleCategoryClick);
  });

  function handleCategoryClick() {
    categoryOptions.forEach((opt) => opt.classList.remove("selected"));
    this.classList.add("selected");

    const category = this.getAttribute("data-category");
    categoryInput.value = category;

    const stepsSection = document.getElementById("steps-section");
    const progressSection = document.getElementById("progress-section");

    if (category === "large") {
      if (stepsSection) stepsSection.style.display = "block";
      if (progressSection) progressSection.style.display = "none";
    } else {
      if (stepsSection) stepsSection.style.display = "none";
      if (progressSection) progressSection.style.display = "block";
    }
  }
}

// Show Add Dream Modal
function showAddDreamModal() {
  console.log("🎯 Opening add dream modal");
  currentEditingDreamId = null; // Reset editing mode

  const modal = document.getElementById("add-dream-modal");
  const form = document.getElementById("dream-form");
  const modalTitle = modal.querySelector(".modal-header h3");

  if (!modal || !form) {
    console.error("❌ Modal or form not found");
    return;
  }

  // Reset form
  form.reset();
  document.getElementById("dream-category").value = "";
  document.querySelectorAll(".category-option").forEach((opt) => {
    opt.classList.remove("selected");
  });
  const stepsContainer = document.getElementById("steps-container");
  if (stepsContainer) stepsContainer.innerHTML = "";
  const stepsSection = document.getElementById("steps-section");
  if (stepsSection) stepsSection.style.display = "none";
  const progressSection = document.getElementById("progress-section");
  if (progressSection) progressSection.style.display = "none";

  // Reset progress slider
  const progressSlider = document.getElementById("dream-progress-slider");
  const progressValue = document.getElementById("dream-progress-value");
  if (progressSlider) progressSlider.value = 0;
  if (progressValue) progressValue.textContent = "0";

  // Set modal title
  if (modalTitle) modalTitle.textContent = "Thêm Ước Mơ Mới";

  window.closeAllModals();
  modal.classList.add("active");
}

// Show Edit Dream Modal
function showEditDreamModal(dreamId) {
  console.log("✏️ Opening edit dream modal for:", dreamId);
  const dream = window.bucketListData.find((d) => d.id === dreamId);
  if (!dream) {
    window.showCustomAlert("Không tìm thấy ước mơ!", "error");
    return;
  }

  currentEditingDreamId = dreamId;

  const modal = document.getElementById("add-dream-modal");
  const form = document.getElementById("dream-form");
  const modalTitle = modal.querySelector(".modal-header h3");

  if (!modal || !form) return;

  // Populate form with existing data
  document.getElementById("dream-title").value = dream.title;
  document.getElementById("dream-description").value = dream.description || "";
  document.getElementById("dream-category").value = dream.category;

  // Select category option
  document.querySelectorAll(".category-option").forEach((opt) => {
    if (opt.getAttribute("data-category") === dream.category) {
      opt.classList.add("selected");
    } else {
      opt.classList.remove("selected");
    }
  });

  // Show/hide sections based on category
  const stepsSection = document.getElementById("steps-section");
  const progressSection = document.getElementById("progress-section");
  const stepsContainer = document.getElementById("steps-container");

  if (dream.category === "large") {
    if (stepsSection) stepsSection.style.display = "block";
    if (progressSection) progressSection.style.display = "none";

    // Populate steps
    if (stepsContainer && dream.steps) {
      stepsContainer.innerHTML = "";
      dream.steps.forEach((step) => {
        const stepHtml = `
                    <div class="step-input-row" data-step-id="${step.id}">
                        <input type="text" class="step-input" value="${window.escapeHtml(step.text)}" placeholder="Nhập bước thực hiện...">
                        <button type="button" class="remove-step-btn" onclick="removeStep('${step.id}')">
                            ×
                        </button>
                    </div>
                `;
        stepsContainer.insertAdjacentHTML("beforeend", stepHtml);
      });
    }
  } else {
    if (stepsSection) stepsSection.style.display = "none";
    if (progressSection) progressSection.style.display = "block";

    // Set progress slider
    const progressSlider = document.getElementById("dream-progress-slider");
    const progressValue = document.getElementById("dream-progress-value");
    const progressPercent = Math.round((dream.progress || 0) * 100);
    if (progressSlider) progressSlider.value = progressPercent;
    if (progressValue) progressValue.textContent = progressPercent;
  }

  // Set status
  const statusRadio = document.querySelector(
    `input[name="status"][value="${dream.status}"]`,
  );
  if (statusRadio) statusRadio.checked = true;

  // Set modal title
  if (modalTitle) modalTitle.textContent = "Chỉnh Sửa Ước Mơ";

  window.closeAllModals();
  modal.classList.add("active");
}

// Add Step Input
function addStepInput() {
  const stepsContainer = document.getElementById("steps-container");
  if (!stepsContainer) return;

  const stepId = window.generateId();

  const stepHtml = `
        <div class="step-input-row" data-step-id="${stepId}">
            <input type="text" class="step-input" placeholder="Nhập bước thực hiện...">
            <button type="button" class="remove-step-btn" onclick="removeStep('${stepId}')">
                ×
            </button>
        </div>
    `;

  stepsContainer.insertAdjacentHTML("beforeend", stepHtml);
}

// Remove Step
function removeStep(stepId) {
  const stepRow = document.querySelector(`[data-step-id="${stepId}"]`);
  if (stepRow) {
    stepRow.remove();
  }
}

// Save New Dream or Update Existing Dream
function saveNewDream() {
  console.log("💾 Saving dream...");
  const titleInput = document.getElementById("dream-title");
  const categoryInput = document.getElementById("dream-category");
  const descriptionInput = document.getElementById("dream-description");
  const statusInput = document.querySelector('input[name="status"]:checked');

  // Validation
  if (!titleInput || !titleInput.value.trim()) {
    window.showCustomAlert("Vui lòng nhập tên ước mơ!", "error");
    if (titleInput) titleInput.focus();
    return;
  }

  if (!categoryInput || !categoryInput.value) {
    window.showCustomAlert("Vui lòng chọn phân loại ước mơ!", "error");
    return;
  }

  if (!statusInput) {
    window.showCustomAlert("Vui lòng chọn trạng thái ước mơ!", "error");
    return;
  }

  // Check active dreams limit (only for new dreams or status change to active)
  if (statusInput.value === "active") {
    const activeCount = window.bucketListData.filter(
      (d) =>
        d.status === "active" && !d.completed && d.id !== currentEditingDreamId,
    ).length;

    if (activeCount >= MAX_ACTIVE_DREAMS) {
      window.showCustomAlert(
        `Bạn chỉ có thể có tối đa ${MAX_ACTIVE_DREAMS} ước mơ đang thực hiện!`,
        "warning",
      );
      return;
    }
  }

  let dreamData = {
    title: titleInput.value.trim(),
    category: categoryInput.value,
    description: descriptionInput.value.trim(),
    status: statusInput.value,
    updatedAt: new Date().toISOString(),
  };

  // Handle progress/steps based on category
  if (categoryInput.value === "large") {
    // Get steps for large dreams
    const stepInputs = document.querySelectorAll(
      "#steps-container .step-input",
    );
    const steps = Array.from(stepInputs)
      .map((input, index) => {
        const stepRow = input.closest(".step-input-row");
        const stepId = stepRow.getAttribute("data-step-id");

        // If editing, try to find existing step
        let existingStep = null;
        if (currentEditingDreamId) {
          const dream = window.bucketListData.find(
            (d) => d.id === currentEditingDreamId,
          );
          if (dream && dream.steps) {
            existingStep = dream.steps.find((s) => s.id === stepId);
          }
        }

        return {
          id: stepId,
          text: input.value.trim(),
          completed: existingStep ? existingStep.completed : false,
        };
      })
      .filter((step) => step.text !== "");

    dreamData.steps = steps;
    dreamData.progress = calculateProgressFromSteps(steps);
  } else {
    // Get manual progress for small/medium dreams
    const progressSlider = document.getElementById("dream-progress-slider");
    const progressPercent = progressSlider ? parseInt(progressSlider.value) : 0;
    dreamData.progress = progressPercent / 100;
    dreamData.steps = [];
  }

  if (currentEditingDreamId) {
    // UPDATE existing dream
    const dreamIndex = window.bucketListData.findIndex(
      (d) => d.id === currentEditingDreamId,
    );
    if (dreamIndex !== -1) {
      // Preserve certain fields
      const existingDream = window.bucketListData[dreamIndex];
      window.bucketListData[dreamIndex] = {
        ...existingDream,
        ...dreamData,
      };

      window.showCustomAlert("Đã cập nhật ước mơ! ✏️", "success");
    }
  } else {
    // CREATE new dream
    const newDream = {
      id: window.generateId(),
      ...dreamData,
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
      completionNotes: "",
    };

    window.bucketListData.push(newDream);
    window.showCustomAlert("Đã thêm ước mơ mới! 🎯", "success");
  }

  // Save to Firebase
  saveBucketListData();

  // Render and close modal
  renderBucketList();
  window.closeAllModals();
  currentEditingDreamId = null;
}

function calculateProgressFromSteps(steps) {
  if (!steps || steps.length === 0) return 0;
  const completedSteps = steps.filter((step) => step.completed).length;
  return completedSteps / steps.length;
}

// Render Bucket List
function renderBucketList() {
  renderDreamsByStatus("active", "active-dreams");
  renderDreamsByStatus("future", "future-dreams");
  renderCompletedDreams();
  updateProgressCounts();
  updateQuickStats();
}

function renderDreamsByStatus(status, containerId) {
  const container = document.getElementById(containerId);
  const dreams = window.bucketListData.filter(
    (dream) => dream.status === status && !dream.completed,
  );

  if (!container) return;

  if (dreams.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${status === "active" ? "✨" : "⭐"}</div>
                <p>Chưa có ước mơ nào ${status === "active" ? "đang thực hiện" : "trong tương lai"}</p>
            </div>
        `;
    return;
  }

  container.innerHTML = dreams
    .map((dream) => {
      const progressPercent = Math.round(calculateProgress(dream) * 100);

      return `
            <div class="dream-card" data-dream-id="${window.escapeHtml(dream.id)}">
                <div class="dream-header">
                    <h3 class="dream-title" onclick="showDreamDetail('${window.escapeHtml(dream.id)}')">${window.escapeHtml(dream.title)}</h3>
                    <span class="dream-category ${window.escapeHtml(dream.category)}">
                        ${getCategoryIcon(dream.category)} ${getCategoryText(dream.category)}
                    </span>
                </div>
                
                ${
                  dream.description
                    ? `
                    <div class="dream-description">${window.escapeHtml(dream.description)}</div>
                `
                    : ""
                }
                
                <div class="progress-section">
                    <div class="progress-bar">
                        <div class="progress-fill ${window.escapeHtml(dream.category)}" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${progressPercent}% hoàn thành</div>
                </div>
                
                <div class="dream-actions">
                    ${
                      status === "active"
                        ? `
                        <button class="dream-action-btn edit-btn" onclick="showEditDreamModal('${window.escapeHtml(dream.id)}')">
                            ✏️ Sửa
                        </button>
                    `
                        : ""
                    }
                    <button class="dream-action-btn view-detail-btn" onclick="showDreamDetail('${window.escapeHtml(dream.id)}')">
                        👁️ Xem chi tiết
                    </button>
                </div>
            </div>
        `;
    })
    .join("");
}

function calculateProgress(dream) {
  if (!dream) return 0;

  if (dream.category === "large" && dream.steps && dream.steps.length > 0) {
    const completedSteps = dream.steps.filter((step) => step.completed).length;
    return completedSteps / dream.steps.length;
  }

  return dream.progress || 0;
}

function getCategoryIcon(category) {
  const icons = {
    small: "✨",
    medium: "🎪",
    large: "🏔️",
  };
  return icons[category] || "🎯";
}

function getCategoryText(category) {
  const texts = {
    small: "Nhỏ",
    medium: "Vừa",
    large: "Lớn",
  };
  return texts[category] || "Khác";
}

// Show Dream Detail Modal
function showDreamDetail(dreamId) {
  const dream = window.bucketListData.find((d) => d.id === dreamId);
  if (!dream) return;

  const modal = document.getElementById("dream-detail-modal");
  if (!modal) return;

  const progressPercent = Math.round(calculateProgress(dream) * 100);

  document.getElementById("detail-dream-title").textContent = dream.title;
  document.getElementById("detail-category").textContent = getCategoryText(
    dream.category,
  );
  document.getElementById("detail-category").className =
    `dream-category-badge ${dream.category}`;
  document.getElementById("detail-date").textContent =
    `Bắt đầu: ${window.formatDateDisplay(dream.createdAt.split("T")[0])}`;
  document.getElementById("detail-description").textContent =
    dream.description || "Chưa có mô tả...";

  const progressFill = document.getElementById("detail-progress-fill");
  if (progressFill) progressFill.style.width = `${progressPercent}%`;
  const progressText = document.getElementById("detail-progress-text");
  if (progressText) progressText.textContent = `${progressPercent}% hoàn thành`;

  // Populate steps section
  const stepsSection = document.getElementById("detail-steps-section");
  const stepsList = document.getElementById("detail-steps-list");

  if (stepsList) {
    if (dream.category === "large" && dream.steps && dream.steps.length > 0) {
      if (stepsSection) stepsSection.style.display = "block";
      stepsList.innerHTML = dream.steps
        .map(
          (step) => `
                <div class="step-item">
                    <input type="checkbox" class="step-checkbox" 
                            ${step.completed ? "checked" : ""}
                            onchange="toggleStep('${window.escapeHtml(dream.id)}', '${window.escapeHtml(step.id)}')">
                    <span class="step-text ${step.completed ? "completed" : ""}">
                        ${window.escapeHtml(step.text)}
                    </span>
                </div>
            `,
        )
        .join("");
    } else if (dream.category !== "large") {
      // Show manual progress for small/medium dreams
      if (stepsSection) stepsSection.style.display = "block";
      stepsList.innerHTML = `
                <div class="manual-progress-section">
                    <label for="detail-progress-slider">Điều chỉnh tiến độ:</label>
                    <div class="progress-slider-container">
                        <input type="range" 
                               id="detail-progress-slider" 
                               class="progress-slider" 
                               min="0" 
                               max="100" 
                               value="${progressPercent}"
                               oninput="updateDetailProgress('${window.escapeHtml(dream.id)}', this.value)">
                        <span class="progress-value" id="detail-progress-display">${progressPercent}%</span>
                    </div>
                </div>
            `;
    } else {
      if (stepsSection) stepsSection.style.display = "none";
      stepsList.innerHTML = "";
    }
  }

  // Action buttons
  const detailActions = document.getElementById("detail-actions");
  if (detailActions) {
    const completeBtn = dream.completed
      ? ""
      : `
            <button class="action-btn complete-dream-btn" onclick="showCompleteDreamModal()">
                ✅ Hoàn thành ước mơ
            </button>
        `;

    const statusText =
      dream.status === "active" ? "🔄 Lưu Tương lai" : "🔥 Bắt đầu";
    const moveBtn = dream.completed
      ? ""
      : `
            <button class="action-btn move-btn" onclick="toggleDreamStatus('${dream.id}')">
                ${statusText}
            </button>
        `;

    detailActions.innerHTML = `
            ${completeBtn}
            ${moveBtn}
            <button class="action-btn delete-btn" onclick="window.showCustomConfirm('Bạn có chắc chắn muốn xóa ước mơ này?', () => deleteDream('${dream.id}'))">
                🗑️ Xóa
            </button>
        `;
  }

  modal.setAttribute("data-dream-id", dreamId);

  window.closeAllModals();
  modal.classList.add("active");
}

// Update detail progress (for small/medium dreams)
function updateDetailProgress(dreamId, value) {
  const display = document.getElementById("detail-progress-display");
  if (display) display.textContent = `${value}%`;

  // Update the dream's progress
  const dream = window.bucketListData.find((d) => d.id === dreamId);
  if (dream) {
    dream.progress = parseInt(value) / 100;
    dream.updatedAt = new Date().toISOString();

    // Update main progress bar in detail modal
    const progressFill = document.getElementById("detail-progress-fill");
    if (progressFill) progressFill.style.width = `${value}%`;
    const progressText = document.getElementById("detail-progress-text");
    if (progressText) progressText.textContent = `${value}% hoàn thành`;

    saveBucketListData();
    renderBucketList();
  }
}

// Toggle Step Completion
function toggleStep(dreamId, stepId) {
  const dream = window.bucketListData.find((d) => d.id === dreamId);
  if (!dream || !dream.steps) return;

  const step = dream.steps.find((s) => s.id === stepId);
  if (step) {
    step.completed = !step.completed;
    dream.progress = calculateProgress(dream);
    dream.updatedAt = new Date().toISOString();

    saveBucketListData();
    renderBucketList();
    showDreamDetail(dreamId);
  }
}

// Toggle Dream Status
function toggleDreamStatus(dreamId) {
  const dream = window.bucketListData.find((d) => d.id === dreamId);
  if (!dream) return;

  if (dream.completed) {
    window.showCustomAlert(
      "Ước mơ đã hoàn thành không thể chuyển trạng thái!",
      "warning",
    );
    return;
  }

  if (dream.status === "active") {
    window.showCustomConfirm(
      `Bạn có chắc muốn chuyển ước mơ "${dream.title}" sang trạng thái TƯƠNG LAI (Future)?`,
      () => {
        dream.status = "future";
        dream.updatedAt = new Date().toISOString();
        saveBucketListData();
        renderBucketList();
        window.closeAllModals();
        window.showCustomAlert(
          `✅ Đã chuyển "${dream.title}" sang TƯƠNG LAI.`,
          "success",
        );
      },
    );
    return;
  } else if (dream.status === "future") {
    const activeCount = window.bucketListData.filter(
      (d) => d.status === "active" && !d.completed,
    ).length;
    if (activeCount >= MAX_ACTIVE_DREAMS) {
      window.showCustomAlert(
        `Bạn chỉ có thể có tối đa ${MAX_ACTIVE_DREAMS} ước mơ đang thực hiện. Vui lòng hoàn thành hoặc chuyển trạng thái ước mơ khác.`,
        "warning",
      );
      return;
    }

    window.showCustomConfirm(
      `Bạn có chắc muốn chuyển ước mơ "${dream.title}" sang trạng thái ĐANG THỰC HIỆN (Active)?`,
      () => {
        dream.status = "active";
        dream.updatedAt = new Date().toISOString();
        saveBucketListData();
        renderBucketList();
        window.closeAllModals();
        window.showCustomAlert(
          `🔥 Đã chuyển "${dream.title}" sang ĐANG THỰC HIỆN.`,
          "success",
        );
      },
    );
    return;
  }

  window.showCustomAlert("Không thể chuyển trạng thái ước mơ này.", "error");
}

// Delete Dream
function deleteDream(dreamId) {
  const initialLength = window.bucketListData.length;
  window.bucketListData = window.bucketListData.filter((d) => d.id !== dreamId);

  if (window.bucketListData.length < initialLength) {
    saveBucketListData();
    renderBucketList();
    window.closeAllModals();
    window.showCustomAlert("Đã xóa ước mơ thành công!", "success");
  } else {
    window.showCustomAlert("Không tìm thấy ước mơ để xóa.", "error");
  }
}

// Show Complete Dream Modal
function showCompleteDreamModal() {
  const detailModal = document.getElementById("dream-detail-modal");
  const dreamId = detailModal.getAttribute("data-dream-id");
  const dream = window.bucketListData.find((d) => d.id === dreamId);

  if (!dream) return;

  const completeModal = document.getElementById("complete-dream-modal");
  if (!completeModal) return;

  document.getElementById("complete-dream-title").textContent = dream.title;
  document.getElementById("completion-thoughts").value =
    dream.completionNotes || "";

  completeModal.setAttribute("data-dream-id", dreamId);

  window.closeAllModals();
  completeModal.classList.add("active");
}

// Complete Dream
function completeDream() {
  const modal = document.getElementById("complete-dream-modal");
  const dreamId = modal.getAttribute("data-dream-id");
  const dream = window.bucketListData.find((d) => d.id === dreamId);

  if (!dream) return;

  const thoughtsInput = document.getElementById("completion-thoughts");

  if (!thoughtsInput.value.trim()) {
    window.showCustomAlert("Vui lòng nhập cảm nhận trước khi lưu!", "error");
    return;
  }

  dream.completed = true;
  dream.status = "completed";
  dream.completedAt = new Date().toISOString();
  dream.completionNotes = thoughtsInput.value.trim();

  if (dream.steps) {
    dream.steps.forEach((step) => (step.completed = true));
  }
  dream.progress = 1;

  saveBucketListData();
  renderBucketList();
  window.closeAllModals();

  window.showCustomAlert(
    `🎉 Chúc mừng! Bạn đã hoàn thành: "${window.escapeHtml(dream.title)}"`,
    "success",
  );
}

// Render Completed Dreams
function renderCompletedDreams() {
  const container = document.getElementById("completed-dreams-section");
  const completedDreams = window.bucketListData.filter(
    (dream) => dream.completed,
  );

  if (!container) return;

  if (completedDreams.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏆</div>
                <p>Chưa có ước mơ nào được hoàn thành</p>
                <small>Hãy bắt đầu và hoàn thành ước mơ đầu tiên của bạn!</small>
            </div>
        `;
    return;
  }

  container.innerHTML = completedDreams
    .map(
      (dream) => `
        <div class="completed-dream-card" onclick="showCompletedDreamDetail('${window.escapeHtml(dream.id)}')">
            <div class="completed-dream-header">
                <h4>${window.escapeHtml(dream.title)}</h4>
                <button class="delete-completed-btn" onclick="event.stopPropagation(); deleteCompletedDream('${window.escapeHtml(dream.id)}')" title="Xóa ước mơ">
                    🗑️
                </button>
            </div>
            <div class="completed-dream-meta">
                <span class="completed-dream-category ${window.escapeHtml(dream.category)}">
                    ${getCategoryIcon(dream.category)} ${getCategoryText(dream.category)}
                </span>
                <span class="completed-date">${window.formatDateDisplay(dream.completedAt?.split("T")[0])}</span>
            </div>
            ${
              dream.completionNotes
                ? `
                <div class="completion-notes">
                    <strong>Cảm nhận:</strong>
                    <p>${window.escapeHtml(dream.completionNotes)}</p>
                </div>
            `
                : ""
            }
        </div>
    `,
    )
    .join("");
}

function deleteCompletedDream(dreamId) {
  window.showCustomConfirm(
    "Bạn có chắc chắn muốn xóa ước mơ đã hoàn thành này?",
    () => {
      const initialLength = window.bucketListData.length;
      window.bucketListData = window.bucketListData.filter(
        (d) => d.id !== dreamId,
      );

      if (window.bucketListData.length < initialLength) {
        saveBucketListData();
        renderBucketList();
        window.showCustomAlert("Đã xóa ước mơ đã hoàn thành!", "success");
      } else {
        window.showCustomAlert("Không tìm thấy ước mơ để xóa.", "error");
      }
    },
  );
}

function showCompletedDreamDetail(dreamId) {
  const dream = window.bucketListData.find((d) => d.id === dreamId);
  if (!dream) return;

  let message = `
        <p><strong>Ước mơ:</strong> ${window.escapeHtml(dream.title)}</p>
        <p><strong>Hoàn thành:</strong> ${window.formatDateDisplay(dream.completedAt?.split("T")[0])}</p>
        <p><strong>Phân loại:</strong> ${getCategoryText(dream.category)}</p>
    `;

  if (dream.completionNotes) {
    message += `<br><strong>💭 Cảm nhận của bạn:</strong><p>${window.escapeHtml(dream.completionNotes)}</p>`;
  } else {
    message += `<br><strong>💭 Cảm nhận của bạn:</strong><p>Bạn không để lại ghi chú nào.</p>`;
  }

  window.showCustomAlert(message, "info");
}

// Update Progress Counts
function updateProgressCounts() {
  const activeCount = window.bucketListData.filter(
    (dream) => dream.status === "active" && !dream.completed,
  ).length;
  const futureCount = window.bucketListData.filter(
    (dream) => dream.status === "future" && !dream.completed,
  ).length;
  const completedCount = window.bucketListData.filter(
    (dream) => dream.completed,
  ).length;

  const activeElement = document.getElementById("active-count");
  if (activeElement) activeElement.textContent = activeCount;

  const futureElement = document.getElementById("future-count");
  if (futureElement) futureElement.textContent = futureCount;

  const completedElement = document.getElementById("completed-count");
  if (completedElement) completedElement.textContent = completedCount;
}

// Update Quick Stats
function updateQuickStats() {
  const smallCount = window.bucketListData.filter(
    (dream) => dream.category === "small" && !dream.completed,
  ).length;
  const mediumCount = window.bucketListData.filter(
    (dream) => dream.category === "medium" && !dream.completed,
  ).length;
  const largeCount = window.bucketListData.filter(
    (dream) => dream.category === "large" && !dream.completed,
  ).length;

  const statsGrid = document.querySelector(".stats-grid");
  if (!statsGrid) return;

  const statItems = statsGrid.querySelectorAll(".stat-number");

  if (statItems.length >= 3) {
    statItems[0].textContent = smallCount;
    statItems[1].textContent = mediumCount;
    statItems[2].textContent = largeCount;
  }
}

// Daily Motivation
function loadDailyMotivation() {
  const today = new Date().toDateString();
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed += today.charCodeAt(i);
  }

  const randomIndex = seed % MOTIVATIONAL_QUOTES.length;
  const dailyQuote = MOTIVATIONAL_QUOTES[randomIndex];

  const motivationElement = document.getElementById("daily-motivation");
  if (motivationElement) {
    motivationElement.innerHTML = `<p>${dailyQuote}</p>`;
  }
}

// Save Bucket List Data
function saveBucketListData() {
  if (typeof window.saveModuleData === "function") {
    window.saveModuleData("bucketlist", window.bucketListData);
  }
}

// Make functions globally available
window.initBucketList = initBucketList;
window.showAddDreamModal = showAddDreamModal;
window.showEditDreamModal = showEditDreamModal;
window.addStepInput = addStepInput;
window.removeStep = removeStep;
window.saveNewDream = saveNewDream;
window.showDreamDetail = showDreamDetail;
window.toggleStep = toggleStep;
window.updateDetailProgress = updateDetailProgress;
window.showCompleteDreamModal = showCompleteDreamModal;
window.completeDream = completeDream;
window.showCompletedDreamDetail = showCompletedDreamDetail;
window.deleteCompletedDream = deleteCompletedDream;
window.deleteDream = deleteDream;
window.renderBucketList = renderBucketList;
window.updateProgressCounts = updateProgressCounts;
window.loadDailyMotivation = loadDailyMotivation;
window.toggleDreamStatus = toggleDreamStatus;
window.updateQuickStats = updateQuickStats;
window.loadBucketListData = loadBucketListData;

console.log("🎯 bucketlist.js loaded successfully - ENHANCED VERSION");
