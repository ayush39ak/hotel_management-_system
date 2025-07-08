// Bookings Management JavaScript

class BookingsManager {
    constructor() {
        this.bookings = this.loadBookings();
        this.currentEditId = null;
        this.servicePrices = this.getServicePrices();
        this.init();
    }

    init() {
        this.bindEvents();
        this.syncBookingsWithCheckinData();
        this.renderBookings();
        this.updateSummary();
    }

    bindEvents() {
        // Add booking button
        document.getElementById('addBookingBtn').addEventListener('click', () => {
            this.showModal();
        });

        // Sync check-in data button
        document.getElementById('syncCheckinBtn').addEventListener('click', () => {
            this.syncBookingsWithCheckinData();
            this.showNotification('Check-in data synchronized successfully!', 'success');
        });

        // Generate sample check-in data button
        document.getElementById('generateSampleCheckinBtn').addEventListener('click', () => {
            this.generateSampleCheckinData();
        });

        // Modal events
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBooking();
        });

        // Customer selection event
        document.getElementById('customerSelect').addEventListener('change', (e) => {
            this.loadCustomerData(e.target.value);
        });

        // Real-time pricing calculation events
        document.getElementById('checkInDate').addEventListener('change', () => {
            this.calculatePricing();
            this.updateBookingSummary();
        });

        document.getElementById('checkOutDate').addEventListener('change', () => {
            this.calculatePricing();
            this.updateBookingSummary();
        });

        document.getElementById('roomNumber').addEventListener('change', () => {
            this.calculatePricing();
            this.updateBookingSummary();
        });

        document.getElementById('discount').addEventListener('input', () => {
            this.calculatePricing();
        });

        // Filter events
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterBookings();
        });

        document.getElementById('checkinStatusFilter').addEventListener('change', () => {
            this.filterBookings();
        });

        document.getElementById('dateFilter').addEventListener('change', () => {
            this.filterBookings();
        });

        document.getElementById('guestFilter').addEventListener('input', () => {
            this.filterBookings();
        });

        document.getElementById('roomFilter').addEventListener('input', () => {
            this.filterBookings();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Close modal on outside click
        document.getElementById('bookingModal').addEventListener('click', (e) => {
            if (e.target.id === 'bookingModal') {
                this.hideModal();
            }
        });

        // Booking type change event
        document.getElementById('bookingType').addEventListener('change', (e) => {
            this.handleBookingTypeChange(e.target.value);
        });

        // Service checkboxes events
        const serviceCheckboxes = [
            'serviceAirport', 'serviceBreakfast', 'serviceParking', 'serviceWiFi',
            'serviceLaundry', 'serviceSpa', 'serviceGym', 'serviceLateCheckout'
        ];
        serviceCheckboxes.forEach(serviceId => {
            const element = document.getElementById(serviceId);
            if (element) {
                element.addEventListener('change', () => {
                    this.calculatePricing();
                    this.updateBookingSummary();
                });
            }
        });

        // Group booking events
        document.getElementById('groupSize').addEventListener('input', () => {
            this.calculatePricing();
            this.updateBookingSummary();
        });

        document.getElementById('groupDiscount').addEventListener('input', () => {
            this.calculatePricing();
        });

        // Recurring booking events
        document.getElementById('recurrenceType').addEventListener('change', () => {
            this.updateBookingSummary();
        });

        document.getElementById('recurrenceInterval').addEventListener('input', () => {
            this.updateBookingSummary();
        });

        document.getElementById('recurrenceEndDate').addEventListener('change', () => {
            this.updateBookingSummary();
        });

        // Add event listener for Clear All Bookings button
        const clearBtn = document.getElementById('clearBookingsBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllBookings();
            });
        }
    }

    loadBookings() {
        const saved = localStorage.getItem('hotelBookings');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default bookings data
        return [
            {
                id: 1,
                guestName: 'Ayush',
                email: 'ayush@gamil.com',
                phone: '123-456-7890',
                roomNumber: '101',
                roomType: 'single',
                checkInDate: '2024-07-01',
                checkOutDate: '2024-07-03',
                adults: 1,
                children: 0,
                totalAmount: 240,
                status: 'confirmed',
                specialRequests: 'Early check-in if possible',
                bookingDate: '2024-06-25'
            },
            {
                id: 2,
                guestName: 'Sumit',
                email: 'sumit@egmail.com',
                phone: '098-765-4321',
                roomNumber: '201',
                roomType: 'suite',
                checkInDate: '2024-07-05',
                checkOutDate: '2024-07-08',
                adults: 2,
                children: 1,
                totalAmount: 600,
                status: 'confirmed',
                specialRequests: 'Extra towels needed',
                bookingDate: '2024-06-26'
            }
        ];
    }

    saveBookings() {
        localStorage.setItem('hotelBookings', JSON.stringify(this.bookings));
    }

    renderBookings(bookingsToRender = this.bookings) {
        const tbody = document.getElementById('bookingsTableBody');
        tbody.innerHTML = '';

        if (bookingsToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                        No bookings found matching your criteria.
                    </td>
                </tr>
            `;
            return;
        }

        bookingsToRender.forEach(booking => {
            const row = this.createBookingRow(booking);
            tbody.appendChild(row);
        });
    }

    createBookingRow(booking) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        // Add special classes for recurring and group bookings
        if (booking.isRecurring) {
            row.classList.add('recurring-booking');
        }
        if (booking.bookingType === 'group') {
            row.classList.add('group-booking');
        }
        
        // Get check-in information for this booking
        const checkinInfo = this.getCheckinInfoForBooking(booking);
        
        // Get check-in details from booking record itself
        const bookingCheckinInfo = booking.checkinInfo;
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #${booking.id}
                ${booking.isRecurring ? '<span class="ml-1 text-xs bg-purple-100 text-purple-800 px-1 rounded">R</span>' : ''}
                ${booking.bookingType === 'group' ? '<span class="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">G</span>' : ''}
                ${booking.bookingType === 'walk_in' ? '<span class="ml-1 text-xs bg-orange-100 text-orange-800 px-1 rounded">W</span>' : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                    <div class="font-medium">${booking.guestName || ''}</div>
                    <div class="text-gray-500 text-xs">${booking.guestEmail || ''}</div>
                    ${booking.services && booking.services.length > 0 ? 
                        `<div class="text-xs text-green-600">${booking.services.slice(0, 2).join(', ')}${booking.services.length > 2 ? '...' : ''}</div>` : ''}
                    ${bookingCheckinInfo && bookingCheckinInfo.guestInfo ? 
                        `<div class="text-xs text-blue-600">✓ Check-in: ${bookingCheckinInfo.guestInfo.firstName || ''} ${bookingCheckinInfo.guestInfo.lastName || ''}</div>` : ''}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Room ${booking.roomNumber || ''}
                ${booking.preferences && booking.preferences.length > 0 ? 
                    `<div class="text-xs text-blue-600">${booking.preferences.slice(0, 1).join(', ')}</div>` : ''}
                ${bookingCheckinInfo && bookingCheckinInfo.roomInfo ? 
                    `<div class="text-xs text-gray-600">${bookingCheckinInfo.roomInfo.roomType || ''} - ₹${bookingCheckinInfo.roomInfo.roomPrice || ''}/night</div>` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    ${this.getBookingTypeText(booking.bookingType || 'standard')}
                </span>
                ${booking.group ? `<div class="text-xs text-gray-500">${booking.group.size || ''} guests</div>` : ''}
                ${bookingCheckinInfo && bookingCheckinInfo.checkinMethod ? 
                    `<div class="text-xs text-gray-500">${bookingCheckinInfo.checkinMethod === 'walk_in' ? 'Walk-in' : 'From Booking'}</div>` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${this.formatDate(booking.checkInDate || '')}
                ${bookingCheckinInfo && bookingCheckinInfo.actualCheckInDate ? 
                    `<div class="text-xs text-green-600">Actual: ${this.formatDate(bookingCheckinInfo.actualCheckInDate)}</div>` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${this.formatDate(booking.checkOutDate || '')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${this.renderCheckinStatus(checkinInfo, bookingCheckinInfo)}
            </td>
            <td class="px-2 py-1 text-xs font-medium rounded-full status-${booking.status || 'confirmed'}">
                ${this.getStatusText(booking.status || 'confirmed')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full payment-${booking.paymentStatus || 'pending'}">
                    ${this.getPaymentStatusText(booking.paymentStatus || 'pending')}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                    <div class="font-semibold">₹${booking.totalAmount || 0}</div>
                    ${booking.discount > 0 ? `<div class="text-green-600 text-xs">-${booking.discount}% off</div>` : ''}
                    ${booking.group && booking.group.discount > 0 ? `<div class="text-blue-600 text-xs">Group: -${booking.group.discount}%</div>` : ''}
                    ${checkinInfo && checkinInfo.finalAmount && checkinInfo.finalAmount !== booking.totalAmount ? 
                        `<div class="text-orange-600 text-xs">Final: ₹${checkinInfo.finalAmount}</div>` : ''}
                    ${bookingCheckinInfo && bookingCheckinInfo.financialInfo && bookingCheckinInfo.financialInfo.originalBookingAmount !== bookingCheckinInfo.financialInfo.actualCheckInAmount ? 
                        `<div class="text-purple-600 text-xs">Check-in: ₹${bookingCheckinInfo.financialInfo.actualCheckInAmount}</div>` : ''}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="bookingsManager.editBooking(${booking.id})" 
                        class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                ${(checkinInfo && checkinInfo.status === 'checked_in') || (checkinInfo && checkinInfo.status === 'checked_out') || (bookingCheckinInfo && (bookingCheckinInfo.status === 'checked_in' || bookingCheckinInfo.status === 'checked_out'))
                    ? ''
                    : `<button onclick="bookingsManager.checkInBooking(${booking.id})" class="text-green-600 hover:text-green-900 mr-3">Check In</button>`}
                ${(checkinInfo || bookingCheckinInfo) ? 
                    `<button onclick="bookingsManager.viewCheckinDetails(${booking.id})" 
                            class="text-green-600 hover:text-green-900 mr-3">Check-in Details</button>` : ''}
                <button onclick="bookingsManager.deleteBooking(${booking.id})" 
                        class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        `;
        
        return row;
    }

    showModal(booking = null) {
        const modal = document.getElementById('bookingModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('bookingForm');
        
        // Load and populate room options
        this.populateRoomOptions();
        
        // Load and populate customer options
        this.populateCustomerOptions();
        
        if (booking) {
            title.textContent = 'Edit Booking';
            this.currentEditId = booking.id;
            this.populateForm(booking);
        } else {
            title.textContent = 'New Booking';
            this.currentEditId = null;
            form.reset();
            // Set default values
            document.getElementById('bookingType').value = 'standard';
            document.getElementById('paymentMethod').value = 'credit_card';
            document.getElementById('paymentStatus').value = 'pending';
            document.getElementById('discount').value = '0';
            document.getElementById('depositAmount').value = '0';
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Calculate initial pricing
        setTimeout(() => this.calculatePricing(), 100);
    }

    hideModal() {
        const modal = document.getElementById('bookingModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.currentEditId = null;
    }

    populateForm(booking) {
        // Customer information
        document.getElementById('customerSelect').value = booking.customerId || '';
        document.getElementById('guestName').value = booking.guestName || '';
        document.getElementById('guestEmail').value = booking.guestEmail || '';
        document.getElementById('guestPhone').value = booking.guestPhone || '';
        document.getElementById('idType').value = booking.idType || 'passport';
        document.getElementById('idNumber').value = booking.idNumber || '';
        
        // Booking details
        const roomSelect = document.getElementById('roomNumber');
        const currentRoomOption = roomSelect.querySelector(`option[value="${booking.roomNumber}"]`);
        if (!currentRoomOption && booking.roomNumber) {
            const option = document.createElement('option');
            option.value = booking.roomNumber;
            option.textContent = `Room ${booking.roomNumber} (Current Booking)`;
            roomSelect.appendChild(option);
        }
        roomSelect.value = booking.roomNumber;
        
        document.getElementById('bookingType').value = booking.bookingType || 'standard';
        document.getElementById('checkInDate').value = booking.checkInDate || '';
        document.getElementById('checkOutDate').value = booking.checkOutDate || '';
        document.getElementById('numGuests').value = booking.numGuests || 1;
        document.getElementById('bookingStatus').value = booking.status || 'confirmed';
        
        // Advanced options
        document.getElementById('paymentMethod').value = booking.paymentMethod || 'credit_card';
        document.getElementById('paymentStatus').value = booking.paymentStatus || 'pending';
        document.getElementById('discount').value = booking.discount || 0;
        document.getElementById('depositAmount').value = booking.depositAmount || 0;
        
        // Special requests and notes
        document.getElementById('specialRequests').value = booking.specialRequests || '';
        document.getElementById('internalNotes').value = booking.internalNotes || '';
        
        // Calculate pricing after form is populated
        setTimeout(() => this.calculatePricing(), 100);
    }

    populateRoomOptions() {
        const roomSelect = document.getElementById('roomNumber');
        roomSelect.innerHTML = '<option value="">Select Room</option>';
        
        // Load rooms from localStorage
        const savedRooms = localStorage.getItem('hotelRooms');
        if (savedRooms) {
            const rooms = JSON.parse(savedRooms);
            
            // If editing a booking, show all rooms. If creating new, show only available rooms
            let roomsToShow = rooms;
            if (!this.currentEditId) {
                roomsToShow = rooms.filter(room => 
                    room.status === 'available' || room.status === 'cleaning'
                );
            }
            
            if (roomsToShow.length === 0) {
                roomSelect.innerHTML = '<option value="">No rooms available</option>';
                return;
            }
            
            // Sort rooms by room number
            roomsToShow.sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber));
            
            // Add room options
            roomsToShow.forEach(room => {
                const option = document.createElement('option');
                option.value = room.roomNumber;
                const statusText = room.status === 'available' ? 'Available' : 
                                 room.status === 'occupied' ? 'Occupied' :
                                 room.status === 'maintenance' ? 'Maintenance' :
                                 room.status === 'cleaning' ? 'Cleaning' : room.status;
                option.textContent = `Room ${room.roomNumber} - ${room.type} (₹${room.price}/night) - ${statusText}`;
                roomSelect.appendChild(option);
            });
        } else {
            // If no rooms data, add some default options
            const defaultRooms = [
                { roomNumber: '101', type: 'Single', price: 80 },
                { roomNumber: '102', type: 'Single', price: 80 },
                { roomNumber: '201', type: 'Double', price: 120 },
                { roomNumber: '202', type: 'Double', price: 120 },
                { roomNumber: '301', type: 'Suite', price: 200 },
                { roomNumber: '302', type: 'Deluxe', price: 180 }
            ];
            
            defaultRooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.roomNumber;
                option.textContent = `Room ${room.roomNumber} - ${room.type} (₹${room.price}/night)`;
                roomSelect.appendChild(option);
            });
        }
    }

    populateCustomerOptions() {
        const customerSelect = document.getElementById('customerSelect');
        customerSelect.innerHTML = '<option value="">Select Existing Customer</option>';
        
        // Load customers from localStorage
        const savedCustomers = localStorage.getItem('hotelCustomers');
        if (savedCustomers) {
            const customers = JSON.parse(savedCustomers);
            
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.firstName} ${customer.lastName} - ${customer.email}`;
                customerSelect.appendChild(option);
            });
        }
    }

    loadCustomerData(customerId) {
        if (!customerId) return;
        
        const savedCustomers = localStorage.getItem('hotelCustomers');
        if (savedCustomers) {
            const customers = JSON.parse(savedCustomers);
            const customer = customers.find(c => c.id == customerId);
            
            if (customer) {
                document.getElementById('guestName').value = `${customer.firstName} ${customer.lastName}`;
                document.getElementById('guestEmail').value = customer.email;
                document.getElementById('guestPhone').value = customer.phone;
            }
        }
    }

    calculatePricing() {
        const checkInDate = document.getElementById('checkInDate').value;
        const checkOutDate = document.getElementById('checkOutDate').value;
        const roomNumber = document.getElementById('roomNumber').value;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const bookingType = document.getElementById('bookingType').value;
        
        if (!checkInDate || !checkOutDate || !roomNumber) {
            this.updatePricingDisplay(0, 0, 0, 0, 0);
            return;
        }
        
        // Calculate nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        
        if (nights <= 0) {
            this.updatePricingDisplay(0, 0, 0, 0, 0);
            return;
        }
        
        // Get room price
        const savedRooms = localStorage.getItem('hotelRooms');
        let basePrice = 100; // Default price
        
        if (savedRooms) {
            const rooms = JSON.parse(savedRooms);
            const room = rooms.find(r => r.roomNumber === roomNumber);
            if (room) {
                basePrice = room.price;
            }
        }
        
        // Calculate base total
        let baseTotal = nights * basePrice;
        
        // Apply group discount if applicable
        if (bookingType === 'group') {
            const groupDiscount = parseFloat(document.getElementById('groupDiscount').value) || 0;
            const groupSize = parseInt(document.getElementById('groupSize').value) || 1;
            
            if (groupSize >= 5) {
                baseTotal = baseTotal * (1 - (groupDiscount / 100));
            }
        }
        
        // Calculate services cost
        const servicesCost = this.calculateServicesCost(nights);
        
        // Calculate regular discount
        const discountAmount = (baseTotal * discount) / 100;
        
        // Calculate final total
        const finalTotal = baseTotal - discountAmount + servicesCost;
        
        this.updatePricingDisplay(basePrice, nights, discountAmount, servicesCost, finalTotal);
    }

    calculateServicesCost(nights) {
        let totalServicesCost = 0;
        
        // One-time services
        if (document.getElementById('serviceAirport')?.checked) {
            totalServicesCost += this.servicePrices.airport;
        }
        
        if (document.getElementById('serviceParking')?.checked) {
            totalServicesCost += this.servicePrices.parking * nights;
        }
        
        if (document.getElementById('serviceWiFi')?.checked) {
            totalServicesCost += this.servicePrices.wifi * nights;
        }
        
        if (document.getElementById('serviceGym')?.checked) {
            totalServicesCost += this.servicePrices.gym * nights;
        }
        
        // Per-night services
        if (document.getElementById('serviceBreakfast')?.checked) {
            totalServicesCost += this.servicePrices.breakfast * nights;
        }
        
        if (document.getElementById('serviceLaundry')?.checked) {
            totalServicesCost += this.servicePrices.laundry;
        }
        
        if (document.getElementById('serviceSpa')?.checked) {
            totalServicesCost += this.servicePrices.spa;
        }
        
        if (document.getElementById('serviceLateCheckout')?.checked) {
            totalServicesCost += this.servicePrices.lateCheckout;
        }
        
        return totalServicesCost;
    }

    updatePricingDisplay(basePrice, nights, discountAmount, servicesCost, totalAmount) {
        document.getElementById('basePrice').textContent = `₹${basePrice}`;
        document.getElementById('nightsCount').textContent = nights;
        document.getElementById('discountAmount').textContent = `₹${discountAmount.toFixed(2)}`;
        document.getElementById('servicesAmount').textContent = `₹${servicesCost.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `₹${totalAmount.toFixed(2)}`;
        
        // Update breakdown
        const baseTotal = basePrice * nights;
        document.getElementById('totalBreakdown').textContent = 
            `Base: ₹${baseTotal.toFixed(2)} | Discount: ₹${discountAmount.toFixed(2)} | Services: ₹${servicesCost.toFixed(2)}`;
    }

    saveBooking() {
        const formData = {
            customerId: document.getElementById('customerSelect').value ? parseInt(document.getElementById('customerSelect').value) : null,
            guestName: document.getElementById('guestName').value,
            guestEmail: document.getElementById('guestEmail').value,
            guestPhone: document.getElementById('guestPhone').value,
            idType: document.getElementById('idType').value,
            idNumber: document.getElementById('idNumber').value,
            roomNumber: document.getElementById('roomNumber').value,
            bookingType: document.getElementById('bookingType').value,
            checkInDate: document.getElementById('checkInDate').value,
            checkOutDate: document.getElementById('checkOutDate').value,
            numGuests: parseInt(document.getElementById('numGuests').value),
            status: document.getElementById('bookingStatus').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            paymentStatus: document.getElementById('paymentStatus').value,
            discount: parseFloat(document.getElementById('discount').value) || 0,
            depositAmount: parseFloat(document.getElementById('depositAmount').value) || 0,
            specialRequests: document.getElementById('specialRequests').value,
            internalNotes: document.getElementById('internalNotes').value,
            
            // Advanced features
            services: this.getSelectedServices(),
            preferences: this.getSelectedPreferences(),
            totalAmount: this.calculateTotal(),
            updatedAt: new Date().toISOString()
        };

        // Add recurring booking data
        if (formData.bookingType === 'recurring') {
            formData.recurring = {
                type: document.getElementById('recurrenceType').value,
                interval: parseInt(document.getElementById('recurrenceInterval').value),
                endDate: document.getElementById('recurrenceEndDate').value
            };
        }

        // Add group booking data
        if (formData.bookingType === 'group') {
            formData.group = {
                size: parseInt(document.getElementById('groupSize').value),
                type: document.getElementById('groupType').value,
                discount: parseFloat(document.getElementById('groupDiscount').value) || 0
            };
        }

        if (this.currentEditId) {
            // Edit existing booking
            const index = this.bookings.findIndex(b => b.id === this.currentEditId);
            if (index !== -1) {
                this.bookings[index] = { ...this.bookings[index], ...formData };
            }
        } else {
            // Add new booking
            const newBooking = {
                id: Date.now(),
                createdAt: new Date().toISOString(),
                ...formData
            };
            this.bookings.push(newBooking);
            
            // Handle recurring bookings
            if (formData.bookingType === 'recurring' && formData.recurring) {
                this.createRecurringBookings(newBooking);
            }
        }

        this.saveBookings();
        this.renderBookings();
        this.updateSummary();
        this.hideModal();
        this.showNotification('Booking saved successfully!');
    }

    createRecurringBookings(masterBooking) {
        const recurring = masterBooking.recurring;
        if (!recurring || !recurring.endDate) return;

        const startDate = new Date(masterBooking.checkInDate);
        const endDate = new Date(recurring.endDate);
        const interval = recurring.interval || 1;
        
        let currentDate = new Date(startDate);
        let bookingCount = 0;
        const maxBookings = 12; // Limit to prevent infinite loops
        
        while (currentDate <= endDate && bookingCount < maxBookings) {
            // Skip the first booking as it's already created
            if (bookingCount > 0) {
                const nextCheckIn = new Date(currentDate);
                const nextCheckOut = new Date(currentDate);
                nextCheckOut.setDate(nextCheckOut.getDate() + this.calculateNights(masterBooking.checkInDate, masterBooking.checkOutDate));
                
                const recurringBooking = {
                    ...masterBooking,
                    id: Date.now() + bookingCount,
                    checkInDate: nextCheckIn.toISOString().split('T')[0],
                    checkOutDate: nextCheckOut.toISOString().split('T')[0],
                    isRecurring: true,
                    masterBookingId: masterBooking.id,
                    createdAt: new Date().toISOString()
                };
                
                this.bookings.push(recurringBooking);
            }
            
            // Calculate next date based on recurrence type
            switch (recurring.type) {
                case 'daily':
                    currentDate.setDate(currentDate.getDate() + interval);
                    break;
                case 'weekly':
                    currentDate.setDate(currentDate.getDate() + (interval * 7));
                    break;
                case 'monthly':
                    currentDate.setMonth(currentDate.getMonth() + interval);
                    break;
                case 'yearly':
                    currentDate.setFullYear(currentDate.getFullYear() + interval);
                    break;
            }
            
            bookingCount++;
        }
    }

    calculateNights(checkIn, checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    }

    calculateTotal() {
        const checkIn = new Date(document.getElementById('checkInDate').value);
        const checkOut = new Date(document.getElementById('checkOutDate').value);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const roomNumber = document.getElementById('roomNumber').value;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        
        // Get room price
        const savedRooms = localStorage.getItem('hotelRooms');
        let basePrice = 100; // Default price
        
        if (savedRooms) {
            const rooms = JSON.parse(savedRooms);
            const room = rooms.find(r => r.roomNumber === roomNumber);
            if (room) {
                basePrice = room.price;
            }
        }
        
        const baseTotal = nights * basePrice;
        const discountAmount = (baseTotal * discount) / 100;
        return baseTotal - discountAmount;
    }

    editBooking(id) {
        const booking = this.bookings.find(b => b.id === id);
        if (booking) {
            this.showModal(booking);
        }
    }

    deleteBooking(id) {
        if (confirm('Are you sure you want to delete this booking?')) {
            this.bookings = this.bookings.filter(b => b.id !== id);
            this.saveBookings();
            this.renderBookings();
            this.updateSummary();
            this.showNotification('Booking deleted successfully!');
        }
    }

    filterBookings() {
        const statusFilter = document.getElementById('statusFilter').value;
        const checkinStatusFilter = document.getElementById('checkinStatusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        const guestFilter = document.getElementById('guestFilter').value.toLowerCase();
        const roomFilter = document.getElementById('roomFilter').value.toLowerCase();

        let filtered = this.bookings.filter(booking => {
            const matchesStatus = !statusFilter || booking.status === statusFilter;
            
            // Check-in status filtering
            let matchesCheckinStatus = true;
            if (checkinStatusFilter) {
                const checkinInfo = this.getCheckinInfoForBooking(booking);
                if (checkinStatusFilter === 'not-checked-in') {
                    matchesCheckinStatus = !checkinInfo;
                } else if (checkinStatusFilter === 'checked-in') {
                    matchesCheckinStatus = checkinInfo && checkinInfo.status === 'checked-in';
                } else if (checkinStatusFilter === 'checked-out') {
                    matchesCheckinStatus = checkinInfo && checkinInfo.status === 'checked-out';
                }
            }
            
            const matchesGuest = !guestFilter || booking.guestName.toLowerCase().includes(guestFilter);
            const matchesRoom = !roomFilter || booking.roomNumber.toLowerCase().includes(roomFilter);
            
            let matchesDate = true;
            if (dateFilter) {
                const today = new Date();
                const checkInDate = new Date(booking.checkInDate);
                
                switch (dateFilter) {
                    case 'today':
                        matchesDate = this.isSameDay(checkInDate, today);
                        break;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        matchesDate = checkInDate >= weekAgo;
                        break;
                    case 'month':
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        matchesDate = checkInDate >= monthAgo;
                        break;
                }
            }

            return matchesStatus && matchesCheckinStatus && matchesGuest && matchesRoom && matchesDate;
        });

        this.renderBookings(filtered);
    }

    clearFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('checkinStatusFilter').value = '';
        document.getElementById('dateFilter').value = '';
        document.getElementById('guestFilter').value = '';
        document.getElementById('roomFilter').value = '';
        this.filterBookings();
    }

    updateSummary() {
        const totalBookings = this.bookings.length;
        const confirmedBookings = this.bookings.filter(b => b.status === 'confirmed').length;
        const checkedInBookings = this.bookings.filter(b => b.status === 'checked_in').length;
        const completedBookings = this.bookings.filter(b => b.status === 'completed').length;
        
        // Calculate check-in statistics from check-in data
        const savedCheckins = localStorage.getItem('hotelCheckins');
        let totalCheckedIn = 0;
        let totalCheckedOut = 0;
        
        if (savedCheckins) {
            const checkins = JSON.parse(savedCheckins);
            totalCheckedIn = checkins.filter(c => c.status === 'checked_in').length;
            totalCheckedOut = checkins.filter(c => c.status === 'checked_out').length;
        }
        
        // Count bookings with check-in data
        const bookingsWithCheckinData = this.bookings.filter(booking => {
            return booking.checkinInfo || this.getCheckinInfoForBooking(booking);
        }).length;
        
        // Update summary display
        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('confirmedBookings').textContent = confirmedBookings;
        document.getElementById('checkedInBookings').textContent = totalCheckedIn;
        document.getElementById('checkedOutBookings').textContent = totalCheckedOut;
        
        // Update booking count display
        const bookingCount = document.getElementById('bookingCount');
        if (bookingCount) {
            bookingCount.textContent = `${totalBookings} bookings`;
        }
        
        // Add check-in integration status
        const checkinIntegrationStatus = document.getElementById('checkinIntegrationStatus');
        if (checkinIntegrationStatus) {
            const integrationPercentage = totalBookings > 0 ? Math.round((bookingsWithCheckinData / totalBookings) * 100) : 0;
            checkinIntegrationStatus.textContent = `${integrationPercentage}% integrated with check-in data`;
            }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    getStatusText(status) {
        const statusMap = {
            'confirmed': 'Confirmed',
            'checked-in': 'Checked In',
            'checked-out': 'Checked Out',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        let bgColor = 'bg-blue-600';
        let icon = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        
        switch (type) {
            case 'success':
                bgColor = 'bg-green-600';
                icon = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
                break;
            case 'error':
                bgColor = 'bg-red-600';
                icon = 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
                break;
            case 'warning':
                bgColor = 'bg-yellow-600';
                icon = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
                break;
        }
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`;
        notification.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icon}"></path>
            </svg>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getBookingTypeText(bookingType) {
        const typeMap = {
            'standard': 'Standard',
            'advance': 'Advance',
            'group': 'Group',
            'corporate': 'Corporate',
            'vip': 'VIP'
        };
        return typeMap[bookingType] || bookingType;
    }

    getPaymentStatusText(paymentStatus) {
        const statusMap = {
            'paid': 'Paid',
            'pending': 'Pending',
            'partial': 'Partial',
            'refunded': 'Refunded'
        };
        return statusMap[paymentStatus] || paymentStatus;
    }

    getServicePrices() {
        return {
            airport: 50,
            breakfast: 25,
            parking: 15,
            wifi: 10,
            laundry: 30,
            spa: 80,
            gym: 20,
            lateCheckout: 25
        };
    }

    handleBookingTypeChange(bookingType) {
        // Hide all advanced option sections
        document.getElementById('recurringOptions').classList.add('hidden');
        document.getElementById('groupOptions').classList.add('hidden');
        
        // Show relevant section based on booking type
        switch(bookingType) {
            case 'recurring':
                document.getElementById('recurringOptions').classList.remove('hidden');
                break;
            case 'group':
                document.getElementById('groupOptions').classList.remove('hidden');
                break;
        }
        
        this.updateBookingSummary();
    }

    updateBookingSummary() {
        const guestName = document.getElementById('guestName').value || '-';
        const roomNumber = document.getElementById('roomNumber').value || '-';
        const checkInDate = document.getElementById('checkInDate').value;
        const checkOutDate = document.getElementById('checkOutDate').value;
        const bookingType = document.getElementById('bookingType').value;
        
        // Calculate duration
        let duration = '-';
        if (checkInDate && checkOutDate) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            duration = `${nights} night${nights !== 1 ? 's' : ''}`;
        }
        
        // Get selected services
        const selectedServices = this.getSelectedServices();
        const servicesText = selectedServices.length > 0 ? selectedServices.join(', ') : 'None';
        
        // Get selected preferences
        const selectedPreferences = this.getSelectedPreferences();
        const preferencesText = selectedPreferences.length > 0 ? selectedPreferences.join(', ') : 'None';
        
        // Update summary display
        document.getElementById('summaryGuest').textContent = guestName;
        document.getElementById('summaryRoom').textContent = roomNumber !== '-' ? `Room ${roomNumber}` : '-';
        document.getElementById('summaryDuration').textContent = duration;
        document.getElementById('summaryType').textContent = this.getBookingTypeText(bookingType);
        document.getElementById('summaryServices').textContent = servicesText;
        document.getElementById('summaryPreferences').textContent = preferencesText;
    }

    getSelectedServices() {
        const services = [];
        const serviceMap = {
            serviceAirport: 'Airport Transfer',
            serviceBreakfast: 'Breakfast',
            serviceParking: 'Parking',
            serviceWiFi: 'Premium WiFi',
            serviceLaundry: 'Laundry',
            serviceSpa: 'Spa Access',
            serviceGym: 'Gym Access',
            serviceLateCheckout: 'Late Checkout'
        };
        
        Object.keys(serviceMap).forEach(serviceId => {
            const element = document.getElementById(serviceId);
            if (element && element.checked) {
                services.push(serviceMap[serviceId]);
            }
        });
        
        return services;
    }

    getSelectedPreferences() {
        const preferences = [];
        const preferenceMap = {
            prefHighFloor: 'High Floor',
            prefNonSmoking: 'Non-Smoking',
            prefQuiet: 'Quiet Room',
            prefAccessible: 'Accessible',
            prefConnecting: 'Connecting Rooms',
            prefBalcony: 'Balcony',
            prefCityView: 'City View',
            prefPoolView: 'Pool View'
        };
        
        Object.keys(preferenceMap).forEach(prefId => {
            const element = document.getElementById(prefId);
            if (element && element.checked) {
                preferences.push(preferenceMap[prefId]);
            }
        });
        
        return preferences;
    }

    getCheckinInfoForBooking(booking) {
        // Load check-in data from localStorage
        const savedCheckins = localStorage.getItem('hotelCheckins');
        if (!savedCheckins) return null;
        
        const checkins = JSON.parse(savedCheckins);
        
        // Try to find check-in by booking ID first
        let checkin = checkins.find(c => c.bookingId === booking.id);
        
        // If not found by booking ID, try to match by guest name and room
        if (!checkin) {
            checkin = checkins.find(c => 
                c.guestInfo && 
                c.guestInfo.firstName && 
                c.guestInfo.lastName &&
                `${c.guestInfo.firstName} ${c.guestInfo.lastName}`.toLowerCase() === booking.guestName.toLowerCase() &&
                c.roomInfo && 
                c.roomInfo.roomNumber === booking.roomNumber
            );
        }
        
        // If still not found, try to match by email
        if (!checkin && booking.guestEmail) {
            checkin = checkins.find(c => 
                c.guestInfo && 
                c.guestInfo.email && 
                c.guestInfo.email.toLowerCase() === booking.guestEmail.toLowerCase()
            );
        }
        
        return checkin;
    }

    renderCheckinStatus(checkinInfo, bookingCheckinInfo) {
        const checkin = checkinInfo || bookingCheckinInfo;
        
        if (!checkin) {
            return `
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    Not Checked In
                </span>
            `;
        }
        
        let statusClass = 'bg-gray-100 text-gray-800';
        let statusText = 'Unknown';
        
        switch (checkin.status) {
            case 'checked_in':
                statusClass = 'bg-green-100 text-green-800';
                statusText = 'Checked In';
                break;
            case 'checked_out':
                statusClass = 'bg-blue-100 text-blue-800';
                statusText = 'Checked Out';
                break;
            case 'no_show':
                statusClass = 'bg-red-100 text-red-800';
                statusText = 'No Show';
                break;
            case 'cancelled':
                statusClass = 'bg-orange-100 text-orange-800';
                statusText = 'Cancelled';
                break;
        }
        
        let html = `
            <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">
                ${statusText}
            </span>
        `;
        
        // Add check-in time if available
        if (checkin.actualCheckInTime) {
            html += `<div class="text-xs text-gray-500 mt-1">${checkin.actualCheckInTime}</div>`;
        }
        
        // Add check-in method
        if (checkin.checkinMethod) {
            const methodText = checkin.checkinMethod === 'walk_in' ? 'Walk-in' : 'From Booking';
            html += `<div class="text-xs text-blue-600">${methodText}</div>`;
        }
        
        return html;
    }

    viewCheckinDetails(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;
        
        const checkinInfo = this.getCheckinInfoForBooking(booking);
        const bookingCheckinInfo = booking.checkinInfo;
        
        if (!checkinInfo && !bookingCheckinInfo) {
            this.showNotification('No check-in information found for this booking.');
            return;
        }
        
        // Create modal to display check-in details
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        // Determine which source to use for display
        const displayInfo = checkinInfo || bookingCheckinInfo;
        const checkinTime = displayInfo.checkInTime || displayInfo.actualCheckInTime ? new Date(displayInfo.checkInTime || displayInfo.actualCheckInTime).toLocaleString() : 'N/A';
        const checkoutTime = displayInfo.checkoutTime ? new Date(displayInfo.checkoutTime).toLocaleString() : 'N/A';
        const originalAmount = displayInfo.originalAmount || displayInfo.totalAmount || 0;
        const finalAmount = displayInfo.finalAmount || displayInfo.totalAmount || 0;
        const additionalCharges = displayInfo.additionalCharges || { total: 0 };
        
        // Get guest information from the appropriate source
        const guestInfo = bookingCheckinInfo ? bookingCheckinInfo.guestInfo : {
            firstName: displayInfo.guestName ? displayInfo.guestName.split(' ')[0] : '',
            lastName: displayInfo.guestName ? displayInfo.guestName.split(' ').slice(1).join(' ') : '',
            email: displayInfo.guestEmail || '',
            phone: displayInfo.guestPhone || ''
        };
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Check-in Details for Booking #${booking.id}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                ${bookingCheckinInfo ? `
                <!-- Check-in Source Information -->
                <div class="mb-4 bg-blue-50 p-3 rounded-lg">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="text-sm font-medium text-blue-800">
                            Check-in Method: ${bookingCheckinInfo.checkinMethod === 'walk_in' ? 'Walk-in Guest' : 'From Existing Booking'}
                        </span>
                    </div>
                </div>
                ` : ''}
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Guest Information -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-lg mb-3">Guest Information</h4>
                        <div class="space-y-2 text-sm">
                            <div><span class="font-medium">Name:</span> ${guestInfo.firstName} ${guestInfo.lastName}</div>
                            <div><span class="font-medium">Email:</span> ${guestInfo.email || 'N/A'}</div>
                            <div><span class="font-medium">Phone:</span> ${guestInfo.phone || 'N/A'}</div>
                            <div><span class="font-medium">Room:</span> ${displayInfo.roomNumber}</div>
                            <div><span class="font-medium">Guests:</span> ${displayInfo.numGuests || 1}</div>
                            ${bookingCheckinInfo && bookingCheckinInfo.roomInfo ? `
                            <div><span class="font-medium">Room Type:</span> ${bookingCheckinInfo.roomInfo.roomType}</div>
                            <div><span class="font-medium">Room Price:</span> ₹${bookingCheckinInfo.roomInfo.roomPrice}/night</div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Check-in/Check-out Times -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-lg mb-3">Timeline</h4>
                        <div class="space-y-2 text-sm">
                            <div><span class="font-medium">Check-in Date:</span> ${this.formatDate(displayInfo.checkInDate)}</div>
                            <div><span class="font-medium">Check-in Time:</span> ${checkinTime}</div>
                            <div><span class="font-medium">Check-out Date:</span> ${this.formatDate(displayInfo.checkOutDate)}</div>
                            <div><span class="font-medium">Check-out Time:</span> ${checkoutTime}</div>
                            <div><span class="font-medium">Status:</span> 
                                <span class="px-2 py-1 text-xs font-medium rounded-full ${
                                    displayInfo.status === 'checked-out' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }">${displayInfo.status}</span>
                            </div>
                            ${bookingCheckinInfo && bookingCheckinInfo.checkinSummary ? `
                            <div><span class="font-medium">Stay Duration:</span> ${bookingCheckinInfo.checkinSummary.totalNights} nights</div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                ${bookingCheckinInfo && bookingCheckinInfo.financialInfo ? `
                <!-- Financial Information -->
                <div class="mt-6 bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">Financial Summary</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <span class="font-medium">Original Booking Amount:</span>
                            <div class="text-lg font-semibold">₹${bookingCheckinInfo.financialInfo.originalBookingAmount.toFixed(2)}</div>
                        </div>
                        <div>
                            <span class="font-medium">Actual Check-in Amount:</span>
                            <div class="text-lg font-semibold text-green-600">₹${bookingCheckinInfo.financialInfo.actualCheckInAmount.toFixed(2)}</div>
                        </div>
                        <div>
                            <span class="font-medium">Rate per Night:</span>
                            <div class="text-lg font-semibold text-blue-600">₹${bookingCheckinInfo.financialInfo.ratePerNight.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    ${bookingCheckinInfo.financialInfo.originalBookingAmount !== bookingCheckinInfo.financialInfo.actualCheckInAmount ? `
                    <div class="mt-4 bg-yellow-50 p-3 rounded">
                        <h5 class="font-medium mb-2">Amount Difference:</h5>
                        <div class="text-sm">
                            <div>Difference: ₹${(bookingCheckinInfo.financialInfo.actualCheckInAmount - bookingCheckinInfo.financialInfo.originalBookingAmount).toFixed(2)}</div>
                            <div>Reason: Rate adjustment or additional charges</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                ${additionalCharges.total > 0 ? `
                <!-- Additional Charges -->
                <div class="mt-6 bg-orange-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">Additional Charges</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        ${additionalCharges.lateCheckout > 0 ? `
                        <div>Late Check-out: ₹${additionalCharges.lateCheckout.toFixed(2)}</div>
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
                    <div class="mt-2 pt-2 border-t border-orange-200">
                        <span class="font-medium">Total Additional Charges:</span>
                        <span class="font-semibold">₹${additionalCharges.total.toFixed(2)}</span>
                    </div>
                </div>
                ` : ''}
                
                ${displayInfo.checkoutPaymentMethod ? `
                <!-- Payment Information -->
                <div class="mt-6 bg-green-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">Payment Information</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span class="font-medium">Payment Method:</span>
                            <div class="text-sm">${this.formatPaymentMethod(displayInfo.checkoutPaymentMethod)}</div>
                        </div>
                        <div>
                            <span class="font-medium">Payment Status:</span>
                            <div class="text-sm">
                                <span class="px-2 py-1 text-xs font-medium rounded-full ${
                                    displayInfo.checkoutPaymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }">${displayInfo.checkoutPaymentStatus}</span>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                ${displayInfo.checkoutNotes ? `
                <!-- Notes -->
                <div class="mt-6 bg-yellow-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">Check-out Notes</h4>
                    <p class="text-sm">${displayInfo.checkoutNotes}</p>
                </div>
                ` : ''}
                
                ${bookingCheckinInfo && bookingCheckinInfo.checkinSummary ? `
                <!-- Check-in Summary -->
                <div class="mt-6 bg-purple-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">Check-in Summary</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><span class="font-medium">Stay Duration:</span> ${bookingCheckinInfo.checkinSummary.totalNights} nights</div>
                        <div><span class="font-medium">Base Amount:</span> ₹${bookingCheckinInfo.checkinSummary.baseAmount.toFixed(2)}</div>
                        <div><span class="font-medium">Additional Services:</span> ${bookingCheckinInfo.checkinSummary.additionalServices.length}</div>
                        <div><span class="font-medium">Special Requests:</span> ${bookingCheckinInfo.checkinSummary.specialRequests ? 'Yes' : 'No'}</div>
                    </div>
                </div>
                ` : ''}
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

    syncBookingsWithCheckinData() {
        // Load check-in data
        const savedCheckins = localStorage.getItem('hotelCheckins');
        if (!savedCheckins) return;
        
        const checkins = JSON.parse(savedCheckins);
        let updated = false;
        
        // Update each booking with check-in information
        this.bookings.forEach(booking => {
            const checkin = this.getCheckinInfoForBooking(booking);
            
            if (checkin) {
                // Update booking with check-in data
                booking.checkinInfo = {
                    checkinId: checkin.id,
                    actualCheckInDate: checkin.checkInDate,
                    actualCheckInTime: checkin.checkInTime,
                    checkinMethod: checkin.checkinMethod || 'from_booking',
                    guestInfo: checkin.guestInfo,
                    roomInfo: checkin.roomInfo,
                    financialInfo: checkin.financialInfo,
                    services: checkin.services,
                    preferences: checkin.preferences,
                    status: checkin.status
                };
                
                // Update booking status if guest has checked in
                if (checkin.status === 'checked_in') {
                    booking.status = 'checked_in';
                } else if (checkin.status === 'checked_out') {
                    booking.status = 'completed';
                }
                
                updated = true;
            } else {
                // Clear check-in info if no matching check-in found
                delete booking.checkinInfo;
            }
        });
        
        if (updated) {
            this.saveBookings();
            this.renderBookings();
            this.updateSummary();
        }
    }

    generateSampleCheckinData() {
        const savedCheckins = localStorage.getItem('hotelCheckins');
        if (savedCheckins) {
            this.showNotification('Check-in data already exists. Use the sync button to update bookings.', 'warning');
            return;
        }
        
        // Generate sample check-in data based on existing bookings
        const sampleCheckins = [
            {
                id: 1,
                bookingId: 1,
                checkInDate: '2024-07-01',
                checkInTime: '14:30',
                checkOutDate: '2024-07-03',
                checkinMethod: 'from_booking',
                status: 'checked_in',
                guestInfo: {
                    firstName: 'ayush',
                    lastName: 'Johnson',
                    email: 'mike@example.com',
                    phone: '123-456-7890',
                    idType: 'passport',
                    idNumber: 'AB123456'
                },
                roomInfo: {
                    roomNumber: '101',
                    roomType: 'single',
                    roomPrice: 120
                },
                financialInfo: {
                    originalBookingAmount: 240,
                    actualCheckInAmount: 240,
                    depositAmount: 50,
                    remainingAmount: 190
                },
                services: ['WiFi', 'Breakfast'],
                preferences: ['Non-Smoking', 'High Floor'],
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                bookingId: 2,
                checkInDate: '2024-07-05',
                checkInTime: '15:45',
                checkOutDate: '2024-07-08',
                checkinMethod: 'from_booking',
                status: 'checked_in',
                guestInfo: {
                    firstName: 'Sarah',
                    lastName: 'Wilson',
                    email: 'sarah@example.com',
                    phone: '098-765-4321',
                    idType: 'drivers_license',
                    idNumber: 'DL789012'
                },
                roomInfo: {
                    roomNumber: '201',
                    roomType: 'suite',
                    roomPrice: 200
                },
                financialInfo: {
                    originalBookingAmount: 600,
                    actualCheckInAmount: 600,
                    depositAmount: 100,
                    remainingAmount: 500
                },
                services: ['Parking', 'Spa Access'],
                preferences: ['City View', 'Balcony'],
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('hotelCheckins', JSON.stringify(sampleCheckins));
        this.syncBookingsWithCheckinData();
        this.showNotification('Sample check-in data generated and synchronized with bookings!', 'success');
    }

    checkInBooking(id) {
        sessionStorage.setItem('checkinBookingId', id);
        window.location.href = 'checkin.html';
    }

    clearAllBookings() {
        if (confirm('Are you sure you want to clear all bookings? This action cannot be undone.')) {
            this.bookings = [];
            this.saveBookings();
            this.renderBookings();
            this.updateSummary();
            this.showNotification('All bookings have been cleared.', 'success');
        }
    }
}

// Initialize the bookings manager when the page loads
document.addEventListener('DOMContentLoaded', function() {
    bookingsManager = new BookingsManager();
}); 