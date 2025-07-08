
// Feedback Management JavaScript

class FeedbackManager {
    constructor() {
        this.feedback = this.loadFeedback();
        this.currentResponseId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderFeedback();
        this.updateSummary();
        this.updateRatingDistribution();
    }

    bindEvents() {
        // Export button
        document.getElementById('exportFeedbackBtn').addEventListener('click', () => {
            this.exportFeedback();
        });

        // Generate sample data button
        document.getElementById('generateSampleBtn').addEventListener('click', () => {
            this.generateSampleData();
        });

        // Refresh data button
        document.getElementById('refreshDataBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // Filter events
        document.getElementById('ratingFilter').addEventListener('change', () => {
            this.filterFeedback();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterFeedback();
        });

        document.getElementById('dateFilter').addEventListener('change', () => {
            this.filterFeedback();
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterFeedback();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Response modal events
        document.getElementById('cancelResponseBtn').addEventListener('click', () => {
            this.hideResponseModal();
        });

        document.getElementById('responseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveResponse();
        });

        // Close modals on outside click
        document.getElementById('responseModal').addEventListener('click', (e) => {
            if (e.target.id === 'responseModal') {
                this.hideResponseModal();
            }
        });

        // Event delegation for feedback actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="respond-feedback"]')) {
                const feedbackId = parseInt(e.target.getAttribute('data-id'));
                this.respondToFeedback(feedbackId);
            } else if (e.target.matches('[data-action="edit-response"]')) {
                const feedbackId = parseInt(e.target.getAttribute('data-id'));
                this.editResponse(feedbackId);
            } else if (e.target.matches('[data-action="delete-feedback"]')) {
                const feedbackId = parseInt(e.target.getAttribute('data-id'));
                this.deleteFeedback(feedbackId);
            }
        });
    }

    loadFeedback() {
        const saved = localStorage.getItem('hotelFeedback');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default feedback data
        return [
            {
                id: 1,
                guestName: 'Mike Johnson',
                rating: 5,
                comment: 'Excellent service and very clean rooms. Staff was very friendly and helpful.',
                date: '2024-07-01',
                status: 'responded',
                response: 'Thank you for your wonderful feedback! We\'re glad you enjoyed your stay.',
                responseDate: '2024-07-02'
            },
            {
                id: 2,
                guestName: 'Sarah Wilson',
                rating: 4,
                comment: 'Great location and comfortable rooms. Would recommend to others.',
                date: '2024-07-03',
                status: 'new',
                response: null,
                responseDate: null
            },
            {
                id: 3,
                guestName: 'David Brown',
                rating: 3,
                comment: 'Room was okay but the WiFi was slow. Breakfast could be better.',
                date: '2024-07-05',
                status: 'new',
                response: null,
                responseDate: null
            },
            {
                id: 4,
                guestName: 'Emily Davis',
                rating: 5,
                comment: 'Amazing experience! The staff went above and beyond to make our stay perfect.',
                date: '2024-07-06',
                status: 'resolved',
                response: 'We\'re thrilled you had such a great experience! Thank you for choosing us.',
                responseDate: '2024-07-07'
            }
        ];
    }

    saveFeedback() {
        localStorage.setItem('hotelFeedback', JSON.stringify(this.feedback));
    }

    renderFeedback(feedbackToRender = this.feedback) {
        const container = document.getElementById('feedbackList');
        container.innerHTML = '';

        if (feedbackToRender.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-500 text-lg">No feedback found matching your criteria.</p>
                </div>
            `;
            return;
        }

        feedbackToRender.forEach(item => {
            const card = this.createFeedbackCard(item);
            container.appendChild(card);
        });
    }

    createFeedbackCard(item) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-6 mb-4';
        
        const statusClass = this.getStatusClass(item.status);
        const statusText = this.getStatusText(item.status);
        const stars = this.generateStars(item.rating);
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">${item.guestName}</h3>
                    <div class="flex items-center mt-1">
                        <div class="flex text-yellow-400 mr-2">
                            ${stars}
                        </div>
                        <span class="text-sm text-gray-500">${this.formatDate(item.date)}</span>
                    </div>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </div>
            
            <div class="mb-4">
                <p class="text-gray-700">${item.comment}</p>
            </div>
            
            ${item.response ? `
                <div class="bg-gray-50 p-4 rounded-lg mb-4">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-sm font-medium text-gray-900">Hotel Response</span>
                        <span class="text-xs text-gray-500">${this.formatDate(item.responseDate)}</span>
                    </div>
                    <p class="text-gray-700 text-sm">${item.response}</p>
                </div>
            ` : ''}
            
            <div class="flex gap-2">
                ${item.status === 'new' ? `
                    <button data-action="respond-feedback" data-id="${item.id}" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                        Respond
                    </button>
                ` : ''}
                <button data-action="edit-response" data-id="${item.id}" 
                        class="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors">
                    ${item.response ? 'Edit Response' : 'Add Response'}
                </button>
                <button data-action="delete-feedback" data-id="${item.id}" 
                        class="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors">
                    Delete
                </button>
            </div>
        `;
        
        return card;
    }

    showResponseModal(feedback = null) {
        const modal = document.getElementById('responseModal');
        const title = document.getElementById('modalTitle');
        const guest = document.getElementById('feedbackGuest');
        const rating = document.getElementById('feedbackRating');
        const date = document.getElementById('feedbackDate');
        const comment = document.getElementById('feedbackComment');
        const form = document.getElementById('responseForm');
        
        if (feedback) {
            title.textContent = 'Respond to Feedback';
            guest.textContent = feedback.guestName;
            rating.innerHTML = this.generateStars(feedback.rating);
            date.textContent = this.formatDate(feedback.date);
            comment.textContent = feedback.comment;
            this.currentResponseId = feedback.id;
            
            // Pre-fill response if editing
            if (feedback.response) {
                document.getElementById('responseText').value = feedback.response;
                document.getElementById('responseStatus').value = feedback.status;
            } else {
                document.getElementById('responseText').value = '';
                document.getElementById('responseStatus').value = 'responded';
            }
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    hideResponseModal() {
        const modal = document.getElementById('responseModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.currentResponseId = null;
    }

    respondToFeedback(id) {
        const feedback = this.feedback.find(f => f.id === id);
        if (feedback) {
            this.showResponseModal(feedback);
        }
    }

    editResponse(id) {
        const feedback = this.feedback.find(f => f.id === id);
        if (feedback) {
            this.showResponseModal(feedback);
        }
    }

    saveResponse() {
        const responseText = document.getElementById('responseText').value;
        const responseStatus = document.getElementById('responseStatus').value;

        if (!this.currentResponseId) return;

        const feedbackIndex = this.feedback.findIndex(f => f.id === this.currentResponseId);
        if (feedbackIndex === -1) return;

        this.feedback[feedbackIndex].response = responseText;
        this.feedback[feedbackIndex].status = responseStatus;
        this.feedback[feedbackIndex].responseDate = new Date().toISOString().split('T')[0];

        this.saveFeedback();
        this.renderFeedback();
        this.updateSummary();
        this.hideResponseModal();
        this.showNotification('Response saved successfully!');
    }

    deleteFeedback(id) {
        if (confirm('Are you sure you want to delete this feedback?')) {
            this.feedback = this.feedback.filter(f => f.id !== id);
            this.saveFeedback();
            this.renderFeedback();
            this.updateSummary();
            this.updateRatingDistribution();
            this.showNotification('Feedback deleted successfully!');
        }
    }

    filterFeedback() {
        const ratingFilter = document.getElementById('ratingFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        const searchFilter = document.getElementById('searchInput').value.toLowerCase();

        let filtered = this.feedback.filter(item => {
            const matchesRating = !ratingFilter || item.rating.toString() === ratingFilter;
            const matchesStatus = !statusFilter || item.status === statusFilter;
            const matchesSearch = !searchFilter || 
                item.guestName.toLowerCase().includes(searchFilter) ||
                item.comment.toLowerCase().includes(searchFilter);
            
            let matchesDate = true;
            if (dateFilter) {
                const today = new Date();
                const feedbackDate = new Date(item.date);
                
                switch (dateFilter) {
                    case 'today':
                        matchesDate = this.isSameDay(feedbackDate, today);
                        break;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        matchesDate = feedbackDate >= weekAgo;
                        break;
                    case 'month':
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        matchesDate = feedbackDate >= monthAgo;
                        break;
                }
            }

            return matchesRating && matchesStatus && matchesSearch && matchesDate;
        });

        this.renderFeedback(filtered);
    }

    clearFilters() {
        document.getElementById('ratingFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFilter').value = '';
        document.getElementById('searchInput').value = '';
        this.filterFeedback();
    }

    updateSummary() {
        const totalReviews = this.feedback.length;
        const averageRating = totalReviews > 0 ? 
            (this.feedback.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1) : '0.0';
        
        const thisMonth = new Date().getMonth();
        const monthlyReviews = this.feedback.filter(f => {
            const feedbackMonth = new Date(f.date).getMonth();
            return feedbackMonth === thisMonth;
        }).length;
        
        const needsResponse = this.feedback.filter(f => f.status === 'new').length;

        // Update summary cards
        document.getElementById('averageRating').textContent = averageRating;
        document.getElementById('totalReviews').textContent = totalReviews;
        document.getElementById('monthlyReviews').textContent = monthlyReviews;
        document.getElementById('needsResponse').textContent = needsResponse;
    }

    updateRatingDistribution() {
        const ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        this.feedback.forEach(f => {
            ratings[f.rating]++;
        });

        const total = this.feedback.length;
        
        Object.keys(ratings).forEach(rating => {
            const count = ratings[rating];
            const percentage = total > 0 ? (count / total * 100) : 0;
            
            document.getElementById(`${rating}Star`).textContent = count;
            document.getElementById(`${rating}StarBar`).style.width = `${percentage}%`;
        });
    }

    exportFeedback() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'feedback.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['ID', 'Guest Name', 'Rating', 'Comment', 'Date', 'Status', 'Response', 'Response Date'];
        const rows = this.feedback.map(f => [
            f.id,
            f.guestName,
            f.rating,
            f.comment,
            f.date,
            f.status,
            f.response || '',
            f.responseDate || ''
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
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

    getStatusClass(status) {
        const classes = {
            'new': 'bg-blue-100 text-blue-800',
            'responded': 'bg-yellow-100 text-yellow-800',
            'resolved': 'bg-green-100 text-green-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'new': 'New',
            'responded': 'Responded',
            'resolved': 'Resolved'
        };
        return texts[status] || status;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
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
        const sampleFeedback = [
            {
                id: 1,
                guestName: 'Mike Johnson',
                rating: 5,
                comment: 'Excellent service and very clean rooms. Staff was very friendly and helpful.',
                date: '2024-01-15',
                status: 'responded',
                response: 'Thank you for your wonderful feedback! We\'re glad you enjoyed your stay.',
                responseDate: '2024-01-16'
            },
            {
                id: 2,
                guestName: 'Sarah Wilson',
                rating: 4,
                comment: 'Great location and comfortable rooms. Would recommend to others.',
                date: '2024-01-16',
                status: 'new',
                response: null,
                responseDate: null
            },
            {
                id: 3,
                guestName: 'David Brown',
                rating: 3,
                comment: 'Room was okay but the WiFi was slow. Breakfast could be better.',
                date: '2024-01-17',
                status: 'new',
                response: null,
                responseDate: null
            },
            {
                id: 4,
                guestName: 'Emily Davis',
                rating: 5,
                comment: 'Amazing experience! The staff went above and beyond to make our stay perfect.',
                date: '2024-01-18',
                status: 'resolved',
                response: 'We\'re thrilled you had such a great experience! Thank you for choosing us.',
                responseDate: '2024-01-19'
            },
            {
                id: 5,
                guestName: 'Mike Brown',
                rating: 2,
                comment: 'Disappointed with the room cleanliness. Bathroom needs better maintenance.',
                date: '2024-01-19',
                status: 'new',
                response: null,
                responseDate: null
            },
            {
                id: 6,
                guestName: 'Emily Davis',
                rating: 5,
                comment: 'Perfect stay! The room was spotless and the staff was incredibly helpful.',
                date: '2024-01-20',
                status: 'responded',
                response: 'Thank you for your kind words! We strive to provide the best experience.',
                responseDate: '2024-01-21'
            }
        ];

        this.feedback = sampleFeedback;
        this.saveFeedback();
        this.renderFeedback();
        this.updateSummary();
        this.updateRatingDistribution();
        this.showNotification('Sample feedback data generated successfully!', 'success');
    }

    refreshData() {
        this.renderFeedback();
        this.updateSummary();
        this.updateRatingDistribution();
        this.showNotification('Feedback data refreshed successfully!', 'success');
    }
}

// Initialize the feedback manager when the page loads
let feedbackManager;
document.addEventListener('DOMContentLoaded', () => {
    feedbackManager = new FeedbackManager();
}); 