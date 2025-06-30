// Rooms Management JavaScript

class RoomsManager {
    constructor() {
        this.rooms = this.loadRooms();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderRooms();
    }

    bindEvents() {
        // Add room button
        document.getElementById('addRoomBtn').addEventListener('click', () => {
            this.showModal();
        });

        // Modal events
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('roomForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRoom();
        });

        // Filter events
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterRooms();
        });

        document.getElementById('typeFilter').addEventListener('change', () => {
            this.filterRooms();
        });

        document.getElementById('floorFilter').addEventListener('change', () => {
            this.filterRooms();
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterRooms();
        });

        // Generate sample data button
        document.getElementById('generateSampleBtn').addEventListener('click', () => {
            this.generateSampleData();
        });

        // Refresh data button
        document.getElementById('refreshDataBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // Close modal on outside click
        document.getElementById('roomModal').addEventListener('click', (e) => {
            if (e.target.id === 'roomModal') {
                this.hideModal();
            }
        });

        // Event delegation for room actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="edit-room"]')) {
                const roomId = parseInt(e.target.getAttribute('data-id'));
                this.editRoom(roomId);
            } else if (e.target.matches('[data-action="delete-room"]')) {
                const roomId = parseInt(e.target.getAttribute('data-id'));
                this.deleteRoom(roomId);
            }
        });
    }

    loadRooms() {
        const saved = localStorage.getItem('hotelRooms');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default rooms data
        return [
            {
                id: 1,
                roomNumber: '101',
                floor: 1,
                type: 'single',
                price: 80,
                status: 'available',
                description: 'Comfortable single room with city view'
            },
            {
                id: 2,
                roomNumber: '102',
                floor: 1,
                type: 'double',
                price: 120,
                status: 'occupied',
                description: 'Spacious double room with balcony'
            },
            {
                id: 3,
                roomNumber: '201',
                floor: 2,
                type: 'suite',
                price: 200,
                status: 'available',
                description: 'Luxury suite with separate living area'
            },
            {
                id: 4,
                roomNumber: '202',
                floor: 2,
                type: 'deluxe',
                price: 150,
                status: 'cleaning',
                description: 'Deluxe room with premium amenities'
            }
        ];
    }

    saveRooms() {
        localStorage.setItem('hotelRooms', JSON.stringify(this.rooms));
    }

    renderRooms(roomsToRender = this.rooms) {
        const grid = document.getElementById('roomsGrid');
        grid.innerHTML = '';

        if (roomsToRender.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500 text-lg">No rooms found matching your criteria.</p>
                </div>
            `;
            return;
        }

        roomsToRender.forEach(room => {
            const card = this.createRoomCard(room);
            grid.appendChild(card);
        });
    }

    createRoomCard(room) {
        const card = document.createElement('div');
        card.className = 'room-card bg-white rounded-lg shadow-md p-6 relative';
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-semibold text-gray-900">Room ${room.roomNumber}</h3>
                    <p class="text-sm text-gray-500">Floor ${room.floor}</p>
                </div>
                <span class="room-type-badge type-${room.type}">${room.type}</span>
            </div>
            
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="text-gray-600">Price:</span>
                    <span class="font-semibold">$${room.price}/night</span>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">Status:</span>
                    <span class="px-2 py-1 rounded-full text-xs font-medium status-${room.status}">
                        ${room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </span>
                </div>
                
                <p class="text-sm text-gray-600 mt-3">${room.description}</p>
            </div>
            
            <div class="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button data-action="edit-room" data-id="${room.id}" 
                        class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                    Edit
                </button>
                <button data-action="delete-room" data-id="${room.id}" 
                        class="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors">
                    Delete
                </button>
            </div>
        `;
        
        return card;
    }

    showModal(room = null) {
        const modal = document.getElementById('roomModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('roomForm');
        
        if (room) {
            title.textContent = 'Edit Room';
            this.currentEditId = room.id;
            this.populateForm(room);
        } else {
            title.textContent = 'Add New Room';
            this.currentEditId = null;
            form.reset();
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex', 'modal-enter');
    }

    hideModal() {
        const modal = document.getElementById('roomModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'modal-enter');
        this.currentEditId = null;
    }

    populateForm(room) {
        document.getElementById('roomNumber').value = room.roomNumber;
        document.getElementById('roomFloor').value = room.floor;
        document.getElementById('roomType').value = room.type;
        document.getElementById('roomPrice').value = room.price;
        document.getElementById('roomStatus').value = room.status;
        document.getElementById('roomDescription').value = room.description;
    }

    saveRoom() {
        const formData = {
            roomNumber: document.getElementById('roomNumber').value,
            floor: parseInt(document.getElementById('roomFloor').value),
            type: document.getElementById('roomType').value,
            price: parseInt(document.getElementById('roomPrice').value),
            status: document.getElementById('roomStatus').value,
            description: document.getElementById('roomDescription').value
        };

        if (this.currentEditId) {
            // Edit existing room
            const index = this.rooms.findIndex(r => r.id === this.currentEditId);
            if (index !== -1) {
                this.rooms[index] = { ...this.rooms[index], ...formData };
            }
        } else {
            // Add new room
            const newRoom = {
                id: Date.now(),
                ...formData
            };
            this.rooms.push(newRoom);
        }

        this.saveRooms();
        this.renderRooms();
        this.hideModal();
        this.showNotification('Room saved successfully!');
    }

    editRoom(id) {
        const room = this.rooms.find(r => r.id === id);
        if (room) {
            this.showModal(room);
        }
    }

    deleteRoom(id) {
        if (confirm('Are you sure you want to delete this room?')) {
            this.rooms = this.rooms.filter(r => r.id !== id);
            this.saveRooms();
            this.renderRooms();
            this.showNotification('Room deleted successfully!');
        }
    }

    filterRooms() {
        const statusFilter = document.getElementById('statusFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const floorFilter = document.getElementById('floorFilter').value;
        const searchFilter = document.getElementById('searchInput').value.toLowerCase();

        let filtered = this.rooms.filter(room => {
            const matchesStatus = !statusFilter || room.status === statusFilter;
            const matchesType = !typeFilter || room.type === typeFilter;
            const matchesFloor = !floorFilter || room.floor.toString() === floorFilter;
            const matchesSearch = !searchFilter || 
                room.roomNumber.toLowerCase().includes(searchFilter) ||
                room.description.toLowerCase().includes(searchFilter);

            return matchesStatus && matchesType && matchesFloor && matchesSearch;
        });

        this.renderRooms(filtered);
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
        const sampleRooms = [
            {
                id: 1,
                roomNumber: '101',
                floor: 1,
                type: 'single',
                price: 80,
                status: 'available',
                description: 'Comfortable single room with city view'
            },
            {
                id: 2,
                roomNumber: '102',
                floor: 1,
                type: 'double',
                price: 120,
                status: 'occupied',
                description: 'Spacious double room with balcony'
            },
            {
                id: 3,
                roomNumber: '201',
                floor: 2,
                type: 'suite',
                price: 200,
                status: 'available',
                description: 'Luxury suite with separate living area'
            },
            {
                id: 4,
                roomNumber: '202',
                floor: 2,
                type: 'deluxe',
                price: 150,
                status: 'cleaning',
                description: 'Deluxe room with premium amenities'
            },
            {
                id: 5,
                roomNumber: '301',
                floor: 3,
                type: 'presidential',
                price: 350,
                status: 'available',
                description: 'Presidential suite with panoramic views'
            },
            {
                id: 6,
                roomNumber: '302',
                floor: 3,
                type: 'family',
                price: 180,
                status: 'occupied',
                description: 'Family room with connecting bedrooms'
            }
        ];

        this.rooms = sampleRooms;
        this.saveRooms();
        this.renderRooms();
        this.showNotification('Sample room data generated successfully!', 'success');
    }

    refreshData() {
        this.renderRooms();
        this.showNotification('Room data refreshed successfully!', 'success');
    }
}

// Initialize the rooms manager when the page loads
let roomsManager;
document.addEventListener('DOMContentLoaded', () => {
    roomsManager = new RoomsManager();
}); 