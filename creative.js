// Creative Corner Module
let creativeData = [];
let currentEditId = null;
let selectedFiles = [];
let editSelectedFiles = [];
let postToDelete = null;
let currentViewerPost = null;
let currentMediaIndex = 0;

function initCreative() {
    console.log('🎨 Initializing Creative Corner...');
    
    // Gắn listener cho mediaInput (vì nó đã được tách ra khỏi uploadArea trong HTML)
    const mediaInput = document.getElementById('mediaInput');
    if (mediaInput) {
        mediaInput.addEventListener('change', handleFileSelect);
    }
    
    setupEventListeners();
    setupUploadAreaListeners();
}

function loadCreativeData(userData) {
    console.log('📥 Loading creative data:', userData);
    
    if (userData && userData.creative) {
        creativeData = userData.creative;
        console.log('✅ Loaded creative posts:', creativeData.length);
    } else {
        creativeData = [];
        console.log('ℹ️ No creative data found, initializing empty array');
    }
    
    renderGallery();
    updatePostCount();
    showRandomMemory();
}

function setupEventListeners() {
    // Upload button
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handleUpload);
    }

    // Edit modal
    const closeEditModal = document.getElementById('closeEditModal');
    if (closeEditModal) {
        closeEditModal.addEventListener('click', closeEditModalHandler);
    }
    
    const cancelEdit = document.getElementById('cancelEdit');
    if (cancelEdit) {
        cancelEdit.addEventListener('click', closeEditModalHandler);
    }
    
    const saveEdit = document.getElementById('saveEdit');
    if (saveEdit) {
        saveEdit.addEventListener('click', saveEditHandler);
    }

    // New version button
    const newVersionBtn = document.getElementById('newVersionBtn');
    if (newVersionBtn) {
        newVersionBtn.addEventListener('click', createNewVersion);
    }

    // Edit media input
    const editMediaInput = document.getElementById('editMediaInput');
    if (editMediaInput) {
        editMediaInput.addEventListener('change', handleEditFileSelect);
    }

    // Delete modal
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', closeDeleteModalHandler);
    }
    
    const cancelDelete = document.getElementById('cancelDelete');
    if (cancelDelete) {
        cancelDelete.addEventListener('click', closeDeleteModalHandler);
    }
    
    const confirmDelete = document.getElementById('confirmDelete');
    if (confirmDelete) {
        confirmDelete.addEventListener('click', confirmDeleteHandler);
    }

    // Alert modal
    const closeAlertModal = document.getElementById('closeAlertModal');
    if (closeAlertModal) {
        closeAlertModal.addEventListener('click', closeAlertModalHandler);
    }
    
    const confirmAlert = document.getElementById('confirmAlert');
    if (confirmAlert) {
        confirmAlert.addEventListener('click', closeAlertModalHandler);
    }

    // Media viewer
    const closeMediaViewer = document.getElementById('closeMediaViewer');
    if (closeMediaViewer) {
        closeMediaViewer.addEventListener('click', closeMediaViewerHandler);
    }
    
    const prevMedia = document.getElementById('prevMedia');
    if (prevMedia) {
        prevMedia.addEventListener('click', showPrevMedia);
    }
    
    const nextMedia = document.getElementById('nextMedia');
    if (nextMedia) {
        nextMedia.addEventListener('click', showNextMedia);
    }
}

// Sửa: Bỏ logic clone node vì uploadArea không bị thay thế nữa
function setupUploadAreaListeners() {
    const uploadArea = document.getElementById('uploadArea');
    if (!uploadArea) return;
    
    // Setup new listeners
    uploadArea.addEventListener('click', () => {
        // Kích hoạt input file ẩn (mediaInput) nằm ngoài uploadArea
        document.getElementById('mediaInput').click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFileDrop(e.dataTransfer.files);
    });
}

// ===== FILE HANDLING =====
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Reset giá trị input để có thể chọn lại cùng file
    e.target.value = '';
}

function handleFileDrop(files) {
    const fileArray = Array.from(files);
    handleFiles(fileArray);
}

function handleFiles(files) {
    const validFiles = files.filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
        showAlert('Loại file không hợp lệ', 'Vui lòng chọn file ảnh (JPEG, PNG, GIF) hoặc video (MP4, MOV) để tiếp tục.', 'warning');
        return;
    }

    const maxSize = 200 * 1024 * 1024; // 200MB
    const oversizedFiles = validFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
        showAlert('File quá lớn', `Một số file vượt quá kích thước cho phép (200MB). Vui lòng chọn file nhỏ hơn.`, 'warning');
        return;
    }

    if (selectedFiles.length + validFiles.length > 10) {
        showAlert('Quá nhiều file', 'Bạn chỉ có thể chọn tối đa 10 ảnh/video!', 'warning');
        return;
    }

    selectedFiles = [...selectedFiles, ...validFiles];
    renderPreviews();
}

function handleEditFileSelect(e) {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
        showAlert('Loại file không hợp lệ', 'Vui lòng chọn file ảnh hoặc video!', 'warning');
        return;
    }

    if (editSelectedFiles.length + validFiles.length > 10) {
        showAlert('Quá nhiều file', 'Bạn chỉ có thể thêm tối đa 10 ảnh/video!', 'warning');
        return;
    }

    // Upload file mới và thêm vào editSelectedFiles
    uploadEditFiles(validFiles);
    // Reset giá trị input
    e.target.value = '';
}

// ===== UPLOAD FUNCTIONALITY =====
async function handleUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const description = document.getElementById('creativeDescription');
    
    if (!uploadBtn || !description) return;
    
    const descriptionText = description.value.trim();
    const uploadType = document.querySelector('input[name="upload-type"]:checked');
    
    if (!uploadType) return;

    // Kiểm tra validation
    if (selectedFiles.length === 0) {
        showAlert('Thiếu nội dung', 'Vui lòng chọn ít nhất một ảnh hoặc video để chia sẻ khoảnh khắc của bạn!', 'warning');
        return;
    }

    if (!descriptionText) {
        showAlert('Thiếu mô tả', 'Vui lòng thêm mô tả cho khoảnh khắc của bạn để làm nó thêm ý nghĩa!', 'warning');
        return;
    }

    showLoading(true);
    const originalText = uploadBtn.innerHTML;
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải lên...';

    try {
        console.log('🔄 Starting upload process...');
        
        // Kiểm tra xác thực trước khi upload
        if (typeof currentUser === 'undefined' || !currentUser || !currentUser.uid) {
            throw new Error('User not authenticated or UID missing for upload.');
        }

        const mediaUrls = await uploadFilesToStorage(selectedFiles);
        console.log('✅ Files uploaded successfully:', mediaUrls);
        
        const newPost = {
            id: generateId(),
            type: uploadType.value,
            media: mediaUrls,
            description: descriptionText,
            date: new Date().toISOString(),
            likes: 0,
            liked: false,
            createdAt: new Date().toISOString()
        };

        creativeData.unshift(newPost);
        await saveCreativeData();
        
        resetUploadForm();
        renderGallery();
        updatePostCount();
        showRandomMemory();
        
        showNotification('Khoảnh khắc đã được lưu thành công! ✨', 'success');
        
    } catch (error) {
        console.error('❌ Error uploading post:', error);
        showAlert('Lỗi tải lên', `Có lỗi xảy ra khi tải lên: ${error.message || 'Lỗi không xác định'}! Vui lòng thử lại!`, 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = originalText;
        showLoading(false);
    }
}

// Sửa: Thêm kiểm tra currentUser để tránh lỗi 404/Authentication
async function uploadFilesToStorage(files) {
    console.log('🔄 Starting storage upload for', files.length, 'files...');
    
    if (!firebase.storage) {
        throw new Error('Firebase Storage is not available');
    }

    if (typeof currentUser === 'undefined' || !currentUser || !currentUser.uid) {
        throw new Error('User not authenticated or UID missing.');
    }
    
    const storage = firebase.storage();
    const uploads = [];
    const uid = currentUser.uid;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Uploading ${i + 1}/${files.length}:`, file.name);
        
        const fileExtension = file.name.split('.').pop();
        const fileName = `creative_${uid}_${Date.now()}_${i}.${fileExtension}`;
        
        const storageRef = storage.ref(`creative/${fileName}`);
        
        try {
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    'uploadedBy': uid,
                    'originalName': file.name
                }
            };
            
            const snapshot = await storageRef.put(file, metadata);
            const url = await snapshot.ref.getDownloadURL();
            
            uploads.push({
                url: url,
                type: file.type.startsWith('image/') ? 'image' : 'video',
                name: file.name,
                size: file.size
            });
            
            console.log('✅ Upload success for:', file.name);
        } catch (error) {
            console.error('❌ Upload error for', file.name, ':', error);
            throw error;
        }
    }
    
    console.log('🎉 All files uploaded successfully');
    return uploads;
}

// HÀM UPLOAD CHO EDIT - GIỮ NGUYÊN LOGIC
async function uploadEditFiles(files) {
    showLoading(true);
    try {
        const newMedia = await uploadFilesToStorage(files);
        editSelectedFiles = [...editSelectedFiles, ...newMedia];
        renderEditPreview();
        showNotification('Đã thêm file mới thành công!', 'success');
    } catch (error) {
        console.error('Error uploading edit files:', error);
        showNotification('Có lỗi khi tải lên file mới!', 'error');
    } finally {
        showLoading(false);
    }
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderPreviews();
}

function removeEditMedia(index) {
    editSelectedFiles.splice(index, 1);
    renderEditPreview();
}

// Sửa: Đảm bảo chỉ hiển thị preview/placeholder mà không tạo lại mediaInput
function renderPreviews() {
    const uploadArea = document.getElementById('uploadArea');
    if (!uploadArea) return;
    
    // Xóa nội dung cũ một cách an toàn
    uploadArea.innerHTML = '';

    if (selectedFiles.length === 0) {
        // Chỉ thêm lại placeholder
        uploadArea.innerHTML = `
            <div class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Kéo thả ảnh/video vào đây hoặc click để chọn</p>
                <p class="upload-hint">Hỗ trợ JPEG, PNG, GIF, MP4, MOV (tối đa 200MB/file)</p>
            </div>
        `;
        return;
    }

    const previewGrid = document.createElement('div');
    previewGrid.className = 'preview-grid';

    selectedFiles.forEach((file, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';

        // Tạo Object URL cho preview cục bộ
        const objectURL = URL.createObjectURL(file);
        
        if (file.type.startsWith('image/')) {
            previewItem.innerHTML = `
                <img src="${objectURL}" alt="Preview">
                <div class="preview-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                </div>
                <button class="remove-preview" data-index="${index}" title="Xóa file">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else {
            previewItem.innerHTML = `
                <video src="${objectURL}" muted></video>
                <div class="preview-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                </div>
                <button class="remove-preview" data-index="${index}" title="Xóa file">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }

        previewGrid.appendChild(previewItem);
    });

    // Thêm preview grid vào uploadArea
    uploadArea.appendChild(previewGrid);

    // Add event listeners for remove buttons
    previewGrid.querySelectorAll('.remove-preview').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.getAttribute('data-index'));
            removeFile(index);
        });
    });
}

function resetUploadForm() {
    selectedFiles = [];
    
    const description = document.getElementById('creativeDescription');
    if (description) {
        description.value = '';
    }
    
    const mediaInput = document.getElementById('mediaInput');
    if (mediaInput) {
        mediaInput.value = '';
    }
    
    renderPreviews();
}

// ===== GALLERY MANAGEMENT =====
function renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyGallery = document.getElementById('emptyGallery');
    
    if (!galleryGrid || !emptyGallery) return;
    
    if (creativeData.length === 0) {
        galleryGrid.style.display = 'none';
        emptyGallery.style.display = 'block';
        return;
    }
    
    galleryGrid.style.display = 'grid';
    emptyGallery.style.display = 'none';
    galleryGrid.innerHTML = '';
    
    creativeData.forEach(post => {
        const galleryItem = createGalleryItem(post);
        galleryGrid.appendChild(galleryItem);
    });
}

function createGalleryItem(post) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-id', post.id);
    
    const mediaGrid = createMediaGrid(post.media);
    const postTypeText = getPostTypeText(post.type);
    
    // Tạo description với read more functionality
    const descriptionHTML = createDescriptionHTML(post.id, post.description);
    
    item.innerHTML = `
        <div class="media-grid-container" onclick="openMediaViewer('${post.id}')">
            ${mediaGrid}
            <div class="item-overlay">
                <div class="item-type">${postTypeText}</div>
                ${post.media.length > 1 ? `<div class="media-count">+${post.media.length}</div>` : ''}
            </div>
        </div>
        <div class="item-info">
            <div class="item-date">
                <i class="far fa-calendar"></i>
                ${formatDateDisplay(post.date.split('T')[0])}
            </div>
            <div class="item-description">
                ${descriptionHTML}
            </div>
            <div class="item-actions">
                <button class="like-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike('${post.id}', event)">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${post.likes}</span>
                </button>
                <div class="edit-actions">
                    <button class="edit-btn" onclick="openEditModal('${post.id}', event)" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="openDeleteModal('${post.id}', event)" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return item;
}

function createDescriptionHTML(postId, description) {
    const isLong = isDescriptionLong(description);
    
    if (!isLong) {
        return `<div class="description-text">${escapeHtml(description)}</div>`;
    }
    
    return `
        <div class="description-text collapsed" id="desc-${postId}">${escapeHtml(description)}</div>
        <button class="read-more-btn" onclick="toggleReadMore('${postId}', event)">
            <span class="more-text">Xem thêm</span>
            <span class="less-text" style="display: none;">Thu gọn</span>
        </button>
    `;
}

function createMediaGrid(mediaArray) {
    if (mediaArray.length === 0) return '<div class="no-media">Không có media</div>';
    
    const totalMedia = mediaArray.length;
    
    if (totalMedia === 1) {
        const media = mediaArray[0];
        return media.type === 'image' ? 
            `<img src="${media.url}" alt="Creative media" loading="lazy" class="single-media">` : 
            `<video src="${media.url}" muted playsinline class="single-media"></video>`;
    }
    
    let gridHTML = `<div class="media-grid media-grid-${Math.min(totalMedia, 4)}">`;
    
    const displayMedia = totalMedia > 4 ? mediaArray.slice(0, 4) : mediaArray;
    
    displayMedia.forEach((media, index) => {
        const isLast = index === 3 && totalMedia > 4;
        gridHTML += `
            <div class="grid-item ${getGridItemClass(totalMedia, index)}">
                ${media.type === 'image' ? 
                    `<img src="${media.url}" alt="Media ${index + 1}" loading="lazy">` : 
                    `<video src="${media.url}" muted playsinline></video>`
                }
                ${isLast ? `<div class="more-overlay">+${totalMedia - 4}</div>` : ''}
            </div>
        `;
    });
    
    gridHTML += '</div>';
    return gridHTML;
}

// ===== EDIT FUNCTIONALITY =====
function openEditModal(postId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const post = creativeData.find(p => p.id === postId);
    if (!post) return;
    
    currentEditId = postId;
    editSelectedFiles = [...post.media];
    
    const modal = document.getElementById('editModal');
    if (!modal) return;
    
    renderEditPreview();
    
    const description = document.getElementById('editDescription');
    if (description) {
        description.value = post.description;
    }
    
    modal.classList.add('active');
}

function renderEditPreview() {
    const preview = document.getElementById('editPreview');
    if (!preview) return;
    
    preview.innerHTML = `
        <div class="edit-media-grid" id="editMediaGrid">
            ${editSelectedFiles.map((media, index) => `
                <div class="edit-media-item">
                    ${media.type === 'image' ? 
                        `<img src="${media.url}" alt="Media ${index + 1}">` : 
                        `<video src="${media.url}" muted></video>`
                    }
                    <button class="remove-edit-media" onclick="removeEditMedia(${index})" title="Xóa media">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function closeEditModalHandler() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentEditId = null;
    editSelectedFiles = [];
}

async function saveEditHandler() {
    if (!currentEditId) return;
    
    const description = document.getElementById('editDescription');
    if (!description) return;
    
    const newDescription = description.value.trim();
    
    if (!newDescription) {
        showAlert('Thiếu mô tả', 'Vui lòng nhập mô tả cho bài đăng của bạn!', 'warning');
        return;
    }
    
    if (editSelectedFiles.length === 0) {
        showAlert('Thiếu media', 'Bài đăng cần ít nhất một ảnh hoặc video!', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        const post = creativeData.find(p => p.id === currentEditId);
        if (post) {
            // Xóa media cũ khỏi storage nếu có media bị xóa
            const deletedMedia = post.media.filter(oldMedia => 
                !editSelectedFiles.some(newMedia => newMedia.url === oldMedia.url)
            );
            
            if (deletedMedia.length > 0) {
                try {
                    await deleteFilesFromStorage(deletedMedia);
                } catch (error) {
                    console.error('Error deleting old media:', error);
                }
            }
            
            // Cập nhật post
            post.media = editSelectedFiles;
            post.description = newDescription;
            post.updatedAt = new Date().toISOString();
            
            await saveCreativeData();
            renderGallery();
            closeEditModalHandler();
            
            showNotification('Bài đăng đã được cập nhật thành công! ✨', 'success');
        }
    } catch (error) {
        console.error('Error saving edit:', error);
        showAlert('Lỗi cập nhật', 'Có lỗi xảy ra khi cập nhật bài đăng!', 'error');
    } finally {
        showLoading(false);
    }
}

// ===== DELETE FUNCTIONALITY =====
function openDeleteModal(postId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    postToDelete = postId;
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeDeleteModalHandler() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('active');
    }
    postToDelete = null;
}

async function confirmDeleteHandler() {
    if (!postToDelete) return;
    
    showLoading(true);
    
    try {
        const post = creativeData.find(p => p.id === postToDelete);
        if (post) {
            // Xóa files từ storage
            await deleteFilesFromStorage(post.media);
            
            // Xóa post khỏi data
            creativeData = creativeData.filter(p => p.id !== postToDelete);
            await saveCreativeData();
            
            // Update UI
            renderGallery();
            updatePostCount();
            showRandomMemory();
            
            showNotification('Bài đăng đã được xóa thành công!', 'success');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        showAlert('Lỗi xóa', 'Có lỗi xảy ra khi xóa bài đăng!', 'error');
    } finally {
        showLoading(false);
        closeDeleteModalHandler();
    }
}

async function deleteFilesFromStorage(mediaArray) {
    if (!firebase.storage) {
        console.log('Storage not available, skipping file deletion');
        return;
    }
    
    const storage = firebase.storage();
    const deletePromises = mediaArray.map(media => {
        try {
            const storageRef = storage.refFromURL(media.url);
            return storageRef.delete();
        } catch (error) {
            console.error('Error creating storage ref:', error);
            return Promise.resolve();
        }
    });
    
    return Promise.allSettled(deletePromises);
}

// ===== LIKE FUNCTIONALITY =====
function toggleLike(postId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const post = creativeData.find(p => p.id === postId);
    if (post) {
        if (post.liked) {
            post.likes--;
            post.liked = false;
        } else {
            post.likes++;
            post.liked = true;
        }
        
        updateLikeUI(postId, post.likes, post.liked);
        saveCreativeData();
    }
}

function updateLikeUI(postId, likes, liked) {
    const likeBtn = document.querySelector(`.gallery-item[data-id="${postId}"] .like-btn`);
    const likeCount = document.querySelector(`.gallery-item[data-id="${postId}"] .like-count`);
    
    if (likeBtn && likeCount) {
        likeBtn.classList.toggle('liked', liked);
        likeCount.textContent = likes;
        
        likeBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            likeBtn.style.transform = 'scale(1)';
        }, 300);
    }
}

// ===== MEDIA VIEWER =====
function openMediaViewer(postId) {
    const post = creativeData.find(p => p.id === postId);
    if (!post) return;
    
    currentViewerPost = post;
    currentMediaIndex = 0;
    
    const viewer = document.getElementById('mediaViewer');
    if (!viewer) return;
    
    showMediaInViewer();
    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMediaViewerHandler() {
    const viewer = document.getElementById('mediaViewer');
    if (viewer) {
        viewer.classList.remove('active');
    }
    
    currentViewerPost = null;
    currentMediaIndex = 0;
    document.body.style.overflow = '';
}

function showMediaInViewer() {
    if (!currentViewerPost) return;
    
    const mainMedia = document.getElementById('viewerMainMedia');
    const thumbnails = document.getElementById('viewerThumbnails');
    const description = document.getElementById('viewerDescription');
    const counter = document.getElementById('viewerCounter');
    const typeElement = document.getElementById('viewerType');
    
    if (!mainMedia || !thumbnails) return;
    
    const media = currentViewerPost.media[currentMediaIndex];
    
    if (media.type === 'image') {
        mainMedia.innerHTML = `<img src="${media.url}" alt="Media ${currentMediaIndex + 1}">`;
    } else {
        mainMedia.innerHTML = `<video src="${media.url}" controls autoplay></video>`;
    }
    
    thumbnails.innerHTML = '';
    currentViewerPost.media.forEach((mediaItem, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumbnail ${index === currentMediaIndex ? 'active' : ''}`;
        thumb.innerHTML = mediaItem.type === 'image' ? 
            `<img src="${mediaItem.url}" alt="Thumb ${index + 1}">` : 
            `<video src="${mediaItem.url}" muted></video>`;
        
        thumb.addEventListener('click', () => {
            currentMediaIndex = index;
            showMediaInViewer();
        });
        
        thumbnails.appendChild(thumb);
    });
    
    if (description) {
        description.textContent = currentViewerPost.description;
    }
    
    if (counter) {
        counter.textContent = `${currentMediaIndex + 1} / ${currentViewerPost.media.length}`;
    }
    
    if (typeElement) {
        typeElement.textContent = getPostTypeText(currentViewerPost.type);
    }
    
    const prevBtn = document.getElementById('prevMedia');
    const nextBtn = document.getElementById('nextMedia');
    
    if (prevBtn) prevBtn.style.display = currentViewerPost.media.length > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = currentViewerPost.media.length > 1 ? 'flex' : 'none';
}

function showPrevMedia() {
    if (!currentViewerPost) return;
    
    currentMediaIndex--;
    if (currentMediaIndex < 0) {
        currentMediaIndex = currentViewerPost.media.length - 1;
    }
    showMediaInViewer();
}

function showNextMedia() {
    if (!currentViewerPost) return;
    
    currentMediaIndex++;
    if (currentMediaIndex >= currentViewerPost.media.length) {
        currentMediaIndex = 0;
    }
    showMediaInViewer();
}

// ===== ALERT SYSTEM =====
function showAlert(title, message, type = 'info') {
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');
    
    if (!alertTitle || !alertMessage || !alertIcon) return;
    
    const icons = {
        'info': 'fa-info-circle',
        'warning': 'fa-exclamation-triangle',
        'error': 'fa-exclamation-circle',
        'success': 'fa-check-circle'
    };
    
    const colors = {
        'info': '#2196F3',
        'warning': '#FF9800',
        'error': '#F44336',
        'success': '#4CAF50'
    };
    
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    alertIcon.innerHTML = `<i class="fas ${icons[type]}" style="color: ${colors[type]}"></i>`;
    
    const alertModal = document.getElementById('alertModal');
    if (alertModal) {
        alertModal.classList.add('active');
    }
}

function closeAlertModalHandler() {
    const alertModal = document.getElementById('alertModal');
    if (alertModal) {
        alertModal.classList.remove('active');
    }
}

// ===== UTILITY FUNCTIONS =====
function showLoading(show) {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

function updatePostCount() {
    const countElement = document.getElementById('postCount');
    if (countElement) {
        countElement.textContent = `${creativeData.length} bài đăng`;
    }
}

function showRandomMemory() {
    const randomMemory = document.getElementById('randomMemory');
    const memoryContent = document.getElementById('memoryContent');
    
    if (!randomMemory || !memoryContent) return;
    
    if (creativeData.length < 2) {
        randomMemory.style.display = 'none';
        return;
    }
    
    const oldPosts = creativeData.filter(post => {
        const postDate = new Date(post.date);
        const currentDate = new Date();
        const timeDiff = currentDate - postDate;
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        return daysDiff > 30; // Posts older than 30 days
    });
    
    if (oldPosts.length === 0) {
        randomMemory.style.display = 'none';
        return;
    }
    
    const randomPost = oldPosts[Math.floor(Math.random() * oldPosts.length)];
    const mainMedia = randomPost.media[0];
    
    memoryContent.innerHTML = `
        <div class="memory-content">
            <div class="memory-media">
                ${mainMedia.type === 'image' ? 
                    `<img src="${mainMedia.url}" alt="Memory">` : 
                    `<video src="${mainMedia.url}" muted></video>`
                }
            </div>
            <div class="memory-info">
                <div class="memory-date">
                    <i class="far fa-calendar"></i>
                    ${formatDateDisplay(randomPost.date.split('T')[0])}
                </div>
                <div class="memory-description">
                    ${escapeHtml(randomPost.description)}
                </div>
            </div>
        </div>
    `;
    
    randomMemory.style.display = 'block';
}

function createNewVersion() {
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
        
        const uploadCard = document.querySelector('.upload-card');
        if (uploadCard) {
            uploadCard.style.animation = 'pulse 2s';
            setTimeout(() => {
                uploadCard.style.animation = '';
            }, 2000);
        }
    }
}

async function saveCreativeData() {
    // Giả định currentUser đã được định nghĩa trong app.js và có sẵn
    if (typeof currentUser === 'undefined' || !currentUser) {
        console.log('🚫 User not logged in, cannot save creative data');
        return;
    }
    
    try {
        // Giả định saveModuleData là hàm global từ app.js
        if (typeof saveModuleData === 'function') {
            await saveModuleData('creative', creativeData);
            console.log('✅ Creative data saved successfully');
        } else {
            console.error('❌ saveModuleData function is not available globally.');
        }
    } catch (error) {
        console.error('❌ Error saving creative data:', error);
        throw error;
    }
}

// ===== TEXT HANDLING =====
function isDescriptionLong(text) {
    return text.length > 150 || (text.match(/\n/g) || []).length > 2;
}

function toggleReadMore(postId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const descElement = document.getElementById(`desc-${postId}`);
    const btn = descElement.nextElementSibling;
    const moreText = btn.querySelector('.more-text');
    const lessText = btn.querySelector('.less-text');
    
    if (!descElement || !btn) return;
    
    if (descElement.classList.contains('collapsed')) {
        descElement.classList.remove('collapsed');
        moreText.style.display = 'none';
        lessText.style.display = 'inline';
    } else {
        descElement.classList.add('collapsed');
        moreText.style.display = 'inline';
        lessText.style.display = 'none';
    }
}

// ===== HELPER FUNCTIONS =====
function generateId() {
    return 'creative_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('vi-VN');
}

function getPostTypeText(type) {
    const types = {
        'moment': '📷 Khoảnh khắc',
        'idea': '💡 Ý tưởng',
        'feeling': '❤️ Cảm xúc'
    };
    return types[type] || '📁 Khác';
}

function getGridItemClass(totalMedia, index) {
    if (totalMedia === 2) return 'grid-half';
    if (totalMedia === 3) {
        return index === 0 ? 'grid-large' : 'grid-small';
    }
    if (totalMedia >= 4) {
        return 'grid-quarter';
    }
    return 'grid-full';
}

// ===== EXPORT FUNCTIONS =====
window.initCreative = initCreative;
window.loadCreativeData = loadCreativeData;
window.toggleLike = toggleLike;
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.toggleReadMore = toggleReadMore;
window.openMediaViewer = openMediaViewer;
window.closeMediaViewer = closeMediaViewerHandler;
window.showPrevMedia = showPrevMedia;
window.showNextMedia = showNextMedia;
window.removeEditMedia = removeEditMedia;
window.handleUpload = handleUpload;