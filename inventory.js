// Inventory Management Logic
let allParts = [];
let filteredParts = [];

// Initialize inventory page
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initializeInventory();
        setupEventListeners();
    }, 500);
});

// Initialize inventory
function initializeInventory() {
    allParts = serviceBay.getAllSpareParts();
    filteredParts = [...allParts];
    displayStatistics();
    displayInventoryTable();
    displayLowStockAlerts();
}

// Display statistics
function displayStatistics() {
    const statsSection = document.getElementById('statsSection');
    
    const totalParts = allParts.length;
    const totalStock = allParts.reduce((sum, part) => sum + part.quantity, 0);
    const lowStockParts = serviceBay.getLowStockParts();
    const totalValue = allParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

    statsSection.innerHTML = `
        <div class="stat-card">
            <div class="icon">📦</div>
            <div class="number">${totalParts}</div>
            <div class="label">Total Part Types</div>
        </div>
        <div class="stat-card">
            <div class="icon">🔢</div>
            <div class="number">${totalStock.toLocaleString()}</div>
            <div class="label">Total Items in Stock</div>
        </div>
        <div class="stat-card">
            <div class="icon">⚠️</div>
            <div class="number">${lowStockParts.length}</div>
            <div class="label">Low Stock Items</div>
        </div>
        <div class="stat-card">
            <div class="icon">💰</div>
            <div class="number">UGX ${(totalValue / 1000000).toFixed(1)}M</div>
            <div class="label">Total Inventory Value</div>
        </div>
    `;
}

// Display inventory table
function displayInventoryTable() {
    const tbody = document.getElementById('inventoryBody');
    
    if (filteredParts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="no-data">
                        <i class="fas fa-search"></i>
                        <p>No parts found matching your criteria</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredParts.map(part => {
        const stockPercentage = Math.min((part.quantity / (part.reorderLevel * 3)) * 100, 100);
        let stockStatus = '';
        let progressClass = '';
        
        if (part.quantity === 0) {
            stockStatus = '<span class="badge-out-of-stock">Out of Stock</span>';
            progressClass = 'critical';
        } else if (part.quantity <= part.reorderLevel) {
            stockStatus = '<span class="badge-critical">Critical - Reorder!</span>';
            progressClass = 'critical';
        } else if (part.quantity <= part.reorderLevel * 1.5) {
            stockStatus = '<span class="badge-low-stock">Low Stock</span>';
            progressClass = 'low';
        } else {
            stockStatus = '<span class="badge-in-stock">In Stock</span>';
        }

        const totalValue = (part.price * part.quantity).toLocaleString();

        return `
            <tr>
                <td><strong>${part.icon || '📦'} ${part.name}</strong></td>
                <td>${part.category}</td>
                <td>UGX ${part.price.toLocaleString()}</td>
                <td><strong>${part.quantity}</strong></td>
                <td>${part.reorderLevel}</td>
                <td>
                    <div class="progress-bar-custom">
                        <div class="progress-fill ${progressClass}" style="width: ${stockPercentage}%">
                            ${Math.round(stockPercentage)}%
                        </div>
                    </div>
                    ${stockStatus}
                </td>
                <td>UGX ${totalValue}</td>
                <td>${part.supplier}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editPart(${part.id})">Edit</button>
                        <button class="btn-reorder" onclick="reorderPart(${part.id})">Reorder</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Display low stock alerts
function displayLowStockAlerts() {
    const alertSection = document.getElementById('alertSection');
    const alertList = document.getElementById('alertList');
    const lowStockParts = serviceBay.getLowStockParts();

    if (lowStockParts.length === 0) {
        alertSection.style.display = 'none';
        return;
    }

    alertSection.style.display = 'block';

    alertList.innerHTML = lowStockParts.map(part => {
        const isCritical = part.quantity === 0;
        const shortfall = part.reorderLevel - part.quantity;
        
        return `
            <li class="alert-item ${isCritical ? 'critical' : ''}">
                <div>
                    <strong>${part.icon || '📦'} ${part.name}</strong>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
                        Current: ${part.quantity} | Needed: ${shortfall} more units | Supplier: ${part.supplier}
                    </div>
                </div>
                <button class="btn-reorder" onclick="reorderPart(${part.id})" style="white-space: nowrap;">
                    Order Now
                </button>
            </li>
        `;
    }).join('');
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');

    searchInput.addEventListener('input', filterInventory);
    categoryFilter.addEventListener('change', filterInventory);
    stockFilter.addEventListener('change', filterInventory);
}

// Filter inventory
function filterInventory() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const stockStatus = document.getElementById('stockFilter').value;

    filteredParts = allParts.filter(part => {
        // Search filter
        const matchesSearch = part.name.toLowerCase().includes(searchTerm) || 
                            part.supplier.toLowerCase().includes(searchTerm);
        
        // Category filter
        const matchesCategory = !category || part.category === category;
        
        // Stock status filter
        let matchesStockStatus = true;
        if (stockStatus === 'low') {
            matchesStockStatus = part.quantity > 0 && part.quantity <= part.reorderLevel;
        } else if (stockStatus === 'out') {
            matchesStockStatus = part.quantity === 0;
        } else if (stockStatus === 'critical') {
            matchesStockStatus = part.quantity <= part.reorderLevel;
        }

        return matchesSearch && matchesCategory && matchesStockStatus;
    });

    displayInventoryTable();
}

// Edit part
function editPart(partId) {
    const part = serviceBay.getSparePartById(partId);
    if (!part) return;

    const newQuantity = prompt(`Update quantity for ${part.name}\nCurrent: ${part.quantity}`, part.quantity);
    
    if (newQuantity !== null) {
        const quantity = parseInt(newQuantity);
        if (!isNaN(quantity) && quantity >= 0) {
            const parts = serviceBay.getAllSpareParts();
            const index = parts.findIndex(p => p.id === partId);
            if (index !== -1) {
                parts[index].quantity = quantity;
                localStorage.setItem('oyeraBaySpareParts', JSON.stringify(parts));
                initializeInventory();
                showNotification(`${part.name} quantity updated to ${quantity}`, 'success');
            }
        } else {
            showNotification('Invalid quantity', 'error');
        }
    }
}

// Reorder part
function reorderPart(partId) {
    const part = serviceBay.getSparePartById(partId);
    if (!part) return;

    const reorderQuantity = prompt(`How many units of "${part.name}" to reorder?\nReorder level: ${part.reorderLevel}`, part.reorderLevel * 2);
    
    if (reorderQuantity !== null) {
        const quantity = parseInt(reorderQuantity);
        if (!isNaN(quantity) && quantity > 0) {
            // In a real application, this would send an order to the supplier
            const orderData = {
                partId: partId,
                partName: part.name,
                quantity: quantity,
                supplier: part.supplier,
                unitPrice: part.price,
                totalCost: quantity * part.price,
                orderDate: new Date().toLocaleString(),
                expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
            };

            // Store order in local storage
            const orders = JSON.parse(localStorage.getItem('oyeraBayOrders')) || [];
            orders.push(orderData);
            localStorage.setItem('oyeraBayOrders', JSON.stringify(orders));

            showNotification(`✅ Order placed for ${quantity} units of ${part.name}\nExpected delivery: ${orderData.expectedDelivery}`, 'success');
        } else {
            showNotification('Invalid quantity', 'error');
        }
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        background-color: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 4000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
