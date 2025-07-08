// Customers Management JavaScript

class CustomersManager {
    constructor() {
        this.customers = this.loadCustomers();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.syncAllCustomersWithHistory();
        this.renderCustomers();
        this.updateSummary();
        this.loadAllCustomerHistory();
    }

    bindEvents() {
        // Add customer button
        document.getElementById('addCustomerBtn').addEventListener('click', () => {
            this.showModal();
        });

        document.getElementById('generateSampleBtn').addEventListener('click', () => {
            this.generateSampleCheckinData();
        });

        // Modal events
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('customerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomer();
        });

        // Filter events
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterCustomers();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterCustomers();
        });

        document.getElementById('sortFilter').addEventListener('change', () => {
            this.sortCustomers();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportCustomers();
        });

        document.getElementById('syncBtn').addEventListener('click', () => {
            this.syncAllCustomersWithHistory();
            this.loadAllCustomerHistory();
            this.showNotification('Customer data synchronized with all history!', 'success');
        });

        // Details modal events
        document.getElementById('closeDetailsBtn').addEventListener('click', () => {
            this.hideDetailsModal();
        });

        // History tab events
        document.getElementById('historyFilter').addEventListener('change', () => {
            this.filterAllHistory();
        });

        document.getElementById('historySearch').addEventListener('input', () => {
            this.filterAllHistory();
        });

        document.getElementById('refreshHistory').addEventListener('click', () => {
            this.loadAllCustomerHistory();
            this.showNotification('History refreshed!', 'success');
        });

        // History type tabs
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-history-tab]')) {
                const historyType = e.target.getAttribute('data-history-tab');
                this.switchHistoryTab(historyType);
            }
        });

        // Close modals on outside click
        document.getElementById('customerModal').addEventListener('click', (e) => {
            if (e.target.id === 'customerModal') {
                this.hideModal();
            }
        });

        document.getElementById('customerDetailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'customerDetailsModal') {
                this.hideDetailsModal();
            }
        });
    }

    loadCustomers() {
        const saved = localStorage.getItem('hotelCustomers');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default customers data
        return [
            {
                id: 1,
                firstName: 'Piyush ',
                lastName: 'kumar',
                email: 'piyushkumar@gmail.com',
                phone: '+919876543210',
                dob: '1999-03-15',
                status: 'active',
                address: '123 Main Street',
                city: 'New Delhi',
                country: 'India',
                notes: 'VIP customer, prefers room 101',
                totalVisits: 5,
                lastVisit: '2024-06-15',
                totalSpent: 1200
            },
            {
                id: 2,
                firstName: 'Amit',
                lastName: 'kumar',
                email: 'amitkumar@gmail.com',
                phone: '+919876543211',
                dob: '1990-07-22',
                status: 'vip',
                address: '456 Oak Ave',
                city: 'Mumbai',
                country: 'India',
                notes: 'Frequent business traveler',
                totalVisits: 12,
                lastVisit: '2024-06-20',
                totalSpent: 3500
            }
        ];
    }

    saveCustomers() {
        localStorage.setItem('hotelCustomers', JSON.stringify(this.customers));
    }

    renderCustomers(customersToRender = this.customers) {
        const grid = document.getElementById('customersGrid');
        grid.innerHTML = '';

        if (customersToRender.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500 text-lg">No customers found matching your criteria.</p>
                </div>
            `;
            return;
        }

        customersToRender.forEach(customer => {
            const card = this.createCustomerCard(customer);
            grid.appendChild(card);
        });
    }

    createCustomerCard(customer) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow';
        
        const statusClass = this.getStatusClass(customer.status);
        const statusText = this.getStatusText(customer.status);
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">${customer.firstName} ${customer.lastName}</h3>
                    <p class="text-sm text-gray-500">${customer.email}</p>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </div>
            
            <div class="space-y-2 mb-4">
                <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    ${customer.phone}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    ${customer.city}, ${customer.country}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    ${customer.totalVisits} visits | ₹${customer.totalSpent} spent
                </div>
            </div>
            
            <div class="flex gap-2">
                <button onclick="customersManager.viewCustomer(${customer.id})" 
                        class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                    View Details
                </button>
                <button onclick="customersManager.editCustomer(${customer.id})" 
                        class="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors">
                    Edit
                </button>
                <button onclick="customersManager.deleteCustomer(${customer.id})" 
                        class="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors">
                    Delete
                </button>
            </div>
        `;
        
        return card;
    }

    showModal(customer = null) {
        const modal = document.getElementById('customerModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('customerForm');
        
        if (customer) {
            title.textContent = 'Edit Customer';
            this.currentEditId = customer.id;
            this.populateForm(customer);
        } else {
            title.textContent = 'Add New Customer';
            this.currentEditId = null;
            form.reset();
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    hideModal() {
        const modal = document.getElementById('customerModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.currentEditId = null;
    }

    showDetailsModal(customer) {
        const modal = document.getElementById('customerDetailsModal');
        const title = document.getElementById('detailsTitle');
        const infoContainer = document.getElementById('customerInfo');
        
        title.textContent = `${customer.firstName} ${customer.lastName} - Details`;
        
        // Populate customer information
        infoContainer.innerHTML = `
            <div class="space-y-3">
                <div>
                    <span class="text-gray-500 text-sm">Full Name:</span>
                    <p class="font-medium">${customer.firstName} ${customer.lastName}</p>
                </div>
                <div>
                    <span class="text-gray-500 text-sm">Email:</span>
                    <p class="font-medium">${customer.email}</p>
                </div>
                <div>
                    <span class="text-gray-500 text-sm">Phone:</span>
                    <p class="font-medium">${customer.phone}</p>
                </div>
                <div>
                    <span class="text-gray-500 text-sm">Date of Birth:</span>
                    <p class="font-medium">${customer.dob ? this.formatDate(customer.dob) : 'Not specified'}</p>
                </div>
                <div>
                    <span class="text-gray-500 text-sm">Status:</span>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusClass(customer.status)}">
                        ${this.getStatusText(customer.status)}
                    </span>
                </div>
                <div>
                    <span class="text-gray-500 text-sm">Address:</span>
                    <p class="font-medium">${customer.address || 'Not specified'}</p>
                </div>
                <div>
                    <span class="text-gray-500 text-sm">City:</span>
                    <p class="font-medium">${customer.city || 'Not specified'}</p>
                </div>
                <div>
                    <span class="text-gray-500 text-sm">Country:</span>
                    <p class="font-medium">${customer.country || 'Not specified'}</p>
                </div>
                <div>
                    <span class="text-gray-500 text-sm">Total Visits:</span>
                    <p class="font-medium">${customer.totalVisits || 0}</p>
                </div>
                <div>
                    <span class="text-gray-500 text-sm">Last Visit:</span>
                    <p class="font-medium">${customer.lastVisit ? this.formatDate(customer.lastVisit) : 'Never'}</p>
                </div>
                <div>
                    <span class="text-gray-500 text-sm">Total Spent:</span>
                    <p class="font-medium">₹${customer.totalSpent || 0}</p>
            </div>
                ${customer.notes ? `
                    <div>
                        <span class="text-gray-500 text-sm">Notes:</span>
                        <p class="font-medium">${customer.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Load comprehensive history data
        this.loadAllCustomerHistory();
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    hideDetailsModal() {
        const modal = document.getElementById('customerDetailsModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.currentViewingCustomer = null;
    }

    populateForm(customer) {
        document.getElementById('firstName').value = customer.firstName;
        document.getElementById('lastName').value = customer.lastName;
        document.getElementById('email').value = customer.email;
        document.getElementById('phone').value = customer.phone;
        document.getElementById('dob').value = customer.dob;
        document.getElementById('status').value = customer.status;
        document.getElementById('address').value = customer.address;
        document.getElementById('city').value = customer.city;
        document.getElementById('country').value = customer.country;
        document.getElementById('notes').value = customer.notes;
    }

    saveCustomer() {
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            dob: document.getElementById('dob').value,
            status: document.getElementById('status').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            country: document.getElementById('country').value,
            notes: document.getElementById('notes').value
        };

        if (this.currentEditId) {
            // Edit existing customer
            const index = this.customers.findIndex(c => c.id === this.currentEditId);
            if (index !== -1) {
                this.customers[index] = { ...this.customers[index], ...formData };
                // Sync with check-in history
                this.syncCustomerWithHistory(this.customers[index]);
            }
        } else {
            // Add new customer
            const newCustomer = {
                id: Date.now(),
                ...formData,
                totalVisits: 0,
                lastVisit: null,
                totalSpent: 0
            };
            this.customers.push(newCustomer);
            // Sync with check-in history
            this.syncCustomerWithHistory(newCustomer);
        }

        this.saveCustomers();
        this.renderCustomers();
        this.updateSummary();
        this.hideModal();
        this.showNotification('Customer saved successfully!');
    }

    syncCustomerWithHistory(customer) {
        // Load check-ins and checkouts
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
        const checkouts = JSON.parse(localStorage.getItem('checkouts') || '[]');

        // Find all records for this customer
        const customerCheckins = checkins.filter(checkin => 
            checkin.guestEmail === customer.email ||
            checkin.guestName === `${customer.firstName} ${customer.lastName}`
        );

        const customerCheckouts = checkouts.filter(checkout => 
            checkout.guestName === `${customer.firstName} ${customer.lastName}`
        );

        // Calculate statistics
        const totalVisits = customerCheckins.length;
        const totalSpent = customerCheckins.reduce((sum, checkin) => sum + (checkin.totalAmount || 0), 0) +
                          customerCheckouts.reduce((sum, checkout) => sum + (checkout.totalAmount || 0), 0);

        // Find last visit
        const allRecords = [...customerCheckins, ...customerCheckouts];
        let lastVisit = null;
        if (allRecords.length > 0) {
            const sortedRecords = allRecords.sort((a, b) => {
                const dateA = new Date(a.checkInTime || a.checkoutTime);
                const dateB = new Date(b.checkInTime || b.checkoutTime);
                return dateB - dateA;
            });
            lastVisit = sortedRecords[0].checkInDate;
        }

        // Update customer statistics
        customer.totalVisits = totalVisits;
        customer.totalSpent = totalSpent;
        customer.lastVisit = lastVisit;
    }

    // Function to sync all customers with check-in history
    syncAllCustomersWithHistory() {
        this.customers.forEach(customer => {
            this.syncCustomerWithHistory(customer);
        });
        this.saveCustomers();
        this.renderCustomers();
    }

    viewCustomer(id) {
        const customer = this.customers.find(c => c.id === id);
        if (customer) {
            this.showDetailsModal(customer);
        }
    }

    editCustomer(id) {
        const customer = this.customers.find(c => c.id === id);
        if (customer) {
            this.showModal(customer);
        }
    }

    deleteCustomer(id) {
        if (confirm('Are you sure you want to delete this customer?')) {
            this.customers = this.customers.filter(c => c.id !== id);
            this.saveCustomers();
            this.renderCustomers();
            this.updateSummary();
            this.showNotification('Customer deleted successfully!');
        }
    }

    filterCustomers() {
        const searchFilter = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        let filtered = this.customers.filter(customer => {
            const matchesSearch = !searchFilter || 
                customer.firstName.toLowerCase().includes(searchFilter) ||
                customer.lastName.toLowerCase().includes(searchFilter) ||
                customer.email.toLowerCase().includes(searchFilter);
            const matchesStatus = !statusFilter || customer.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.renderCustomers(filtered);
    }

    sortCustomers() {
        const sortBy = document.getElementById('sortFilter').value;
        
        let sorted = [...this.customers];
        switch (sortBy) {
            case 'name':
                sorted.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
                break;
            case 'email':
                sorted.sort((a, b) => a.email.localeCompare(b.email));
                break;
            case 'visits':
                sorted.sort((a, b) => b.totalVisits - a.totalVisits);
                break;
            case 'lastVisit':
                sorted.sort((a, b) => new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0));
                break;
        }

        this.renderCustomers(sorted);
    }

    updateSummary() {
        const totalCustomers = this.customers.length;
        const activeCustomers = this.customers.filter(c => c.status === 'active').length;
        const vipCustomers = this.customers.filter(c => c.status === 'vip').length;
        const totalRevenue = this.customers.reduce((sum, c) => sum + c.totalSpent, 0);

        // Update summary elements if they exist
        const summaryElements = {
            'totalCustomers': totalCustomers,
            'activeCustomers': activeCustomers,
            'vipCustomers': vipCustomers,
            'totalRevenue': totalRevenue
        };

        Object.keys(summaryElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = id === 'totalRevenue' ? `₹${totalRevenue}` : summaryElements[id];
            }
        });
    }

    exportCustomers() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Total Visits', 'Total Spent'];
        const rows = this.customers.map(c => [
            c.id,
            c.firstName,
            c.lastName,
            c.email,
            c.phone,
            c.status,
            c.totalVisits,
            c.totalSpent
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    getStatusClass(status) {
        const classes = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'vip': 'bg-purple-100 text-purple-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'active': 'Active',
            'inactive': 'Inactive',
            'vip': 'VIP'
        };
        return texts[status] || status;
    }

    formatDate(dateString) {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 bg-${type}-600 text-white px-6 py-3 rounded-lg shadow-lg z-50`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    loadCheckinHistory() {
        if (!this.currentViewingCustomer) return;

        const historyContainer = document.getElementById('checkinHistory');
        const customer = this.currentViewingCustomer;

        // Load check-ins from localStorage
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
        const checkouts = JSON.parse(localStorage.getItem('checkouts') || '[]');

        // Find check-ins for this customer (by email or name)
        const customerCheckins = checkins.filter(checkin => 
            checkin.guestEmail === customer.email ||
            checkin.guestName === `${customer.firstName} ${customer.lastName}`
        );

        // Find checkouts for this customer
        const customerCheckouts = checkouts.filter(checkout => 
            checkout.guestName === `${customer.firstName} ${customer.lastName}`
        );

        // Combine and sort by date
        const allHistory = [...customerCheckins, ...customerCheckouts].sort((a, b) => {
            const dateA = new Date(a.checkInTime || a.checkoutTime);
            const dateB = new Date(b.checkInTime || b.checkoutTime);
            return dateB - dateA; // Most recent first
        });

        this.displayCheckinHistory(allHistory);
    }

    filterCheckinHistory() {
        if (!this.currentViewingCustomer) return;

        const filterValue = document.getElementById('historyFilter').value;
        const searchValue = document.getElementById('historySearch').value.toLowerCase();
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
        const checkouts = JSON.parse(localStorage.getItem('checkouts') || '[]');
        const customer = this.currentViewingCustomer;

        // Find check-ins for this customer
        let customerCheckins = checkins.filter(checkin => 
            checkin.guestEmail === customer.email ||
            checkin.guestName === `${customer.firstName} ${customer.lastName}`
        );

        // Find checkouts for this customer
        let customerCheckouts = checkouts.filter(checkout => 
            checkout.guestName === `${customer.firstName} ${customer.lastName}`
        );

        // Combine all records
        let allHistory = [...customerCheckins, ...customerCheckouts];

        // Apply status filter
        if (filterValue === 'checked-in') {
            allHistory = allHistory.filter(record => record.status === 'checked-in');
        } else if (filterValue === 'checked-out') {
            allHistory = allHistory.filter(record => record.status === 'checked-out');
        }

        // Apply search filter
        if (searchValue) {
            allHistory = allHistory.filter(record => {
                const roomNumber = record.roomNumber?.toLowerCase() || '';
                const checkInDate = this.formatDate(record.checkInDate)?.toLowerCase() || '';
                const checkOutDate = this.formatDate(record.checkOutDate)?.toLowerCase() || '';
                const amount = (record.totalAmount || record.finalAmount || 0).toString();
                const notes = record.checkoutNotes?.toLowerCase() || '';

                return roomNumber.includes(searchValue) ||
                       checkInDate.includes(searchValue) ||
                       checkOutDate.includes(searchValue) ||
                       amount.includes(searchValue) ||
                       notes.includes(searchValue);
            });
        }

        // Sort by date (most recent first)
        allHistory.sort((a, b) => {
            const dateA = new Date(a.checkInTime || a.checkoutTime);
            const dateB = new Date(b.checkInTime || b.checkoutTime);
            return dateB - dateA;
        });

        this.displayCheckinHistory(allHistory);
    }

    displayCheckinHistory(history) {
        const historyContainer = document.getElementById('checkinHistory');

        if (history.length === 0) {
            historyContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p>No check-in history found for this customer.</p>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = history.map(record => {
            const isCheckout = record.status === 'checked-out' || record.hasOwnProperty('checkoutTime');
            const checkInDate = this.formatDate(record.checkInDate);
            const checkOutDate = this.formatDate(record.checkOutDate);
            const checkInTime = record.checkInTime ? new Date(record.checkInTime).toLocaleString() : '';
            const checkoutTime = record.checkoutTime ? new Date(record.checkoutTime).toLocaleString() : '';
            const nights = this.calculateNights(record.checkInDate, record.checkOutDate);
            const totalAmount = record.finalAmount || record.totalAmount || 0;
            const originalAmount = record.originalAmount || record.totalAmount || 0;
            const status = record.status || (isCheckout ? 'checked-out' : 'checked-in');

            return `
                <div class="bg-gray-50 p-4 rounded-lg border-l-4 ${this.getHistoryBorderClass(status)}">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-semibold text-gray-900">Room ${record.roomNumber}</h4>
                            <p class="text-sm text-gray-600">${checkInDate} - ${checkOutDate} (${nights} nights)</p>
                        </div>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusClass(status)}">
                            ${this.getStatusText(status)}
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="font-medium">Check-in:</span>
                            <span class="text-gray-600">${checkInTime || 'N/A'}</span>
                        </div>
                        ${isCheckout ? `
                        <div>
                            <span class="font-medium">Check-out:</span>
                            <span class="text-gray-600">${checkoutTime || 'N/A'}</span>
                        </div>
                        ` : ''}
                        <div>
                            <span class="font-medium">Guests:</span>
                            <span class="text-gray-600">${record.numGuests || 1}</span>
                        </div>
                        <div>
                            <span class="font-medium">Total Amount:</span>
                            <span class="text-gray-600 font-semibold">₹${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    ${record.additionalCharges && record.additionalCharges.total > 0 ? `
                    <div class="mt-3 pt-3 border-t border-gray-200">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium text-sm">Base Room Rate:</span>
                            <span class="text-sm">₹${originalAmount.toFixed(2)}</span>
                        </div>
                        <span class="font-medium text-sm">Additional Charges:</span>
                        <div class="grid grid-cols-2 gap-2 mt-1 text-xs">
                            ${record.additionalCharges.lateCheckout > 0 ? `
                            <div>Late Check-out: ₹${record.additionalCharges.lateCheckout.toFixed(2)}</div>
                            ` : ''}
                            ${record.additionalCharges.roomService > 0 ? `
                            <div>Room Service: ₹${record.additionalCharges.roomService.toFixed(2)}</div>
                            ` : ''}
                            ${record.additionalCharges.miniBar > 0 ? `
                            <div>Mini Bar: ₹${record.additionalCharges.miniBar.toFixed(2)}</div>
                            ` : ''}
                            ${record.additionalCharges.damage > 0 ? `
                            <div>Damage: ₹${record.additionalCharges.damage.toFixed(2)}</div>
                            ` : ''}
                        </div>
                        <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                            <span class="font-medium text-sm">Additional Charges Total:</span>
                            <span class="text-sm font-semibold">₹${record.additionalCharges.total.toFixed(2)}</span>
                        </div>
                    </div>
                    ` : ''}

                    ${record.checkoutPaymentMethod && isCheckout ? `
                    <div class="mt-2 text-xs text-gray-600">
                        <span class="font-medium">Payment:</span> ${this.formatPaymentMethod(record.checkoutPaymentMethod)} - ${record.checkoutPaymentStatus}
                    </div>
                    ` : ''}

                    ${record.checkoutNotes ? `
                    <div class="mt-2 text-xs text-gray-600">
                        <span class="font-medium">Notes:</span> ${record.checkoutNotes}
                    </div>
                    ` : ''}

                    ${record.checkoutSummary ? `
                    <div class="mt-3 bg-blue-50 p-3 rounded">
                        <span class="font-medium text-sm mb-2">Checkout Summary:</span>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>Stay Duration: ${record.checkoutSummary.totalNights} nights</div>
                            <div>Base Rate: ₹${record.checkoutSummary.baseRoomRate.toFixed(2)}</div>
                            <div>Additional Charges: ₹${record.checkoutSummary.additionalChargesTotal.toFixed(2)}</div>
                            <div class="font-semibold">Final Total: ₹${record.checkoutSummary.finalTotal.toFixed(2)}</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    getHistoryBorderClass(status) {
        switch (status) {
            case 'checked-in': return 'border-green-500';
            case 'checked-out': return 'border-blue-500';
            default: return 'border-gray-400';
        }
    }

    calculateNights(checkIn, checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    formatPaymentMethod(method) {
        const methods = {
            'credit_card': 'Credit Card',
            'debit_card': 'Debit Card',
            'cash': 'Cash',
            'bank_transfer': 'Bank Transfer',
            'online': 'Online Payment'
        };
        return methods[method] || method;
    }

    // Function to generate sample check-in data for testing
    generateSampleCheckinData() {
        // Generate sample check-in data
        const sampleCheckins = [
            {
                id: 1,
                guestName: 'Piyush Kumar',
                roomNumber: '102',
                checkInDate: '2025-01-15',
                checkOutDate: '2025-01-17',
                status: 'checked-in',
                paymentMethod: 'credit_card',
                specialRequests: 'Early check-in preferred',
                notes: 'VIP customer'
            },
            {
                id: 2,
                guestName: 'Amit Kumar',
                roomNumber: '202',
                checkInDate: '2025-01-16',
                checkOutDate: '2025-01-19',
                status: 'checked-in',
                paymentMethod: 'online',
                specialRequests: 'Extra towels needed',
                notes: 'Business traveler'
            },
            {
                id: 3,
                guestName: 'Sneha Kumari',
                roomNumber: '303',
                checkInDate: '2025-01-17',
                checkOutDate: '2025-01-19',
                status: 'checked-out',
                paymentMethod: 'cash',
                specialRequests: '',
                notes: 'First time guest'
            }
        ];

        // Generate sample check-out data
        const sampleCheckouts = [
            {
                id: 1,
                guestName: 'Sneha Kumari',
                roomNumber: '303',
                checkOutDate: '2025-01-19',
                amount: 300,
                status: 'completed',
                paymentMethod: 'cash',
                notes: 'Satisfied with stay'
            }
        ];

        // Generate sample booking data
        const sampleBookings = [
            {
                id: 1,
                guestName: 'Arpit Kumar',
                email: 'arpitkumar@gmail.com',
                phone: '+919876543212',
                roomNumber: '103',
                roomType: 'single',
                checkInDate: '2024-01-15',
                checkOutDate: '2024-01-17',
                adults: 1,
                children: 0,
                totalAmount: 240,
                status: 'confirmed',
                specialRequests: 'Early check-in if possible',
                bookingDate: '2024-01-10'
            },
            {
                id: 2,
                guestName: 'Sumit Kumar',
                email: 'sumitkumar@gmail.com',
                phone: '+919876543213',
                roomNumber: '203',
                roomType: 'suite',
                checkInDate: '2024-01-16',
                checkOutDate: '2024-01-19',
                adults: 2,
                children: 1,
                totalAmount: 600,
                status: 'confirmed',
                specialRequests: 'Extra towels needed',
                bookingDate: '2024-01-11'
            }
        ];

        // Generate sample billing data
        const sampleBilling = [
            {
                id: 1,
                guestName: 'Mohan Kumar',
                roomNumber: '103',
                amount: 240,
                dueDate: '2025-01-17',
                status: 'paid',
                issueDate: '2024-01-15',
                items: [
                    { description: 'Room 101 - 2 nights', quantity: 1, rate: 120, amount: 240 }
                ]
            },
            {
                id: 2,
                guestName: 'Sneha singh',
                roomNumber: '203',
                amount: 600,
                dueDate: '2024-01-19',
                status: 'pending',
                issueDate: '2024-01-16',
                items: [
                    { description: 'Room 201 - 3 nights', quantity: 1, rate: 200, amount: 600 }
                ]
            }
        ];

        // Generate sample feedback data
        const sampleFeedback = [
            {
                id: 1,
                guestName: 'sumit',
                rating: 5,
                comment: 'Excellent service and very clean rooms. Staff was very friendly and helpful.',
                date: '2024-01-15',
                status: 'responded',
                response: 'Thank you for your wonderful feedback! We\'re glad you enjoyed your stay.',
                responseDate: '2024-01-16'
            },
            {
                id: 2,
                guestName: 'piyush kumar',
                rating: 4,
                comment: 'Great location and comfortable rooms. Would recommend to others.',
                date: '2024-01-16',
                status: 'new',
                response: null,
                responseDate: null
            },
            {
                id: 3,
                guestName: 'prashant kumar',
                rating: 3,
                comment: 'Room was okay but the WiFi was slow. Breakfast could be better.',
                date: '2024-01-17',
                status: 'new',
                response: null,
                responseDate: null
            }
        ];

        // Save all sample data
        localStorage.setItem('checkins', JSON.stringify(sampleCheckins));
        localStorage.setItem('checkouts', JSON.stringify(sampleCheckouts));
        localStorage.setItem('bookings', JSON.stringify(sampleBookings));
        localStorage.setItem('hotelInvoices', JSON.stringify(sampleBilling));
        localStorage.setItem('hotelFeedback', JSON.stringify(sampleFeedback));

        this.showNotification('Sample history data generated successfully!', 'success');
        this.syncAllCustomersWithHistory();
    }

    showCheckoutDetails() {
        if (!this.currentViewingCustomer) return;

        const customer = this.currentViewingCustomer;
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
        const checkouts = JSON.parse(localStorage.getItem('checkouts') || '[]');

        // Find all checkout records for this customer
        const customerCheckins = checkins.filter(checkin => 
            (checkin.guestEmail === customer.email ||
             checkin.guestName === `${customer.firstName} ${customer.lastName}`) &&
            checkin.status === 'checked-out'
        );

        const customerCheckouts = checkouts.filter(checkout => 
            checkout.guestName === `${customer.firstName} ${customer.lastName}`
        );

        // Create detailed checkout information
        let checkoutDetails = '';

        if (customerCheckins.length === 0 && customerCheckouts.length === 0) {
            checkoutDetails = '<p class="text-gray-500 text-center py-4">No checkout records found for this customer.</p>';
        } else {
            // Combine and sort by checkout date
            const allCheckouts = [...customerCheckins, ...customerCheckouts].sort((a, b) => {
                const dateA = new Date(a.checkoutTime || a.actualCheckoutTime);
                const dateB = new Date(b.checkoutTime || b.actualCheckoutTime);
                return dateB - dateA;
            });

            checkoutDetails = allCheckouts.map(record => {
                const isFromCheckin = record.hasOwnProperty('checkInTime');
                const checkoutDate = this.formatDate(record.checkoutDate || record.actualCheckoutDate);
                const checkoutTime = record.checkoutTime ? new Date(record.checkoutTime).toLocaleString() : '';
                const originalAmount = record.originalAmount || record.totalAmount || 0;
                const finalAmount = record.finalAmount || record.totalAmount || 0;
                const additionalCharges = record.additionalCharges || { total: 0 };

                return `
                    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="font-semibold text-lg">Room ${record.roomNumber}</h4>
                                <p class="text-sm text-gray-600">Checkout Date: ${checkoutDate}</p>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                ${isFromCheckin ? 'Integrated Data' : 'Checkout Record'}
                            </span>
                        </div>

                        <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                                <span class="font-medium">Original Amount:</span>
                                <span class="text-gray-600">₹${originalAmount.toFixed(2)}</span>
                            </div>
                            <div>
                                <span class="font-medium">Final Amount:</span>
                                <span class="text-gray-600 font-semibold">₹${finalAmount.toFixed(2)}</span>
                            </div>
                            <div>
                                <span class="font-medium">Additional Charges:</span>
                                <span class="text-gray-600">₹${additionalCharges.total.toFixed(2)}</span>
                            </div>
                            <div>
                                <span class="font-medium">Checkout Time:</span>
                                <span class="text-gray-600">${checkoutTime}</span>
                            </div>
                        </div>

                        ${additionalCharges.total > 0 ? `
                        <div class="bg-gray-50 p-3 rounded mb-3">
                            <h5 class="font-medium text-sm mb-2">Additional Charges Breakdown:</h5>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                ${additionalCharges.lateCheckout > 0 ? `
                                <div>Late Checkout: ₹${additionalCharges.lateCheckout.toFixed(2)}</div>
                                ` : ''}
                                ${additionalCharges.roomService > 0 ? `
                                <div>Room Service: ₹${additionalCharges.roomService.toFixed(2)}</div>
                                ` : ''}
                                ${additionalCharges.miniBar > 0 ? `
                                <div>Mini Bar: ₹${additionalCharges.miniBar.toFixed(2)}</div>
                                ` : ''}
                                ${additionalCharges.damage > 0 ? `
                                <div>Damage: ₹${additionalCharges.damage.toFixed(2)}</div>
                                ` : ''}
                            </div>
                        </div>
                        ` : ''}

                        ${record.checkoutPaymentMethod ? `
                        <div class="text-sm">
                            <span class="font-medium">Payment Method:</span>
                            <span class="text-gray-600">${this.formatPaymentMethod(record.checkoutPaymentMethod)}</span>
                            <span class="ml-2 px-2 py-1 text-xs rounded-full ${
                                record.checkoutPaymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }">
                                ${record.checkoutPaymentStatus}
                            </span>
                        </div>
                        ` : ''}

                        ${record.checkoutNotes ? `
                        <div class="mt-2 text-sm">
                            <span class="font-medium">Notes:</span>
                            <span class="text-gray-600">${record.checkoutNotes}</span>
                        </div>
                        ` : ''}

                        ${record.checkoutSummary ? `
                        <div class="mt-3 bg-blue-50 p-3 rounded">
                            <h5 class="font-medium text-sm mb-2">Checkout Summary:</h5>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div>Stay Duration: ${record.checkoutSummary.totalNights} nights</div>
                                <div>Base Rate: ₹${record.checkoutSummary.baseRoomRate.toFixed(2)}</div>
                                <div>Additional Charges: ₹${record.checkoutSummary.additionalChargesTotal.toFixed(2)}</div>
                                <div class="font-semibold">Final Total: ₹${record.checkoutSummary.finalTotal.toFixed(2)}</div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

        // Show the details in a modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Checkout Details for ${customer.firstName} ${customer.lastName}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="space-y-4">
                    ${checkoutDetails}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    loadAllCustomerHistory() {
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
        const checkouts = JSON.parse(localStorage.getItem('checkouts') || '[]');
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const invoices = JSON.parse(localStorage.getItem('hotelInvoices') || '[]');
        const feedback = JSON.parse(localStorage.getItem('hotelFeedback') || '[]');

        // Combine all history data
        const allHistory = {
            checkins: checkins,
            checkouts: checkouts,
            bookings: bookings,
            billing: invoices,
            feedback: feedback
        };

        // Store for use in filtering and display
        this.allCustomerHistory = allHistory;
        
        // Display default tab (check-ins)
        this.switchHistoryTab('checkins');
    }

    switchHistoryTab(historyType) {
        // Update tab buttons
        document.querySelectorAll('[data-history-tab]').forEach(tab => {
            tab.classList.remove('bg-blue-600', 'text-white');
            tab.classList.add('bg-gray-200', 'text-gray-700');
        });
        
        const activeTab = document.querySelector(`[data-history-tab="${historyType}"]`);
        if (activeTab) {
            activeTab.classList.remove('bg-gray-200', 'text-gray-700');
            activeTab.classList.add('bg-blue-600', 'text-white');
        }

        // Display the selected history type
        this.displayHistoryByType(historyType);
    }

    displayHistoryByType(historyType) {
        const historyContainer = document.getElementById('historyContent');
        const history = this.allCustomerHistory[historyType] || [];

        switch (historyType) {
            case 'checkins':
                this.displayCheckinHistory(history);
                break;
            case 'checkouts':
                this.displayCheckoutHistory(history);
                break;
            case 'bookings':
                this.displayBookingHistory(history);
                break;
            case 'billing':
                this.displayBillingHistory(history);
                break;
            case 'feedback':
                this.displayFeedbackHistory(history);
                break;
            default:
                historyContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Select a history type to view</p>';
        }
    }

    displayCheckoutHistory(checkouts) {
        const historyContainer = document.getElementById('historyContent');
        
        if (checkouts.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No checkout history found</p>';
            return;
        }

        const historyHTML = checkouts.map(checkout => `
            <div class="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 ${this.getHistoryBorderClass(checkout.status)}">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold text-gray-900">Check-out: ${checkout.guestName}</h4>
                        <p class="text-sm text-gray-600">Room ${checkout.roomNumber}</p>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusClass(checkout.status)}">
                        ${this.getStatusText(checkout.status)}
                    </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500">Check-out Date:</span>
                        <p class="font-medium">${this.formatDate(checkout.checkOutDate)}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Amount:</span>
                        <p class="font-medium">₹${checkout.amount}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Payment Method:</span>
                        <p class="font-medium">${this.formatPaymentMethod(checkout.paymentMethod || 'Not specified')}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Status:</span>
                        <p class="font-medium">${this.getStatusText(checkout.status)}</p>
                    </div>
                </div>
            </div>
        `).join('');

        historyContainer.innerHTML = historyHTML;
    }

    displayBookingHistory(bookings) {
        const historyContainer = document.getElementById('historyContent');
        
        if (bookings.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No booking history found</p>';
            return;
        }

        const historyHTML = bookings.map(booking => `
            <div class="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 ${this.getHistoryBorderClass(booking.status)}">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold text-gray-900">Booking: ${booking.guestName}</h4>
                        <p class="text-sm text-gray-600">Room ${booking.roomNumber} (${booking.roomType})</p>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusClass(booking.status)}">
                        ${this.getStatusText(booking.status)}
                    </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500">Check-in:</span>
                        <p class="font-medium">${this.formatDate(booking.checkInDate)}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Check-out:</span>
                        <p class="font-medium">${this.formatDate(booking.checkOutDate)}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Guests:</span>
                        <p class="font-medium">${booking.adults} adults, ${booking.children} children</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Total Amount:</span>
                        <p class="font-medium">₹${booking.totalAmount}</p>
                    </div>
                </div>
                ${booking.specialRequests ? `
                    <div class="mt-3 p-3 bg-gray-50 rounded">
                        <span class="text-gray-500 text-sm">Special Requests:</span>
                        <p class="text-sm">${booking.specialRequests}</p>
                    </div>
                ` : ''}
            </div>
        `).join('');

        historyContainer.innerHTML = historyHTML;
    }

    displayBillingHistory(invoices) {
        const historyContainer = document.getElementById('historyContent');
        
        if (invoices.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No billing history found</p>';
            return;
        }

        const historyHTML = invoices.map(invoice => `
            <div class="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 ${this.getHistoryBorderClass(invoice.status)}">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold text-gray-900">Invoice #${invoice.id}: ${invoice.guestName}</h4>
                        <p class="text-sm text-gray-600">Room ${invoice.roomNumber}</p>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusClass(invoice.status)}">
                        ${this.getStatusText(invoice.status)}
                    </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500">Issue Date:</span>
                        <p class="font-medium">${this.formatDate(invoice.issueDate)}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Due Date:</span>
                        <p class="font-medium">${this.formatDate(invoice.dueDate)}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Amount:</span>
                        <p class="font-medium">₹${invoice.amount}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Status:</span>
                        <p class="font-medium">${this.getStatusText(invoice.status)}</p>
                    </div>
                </div>
                ${invoice.items && invoice.items.length > 0 ? `
                    <div class="mt-3">
                        <span class="text-gray-500 text-sm">Items:</span>
                        <ul class="text-sm mt-1">
                            ${invoice.items.map(item => `
                                <li>• ${item.description} - ₹${item.amount}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `).join('');

        historyContainer.innerHTML = historyHTML;
    }

    displayFeedbackHistory(feedback) {
        const historyContainer = document.getElementById('historyContent');
        
        if (feedback.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No feedback history found</p>';
            return;
        }

        const historyHTML = feedback.map(item => `
            <div class="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 ${this.getHistoryBorderClass(item.status)}">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold text-gray-900">Feedback: ${item.guestName}</h4>
                        <div class="flex items-center mt-1">
                            <div class="flex text-yellow-400">
                                ${this.generateStars(item.rating)}
                            </div>
                            <span class="ml-2 text-sm text-gray-600">${this.formatDate(item.date)}</span>
                        </div>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusClass(item.status)}">
                        ${this.getStatusText(item.status)}
                    </span>
                </div>
                <div class="mb-3">
                    <p class="text-gray-700">${item.comment}</p>
                </div>
                ${item.response ? `
                    <div class="bg-gray-50 p-3 rounded">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-sm font-medium text-gray-900">Hotel Response</span>
                            <span class="text-xs text-gray-500">${this.formatDate(item.responseDate)}</span>
                        </div>
                        <p class="text-gray-700 text-sm">${item.response}</p>
                    </div>
                ` : ''}
            </div>
        `).join('');

        historyContainer.innerHTML = historyHTML;
    }

    filterAllHistory() {
        const filter = document.getElementById('historyFilter').value;
        const search = document.getElementById('historySearch').value.toLowerCase();
        
        // Get current active tab
        const activeTab = document.querySelector('[data-history-tab].bg-blue-600');
        const historyType = activeTab ? activeTab.getAttribute('data-history-tab') : 'checkins';
        
        let filteredHistory = this.allCustomerHistory[historyType] || [];

        // Apply filters
        if (filter) {
            filteredHistory = filteredHistory.filter(item => {
                if (historyType === 'feedback') {
                    return item.status === filter || item.rating.toString() === filter;
                } else {
                    return item.status === filter;
                }
            });
        }

        // Apply search
        if (search) {
            filteredHistory = filteredHistory.filter(item => {
                const searchableText = [
                    item.guestName || item.name || '',
                    item.roomNumber || '',
                    item.comment || '',
                    item.response || ''
                ].join(' ').toLowerCase();
                return searchableText.includes(search);
            });
        }

        this.displayHistoryByType(historyType, filteredHistory);
    }

    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
            } else {
                stars += '<svg class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
            }
        }
        return stars;
    }
}

// Initialize the customers manager when the page loads
let customersManager;
document.addEventListener('DOMContentLoaded', () => {
    customersManager = new CustomersManager();
}); 