// Check-out Management JavaScript

class CheckoutManager {
    constructor() {
        this.selectedGuest = null;
        this.checkoutData = {};
        this.checkouts = this.loadCheckouts();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadOccupiedRooms();
        this.renderCheckoutHistory();
    }

    bindEvents() {
        // Search functionality
        document.getElementById('searchGuests').addEventListener('click', () => {
            console.log('Search button clicked');
            this.searchGuests();
        });

        // Show all guests button (for testing)
        const showAllButton = document.createElement('button');
        showAllButton.id = 'showAllGuests';
        showAllButton.className = 'bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 ml-2';
        showAllButton.textContent = 'Show All Guests';
        showAllButton.addEventListener('click', () => {
            console.log('Show all guests clicked');
            this.showAllGuests();
        });

        // Add the button to the search section
        const searchButton = document.getElementById('searchGuests');
        if (searchButton && searchButton.parentNode) {
            searchButton.parentNode.appendChild(showAllButton);
        }

        // Form submission
        document.getElementById('processCheckout').addEventListener('click', (e) => {
            e.preventDefault();
            this.processCheckout();
        });

        // Cancel checkout
        document.getElementById('cancelCheckout').addEventListener('click', () => {
            this.resetForm();
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Success modal buttons
        document.getElementById('printReceipt').addEventListener('click', () => {
            this.printReceipt();
        });

        document.getElementById('newCheckout').addEventListener('click', () => {
            this.resetForm();
        });

        // Close success modal
        document.getElementById('successModal').addEventListener('click', (e) => {
            if (e.target.id === 'successModal') {
                this.hideSuccessModal();
            }
        });

        // Real-time billing calculation
        document.getElementById('lateCheckoutFee').addEventListener('input', () => {
            this.updateBillingSummary();
        });

        document.getElementById('roomServiceCharges').addEventListener('input', () => {
            this.updateBillingSummary();
        });

        document.getElementById('miniBarCharges').addEventListener('input', () => {
            this.updateBillingSummary();
        });

        document.getElementById('damageCharges').addEventListener('input', () => {
            this.updateBillingSummary();
        });

        // Event delegation for check-out history actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="delete-checkout"]')) {
                const checkoutId = parseInt(e.target.getAttribute('data-id'));
                this.deleteCheckout(checkoutId);
            } else if (e.target.matches('[data-action="view-checkout"]')) {
                const checkoutId = parseInt(e.target.getAttribute('data-id'));
                this.viewCheckoutDetails(checkoutId);
            }
        });

        // Add Enter key support for search inputs
        document.getElementById('guestSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchGuests();
            }
        });

        document.getElementById('roomSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchGuests();
            }
        });

        document.getElementById('checkinIdSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchGuests();
            }
        });
    }

    loadOccupiedRooms() {
        // This will be populated when guests are searched
        this.occupiedRooms = [];
    }

    searchGuests() {
        console.log('Search function called');
        
        try {
            const guestName = document.getElementById('guestSearch').value.toLowerCase().trim();
            const roomNumber = document.getElementById('roomSearch').value.trim();
            const checkinId = document.getElementById('checkinIdSearch').value.trim();

            console.log('Search criteria:', { guestName, roomNumber, checkinId });

            // Get check-ins from localStorage
            const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
            console.log('Total check-ins found:', checkins.length);
            
            let filteredCheckins = checkins.filter(checkin => checkin.status === 'checked-in');
            console.log('Checked-in guests:', filteredCheckins.length);

            // Apply filters
            if (guestName) {
                filteredCheckins = filteredCheckins.filter(checkin => 
                    checkin.guestName && checkin.guestName.toLowerCase().includes(guestName)
                );
                console.log('After guest name filter:', filteredCheckins.length);
            }

            if (roomNumber) {
                filteredCheckins = filteredCheckins.filter(checkin => 
                    checkin.roomNumber && checkin.roomNumber.toString() === roomNumber
                );
                console.log('After room number filter:', filteredCheckins.length);
            }

            if (checkinId) {
                const checkinIdNum = parseInt(checkinId);
                if (!isNaN(checkinIdNum)) {
                    filteredCheckins = filteredCheckins.filter(checkin => 
                        checkin.id === checkinIdNum
                    );
                    console.log('After checkin ID filter:', filteredCheckins.length);
                }
            }

            console.log('Final filtered results:', filteredCheckins);
            this.displaySearchResults(filteredCheckins);
            
            // Show notification if no results
            if (filteredCheckins.length === 0) {
                this.showNotification('No guests found matching your search criteria.', 'warning');
            } else {
                this.showNotification(`Found ${filteredCheckins.length} guest(s)`, 'success');
            }
            
        } catch (error) {
            console.error('Error in searchGuests:', error);
            this.showNotification('An error occurred while searching. Please try again.', 'error');
        }
    }

    showAllGuests() {
        console.log('Show all guests function called');
        
        try {
            // Get check-ins from localStorage
            const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
            console.log('Total check-ins found:', checkins.length);
            
            let filteredCheckins = checkins.filter(checkin => checkin.status === 'checked-in');
            console.log('Checked-in guests:', filteredCheckins.length);

            console.log('All checked-in guests:', filteredCheckins);
            this.displaySearchResults(filteredCheckins);
            
            if (filteredCheckins.length === 0) {
                this.showNotification('No guests are currently checked in.', 'info');
            } else {
                this.showNotification(`Showing all ${filteredCheckins.length} checked-in guest(s)`, 'success');
            }
            
        } catch (error) {
            console.error('Error in showAllGuests:', error);
            this.showNotification('An error occurred while loading guests.', 'error');
        }
    }

    displaySearchResults(checkins) {
        const resultsContainer = document.getElementById('searchResults');
        const guestsList = document.getElementById('guestsList');

        if (checkins.length === 0) {
            guestsList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No guests found matching your search criteria.</p>
                </div>
            `;
        } else {
            guestsList.innerHTML = checkins.map(checkin => this.createGuestCard(checkin)).join('');
        }

        resultsContainer.classList.remove('hidden');
    }

    createGuestCard(checkin) {
        const nights = this.calculateNights(checkin.checkInDate, checkin.checkOutDate);
        const today = new Date();
        const checkoutDate = new Date(checkin.checkOutDate);
        const isLateCheckout = today > checkoutDate;

        return `
            <div class="guest-card bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow" 
                 onclick="checkoutManager.selectGuest('${checkin.id}')">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-900">${checkin.guestName}</h3>
                        <p class="text-sm text-gray-500">Room ${checkin.roomNumber}</p>
                    </div>
                    <div class="text-right">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${isLateCheckout ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                            ${isLateCheckout ? 'Late Check-out' : 'On Time'}
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">Check-in:</span>
                        <span class="font-medium">${this.formatDate(checkin.checkInDate)}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Check-out:</span>
                        <span class="font-medium">${this.formatDate(checkin.checkOutDate)}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Nights:</span>
                        <span class="font-medium">${nights}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Total:</span>
                        <span class="font-medium">₹${checkin.totalAmount || 0}</span>
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Select for Check-out
                    </button>
                </div>
            </div>
        `;
    }

    selectGuest(checkinId) {
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
        this.selectedGuest = checkins.find(checkin => checkin.id === checkinId);

        if (this.selectedGuest) {
            this.populateCheckoutForm();
            document.getElementById('checkoutForm').classList.remove('hidden');
            document.getElementById('searchResults').classList.add('hidden');
            this.showNotification('Guest selected for check-out!', 'success');
        }
    }

    populateCheckoutForm() {
        const guest = this.selectedGuest;
        const nights = this.calculateNights(guest.checkInDate, guest.checkOutDate);

        // Populate guest information
        document.getElementById('displayGuestName').textContent = guest.guestName;
        document.getElementById('displayRoomNumber').textContent = guest.roomNumber;
        document.getElementById('displayCheckInDate').textContent = this.formatDate(guest.checkInDate);
        document.getElementById('displayCheckOutDate').textContent = this.formatDate(guest.checkOutDate);
        document.getElementById('displayNights').textContent = nights;
        document.getElementById('displayOriginalTotal').textContent = `₹${guest.totalAmount || 0}`;

        // Initialize billing summary
        this.updateBillingSummary();
    }

    updateBillingSummary() {
        const originalAmount = this.selectedGuest ? (this.selectedGuest.totalAmount || 0) : 0;
        const lateCheckoutFee = parseFloat(document.getElementById('lateCheckoutFee').value) || 0;
        const roomServiceCharges = parseFloat(document.getElementById('roomServiceCharges').value) || 0;
        const miniBarCharges = parseFloat(document.getElementById('miniBarCharges').value) || 0;
        const damageCharges = parseFloat(document.getElementById('damageCharges').value) || 0;

        const total = originalAmount + lateCheckoutFee + roomServiceCharges + miniBarCharges + damageCharges;

        // Update display
        document.getElementById('originalCharges').textContent = `₹${originalAmount.toFixed(2)}`;
        document.getElementById('lateCheckoutDisplay').textContent = `₹${lateCheckoutFee.toFixed(2)}`;
        document.getElementById('roomServiceDisplay').textContent = `₹${roomServiceCharges.toFixed(2)}`;
        document.getElementById('miniBarDisplay').textContent = `₹${miniBarCharges.toFixed(2)}`;
        document.getElementById('damageDisplay').textContent = `₹${damageCharges.toFixed(2)}`;
        document.getElementById('finalTotal').textContent = `₹${total.toFixed(2)}`;
    }

    processCheckout() {
        if (!this.selectedGuest) {
            this.showNotification('Please select a guest first.', 'error');
            return;
        }

        // Collect checkout data
        this.checkoutData = {
            checkinId: this.selectedGuest.id,
            guestName: this.selectedGuest.guestName,
            roomNumber: this.selectedGuest.roomNumber,
            originalAmount: this.selectedGuest.totalAmount || 0,
            lateCheckoutFee: parseFloat(document.getElementById('lateCheckoutFee').value) || 0,
            roomServiceCharges: parseFloat(document.getElementById('roomServiceCharges').value) || 0,
            miniBarCharges: parseFloat(document.getElementById('miniBarCharges').value) || 0,
            damageCharges: parseFloat(document.getElementById('damageCharges').value) || 0,
            additionalNotes: document.getElementById('additionalNotes').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            paymentStatus: document.getElementById('paymentStatus').value,
            checkoutTime: new Date().toISOString(),
            totalAmount:
                (this.selectedGuest.totalAmount || 0) +
                (parseFloat(document.getElementById('lateCheckoutFee').value) || 0) +
                (parseFloat(document.getElementById('roomServiceCharges').value) || 0) +
                (parseFloat(document.getElementById('miniBarCharges').value) || 0) +
                (parseFloat(document.getElementById('damageCharges').value) || 0),
            checkInDate: this.selectedGuest.checkInDate || '',
            checkOutDate: this.selectedGuest.checkOutDate || ''
        };

        // Update check-in status
        this.updateCheckinStatus();

        // Update room status
        this.updateRoomStatus();

        // Create checkout record
        this.saveCheckoutRecord();

        // Create final invoice
        this.createFinalInvoice();

        // Show success modal
        this.showSuccessModal();
    }

    updateCheckinStatus() {
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
        const checkinIndex = checkins.findIndex(checkin => checkin.id === this.selectedGuest.id);
        
        if (checkinIndex !== -1) {
            const originalCheckin = checkins[checkinIndex];
            
            // Update check-in record with comprehensive checkout data
            checkins[checkinIndex] = {
                ...originalCheckin,
                status: 'checked-out',
                checkoutTime: this.checkoutData.checkoutTime,
                checkoutDate: new Date().toISOString().split('T')[0],
                finalAmount: this.checkoutData.totalAmount,
                originalAmount: this.checkoutData.originalAmount,
                
                // Additional charges breakdown
                additionalCharges: {
                    lateCheckout: this.checkoutData.lateCheckoutFee,
                    roomService: this.checkoutData.roomServiceCharges,
                    miniBar: this.checkoutData.miniBarCharges,
                    damage: this.checkoutData.damageCharges,
                    total: this.checkoutData.lateCheckoutFee + 
                           this.checkoutData.roomServiceCharges + 
                           this.checkoutData.miniBarCharges + 
                           this.checkoutData.damageCharges
                },
                
                // Checkout details
                checkoutNotes: this.checkoutData.additionalNotes,
                checkoutPaymentMethod: this.checkoutData.paymentMethod,
                checkoutPaymentStatus: this.checkoutData.paymentStatus,
                
                // Checkout summary
                checkoutSummary: {
                    totalNights: this.calculateNights(originalCheckin.checkInDate, originalCheckin.checkOutDate),
                    baseRoomRate: originalCheckin.totalAmount,
                    additionalChargesTotal: this.checkoutData.lateCheckoutFee + 
                                           this.checkoutData.roomServiceCharges + 
                                           this.checkoutData.miniBarCharges + 
                                           this.checkoutData.damageCharges,
                    finalTotal: this.checkoutData.totalAmount
                },
                
                // Timestamps
                actualCheckoutTime: this.checkoutData.checkoutTime,
                stayDuration: this.calculateNights(originalCheckin.checkInDate, originalCheckin.checkOutDate),
                
                // Link to checkout record
                checkoutRecordId: 'checkout_' + Date.now()
            };
            
            localStorage.setItem('checkins', JSON.stringify(checkins));
            
            // Also update the selected guest object for display
            this.selectedGuest = checkins[checkinIndex];
        }

        // Update paymentStatus in hotelBookings for the matching booking using bookingId
        const bookingsRaw = localStorage.getItem('hotelBookings');
        if (bookingsRaw) {
            const bookings = JSON.parse(bookingsRaw);
            let updated = false;
            for (let booking of bookings) {
                if (booking.id === this.selectedGuest.bookingId) {
                    booking.paymentStatus = this.checkoutData.paymentStatus;
                    booking.status = 'checked-out';
                    updated = true;
                }
            }
            if (updated) {
                localStorage.setItem('hotelBookings', JSON.stringify(bookings));
            }
        }
    }

    updateRoomStatus() {
        const rooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
        const roomIndex = rooms.findIndex(room => room.roomNumber === this.selectedGuest.roomNumber);
        
        if (roomIndex !== -1) {
            rooms[roomIndex].status = 'cleaning'; // Room needs cleaning after checkout
            localStorage.setItem('hotelRooms', JSON.stringify(rooms));
        }
    }

    saveCheckoutRecord() {
        const checkouts = JSON.parse(localStorage.getItem('checkouts') || '[]');
        const checkoutRecord = {
            id: 'checkout_' + Date.now(),
            checkinId: this.selectedGuest.id, // Reference to original check-in
            checkinRecord: this.selectedGuest, // Full check-in record reference
            ...this.checkoutData,
            
            // Additional metadata
            processedBy: 'checkout_system',
            processingTime: new Date().toISOString(),
            
            // Summary data
            summary: {
                originalCheckinDate: this.selectedGuest.checkInDate || '',
                originalCheckoutDate: this.selectedGuest.checkOutDate || '',
                actualCheckoutDate: new Date().toISOString().split('T')[0],
                totalNights: this.calculateNights(this.selectedGuest.checkInDate, this.selectedGuest.checkOutDate),
                baseAmount: this.selectedGuest.totalAmount,
                additionalChargesTotal: this.checkoutData.lateCheckoutFee + 
                                       this.checkoutData.roomServiceCharges + 
                                       this.checkoutData.miniBarCharges + 
                                       this.checkoutData.damageCharges,
                finalAmount: this.checkoutData.totalAmount
            }
        };
        
        checkouts.push(checkoutRecord);
        localStorage.setItem('checkouts', JSON.stringify(checkouts));
        
        // Update the local checkouts array and re-render
        this.checkouts = checkouts;
        this.renderCheckoutHistory();
    }

    createFinalInvoice() {
        const today = new Date().toISOString().split('T')[0];
        const invoice = {
            id: Date.now(),
            guestName: this.checkoutData.guestName,
            roomNumber: this.checkoutData.roomNumber,
            amount: this.checkoutData.totalAmount,
            dueDate: today,
            status: this.checkoutData.paymentStatus === 'paid' ? 'paid' : 'pending',
            issueDate: today,
            items: [
                {
                    description: `Room ${this.checkoutData.roomNumber} - Original Charges`,
                    quantity: 1,
                    rate: this.checkoutData.originalAmount,
                    amount: this.checkoutData.originalAmount
                }
            ]
        };
        console.log('DEBUG: Created invoice:', invoice, 'Today:', today);

        // Add additional charges as separate items
        if (this.checkoutData.lateCheckoutFee > 0) {
            invoice.items.push({
                description: 'Late Check-out Fee',
                quantity: 1,
                rate: this.checkoutData.lateCheckoutFee,
                amount: this.checkoutData.lateCheckoutFee
            });
        }

        if (this.checkoutData.roomServiceCharges > 0) {
            invoice.items.push({
                description: 'Room Service Charges',
                quantity: 1,
                rate: this.checkoutData.roomServiceCharges,
                amount: this.checkoutData.roomServiceCharges
            });
        }

        if (this.checkoutData.miniBarCharges > 0) {
            invoice.items.push({
                description: 'Mini Bar Charges',
                quantity: 1,
                rate: this.checkoutData.miniBarCharges,
                amount: this.checkoutData.miniBarCharges
            });
        }

        if (this.checkoutData.damageCharges > 0) {
            invoice.items.push({
                description: 'Damage Charges',
                quantity: 1,
                rate: this.checkoutData.damageCharges,
                amount: this.checkoutData.damageCharges
            });
        }

        const invoices = JSON.parse(localStorage.getItem('hotelInvoices') || '[]');
        invoices.push(invoice);
        localStorage.setItem('hotelInvoices', JSON.stringify(invoices));
        // Trigger billing summary update if billing page is open
        if (window.refreshBillingSummary) {
            window.refreshBillingSummary();
        }
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    hideSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    resetForm() {
        this.selectedGuest = null;
        this.checkoutData = {};
        
        // Reset form fields
        document.getElementById('guestSearch').value = '';
        document.getElementById('roomSearch').value = '';
        document.getElementById('checkinIdSearch').value = '';
        document.getElementById('lateCheckoutFee').value = '0';
        document.getElementById('roomServiceCharges').value = '0';
        document.getElementById('miniBarCharges').value = '0';
        document.getElementById('damageCharges').value = '0';
        document.getElementById('additionalNotes').value = '';
        document.getElementById('paymentMethod').value = 'credit_card';
        document.getElementById('paymentStatus').value = 'paid';

        // Hide forms
        document.getElementById('checkoutForm').classList.add('hidden');
        document.getElementById('searchResults').classList.add('hidden');
        document.getElementById('checkoutSummary').classList.add('hidden');
        
        this.hideSuccessModal();
    }

    printReceipt() {
        const receipt = this.generateReceipt();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(receipt);
        printWindow.document.close();
        printWindow.print();
    }

    generateReceipt() {
        const checkout = this.checkoutData;
        
        return `
            <html>
                <head>
                    <title>Check-out Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .receipt { border: 1px solid #ccc; padding: 20px; }
                        .row { display: flex; justify-content: space-between; margin: 10px 0; }
                        .total { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
                        .section { margin: 20px 0; }
                        .section-title { font-weight: bold; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Hotel Check-out Receipt</h1>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                        <p>Time: ${new Date().toLocaleTimeString()}</p>
                    </div>
                    <div class="receipt">
                        <div class="section">
                            <div class="section-title">Guest Information</div>
                            <div class="row">
                                <span>Guest Name:</span>
                                <span>${checkout.guestName}</span>
                            </div>
                            <div class="row">
                                <span>Room Number:</span>
                                <span>${checkout.roomNumber}</span>
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">Charges Breakdown</div>
                            <div class="row">
                                <span>Original Room Charges:</span>
                                <span>₹${checkout.originalAmount.toFixed(2)}</span>
                            </div>
                            ${checkout.lateCheckoutFee > 0 ? `
                            <div class="row">
                                <span>Late Check-out Fee:</span>
                                <span>₹${checkout.lateCheckoutFee.toFixed(2)}</span>
                            </div>
                            ` : ''}
                            ${checkout.roomServiceCharges > 0 ? `
                            <div class="row">
                                <span>Room Service:</span>
                                <span>₹${checkout.roomServiceCharges.toFixed(2)}</span>
                            </div>
                            ` : ''}
                            ${checkout.miniBarCharges > 0 ? `
                            <div class="row">
                                <span>Mini Bar:</span>
                                <span>₹${checkout.miniBarCharges.toFixed(2)}</span>
                            </div>
                            ` : ''}
                            ${checkout.damageCharges > 0 ? `
                            <div class="row">
                                <span>Damage Charges:</span>
                                <span>₹${checkout.damageCharges.toFixed(2)}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="row total">
                            <span>Total Amount:</span>
                            <span>₹${checkout.totalAmount.toFixed(2)}</span>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">Payment Information</div>
                            <div class="row">
                                <span>Payment Method:</span>
                                <span>${this.formatPaymentMethod(checkout.paymentMethod)}</span>
                            </div>
                            <div class="row">
                                <span>Payment Status:</span>
                                <span>${checkout.paymentStatus.charAt(0).toUpperCase() + checkout.paymentStatus.slice(1)}</span>
                            </div>
                        </div>
                        
                        ${checkout.additionalNotes ? `
                        <div class="section">
                            <div class="section-title">Additional Notes</div>
                            <p>${checkout.additionalNotes}</p>
                        </div>
                        ` : ''}
                        
                        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
                            <p>Thank you for staying with us!</p>
                            <p>We hope to see you again soon.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    calculateNights(checkIn, checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
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

    loadCheckouts() {
        const saved = localStorage.getItem('checkouts');
        return saved ? JSON.parse(saved) : [];
    }

    saveCheckouts() {
        localStorage.setItem('checkouts', JSON.stringify(this.checkouts));
    }

    renderCheckoutHistory() {
        const container = document.getElementById('checkoutHistory');
        if (!container) return;

        if (this.checkouts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No check-out records found.</p>
                </div>
            `;
            return;
        }

        const tableBody = document.getElementById('checkoutHistoryTableBody');
        if (tableBody) {
            tableBody.innerHTML = this.checkouts.map(checkout => this.createCheckoutRow(checkout)).join('');
        }
    }

    createCheckoutRow(checkout) {
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${checkout.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${checkout.guestName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${checkout.roomNumber}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatDate(checkout.checkoutTime)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatDate(checkout.checkInDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatDate(checkout.checkOutDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${checkout.finalAmount || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button data-action="delete-checkout" data-id="${checkout.id}" 
                            class="text-red-600 hover:text-red-900 mr-3">
                        Delete
                    </button>
                    <button data-action="view-checkout" data-id="${checkout.id}" 
                            class="text-blue-600 hover:text-blue-900">
                        View
                    </button>
                </td>
            </tr>
        `;
    }

    deleteCheckout(id) {
        console.log('Attempting to delete check-out with ID:', id);
        console.log('Current check-outs:', this.checkouts);
        
        if (confirm('Are you sure you want to delete this check-out record?')) {
            const originalLength = this.checkouts.length;
            this.checkouts = this.checkouts.filter(c => c.id !== id);
            const newLength = this.checkouts.length;
            
            console.log('Check-outs before deletion:', originalLength);
            console.log('Check-outs after deletion:', newLength);
            
            if (newLength < originalLength) {
                this.saveCheckouts();
                this.renderCheckoutHistory();
                this.showNotification('Check-out record deleted successfully!', 'success');
                console.log('Check-out deleted successfully');
            } else {
                console.error('Failed to delete check-out - ID not found:', id);
                this.showNotification('Failed to delete check-out record. ID not found.', 'error');
            }
        }
    }

    viewCheckoutDetails(id) {
        const checkout = this.checkouts.find(c => c.id === id);
        if (!checkout) return;

        // Create and show a modal with check-out details
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Check-out Details</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="font-medium">Guest Name:</span>
                            <span>${checkout.guestName}</span>
                        </div>
                        <div>
                            <span class="font-medium">Room Number:</span>
                            <span>${checkout.roomNumber}</span>
                        </div>
                        <div>
                            <span class="font-medium">Check-out Time:</span>
                            <span>${this.formatDate(checkout.checkoutTime)}</span>
                        </div>
                        <div>
                            <span class="font-medium">Original Check-in:</span>
                            <span>${this.formatDate(checkout.checkInDate)}</span>
                        </div>
                        <div>
                            <span class="font-medium">Original Check-out:</span>
                            <span>${this.formatDate(checkout.checkOutDate)}</span>
                        </div>
                        <div>
                            <span class="font-medium">Final Amount:</span>
                            <span>₹${checkout.finalAmount || 0}</span>
                        </div>
                        <div>
                            <span class="font-medium">Payment Method:</span>
                            <span>${this.formatPaymentMethod(checkout.paymentMethod)}</span>
                        </div>
                        <div>
                            <span class="font-medium">Payment Status:</span>
                            <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Paid
                            </span>
                        </div>
                    </div>
                    ${checkout.additionalNotes ? `
                        <div>
                            <span class="font-medium">Notes:</span>
                            <p class="mt-1 text-gray-600">${checkout.additionalNotes}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    generateSampleData() {
        const sampleCheckouts = [
            {
                id: 1,
                guestName: 'Jane Smith',
                roomNumber: '201',
                checkoutTime: '2024-01-20T10:30:00',
                checkInDate: '2024-01-16',
                checkOutDate: '2024-01-20',
                originalAmount: 800,
                finalAmount: 850,
                additionalCharges: {
                    lateCheckoutFee: 25,
                    roomServiceCharges: 25
                },
                paymentMethod: 'credit_card',
                paymentStatus: 'paid',
                notes: 'Guest was satisfied with their stay',
                checkinId: 2
            },
            {
                id: 2,
                guestName: 'Alice Brown',
                roomNumber: '102',
                checkoutTime: '2024-01-19T09:15:00',
                checkInDate: '2024-01-15',
                checkOutDate: '2024-01-19',
                originalAmount: 320,
                finalAmount: 320,
                additionalCharges: {},
                paymentMethod: 'cash',
                paymentStatus: 'paid',
                notes: 'Early checkout, no additional charges',
                checkinId: 4
            },
            {
                id: 3,
                guestName: 'Bob Wilson',
                roomNumber: '305',
                checkoutTime: '2024-01-18T11:45:00',
                checkInDate: '2024-01-14',
                checkOutDate: '2024-01-18',
                originalAmount: 600,
                finalAmount: 675,
                additionalCharges: {
                    miniBarCharges: 50,
                    damageCharges: 25
                },
                paymentMethod: 'debit_card',
                paymentStatus: 'paid',
                notes: 'Minor damage to room, charges applied',
                checkinId: 5
            }
        ];

        this.checkouts = sampleCheckouts;
        this.saveCheckouts();
        this.renderCheckoutHistory();
        this.showNotification('Sample check-out data generated successfully!', 'success');
    }

    generateSampleCheckinData() {
        const sampleCheckins = [
            {
                id: 1,
                guestName: 'John Doe',
                guestEmail: 'john.doe@email.com',
                guestPhone: '+1-555-0123',
                roomNumber: '101',
                checkInDate: '2024-01-15',
                checkOutDate: '2024-01-18',
                totalAmount: 240,
                status: 'checked-in',
                specialRequests: 'Early check-in preferred',
                bookingId: 'BK001'
            },
            {
                id: 2,
                guestName: 'Jane Smith',
                guestEmail: 'jane.smith@email.com',
                guestPhone: '+1-555-0456',
                roomNumber: '201',
                checkInDate: '2024-01-16',
                checkOutDate: '2024-01-20',
                totalAmount: 800,
                status: 'checked-in',
                specialRequests: 'High floor room',
                bookingId: 'BK002'
            },
            {
                id: 3,
                guestName: 'Mike Johnson',
                guestEmail: 'mike.johnson@email.com',
                guestPhone: '+1-555-0789',
                roomNumber: '301',
                checkInDate: '2024-01-17',
                checkOutDate: '2024-01-19',
                totalAmount: 300,
                status: 'checked-in',
                specialRequests: 'Non-smoking room',
                bookingId: 'BK003'
            },
            {
                id: 4,
                guestName: 'Sarah Wilson',
                guestEmail: 'sarah.wilson@email.com',
                guestPhone: '+1-555-0321',
                roomNumber: '102',
                checkInDate: '2024-01-18',
                checkOutDate: '2024-01-22',
                totalAmount: 400,
                status: 'checked-in',
                specialRequests: 'Quiet room preferred',
                bookingId: 'BK004'
            },
            {
                id: 5,
                guestName: 'David Brown',
                guestEmail: 'david.brown@email.com',
                guestPhone: '+1-555-0654',
                roomNumber: '202',
                checkInDate: '2024-01-19',
                checkOutDate: '2024-01-21',
                totalAmount: 200,
                status: 'checked-in',
                specialRequests: 'Extra towels needed',
                bookingId: 'BK005'
            }
        ];

        localStorage.setItem('checkins', JSON.stringify(sampleCheckins));
        this.showNotification('Sample check-in data generated successfully! You can now test the search functionality.', 'success');
    }
}

// Initialize the checkout manager when the page loads
let checkoutManager;
document.addEventListener('DOMContentLoaded', () => {
    checkoutManager = new CheckoutManager();
}); 