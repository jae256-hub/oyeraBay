// Form Validation Module
// Centralized validation for all forms in Oyera Bay Service

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone/Telephone validation regex (basic validation for numeric values)
const phoneRegex = /^[0-9+\-\s()]{10,}$/;

// Validate email format
function validateEmail(email) {
    return emailRegex.test(email);
}

// Validate phone number
function validatePhone(phone) {
    return phoneRegex.test(phone);
}

// Validate password strength (at least 6 characters)
function validatePassword(password) {
    return password.length >= 6;
}

// Validate required field
function validateRequired(value) {
    return value.trim() !== '';
}

// Show validation error message
function showError(messageElement, message) {
    messageElement.textContent = message;
    messageElement.className = 'text-danger';
}

// Show success message
function showSuccess(messageElement, message) {
    messageElement.textContent = message;
    messageElement.className = 'text-success';
}

// Clear message
function clearMessage(messageElement) {
    messageElement.textContent = '';
    messageElement.className = '';
}

// Customer Registration Validation
document.addEventListener('DOMContentLoaded', function() {
    const customerForm = document.getElementById('customerForm');
    const customerMessage = document.getElementById('customerMessage');

    if (customerForm) {
        customerForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Get form values
            const email = document.getElementById('customerEmail').value.trim();
            const password = document.getElementById('customerPassword').value.trim();
            const confirmPassword = document.getElementById('customerConfirmPassword').value.trim();
            const agreeCheckbox = document.getElementById('customerAgree').checked;

            // Reset message
            clearMessage(customerMessage);

            // Validation logic
            if (!validateRequired(email)) {
                showError(customerMessage, '❌ Email address is required');
                return;
            }

            if (!validateEmail(email)) {
                showError(customerMessage, '❌ Invalid email format');
                return;
            }

            if (!validateRequired(password)) {
                showError(customerMessage, '❌ Password is required');
                return;
            }

            if (!validatePassword(password)) {
                showError(customerMessage, '❌ Password must be at least 6 characters long');
                return;
            }

            if (password !== confirmPassword) {
                showError(customerMessage, '❌ Passwords do not match');
                return;
            }

            if (!agreeCheckbox) {
                showError(customerMessage, '❌ You must agree to the Terms and Conditions');
                return;
            }

            // Success
            showSuccess(customerMessage, '✅ Customer registered successfully!');
            
            // Clear form
            customerForm.reset();
            
            // Redirect after 2 seconds
            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 2000);
        });
    }

    // Technician Login Validation
    const technicianForm = document.getElementById('technicianForm');
    const technicianMessage = document.getElementById('technicianMessage');

    if (technicianForm) {
        technicianForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Get form values
            const technicianName = document.getElementById('technicianName').value.trim();
            const email = document.getElementById('technicianEmail').value.trim();
            const employeeNumber = document.getElementById('technicianEmployeeNumber').value.trim();
            const password = document.getElementById('technicianPassword').value.trim();
            const agreeCheckbox = document.getElementById('technicianAgree').checked;

            // Reset message
            clearMessage(technicianMessage);

            // Validation logic
            if (!validateRequired(technicianName)) {
                showError(technicianMessage, '❌ Technician name is required');
                return;
            }

            if (!validateEmail(email)) {
                showError(technicianMessage, '❌ Invalid email format');
                return;
            }

            if (!validateRequired(employeeNumber)) {
                showError(technicianMessage, '❌ Employee number is required');
                return;
            }

            if (isNaN(employeeNumber) || employeeNumber === '') {
                showError(technicianMessage, '❌ Employee number must be numeric');
                return;
            }

            if (!validatePassword(password)) {
                showError(technicianMessage, '❌ Password must be at least 6 characters long');
                return;
            }

            if (!agreeCheckbox) {
                showError(technicianMessage, '❌ You must confirm to proceed');
                return;
            }

            // Success
            showSuccess(technicianMessage, '✅ Technician login successful!');
            
            // Clear form
            technicianForm.reset();
            
            // Redirect after 2 seconds
            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 2000);
        });
    }

    // Car Problem/Booking Form Validation
    const carProblemForm = document.getElementById('carProblemForm');
    const carProblemMessage = document.getElementById('carProblemMessage');

    if (carProblemForm) {
        carProblemForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Get form values
            const customerName = document.getElementById('customerNameProblem').value.trim();
            const carType = document.getElementById('carType').value.trim();
            const carProblem = document.getElementById('carProblem').value.trim();
            const phone = document.getElementById('phoneNumber').value.trim();
            const bookingDate = document.getElementById('bookingDate').value.trim();

            // Reset message
            clearMessage(carProblemMessage);

            // Validation logic
            if (!validateRequired(customerName)) {
                showError(carProblemMessage, '❌ Customer name is required');
                return;
            }

            if (!validateRequired(carType)) {
                showError(carProblemMessage, '❌ Car type is required');
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

            if (!validateRequired(bookingDate)) {
                showError(carProblemMessage, '❌ Booking date is required');
                return;
            }

            // Success
            showSuccess(carProblemMessage, '✅ Booking created successfully!');
            
            // Clear form
            carProblemForm.reset();
            
            // Redirect after 2 seconds
            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 2000);
        });
    }
});
