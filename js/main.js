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

// Show selected screen
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    const selectedScreen = document.getElementById(screenId);
    selectedScreen.classList.add('active');
    
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
}

// Update user info
function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    userInfo.innerHTML = `
        <p><strong>Người dùng:</strong> ${navigator.userAgent}</p>
        <p><strong>Hệ điều hành:</strong> ${navigator.platform}</p>
        <p><strong>Session ID:</strong> ${localStorage.getItem('currentSessionId')}</p>
    `;
}

// Setup room grid
function setupRoomGrid() {
    const roomGrid = document.getElementById('roomGrid');
    roomGrid.innerHTML = '';
    
    Object.entries(VALID_ROOMS).forEach(([code, name]) => {
        const button = document.createElement('button');
        button.className = `room-button room-${code.toLowerCase()}`;
        button.innerHTML = `${ROOM_ICONS[code]}<br>${code}`;
        button.onclick = () => processRoom(code);
        roomGrid.appendChild(button);
    });
}

// Process room selection
function processRoom(roomCode) {
    const resultLayout = document.getElementById('resultLayout');
    resultLayout.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
    
    // Calculate probabilities
    const probabilities = calculateProbabilities(roomCode);
    showResults(roomCode, probabilities);
}

// Show results
function showResults(roomCode, probabilities) {
    const resultLayout = document.getElementById('resultLayout');
    const sortedProbs = Object.entries(probabilities)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    let html = `
        <div class="result-card fade-in">
            <h3>${ROOM_ICONS[roomCode]} ${roomCode} - ${VALID_ROOMS[roomCode]}</h3>
    `;
    
    sortedProbs.forEach(([room, prob], index) => {
        const rating = getRating(prob);
        html += `
            <div class="mt-3">
                <h4>${index + 1}. ${ROOM_ICONS[room]} ${room}: ${prob.toFixed(1)}%</h4>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${prob}%" 
                         aria-valuenow="${prob}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <p class="text-end">${rating}</p>
            </div>
        `;
    });
    
    html += '</div>';
    resultLayout.innerHTML = html;
}

// Get rating based on probability
function getRating(prob) {
    if (prob >= 70) return '<span class="text-success">⭐⭐⭐ Rất tốt</span>';
    if (prob >= 50) return '<span class="text-warning">⭐⭐ Khá tốt</span>';
    if (prob >= 30) return '<span class="text-info">⭐ Trung bình</span>';
    return '<span class="text-danger">❌ Không khuyến nghị</span>';
}

// Load help content
function loadHelpContent() {
    const helpContent = document.getElementById('helpContent');
    helpContent.innerHTML = `
        <h3>🎯 Cách sử dụng:</h3>
        <ol>
            <li>Chọn "Nhập phòng" từ menu chính</li>
            <li>Nhập mã phòng (VD: NK, PH, PGD...)</li>
            <li>Xem kết quả phân tích</li>
            <li>Chọn mã phòng tiếp theo hoặc quay lại menu</li>
        </ol>
        
        <h3>🏢 Các phòng hợp lệ:</h3>
        <ul>
            ${Object.entries(VALID_ROOMS).map(([code, name]) => 
                `<li><span class="room-${code.toLowerCase()}">${ROOM_ICONS[code]} ${code} - ${name}</span></li>`
            ).join('')}
        </ul>
        
        <h3>🤖 Mô hình AI:</h3>
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
        <h3>VTH Tool</h3>
        <p><strong>Phát triển bởi:</strong> Hiep - BETA TOOL</p>
        <p><strong>Phiên bản:</strong> 0.1 (Miễn phí)</p>
        
        <div class="alert alert-danger">
            <strong>CÔNG CỤ HOÀN TOÀN MIỄN PHÍ - CẤM MUA BÁN</strong>
        </div>
        
        <h3>Thông tin liên hệ:</h3>
        <ul>
            <li><a href="https://betatool.netlify.app/" target="_blank">Website: BETA TOOL</a></li>
            <li><a href="https://t.me/addlist/kneR3MNq7Kc5ZjY1" target="_blank">Telegram: Nhóm BETA TOOL</a></li>
            <li><a href="https://www.youtube.com/@beta_tool" target="_blank">YouTube: BETA TOOL</a></li>
        </ul>
        
        <h3>Giới thiệu:</h3>
        <p>VTH Tool là một công cụ được phát triển bởi nhóm BETA TOOL nhằm hỗ trợ cộng đồng.
        Chúng tôi tạo ra công cụ này với mục tiêu hỗ trợ anh em trên hành trình MMO.
        Ứng dụng này là HOÀN TOÀN MIỄN PHÍ và nghiêm cấm việc mua bán dưới mọi hình thức.</p>
        
        <div class="alert alert-warning">
            Nếu bạn phải trả tiền để có được ứng dụng này, hãy báo cáo cho chúng tôi!
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
        <h3>Lịch sử nhập (${history.length} bản ghi gần nhất)</h3>
        <div class="list-group">
    `;
    
    history.forEach((entry, index) => {
        const date = new Date(entry.timestamp);
        const sessionStatus = entry.status === 'completed' ? 
            '<span class="badge bg-success">Hoàn thành</span>' : 
            '<span class="badge bg-primary">Đang tiếp tục</span>';
            
        html += `
            <div class="list-group-item history-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${index + 1}. ${ROOM_ICONS[entry.room]} ${entry.room} - ${VALID_ROOMS[entry.room]}</strong>
                        <br>
                        <small>${date.toLocaleString()}</small>
                    </div>
                    <div class="text-end">
                        <small class="text-muted">Session: ${entry.sessionId.slice(-4)}</small>
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

// End current session
function endSession() {
    if (confirm('Bạn có chắc chắn muốn kết thúc session hiện tại?')) {
        // Lưu session hiện tại vào lịch sử
        const currentSessionId = localStorage.getItem('currentSessionId');
        const data = loadData();
        const username = 'default';
        
        if (data.sequences[username]) {
            const currentSession = data.sequences[username].find(s => s.session_id === currentSessionId);
            if (currentSession && currentSession.entries.length > 0) {
                // Thêm thông tin kết thúc session
                currentSession.end_time = Date.now();
                currentSession.status = 'completed';
                saveData(data);
            }
        }
        
        // Tạo session mới
        localStorage.setItem('currentSessionId', Date.now().toString());
        
        // Cập nhật thông tin người dùng
        updateUserInfo();
        
        // Hiển thị thông báo
        alert('Session đã được kết thúc. Session mới đã được tạo.');
        
        // Cập nhật lịch sử nếu đang ở màn hình lịch sử
        if (document.getElementById('history').classList.contains('active')) {
            updateHistory();
        }
    }
} 