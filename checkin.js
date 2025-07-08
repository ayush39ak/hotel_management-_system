// Check-in Management JavaScript

class CheckinManager {
    constructor() {
        this.availableRooms = this.loadAvailableRooms();
        this.selectedRoom = null;
        this.guestInfo = {};
        this.selectedBooking = null;
        this.checkins = this.loadCheckins();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderAvailableRooms();
        this.renderCheckinHistory();
        this.setMinDates();
        this.checkBookingDataAvailability();
        this.prefillCheckinFromBookingId();
        this.renderInventoryItemsSection();
    }

    prefillCheckinFromBookingId() {
        const bookingId = sessionStorage.getItem('checkinBookingId');
        if (bookingId) {
            const bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
            const booking = bookings.find(b => b.id == bookingId);
            if (booking) {
                this.selectedBooking = booking;
                this.populateFormWithBooking(booking);
                this.showNotification(`Loaded booking #${booking.id} for check-in.`, 'success');
            } else {
                // Show a clear message in the UI
                const form = document.getElementById('checkinForm');
                if (form) {
                    form.innerHTML = '<div class="text-center text-red-600 font-bold py-8">Booking not found. Please return to bookings and try again.</div>';
                }
                this.showNotification('Booking not found. Please return to bookings and try again.', 'error');
            }
            // Clean up sessionStorage
            sessionStorage.removeItem('checkinBookingId');
        }
    }

    checkBookingDataAvailability() {
        const bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        if (bookings.length === 0) {
            // Show a helpful notification about generating sample data
            setTimeout(() => {
                this.showNotification('No booking data found. Click "Generate Sample Bookings" to create test data for searching.', 'info');
            }, 1000);
        } else {
            // Automatically show all bookings if they exist
            setTimeout(() => {
                this.showAllBookings();
                this.showNotification(`Found ${bookings.length} booking(s) in the system. Use the search fields to find specific bookings.`, 'success');
            }, 500);
        }
    }

    bindEvents() {
        // Ensure all required button/input IDs exist in the HTML
        const requiredIds = [
            'checkinForm', 'backBtn', 'searchBookings', 'clearSearch', 'showAllBookings',
            'directCheckinBtn', 'directBookingId', 'generateSampleBookingsBtn',
            'roomTypeFilter', 'floorFilter', 'priceFilter',
            'printReceipt', 'newCheckin', 'successModal',
            'guestSearch', 'bookingIdSearch', 'roomSearch'
        ];
        for (const id of requiredIds) {
            if (!document.getElementById(id)) {
                this.showNotification(`UI Error: Missing element with id '${id}'. Some features may not work.`, 'error');
            }
        }
        // Form submission
        document.getElementById('checkinForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processCheckin();
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Booking search
        document.getElementById('searchBookings').addEventListener('click', () => {
            this.searchBookings();
        });

        // Clear search
        const clearBtn = document.getElementById('clearSearch');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
            this.clearSearch();
        });
        }

        // Show all bookings
        document.getElementById('showAllBookings').addEventListener('click', () => {
            this.showAllBookings();
        });

        // Direct check-in by booking ID
        document.getElementById('directCheckinBtn').addEventListener('click', () => {
            this.processDirectCheckin();
        });

        // Direct check-in input enter key
        document.getElementById('directBookingId').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processDirectCheckin();
            }
        });

        // Generate sample bookings
        document.getElementById('generateSampleBookingsBtn').addEventListener('click', () => {
            this.generateSampleBookingData();
        });

        // Room selection
        document.getElementById('roomTypeFilter').addEventListener('change', () => {
            this.filterRooms();
        });

        document.getElementById('floorFilter').addEventListener('change', () => {
            this.filterRooms();
        });

        document.getElementById('priceFilter').addEventListener('change', () => {
            this.filterRooms();
        });

        // Success modal buttons
        document.getElementById('printReceipt').addEventListener('click', () => {
            this.printReceipt();
        });

        document.getElementById('newCheckin').addEventListener('click', () => {
            this.resetForm();
        });

        // Close success modal
        document.getElementById('successModal').addEventListener('click', (e) => {
            if (e.target.id === 'successModal') {
                this.hideSuccessModal();
            }
        });

        // Event delegation for check-in history actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="delete-checkin"]')) {
                const checkinId = parseInt(e.target.getAttribute('data-id'));
                this.deleteCheckin(checkinId);
            } else if (e.target.matches('[data-action="view-checkin"]')) {
                const checkinId = parseInt(e.target.getAttribute('data-id'));
                this.viewCheckinDetails(checkinId);
            }
        });

        // Keyboard support for search inputs
        document.getElementById('guestSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchBookings();
            }
        });

        document.getElementById('bookingIdSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchBookings();
            }
        });

        document.getElementById('roomSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchBookings();
            }
        });
    }

    loadAvailableRooms() {
        const saved = localStorage.getItem('hotelRooms');
        if (saved) {
            const allRooms = JSON.parse(saved);
            return allRooms.filter(room => room.status === 'available');
        }
        
        // Default available rooms
        return [
            {
                id: 1,
                roomNumber: '101',
                floor: 1,
                type: 'single',
                price: 80,
                status: 'available',
              
            },
            {
                id: 3,
                roomNumber: '201',
                floor: 2,
                type: 'suite',
                price: 200,
                status: 'available',
                
            },
            {
                id: 5,
                roomNumber: '301',
                floor: 3,
                type: 'deluxe',
                price: 150,
                status: 'available',
                
            }
        ];
    }

    setMinDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkInDate').min = today;
        document.getElementById('checkOutDate').min = today;
    }

    renderAvailableRooms(roomsToRender = this.availableRooms) {
        const container = document.getElementById('availableRooms');
        container.innerHTML = '';

        if (roomsToRender.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">No available rooms matching your criteria.</p>
                </div>
            `;
            return;
        }

        roomsToRender.forEach(room => {
            const card = this.createRoomCard(room);
            container.appendChild(card);
        });
    }

    createRoomCard(room) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-4 border-2 border-transparent hover:border-blue-300 cursor-pointer transition-all';
        card.onclick = () => this.selectRoom(room);
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">Room ${room.roomNumber}</h3>
                    <p class="text-sm text-gray-500">Floor ${room.floor}</p>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    ${room.type.toUpperCase()}
                </span>
            </div>
            
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600">Price:</span>
                    <span class="font-semibold">₹${room.price}/night</span>
                </div>
                <p class="text-sm text-gray-600">${room.description}</p>
            </div>
            
            <div class="mt-3 pt-3 border-t border-gray-200">
                <button class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Select Room
                </button>
            </div>
        `;
        
        return card;
    }

    selectRoom(room) {
        this.selectedRoom = room;
        
        // Update room cards to show selection
        const cards = document.querySelectorAll('#availableRooms > div');
        cards.forEach(card => {
            card.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        // Highlight selected room
        event.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
        
        this.showCheckinSummary();
    }

    showCheckinSummary() {
        const summary = document.getElementById('checkinSummary');
        const content = document.getElementById('summaryContent');
        
        const guestName = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
        const checkInDate = document.getElementById('checkInDate').value;
        const checkOutDate = document.getElementById('checkOutDate').value;
        
        if (guestName.trim() && checkInDate && checkOutDate && this.selectedRoom) {
            const nights = this.calculateNights(checkInDate, checkOutDate);
            const totalAmount = nights * this.selectedRoom.price;
            
            content.innerHTML = `
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <span class="font-medium">Guest:</span>
                    <span>${guestName}</span>
                    <span class="font-medium">Room:</span>
                    <span>${this.selectedRoom.roomNumber} (${this.selectedRoom.type})</span>
                    <span class="font-medium">Check-in:</span>
                    <span>${this.formatDate(checkInDate)}</span>
                    <span class="font-medium">Check-out:</span>
                    <span>${this.formatDate(checkOutDate)}</span>
                    <span class="font-medium">Nights:</span>
                    <span>${nights}</span>
                    <span class="font-medium">Total Amount:</span>
                    <span class="font-bold text-green-600">₹${totalAmount}</span>
                </div>
            `;
            
            summary.classList.remove('hidden');
        }
    }

    processCheckin() {
        // Collect guest information
        this.guestInfo = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            idType: document.getElementById('idType').value,
            idNumber: document.getElementById('idNumber').value,
            numGuests: document.getElementById('numGuests').value,
            paymentMethod: document.getElementById('paymentMethod').value
        };

        if (!this.selectedRoom) {
            this.showNotification('Please select a room first.', 'error');
            return;
        }

        // Collect selected inventory items
        const inventoryCheckboxes = document.querySelectorAll('input[name="inventoryItems[]"]:checked');
        const selectedInventoryIds = Array.from(inventoryCheckboxes).map(cb => parseInt(cb.value));

        // Create check-in record
        const checkin = {
            id: 'checkin_' + Date.now(),
            guestName: `${this.guestInfo.firstName} ${this.guestInfo.lastName}`,
            guestEmail: this.guestInfo.email,
            guestPhone: this.guestInfo.phone,
            roomNumber: this.selectedRoom.roomNumber,
            checkInDate: document.getElementById('checkInDate').value,
            checkOutDate: document.getElementById('checkOutDate').value,
            numGuests: parseInt(this.guestInfo.numGuests),
            status: 'checked-in',
            totalAmount: this.calculateTotal(),
            originalAmount: this.calculateTotal(), // Will be updated if different from booking
            checkInTime: new Date().toISOString(),
            paymentMethod: this.guestInfo.paymentMethod,
            idType: this.guestInfo.idType,
            idNumber: this.guestInfo.idNumber,
            inventoryItems: selectedInventoryIds,
            
            // Additional check-in metadata
            checkinMetadata: {
                processedBy: 'checkin_system',
                processingTime: new Date().toISOString(),
                checkinMethod: this.selectedBooking ? 'from_booking' : 'walk_in',
                roomAssignment: {
                    roomNumber: this.selectedRoom.roomNumber,
                    roomType: this.selectedRoom.type,
                    roomPrice: this.selectedRoom.price,
                    roomFloor: this.selectedRoom.floor,
                    roomStatus: 'occupied'
                },
                stayDetails: {
                    totalNights: this.calculateNights(
                        document.getElementById('checkInDate').value,
                        document.getElementById('checkOutDate').value
                    ),
                    ratePerNight: this.selectedRoom.price,
                    checkInTime: new Date().toLocaleTimeString(),
                    expectedCheckOutTime: '11:00 AM'
                }
            }
        };

        // Add booking information if this was from a booking
        if (this.selectedBooking) {
            checkin.bookingId = this.selectedBooking.id;
            checkin.bookingType = this.selectedBooking.bookingType;
            checkin.specialRequests = this.selectedBooking.specialRequests;
            checkin.services = this.selectedBooking.services;
            checkin.preferences = this.selectedBooking.preferences;
            checkin.customerStatus = this.selectedBooking.customerStatus;
            checkin.paymentStatus = this.selectedBooking.paymentStatus;
            checkin.internalNotes = this.selectedBooking.internalNotes;
            checkin.groupInfo = this.selectedBooking.groupInfo;
            checkin.recurringInfo = this.selectedBooking.recurringInfo;
            
            // Update original amount if different from booking
            if (this.selectedBooking.totalAmount !== this.calculateTotal()) {
                checkin.originalAmount = this.selectedBooking.totalAmount;
                checkin.amountDifference = this.calculateTotal() - this.selectedBooking.totalAmount;
                checkin.amountDifferenceReason = 'Rate adjustment or additional charges';
            }
            
            // Update booking status with comprehensive information
            this.updateBookingStatus(this.selectedBooking.id, 'checked-in');
        } else {
            // For walk-in guests, create a basic booking record
            this.createWalkInBooking(checkin);
        }

        // Save check-in record
        this.saveCheckin(checkin);
        
        // Update room status
        this.updateRoomStatus(this.selectedRoom.id, 'occupied');
        
        // Show success modal
        this.showSuccessModal();
    }

    saveCheckin(checkin) {
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
        checkins.push(checkin);
        localStorage.setItem('checkins', JSON.stringify(checkins));
        
        // Update the local checkins array and re-render
        this.checkins = checkins;
        this.renderCheckinHistory();
    }

    updateBookingStatus(bookingId, status) {
        const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
        const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
        
        if (bookingIndex !== -1) {
            const originalBooking = bookings[bookingIndex];
            
            // Update booking with comprehensive check-in information
            bookings[bookingIndex] = {
                ...originalBooking,
                status: status,
                checkInTime: new Date().toISOString(),
                checkInDate: new Date().toISOString().split('T')[0],
                
                // Check-in details
                checkinInfo: {
                    checkinId: 'checkin_' + Date.now(),
                    actualCheckInTime: new Date().toISOString(),
                    actualCheckInDate: new Date().toISOString().split('T')[0],
                    processedBy: 'checkin_system',
                    processingTime: new Date().toISOString(),
                    
                    // Guest information from check-in
                    guestInfo: {
                        firstName: this.guestInfo.firstName,
                        lastName: this.guestInfo.lastName,
                        email: this.guestInfo.email,
                        phone: this.guestInfo.phone,
                        idType: this.guestInfo.idType,
                        idNumber: this.guestInfo.idNumber,
                        numGuests: this.guestInfo.numGuests,
                        paymentMethod: this.guestInfo.paymentMethod
                    },
                    
                    // Room information
                    roomInfo: {
                        roomNumber: this.selectedRoom.roomNumber,
                        roomType: this.selectedRoom.type,
                        roomPrice: this.selectedRoom.price,
                        roomFloor: this.selectedRoom.floor
                    },
                    
                    // Financial information
                    financialInfo: {
                        originalBookingAmount: originalBooking.totalAmount,
                        actualCheckInAmount: this.calculateTotal(),
                        nights: this.calculateNights(
                            document.getElementById('checkInDate').value,
                            document.getElementById('checkOutDate').value
                        ),
                        ratePerNight: this.selectedRoom.price
                    },
                    
                    // Check-in summary
                    checkinSummary: {
                        totalNights: this.calculateNights(
                            document.getElementById('checkInDate').value,
                            document.getElementById('checkOutDate').value
                        ),
                        baseAmount: this.calculateTotal(),
                        additionalServices: this.selectedBooking ? this.selectedBooking.services || [] : [],
                        specialRequests: this.selectedBooking ? this.selectedBooking.specialRequests || '' : '',
                        preferences: this.selectedBooking ? this.selectedBooking.preferences || [] : []
                    }
                },
                
                // Update timestamps
                updatedAt: new Date().toISOString(),
                lastActivity: 'checkin_processed'
            };
            
            localStorage.setItem('hotelBookings', JSON.stringify(bookings));
            
            // Also update the selected booking object for display
            this.selectedBooking = bookings[bookingIndex];
        }
    }

    showNotification(message, type = 'info') {
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

    updateRoomStatus(roomId, status) {
        const rooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
        const roomIndex = rooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1) {
            rooms[roomIndex].status = status;
            localStorage.setItem('hotelRooms', JSON.stringify(rooms));
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
        document.getElementById('checkinForm').reset();
        this.selectedRoom = null;
        this.selectedBooking = null;
        document.getElementById('checkinSummary').classList.add('hidden');
        document.getElementById('advancedBookingInfo').classList.add('hidden');
        document.getElementById('bookingSearchResults').classList.add('hidden');
        
        // Reset room selection
        const cards = document.querySelectorAll('#availableRooms > div');
        cards.forEach(card => {
            card.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        this.hideSuccessModal();
    }

    filterRooms() {
        const typeFilter = document.getElementById('roomTypeFilter').value;
        const floorFilter = document.getElementById('floorFilter').value;
        const priceFilter = document.getElementById('priceFilter').value;

        let filtered = this.availableRooms.filter(room => {
            const matchesType = !typeFilter || room.type === typeFilter;
            const matchesFloor = !floorFilter || room.floor.toString() === floorFilter;
            
            let matchesPrice = true;
            if (priceFilter) {
                const [min, max] = priceFilter.split('-').map(p => p === '+' ? Infinity : parseInt(p));
                matchesPrice = room.price >= min && (max === Infinity || room.price <= max);
            }

            return matchesType && matchesFloor && matchesPrice;
        });

        this.renderAvailableRooms(filtered);
    }

    calculateNights(checkIn, checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    calculateTotal() {
        const checkIn = document.getElementById('checkInDate').value;
        const checkOut = document.getElementById('checkOutDate').value;
        const nights = this.calculateNights(checkIn, checkOut);
        return nights * this.selectedRoom.price;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    formatDateTime(dateTimeString) {
        return new Date(dateTimeString).toLocaleString();
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

    printReceipt() {
        const receipt = this.generateReceipt();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(receipt);
        printWindow.document.close();
        printWindow.print();
    }

    generateReceipt() {
        const checkIn = document.getElementById('checkInDate').value;
        const checkOut = document.getElementById('checkOutDate').value;
        const nights = this.calculateNights(checkIn, checkOut);
        const total = this.calculateTotal();
        
        return `
            <html>
                <head>
                    <title>Check-in Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .receipt { border: 1px solid #ccc; padding: 20px; }
                        .row { display: flex; justify-content: space-between; margin: 10px 0; }
                        .total { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Hotel Check-in Receipt</h1>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                    </div>
                    <div class="receipt">
                        <div class="row">
                            <span>Guest:</span>
                            <span>${this.guestInfo.firstName} ${this.guestInfo.lastName}</span>
                        </div>
                        <div class="row">
                            <span>Room:</span>
                            <span>${this.selectedRoom.roomNumber}</span>
                        </div>
                        <div class="row">
                            <span>Check-in:</span>
                            <span>${this.formatDate(checkIn)}</span>
                        </div>
                        <div class="row">
                            <span>Check-out:</span>
                            <span>${this.formatDate(checkOut)}</span>
                        </div>
                        <div class="row">
                            <span>Nights:</span>
                            <span>${nights}</span>
                        </div>
                        <div class="row">
                            <span>Rate per night:</span>
                            <span>₹${this.selectedRoom.price}</span>
                        </div>
                        <div class="row total">
                            <span>Total Amount:</span>
                            <span>₹${total}</span>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    searchBookings() {
        const guestSearch = document.getElementById('guestSearch').value.toLowerCase();
        const bookingIdSearch = document.getElementById('bookingIdSearch').value.toLowerCase();
        const roomSearch = document.getElementById('roomSearch').value.toLowerCase();
        // Load bookings from the correct localStorage key
        let bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        // If no bookings exist, auto-generate sample data and re-run search
        if (bookings.length === 0) {
            this.generateSampleBookingData();
            this.showNotification('No bookings found. Sample bookings have been generated. Please try your search again.', 'info');
            bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        }
        const filteredBookings = bookings.filter(booking => {
            const matchesGuest = !guestSearch || 
                (booking.guestName && booking.guestName.toLowerCase().includes(guestSearch)) ||
                (booking.guestEmail && booking.guestEmail.toLowerCase().includes(guestSearch)) ||
                (booking.email && booking.email.toLowerCase().includes(guestSearch));
            // Enhanced booking ID search - handle # symbol and different formats
            const matchesBookingId = !bookingIdSearch || (() => {
                const searchTerm = bookingIdSearch.replace('#', '').trim();
                const bookingId = booking.id.toString();
                return bookingId.includes(searchTerm) || 
                       `#${bookingId}`.includes(searchTerm) ||
                       bookingId.includes(searchTerm.replace('#', ''));
            })();
            const matchesRoom = !roomSearch || 
                booking.roomNumber.toString().includes(roomSearch);
            return matchesGuest && matchesBookingId && matchesRoom;
        });
        this.displaySearchResults(filteredBookings);
    }

    displayNoBookingsMessage() {
        const resultsContainer = document.getElementById('bookingSearchResults');
        const resultsList = document.getElementById('searchResultsList');
        
        resultsList.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
                <p class="text-gray-600 mb-4">There are no bookings in the system to search through.</p>
                <div class="space-y-3">
                    <button onclick="checkinManager.generateSampleBookingData()" 
                            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                        Generate Sample Bookings
                    </button>
                    <div class="text-sm text-gray-500">
                        Or you can create a walk-in check-in without a booking.
                    </div>
                </div>
            </div>
        `;
        
        resultsContainer.classList.remove('hidden');
    }

    displaySearchResults(bookings) {
        const resultsContainer = document.getElementById('bookingSearchResults');
        const resultsList = document.getElementById('searchResultsList');
        if (bookings.length === 0) {
            // ... existing code ...
            resultsContainer.classList.remove('hidden');
            return;
        }
        // Get all bookings from localStorage for existence check
        const allBookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        // ... statsHeader ...
        resultsList.innerHTML = statsHeader + bookings.map(booking => {
            // ... existing code ...
            const exists = allBookings.some(b => b.id == booking.id);
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <h3 class="font-semibold text-lg">${guestName}</h3>
                                <span class="px-2 py-1 text-xs rounded-full ${this.getStatusBadgeClass(status)}">${status}</span>
                                ${booking.bookingType ? `<span class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">${booking.bookingType}</span>` : ''}
                                ${booking.paymentStatus ? `<span class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">${booking.paymentStatus}</span>` : ''}
                                ${isAlreadyCheckedIn ? `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">✓ Checked In</span>` : ''}
                            </div>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                <div><strong>Booking ID:</strong> #${booking.id}</div>
                                <div><strong>Room:</strong> ${booking.roomNumber}
                                <div><strong>Check-in:</strong> ${checkInDate}</div>
                                <div><strong>Check-out:</strong> ${checkOutDate}</div>
                            </div>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600 mt-2">
                                <div><strong>Email:</strong> ${booking.guestEmail || booking.email || 'N/A'}</div>
                                <div><strong>Phone:</strong> ${booking.guestPhone || booking.phone || 'N/A'}</div>
                                <div><strong>Total:</strong> ₹${booking.totalAmount || 0}</div>
                            </div>
                            ${booking.specialRequests ? `<div class="mt-2 text-sm text-gray-600"><strong>Special Requests:</strong> ${booking.specialRequests.substring(0, 100)}${booking.specialRequests.length > 100 ? '...' : ''}</div>` : ''}
                        </div>
                        <div class="flex flex-col space-y-2 ml-4">
                            ${!exists ? `<div class='text-red-600 font-bold'>Booking not found</div>` :
                                canCheckIn ? `<button onclick="checkinManager.quickCheckin('${booking.id}')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Check-in</button>` :
                                isAlreadyCheckedIn ? `<button disabled class="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed">Already Checked In</button>` :
                                `<button disabled class="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed">Cannot Check-in</button>`
                            }
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        resultsContainer.classList.remove('hidden');
    }

    getBookingStatus(booking) {
        const today = new Date();
        const checkInDate = new Date(booking.checkInDate);
        const checkOutDate = new Date(booking.checkOutDate);
        
        if (today < checkInDate) return 'Upcoming';
        if (today >= checkInDate && today < checkOutDate) return 'Active';
        if (today >= checkOutDate) return 'Completed';
        return 'Unknown';
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'Upcoming': return 'bg-yellow-100 text-yellow-800';
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    selectBooking(bookingId) {
        const bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        this.selectedBooking = bookings.find(booking => booking.id === bookingId);
        
        if (this.selectedBooking) {
            this.populateFormWithBooking(this.selectedBooking);
            this.displayAdvancedBookingInfo(this.selectedBooking);
            
            // Hide search results
            document.getElementById('bookingSearchResults').classList.add('hidden');
            
            // Clear search inputs
            document.getElementById('guestSearch').value = '';
            document.getElementById('bookingIdSearch').value = '';
            document.getElementById('roomSearch').value = '';
            
            // Show notification with booking details
            this.showNotification(`Booking #${this.selectedBooking.id} selected for ${this.selectedBooking.guestName}`, 'success');
            
            // Scroll to check-in form
            document.getElementById('checkinForm').scrollIntoView({ behavior: 'smooth' });
        } else {
            this.showNotification('Booking not found. Please try again.', 'error');
        }
    }

    populateFormWithBooking(booking) {
        // Parse guest name if it's a single field
        let firstName = '';
        let lastName = '';
        if (booking.guestName) {
            const nameParts = booking.guestName.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Populate guest information - handle different field names
        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('email').value = booking.guestEmail || booking.email || '';
        document.getElementById('phone').value = booking.guestPhone || booking.phone || '';
        document.getElementById('idType').value = booking.idType || 'passport';
        document.getElementById('idNumber').value = booking.idNumber || '';
        
        // Populate booking details
        document.getElementById('checkInDate').value = booking.checkInDate;
        document.getElementById('checkOutDate').value = booking.checkOutDate;
        document.getElementById('numGuests').value = booking.numGuests || booking.adults || 1;
        document.getElementById('paymentMethod').value = booking.paymentMethod || 'credit_card';
        
        // Select the room from booking
        this.selectRoomByNumber(booking.roomNumber);
        
        // Show notification
        this.showNotification(`Booking #${booking.id} selected for ${booking.guestName}`, 'success');
    }

    selectRoomByNumber(roomNumber) {
        const room = this.availableRooms.find(r => r.roomNumber === roomNumber);
        if (room) {
            this.selectRoom(room);
        }
    }

    displayAdvancedBookingInfo(booking) {
        const advancedInfo = document.getElementById('advancedBookingInfo');
        
        // Show the advanced booking info section
        advancedInfo.classList.remove('hidden');
        
        // Basic booking information
        document.getElementById('displayBookingId').textContent = booking.id || 'N/A';
        document.getElementById('displayBookingType').textContent = booking.bookingType || 'Standard';
        document.getElementById('displayCustomerStatus').textContent = booking.status || 'Confirmed';
        document.getElementById('displayPaymentStatus').textContent = booking.paymentStatus || 'Pending';
        document.getElementById('displayPaymentMethod').textContent = this.formatPaymentMethod(booking.paymentMethod);
        document.getElementById('displayTotalAmount').textContent = `₹${booking.totalAmount || 0}`;
        
        // Special requests and notes
        document.getElementById('displaySpecialRequests').textContent = booking.specialRequests || 'None';
        document.getElementById('displayInternalNotes').textContent = booking.internalNotes || 'None';
        
        // Display services if available
        const servicesContainer = document.getElementById('displayServices');
        if (servicesContainer) {
        if (booking.services && booking.services.length > 0) {
            servicesContainer.innerHTML = booking.services.map(service => 
                    `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-1 mb-1">${service}</span>`
            ).join('');
        } else {
            servicesContainer.innerHTML = '<span class="text-gray-500">No services selected</span>';
            }
        }
        
        // Display preferences if available
        const preferencesContainer = document.getElementById('displayPreferences');
        if (preferencesContainer) {
        if (booking.preferences && booking.preferences.length > 0) {
            preferencesContainer.innerHTML = booking.preferences.map(pref => 
                    `<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs mr-1 mb-1">${pref}</span>`
            ).join('');
        } else {
            preferencesContainer.innerHTML = '<span class="text-gray-500">No preferences specified</span>';
            }
        }
        
        // Display group booking information if available
            const groupInfo = document.getElementById('groupBookingInfo');
        if (groupInfo) {
            if (booking.bookingType === 'group' && booking.group) {
            const groupDisplay = document.getElementById('displayGroupInfo');
                if (groupDisplay) {
            groupDisplay.innerHTML = `
                <div class="text-sm">
                            <div><strong>Group Size:</strong> ${booking.group.size || 'N/A'}</div>
                            <div><strong>Group Type:</strong> ${booking.group.type || 'N/A'}</div>
                            <div><strong>Discount:</strong> ${booking.group.discount || 0}%</div>
                </div>
            `;
                }
            groupInfo.classList.remove('hidden');
        } else {
                groupInfo.classList.add('hidden');
            }
        }
        
        // Display recurring booking information if available
            const recurringInfo = document.getElementById('recurringBookingInfo');
        if (recurringInfo) {
            if (booking.bookingType === 'recurring' && booking.recurring) {
            const recurringDisplay = document.getElementById('displayRecurringInfo');
                if (recurringDisplay) {
            recurringDisplay.innerHTML = `
                <div class="text-sm">
                            <div><strong>Recurrence:</strong> ${booking.recurring.type || 'N/A'}</div>
                            <div><strong>Interval:</strong> ${booking.recurring.interval || 'N/A'}</div>
                            <div><strong>End Date:</strong> ${booking.recurring.endDate || 'N/A'}</div>
                </div>
            `;
                }
            recurringInfo.classList.remove('hidden');
        } else {
                recurringInfo.classList.add('hidden');
            }
        }
    }

    createWalkInBooking(checkin) {
        const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
        
        const walkInBooking = {
            id: Date.now(),
            customerId: null, // No existing customer for walk-in
            guestName: checkin.guestName,
            guestEmail: checkin.guestEmail,
            guestPhone: checkin.guestPhone,
            idType: checkin.idType,
            idNumber: checkin.idNumber,
            roomNumber: checkin.roomNumber,
            bookingType: 'walk_in',
            checkInDate: checkin.checkInDate,
            checkOutDate: checkin.checkOutDate,
            numGuests: checkin.numGuests,
            status: 'checked-in',
            paymentMethod: checkin.paymentMethod,
            paymentStatus: 'pending',
            discount: 0,
            depositAmount: 0,
            specialRequests: '',
            internalNotes: 'Walk-in guest',
            totalAmount: checkin.totalAmount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // Check-in information
            checkInTime: checkin.checkInTime,
            checkInDate: new Date().toISOString().split('T')[0],
            
            // Check-in details
            checkinInfo: {
                checkinId: checkin.id,
                actualCheckInTime: checkin.checkInTime,
                actualCheckInDate: new Date().toISOString().split('T')[0],
                processedBy: 'checkin_system',
                processingTime: new Date().toISOString(),
                checkinMethod: 'walk_in',
                
                // Guest information from check-in
                guestInfo: {
                    firstName: this.guestInfo.firstName,
                    lastName: this.guestInfo.lastName,
                    email: this.guestInfo.email,
                    phone: this.guestInfo.phone,
                    idType: this.guestInfo.idType,
                    idNumber: this.guestInfo.idNumber,
                    numGuests: this.guestInfo.numGuests,
                    paymentMethod: this.guestInfo.paymentMethod
                },
                
                // Room information
                roomInfo: {
                    roomNumber: this.selectedRoom.roomNumber,
                    roomType: this.selectedRoom.type,
                    roomPrice: this.selectedRoom.price,
                    roomFloor: this.selectedRoom.floor
                },
                
                // Financial information
                financialInfo: {
                    originalBookingAmount: checkin.totalAmount,
                    actualCheckInAmount: checkin.totalAmount,
                    nights: this.calculateNights(
                        document.getElementById('checkInDate').value,
                        document.getElementById('checkOutDate').value
                    ),
                    ratePerNight: this.selectedRoom.price
                },
                
                // Check-in summary
                checkinSummary: {
                    totalNights: this.calculateNights(
                        document.getElementById('checkInDate').value,
                        document.getElementById('checkOutDate').value
                    ),
                    baseAmount: checkin.totalAmount,
                    additionalServices: [],
                    specialRequests: '',
                    preferences: []
                }
            },
            
            // Update timestamps
            lastActivity: 'walk_in_checkin_processed'
        };
        
        bookings.push(walkInBooking);
        localStorage.setItem('hotelBookings', JSON.stringify(bookings));
        
        // Link the check-in record to the new booking
        checkin.bookingId = walkInBooking.id;
    }

    loadCheckins() {
        const saved = localStorage.getItem('checkins');
        return saved ? JSON.parse(saved) : [];
    }

    saveCheckins() {
        localStorage.setItem('checkins', JSON.stringify(this.checkins));
    }

    renderCheckinHistory() {
        const tbody = document.getElementById('checkinHistoryTableBody');
        tbody.innerHTML = '';
        if (this.checkins.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="px-6 py-4 text-center text-gray-500">No check-in records found.</td></tr>`;
            return;
        }
        // Load inventory for mapping IDs to names
        let inventory = [];
        try {
            inventory = JSON.parse(localStorage.getItem('hotelInventory')) || [];
        } catch (e) { inventory = []; }
        const inventoryMap = {};
        inventory.forEach(item => { inventoryMap[item.id] = item.name; });
        this.checkins.forEach(checkin => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            // Map inventory IDs to names
            let inventoryNames = '-';
            if (Array.isArray(checkin.inventoryItems) && checkin.inventoryItems.length > 0) {
                inventoryNames = checkin.inventoryItems.map(id => inventoryMap[id] || id).join(', ');
        }
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${checkin.guestName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${checkin.roomNumber}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatDate(checkin.checkInDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatDate(checkin.checkOutDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${checkin.status}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${inventoryNames}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${checkin.totalAmount}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${checkin.paymentMethod}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button data-action="view-checkin" data-id="${checkin.id}" class="text-blue-600 hover:text-blue-900 mr-2">View</button>
                    <button data-action="delete-checkin" data-id="${checkin.id}" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    deleteCheckin(id) {
        console.log('Attempting to delete check-in with ID:', id);
        console.log('Current check-ins:', this.checkins);
        
        if (confirm('Are you sure you want to delete this check-in record?')) {
            const originalLength = this.checkins.length;
            this.checkins = this.checkins.filter(c => c.id !== id);
            const newLength = this.checkins.length;
            
            console.log('Check-ins before deletion:', originalLength);
            console.log('Check-ins after deletion:', newLength);
            
            if (newLength < originalLength) {
                this.saveCheckins();
                this.renderCheckinHistory();
                this.showNotification('Check-in record deleted successfully!', 'success');
                console.log('Check-in deleted successfully');
            } else {
                console.error('Failed to delete check-in - ID not found:', id);
                this.showNotification('Failed to delete check-in record. ID not found.', 'error');
            }
        }
    }

    viewCheckinDetails(id) {
        const checkin = this.checkins.find(c => c.id === id);
        if (!checkin) return;

        // Load checkout data to see if this check-in has been checked out
        const checkouts = JSON.parse(localStorage.getItem('checkouts') || '[]');
        const checkout = checkouts.find(c => c.checkinId === id);

        // Create and show a modal with check-in details
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Check-in Details</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <!-- Check-in Information -->
                <div class="mb-6">
                    <h4 class="text-md font-semibold text-gray-900 mb-3 border-b pb-2">Check-in Information</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="font-medium">Guest Name:</span>
                            <span>${checkin.guestName}</span>
                        </div>
                        <div>
                            <span class="font-medium">Room Number:</span>
                            <span>${checkin.roomNumber}</span>
                        </div>
                        <div>
                            <span class="font-medium">Check-in Date:</span>
                            <span>${this.formatDate(checkin.checkInDate)}</span>
                        </div>
                        <div>
                            <span class="font-medium">Check-out Date:</span>
                            <span>${this.formatDate(checkin.checkOutDate)}</span>
                        </div>
                        <div>
                            <span class="font-medium">Email:</span>
                            <span>${checkin.guestEmail || 'N/A'}</span>
                        </div>
                        <div>
                            <span class="font-medium">Phone:</span>
                            <span>${checkin.guestPhone || 'N/A'}</span>
                        </div>
                        <div>
                            <span class="font-medium">Total Amount:</span>
                            <span>₹${checkin.totalAmount || 0}</span>
                        </div>
                        <div>
                            <span class="font-medium">Status:</span>
                            <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusBadgeClass(checkin.status)}">
                                ${this.getStatusText(checkin.status)}
                            </span>
                        </div>
                    </div>
                    ${checkin.specialRequests ? `
                        <div class="mt-4">
                            <span class="font-medium">Special Requests:</span>
                            <p class="mt-1 text-gray-600">${checkin.specialRequests}</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Check-out Information (if available) -->
                ${checkout ? `
                    <div class="mb-6">
                        <h4 class="text-md font-semibold text-gray-900 mb-3 border-b pb-2">Check-out Information</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <span class="font-medium">Check-out Time:</span>
                                <span>${this.formatDateTime(checkout.checkoutTime)}</span>
                            </div>
                            <div>
                                <span class="font-medium">Final Amount:</span>
                                <span class="font-semibold text-green-600">₹${checkout.finalAmount || 0}</span>
                            </div>
                            <div>
                                <span class="font-medium">Payment Method:</span>
                                <span>${this.formatPaymentMethod(checkout.paymentMethod)}</span>
                            </div>
                            <div>
                                <span class="font-medium">Payment Status:</span>
                                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    ${checkout.paymentStatus.charAt(0).toUpperCase() + checkout.paymentStatus.slice(1)}
                                </span>
                            </div>
                        </div>
                        
                        ${Object.keys(checkout.additionalCharges || {}).length > 0 ? `
                            <div class="mt-4">
                                <span class="font-medium">Additional Charges:</span>
                                <div class="mt-2 grid grid-cols-2 gap-4">
                                    ${Object.entries(checkout.additionalCharges).map(([key, value]) => `
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                            <span class="font-medium">₹${value}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${checkout.notes ? `
                            <div class="mt-4">
                                <span class="font-medium">Check-out Notes:</span>
                                <p class="mt-1 text-gray-600">${checkout.notes}</p>
                            </div>
                        ` : ''}
                    </div>
                ` : checkin.status === 'checked-out' ? `
                    <div class="mb-6">
                        <h4 class="text-md font-semibold text-gray-900 mb-3 border-b pb-2">Check-out Information</h4>
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <p class="text-yellow-800">Guest has been checked out, but detailed checkout information is not available.</p>
                        </div>
                    </div>
                ` : `
                    <div class="mb-6">
                        <h4 class="text-md font-semibold text-gray-900 mb-3 border-b pb-2">Check-out Information</h4>
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <p class="text-blue-800">Guest is currently checked in. Check-out information will be available after checkout.</p>
                        </div>
                    </div>
                `}
            </div>
        `;
        document.body.appendChild(modal);
    }

    getStatusText(status) {
        const statusMap = {
            'checked-in': 'Checked In',
            'checked-out': 'Checked Out',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    generateSampleBookingData() {
        const savedBookings = localStorage.getItem('hotelBookings');
        if (savedBookings) {
            const existingBookings = JSON.parse(savedBookings);
            if (existingBookings.length > 0) {
                this.showNotification('Booking data already exists. You can search for existing bookings.', 'info');
                return;
            }
        }
        
        // Generate sample booking data with consistent field names
        // const sampleBookings = [
            // {
            //     id: 1,
            //     guestName: 'ayush ',
            //     guestEmail: 'ayush@.com',
            //     guestPhone: '123-456-7890',
            //     roomNumber: '101',
            //     roomType: 'single',
            //     checkInDate: '2024-07-01',
            //     checkOutDate: '2024-07-03',
            //     adults: 1,
            //     children: 0,
            //     totalAmount: 240,
            //     status: 'confirmed',
            //     paymentStatus: 'pending',
            //     paymentMethod: 'credit_card',
            //     bookingType: 'standard',
            //     specialRequests: 'Early check-in if possible',
            //     bookingDate: '2024-06-25',
            //     services: ['WiFi', 'Breakfast'],
            //     preferences: ['Non-Smoking', 'High Floor']
            // },
        //     {
        //         id: 2,
        //         guestName: 'Sarah Wilson',
        //         guestEmail: 'sarah@example.com',
        //         guestPhone: '098-765-4321',
        //         roomNumber: '201',
        //         roomType: 'suite',
        //         checkInDate: '2024-07-05',
        //         checkOutDate: '2024-07-08',
        //         adults: 2,
        //         children: 1,
        //         totalAmount: 600,
        //         status: 'confirmed',
        //         paymentStatus: 'paid',
        //         paymentMethod: 'online',
        //         bookingType: 'group',
        //         specialRequests: 'Extra towels needed',
        //         bookingDate: '2024-06-26',
        //         services: ['Parking', 'Spa Access'],
        //         preferences: ['City View', 'Balcony'],
        //         group: {
        //             size: 3,
        //             type: 'Family',
        //             discount: 10
        //         }
        //     },
        //     {
        //         id: 3,
        //         guestName: 'David Brown',
        //         guestEmail: 'david@example.com',
        //         guestPhone: '555-123-4567',
        //         roomNumber: '301',
        //         roomType: 'deluxe',
        //         checkInDate: '2024-07-10',
        //         checkOutDate: '2024-07-12',
        //         adults: 1,
        //         children: 0,
        //         totalAmount: 300,
        //         status: 'confirmed',
        //         paymentStatus: 'partial',
        //         paymentMethod: 'debit_card',
        //         bookingType: 'corporate',
        //         specialRequests: 'Quiet room preferred',
        //         bookingDate: '2024-06-28',
        //         services: ['Gym Access', 'Laundry'],
        //         preferences: ['Quiet Room', 'High Floor']
        //     },
        //     {
        //         id: 4,
        //         guestName: 'Emily Davis',
        //         guestEmail: 'emily@example.com',
        //         guestPhone: '444-555-6666',
        //         roomNumber: '102',
        //         roomType: 'single',
        //         checkInDate: '2024-07-15',
        //         checkOutDate: '2024-07-17',
        //         adults: 1,
        //         children: 0,
        //         totalAmount: 160,
        //         status: 'confirmed',
        //         paymentStatus: 'paid',
        //         paymentMethod: 'credit_card',
        //         bookingType: 'standard',
        //         specialRequests: 'Late check-out if possible',
        //         bookingDate: '2024-06-30',
        //         services: ['WiFi'],
        //         preferences: ['Quiet Room']
        //     },
        //     {
        //         id: 5,
        //         guestName: 'Robert Taylor',
        //         guestEmail: 'robert@example.com',
        //         guestPhone: '777-888-9999',
        //         roomNumber: '202',
        //         roomType: 'suite',
        //         checkInDate: '2024-07-20',
        //         checkOutDate: '2024-07-25',
        //         adults: 2,
        //         children: 2,
        //         totalAmount: 1000,
        //         status: 'confirmed',
        //         paymentStatus: 'pending',
        //         paymentMethod: 'bank_transfer',
        //         bookingType: 'family',
        //         specialRequests: 'Connecting rooms preferred',
        //         bookingDate: '2024-07-01',
        //         services: ['Breakfast', 'Parking', 'WiFi'],
        //         preferences: ['Family Friendly', 'Ground Floor']
        //     }
        // ];
        
        localStorage.setItem('hotelBookings', JSON.stringify(sampleBookings));
        this.showNotification('Sample booking data generated successfully! You can now search for bookings.', 'success');
        
        // Automatically show the search results
        setTimeout(() => {
            this.searchBookings();
        }, 500);
    }

    generateSampleData() {
        const sampleCheckins = [
            // {
            //     id: 1,
            //     guestName: 'John Doe',
            //     guestEmail: 'john.doe@email.com',
            //     guestPhone: '+1-555-0123',
            //     roomNumber: '101',
            //     checkInDate: '2024-01-15',
            //     checkOutDate: '2024-01-18',
            //     totalAmount: 240,
            //     status: 'checked-in',
            //     specialRequests: 'Early check-in preferred',
            //     bookingId: 'BK001'
            // },
            // {
            //     id: 2,
            //     guestName: 'Jane Smith',
            //     guestEmail: 'jane.smith@email.com',
            //     guestPhone: '+1-555-0456',
            //     roomNumber: '201',
            //     checkInDate: '2024-01-16',
            //     checkOutDate: '2024-01-20',
            //     totalAmount: 800,
            //     status: 'checked-out',
            //     specialRequests: 'High floor room',
            //     bookingId: 'BK002'
            // },
            // {
            //     id: 3,
            //     guestName: 'Mike Johnson',
            //     guestEmail: 'mike.johnson@email.com',
            //     guestPhone: '+1-555-0789',
            //     roomNumber: '301',
            //     checkInDate: '2024-01-17',
            //     checkOutDate: '2024-01-19',
            //     totalAmount: 300,
            //     status: 'checked-in',
            //     specialRequests: 'Non-smoking room',
            //     bookingId: 'BK003'
            // }
        ];

        this.checkins = sampleCheckins;
        this.saveCheckins();

        // Generate sample checkout data for Jane Smith (ID: 2)
        // const sampleCheckouts = [
        //     {
        //         id: 1,
        //         guestName: 'Jane Smith',
        //         roomNumber: '201',
        //         checkoutTime: '2024-01-20T10:30:00',
        //         checkInDate: '2024-01-16',
        //         checkOutDate: '2024-01-20',
        //         originalAmount: 800,
        //         finalAmount: 850,
        //         additionalCharges: {
        //             lateCheckoutFee: 25,
        //             roomServiceCharges: 25
        //         },
        //         paymentMethod: 'credit_card',
        //         paymentStatus: 'paid',
        //         notes: 'Guest was satisfied with their stay',
        //         checkinId: 2
        //     }
        // ];

        localStorage.setItem('checkouts', JSON.stringify(sampleCheckouts));
        this.renderCheckinHistory();
        this.showNotification('Sample check-in and checkout data generated successfully!', 'success');
    }

    syncCheckoutData() {
        const checkouts = JSON.parse(localStorage.getItem('checkouts') || '[]');
        let updated = false;

        // Update check-in statuses based on checkout data
        this.checkins.forEach(checkin => {
            const checkout = checkouts.find(c => c.checkinId === checkin.id);
            if (checkout && checkin.status !== 'checked-out') {
                checkin.status = 'checked-out';
                updated = true;
            }
        });

        if (updated) {
            this.saveCheckins();
            this.renderCheckinHistory();
            this.showNotification('Check-in data synchronized with checkout data!', 'success');
        } else {
            this.showNotification('No synchronization needed.', 'info');
        }
    }

    clearSearch() {
        const guestInput = document.getElementById('guestSearch');
        const bookingIdInput = document.getElementById('bookingIdSearch');
        const roomInput = document.getElementById('roomSearch');
        if (guestInput) guestInput.value = '';
        if (bookingIdInput) bookingIdInput.value = '';
        if (roomInput) roomInput.value = '';
        const resultsContainer = document.getElementById('bookingSearchResults');
        const resultsList = document.getElementById('searchResultsList');
        if (resultsContainer) resultsContainer.classList.add('hidden');
        if (resultsList) resultsList.innerHTML = '';
    }

    showAllBookings() {
        let bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        if (bookings.length === 0) {
            this.generateSampleBookingData();
            this.showNotification('No bookings found. Sample bookings have been generated. Showing all bookings.', 'info');
            bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        }
            this.displaySearchResults(bookings);
    }

    // Debug function to help troubleshoot booking search issues
    debugBookingSearch(searchTerm) {
        const bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        console.log('All bookings:', bookings);
        console.log('Search term:', searchTerm);
        
        const results = bookings.filter(booking => {
            const searchTermClean = searchTerm.replace('#', '').trim();
            const bookingId = booking.id.toString();
            const matches = bookingId.includes(searchTermClean) || 
                           `#${bookingId}`.includes(searchTerm) ||
                           bookingId.includes(searchTermClean.replace('#', ''));
            
            console.log(`Booking ID: ${bookingId}, Search: ${searchTermClean}, Matches: ${matches}`);
            return matches;
        });
        
        console.log('Search results:', results);
        return results;
    }

    processDirectCheckin() {
        const bookingIdInput = document.getElementById('directBookingId').value.trim();
        if (!bookingIdInput) {
            this.showNotification('Please enter a booking ID for direct check-in.', 'warning');
            return;
        }
        // Clean the booking ID (remove # if present)
        const cleanBookingId = bookingIdInput.replace('#', '').trim();
        // Find the booking (handle string/number)
        const bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        const booking = bookings.find(b => b.id == cleanBookingId || b.id === cleanBookingId || b.id.toString() === cleanBookingId);
        if (!booking) {
            this.showNotification(`Booking ID #${cleanBookingId} not found. Please check the ID and try again.`, 'error');
            if (bookings.length > 0) {
                const availableIds = bookings.map(b => `#${b.id}`).join(', ');
                setTimeout(() => {
                    this.showNotification(`Available booking IDs: ${availableIds}`, 'info');
                }, 2000);
            }
            return;
        }
        document.getElementById('directBookingId').value = '';
        this.quickCheckin(booking.id);
    }

    quickCheckin(bookingId) {
        const bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        const booking = bookings.find(b => b.id == bookingId || b.id === bookingId || b.id.toString() === bookingId.toString());
        if (!booking) {
            this.showNotification('Booking not found.', 'error');
            return;
        }
        // Check if already checked in
        if (booking.status === 'checked_in' || booking.status === 'checked-in') {
            this.showNotification('This guest is already checked in.', 'warning');
            return;
        }
        
        // Check booking status and dates
        const today = new Date();
        const checkInDate = new Date(booking.checkInDate);
        const checkOutDate = new Date(booking.checkOutDate);
        
        if (today < checkInDate) {
            const daysUntilCheckin = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
            if (!confirm(`This booking is for ${daysUntilCheckin} day(s) from now. Process early check-in for ${booking.guestName}?`)) {
                return;
            }
        }
        
        if (today > checkOutDate) {
            this.showNotification('This booking has already passed the check-out date.', 'error');
            return;
        }
        
        // Check if room is available
        const room = this.availableRooms.find(r => r.roomNumber === booking.roomNumber);
        if (!room) {
            // Try to find any available room of the same type
            const alternativeRoom = this.availableRooms.find(r => r.type === booking.roomType);
            if (alternativeRoom) {
                if (confirm(`Room ${booking.roomNumber} is not available. Would you like to assign Room ${alternativeRoom.roomNumber} instead?`)) {
                    booking.roomNumber = alternativeRoom.roomNumber;
                } else {
                    this.showNotification(`Room ${booking.roomNumber} is not available for check-in.`, 'error');
                    return;
                }
            } else {
                this.showNotification(`No available rooms of type ${booking.roomType} for check-in.`, 'error');
                return;
            }
        }
        
        // Show detailed confirmation with booking information
        const confirmationMessage = `
Direct Check-in Confirmation:

Guest: ${booking.guestName}
Room: ${booking.roomNumber}
Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
Total Amount: ₹${booking.totalAmount}
Payment Status: ${booking.paymentStatus || 'pending'}

Proceed with direct check-in?
        `;
        
        if (!confirm(confirmationMessage)) {
            return;
        }
        
        // Set the selected booking and room
        this.selectedBooking = booking;
        this.selectedRoom = room || this.availableRooms.find(r => r.roomNumber === booking.roomNumber);
        
        // Parse guest name
        let firstName = '';
        let lastName = '';
        if (booking.guestName) {
            const nameParts = booking.guestName.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Set guest information
        this.guestInfo = {
            firstName: firstName,
            lastName: lastName,
            email: booking.guestEmail || booking.email || '',
            phone: booking.guestPhone || booking.phone || '',
            idType: booking.idType || 'passport',
            idNumber: booking.idNumber || '',
            numGuests: booking.numGuests || booking.adults || 1,
            paymentMethod: booking.paymentMethod || 'credit_card'
        };
        
        // Process the check-in
        this.processQuickCheckin(booking);
    }

    processQuickCheckin(booking) {
        try {
            // Create check-in record with enhanced data
            const checkin = {
                id: 'checkin_' + Date.now(),
                guestName: booking.guestName,
                guestEmail: booking.guestEmail || booking.email || '',
                guestPhone: booking.guestPhone || booking.phone || '',
                roomNumber: booking.roomNumber,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                numGuests: booking.numGuests || booking.adults || 1,
                status: 'checked_in',
                totalAmount: booking.totalAmount,
                originalAmount: booking.totalAmount,
                checkInTime: new Date().toISOString(),
                paymentMethod: booking.paymentMethod || 'credit_card',
                idType: booking.idType || 'passport',
                idNumber: booking.idNumber || '',
                inventoryItems: [], // No inventory assigned in quick check-in
                
                // Additional check-in metadata
                checkinMetadata: {
                    processedBy: 'direct_checkin_system',
                    processingTime: new Date().toISOString(),
                    checkinMethod: 'direct_from_booking',
                    roomAssignment: {
                        roomNumber: booking.roomNumber,
                        roomType: booking.roomType,
                        roomPrice: booking.totalAmount / this.calculateNights(booking.checkInDate, booking.checkOutDate),
                        roomFloor: booking.roomNumber.charAt(0),
                        roomStatus: 'occupied'
                    },
                    stayDetails: {
                        totalNights: this.calculateNights(booking.checkInDate, booking.checkOutDate),
                        ratePerNight: booking.totalAmount / this.calculateNights(booking.checkInDate, booking.checkOutDate),
                        checkInTime: new Date().toLocaleTimeString(),
                        expectedCheckOutTime: '11:00 AM'
                    },
                    bookingIntegration: {
                        originalBookingId: booking.id,
                        bookingType: booking.bookingType,
                        paymentStatus: booking.paymentStatus,
                        specialRequests: booking.specialRequests
                    }
                },
                
                // Booking information
                bookingId: booking.id,
                bookingType: booking.bookingType,
                specialRequests: booking.specialRequests,
                services: booking.services || [],
                preferences: booking.preferences || [],
                customerStatus: booking.status,
                paymentStatus: booking.paymentStatus,
                internalNotes: booking.internalNotes,
                groupInfo: booking.group,
                recurringInfo: booking.recurring
            };

            // Save check-in record
            this.saveCheckin(checkin);
            
            // Update booking status
            this.updateBookingStatus(booking.id, 'checked_in');
            
            // Update room status
            if (this.selectedRoom) {
                this.updateRoomStatus(this.selectedRoom.id, 'occupied');
            }
            
            // Hide search results
            document.getElementById('bookingSearchResults').classList.add('hidden');
            
            // Clear search inputs
            document.getElementById('guestSearch').value = '';
            document.getElementById('bookingIdSearch').value = '';
            document.getElementById('roomSearch').value = '';
            
            // Show success notification with details
            const successMessage = `✅ Direct check-in completed successfully!
            
Guest: ${booking.guestName}
Room: ${booking.roomNumber}
Check-in Time: ${new Date().toLocaleTimeString()}
Booking ID: #${booking.id}`;
            
            this.showNotification(successMessage, 'success');
            
            // Refresh the check-in history
            this.renderCheckinHistory();
            this.updateSummaryStatistics();
            
            // Show success modal with receipt
            this.showQuickCheckinSuccessModal(checkin);
            
        } catch (error) {
            console.error('Error during quick check-in:', error);
            this.showNotification('An error occurred during check-in. Please try again.', 'error');
        }
    }

    showQuickCheckinSuccessModal(checkin) {
        // Create an enhanced success modal for direct check-ins
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const checkInTime = new Date(checkin.checkInTime).toLocaleString();
        const checkInDate = new Date(checkin.checkInDate).toLocaleDateString();
        const checkOutDate = new Date(checkin.checkOutDate).toLocaleDateString();
        const totalNights = this.calculateNights(checkin.checkInDate, checkin.checkOutDate);
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div class="text-center">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Direct Check-in Successful!</h3>
                    
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div><strong>Guest:</strong> ${checkin.guestName}</div>
                            <div><strong>Room:</strong> ${checkin.roomNumber}</div>
                            <div><strong>Check-in Time:</strong> ${checkInTime}</div>
                            <div><strong>Booking ID:</strong> #${checkin.bookingId}</div>
                            <div><strong>Check-in Date:</strong> ${checkInDate}</div>
                            <div><strong>Check-out Date:</strong> ${checkOutDate}</div>
                            <div><strong>Total Nights:</strong> ${totalNights}</div>
                            <div><strong>Total Amount:</strong> ₹${checkin.totalAmount}</div>
                        </div>
                    </div>
                    
                    ${checkin.specialRequests ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-left">
                            <div class="text-sm font-medium text-blue-900 mb-1">Special Requests:</div>
                            <div class="text-sm text-blue-800">${checkin.specialRequests}</div>
                        </div>
                    ` : ''}
                    
                    ${checkin.services && checkin.services.length > 0 ? `
                        <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4 text-left">
                            <div class="text-sm font-medium text-purple-900 mb-1">Included Services:</div>
                            <div class="text-sm text-purple-800">${checkin.services.join(', ')}</div>
                        </div>
                    ` : ''}
                    
                    <div class="flex space-x-3 mt-6">
                        <button onclick="this.closest('.fixed').remove(); checkinManager.printQuickCheckinReceipt('${checkin.id}')" 
                                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                            </svg>
                            Print Receipt
                        </button>
                        <button onclick="this.closest('.fixed').remove(); checkinManager.showAllBookings()" 
                                class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Next Check-in
                        </button>
                        <button onclick="this.closest('.fixed').remove()" 
                                class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove modal after 8 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 8000);
    }

    printQuickCheckinReceipt(checkinId) {
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
        const checkin = checkins.find(c => c.id === checkinId);
        
        if (!checkin) {
            this.showNotification('Check-in record not found.', 'error');
            return;
        }
        
        // Generate and print receipt
        const receipt = this.generateQuickCheckinReceipt(checkin);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(receipt);
        printWindow.document.close();
        printWindow.print();
    }

    generateQuickCheckinReceipt(checkin) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Check-in Receipt</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                    .receipt { max-width: 400px; margin: 0 auto; }
                    .row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total { border-top: 1px solid #333; padding-top: 10px; margin-top: 10px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h2>HOTEL CHECK-IN RECEIPT</h2>
                        <p>Quick Check-in</p>
                        <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    </div>
                    
                    <div class="row">
                        <span>Guest Name:</span>
                        <span>${checkin.guestName}</span>
                    </div>
                    <div class="row">
                        <span>Room Number:</span>
                        <span>${checkin.roomNumber}</span>
                    </div>
                    <div class="row">
                        <span>Check-in Date:</span>
                        <span>${new Date(checkin.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div class="row">
                        <span>Check-out Date:</span>
                        <span>${new Date(checkin.checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div class="row">
                        <span>Booking ID:</span>
                        <span>#${checkin.bookingId}</span>
                    </div>
                    <div class="row">
                        <span>Check-in Time:</span>
                        <span>${new Date(checkin.checkInTime).toLocaleTimeString()}</span>
                    </div>
                    
                    <div class="total">
                        <div class="row">
                            <span>Total Amount:</span>
                            <span>₹${checkin.totalAmount}</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
                        <p>Thank you for choosing our hotel!</p>
                        <p>Check-out time: 11:00 AM</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    renderInventoryItemsSection() {
        const section = document.getElementById('inventoryItemsSection');
        if (!section) return;
        let inventory = [];
        try {
            inventory = JSON.parse(localStorage.getItem('hotelInventory')) || [];
        } catch (e) { inventory = []; }
        if (!Array.isArray(inventory) || inventory.length === 0) {
            section.innerHTML = '<div class="text-gray-500">No inventory items available.</div>';
            return;
        }
        section.innerHTML = inventory.map(item => `
            <label class="flex items-center space-x-2">
                <input type="checkbox" name="inventoryItems[]" value="${item.id}" class="form-checkbox h-4 w-4 text-green-600">
                <span class="text-sm">${item.name}</span>
            </label>
        `).join('');
    }

    updateSummaryStatistics() {
        // Get all check-ins from localStorage
        const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');

        // Total check-ins
        const totalCheckins = checkins.length;

        // Currently checked in (status === 'checked_in')
        const activeCheckins = checkins.filter(c => c.status === 'checked_in').length;

        // Completed check-outs (status === 'checked_out')
        const completedCheckouts = checkins.filter(c => c.status === 'checked_out').length;

        // Total revenue (sum of totalAmount for all check-ins)
        const totalRevenue = checkins.reduce((sum, c) => sum + (parseFloat(c.totalAmount) || 0), 0);

        // Update the dashboard cards
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        setText('totalCheckins', totalCheckins);
        setText('activeCheckins', activeCheckins);
        setText('completedCheckouts', completedCheckouts);
        setText('totalRevenue', `₹${totalRevenue}`);
    }
}

// Initialize the check-in manager when the page loads
let checkinManager;
document.addEventListener('DOMContentLoaded', () => {
    checkinManager = new CheckinManager();
}); 