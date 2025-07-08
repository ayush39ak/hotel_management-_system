// Billing Management JavaScript

class BillingManager {
    constructor() {
        this.invoices = this.loadInvoices();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadGuestsAndRooms();
        this.renderInvoices();
        this.updateSummary();
    }

    bindEvents() {
        // Create invoice button
        document.getElementById('createInvoiceBtn').addEventListener('click', () => {
            this.showModal();
        });

        // Modal events
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('invoiceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveInvoice();
        });

        // Filter events
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterInvoices();
        });

        document.getElementById('dateFilter').addEventListener('change', () => {
            this.filterInvoices();
        });

        document.getElementById('guestFilter').addEventListener('input', () => {
            this.filterInvoices();
        });

        document.getElementById('invoiceFilter').addEventListener('input', () => {
            this.filterInvoices();
        });

        // Export button
        document.getElementById('exportBillingBtn').addEventListener('click', () => {
            this.exportInvoices();
        });

        // Generate sample data button
        document.getElementById('generateSampleBtn').addEventListener('click', () => {
            this.generateSampleData();
        });

        // Refresh data button
        document.getElementById('refreshDataBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // Add item button
        document.getElementById('addItemBtn').addEventListener('click', () => {
            this.addInvoiceItem();
        });

        // Close modal on outside click
        document.getElementById('invoiceModal').addEventListener('click', (e) => {
            if (e.target.id === 'invoiceModal') {
                this.hideModal();
            }
        });

        // Event delegation for invoice actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="view-invoice"]')) {
                const invoiceId = parseInt(e.target.getAttribute('data-id'));
                this.viewInvoice(invoiceId);
            } else if (e.target.matches('[data-action="edit-invoice"]')) {
                const invoiceId = parseInt(e.target.getAttribute('data-id'));
                this.editInvoice(invoiceId);
            } else if (e.target.matches('[data-action="delete-invoice"]')) {
                const invoiceId = parseInt(e.target.getAttribute('data-id'));
                this.deleteInvoice(invoiceId);
            } else if (e.target.matches('[data-action="mark-paid"]')) {
                const invoiceId = parseInt(e.target.getAttribute('data-id'));
                this.markInvoiceAsPaid(invoiceId);
            }
        });
    }

    loadGuestsAndRooms() {
        // Load guests from check-ins
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
        const guestSelect = document.getElementById('guestSelect');
        const roomSelect = document.getElementById('roomSelect');
        
        // Clear existing options
        guestSelect.innerHTML = '<option value="">Select Guest</option>';
        roomSelect.innerHTML = '<option value="">Select Room</option>';
        
        // Add guests
        const uniqueGuests = new Set();
        checkins.forEach(checkin => {
            if (checkin.guestName && !uniqueGuests.has(checkin.guestName)) {
                uniqueGuests.add(checkin.guestName);
                const option = document.createElement('option');
                option.value = checkin.guestName;
                option.textContent = `${checkin.guestName} (Room ${checkin.roomNumber})`;
                guestSelect.appendChild(option);
            }
        });
        
        // Add rooms
        const rooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.roomNumber;
            option.textContent = `Room ${room.roomNumber} - ${room.type}`;
            roomSelect.appendChild(option);
        });
    }

    loadInvoices() {
        const saved = localStorage.getItem('hotelInvoices');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default invoices data
        return [
            {
                id: 1,
                guestName: 'Ayush kumar',
                roomNumber: '101',
                amount: 240,
                dueDate: '2025-07-03',
                status: 'paid',
                issueDate: '2025-07-01',
                items: [
                    { description: 'Room 101 - 2 nights', quantity: 1, rate: 120, amount: 240 }
                ]
            },
            {
                id: 2,
                guestName: 'Amit singh',
                roomNumber: '205',
                amount: 300,
                dueDate: '2025-07-07',
                status: 'pending',
                issueDate: '2025-07-05',
                items: [
                    { description: 'Room 205 - 2 nights', quantity: 1, rate: 150, amount: 300 }
                ]
            }
        ];
    }

    saveInvoices() {
        localStorage.setItem('hotelInvoices', JSON.stringify(this.invoices));
    }

    renderInvoices(invoicesToRender = this.invoices) {
        const tbody = document.getElementById('invoicesTableBody');
        tbody.innerHTML = '';

        if (invoicesToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                        No invoices found matching your criteria.
                    </td>
                </tr>
            `;
            return;
        }

        invoicesToRender.forEach(invoice => {
            const row = this.createInvoiceRow(invoice);
            tbody.appendChild(row);
        });
    }

    createInvoiceRow(invoice) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        const statusClass = this.getStatusClass(invoice.status);
        const statusText = this.getStatusText(invoice.status);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #${invoice.id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${invoice.guestName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Room ${invoice.roomNumber}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹${invoice.amount}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹${this.formatDate(invoice.dueDate)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button data-action="view-invoice" data-id="${invoice.id}" 
                        class="text-blue-600 hover:text-blue-900 mr-3">View</button>
                <button data-action="edit-invoice" data-id="${invoice.id}" 
                        class="text-green-600 hover:text-green-900 mr-3">Edit</button>
                <button data-action="delete-invoice" data-id="${invoice.id}" 
                        class="text-red-600 hover:text-red-900 mr-3">Delete</button>
                ${invoice.status !== 'paid' ? `<button data-action="mark-paid" data-id="${invoice.id}" class="text-yellow-600 hover:text-green-700">Mark as Paid</button>` : ''}
            </td>
        `;
        
        return row;
    }

    showModal(invoice = null) {
        const modal = document.getElementById('invoiceModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('invoiceForm');
        
        if (invoice) {
            title.textContent = 'Edit Invoice';
            this.currentEditId = invoice.id;
            this.populateForm(invoice);
        } else {
            title.textContent = 'Create Invoice';
            this.currentEditId = null;
            form.reset();
            this.resetInvoiceItems();
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    hideModal() {
        const modal = document.getElementById('invoiceModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.currentEditId = null;
    }

    populateForm(invoice) {
        document.getElementById('guestSelect').value = invoice.guestName;
        document.getElementById('roomSelect').value = invoice.roomNumber;
        document.getElementById('checkInDate').value = invoice.issueDate;
        document.getElementById('checkOutDate').value = invoice.dueDate;
        
        // Populate invoice items
        this.resetInvoiceItems();
        invoice.items.forEach(item => {
            this.addInvoiceItem(item);
        });
        
        this.updateInvoiceSummary();
    }

    resetInvoiceItems() {
        const container = document.getElementById('invoiceItems');
        container.innerHTML = `
            <div class="grid grid-cols-12 gap-4 items-center">
                <div class="col-span-4">
                    <input type="text" placeholder="Description" class="w-full border border-gray-300 rounded-md px-3 py-2">
                </div>
                <div class="col-span-2">
                    <input type="number" placeholder="Quantity" value="1" class="w-full border border-gray-300 rounded-md px-3 py-2">
                </div>
                <div class="col-span-2">
                    <input type="number" placeholder="Rate" class="w-full border border-gray-300 rounded-md px-3 py-2">
                </div>
                <div class="col-span-2">
                    <input type="number" placeholder="Amount" readonly class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                </div>
                <div class="col-span-2">
                    <button type="button" class="text-red-600 hover:text-red-800">Remove</button>
                </div>
            </div>
        `;
        
        // Add event listeners to the first row
        this.addItemEventListeners(container.firstElementChild);
    }

    addInvoiceItem(existingItem = null) {
        const container = document.getElementById('invoiceItems');
        const itemDiv = document.createElement('div');
        itemDiv.className = 'grid grid-cols-12 gap-4 items-center';
        
        itemDiv.innerHTML = `
            <div class="col-span-4">
                <input type="text" placeholder="Description" class="w-full border border-gray-300 rounded-md px-3 py-2" value="${existingItem ? existingItem.description : ''}">
            </div>
            <div class="col-span-2">
                <input type="number" placeholder="Quantity" value="${existingItem ? existingItem.quantity : 1}" class="w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div class="col-span-2">
                <input type="number" placeholder="Rate" class="w-full border border-gray-300 rounded-md px-3 py-2" value="${existingItem ? existingItem.rate : ''}">
            </div>
            <div class="col-span-2">
                <input type="number" placeholder="Amount" readonly class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50" value="${existingItem ? existingItem.amount : ''}">
            </div>
            <div class="col-span-2">
                <button type="button" class="text-red-600 hover:text-red-800">Remove</button>
            </div>
        `;
        
        container.appendChild(itemDiv);
        this.addItemEventListeners(itemDiv);
    }

    addItemEventListeners(itemDiv) {
        const quantityInput = itemDiv.querySelector('input[placeholder="Quantity"]');
        const rateInput = itemDiv.querySelector('input[placeholder="Rate"]');
        const amountInput = itemDiv.querySelector('input[placeholder="Amount"]');
        const removeBtn = itemDiv.querySelector('button');

        // Calculate amount when quantity or rate changes
        const calculateAmount = () => {
            const quantity = parseFloat(quantityInput.value) || 0;
            const rate = parseFloat(rateInput.value) || 0;
            amountInput.value = (quantity * rate).toFixed(2);
            this.updateInvoiceSummary();
        };

        quantityInput.addEventListener('input', calculateAmount);
        rateInput.addEventListener('input', calculateAmount);

        // Remove item
        removeBtn.addEventListener('click', () => {
            if (document.getElementById('invoiceItems').children.length > 1) {
                itemDiv.remove();
                this.updateInvoiceSummary();
            }
        });
    }

    updateInvoiceSummary() {
        const items = document.querySelectorAll('#invoiceItems > div');
        let subtotal = 0;

        items.forEach(item => {
            const amountInput = item.querySelector('input[placeholder="Amount"]');
            subtotal += parseFloat(amountInput.value) || 0;
        });

        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
    }

    saveInvoice() {
        const items = [];
        const itemDivs = document.querySelectorAll('#invoiceItems > div');
        
        itemDivs.forEach(div => {
            const description = div.querySelector('input[placeholder="Description"]').value;
            const quantity = parseFloat(div.querySelector('input[placeholder="Quantity"]').value);
            const rate = parseFloat(div.querySelector('input[placeholder="Rate"]').value);
            const amount = parseFloat(div.querySelector('input[placeholder="Amount"]').value);
            
            if (description && quantity && rate) {
                items.push({ description, quantity, rate, amount });
            }
        });

        if (items.length === 0) {
            alert('Please add at least one item to the invoice.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const formData = {
            guestName: document.getElementById('guestSelect').value,
            roomNumber: document.getElementById('roomSelect').value,
            checkInDate: document.getElementById('checkInDate').value,
            checkOutDate: document.getElementById('checkOutDate').value,
            items: items,
            amount: parseFloat(document.getElementById('total').textContent.replace('₹', '')),
            issueDate: today,
            dueDate: today,
            status: 'pending'
        };

        if (this.currentEditId) {
            // Edit existing invoice
            const index = this.invoices.findIndex(i => i.id === this.currentEditId);
            if (index !== -1) {
                this.invoices[index] = { ...this.invoices[index], ...formData };
            }
        } else {
            // Add new invoice
            const newInvoice = {
                id: Date.now(),
                ...formData
            };
            this.invoices.push(newInvoice);
        }

        this.saveInvoices();
        this.renderInvoices();
        this.updateSummary();
        this.hideModal();
        this.showNotification('Invoice saved successfully!');
    }

    viewInvoice(id) {
        const invoice = this.invoices.find(i => i.id === id);
        if (invoice) {
            this.showInvoiceDetails(invoice);
        }
    }

    editInvoice(id) {
        const invoice = this.invoices.find(i => i.id === id);
        if (invoice) {
            this.showModal(invoice);
        }
    }

    deleteInvoice(id) {
        if (confirm('Are you sure you want to delete this invoice?')) {
            this.invoices = this.invoices.filter(i => i.id !== id);
            this.saveInvoices();
            this.renderInvoices();
            this.updateSummary();
            this.showNotification('Invoice deleted successfully!');
        }
    }

    showInvoiceDetails(invoice) {
        // Create a modal to show invoice details
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">Invoice #${invoice.id}</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p><strong>Guest:</strong> ${invoice.guestName}</p>
                        <p><strong>Room:</strong> ${invoice.roomNumber}</p>
                        <p><strong>Issue Date:</strong> ${this.formatDate(invoice.issueDate)}</p>
                    </div>
                    <div>
                        <p><strong>Due Date:</strong> ${this.formatDate(invoice.dueDate)}</p>
                        <p><strong>Status:</strong> <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusClass(invoice.status)}">${this.getStatusText(invoice.status)}</span></p>
                    </div>
                </div>
                
                <table class="w-full mb-6">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Description</th>
                            <th class="px-4 py-2 text-left">Quantity</th>
                            <th class="px-4 py-2 text-left">Rate</th>
                            <th class="px-4 py-2 text-left">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td class="px-4 py-2">${item.description}</td>
                                <td class="px-4 py-2">${item.quantity}</td>
                                <td class="px-4 py-2">₹${item.rate}</td>
                                <td class="px-4 py-2">₹${item.amount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="text-right">
                    <p><strong>Total:</strong> ₹${invoice.amount}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    filterInvoices() {
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        const guestFilter = document.getElementById('guestFilter').value.toLowerCase();
        const invoiceFilter = document.getElementById('invoiceFilter').value.toLowerCase();

        let filtered = this.invoices.filter(invoice => {
            const matchesStatus = !statusFilter || invoice.status === statusFilter;
            const matchesGuest = !guestFilter || invoice.guestName.toLowerCase().includes(guestFilter);
            const matchesInvoice = !invoiceFilter || invoice.id.toString().includes(invoiceFilter);
            
            let matchesDate = true;
            if (dateFilter) {
                const today = new Date();
                const issueDate = new Date(invoice.issueDate);
                
                switch (dateFilter) {
                    case 'today':
                        matchesDate = this.isSameDay(issueDate, today);
                        break;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        matchesDate = issueDate >= weekAgo;
                        break;
                    case 'month':
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        matchesDate = issueDate >= monthAgo;
                        break;
                }
            }

            return matchesStatus && matchesGuest && matchesInvoice && matchesDate;
        });

        this.renderInvoices(filtered);
    }

    updateSummary() {
        // Debug: log all invoices and today's date
        const today = new Date().toISOString().split('T')[0];
        console.log('DEBUG: All invoices:', this.invoices);
        console.log('DEBUG: Today:', today);
        const totalRevenue = this.invoices.reduce((sum, i) => sum + i.amount, 0);
        const pendingInvoices = this.invoices.filter(i => i.status === 'pending').length;
        const overdueInvoices = this.invoices.filter(i => {
            return i.status === 'pending' && new Date(i.dueDate) < new Date();
        }).length;
        const paidToday = this.invoices.filter(i => {
            return i.status === 'paid' && this.isSameDay(new Date(i.issueDate), new Date());
        }).reduce((sum, i) => sum + i.amount, 0);

        // Update summary cards
        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
        document.getElementById('pendingInvoices').textContent = pendingInvoices;
        document.getElementById('overdueInvoices').textContent = overdueInvoices;
        document.getElementById('paidToday').textContent = `₹${paidToday.toFixed(2)}`;
    }

    exportInvoices() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoices.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['ID', 'Guest', 'Room', 'Amount', 'Due Date', 'Status', 'Issue Date'];
        const rows = this.invoices.map(i => [
            i.id,
            i.guestName,
            i.roomNumber,
            i.amount,
            i.dueDate,
            i.status,
            i.issueDate
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    getStatusClass(status) {
        const classes = {
            'paid': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'overdue': 'bg-red-100 text-red-800',
            'cancelled': 'bg-gray-100 text-gray-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'paid': 'Paid',
            'pending': 'Pending',
            'overdue': 'Overdue',
            'cancelled': 'Cancelled'
        };
        return texts[status] || status;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    isSameDay(date1, date2) {
        return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
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
        const sampleInvoices = [
            {
                id: 1,
                guestName: 'Mike Johnson',
                roomNumber: '101',
                amount: 240,
                dueDate: '2024-01-18',
                status: 'paid',
                issueDate: '2024-01-15',
                items: [
                    { description: 'Room 101 - 2 nights', quantity: 1, rate: 120, amount: 240 }
                ]
            },
            {
                id: 2,
                guestName: 'Sarah Wilson',
                roomNumber: '201',
                amount: 800,
                dueDate: '2024-01-20',
                status: 'pending',
                issueDate: '2024-01-16',
                items: [
                    { description: 'Room 201 - 4 nights', quantity: 1, rate: 200, amount: 800 }
                ]
            },
            {
                id: 3,
                guestName: 'David Brown',
                roomNumber: '301',
                amount: 300,
                dueDate: '2024-01-19',
                status: 'overdue',
                issueDate: '2024-01-17',
                items: [
                    { description: 'Room 301 - 2 nights', quantity: 1, rate: 150, amount: 300 }
                ]
            },
            {
                id: 4,
                guestName: 'Emily Davis',
                roomNumber: '102',
                amount: 400,
                dueDate: '2024-01-22',
                status: 'pending',
                issueDate: '2024-01-18',
                items: [
                    { description: 'Room 102 - 4 nights', quantity: 1, rate: 100, amount: 400 }
                ]
            },
            {
                id: 5,
                guestName: 'Robert Wilson',
                roomNumber: '202',
                amount: 200,
                dueDate: '2024-01-21',
                status: 'paid',
                issueDate: '2024-01-19',
                items: [
                    { description: 'Room 202 - 2 nights', quantity: 1, rate: 100, amount: 200 }
                ]
            }
        ];

        this.invoices = sampleInvoices;
        this.saveInvoices();
        this.renderInvoices();
        this.updateSummary();
        this.showNotification('Sample billing data generated successfully!', 'success');
    }

    refreshData() {
        this.loadGuestsAndRooms();
        this.renderInvoices();
        this.updateSummary();
        this.showNotification('Billing data refreshed successfully!', 'success');
    }

    markInvoiceAsPaid(invoiceId) {
        // Find the invoice
        const invoice = this.invoices.find(i => i.id === invoiceId);
        if (!invoice || invoice.status === 'paid') return;
        invoice.status = 'paid';
        invoice.issueDate = new Date().toISOString().split('T')[0]; // Set to today for 'Paid Today'
        this.saveInvoices();

        // Update the corresponding booking's paymentStatus
        const bookingsRaw = localStorage.getItem('hotelBookings');
        if (bookingsRaw) {
            const bookings = JSON.parse(bookingsRaw);
            let updated = false;
            for (let booking of bookings) {
                if (
                    booking.guestName === invoice.guestName &&
                    booking.roomNumber == invoice.roomNumber
                ) {
                    booking.paymentStatus = 'paid';
                    updated = true;
                }
            }
            if (updated) {
                localStorage.setItem('hotelBookings', JSON.stringify(bookings));
            }
        }
        this.renderInvoices();
        this.updateSummary();
        this.showNotification('Invoice marked as paid and booking payment status updated!', 'success');
        // Optionally, refresh bookings table if on that page
        if (window.bookingsManager && typeof window.bookingsManager.renderBookings === 'function') {
            window.bookingsManager.loadBookings();
            window.bookingsManager.renderBookings();
        }
    }
}

// Allow other pages to trigger a summary update
window.refreshBillingSummary = function() {
    if (window.billingManager && typeof window.billingManager.updateSummary === 'function') {
        window.billingManager.updateSummary();
    }
};

// Initialize the billing manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.billingManager = new BillingManager();
    window.billingManager.updateSummary(); // Force refresh on load
}); 