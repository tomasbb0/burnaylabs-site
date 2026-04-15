const USERS = {
    'tomas': { password: 'admin123', role: 'admin', name: 'Tomas' },
    'leo': { password: 'leo123', role: 'student', name: 'Leo' }
};

let currentUser = null;
let selectedStudent = null;
// db is already defined in firebase-config.js

console.log('Script starting, db =', typeof db);

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Form submitted');
    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    console.log('Login attempt:', username);
    
    if (USERS[username] && USERS[username].password === password) {
        currentUser = { username, ...USERS[username] };
        console.log('Login success, showing dashboard');
        showDashboard();
    } else {
        console.log('Login failed');
        errorDiv.textContent = 'Invalid username or password';
        errorDiv.classList.add('show');
    }
});

function showDashboard() {
    document.body.classList.add('logged-in');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.add('active');
    document.getElementById('current-user-name').textContent = currentUser.name;
    document.getElementById('user-role-badge').textContent = currentUser.role;
    
    if (currentUser.role === 'admin') {
        document.getElementById('admin-panel').classList.remove('hidden');
        loadStudents();
    } else {
        document.getElementById('admin-panel').classList.add('hidden');
        document.getElementById('student-nav').classList.remove('hidden');
        document.getElementById('welcome-message').textContent = 'Welcome to your learning dashboard!';
    }
}

document.getElementById('logout-btn').addEventListener('click', function() {
    currentUser = null;
    selectedStudent = null;
    document.body.classList.remove('logged-in');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('dashboard-screen').classList.remove('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').classList.remove('show');
});

async function loadStudents() {
    const list = document.getElementById('student-list');
    if (!db) {
        list.innerHTML = '<div class="empty-state">Database not connected</div>';
        return;
    }
    try {
        const snapshot = await db.collection('students').get();
        if (snapshot.empty) {
            list.innerHTML = '<div class="empty-state">No students yet</div>';
            return;
        }
        list.innerHTML = '';
        snapshot.forEach(doc => {
            const student = doc.data();
            const div = document.createElement('div');
            div.className = 'student-item';
            div.innerHTML = '<div class="student-avatar">' + student.name.charAt(0) + '</div><div><div style="font-weight:600">' + student.name + '</div><div style="font-size:12px;color:#6B7280">' + (student.level || 'A0') + '</div></div>';
            div.onclick = function() { selectStudent(doc.id, student, this); };
            list.appendChild(div);
        });
    } catch(e) {
        console.error('Load students error:', e);
        list.innerHTML = '<div class="empty-state">Error loading students</div>';
    }
}

function selectStudent(id, student, elem) {
    selectedStudent = { id: id, name: student.name, level: student.level };
    document.querySelectorAll('.student-item').forEach(function(el) { el.classList.remove('active'); });
    elem.classList.add('active');
    document.getElementById('student-nav').classList.remove('hidden');
    showPanel('diagnostics');
    loadStudentData();
}

document.querySelectorAll('.nav-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        showPanel(this.dataset.tab);
    });
});

function showPanel(name) {
    document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
    document.getElementById(name + '-panel').classList.add('active');
}

document.getElementById('add-student-btn').addEventListener('click', function() {
    openModal('Add Student', '<form id="student-form"><div class="form-group"><label>Name</label><input type="text" name="name" required></div><div class="form-group"><label>Level</label><select name="level"><option value="A0">A0 - Beginner</option><option value="A1">A1 - Elementary</option><option value="A2">A2 - Pre-Intermediate</option><option value="B1">B1 - Intermediate</option><option value="B2">B2 - Upper-Intermediate</option></select></div><button type="submit" class="btn">Add Student</button></form>');
    document.getElementById('student-form').onsubmit = async function(e) {
        e.preventDefault();
        var form = new FormData(this);
        try {
            await db.collection('students').add({
                name: form.get('name'),
                level: form.get('level'),
                createdAt: new Date()
            });
            closeModal();
            loadStudents();
        } catch(e) {
            alert('Error adding student: ' + e.message);
        }
    };
});

async function loadStudentData() {
    if (!selectedStudent || !db) return;
    
    var tabs = ['diagnostics', 'games', 'tests', 'links', 'progress'];
    for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        try {
            var snap = await db.collection('students').doc(selectedStudent.id).collection(tab).orderBy('createdAt', 'desc').get();
            var list = document.getElementById(tab + '-list');
            if (snap.empty) {
                list.innerHTML = '<div class="empty-state">No ' + tab + ' yet</div>';
            } else {
                list.innerHTML = '';
                snap.forEach(function(doc) {
                    var item = doc.data();
                    list.innerHTML += '<div class="item-card"><div class="item-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div><div class="item-content"><div class="item-title">' + (item.title || item.name || 'Untitled') + '</div><div class="item-desc">' + (item.description || item.url || '') + '</div><div class="item-meta">' + (item.status ? '<span class="status-badge ' + item.status + '">' + item.status + '</span>' : '') + '</div></div></div>';
                });
            }
        } catch(e) {
            console.error('Load ' + tab + ' error:', e);
        }
    }
}

['diagnostic', 'game', 'test', 'link', 'progress'].forEach(function(type) {
    var btn = document.getElementById('add-' + type + '-btn');
    if (btn) {
        btn.addEventListener('click', function() { addItem(type); });
    }
});

function addItem(type) {
    if (!selectedStudent) {
        alert('Please select a student first');
        return;
    }
    
    var fields = {
        diagnostic: ['title', 'description', 'status'],
        game: ['title', 'url', 'description'],
        test: ['title', 'description', 'status'],
        link: ['title', 'url', 'description'],
        progress: ['title', 'description', 'status']
    };
    
    var formFields = fields[type].map(function(f) {
        if (f === 'status') {
            return '<div class="form-group"><label>' + f.charAt(0).toUpperCase() + f.slice(1) + '</label><select name="' + f + '"><option value="pending">Pending</option><option value="completed">Completed</option></select></div>';
        } else {
            return '<div class="form-group"><label>' + f.charAt(0).toUpperCase() + f.slice(1) + '</label><input type="' + (f === 'url' ? 'url' : 'text') + '" name="' + f + '" ' + (f === 'title' ? 'required' : '') + '></div>';
        }
    }).join('');
    
    openModal('Add ' + type.charAt(0).toUpperCase() + type.slice(1), '<form id="item-form">' + formFields + '<button type="submit" class="btn">Add</button></form>');
    
    document.getElementById('item-form').onsubmit = async function(e) {
        e.preventDefault();
        var form = new FormData(this);
        var data = { createdAt: new Date() };
        fields[type].forEach(function(f) { data[f] = form.get(f) || ''; });
        
        try {
            var collection = type === 'progress' ? 'progress' : type + 's';
            await db.collection('students').doc(selectedStudent.id).collection(collection).add(data);
            closeModal();
            loadStudentData();
        } catch(e) {
            alert('Error: ' + e.message);
        }
    };
}

function openModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

console.log('App loaded successfully');
