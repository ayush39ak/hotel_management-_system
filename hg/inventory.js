// Inventory Management JavaScript

class InventoryManager {
    constructor() {
        this.inventory = this.loadInventory();
        this.currentEditId = null;
        this.currentStockId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderInventory();
        this.updateSummary();
    }

    bindEvents() {
        // Add item button
        document.getElementById('addItemBtn').addEventListener('click', () => {
            this.showModal();
        });

        // Modal events
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('itemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem();
        });

        // Stock modal events
        document.getElementById('stockCancelBtn').addEventListener('click', () => {
            this.hideStockModal();
        });

        document.getElementById('stockForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateStock();
        });

        // Filter events
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterInventory();
        });

        document.getElementById('stockFilter').addEventListener('change', () => {
            this.filterInventory();
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterInventory();
        });

        document.getElementById('sortFilter').addEventListener('change', () => {
            this.sortInventory();
        });

        // Export button
        document.getElementById('exportInventoryBtn').addEventListener('click', () => {
            this.exportInventory();
        });

        // Generate sample data button
        document.getElementById('generateSampleBtn').addEventListener('click', () => {
            this.generateSampleData();
        });

        // Refresh data button
        document.getElementById('refreshDataBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // Close modals on outside click
        document.getElementById('itemModal').addEventListener('click', (e) => {
            if (e.target.id === 'itemModal') {
                this.hideModal();
            }
        });

        document.getElementById('stockModal').addEventListener('click', (e) => {
            if (e.target.id === 'stockModal') {
                this.hideStockModal();
            }
        });

        // Event delegation for inventory actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="adjust-stock"]')) {
                const itemId = parseInt(e.target.getAttribute('data-id'));
                this.adjustStock(itemId);
            } else if (e.target.matches('[data-action="edit-item"]')) {
                const itemId = parseInt(e.target.getAttribute('data-id'));
                this.editItem(itemId);
            } else if (e.target.matches('[data-action="delete-item"]')) {
                const itemId = parseInt(e.target.getAttribute('data-id'));
                this.deleteItem(itemId);
            }
        });
    }

    loadInventory() {
        const saved = localStorage.getItem('hotelInventory');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default inventory data
        return [
            {
                id: 1,
                name: 'Bed Sheets',
                category: 'linens',
                quantity: 50,
                unitPrice: 25.00,
                minStock: 10,
                supplier: 'Textile Co.',
                description: 'Premium cotton bed sheets, 300 thread count'
            },
            {
                id: 2,
                name: 'Towels',
                category: 'linens',
                quantity: 75,
                unitPrice: 15.00,
                minStock: 20,
                supplier: 'Textile Co.',
                description: 'Soft cotton towels, various sizes'
            },
            {
                id: 3,
                name: 'Shampoo',
                category: 'toiletries',
                quantity: 8,
                unitPrice: 5.00,
                minStock: 15,
                supplier: 'Beauty Supplies Inc.',
                description: 'Hotel-grade shampoo, 250ml bottles'
            },
            {
                id: 4,
                name: 'Cleaning Solution',
                category: 'cleaning',
                quantity: 25,
                unitPrice: 12.00,
                minStock: 10,
                supplier: 'Clean Pro',
                description: 'Multi-surface cleaning solution'
            }
        ];
    }

    saveInventory() {
        localStorage.setItem('hotelInventory', JSON.stringify(this.inventory));
    }

    renderInventory(inventoryToRender = this.inventory) {
        const tbody = document.getElementById('inventoryTableBody');
        tbody.innerHTML = '';

        if (inventoryToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                        No inventory items found matching your criteria.
                    </td>
                </tr>
            `;
            return;
        }

        inventoryToRender.forEach(item => {
            const row = this.createInventoryRow(item);
            tbody.appendChild(row);
        });
    }

    createInventoryRow(item) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        const statusClass = this.getStockStatusClass(item);
        const statusText = this.getStockStatusText(item);
        const totalValue = (item.quantity * item.unitPrice).toFixed(2);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${item.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    ${item.category}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${item.quantity}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                $${item.unitPrice.toFixed(2)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                $${totalValue}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button data-action="adjust-stock" data-id="${item.id}" 
                        class="text-blue-600 hover:text-blue-900 mr-3">Adjust</button>
                <button data-action="edit-item" data-id="${item.id}" 
                        class="text-green-600 hover:text-green-900 mr-3">Edit</button>
                <button data-action="delete-item" data-id="${item.id}" 
                        class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        `;
        
        return row;
    }

    showModal(item = null) {
        const modal = document.getElementById('itemModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('itemForm');
        
        if (item) {
            title.textContent = 'Edit Item';
            this.currentEditId = item.id;
            this.populateForm(item);
        } else {
            title.textContent = 'Add New Item';
            this.currentEditId = null;
            form.reset();
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    hideModal() {
        const modal = document.getElementById('itemModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.currentEditId = null;
    }

    showStockModal(item) {
        const modal = document.getElementById('stockModal');
        const title = document.getElementById('stockModalTitle');
        const currentStock = document.getElementById('currentStock');
        
        title.textContent = `Adjust Stock - ${item.name}`;
        currentStock.textContent = item.quantity;
        this.currentStockId = item.id;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    hideStockModal() {
        const modal = document.getElementById('stockModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.currentStockId = null;
    }

    populateForm(item) {
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemQuantity').value = item.quantity;
        document.getElementById('itemPrice').value = item.unitPrice;
        document.getElementById('minStock').value = item.minStock;
        document.getElementById('supplier').value = item.supplier;
        document.getElementById('itemDescription').value = item.description;
    }

    saveItem() {
        const formData = {
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            quantity: parseInt(document.getElementById('itemQuantity').value),
            unitPrice: parseFloat(document.getElementById('itemPrice').value),
            minStock: parseInt(document.getElementById('minStock').value),
            supplier: document.getElementById('supplier').value,
            description: document.getElementById('itemDescription').value
        };

        if (this.currentEditId) {
            // Edit existing item
            const index = this.inventory.findIndex(i => i.id === this.currentEditId);
            if (index !== -1) {
                this.inventory[index] = { ...this.inventory[index], ...formData };
            }
        } else {
            // Add new item
            const newItem = {
                id: Date.now(),
                ...formData
            };
            this.inventory.push(newItem);
        }

        this.saveInventory();
        this.renderInventory();
        this.updateSummary();
        this.hideModal();
        this.showNotification('Item saved successfully!');
    }

    adjustStock(itemId) {
        const item = this.inventory.find(i => i.id === itemId);
        if (item) {
            this.showStockModal(item);
        }
    }

    updateStock() {
        const adjustmentType = document.getElementById('adjustmentType').value;
        const quantity = parseInt(document.getElementById('adjustmentQuantity').value);
        const reason = document.getElementById('adjustmentReason').value;

        if (!this.currentStockId) return;

        const itemIndex = this.inventory.findIndex(i => i.id === this.currentStockId);
        if (itemIndex === -1) return;

        const item = this.inventory[itemIndex];
        const oldQuantity = item.quantity;

        if (adjustmentType === 'add') {
            item.quantity += quantity;
        } else {
            item.quantity = Math.max(0, item.quantity - quantity);
        }

        // Log the adjustment
        this.logStockAdjustment(item, oldQuantity, item.quantity, adjustmentType, reason);

        this.saveInventory();
        this.renderInventory();
        this.updateSummary();
        this.hideStockModal();
        this.showNotification(`Stock updated successfully! New quantity: ${item.quantity}`);
    }

    logStockAdjustment(item, oldQuantity, newQuantity, type, reason) {
        const logs = JSON.parse(localStorage.getItem('inventoryLogs') || '[]');
        logs.push({
            id: Date.now(),
            itemId: item.id,
            itemName: item.name,
            oldQuantity,
            newQuantity,
            adjustment: newQuantity - oldQuantity,
            type,
            reason,
            timestamp: new Date().toISOString(),
            user: 'Admin' // In real app, this would be the logged-in user
        });
        localStorage.setItem('inventoryLogs', JSON.stringify(logs));
    }

    editItem(id) {
        const item = this.inventory.find(i => i.id === id);
        if (item) {
            this.showModal(item);
        }
    }

    deleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.inventory = this.inventory.filter(i => i.id !== id);
            this.saveInventory();
            this.renderInventory();
            this.updateSummary();
            this.showNotification('Item deleted successfully!');
        }
    }

    filterInventory() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const stockFilter = document.getElementById('stockFilter').value;
        const searchFilter = document.getElementById('searchInput').value.toLowerCase();

        let filtered = this.inventory.filter(item => {
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesSearch = !searchFilter || 
                item.name.toLowerCase().includes(searchFilter) ||
                item.description.toLowerCase().includes(searchFilter);
            
            let matchesStock = true;
            if (stockFilter) {
                switch (stockFilter) {
                    case 'in-stock':
                        matchesStock = item.quantity > item.minStock;
                        break;
                    case 'low-stock':
                        matchesStock = item.quantity <= item.minStock && item.quantity > 0;
                        break;
                    case 'out-of-stock':
                        matchesStock = item.quantity === 0;
                        break;
                }
            }

            return matchesCategory && matchesSearch && matchesStock;
        });

        this.renderInventory(filtered);
    }

    sortInventory() {
        const sortBy = document.getElementById('sortFilter').value;
        
        let sorted = [...this.inventory];
        switch (sortBy) {
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'quantity':
                sorted.sort((a, b) => b.quantity - a.quantity);
                break;
            case 'price':
                sorted.sort((a, b) => b.unitPrice - a.unitPrice);
                break;
            case 'category':
                sorted.sort((a, b) => a.category.localeCompare(b.category));
                break;
        }

        this.renderInventory(sorted);
    }

    updateSummary() {
        const totalItems = this.inventory.length;
        const inStockItems = this.inventory.filter(i => i.quantity > i.minStock).length;
        const lowStockItems = this.inventory.filter(i => i.quantity <= i.minStock && i.quantity > 0).length;
        const outOfStockItems = this.inventory.filter(i => i.quantity === 0).length;

        // Update summary cards
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('inStockItems').textContent = inStockItems;
        document.getElementById('lowStockItems').textContent = lowStockItems;
        document.getElementById('outOfStockItems').textContent = outOfStockItems;
    }

    exportInventory() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['ID', 'Name', 'Category', 'Quantity', 'Unit Price', 'Total Value', 'Min Stock', 'Supplier'];
        const rows = this.inventory.map(i => [
            i.id,
            i.name,
            i.category,
            i.quantity,
            i.unitPrice,
            (i.quantity * i.unitPrice).toFixed(2),
            i.minStock,
            i.supplier
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    getStockStatusClass(item) {
        if (item.quantity === 0) {
            return 'bg-red-100 text-red-800';
        } else if (item.quantity <= item.minStock) {
            return 'bg-yellow-100 text-yellow-800';
        } else {
            return 'bg-green-100 text-green-800';
        }
    }

    getStockStatusText(item) {
        if (item.quantity === 0) {
            return 'Out of Stock';
        } else if (item.quantity <= item.minStock) {
            return 'Low Stock';
        } else {
            return 'In Stock';
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-all duration-300 transform translate-x-full`;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-500', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-500', 'text-white');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    generateSampleData() {
        const sampleInventory = [
            {
                id: 1,
                name: 'Bed Sheets',
                category: 'linens',
                quantity: 50,
                unitPrice: 25.00,
                minStock: 10,
                supplier: 'Textile Co.',
                description: 'Premium cotton bed sheets, 300 thread count'
            },
            {
                id: 2,
                name: 'Towels',
                category: 'linens',
                quantity: 75,
                unitPrice: 15.00,
                minStock: 20,
                supplier: 'Textile Co.',
                description: 'Soft cotton towels, various sizes'
            },
            {
                id: 3,
                name: 'Shampoo',
                category: 'toiletries',
                quantity: 8,
                unitPrice: 5.00,
                minStock: 15,
                supplier: 'Beauty Supplies Inc.',
                description: 'Hotel-grade shampoo, 250ml bottles'
            },
            {
                id: 4,
                name: 'Cleaning Solution',
                category: 'cleaning',
                quantity: 25,
                unitPrice: 12.00,
                minStock: 10,
                supplier: 'Clean Pro',
                description: 'Multi-surface cleaning solution'
            },
            {
                id: 5,
                name: 'Coffee Beans',
                category: 'food',
                quantity: 30,
                unitPrice: 8.50,
                minStock: 5,
                supplier: 'Coffee Roasters',
                description: 'Premium Arabica coffee beans'
            },
            {
                id: 6,
                name: 'Toilet Paper',
                category: 'toiletries',
                quantity: 100,
                unitPrice: 2.50,
                minStock: 25,
                supplier: 'Paper Products Ltd.',
                description: '2-ply toilet paper rolls'
            }
        ];

        this.inventory = sampleInventory;
        this.saveInventory();
        this.renderInventory();
        this.updateSummary();
        this.showNotification('Sample inventory data generated successfully!', 'success');
    }

    refreshData() {
        this.renderInventory();
        this.updateSummary();
        this.showNotification('Inventory data refreshed successfully!', 'success');
    }
}

// Initialize the inventory manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.inventoryManager = new InventoryManager();
}); 