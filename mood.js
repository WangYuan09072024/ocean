// Mood & Journal Module - COMPLETE FIXED VERSION
(function() {
    'use strict';

    // ==================== GLOBAL VARIABLES ====================
    let moodData = {
        entries: [] // Combined mood & journal entries
    };

    let currentEditingEntry = null;
    let currentAnalysisPeriod = 'today';
    let currentFilter = 'all';
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let timelinePage = 1;
    const timelinePageSize = 10;
    let isLoadingMore = false;
    let calendarDataCache = {};
    let selectedDateRange = null;

    // Enhanced emotion definitions
    const emotions = {
        // Very Positive
        ecstatic: { 
            name: 'Hân hoan', 
            emoji: '🤩', 
            color: '#FF6B6B', 
            category: 'very_positive'
        },
        blissful: { 
            name: 'Hạnh phúc tràn đầy', 
            emoji: '😇', 
            color: '#FF9F1C', 
            category: 'very_positive'
        },
        
        // Positive
        happy: { 
            name: 'Vui vẻ', 
            emoji: '😊', 
            color: '#FFD166', 
            category: 'positive'
        },
        content: { 
            name: 'Hài lòng', 
            emoji: '😌', 
            color: '#06D6A0', 
            category: 'positive'
        },
        grateful: { 
            name: 'Biết ơn', 
            emoji: '🙏', 
            color: '#4ECDC4', 
            category: 'positive'
        },
        confident: { 
            name: 'Tự tin', 
            emoji: '💪', 
            color: '#45B7D1', 
            category: 'positive'
        },
        
        // Neutral
        calm: { 
            name: 'Bình tĩnh', 
            emoji: '😐', 
            color: '#B8B8D1', 
            category: 'neutral'
        },
        thoughtful: { 
            name: 'Suy tư', 
            emoji: '🤔', 
            color: '#6D6875', 
            category: 'neutral'
        },
        tired: { 
            name: 'Mệt mỏi', 
            emoji: '😴', 
            color: '#96CEB4', 
            category: 'neutral'
        },
        
        // Negative
        sad: { 
            name: 'Buồn bã', 
            emoji: '😔', 
            color: '#577590', 
            category: 'negative'
        },
        anxious: { 
            name: 'Lo lắng', 
            emoji: '😰', 
            color: '#F3A712', 
            category: 'negative'
        },
        stressed: { 
            name: 'Căng thẳng', 
            emoji: '😫', 
            color: '#A8DADC', 
            category: 'negative'
        },
        frustrated: { 
            name: 'Bực bội', 
            emoji: '😤', 
            color: '#E76F51', 
            category: 'negative'
        },
        
        // Very Negative
        depressed: { 
            name: 'Trầm cảm', 
            emoji: '😢', 
            color: '#3A0CA3', 
            category: 'very_negative'
        },
        enraged: { 
            name: 'Phẫn nộ', 
            emoji: '😡', 
            color: '#E63946', 
            category: 'very_negative'
        }
    };

    // ==================== INITIALIZATION ====================
    function initMood() {
        console.log('🎭 Initializing Mood & Journal module...');
        
        // Kiểm tra xem Mood section có trong DOM không
        const moodSection = document.getElementById('mood');
        if (!moodSection) {
            console.error('❌ Mood section not found in DOM!');
            return;
        }
        
        try {
            // Setup all event listeners
            setupEventListeners();
            initEmotionSelector();
            initCalendar();
            
            // Initialize charts with empty data
            setTimeout(() => {
                createDonutChart([]);
                createFrequencyChart([]);
                createWeeklyPatternChart([]);
                createHourlyPatternChart([]);
                createTransitionMatrix([]);
            }, 100);
            
            console.log('✅ Mood module initialized successfully');
            
            // Kiểm tra xem có data chưa được load không
            if (moodData.entries && moodData.entries.length > 0) {
                console.log('📊 Data already loaded, updating UI...');
                updateAllUI();
            }
            
        } catch (error) {
            console.error('❌ Error initializing Mood module:', error);
        }
    }

    // ==================== CHART FUNCTIONS ====================
    function createDonutChart(entries) {
        const chartContainer = document.getElementById('emotion-donut-chart');
        if (!chartContainer) return;
        
        if (!entries || entries.length === 0) {
            chartContainer.innerHTML = '<div class="chart-center">0</div>';
            chartContainer.style.background = '#f8f9fa';
            return;
        }
        
        // Phân loại cảm xúc
        const categories = {
            'very_positive': 0,
            'positive': 0,
            'neutral': 0,
            'negative': 0,
            'very_negative': 0
        };
        
        entries.forEach(entry => {
            const emotion = emotions[entry.emotion];
            if (emotion && categories.hasOwnProperty(emotion.category)) {
                categories[emotion.category] += 1;
            }
        });
        
        // Tính phần trăm
        const total = entries.length;
        const percentages = {};
        Object.keys(categories).forEach(cat => {
            percentages[cat] = total > 0 ? Math.round((categories[cat] / total) * 100) : 0;
        });
        
        // Cập nhật phần trăm hiển thị
        document.getElementById('very-positive-percent').textContent = `${percentages['very_positive']}%`;
        document.getElementById('positive-percent').textContent = `${percentages['positive']}%`;
        document.getElementById('neutral-percent').textContent = `${percentages['neutral']}%`;
        document.getElementById('negative-percent').textContent = `${percentages['negative']}%`;
        document.getElementById('very-negative-percent').textContent = `${percentages['very_negative']}%`;
        
        // Tạo gradient cho biểu đồ
        const colors = {
            'very_positive': '#06D6A0',
            'positive': '#83E377',
            'neutral': '#FFD166',
            'negative': '#EF476F',
            'very_negative': '#7209B7'
        };
        
        let currentPercentage = 0;
        let gradientParts = [];
        
        Object.keys(percentages).forEach(cat => {
            if (percentages[cat] > 0) {
                const start = currentPercentage;
                const end = currentPercentage + percentages[cat];
                gradientParts.push(`${colors[cat]} ${start}% ${end}%`);
                currentPercentage = end;
            }
        });
        
        if (gradientParts.length === 0) {
            chartContainer.style.background = '#f8f9fa';
            chartContainer.innerHTML = '<div class="chart-center">0</div>';
        } else {
            chartContainer.style.background = `conic-gradient(${gradientParts.join(', ')})`;
            chartContainer.innerHTML = '<div class="chart-center">' + total + '</div>';
        }
    }

    function createFrequencyChart(entries) {
        const chartContainer = document.getElementById('emotion-frequency-chart');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = '';
        
        if (!entries || entries.length === 0) {
            chartContainer.innerHTML = '<div class="no-data">Chưa có dữ liệu</div>';
            return;
        }
        
        // Đếm tần suất từng cảm xúc
        const emotionCount = {};
        entries.forEach(entry => {
            emotionCount[entry.emotion] = (emotionCount[entry.emotion] || 0) + 1;
        });
        
        // Tìm max để tính tỷ lệ
        const maxCount = Math.max(...Object.values(emotionCount));
        const sortedEmotions = Object.entries(emotionCount)
            .sort(([, a], [, b]) => b - a);
        
        // Cập nhật cảm xúc phổ biến nhất và ít nhất
        const mostCommon = document.getElementById('most-common-emotion');
        const leastCommon = document.getElementById('least-common-emotion');
        
        if (mostCommon && sortedEmotions.length > 0) {
            const emotion = emotions[sortedEmotions[0][0]];
            mostCommon.textContent = emotion ? emotion.name : '--';
        }
        
        if (leastCommon && sortedEmotions.length > 1) {
            const emotion = emotions[sortedEmotions[sortedEmotions.length - 1][0]];
            leastCommon.textContent = emotion ? emotion.name : '--';
        } else if (leastCommon) {
            leastCommon.textContent = '--';
        }
        
        // Tạo bars (giới hạn 6 cảm xúc để hiển thị đẹp)
        const displayEmotions = sortedEmotions.slice(0, 6);
        displayEmotions.forEach(([emotionKey, count]) => {
            const emotion = emotions[emotionKey];
            if (!emotion) return;
            
            const bar = document.createElement('div');
            bar.className = 'frequency-bar';
            bar.style.height = `${(count / maxCount) * 100}%`;
            bar.style.backgroundColor = emotion.color;
            bar.dataset.label = emotion.name;
            bar.title = `${emotion.name}: ${count} lần`;
            
            chartContainer.appendChild(bar);
        });
    }

    function createWeeklyPatternChart(entries) {
        const chartContainer = document.getElementById('weekly-pattern-chart');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = '';
        
        if (!entries || entries.length === 0) {
            chartContainer.innerHTML = '<div class="no-data">Chưa có đủ dữ liệu</div>';
            return;
        }
        
        // Phân tích theo ngày trong tuần
        const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayScores = Array(7).fill(0);
        const dayCounts = Array(7).fill(0);
        
        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const day = date.getDay(); // 0 = CN, 1 = T2, ...
            const emotion = emotions[entry.emotion];
            
            if (emotion) {
                let score = entry.intensity;
                if (emotion.category === 'very_positive') score *= 2;
                else if (emotion.category === 'positive') score *= 1.5;
                else if (emotion.category === 'very_negative') score *= 0.2;
                else if (emotion.category === 'negative') score *= 0.5;
                
                dayScores[day] += score;
                dayCounts[day]++;
            }
        });
        
        // Tính điểm trung bình
        const avgScores = dayScores.map((score, i) => 
            dayCounts[i] > 0 ? score / dayCounts[i] : 0
        );
        
        // Tìm ngày tốt nhất và tồi nhất (chỉ xét ngày có dữ liệu)
        const validScores = avgScores.filter(score => score > 0);
        if (validScores.length === 0) {
            chartContainer.innerHTML = '<div class="no-data">Chưa có đủ dữ liệu</div>';
            document.getElementById('best-weekday').textContent = '--';
            document.getElementById('worst-weekday').textContent = '--';
            document.getElementById('weekly-pattern-trend').textContent = '--';
            return;
        }
        
        const maxScore = Math.max(...validScores);
        const minScore = Math.min(...validScores);
        
        const bestDayIndex = avgScores.indexOf(maxScore);
        const worstDayIndex = avgScores.indexOf(minScore);
        
        // Cập nhật thông tin
        document.getElementById('best-weekday').textContent = weekDays[bestDayIndex];
        document.getElementById('worst-weekday').textContent = weekDays[worstDayIndex];
        
        // Tính xu hướng (so sánh đầu tuần vs cuối tuần)
        const weekStartAvg = (avgScores[1] + avgScores[2] + avgScores[3]) / 3; // T2-T4
        const weekEndAvg = (avgScores[4] + avgScores[5] + avgScores[6]) / 3; // T5-T7
        
        let trend = 'Ổn định';
        if (weekEndAvg - weekStartAvg > 1) {
            trend = 'Cải thiện';
        } else if (weekStartAvg - weekEndAvg > 1) {
            trend = 'Giảm sút';
        }
        document.getElementById('weekly-pattern-trend').textContent = trend;
        
        // Tạo biểu đồ đơn giản
        const maxHeight = 80;
        weekDays.forEach((day, index) => {
            const bar = document.createElement('div');
            bar.className = 'week-bar';
            bar.style.height = `${avgScores[index] > 0 ? (avgScores[index] / 10) * maxHeight : 10}px`;
            bar.style.width = '25px';
            bar.style.backgroundColor = avgScores[index] > 0 ? 
                (index === bestDayIndex ? '#06D6A0' : 
                 index === worstDayIndex ? '#EF476F' : '#8a6cd8') : '#e9ecef';
            bar.title = `${day}: ${avgScores[index].toFixed(1)} điểm (${dayCounts[index]} lần)`;
            chartContainer.appendChild(bar);
        });
    }

    function createHourlyPatternChart(entries) {
        const chartContainer = document.getElementById('hourly-pattern-chart');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = '';
        
        if (!entries || entries.length === 0) {
            chartContainer.innerHTML = '<div class="no-data">Chưa có đủ dữ liệu</div>';
            document.getElementById('best-hour').textContent = '--';
            document.getElementById('worst-hour').textContent = '--';
            document.getElementById('peak-hour').textContent = '--';
            return;
        }
        
        // Phân tích theo giờ
        const hourScores = Array(24).fill(0);
        const hourCounts = Array(24).fill(0);
        
        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const hour = date.getHours();
            const emotion = emotions[entry.emotion];
            
            if (emotion) {
                let score = entry.intensity;
                if (emotion.category === 'very_positive') score *= 2;
                else if (emotion.category === 'positive') score *= 1.5;
                
                hourScores[hour] += score;
                hourCounts[hour]++;
            }
        });
        
        // Tính điểm trung bình và tìm giờ tốt/tồi
        const avgScores = hourScores.map((score, i) => 
            hourCounts[i] > 0 ? score / hourCounts[i] : 0
        );
        
        // Tìm giờ có dữ liệu
        const hoursWithData = avgScores.map((score, i) => score > 0 ? i : -1).filter(i => i !== -1);
        
        if (hoursWithData.length === 0) {
            chartContainer.innerHTML = '<div class="no-data">Chưa có đủ dữ liệu</div>';
            document.getElementById('best-hour').textContent = '--';
            document.getElementById('worst-hour').textContent = '--';
            document.getElementById('peak-hour').textContent = '--';
            return;
        }
        
        // Tìm giờ tốt nhất, tồi nhất, và đỉnh điểm
        let bestHour = -1, worstHour = -1, peakHour = -1;
        let bestScore = -1, worstScore = 100, maxCount = -1;
        
        hourCounts.forEach((count, hour) => {
            if (count > maxCount) {
                maxCount = count;
                peakHour = hour;
            }
        });
        
        hoursWithData.forEach(hour => {
            const score = avgScores[hour];
            if (score > bestScore) {
                bestScore = score;
                bestHour = hour;
            }
            if (score < worstScore) {
                worstScore = score;
                worstHour = hour;
            }
        });
        
        // Cập nhật thông tin
        document.getElementById('best-hour').textContent = bestHour !== -1 ? `${bestHour}h` : '--';
        document.getElementById('worst-hour').textContent = worstHour !== -1 ? `${worstHour}h` : '--';
        document.getElementById('peak-hour').textContent = peakHour !== -1 ? `${peakHour}h` : '--';
        
        // Tạo biểu đồ đơn giản (chỉ hiển thị giờ có dữ liệu)
        const maxHeight = 80;
        hoursWithData.slice(0, 8).forEach(hour => { // Giới hạn 8 giờ để hiển thị đẹp
            const bar = document.createElement('div');
            bar.className = 'hour-bar';
            bar.style.height = `${avgScores[hour] > 0 ? (avgScores[hour] / 10) * maxHeight : 5}px`;
            bar.style.width = '20px';
            bar.style.backgroundColor = avgScores[hour] > 0 ? 
                (hour === bestHour ? '#06D6A0' : 
                 hour === worstHour ? '#EF476F' : 
                 hour === peakHour ? '#FFD166' : '#8a6cd8') : '#e9ecef';
            bar.title = `${hour}h: ${avgScores[hour].toFixed(1)} điểm (${hourCounts[hour]} lần)`;
            chartContainer.appendChild(bar);
        });
    }

    function createTransitionMatrix(entries) {
        const chartContainer = document.getElementById('transition-matrix');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = '';
        
        if (!entries || entries.length < 2) {
            chartContainer.innerHTML = '<div class="no-data">Cần ít nhất 2 ghi chép để phân tích</div>';
            document.getElementById('common-transition').textContent = '--';
            document.getElementById('recovery-speed').textContent = '--';
            document.getElementById('stability-index').textContent = '--';
            return;
        }
        
        // Sắp xếp theo thời gian
        const sortedEntries = [...entries].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        // Phân tích chuyển tiếp
        const transitions = {};
        let recoveryCount = 0;
        let totalTransitions = 0;
        
        for (let i = 1; i < sortedEntries.length; i++) {
            const prev = sortedEntries[i-1];
            const current = sortedEntries[i];
            
            const prevEmotion = emotions[prev.emotion];
            const currentEmotion = emotions[current.emotion];
            
            if (prevEmotion && currentEmotion) {
                const key = `${prevEmotion.category} → ${currentEmotion.category}`;
                transitions[key] = (transitions[key] || 0) + 1;
                totalTransitions++;
                
                // Đếm chuyển tiếp từ tiêu cực sang tích cực (hồi phục)
                if ((prevEmotion.category === 'negative' || prevEmotion.category === 'very_negative') &&
                    (currentEmotion.category === 'positive' || currentEmotion.category === 'very_positive')) {
                    recoveryCount++;
                }
            }
        }
        
        // Tìm chuyển tiếp phổ biến nhất
        let commonTransition = '--';
        let maxCount = 0;
        
        Object.entries(transitions).forEach(([transition, count]) => {
            if (count > maxCount) {
                maxCount = count;
                commonTransition = transition;
            }
        });
        
        // Tính tốc độ hồi phục và độ ổn định
        const recoverySpeed = totalTransitions > 0 ? 
            Math.round((recoveryCount / totalTransitions) * 100) : 0;
        
        const stabilityIndex = calculateStabilityIndex(sortedEntries);
        
        // Cập nhật thông tin
        document.getElementById('common-transition').textContent = commonTransition;
        document.getElementById('recovery-speed').textContent = `${recoverySpeed}%`;
        document.getElementById('stability-index').textContent = `${stabilityIndex}/10`;
        
        // Tạo ma trận đơn giản
        const categories = ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'];
        const matrixSize = 5;
        
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                const key = `${categories[i]} → ${categories[j]}`;
                const count = transitions[key] || 0;
                
                cell.style.backgroundColor = count > 0 ? 
                    `rgba(170, 150, 218, ${Math.min(count / Math.max(1, maxCount), 1)})` : '#f8f9fa';
                cell.title = `${key}: ${count} lần`;
                cell.style.width = '18px';
                cell.style.height = '18px';
                cell.style.margin = '1px';
                cell.style.borderRadius = '3px';
                
                chartContainer.appendChild(cell);
            }
        }
    }

    function calculateStabilityIndex(entries) {
        if (entries.length < 3) return 0;
        
        let stabilityScore = 0;
        let totalComparisons = 0;
        
        for (let i = 1; i < entries.length; i++) {
            const prev = entries[i-1];
            const current = entries[i];
            
            const prevEmotion = emotions[prev.emotion];
            const currentEmotion = emotions[current.emotion];
            
            if (prevEmotion && currentEmotion) {
                // Cùng category = ổn định
                if (prevEmotion.category === currentEmotion.category) {
                    stabilityScore += 2;
                }
                // Chuyển tiếp nhẹ (neutral ↔ positive/negative)
                else if ((prevEmotion.category === 'neutral' && 
                         (currentEmotion.category === 'positive' || currentEmotion.category === 'negative')) ||
                        (currentEmotion.category === 'neutral' && 
                         (prevEmotion.category === 'positive' || prevEmotion.category === 'negative'))) {
                    stabilityScore += 1;
                }
                // Chuyển tiếp mạnh (positive ↔ negative)
                else if ((prevEmotion.category === 'positive' && currentEmotion.category === 'negative') ||
                        (prevEmotion.category === 'negative' && currentEmotion.category === 'positive')) {
                    stabilityScore -= 1;
                }
                // Chuyển tiếp cực đoan
                else if ((prevEmotion.category === 'very_positive' && currentEmotion.category === 'very_negative') ||
                        (prevEmotion.category === 'very_negative' && currentEmotion.category === 'very_positive')) {
                    stabilityScore -= 2;
                }
                
                totalComparisons++;
            }
        }
        
        // Chuẩn hóa về thang điểm 0-10
        if (totalComparisons === 0) return 0;
        const normalizedScore = Math.max(0, Math.min(10, 5 + (stabilityScore / totalComparisons)));
        return Math.round(normalizedScore);
    }

    // ==================== FIXED DATA SAVING ====================
    function saveMoodData() {
        console.log('💾 Attempting to save mood data...');
        
        if (!window.currentUser) {
            console.log('🚫 User not logged in');
            // Fallback to localStorage
            saveToLocalStorage();
            return;
        }
        
        if (typeof window.db === 'undefined') {
            console.log('🚫 Firebase not initialized');
            saveToLocalStorage();
            return;
        }
        
        const dataToSave = {
            entries: moodData.entries || [],
            lastUpdated: new Date().toISOString(),
            totalEntries: moodData.entries.length
        };
        
        console.log('💾 Saving to Firebase:', dataToSave);
        
        const userRef = window.db.collection('users').doc(window.currentUser.uid);
        
        userRef.set({
            mood: dataToSave,
            updatedAt: new Date().toISOString()
        }, { merge: true })
        .then(() => {
            console.log('✅ Mood data saved successfully to Firebase');
            showToast('✅ Đã lưu dữ liệu thành công!', 'success');
            
            // Clear localStorage backup after successful save
            try {
                localStorage.removeItem('mood_backup');
            } catch (e) {
                // Ignore localStorage errors
            }
        })
        .catch(error => {
            console.error('❌ Error saving to Firebase:', error);
            showToast('⚠️ Lưu đám mây thất bại, đang lưu cục bộ...', 'warning');
            saveToLocalStorage();
        });
    }

    function saveToLocalStorage() {
        try {
            const backupData = {
                entries: moodData.entries,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('mood_backup', JSON.stringify(backupData));
            console.log('📦 Mood data saved to localStorage');
            showToast('✅ Đã lưu dữ liệu cục bộ', 'info');
        } catch (e) {
            console.error('❌ Cannot save to localStorage:', e);
            showToast('❌ Lỗi khi lưu dữ liệu', 'error');
        }
    }

    // ==================== DATA MANAGEMENT ====================
    function loadMoodData(userData) {
        console.log('📥 Loading mood data...');
        
        let loadedData = [];
        
        // Ưu tiên load từ Firebase
        if (userData && userData.mood) {
            if (userData.mood.entries && Array.isArray(userData.mood.entries)) {
                loadedData = userData.mood.entries;
                console.log('📥 Loaded from Firebase mood.entries');
            } else if (Array.isArray(userData.mood)) {
                loadedData = userData.mood;
                console.log('📥 Loaded from Firebase mood array');
            }
        }
        
        // Nếu không có data từ Firebase, thử load từ localStorage
        if (loadedData.length === 0) {
            try {
                const backup = localStorage.getItem('mood_backup');
                if (backup) {
                    const backupData = JSON.parse(backup);
                    if (backupData.entries && Array.isArray(backupData.entries)) {
                        loadedData = backupData.entries;
                        console.log('📥 Loaded from localStorage backup');
                        showToast('📂 Đã tải dữ liệu từ bản lưu cục bộ', 'info');
                    }
                }
            } catch (e) {
                console.error('❌ Error loading from localStorage:', e);
            }
        }
        
        moodData.entries = loadedData;
        
        // Sort by timestamp (newest first)
        moodData.entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log('📥 Total entries loaded:', moodData.entries.length);
        
        // Update UI immediately
        setTimeout(() => {
            try {
                updateAllUI();
                console.log('✅ Mood data loaded and UI updated');
                
                // Show message if no data
                if (moodData.entries.length === 0) {
                    showToast('📝 Hãy bắt đầu ghi nhận cảm xúc đầu tiên!', 'info');
                }
            } catch (error) {
                console.error('❌ Error updating UI after data load:', error);
            }
        }, 300);
    }

    function addMoodEntry(entryData) {
        console.log('➕ Adding new mood entry:', entryData);
        
        const entry = {
            id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: 'mood_journal',
            timestamp: entryData.timestamp || new Date().toISOString(),
            emotion: entryData.emotion,
            intensity: entryData.intensity || 5,
            title: entryData.title || '',
            content: entryData.content || '',
            createdAt: new Date().toISOString()
        };

        moodData.entries.unshift(entry);
        console.log('✅ Entry added, total entries:', moodData.entries.length);
        
        // Save to Firebase AND localStorage immediately
        saveMoodData();
        
        // Update UI immediately
        setTimeout(() => {
            updateAllUI();
            updateEnhancedAnalysis(currentAnalysisPeriod);
        }, 500);
        
        return entry;
    }

    function updateMoodEntry(entryId, updates) {
        const index = moodData.entries.findIndex(e => e.id === entryId);
        if (index !== -1) {
            moodData.entries[index] = {
                ...moodData.entries[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            saveMoodData();
            return true;
        }
        return false;
    }

    function deleteMoodEntry(entryId) {
        moodData.entries = moodData.entries.filter(e => e.id !== entryId);
        saveMoodData();
        return true;
    }

    // ==================== EVENT LISTENERS ====================
    function setupEventListeners() {
        console.log('🔗 Setting up event listeners...');
        
        const moodSection = document.getElementById('mood');
        if (!moodSection) {
            console.error('❌ Mood section not found for event listeners');
            return;
        }
        
        // Sử dụng event delegation
        moodSection.addEventListener('click', function(e) {
            // Handle new entry button
            if (e.target.closest('#new-entry-btn')) {
                e.preventDefault();
                openCombinedModal();
            }
            if (e.target.closest('#start-tracking')) {
                e.preventDefault();
                openCombinedModal();
            }
            if (e.target.closest('#add-today-mood')) {
                e.preventDefault();
                openCombinedModal();
            }
            
            // Handle refresh buttons
            if (e.target.closest('#refresh-today')) {
                e.preventDefault();
                updateAllUI();
                showToast('Đã làm mới dữ liệu', 'info');
            }
            if (e.target.closest('#refresh-analysis')) {
                e.preventDefault();
                updateEnhancedAnalysis(currentAnalysisPeriod);
                showToast('Đã làm mới phân tích', 'info');
            }
            
            // Handle timeline controls
            if (e.target.closest('#clear-filters')) {
                e.preventDefault();
                clearFilters();
            }
            if (e.target.closest('#load-more-timeline')) {
                e.preventDefault();
                loadMoreTimelineEntries();
            }
            
            // Handle calendar controls
            if (e.target.closest('#prev-month')) {
                e.preventDefault();
                goToPrevMonth();
            }
            if (e.target.closest('#next-month')) {
                e.preventDefault();
                goToNextMonth();
            }
            
            // Handle modal close
            if (e.target.closest('.close')) {
                e.preventDefault();
                closeModal();
            }
            
            // Handle period selector buttons
            if (e.target.closest('.period-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.period-btn');
                handlePeriodSelect({ currentTarget: btn });
            }
        });
        
        // Add change event listeners
        const timelineFilter = document.getElementById('timeline-filter');
        if (timelineFilter) {
            timelineFilter.addEventListener('change', handleTimelineFilter);
        }
        
        // Custom date range
        const applyRangeBtn = document.getElementById('apply-custom-range');
        if (applyRangeBtn) {
            applyRangeBtn.addEventListener('click', applyCustomDateRange);
        }
        
        // Form event listeners (chỉ trong modal)
        setupModalEventListeners();
        
        console.log('✅ Event listeners setup complete');
    }

    function setupModalEventListeners() {
        const modal = document.getElementById('mood-journal-modal');
        if (!modal) return;
        
        // Modal close
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Form buttons
        const nextToJournal = document.getElementById('next-to-journal');
        if (nextToJournal) {
            nextToJournal.addEventListener('click', goToJournalStep);
        }
        
        const backToEmotion = document.getElementById('back-to-emotion');
        if (backToEmotion) {
            backToEmotion.addEventListener('click', goToEmotionStep);
        }
        
        const changeEmotion = document.getElementById('change-emotion');
        if (changeEmotion) {
            changeEmotion.addEventListener('click', goToEmotionStep);
        }
        
        const cancelForm = document.getElementById('cancel-form');
        if (cancelForm) {
            cancelForm.addEventListener('click', closeModal);
        }
        
        const saveCompleteEntry = document.getElementById('save-complete-entry');
        if (saveCompleteEntry) {
            saveCompleteEntry.addEventListener('click', saveCombinedEntry);
        }
        
        // Form inputs
        const moodIntensity = document.getElementById('mood-intensity');
        if (moodIntensity) {
            moodIntensity.addEventListener('input', updateIntensityVisual);
        }
        
        const journalTitle = document.getElementById('journal-title');
        if (journalTitle) {
            journalTitle.addEventListener('input', updateTitleCount);
        }
        
        const journalContent = document.getElementById('journal-content');
        if (journalContent) {
            journalContent.addEventListener('input', updateContentCount);
        }
    }

    function initEmotionSelector() {
        const emotionGrid = document.getElementById('primary-emotions');
        if (!emotionGrid) {
            console.log('⏸️ Emotion grid not found, skipping initialization');
            return;
        }
        
        emotionGrid.innerHTML = '';
        
        Object.entries(emotions).forEach(([key, emotion]) => {
            const item = document.createElement('div');
            item.className = 'emotion-item';
            item.dataset.emotion = key;
            item.dataset.category = emotion.category;
            
            item.innerHTML = `
                <div class="emotion-emoji">${emotion.emoji}</div>
                <div class="emotion-name">${emotion.name}</div>
            `;
            
            item.addEventListener('click', function() {
                selectEmotion(this, key, emotion);
            });
            
            emotionGrid.appendChild(item);
        });
        
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const category = this.dataset.category;
                filterEmotionsByCategory(category);
                
                // Update active tab
                document.querySelectorAll('.category-tab').forEach(t => {
                    t.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    }

    function initCalendar() {
        const monthDisplay = document.getElementById('current-month-display');
        if (!monthDisplay) {
            console.log('⏸️ Calendar elements not found');
            return;
        }
        
        updateMonthDisplay();
        renderMoodCalendar();
    }

    // ==================== MODAL FUNCTIONS ====================
    function openCombinedModal(entryToEdit = null) {
        const modal = document.getElementById('mood-journal-modal');
        if (!modal) {
            console.error('❌ Modal not found');
            return;
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        resetForm();
        
        if (entryToEdit) {
            currentEditingEntry = entryToEdit;
            populateFormForEditing(entryToEdit);
            const modalHeader = modal.querySelector('.modal-header h2');
            if (modalHeader) {
                modalHeader.innerHTML = '<i class="fas fa-edit"></i> Chỉnh Sửa Ghi Chép';
            }
        } else {
            currentEditingEntry = null;
            const modalHeader = modal.querySelector('.modal-header h2');
            if (modalHeader) {
                modalHeader.innerHTML = '<i class="fas fa-heart-circle-plus"></i> Ghi Nhận Cảm Xúc & Nhật Ký';
            }
        }
        
        setTimeout(() => {
            if (document.getElementById('step-emotion')) {
                showStep('step-emotion');
                updateIntensityVisual();
            }
        }, 50);
    }

    function closeModal() {
        const modal = document.getElementById('mood-journal-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        resetForm();
        currentEditingEntry = null;
    }

    function resetForm() {
        document.querySelectorAll('.emotion-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const preview = document.getElementById('selected-emotion-preview');
        if (preview) {
            preview.style.display = 'none';
        }
        
        const moodIntensity = document.getElementById('mood-intensity');
        if (moodIntensity) {
            moodIntensity.value = 5;
            updateIntensityVisual();
        }
        
        const journalTitle = document.getElementById('journal-title');
        const journalContent = document.getElementById('journal-content');
        if (journalTitle) journalTitle.value = '';
        if (journalContent) journalContent.value = '';
        
        updateTitleCount();
        updateContentCount();
        
        showStep('step-emotion');
    }

    function populateFormForEditing(entry) {
        const emotionItem = document.querySelector(`.emotion-item[data-emotion="${entry.emotion}"]`);
        if (emotionItem) {
            selectEmotion(emotionItem, entry.emotion, emotions[entry.emotion]);
        }
        
        const moodIntensity = document.getElementById('mood-intensity');
        if (moodIntensity) {
            moodIntensity.value = entry.intensity || 5;
            updateIntensityVisual();
        }
        
        const journalTitle = document.getElementById('journal-title');
        const journalContent = document.getElementById('journal-content');
        if (journalTitle) journalTitle.value = entry.title || '';
        if (journalContent) journalContent.value = entry.content || '';
        
        updateTitleCount();
        updateContentCount();
    }

    function showStep(stepId) {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        const step = document.getElementById(stepId);
        if (step) {
            step.classList.add('active');
        }
    }

    function goToJournalStep() {
        const selectedEmotion = document.querySelector('.emotion-item.selected');
        if (!selectedEmotion) {
            showToast('Vui lòng chọn một cảm xúc trước khi tiếp tục', 'warning');
            return;
        }
        
        updateEmotionSummary();
        showStep('step-journal');
    }

    function goToEmotionStep() {
        showStep('step-emotion');
    }

    // ==================== FORM HANDLING ====================
    function selectEmotion(element, emotionKey, emotion) {
        document.querySelectorAll('.emotion-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        element.classList.add('selected');
        
        const preview = document.getElementById('selected-emotion-preview');
        if (preview) {
            preview.style.display = 'block';
            
            const previewEmoji = preview.querySelector('#preview-emoji');
            const previewName = preview.querySelector('#preview-name');
            if (previewEmoji) previewEmoji.textContent = emotion.emoji;
            if (previewName) previewName.textContent = emotion.name;
        }
    }

    function filterEmotionsByCategory(category) {
        document.querySelectorAll('.emotion-item').forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    function updateIntensityVisual() {
        const slider = document.getElementById('mood-intensity');
        if (!slider) return;
        
        const value = parseInt(slider.value);
        
        const intensityValue = document.getElementById('intensity-value');
        if (intensityValue) {
            intensityValue.textContent = value;
        }
        
        const fill = document.getElementById('intensity-fill');
        if (fill) {
            fill.style.width = `${(value - 1) * 11.11}%`;
        }
        
        let description = '';
        if (value <= 3) {
            description = 'Nhẹ nhàng - Cảm nhận mờ nhạt, không rõ ràng';
        } else if (value <= 5) {
            description = 'Trung bình - Cảm nhận rõ ràng nhưng không quá mãnh liệt';
        } else if (value <= 7) {
            description = 'Mạnh - Cảm xúc rõ rệt, ảnh hưởng đến tâm trạng';
        } else if (value <= 9) {
            description = 'Rất mạnh - Cảm xúc mãnh liệt, chi phối suy nghĩ';
        } else {
            description = 'Cực mạnh - Cảm xúc tột độ, khó kiểm soát';
        }
        
        const intensityDescription = document.getElementById('intensity-description');
        if (intensityDescription) {
            intensityDescription.textContent = description;
        }
    }

    function updateEmotionSummary() {
        const selectedEmotion = document.querySelector('.emotion-item.selected');
        if (!selectedEmotion) return;
        
        const emotionKey = selectedEmotion.dataset.emotion;
        const emotion = emotions[emotionKey];
        const intensity = document.getElementById('mood-intensity')?.value || 5;
        
        const summaryEmoji = document.getElementById('summary-emoji');
        const summaryName = document.getElementById('summary-name');
        const summaryIntensity = document.getElementById('summary-intensity');
        
        if (summaryEmoji) summaryEmoji.textContent = emotion.emoji;
        if (summaryName) summaryName.textContent = emotion.name;
        if (summaryIntensity) summaryIntensity.textContent = `Cường độ: ${intensity}/10`;
    }

    function updateTitleCount() {
        const title = document.getElementById('journal-title');
        const count = document.getElementById('title-count');
        if (title && count) {
            count.textContent = title.value.length;
        }
    }

    function updateContentCount() {
        const content = document.getElementById('journal-content');
        const count = document.getElementById('content-count');
        if (content && count) {
            const words = content.value.trim().split(/\s+/).filter(word => word.length > 0).length;
            count.textContent = words;
        }
    }

    async function saveCombinedEntry() {
        console.log('💾 Starting to save combined entry...');
        
        const selectedEmotion = document.querySelector('.emotion-item.selected');
        if (!selectedEmotion) {
            showToast('Vui lòng chọn một cảm xúc', 'warning');
            return;
        }
        
        const content = document.getElementById('journal-content')?.value.trim();
        if (!content || content.length < 10) {
            showToast('Vui lòng viết ít nhất 10 từ cho nội dung nhật ký', 'warning');
            return;
        }
        
        const emotionKey = selectedEmotion.dataset.emotion;
        const intensity = parseInt(document.getElementById('mood-intensity')?.value || 5);
        const title = document.getElementById('journal-title')?.value.trim() || '';
        const timestamp = new Date().toISOString();
        
        const entryData = {
            emotion: emotionKey,
            intensity: intensity,
            title: title,
            content: content,
            timestamp: timestamp
        };
        
        console.log('💾 Saving entry:', entryData);
        
        try {
            if (currentEditingEntry) {
                const success = updateMoodEntry(currentEditingEntry.id, entryData);
                if (success) {
                    showToast('✅ Đã cập nhật ghi chép thành công!', 'success');
                } else {
                    showToast('❌ Không tìm thấy ghi chép để cập nhật', 'error');
                }
            } else {
                const newEntry = addMoodEntry(entryData);
                console.log('✅ New entry created:', newEntry);
                showToast('✅ Đã lưu ghi chép thành công!', 'success');
            }
            
            setTimeout(() => {
                updateAllUI();
                updateEnhancedAnalysis(currentAnalysisPeriod);
            }, 300);
            
            closeModal();
            
        } catch (error) {
            console.error('Error saving entry:', error);
            showToast('❌ Lỗi khi lưu ghi chép: ' + error.message, 'error');
        }
    }

    // ==================== TIMELINE FUNCTIONS ====================
    function handleTimelineFilter() {
        const filter = document.getElementById('timeline-filter');
        if (!filter) return;
        
        currentFilter = filter.value;
        timelinePage = 1;
        
        if (filter.value === 'custom') {
            const picker = document.getElementById('custom-range-picker');
            if (picker) picker.style.display = 'block';
        } else {
            const picker = document.getElementById('custom-range-picker');
            if (picker) picker.style.display = 'none';
            renderTimeline();
        }
    }

    function clearFilters() {
        const timelineFilter = document.getElementById('timeline-filter');
        if (timelineFilter) {
            timelineFilter.value = 'all';
        }
        currentFilter = 'all';
        selectedDateRange = null;
        timelinePage = 1;
        renderTimeline();
        showToast('Đã xóa bộ lọc', 'info');
    }

    function applyCustomDateRange() {
        const startDate = document.getElementById('start-date')?.value;
        const endDate = document.getElementById('end-date')?.value;
        
        if (!startDate || !endDate) {
            showToast('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc', 'warning');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            showToast('Ngày bắt đầu phải trước ngày kết thúc', 'warning');
            return;
        }
        
        selectedDateRange = { start: startDate, end: endDate };
        timelinePage = 1;
        renderTimeline();
        
        showToast(`Đã áp dụng lọc từ ${formatDateDisplay(startDate)} đến ${formatDateDisplay(endDate)}`, 'success');
    }

    function getFilteredEntries() {
        let entries = [...moodData.entries];
        
        if (currentFilter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            entries = entries.filter(entry => 
                entry.timestamp.split('T')[0] === today
            );
        } else if (currentFilter === 'week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            entries = entries.filter(entry => 
                new Date(entry.timestamp) >= oneWeekAgo
            );
        } else if (currentFilter === 'month') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            entries = entries.filter(entry => 
                new Date(entry.timestamp) >= oneMonthAgo
            );
        } else if (currentFilter === 'year') {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            entries = entries.filter(entry => 
                new Date(entry.timestamp) >= oneYearAgo
            );
        } else if (currentFilter === 'custom' && selectedDateRange) {
            entries = entries.filter(entry => {
                const entryDate = entry.timestamp.split('T')[0];
                return entryDate >= selectedDateRange.start && 
                       entryDate <= selectedDateRange.end;
            });
        }
        
        return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function renderTimeline() {
        const timeline = document.getElementById('mood-timeline');
        if (!timeline) return;
        
        const filteredEntries = getFilteredEntries();
        const startIndex = (timelinePage - 1) * timelinePageSize;
        const endIndex = startIndex + timelinePageSize;
        const pageEntries = filteredEntries.slice(startIndex, endIndex);
        
        if (timelinePage === 1) {
            timeline.innerHTML = '';
        }
        
        if (pageEntries.length === 0 && timelinePage === 1) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="emoji">🔍</div>
                <h3>Không tìm thấy ghi chép</h3>
                <p>${currentFilter === 'all' ? 
                    'Hãy bắt đầu ghi nhận cảm xúc đầu tiên!' : 
                    'Thử thay đổi bộ lọc hoặc tạo ghi chép mới'}</p>
                ${currentFilter !== 'all' ? `
                    <button id="show-all-entries" class="btn-secondary">
                        <i class="fas fa-eye"></i> Xem tất cả
                    </button>
                ` : ''}
            `;
            timeline.appendChild(emptyState);
            
            const showAllBtn = timeline.querySelector('#show-all-entries');
            if (showAllBtn) {
                showAllBtn.addEventListener('click', () => {
                    const timelineFilter = document.getElementById('timeline-filter');
                    if (timelineFilter) timelineFilter.value = 'all';
                    currentFilter = 'all';
                    timelinePage = 1;
                    renderTimeline();
                });
            }
            
            updateLoadMoreButton(filteredEntries.length, 0);
            return;
        }
        
        pageEntries.forEach(entry => {
            renderTimelineEntry(entry, timeline);
        });
        
        updateLoadMoreButton(filteredEntries.length, endIndex);
        
        const currentCount = document.getElementById('current-count');
        const totalCount = document.getElementById('total-count');
        if (currentCount) currentCount.textContent = Math.min(endIndex, filteredEntries.length);
        if (totalCount) totalCount.textContent = filteredEntries.length;
        
        isLoadingMore = false;
    }

    function renderTimelineEntry(entry, container) {
        const emotion = emotions[entry.emotion];
        if (!emotion) return;
        
        const time = formatTime(new Date(entry.timestamp));
        const date = formatDateDisplay(entry.timestamp.split('T')[0]);
        
        const entryElement = document.createElement('div');
        entryElement.className = 'timeline-entry';
        entryElement.style.borderLeftColor = emotion.color;
        entryElement.dataset.entryId = entry.id;
        
        entryElement.innerHTML = `
            <div class="timeline-time">
                <span class="time">${time}</span>
                <span class="date">${date}</span>
            </div>
            <div class="timeline-content">
                <div class="entry-header">
                    <span class="entry-type mood" style="background-color: ${emotion.color}20; color: ${emotion.color};">
                        <i class="fas fa-heart"></i> Cảm xúc
                    </span>
                    <span class="entry-emotion" style="color: ${emotion.color}">
                        ${emotion.emoji} ${emotion.name}
                    </span>
                </div>
                ${entry.title ? `
                    <div class="entry-title">${entry.title}</div>
                ` : ''}
                ${entry.content ? `
                    <div class="entry-text">
                        ${entry.content.substring(0, 200)}${entry.content.length > 200 ? '...' : ''}
                    </div>
                ` : ''}
                <div class="entry-meta">
                    <span class="intensity-display">
                        <i class="fas fa-bolt" style="color: ${emotion.color}"></i>
                        Cường độ: ${entry.intensity}/10
                    </span>
                </div>
            </div>
            <div class="timeline-actions">
                <button class="btn-icon edit-entry" data-id="${entry.id}" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete delete-entry" data-id="${entry.id}" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(entryElement);
        
        const editBtn = entryElement.querySelector('.edit-entry');
        const deleteBtn = entryElement.querySelector('.delete-entry');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                openCombinedModal(entry);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                const confirmed = await showConfirm('Bạn có chắc muốn xóa ghi chép này?', 'Xác nhận xóa');
                if (confirmed) {
                    deleteMoodEntry(entry.id);
                    updateAllUI();
                    showToast('✅ Đã xóa ghi chép thành công!', 'success');
                }
            });
        }
    }

    function loadMoreTimelineEntries() {
        if (isLoadingMore) return;
        
        isLoadingMore = true;
        timelinePage++;
        
        const loadMoreBtn = document.getElementById('load-more-timeline');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
            loadMoreBtn.disabled = true;
        }
        
        setTimeout(() => {
            renderTimeline();
            
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = '<i class="fas fa-arrow-down"></i> Xem thêm';
                loadMoreBtn.disabled = false;
            }
        }, 500);
    }

    function updateLoadMoreButton(totalEntries, currentCount) {
        const loadMoreBtn = document.getElementById('load-more-timeline');
        if (!loadMoreBtn) return;
        
        if (currentCount >= totalEntries) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    // ==================== CALENDAR FUNCTIONS ====================
    function goToPrevMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateMonthDisplay();
        renderMoodCalendar();
    }

    function goToNextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateMonthDisplay();
        renderMoodCalendar();
    }

    function updateMonthDisplay() {
        const monthNames = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        
        const monthDisplay = document.getElementById('current-month-display');
        if (monthDisplay) {
            monthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }
    }

    function renderMoodCalendar() {
        const calendarGrid = document.getElementById('mood-calendar-grid');
        if (!calendarGrid) return;
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        const today = new Date();
        const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
        
        calendarGrid.innerHTML = '';
        
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        const monthEntries = getEntriesForMonth(currentYear, currentMonth);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEntries = monthEntries.filter(entry => 
                entry.timestamp.split('T')[0] === dateStr
            );
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.dataset.date = dateStr;
            
            if (isCurrentMonth && day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            if (dayEntries.length > 0) {
                dayElement.classList.add('has-entry');
                
                const dominantEmotion = getDominantEmotionForDay(dayEntries);
                const emotion = emotions[dominantEmotion];
                const avgIntensity = calculateAverageIntensity(dayEntries);
                
                if (emotion) {
                    dayElement.style.backgroundColor = emotion.color + '20';
                    dayElement.style.borderColor = emotion.color;
                    
                    dayElement.innerHTML = `
                        <div class="day-number">${day}</div>
                        <div class="day-mood" style="color: ${emotion.color}">
                            ${emotion.emoji}
                        </div>
                        <div class="day-intensity">
                            <div class="day-intensity-fill" style="width: ${avgIntensity * 10}%; background: ${emotion.color}"></div>
                        </div>
                        <div class="day-count">${dayEntries.length}</div>
                    `;
                }
            } else {
                dayElement.innerHTML = `<div class="day-number">${day}</div>`;
            }
            
            calendarGrid.appendChild(dayElement);
        }
        
        updateCalendarStats(monthEntries);
    }

    function getEntriesForMonth(year, month) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        return moodData.entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= startDate && entryDate <= endDate;
        });
    }

    function getDominantEmotionForDay(entries) {
        if (entries.length === 0) return null;
        
        const emotionCount = {};
        entries.forEach(entry => {
            emotionCount[entry.emotion] = (emotionCount[entry.emotion] || 0) + 1;
        });
        
        return Object.keys(emotionCount).reduce((a, b) => 
            emotionCount[a] > emotionCount[b] ? a : b
        );
    }

    function calculateAverageIntensity(entries) {
        if (entries.length === 0) return 0;
        return entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length;
    }

    function updateCalendarStats(monthEntries) {
        const daysWithDataEl = document.getElementById('calendar-days-with-data');
        const bestMonthEl = document.getElementById('calendar-best-month');
        const trendEl = document.getElementById('calendar-trend');
        
        if (!daysWithDataEl || !bestMonthEl || !trendEl) return;
        
        if (monthEntries.length === 0) {
            daysWithDataEl.textContent = '0';
            bestMonthEl.textContent = '--';
            trendEl.textContent = '--';
            return;
        }
        
        const uniqueDays = new Set(monthEntries.map(entry => 
            entry.timestamp.split('T')[0]
        )).size;
        
        daysWithDataEl.textContent = uniqueDays;
        
        const days = {};
        monthEntries.forEach(entry => {
            const date = entry.timestamp.split('T')[0];
            if (!days[date]) {
                days[date] = {
                    entries: [],
                    positiveScore: 0
                };
            }
            days[date].entries.push(entry);
            
            const emotion = emotions[entry.emotion];
            if (emotion) {
                let score = entry.intensity;
                if (emotion.category === 'very_positive') score *= 2;
                else if (emotion.category === 'positive') score *= 1.5;
                else if (emotion.category === 'very_negative') score *= 0.2;
                else if (emotion.category === 'negative') score *= 0.5;
                
                days[date].positiveScore += score;
            }
        });
        
        let bestDay = null;
        let bestScore = -1;
        
        Object.entries(days).forEach(([date, data]) => {
            const avgScore = data.positiveScore / data.entries.length;
            if (avgScore > bestScore) {
                bestScore = avgScore;
                bestDay = date;
            }
        });
        
        if (bestDay) {
            const dayNum = new Date(bestDay).getDate();
            bestMonthEl.textContent = `Ngày ${dayNum}`;
        }
        
        if (currentMonth > 0) {
            const prevMonthEntries = getEntriesForMonth(currentYear, currentMonth - 1);
            if (prevMonthEntries.length > 0 && monthEntries.length > 0) {
                const prevMonthAvg = calculateAveragePositiveScore(prevMonthEntries);
                const currentMonthAvg = calculateAveragePositiveScore(monthEntries);
                const trend = currentMonthAvg - prevMonthAvg;
                
                let trendText = '';
                if (trend > 0.5) {
                    trendText = '📈 Cải thiện';
                } else if (trend < -0.5) {
                    trendText = '📉 Giảm sút';
                } else {
                    trendText = '➡️ Ổn định';
                }
                
                trendEl.textContent = trendText;
            }
        }
    }

    function calculateAveragePositiveScore(entries) {
        if (entries.length === 0) return 0;
        
        let totalScore = 0;
        entries.forEach(entry => {
            const emotion = emotions[entry.emotion];
            if (emotion) {
                let score = entry.intensity;
                if (emotion.category === 'very_positive') score *= 2;
                else if (emotion.category === 'positive') score *= 1.5;
                else if (emotion.category === 'very_negative') score *= 0.2;
                else if (emotion.category === 'negative') score *= 0.5;
                
                totalScore += score;
            }
        });
        
        return totalScore / entries.length;
    }

    // ==================== ENHANCED ANALYSIS FUNCTIONS ====================
    function updateEnhancedAnalysis(period) {
        console.log(`📊 Updating enhanced analysis for period: ${period}`);
        
        currentAnalysisPeriod = period;
        
        let analysisEntries = [];
        const now = new Date();
        
        switch (period) {
            case 'today':
                const today = now.toISOString().split('T')[0];
                analysisEntries = moodData.entries.filter(entry => 
                    entry.timestamp.split('T')[0] === today
                );
                break;
            case 'week':
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                analysisEntries = moodData.entries.filter(entry => 
                    new Date(entry.timestamp) >= oneWeekAgo
                );
                break;
            case 'month':
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                analysisEntries = moodData.entries.filter(entry => 
                    new Date(entry.timestamp) >= oneMonthAgo
                );
                break;
            case '3months':
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                analysisEntries = moodData.entries.filter(entry => 
                    new Date(entry.timestamp) >= threeMonthsAgo
                );
                break;
            case '6months':
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                analysisEntries = moodData.entries.filter(entry => 
                    new Date(entry.timestamp) >= sixMonthsAgo
                );
                break;
            case 'year':
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                analysisEntries = moodData.entries.filter(entry => 
                    new Date(entry.timestamp) >= oneYearAgo
                );
                break;
            case 'all':
                analysisEntries = [...moodData.entries];
                break;
        }
        
        console.log(`📊 Analysis entries count: ${analysisEntries.length}`);
        
        // Update all analysis components
        updateCurrentMoodAnalysis(analysisEntries);
        
        // Tạo biểu đồ
        createDonutChart(analysisEntries);
        createFrequencyChart(analysisEntries);
        createWeeklyPatternChart(analysisEntries);
        createHourlyPatternChart(analysisEntries);
        createTransitionMatrix(analysisEntries);
        
        updateTrendAnalysis(analysisEntries);
        updatePersonalizedRecommendations(analysisEntries);
        updateAdvancedStatistics(analysisEntries);
    }
    
    function updateCurrentMoodAnalysis(entries) {
        try {
            if (!entries || entries.length === 0) {
                // Set default values
                const defaultValues = {
                    'current-state': '--',
                    'current-avg-intensity': '--/10',
                    'current-volatility': '--',
                    'current-stability': '--/10',
                    'current-frequency': '--/ngày',
                    'current-best-time': '--'
                };
                
                Object.entries(defaultValues).forEach(([id, value]) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = value;
                });
                return;
            }
            
            const latestEntry = entries[0];
            const emotion = emotions[latestEntry.emotion];
            
            if (emotion) {
                const currentState = document.getElementById('current-state');
                if (currentState) currentState.textContent = emotion.name;
            }
            
            const avgIntensity = entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length;
            const currentAvgIntensity = document.getElementById('current-avg-intensity');
            if (currentAvgIntensity) currentAvgIntensity.textContent = `${avgIntensity.toFixed(1)}/10`;
            
        } catch (error) {
            console.error('❌ Error in updateCurrentMoodAnalysis:', error);
        }
    }
    
    function updateTrendAnalysis(entries) {
        try {
            if (!entries || entries.length === 0) {
                const defaultValues = {
                    'trend-main': '--',
                    'trend-growth': '--%',
                    'trend-volatility': '--',
                    'trend-transitions': '0',
                    'trend-cycle': '-- ngày',
                    'trend-phase-length': '-- ngày',
                    'trend-analysis-text': 'Cần thêm dữ liệu để phân tích xu hướng chi tiết.'
                };
                
                Object.entries(defaultValues).forEach(([id, value]) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = value;
                });
                return;
            }
            
            const trendMain = document.getElementById('trend-main');
            const trendAnalysisText = document.getElementById('trend-analysis-text');
            
            if (trendMain) trendMain.textContent = 'Ổn định';
            if (trendAnalysisText) trendAnalysisText.textContent = 'Cảm xúc ổn định. Đây là dấu hiệu tốt cho sức khỏe tinh thần của bạn.';
            
        } catch (error) {
            console.error('❌ Error in updateTrendAnalysis:', error);
        }
    }
    
    function updatePersonalizedRecommendations(entries) {
        try {
            const recommendationsContainer = document.getElementById('personalized-recommendations');
            if (!recommendationsContainer) return;
            
            if (!entries || entries.length === 0) {
                recommendationsContainer.innerHTML = `
                    <div class="recommendation-loading">
                        <i class="fas fa-info-circle"></i>
                        <span>Bắt đầu ghi nhận cảm xúc để nhận đề xuất phù hợp!</span>
                    </div>
                `;
                return;
            }
            
            recommendationsContainer.innerHTML = `
                <div class="recommendation">
                    <i class="fas fa-lightbulb"></i>
                    <span>Tiếp tục ghi nhận cảm xúc hàng ngày để có dữ liệu phân tích chính xác hơn.</span>
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Error in updatePersonalizedRecommendations:', error);
        }
    }
    
    function updateAdvancedStatistics(entries) {
        try {
            if (!entries || entries.length === 0) {
                const defaultValues = {
                    'stat-total-entries': '0',
                    'stat-positive-days': '0',
                    'stat-recovery-rate': '--%',
                    'stat-consistency': '--/10',
                    'stat-long-term-stability': '--',
                    'stat-forecast': '--',
                    'mental-health-index': '--/100',
                    'improvement-progress': '--%'
                };
                
                Object.entries(defaultValues).forEach(([id, value]) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = value;
                });
                return;
            }
            
            const statTotalEntries = document.getElementById('stat-total-entries');
            if (statTotalEntries) statTotalEntries.textContent = entries.length;
            
        } catch (error) {
            console.error('❌ Error in updateAdvancedStatistics:', error);
        }
    }

    // ==================== UI UPDATE FUNCTIONS ====================
    function updateAllUI() {
        if (!document.getElementById('total-entries-count')) {
            setTimeout(updateAllUI, 100);
            return;
        }
        
        try {
            updateQuickStats();
            updateDashboard();
            renderTimeline();
            updateEnhancedAnalysis(currentAnalysisPeriod);
            renderMoodCalendar();
            console.log('✅ UI updated successfully');
        } catch (error) {
            console.error('❌ Error updating UI:', error);
        }
    }

    function updateQuickStats() {
        const elements = [
            'total-entries-count',
            'positive-percentage',
            'avg-intensity',
            'days-with-data'
        ];
        
        for (const id of elements) {
            if (!document.getElementById(id)) {
                console.log(`⏸️ Element #${id} not found`);
                return;
            }
        }
        
        const totalEntries = moodData.entries.length;
        document.getElementById('total-entries-count').textContent = totalEntries;
        
        if (totalEntries > 0) {
            const positiveCount = moodData.entries.filter(entry => {
                const emotion = emotions[entry.emotion];
                return emotion && (emotion.category === 'positive' || emotion.category === 'very_positive');
            }).length;
            
            const positivePercentage = Math.round((positiveCount / totalEntries) * 100);
            document.getElementById('positive-percentage').textContent = `${positivePercentage}%`;
            
            const totalIntensity = moodData.entries.reduce((sum, entry) => sum + entry.intensity, 0);
            const avgIntensity = (totalIntensity / totalEntries).toFixed(1);
            document.getElementById('avg-intensity').textContent = `${avgIntensity}/10`;
        } else {
            document.getElementById('positive-percentage').textContent = '0%';
            document.getElementById('avg-intensity').textContent = '0/10';
        }
        
        const uniqueDays = new Set(moodData.entries.map(entry => 
            entry.timestamp.split('T')[0]
        )).size;
        document.getElementById('days-with-data').textContent = uniqueDays;
    }

    function updateDashboard() {
        updateTodayMood();
        updateWeeklyStats();
        updateMonthlyStats();
    }

    function updateTodayMood() {
        const elements = [
            'today-mood-emoji',
            'today-mood-name',
            'today-mood-intensity',
            'today-entries-count',
            'today-last-entry',
            'today-vs-yesterday'
        ];
        
        for (const id of elements) {
            if (!document.getElementById(id)) {
                console.log(`⏸️ Element #${id} not found`);
                return;
            }
        }
        
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = moodData.entries.filter(entry => 
            entry.timestamp.split('T')[0] === today
        );
        
        if (todayEntries.length > 0) {
            const latestEntry = todayEntries[0];
            const emotion = emotions[latestEntry.emotion];
            
            document.getElementById('today-mood-emoji').textContent = emotion.emoji;
            document.getElementById('today-mood-name').textContent = emotion.name;
            document.getElementById('today-mood-intensity').textContent = `Cường độ: ${latestEntry.intensity}/10`;
            document.getElementById('today-entries-count').textContent = todayEntries.length;
            
            const latestTime = formatTime(new Date(latestEntry.timestamp));
            document.getElementById('today-last-entry').textContent = latestTime;
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const yesterdayEntries = moodData.entries.filter(entry => 
                entry.timestamp.split('T')[0] === yesterdayStr
            );
            
            if (yesterdayEntries.length > 0) {
                const yesterdayAvg = calculateAveragePositiveScore(yesterdayEntries);
                const todayAvg = calculateAveragePositiveScore(todayEntries);
                const diff = todayAvg - yesterdayAvg;
                
                let comparison = '';
                if (diff > 0.5) {
                    comparison = '👍 Tốt hơn';
                } else if (diff < -0.5) {
                    comparison = '👎 Kém hơn';
                } else {
                    comparison = '😊 Tương đồng';
                }
                document.getElementById('today-vs-yesterday').textContent = comparison;
            } else {
                document.getElementById('today-vs-yesterday').textContent = '--';
            }
            
        } else {
            document.getElementById('today-mood-emoji').textContent = '😐';
            document.getElementById('today-mood-name').textContent = 'Chưa có dữ liệu';
            document.getElementById('today-mood-intensity').textContent = 'Cường độ: --/10';
            document.getElementById('today-entries-count').textContent = '0';
            document.getElementById('today-last-entry').textContent = '--:--';
            document.getElementById('today-vs-yesterday').textContent = '--';
        }
    }

    function updateWeeklyStats() {
        const elements = [
            'week-average',
            'week-best-day',
            'week-trend',
            'week-consistency',
            'current-week'
        ];
        
        for (const id of elements) {
            if (!document.getElementById(id)) {
                console.log(`⏸️ Element #${id} not found`);
                return;
            }
        }
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weekEntries = moodData.entries.filter(entry => 
            new Date(entry.timestamp) >= oneWeekAgo
        );
        
        if (weekEntries.length > 0) {
            const avgIntensity = weekEntries.reduce((sum, entry) => sum + entry.intensity, 0) / weekEntries.length;
            document.getElementById('week-average').textContent = `${avgIntensity.toFixed(1)}/10`;
            
            const days = {};
            weekEntries.forEach(entry => {
                const date = entry.timestamp.split('T')[0];
                if (!days[date]) {
                    days[date] = {
                        entries: [],
                        positiveScore: 0
                    };
                }
                days[date].entries.push(entry);
                
                const emotion = emotions[entry.emotion];
                if (emotion) {
                    let score = entry.intensity;
                    if (emotion.category === 'very_positive') score *= 2;
                    else if (emotion.category === 'positive') score *= 1.5;
                    
                    days[date].positiveScore += score;
                }
            });
            
            let bestDay = null;
            let bestAvgScore = -1;
            
            Object.entries(days).forEach(([date, data]) => {
                const avgScore = data.positiveScore / data.entries.length;
                if (avgScore > bestAvgScore) {
                    bestAvgScore = avgScore;
                    bestDay = date;
                }
            });
            
            if (bestDay) {
                const dayName = getDayName(new Date(bestDay));
                document.getElementById('week-best-day').textContent = dayName;
            }
            
            const sortedEntries = weekEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const midIndex = Math.floor(sortedEntries.length / 2);
            const firstHalf = sortedEntries.slice(0, midIndex);
            const secondHalf = sortedEntries.slice(midIndex);
            
            const firstHalfAvg = calculateAveragePositiveScore(firstHalf);
            const secondHalfAvg = calculateAveragePositiveScore(secondHalf);
            const trend = secondHalfAvg - firstHalfAvg;
            
            let trendText = '';
            if (trend > 0.3) {
                trendText = '📈 Lên';
            } else if (trend < -0.3) {
                trendText = '📉 Xuống';
            } else {
                trendText = '➡️ Ổn';
            }
            document.getElementById('week-trend').textContent = trendText;
            
        } else {
            document.getElementById('week-average').textContent = '--/10';
            document.getElementById('week-best-day').textContent = '--';
            document.getElementById('week-trend').textContent = '--';
            document.getElementById('week-consistency').textContent = '--';
        }
        
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - startOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
        document.getElementById('current-week').textContent = weekNumber;
    }

    function updateMonthlyStats() {
        const elements = [
            'month-entries-count',
            'month-dominant-emotion',
            'month-best-day',
            'month-growth',
            'current-month-name'
        ];
        
        for (const id of elements) {
            if (!document.getElementById(id)) {
                console.log(`⏸️ Element #${id} not found`);
                return;
            }
        }
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const monthEntries = moodData.entries.filter(entry => 
            new Date(entry.timestamp) >= oneMonthAgo
        );
        
        document.getElementById('month-entries-count').textContent = monthEntries.length;
        
        if (monthEntries.length > 0) {
            const emotionCount = {};
            monthEntries.forEach(entry => {
                emotionCount[entry.emotion] = (emotionCount[entry.emotion] || 0) + 1;
            });
            
            const dominantEmotionKey = Object.keys(emotionCount).reduce((a, b) => 
                emotionCount[a] > emotionCount[b] ? a : b
            );
            const dominantEmotion = emotions[dominantEmotionKey];
            document.getElementById('month-dominant-emotion').textContent = dominantEmotion ? dominantEmotion.name : '--';
            
        } else {
            document.getElementById('month-dominant-emotion').textContent = '--';
            document.getElementById('month-best-day').textContent = '--';
            document.getElementById('month-growth').textContent = '--';
        }
        
        const monthNames = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        document.getElementById('current-month-name').textContent = monthNames[new Date().getMonth()];
    }

    function handlePeriodSelect(e) {
        const period = e.currentTarget.dataset.period;
        
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        currentAnalysisPeriod = period;
        
        if (period === 'custom') {
            const picker = document.getElementById('custom-range-picker');
            if (picker) picker.style.display = 'block';
        } else {
            const picker = document.getElementById('custom-range-picker');
            if (picker) picker.style.display = 'none';
            updateEnhancedAnalysis(period);
        }
    }

    // ==================== UTILITY FUNCTIONS ====================
    function formatTime(date) {
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
    }

    function formatDateDisplay(dateString) {
        try {
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }

    function getDayName(date) {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        return days[date.getDay()];
    }

    function updateLastUpdateTime() {
        const element = document.getElementById('last-data-update');
        if (!element) return;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateStr = now.toLocaleDateString('vi-VN');
        
        element.textContent = `${timeStr} ${dateStr}`;
    }

    function showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        switch (type) {
            case 'success': icon = 'fa-check-circle'; break;
            case 'error': icon = 'fa-exclamation-circle'; break;
            case 'warning': icon = 'fa-exclamation-triangle'; break;
            default: icon = 'fa-info-circle'; break;
        }
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span class="toast-content">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, 5000);
    }

    async function showConfirm(message, title = 'Xác nhận') {
        return new Promise((resolve) => {
            if (window.showCustomConfirm) {
                window.showCustomConfirm(message, 
                    () => resolve(true),
                    () => resolve(false)
                );
            } else {
                resolve(confirm(`${title}: ${message}`));
            }
        });
    }

    // ==================== EXPORT TO GLOBAL SCOPE ====================
    window.initMood = function() {
        console.log('🎭 Initializing Mood module via global function...');
        initMood();
    };
    
    window.loadMoodData = function(userData) {
        console.log('📥 Loading mood data via global function...');
        loadMoodData(userData);
    };
    
    window.saveMoodData = saveMoodData;
    window.openCombinedModal = openCombinedModal;
    window.updateEnhancedAnalysis = updateEnhancedAnalysis;
    
    // Export all analysis functions
    window.updateCurrentMoodAnalysis = updateCurrentMoodAnalysis;
    window.updateEmotionDistribution = updateEmotionDistribution;
    window.updatePatternAnalysis = updatePatternAnalysis;
    window.updateTrendAnalysis = updateTrendAnalysis;
    window.updatePersonalizedRecommendations = updatePersonalizedRecommendations;
    window.updateAdvancedStatistics = updateAdvancedStatistics;

    console.log('✅ Mood module loaded successfully - Complete Fixed Version');
})();