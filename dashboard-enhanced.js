// Dashboard Enhanced Logic - Integration with Service Management System
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        updateDashboardWithServiceData();
        setupBookingFormValidation();
    }, 500);
});

// Update dashboard with real service data
function updateDashboardWithServiceData() {
    const stats = serviceBay.getStatistics();
    const activeServices = serviceBay.getActiveServices();
    const completedServices = serviceBay.getCompletedServices();
    const lowStockParts = serviceBay.getLowStockParts();

    // Update statistics section (if you want to replace with real data)
    console.log('Dashboard Statistics:', {
        totalTechnicians: stats.totalTechnicians,
        activeTechnicians: stats.activeTechnicians,
        activeServices: stats.activeServices,
        completedServices: stats.completedServices,
        lowStockParts: stats.lowStockParts,
        totalPartsCost: stats.totalPartsCost
    });
}

// Setup booking form validation
function setupBookingFormValidation() {
    const carProblemForm = document.getElementById('carProblemForm');
    const carProblemMessage = document.getElementById('carProblemMessage');

    if (carProblemForm) {
        carProblemForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Get form values
            const customerName = document.getElementById('customerNameProblem').value.trim();
            const carType = document.getElementById('carType').value.trim();
            const carLicense = document.getElementById('carLicense').value.trim();
            const carProblem = document.getElementById('carProblem').value.trim();
            const phone = document.getElementById('phoneNumber').value.trim();
            const bookingDate = document.getElementById('bookingDate').value.trim();
            const serviceType = document.getElementById('serviceType').value.trim();
            const assignedTech = document.getElementById('assignedTechnician').value;

            // Reset message
            clearMessage(carProblemMessage);

            // Validation
            if (!validateRequired(customerName)) {
                showError(carProblemMessage, '❌ Customer name is required');
                return;
            }

            if (!validateRequired(carType)) {
                showError(carProblemMessage, '❌ Car type is required');
                return;
            }

            if (!validateRequired(carLicense)) {
                showError(carProblemMessage, '❌ License plate is required');
                return;
            }

            if (!validateRequired(carProblem)) {
                showError(carProblemMessage, '❌ Car problem description is required');
                return;
            }

            if (!validateRequired(phone)) {
                showError(carProblemMessage, '❌ Phone number is required');
                return;
            }

            if (!validatePhone(phone)) {
                showError(carProblemMessage, '❌ Invalid phone number format');
                return;
            }

            if (!bookingDate) {
                showError(carProblemMessage, '❌ Booking date is required');
                return;
            }

            if (!serviceType) {
                showError(carProblemMessage, '❌ Service type is required');
                return;
            }

            // Create booking using service management system
            try {
                const booking = {
                    customerName: customerName,
                    customerPhone: phone,
                    vehicleType: getVehicleTypeFromString(carType),
                    carModel: carType,
                    licensePlate: carLicense,
                    services: [getServiceIdFromName(serviceType)],
                    technicians: assignedTech ? [parseInt(assignedTech)] : [],
                    spareParts: [],
                    estimatedCost: getServiceCost(serviceType),
                    notes: carProblem
                };

                const newBooking = serviceBay.createServiceBooking(booking);

                showSuccess(carProblemMessage, `✅ Booking #${newBooking.id} created successfully!`);
                
                // Clear form
                carProblemForm.reset();

                // Show alert with booking details
                setTimeout(function() {
                    alert(`Booking Confirmed!\n\nReference: #${newBooking.id}\nCustomer: ${customerName}\nPhone: ${phone}\nService: ${serviceType}\nDate: ${bookingDate}\n\nThank you for choosing Oyera Bay Service!`);
                }, 1000);
            } catch (error) {
                showError(carProblemMessage, '❌ Error creating booking: ' + error.message);
            }
        });
    }
}

// Helper function to get vehicle type
function getVehicleTypeFromString(carType) {
    const lowerType = carType.toLowerCase();
    if (lowerType.includes('truck') || lowerType.includes('lorry') || lowerType.includes('bus')) {
        return 'heavy';
    } else if (lowerType.includes('van') || lowerType.includes('pickup')) {
        return 'commercial';
    }
    return 'small';
}

// Helper function to get service ID from name
function getServiceIdFromName(serviceName) {
    const services = serviceBay.getAllServices();
    const service = services.find(s => s.name === serviceName);
    return service ? service.id : 1;
}

// Helper function to get service cost
function getServiceCost(serviceName) {
    const services = serviceBay.getAllServices();
    const service = services.find(s => s.name === serviceName);
    return service ? service.price : 0;
}

// Clear message
function clearMessage(messageElement) {
    messageElement.textContent = '';
    messageElement.className = 'booking-message';
}

// Show error
function showError(messageElement, message) {
    messageElement.textContent = message;
    messageElement.className = 'booking-message show text-danger';
}

// Show success
function showSuccess(messageElement, message) {
    messageElement.textContent = message;
    messageElement.className = 'booking-message show text-success';
}

// Validate required field
function validateRequired(value) {
    return value.trim() !== '';
}

// Validate phone
function validatePhone(phone) {
    return /^[0-9+\-\s()]{10,}$/.test(phone);
}
