/**
 * Financial Manager App - Main JavaScript
 * Handles authentication, API calls, and UI interactions
 */

// Global variables
let currentUser = null;
let authToken = null;
let userPreferences = null;
const API_BASE_URL = 'https://financial-manager-application.vercel.app/api';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Load user preferences
        if (currentUser && currentUser.preferences) {
            userPreferences = currentUser.preferences;
        }
    }

    // Setup event listeners
    setupEventListeners();
    
    // Set default dates
    setDefaultDates();
    
    // Load page-specific functionality
    loadPageContent();
}

/**
 * Load content specific to the current page
 */
function loadPageContent() {
    const path = window.location.pathname;
    
    switch(path) {
        case '/dashboard':
            loadDashboard();
            break;
        case '/incomes':
            loadIncomes();
            break;
        case '/expenses':
            loadExpenses();
            break;
        case '/reports':
            loadReports();
            break;
        case '/settings':
            loadSettings();
            break;
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Income form
    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm) {
        incomeForm.addEventListener('submit', handleIncomeSubmit);
    }
    
    // Expense form
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }
    
    // Settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
    
    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
    
    // Recurring checkboxes
    const incomeRecurring = document.getElementById('incomeRecurring');
    if (incomeRecurring) {
        incomeRecurring.addEventListener('change', toggleRecurringFrequency);
    }
    
    const expenseRecurring = document.getElementById('expenseRecurring');
    if (expenseRecurring) {
        expenseRecurring.addEventListener('change', toggleRecurringFrequency);
    }
}

/**
 * Set default dates for forms
 */
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    
    // Set today as default date for income and expense forms
    const incomeDate = document.getElementById('incomeDate');
    if (incomeDate) incomeDate.value = today;
    
    const expenseDate = document.getElementById('expenseDate');
    if (expenseDate) expenseDate.value = today;
    
    // Set date range for reports (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const reportStartDate = document.getElementById('reportStartDate');
    if (reportStartDate) reportStartDate.value = thirtyDaysAgo.toISOString().split('T')[0];
    
    const reportEndDate = document.getElementById('reportEndDate');
    if (reportEndDate) reportEndDate.value = today;
}

/**
 * Show login section and hide main app
 */
function showLoginSection() {
    const loginSection = document.getElementById('loginSection');
    const mainApp = document.getElementById('mainApp');
    
    if (loginSection) loginSection.style.display = 'block';
    if (mainApp) mainApp.style.display = 'none';
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.style.display = 'none';
}

/**
 * Show main app and hide login section
 */
function showMainApp() {
    const loginSection = document.getElementById('loginSection');
    const mainApp = document.getElementById('mainApp');
    
    if (loginSection) loginSection.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
    
    // Load page-specific content
    loadPageContent();
}

/**
 * Show register form
 */
function showRegisterForm() {
    const loginCard = document.getElementById('loginForm')?.parentElement?.parentElement;
    const registerForm = document.getElementById('registerForm');
    
    if (loginCard) loginCard.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
}

/**
 * Show login form
 */
function showLoginForm() {
    const registerForm = document.getElementById('registerForm');
    const loginCard = document.getElementById('loginForm')?.parentElement?.parentElement;
    
    if (registerForm) registerForm.style.display = 'none';
    if (loginCard) loginCard.style.display = 'block';
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.data.token;
            currentUser = data.data.user;
            
            // Store token in localStorage and cookies
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Set cookie for server-side authentication
            document.cookie = `token=${authToken}; path=/; max-age=86400; secure; samesite=strict`;
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
        } else {
            showAlert(data.error.message || 'Error al iniciar sesión', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Error de conexión. Intenta de nuevo.', 'danger');
    }
}

/**
 * Handle register form submission
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'danger');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.data.token;
            currentUser = data.data.user;
            
            // Store token in localStorage and cookies
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Set cookie for server-side authentication
            document.cookie = `token=${authToken}; path=/; max-age=86400; secure; samesite=strict`;
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
        } else {
            showAlert(data.error.message || 'Error al registrarse', 'danger');
        }
    } catch (error) {
        console.error('Register error:', error);
        showAlert('Error de conexión. Intenta de nuevo.', 'danger');
    }
}

/**
 * Verify token and load user data
 */
async function verifyTokenAndLoadUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainApp();
        } else {
            // Token is invalid, clear storage and show login
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            showLoginSection();
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        showLoginSection();
    }
}

/**
 * Logout user
 */
async function logout() {
    try {
        // Llamar al backend para limpiar cookies del servidor
        if (authToken) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        }
    } catch (error) {
        console.error('Error calling logout API:', error);
        // Continuar con el logout local aunque falle la API
    }
    
    // Limpiar datos locales
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    userPreferences = null;
    
    // Limpiar cookie del cliente
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirigir a la página de login
    window.location.href = '/';
}

/**
 * Load dashboard data
 */
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/dashboard`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const summary = data.data.summary;
            
            // Update summary cards
            const totalIncome = document.getElementById('totalIncome');
            if (totalIncome) totalIncome.textContent = formatCurrency(summary.totalIncome);
            
            const totalExpense = document.getElementById('totalExpense');
            if (totalExpense) totalExpense.textContent = formatCurrency(summary.totalExpense);
            
            const balance = document.getElementById('balance');
            if (balance) balance.textContent = formatCurrency(summary.balance);
            
            // Update user name
            const userName = document.getElementById('userName');
            if (userName) userName.textContent = currentUser.name;
            
            // Load recent transactions
            loadRecentIncomes(data.data.recentIncomes);
            loadRecentExpenses(data.data.recentExpenses);
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
        showAlert('Error cargando el dashboard', 'danger');
    }
}

/**
 * Load recent incomes
 */
function loadRecentIncomes(incomes) {
    const container = document.getElementById('recentIncomes');
    if (!container) return;
    
    if (incomes.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay ingresos recientes</p>';
        return;
    }
    
    const html = incomes.map(income => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <small class="text-muted">${income.description}</small>
                <br>
                <small class="text-success">${formatCurrency(income.amount)}</small>
            </div>
            <small class="text-muted">${formatDate(income.date)}</small>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

/**
 * Load recent expenses
 */
function loadRecentExpenses(expenses) {
    const container = document.getElementById('recentExpenses');
    if (!container) return;
    
    if (expenses.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay gastos recientes</p>';
        return;
    }
    
    const html = expenses.map(expense => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <small class="text-muted">${expense.description}</small>
                <br>
                <small class="text-danger">${formatCurrency(expense.amount)}</small>
            </div>
            <small class="text-muted">${formatDate(expense.date)}</small>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

/**
 * Load incomes
 */
async function loadIncomes() {
    try {
        const response = await fetch(`${API_BASE_URL}/incomes`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayIncomes(data.data.incomes);
        }
    } catch (error) {
        console.error('Incomes load error:', error);
        showAlert('Error cargando los ingresos', 'danger');
    }
}

/**
 * Display incomes in table
 */
function displayIncomes(incomes) {
    const tbody = document.getElementById('incomesTableBody');
    if (!tbody) return;
    
    if (incomes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay ingresos registrados</td></tr>';
        return;
    }
    
    const html = incomes.map(income => `
        <tr>
            <td>${income.description}</td>
            <td class="text-success fw-bold">${formatCurrency(income.amount)}</td>
            <td><span class="badge bg-primary">${income.category}</span></td>
            <td>${formatDate(income.date)}</td>
            <td>${income.paymentMethod}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editIncome('${income._id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteIncome('${income._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html;
}

/**
 * Load expenses
 */
async function loadExpenses() {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayExpenses(data.data.expenses);
        }
    } catch (error) {
        console.error('Expenses load error:', error);
        showAlert('Error cargando los gastos', 'danger');
    }
}

/**
 * Display expenses in table
 */
function displayExpenses(expenses) {
    const tbody = document.getElementById('expensesTableBody');
    if (!tbody) return;
    
    if (expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay gastos registrados</td></tr>';
        return;
    }
    
    const html = expenses.map(expense => `
        <tr>
            <td>${expense.description}</td>
            <td class="text-danger fw-bold">${formatCurrency(expense.amount)}</td>
            <td><span class="badge bg-primary">${expense.category}</span></td>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.paymentMethod}</td>
            <td>
                ${expense.isEssential ? '<span class="badge bg-warning">Esencial</span>' : '<span class="badge bg-secondary">No esencial</span>'}
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editExpense('${expense._id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense('${expense._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html;
}

/**
 * Handle income form submission
 */
async function handleIncomeSubmit(e) {
    e.preventDefault();
    
    const formData = {
        description: document.getElementById('incomeDescription').value,
        amount: parseFloat(document.getElementById('incomeAmount').value),
        category: document.getElementById('incomeCategory').value,
        date: document.getElementById('incomeDate').value,
        paymentMethod: document.getElementById('incomePaymentMethod').value,
        notes: document.getElementById('incomeNotes').value,
        isRecurring: document.getElementById('incomeRecurring').checked,
        recurringFrequency: document.getElementById('incomeRecurringFreq').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/incomes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Ingreso registrado exitosamente', 'success');
            document.getElementById('incomeForm').reset();
            setDefaultDates();
            bootstrap.Modal.getInstance(document.getElementById('incomeModal')).hide();
            loadIncomes();
            loadDashboard();
        } else {
            showAlert(data.error.message || 'Error al registrar el ingreso', 'danger');
        }
    } catch (error) {
        console.error('Income submit error:', error);
        showAlert('Error de conexión. Intenta de nuevo.', 'danger');
    }
}

/**
 * Handle expense form submission
 */
async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const formData = {
        description: document.getElementById('expenseDescription').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value,
        paymentMethod: document.getElementById('expensePaymentMethod').value,
        notes: document.getElementById('expenseNotes').value,
        isRecurring: document.getElementById('expenseRecurring').checked,
        recurringFrequency: document.getElementById('expenseRecurringFreq').value,
        isEssential: document.getElementById('expenseEssential').checked
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Gasto registrado exitosamente', 'success');
            document.getElementById('expenseForm').reset();
            setDefaultDates();
            bootstrap.Modal.getInstance(document.getElementById('expenseModal')).hide();
            loadExpenses();
            loadDashboard();
        } else {
            showAlert(data.error.message || 'Error al registrar el gasto', 'danger');
        }
    } catch (error) {
        console.error('Expense submit error:', error);
        showAlert('Error de conexión. Intenta de nuevo.', 'danger');
    }
}

/**
 * Toggle recurring frequency fields
 */
function toggleRecurringFrequency(e) {
    const isRecurring = e.target.checked;
    const frequencyField = e.target.id === 'incomeRecurring' 
        ? document.getElementById('incomeRecurringFrequency')
        : document.getElementById('expenseRecurringFrequency');
    
    if (frequencyField) {
        frequencyField.style.display = isRecurring ? 'block' : 'none';
    }
}

/**
 * Load settings
 */
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/settings`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const preferences = data.data.preferences;
            
            const currency = document.getElementById('currency');
            if (currency) currency.value = preferences.currency || 'USD';
            
            const language = document.getElementById('language');
            if (language) language.value = preferences.language || 'es';
            
            const emailNotifications = document.getElementById('emailNotifications');
            if (emailNotifications) emailNotifications.checked = preferences.notifications?.email || false;
            
            const pushNotifications = document.getElementById('pushNotifications');
            if (pushNotifications) pushNotifications.checked = preferences.notifications?.push || false;
        }
    } catch (error) {
        console.error('Settings load error:', error);
        showAlert('Error cargando la configuración', 'danger');
    }
}

/**
 * Handle settings form submission
 */
async function handleSettingsSubmit(e) {
    e.preventDefault();
    
    const preferences = {
        currency: document.getElementById('currency').value,
        language: document.getElementById('language').value,
        notifications: {
            email: document.getElementById('emailNotifications').checked,
            push: document.getElementById('pushNotifications').checked
        }
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ preferences })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update global preferences
            userPreferences = preferences;
            
            // Update currentUser preferences
            if (currentUser) {
                currentUser.preferences = preferences;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            showAlert('Configuración actualizada exitosamente', 'success');
            
            // Reload page to apply currency changes
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showAlert(data.error.message || 'Error al actualizar la configuración', 'danger');
        }
    } catch (error) {
        console.error('Settings submit error:', error);
        showAlert('Error de conexión. Intenta de nuevo.', 'danger');
    }
}

/**
 * Handle change password form submission
 */
async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'danger');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Contraseña actualizada exitosamente', 'success');
            document.getElementById('changePasswordForm').reset();
        } else {
            showAlert(data.error.message || 'Error al cambiar la contraseña', 'danger');
        }
    } catch (error) {
        console.error('Change password error:', error);
        showAlert('Error de conexión. Intenta de nuevo.', 'danger');
    }
}

/**
 * Load reports
 */
function loadReports() {
    // This would load report data
    console.log('Loading reports...');
}

/**
 * Generate report
 */
async function generateReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    if (!startDate || !endDate) {
        showAlert('Por favor selecciona las fechas del reporte', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/report?startDate=${startDate}&endDate=${endDate}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayReport(data.data);
        }
    } catch (error) {
        console.error('Report generation error:', error);
        showAlert('Error generando el reporte', 'danger');
    }
}

/**
 * Display report
 */
function displayReport(report) {
    const container = document.getElementById('reportResults');
    if (!container) return;
    
    const html = `
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Reporte Financiero</h5>
                        <small class="text-muted">${formatDate(report.period.startDate)} - ${formatDate(report.period.endDate)}</small>
                    </div>
                    <div class="card-body">
                        <div class="row mb-4">
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-success">${formatCurrency(report.summary.totalIncome)}</h4>
                                    <small class="text-muted">Total Ingresos</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-danger">${formatCurrency(report.summary.totalExpense)}</h4>
                                    <small class="text-muted">Total Gastos</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-info">${formatCurrency(report.summary.balance)}</h4>
                                    <small class="text-muted">Balance</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-warning">${report.transactions.total}</h4>
                                    <small class="text-muted">Transacciones</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Ingresos por Categoría</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Categoría</th>
                                                <th>Total</th>
                                                <th>%</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${report.incomeByCategory.map(item => `
                                                <tr>
                                                    <td>${item.category}</td>
                                                    <td>${formatCurrency(item.total)}</td>
                                                    <td>${item.percentage.toFixed(1)}%</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h6>Gastos por Categoría</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Categoría</th>
                                                <th>Total</th>
                                                <th>%</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${report.expenseByCategory.map(item => `
                                                <tr>
                                                    <td>${item.category}</td>
                                                    <td>${formatCurrency(item.total)}</td>
                                                    <td>${item.percentage.toFixed(1)}%</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    container.style.display = 'block';
}

/**
 * Filter incomes
 */
async function filterIncomes() {
    try {
        // Get filter values
        const category = document.getElementById('incomeCategoryFilter').value;
        const startDate = document.getElementById('incomeStartDateFilter').value;
        const endDate = document.getElementById('incomeEndDateFilter').value;
        const sortBy = document.getElementById('incomeSortBy').value;
        const sortOrder = document.getElementById('incomeSortOrder').value;
        
        // Build query parameters
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        
        // Make API call
        const response = await fetch(`${API_BASE_URL}/incomes?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayIncomes(data.data.incomes);
            showAlert('Filtros aplicados correctamente', 'success');
        } else {
            showAlert(data.error.message || 'Error aplicando filtros', 'danger');
        }
    } catch (error) {
        console.error('Filter incomes error:', error);
        showAlert('Error de conexión. Intenta de nuevo.', 'danger');
    }
}

/**
 * Filter expenses
 */
async function filterExpenses() {
    try {
        // Get filter values
        const category = document.getElementById('expenseCategoryFilter').value;
        const startDate = document.getElementById('expenseStartDateFilter').value;
        const endDate = document.getElementById('expenseEndDateFilter').value;
        const sortBy = document.getElementById('expenseSortBy').value;
        const sortOrder = document.getElementById('expenseSortOrder').value;
        const isEssential = document.getElementById('expenseEssentialFilter').value;
        
        // Build query parameters
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        if (isEssential !== '') params.append('isEssential', isEssential);
        
        // Make API call
        const response = await fetch(`${API_BASE_URL}/expenses?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayExpenses(data.data.expenses);
            showAlert('Filtros aplicados correctamente', 'success');
        } else {
            showAlert(data.error.message || 'Error aplicando filtros', 'danger');
        }
    } catch (error) {
        console.error('Filter expenses error:', error);
        showAlert('Error de conexión. Intenta de nuevo.', 'danger');
    }
}

/**
 * Clear income filters
 */
function clearIncomeFilters() {
    document.getElementById('incomeCategoryFilter').value = '';
    document.getElementById('incomeStartDateFilter').value = '';
    document.getElementById('incomeEndDateFilter').value = '';
    document.getElementById('incomeSortBy').value = 'date';
    document.getElementById('incomeSortOrder').value = 'desc';
    
    // Reload all incomes
    loadIncomes();
    showAlert('Filtros limpiados', 'info');
}

/**
 * Clear expense filters
 */
function clearExpenseFilters() {
    document.getElementById('expenseCategoryFilter').value = '';
    document.getElementById('expenseStartDateFilter').value = '';
    document.getElementById('expenseEndDateFilter').value = '';
    document.getElementById('expenseSortBy').value = 'date';
    document.getElementById('expenseSortOrder').value = 'desc';
    document.getElementById('expenseEssentialFilter').value = '';
    
    // Reload all expenses
    loadExpenses();
    showAlert('Filtros limpiados', 'info');
}

/**
 * Edit income
 */
function editIncome(incomeId) {
    // Implementation for editing income
    console.log('Editing income:', incomeId);
}

/**
 * Delete income
 */
async function deleteIncome(incomeId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/incomes/${incomeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Ingreso eliminado exitosamente', 'success');
            loadIncomes();
            loadDashboard();
        } else {
            showAlert(data.error.message || 'Error al eliminar el ingreso', 'danger');
        }
    } catch (error) {
        console.error('Delete income error:', error);
        showAlert('Error de conexión. Intenta de nuevo.', 'danger');
    }
}

/**
 * Edit expense
 */
function editExpense(expenseId) {
    // Implementation for editing expense
    console.log('Editing expense:', expenseId);
}

/**
 * Delete expense
 */
async function deleteExpense(expenseId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Gasto eliminado exitosamente', 'success');
            loadExpenses();
            loadDashboard();
        } else {
            showAlert(data.error.message || 'Error al eliminar el gasto', 'danger');
        }
    } catch (error) {
        console.error('Delete expense error:', error);
        showAlert('Error de conexión. Intenta de nuevo.', 'danger');
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    // Remove existing alerts
    const existingAlerts = alertContainer.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Get template
    const template = document.getElementById(`${type}AlertTemplate`);
    if (!template) return;
    
    // Clone template
    const alertDiv = template.cloneNode(true);
    alertDiv.classList.remove('d-none');
    alertDiv.querySelector('.alert-message').textContent = message;
    
    // Add to container
    alertContainer.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

/**
 * Get user currency from preferences
 */
function getUserCurrency() {
    // Try to get from global userPreferences first
    if (userPreferences && userPreferences.currency) {
        return userPreferences.currency;
    }
    
    // Try to get from currentUser
    if (currentUser && currentUser.preferences && currentUser.preferences.currency) {
        return currentUser.preferences.currency;
    }
    
    // Try to get from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if (user.preferences && user.preferences.currency) {
                return user.preferences.currency;
            }
        } catch (e) {
            console.error('Error parsing stored user:', e);
        }
    }
    
    // Default to USD
    return 'USD';
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = null) {
    const userCurrency = currency || getUserCurrency();
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: userCurrency
    }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}