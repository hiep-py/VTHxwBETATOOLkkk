// Constants
const VALID_ROOMS = {
    'NK': 'Nhà kho',
    'PH': 'Phòng họp',
    'PGD': 'Phòng giám đốc',
    'PTC': 'Phòng tài chính',
    'PNS': 'Phòng nhân sự',
    'PTV': 'Phòng tài vụ',
    'VP': 'Văn phòng',
    'PGS': 'Phòng giám sát'
};

const ROOM_ICONS = {
    'NK': '🏪',
    'PH': '🏢',
    'PGD': '👔',
    'PTC': '💰',
    'PNS': '👥',
    'PTV': '📊',
    'VP': '🏢',
    'PGS': '👀'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    updateUserInfo();
    setupRoomGrid();
    loadHelpContent();
    loadAboutContent();
    
    // Add smooth appearance
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 200);
});

// Initialize app state
function initializeApp() {
    if (!localStorage.getItem('currentSessionId')) {
        localStorage.setItem('currentSessionId', Date.now().toString());
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const screenId = e.target.getAttribute('href').substring(1);
            showScreen(screenId);
        });
    });
}

// Show selected screen with animation
function showScreen(screenId) {
    // Add exit animation
    document.querySelectorAll('.screen.active').forEach(screen => {
        screen.style.opacity = '0';
        screen.style.transform = 'translateY(20px)';
    });
    
    // Delay for animation
    setTimeout(() => {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show selected screen
        const selectedScreen = document.getElementById(screenId);
        selectedScreen.classList.add('active');
        
        // Trigger entrance animation (already handled by CSS transition)
        setTimeout(() => {
            selectedScreen.style.opacity = '';
            selectedScreen.style.transform = '';
        }, 50);
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${screenId}`) {
                link.classList.add('active');
            }
        });
        
        // Special handling for screens
        if (screenId === 'history') {
            updateHistory();
        }
    }, 300);
}

// Update user info
function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    userInfo.innerHTML = `
        <p><i class="fas fa-user me-2"></i><strong>Người dùng:</strong> ${navigator.userAgent}</p>
        <p><i class="fas fa-desktop me-2"></i><strong>Hệ điều hành:</strong> ${navigator.platform}</p>
        <p><i class="fas fa-fingerprint me-2"></i><strong>Session ID:</strong> ${localStorage.getItem('currentSessionId')}</p>
    `;
}

// Setup room grid with animation
function setupRoomGrid() {
    const roomGrid = document.getElementById('roomGrid');
    roomGrid.innerHTML = '';
    
    Object.entries(VALID_ROOMS).forEach(([code, name], index) => {
        const button = document.createElement('button');
        button.className = `room-button room-${code.toLowerCase()}`;
        button.innerHTML = `${ROOM_ICONS[code]}<br>${code}`;
        button.style.opacity = '0';
        button.style.transform = 'scale(0.8)';
        button.onclick = () => processRoom(code);
        
        roomGrid.appendChild(button);
        
        // Staggered animation
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'scale(1)';
        }, 100 * index);
    });
}

// Process room selection
function processRoom(roomCode) {
    const resultLayout = document.getElementById('resultLayout');
    resultLayout.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
    
    // Add haptic feedback on supported devices
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    // Calculate probabilities with a slight delay to show loading
    setTimeout(() => {
        const probabilities = calculateProbabilities(roomCode);
        showResults(roomCode, probabilities);
    }, 800);
}

// Show results with animated progress bars
function showResults(roomCode, probabilities) {
    const resultLayout = document.getElementById('resultLayout');
    const sortedProbs = Object.entries(probabilities)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    let html = `
        <div class="result-card fade-in">
            <h3>${ROOM_ICONS[roomCode]} ${roomCode} - ${VALID_ROOMS[roomCode]}</h3>
    `;
    
    // First render progress bars with 0 width
    sortedProbs.forEach(([room, prob], index) => {
        const rating = getRating(prob);
        html += `
            <div class="mt-4">
                <div class="d-flex justify-content-between">
                    <h4>${index + 1}. ${ROOM_ICONS[room]} ${room}: <span class="probability-value">0</span>%</h4>
                    <div class="rating">${rating}</div>
                </div>
                <div class="progress">
                    <div class="progress-bar progress-bar-${index}" role="progressbar" style="width: 0%" 
                         data-value="${prob}" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    resultLayout.innerHTML = html;
    
    // Then animate the progress bars
    setTimeout(() => {
        sortedProbs.forEach(([room, prob], index) => {
            const progressBar = document.querySelector(`.progress-bar-${index}`);
            const valueDisplay = progressBar.closest('.mt-4').querySelector('.probability-value');
            
            // Animate progress bar
            progressBar.style.width = `${prob}%`;
            
            // Animate number
            animateValue(valueDisplay, 0, prob, 1500);
        });
    }, 300);
}

// Animate number counting up
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.innerHTML = value.toFixed(1);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Get rating based on probability
function getRating(prob) {
    if (prob >= 70) return '<span class="text-success"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i> Rất tốt</span>';
    if (prob >= 50) return '<span class="text-warning"><i class="fas fa-star"></i><i class="fas fa-star"></i> Khá tốt</span>';
    if (prob >= 30) return '<span class="text-info"><i class="fas fa-star"></i> Trung bình</span>';
    return '<span class="text-danger"><i class="fas fa-times-circle"></i> Không khuyến nghị</span>';
}

// Load help content
function loadHelpContent() {
    const helpContent = document.getElementById('helpContent');
    helpContent.innerHTML = `
        <h3><i class="fas fa-bullseye"></i> Cách sử dụng:</h3>
        <ol>
            <li>Chọn "Nhập phòng" từ menu chính</li>
            <li>Nhập mã phòng (VD: NK, PH, PGD...)</li>
            <li>Xem kết quả phân tích</li>
            <li>Chọn mã phòng tiếp theo hoặc quay lại menu</li>
        </ol>
        
        <h3><i class="fas fa-building"></i> Các phòng hợp lệ:</h3>
        <ul>
            ${Object.entries(VALID_ROOMS).map(([code, name]) => 
                `<li><span class="badge room-${code.toLowerCase()}">${ROOM_ICONS[code]} ${code}</span> - ${name}</li>`
            ).join('')}
        </ul>
        
        <h3><i class="fas fa-robot"></i> Mô hình AI:</h3>
        <ul>
            <li>Mỗi lần khởi động ứng dụng tạo một session mới</li>
            <li>AI phân tích mẫu lặp lại trong các session</li>
            <li>Nhận diện mẫu 2-3 phòng liên tiếp</li>
            <li>Các mẫu thường xuyên xuất hiện có trọng số cao</li>
        </ul>
    `;
}

// Load about content
function loadAboutContent() {
    const aboutContent = document.getElementById('aboutContent');
    aboutContent.innerHTML = `
        <h3><i class="fas fa-info-circle"></i> VTH Tool</h3>
        <p><strong>Phát triển bởi:</strong> Hiep - BETA TOOL</p>
        <p><strong>Phiên bản:</strong> 0.1 (Miễn phí)</p>
        
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i><strong>CÔNG CỤ HOÀN TOÀN MIỄN PHÍ - CẤM MUA BÁN</strong>
        </div>
        
        <h3><i class="fas fa-address-card"></i> Thông tin liên hệ:</h3>
        <ul class="contact-list">
            <li><a href="https://betatool.netlify.app/" target="_blank"><i class="fas fa-globe me-2"></i>Website: BETA TOOL</a></li>
            <li><a href="https://t.me/addlist/kneR3MNq7Kc5ZjY1" target="_blank"><i class="fab fa-telegram me-2"></i>Telegram: Nhóm BETA TOOL</a></li>
            <li><a href="https://www.youtube.com/@beta_tool" target="_blank"><i class="fab fa-youtube me-2"></i>YouTube: BETA TOOL</a></li>
        </ul>
        
        <h3><i class="fas fa-bookmark"></i> Giới thiệu:</h3>
        <p>VTH Tool là một công cụ được phát triển bởi nhóm BETA TOOL nhằm hỗ trợ cộng đồng.
        Chúng tôi tạo ra công cụ này với mục tiêu hỗ trợ anh em trên hành trình MMO.
        Ứng dụng này là HOÀN TOÀN MIỄN PHÍ và nghiêm cấm việc mua bán dưới mọi hình thức.</p>
        
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-circle me-2"></i>Nếu bạn phải trả tiền để có được ứng dụng này, hãy báo cáo cho chúng tôi!
        </div>
    `;
}

// Update history
function updateHistory() {
    const historyLayout = document.getElementById('historyLayout');
    const history = getHistory();
    
    if (!history.length) {
        historyLayout.innerHTML = '<p class="text-center">Bạn chưa có lịch sử nhập nào!</p>';
        return;
    }
    
    let html = `
        <h3><i class="fas fa-clock me-2"></i>Lịch sử nhập (${history.length} bản ghi gần nhất)</h3>
        <div class="list-group">
    `;
    
    history.forEach((entry, index) => {
        const date = new Date(entry.timestamp);
        const sessionStatus = entry.status === 'completed' ? 
            '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Hoàn thành</span>' : 
            '<span class="badge bg-primary"><i class="fas fa-spinner me-1"></i>Đang tiếp tục</span>';
            
        html += `
            <div class="list-group-item history-item fade-in" style="animation-delay: ${index * 100}ms">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${index + 1}. ${ROOM_ICONS[entry.room]} ${entry.room} - ${VALID_ROOMS[entry.room]}</strong>
                        <br>
                        <small><i class="far fa-clock me-1"></i>${date.toLocaleString()}</small>
                    </div>
                    <div class="text-end">
                        <small class="text-muted"><i class="fas fa-fingerprint me-1"></i>Session: ${entry.sessionId.slice(-4)}</small>
                        <br>
                        ${sessionStatus}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    historyLayout.innerHTML = html;
}

// End Session
function endSession() {
    if (confirm('Bạn có chắc muốn kết thúc session hiện tại?')) {
        // Add subtle animation effect
        document.body.style.opacity = '0.8';
        
        setTimeout(() => {
            localStorage.setItem('currentSessionId', Date.now().toString());
            localStorage.setItem('currentHistory', JSON.stringify([]));
            updateUserInfo();
            
            // Reset UI with animation
            document.body.style.opacity = '1';
            
            // Show confirmation
            const mainScreen = document.querySelector('#main .card-body');
            const alert = document.createElement('div');
            alert.className = 'alert alert-success mt-3 fade-in';
            alert.innerHTML = '<i class="fas fa-check-circle me-2"></i>Session đã được kết thúc thành công!';
            mainScreen.appendChild(alert);
            
            // Remove alert after 3 seconds
            setTimeout(() => {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            }, 3000);
        }, 300);
    }
} 