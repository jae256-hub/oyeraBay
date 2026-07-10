// Service Booking Logic
let selectedVehicleType = null;
let selectedServices = [];
let selectedTechnicians = [];
let selectedParts = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Wait for service management system to load
    setTimeout(function() {
        populateVehicleTypes();
        populateTechnicians();
        setupEventListeners();
    }, 500);
});

// Populate vehicle type selector
function populateVehicleTypes() {
    const vehicleSelector = document.getElementById('vehicleTypeSelector');
    
    // Sample vehicle types
    const vehicles = [
        { type: 'small', name: 'Small Cars 🚗', description: 'Saloons, hatchbacks' },
        { type: 'commercial', name: 'Commercial 🚐', description: 'Vans, mini-buses' },
        { type: 'heavy', name: 'Heavy Vehicles 🚚', description: 'Trucks, buses' }
    ];

    vehicleSelector.innerHTML = vehicles.map(vehicle => `
        <button type="button" class="vehicle-type-btn" data-type="${vehicle.type}">
            <div class="vehicle-icon">${vehicle.name.split(' ')[1]}</div>
            <div>${vehicle.name.split(' ')[0]}</div>
        </button>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.vehicle-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectVehicleType(this.dataset.type, this);
        });
    });
}

// Select vehicle type
function selectVehicleType(type, element) {
    // Remove active class from all buttons
    document.querySelectorAll('.vehicle-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    element.classList.add('active');
    selectedVehicleType = type;
    selectedServices = [];
    
    // Load services for this vehicle type
    loadServicesForVehicleType(type);
}

// Load services for selected vehicle type
function loadServicesForVehicleType(vehicleType) {
    const services = serviceBay.getServicesByVehicleType(vehicleType);
    displayServices(services);
}

// Display services
function displayServices(services) {
    const container = document.getElementById('servicesContainer');
    
    container.innerHTML = services.map(service => `
        <div class="service-card" data-service-id="${service.id}">
            <input type="checkbox" class="checkbox-service" data-service-id="${service.id}">
            <div class="service-icon">${service.icon}</div>
            <div class="service-name">${service.name}</div>
            <div class="service-description">${service.description}</div>
            <div class="service-duration"><i class="fas fa-clock"></i> ${service.duration}</div>
            <div class="service-category">${service.category}</div>
            <div class="service-price">UGX ${service.price.toLocaleString()}</div>
        </div>
    `).join('');

    // Add click listeners to service cards
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                const checkbox = this.querySelector('.checkbox-service');
                checkbox.checked = !checkbox.checked;
            }
            toggleServiceSelection(this, this.dataset.serviceId);
        });

        const checkbox = card.querySelector('.checkbox-service');
        checkbox.addEventListener('change', function() {
            toggleServiceSelection(card, this.dataset.serviceId);
        });
    });
}

// Toggle service selection
function toggleServiceSelection(card, serviceId) {
    const checkbox = card.querySelector('.checkbox-service');
    const service = serviceBay.getServiceById(parseInt(serviceId));
    
    if (checkbox.checked) {
        if (!selectedServices.find(s => s.id === service.id)) {
            selectedServices.push(service);
        }
        card.classList.add('selected');
    } else {
        selectedServices = selectedServices.filter(s => s.id !== service.id);
        card.classList.remove('selected');
    }
    
    updateSelectedSummary();
}

// Update selected services summary
function updateSelectedSummary() {
    const summary = document.getElementById('selectedSummary');
    const list = document.getElementById('selectedList');
    const totalCostEl = document.getElementById('totalCost');

    if (selectedServices.length === 0) {
        summary.classList.remove('show');
        return;
    }

    summary.classList.add('show');
    
    let totalCost = 0;
    list.innerHTML = selectedServices.map(service => {
        totalCost += service.price;
        return `
            <li>
                <span>${service.icon} ${service.name} - UGX ${service.price.toLocaleString()}</span>
                <button type="button" class="remove-service" data-service-id="${service.id}">Remove</button>
            </li>
        `;
    }).join('');

    totalCostEl.textContent = `UGX ${totalCost.toLocaleString()}`;

    // Add remove listeners
    document.querySelectorAll('.remove-service').forEach(btn => {
        btn.addEventListener('click', function() {
            const serviceId = parseInt(this.dataset.serviceId);
            selectedServices = selectedServices.filter(s => s.id !== serviceId);
            document.querySelector(`[data-service-id="${serviceId}"]`).classList.remove('selected');
            document.querySelector(`input[data-service-id="${serviceId}"]`).checked = false;
            updateSelectedSummary();
        });
    });
}

// Populate spare parts
function populateSpareParts() {
    const container = document.getElementById('partsContainer');
    const parts = serviceBay.getAllSpareParts();

    container.innerHTML = parts.map(part => {
        const isLowStock = part.quantity <= part.reorderLevel;
        return `
            <div class="part-card" data-part-id="${part.id}">
                <div class="part-name">${part.icon || '📦'} ${part.name}</div>
                <div class="part-price">UGX ${part.price.toLocaleString()}</div>
                <div class="part-stock ${isLowStock ? 'low' : ''}">
                    Stock: ${part.quantity} ${isLowStock ? '(Low)' : ''}
                </div>
                <input type="number" class="quantity-input" min="0" max="${part.quantity}" value="0" data-part-id="${part.id}">
            </div>
        `;
    }).join('');

    // Add change listeners to quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const partId = parseInt(this.dataset.partId);
            const quantity = parseInt(this.value) || 0;
            
            if (quantity > 0) {
                const part = serviceBay.getSparePartById(partId);
                selectedParts = selectedParts.filter(p => p.id !== partId);
                selectedParts.push({ ...part, quantitySelected: quantity });
                this.parentElement.classList.add('selected');
            } else {
                selectedParts = selectedParts.filter(p => p.id !== partId);
                this.parentElement.classList.remove('selected');
            }
        });
    });
}

// Populate technicians
function populateTechnicians() {
    populateSpareParts();
    
    const container = document.getElementById('technicianSelection');
    const technicians = serviceBay.getAllTechnicians();

    container.innerHTML = technicians.map(tech => `
        <div class="tech-option" data-tech-id="${tech.id}">
            <div style="font-weight: 600; margin-bottom: 5px;">👤 ${tech.name}</div>
            <div style="font-size: 0.8rem; color: inherit;">${tech.specialties[0]}</div>
        </div>
    `).join('');

    document.querySelectorAll('.tech-option').forEach(option => {
        option.addEventListener('click', function() {
            const techId = parseInt(this.dataset.techId);
            
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedTechnicians = selectedTechnicians.filter(t => t !== techId);
            } else {
                this.classList.add('selected');
                selectedTechnicians.push(techId);
            }
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('bookingForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitBooking();
    });

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').setAttribute('min', today);
}

// Submit booking
function submitBooking() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const carModel = document.getElementById('carModel').value.trim();
    const licensePlate = document.getElementById('licensePlate').value.trim();
    const bookingDate = document.getElementById('bookingDate').value;
    const notes = document.getElementById('notes').value.trim();

    const messageEl = document.getElementById('message');

    // Validation
    if (!selectedVehicleType) {
        showMessage('Please select a vehicle type', 'error');
        return;
    }

    if (selectedServices.length === 0) {
        showMessage('Please select at least one service', 'error');
        return;
    }

    if (!customerName) {
        showMessage('Customer name is required', 'error');
        return;
    }

    if (!customerPhone || !/^[0-9+\-\s()]{10,}$/.test(customerPhone)) {
        showMessage('Valid phone number is required', 'error');
        return;
    }

    if (!carModel) {
        showMessage('Car model is required', 'error');
        return;
    }

    if (!licensePlate) {
        showMessage('License plate is required', 'error');
        return;
    }

    if (!bookingDate) {
        showMessage('Preferred service date is required', 'error');
        return;
    }

    // Create booking
    const booking = {
        customerName: customerName,
        customerPhone: customerPhone,
        vehicleType: selectedVehicleType,
        carModel: carModel,
        licensePlate: licensePlate,
        services: selectedServices.map(s => s.id),
        technicians: selectedTechnicians,
        spareParts: selectedParts.map(p => ({ id: p.id, quantity: p.quantitySelected })),
        estimatedCost: selectedServices.reduce((sum, s) => sum + s.price, 0),
        notes: notes,
        bookingDate: bookingDate
    };

    const newBooking = serviceBay.createServiceBooking(booking);

    if (newBooking) {
        showMessage(`✅ Booking Created Successfully! Reference: #${newBooking.id}`, 'success');
        
        // Reset form
        setTimeout(function() {
            document.getElementById('bookingForm').reset();
            selectedServices = [];
            selectedTechnicians = [];
            selectedParts = [];
            document.querySelectorAll('.service-card').forEach(card => card.classList.remove('selected'));
            document.querySelectorAll('.tech-option').forEach(option => option.classList.remove('selected'));
            document.getElementById('selectedSummary').classList.remove('show');
            
            // Redirect to dashboard
            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 2000);
        }, 1500);
    } else {
        showMessage('Error creating booking. Please try again.', 'error');
    }
}

// Show message
function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message show ${type}`;
    
    setTimeout(function() {
        messageEl.classList.remove('show');
    }, 5000);
}
