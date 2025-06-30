# Hotel Management System

A comprehensive hotel management system built with HTML, CSS, and JavaScript. This system provides complete management of hotel operations including room management, bookings, check-ins, check-outs, billing, and more.

## Features

### 🏨 Room Management
- Add, edit, and delete rooms
- Room status tracking (available, occupied, cleaning)
- Room type categorization (single, double, suite, deluxe)
- Floor and price filtering

### 📅 Booking Management
- Create and manage bookings
- Advanced booking types (standard, group, recurring)
- Service add-ons (breakfast, parking, WiFi, gym, spa, laundry, late checkout)
- Booking status tracking
- Search and filter bookings

### ✅ Check-In System
- Guest check-in processing
- Booking integration
- Guest information collection
- Room assignment
- Receipt generation
- Advanced booking information display

### 🚪 Check-Out System (NEW!)
- Guest check-out processing
- Additional charges management (late checkout, room service, mini bar, damages)
- Final billing calculation
- Payment processing
- Room status updates
- Check-out receipt generation

### 💰 Billing & Invoicing
- Invoice creation and management
- Multiple payment methods
- Payment status tracking
- Export functionality

### 👥 Customer Management
- Customer database
- Customer profiles
- **Check-in History Integration (NEW!)**
  - Real-time check-in history from localStorage
  - Search and filter check-in records
  - Additional charges tracking
  - Automatic customer statistics sync
  - Check-in/check-out status tracking
- Booking history

### 📦 Inventory Management
- Hotel inventory tracking
- Stock management
- Low stock alerts

### ⭐ Feedback System
- Guest feedback collection
- Response management
- Rating system

## File Structure

```
hotel-management-system/
├── index.html          # Main dashboard
├── rooms.html          # Room management
├── bookings.html       # Booking management
├── checkin.html        # Check-in interface
├── checkout.html       # Check-out interface (NEW!)
├── customers.html      # Customer management
├── billing.html        # Billing management
├── inventory.html      # Inventory management
├── feedback.html       # Feedback management
├── *.css              # Styling files
├── *.js               # JavaScript functionality
└── README.md          # This file
```

## Check-Out System Details

### New Features Added:

1. **Guest Search & Selection**
   - Search by guest name, room number, or check-in ID
   - Display current checked-in guests
   - Late check-out detection

2. **Additional Charges Management**
   - Late check-out fees
   - Room service charges
   - Mini bar charges
   - Damage charges
   - Additional notes

3. **Final Billing**
   - Real-time billing calculation
   - Original charges + additional charges
   - Payment method selection
   - Payment status tracking

4. **Check-Out Processing**
   - Update check-in status to 'checked-out'
   - Update room status to 'cleaning'
   - Create final invoice
   - Generate check-out receipt

5. **Data Management**
   - Store check-out records
   - Update room availability
   - Create final invoices
   - Maintain audit trail

## Enhanced Check-In Booking Search (NEW!)

### Features Added:

1. **Smart Booking Search**
   - Search by guest name, booking ID, or room number
   - Handles different field name variations (email/guestEmail, phone/guestPhone)
   - **Enhanced Booking ID Search**: Supports searching with or without # symbol
   - Real-time search with instant results
   - Advanced filtering and statistics

2. **Improved User Experience**
   - Automatic detection when no booking data exists
   - Helpful guidance messages and suggestions
   - One-click sample data generation
   - Clear search functionality
   - **"Show All Bookings" button** for easy access to all available bookings
   - **Automatic display** of all bookings when page loads

3. **Enhanced Search Results**
   - Detailed booking information display
   - Status indicators (Active, Upcoming, Completed)
   - Payment status and booking type badges
   - Quick check-in buttons for eligible bookings
   - Statistics summary (total, available for check-in, already checked in)
   - **Available Booking IDs display** when no results found

4. **Data Consistency**
   - Handles multiple field name formats
   - Automatic sample data generation with consistent structure
   - Cross-system data compatibility
   - Error handling for missing or malformed data
   - **Flexible booking ID matching** (with/without # symbol)

5. **Quick Check-in Integration**
   - Direct check-in from search results
   - Automatic form population from booking data
   - Room assignment validation
   - Status tracking and updates

6. **Debugging Tools**
   - **Debug function** for troubleshooting search issues
   - Console logging for booking search debugging
   - Available booking IDs display for reference

7. **Direct Check-in System (NEW!)**
   - **Express check-in section** for immediate processing
   - **Direct booking ID input** for instant check-in
   - **Enhanced validation** with date and room availability checks
   - **Alternative room assignment** when original room unavailable
   - **Detailed confirmation dialogs** with booking information
   - **Enhanced success modal** with comprehensive details
   - **Error handling** with helpful suggestions

### Usage:

1. Navigate to "Check-In" from the main dashboard
2. If no booking data exists, click "Generate Sample Bookings"
3. **For Direct Check-in (Express)**:
   - Enter booking ID in the "Direct Check-in" section
   - Click "Direct Check-in" or press Enter
   - Confirm the check-in details
   - Complete check-in instantly
4. **For Search-based Check-in**:
   - Use the search fields to find specific bookings:
     - **Guest Name**: Search by full name or partial name
     - **Booking ID**: Search by booking number (with or without # symbol)
     - **Room Number**: Search by room number
   - **Click "Show All"** to see all available bookings
   - View search results with detailed information
   - Click "Select" to populate the check-in form
   - Click "Check-in" for quick check-in processing
   - Use "Clear Search" to reset and show all bookings

### Search Features:

- **Real-time Search**: Results update as you type
- **Multiple Criteria**: Search across guest name, booking ID, and room number simultaneously
- **Status Filtering**: See which bookings are available for check-in
- **Quick Actions**: Select booking or perform quick check-in directly from results
- **Statistics**: View summary of total bookings, available for check-in, and already checked in
- **Flexible ID Search**: Search booking IDs with or without the # symbol
- **Debug Support**: Use `checkinManager.debugBookingSearch('1751241947883')` in console for troubleshooting

### Direct Check-in Features:

- **Express Processing**: Bypass form filling for immediate check-in
- **Smart Validation**: Checks booking dates, room availability, and guest status
- **Alternative Room Assignment**: Automatically suggests alternative rooms if needed
- **Comprehensive Confirmation**: Shows detailed booking information before processing
- **Enhanced Success Feedback**: Detailed success modal with all relevant information
- **Error Recovery**: Helpful error messages with available booking IDs
- **Keyboard Support**: Press Enter to process direct check-in

### Data Integration:

The enhanced search system integrates with:
- Booking management system (`hotelBookings` localStorage)
- Room management system (`hotelRooms` localStorage)
- Check-in records (`checkins` localStorage)
- Customer management system
- Billing and payment systems

## Customer Check-in History System (NEW!)

### Features Added:

1. **Real-time Check-in History**
   - Automatically loads check-in data from localStorage
   - Displays both check-ins and check-outs
   - Shows room numbers, dates, amounts, and status

2. **Advanced Search & Filtering**
   - Search by room number, dates, amounts, or notes
   - Filter by check-in status (checked-in, checked-out, all)
   - Real-time search results

3. **Detailed History Display**
   - Room information and stay duration
   - Check-in and check-out times
   - Total amounts and additional charges
   - Check-out notes and special requests
   - Color-coded status indicators

4. **Automatic Data Synchronization**
   - Syncs customer data with check-in history on load
   - Updates customer statistics (total visits, total spent, last visit)
   - Manual sync button for data refresh
   - Sample data generation for testing

5. **Enhanced Customer Profiles**
   - Real-time visit statistics
   - Spending patterns
   - Stay history with detailed breakdown
   - Additional charges tracking

### Usage:

1. Navigate to "Customers" from the main dashboard
2. Click "Generate Sample Data" to create test data (optional)
3. Click "Sync History" to update customer data with check-in records
4. Click "View Details" on any customer card
5. View comprehensive check-in history in the modal
6. Use search and filter options to find specific records
7. Review detailed information including additional charges and notes

### Data Integration:

The system automatically integrates with:
- Check-in records (`checkins` localStorage)
- Check-out records (`checkouts` localStorage)
- Customer profiles (`hotelCustomers` localStorage)
- Room management system
- Billing system

## Installation & Usage

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. The system uses localStorage for data persistence
4. No server setup required - runs entirely in the browser

## Data Export/Import

The system includes data export and import functionality:
- Export all data as JSON file
- Import data from previously exported files
- Reset all data if needed

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Local Storage Keys

The system uses the following localStorage keys:
- `hotelRooms` - Room data
- `bookings` - Booking data
- `checkins` - Check-in records
- `checkouts` - Check-out records (NEW!)
- `hotelCustomers` - Customer data
- `hotelInvoices` - Invoice data
- `hotelInventory` - Inventory data
- `hotelFeedback` - Feedback data

## Future Enhancements

- User authentication and roles
- Server-side data storage
- Email notifications
- Mobile app
- Advanced reporting
- Integration with payment gateways
- Housekeeping management
- Maintenance tracking

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## License

This project is open source and available under the MIT License.

## Check-in and Check-out System

### Check-in Management
- **Guest Registration**: Complete guest information capture including personal details, ID verification, and payment method
- **Room Selection**: Visual room selection with real-time availability status
- **Booking Integration**: Automatic check-in from existing bookings with all booking details preserved
- **Receipt Generation**: Professional check-in receipts with room details and payment information
- **Status Tracking**: Real-time status updates for rooms and bookings

### Check-out Management
- **Guest Search**: Multiple search methods (name, room number, check-in ID) to locate guests
- **Billing Integration**: Automatic loading of original charges with additional fee calculation
- **Additional Charges**: Support for late check-out fees, room service, mini bar, and damage charges
- **Payment Processing**: Multiple payment methods with status tracking
- **Room Status Update**: Automatic room status change to 'cleaning' after check-out
- **Receipt Generation**: Detailed final invoices with all charges breakdown

### Enhanced Data Integration
The system now provides comprehensive integration between check-in and check-out data:

#### Check-in Records Enhanced with Check-out Data
When a guest checks out, the original check-in record is automatically updated with:
- **Check-out Timestamp**: Actual check-out date and time
- **Final Amount**: Total amount including all additional charges
- **Additional Charges Breakdown**: Detailed breakdown of late check-out, room service, mini bar, and damage charges
- **Payment Information**: Check-out payment method and status
- **Check-out Notes**: Staff notes and observations
- **Check-out Summary**: Complete summary including stay duration, base rate, and final total
- **Cross-Reference**: Link to the separate checkout record

#### Checkout Records with Check-in References
Each checkout record includes:
- **Check-in Reference**: Direct link to the original check-in record
- **Complete Check-in Data**: Full check-in record for comprehensive reporting
- **Processing Metadata**: System processing information and timestamps
- **Summary Data**: Consolidated information for reporting and analytics

#### Customer Management Integration
Customer profiles now display:
- **Integrated Check-in History**: All check-in records with complete check-out information
- **Enhanced History Display**: Detailed view showing base charges, additional fees, payment methods, and check-out summaries
- **Checkout Details Modal**: Comprehensive view of all checkout information for each customer
- **Real-time Statistics**: Automatic calculation of total visits, spending, and last visit dates

#### Data Flow
1. **Check-in**: Guest information and room assignment stored in check-in records
2. **Check-out**: Original check-in record updated with comprehensive check-out data
3. **Customer Profile**: All integrated data available in customer management system
4. **Reporting**: Complete guest journey from check-in to check-out with all financial details

This integration ensures that all guest information, charges, and check-out details are preserved and easily accessible for customer service, accounting, and reporting purposes.

## Bookings Management

### Core Features
- **Advanced Booking Types**: Standard, advance, group, corporate, VIP, recurring, package deals, and event bookings
- **Customer Integration**: Link bookings to existing customer profiles with automatic data population
- **Room Management**: Real-time room availability and pricing integration
- **Service Management**: Additional services with automatic pricing calculation
- **Payment Tracking**: Multiple payment methods with status tracking
- **Recurring Bookings**: Automated creation of recurring reservations
- **Group Bookings**: Special handling for group reservations with discounts

### Check-in Integration
The bookings system now provides comprehensive integration with check-in data:

#### Enhanced Booking Display
- **Check-in Status Column**: Shows whether a booking has been checked in, checked out, or not yet processed
- **Real-time Status Updates**: Displays check-in times and checkout times directly in the booking table
- **Financial Integration**: Shows original booking amount vs. final amount after check-in/check-out
- **Additional Charges Display**: Highlights any additional charges incurred during the stay
- **Walk-in Guest Indicators**: Special indicators for walk-in guests with orange "W" badges
- **Check-in Method Display**: Shows whether guest checked in from existing booking or as walk-in

#### Check-in Details Modal
Each booking with check-in data includes a "Check-in" button that opens a comprehensive modal showing:
- **Guest Information**: Complete guest details from check-in
- **Timeline**: Check-in and check-out dates and times
- **Financial Summary**: Original amount, final amount, and additional charges breakdown
- **Payment Information**: Check-out payment method and status
- **Check-out Notes**: Staff observations and notes
- **Check-out Summary**: Complete stay summary with duration and charges

#### Advanced Filtering
- **Check-in Status Filter**: Filter bookings by check-in status (checked-in, checked-out, not checked-in)
- **Combined Filtering**: Combine check-in status with other filters for precise booking management
- **Real-time Updates**: Filters update automatically as check-in data changes

#### Statistics Dashboard
Enhanced summary cards showing:
- **Total Bookings**: All bookings in the system
- **Confirmed Bookings**: Bookings with confirmed status
- **Checked In**: Bookings that have been checked in (from check-in data)
- **Checked Out**: Bookings that have been checked out (from check-in data)

#### Data Integration
- **Automatic Matching**: System automatically matches check-in records to bookings using booking ID or guest/room/date matching
- **Cross-Reference**: Each booking can be linked to its corresponding check-in record
- **Status Synchronization**: Booking status updates based on check-in/check-out activities
- **Financial Tracking**: Complete financial journey from booking to final check-out

### Enhanced Check-in to Booking Data Flow
The system now provides comprehensive data flow from check-in to booking records:

#### Check-in Process Enhancement
When a guest checks in, the system now:

**For Existing Bookings:**
- **Comprehensive Booking Updates**: Updates the original booking record with detailed check-in information
- **Guest Information**: Stores complete guest details from check-in process
- **Room Assignment**: Records actual room assignment and pricing
- **Financial Tracking**: Tracks original booking amount vs. actual check-in amount
- **Timeline Recording**: Records actual check-in time and date
- **Metadata Storage**: Stores processing information and check-in method

**For Walk-in Guests:**
- **Automatic Booking Creation**: Creates a new booking record for walk-in guests
- **Complete Integration**: Links the check-in record to the newly created booking
- **Booking Type Classification**: Marks the booking as "walk_in" type
- **Full Data Capture**: Captures all guest and stay information

#### Enhanced Booking Records
Each booking record now includes comprehensive check-in information:

**Check-in Details Section:**
- **Check-in ID**: Unique identifier linking to check-in record
- **Processing Information**: System processing details and timestamps
- **Check-in Method**: Whether from existing booking or walk-in

**Guest Information:**
- **Complete Guest Details**: First name, last name, email, phone, ID information
- **Payment Method**: Method used during check-in
- **Number of Guests**: Actual number of guests checked in

**Room Information:**
- **Room Details**: Room number, type, price, floor
- **Room Status**: Current room status after check-in

**Financial Information:**
- **Original Booking Amount**: Amount from original booking
- **Actual Check-in Amount**: Amount charged during check-in
- **Rate per Night**: Actual nightly rate
- **Amount Differences**: Tracking of any price adjustments

**Check-in Summary:**
- **Stay Duration**: Total nights of stay
- **Base Amount**: Base room charges
- **Additional Services**: Any services added during check-in
- **Special Requests**: Guest special requests and preferences

#### Data Synchronization
- **Real-time Updates**: Booking records update immediately when check-in occurs
- **Bidirectional Linking**: Check-in records reference booking IDs and vice versa
- **Status Propagation**: Check-in status automatically updates booking status
- **Financial Reconciliation**: Tracks any differences between booking and check-in amounts

This integration ensures that hotel staff can easily track the complete guest journey from initial booking through check-in and check-out, with all financial and operational data seamlessly connected. 