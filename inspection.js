// Inspection Workflow Logic
let selectedTechnician = null;
let selectedParts = [];
let inspectionData = null;

const LABOUR_CHARGE = 20000;

// Initialize inspection page
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        populateWorkflowSteps();
        populateTechnicians();
        populateParts();
        setupFormValidation();
    }, 500);
});

// Populate workflow steps
function populateWorkflowSteps() {
    const stepsContainer = document.getElementById('workflowSteps');
    
    const steps = [
        { stage: 1, name: 'Inspection', icon: '🚗', desc: 'Senior tech inspects' },
        { stage: 2, name: 'Parts Purchase', icon: '🛒', desc: 'Customer buys parts' },
        { stage: 3, name: 'Service Bay', icon: '🔧', desc: 'Car serviced' },
        { stage: 4, name: 'Labour Fee', icon: '💰', desc: '20,000 UGX charge' },
        { stage: 5, name: 'Completion', icon: '✅', desc: 'Handover to customer' }
    ];

    stepsContainer.innerHTML = steps.map(step => `
        <div class="step" data-stage="${step.stage}">
            <div class="step-icon">${step.icon}</div>
            <div class="step-title">${step.name}</div>
            <div class="step-description">${step.desc}</div>
        </div>
    `).join('');

    // Mark first step as active
    document.querySelector('.step[data-stage="1"]').classList.add('active');
}

// Populate senior technicians
function populateTechnicians() {
    const selector = document.getElementById('technicianSelector');
    const technicians = serviceBay.getAllTechnicians();
    const seniorTechs = technicians.filter(t => t.role === 'senior');

    selector.innerHTML = seniorTechs.map(tech => `
        <div class="tech-card" data-tech-id="${tech.id}">
            <div class="tech-name">👤 ${tech.name}</div>
            <div class="tech-role">Senior Technician</div>
            <div style="font-size: 0.8rem; color: #666;">${tech.employeeId}</div>
        </div>
    `).join('');

    document.querySelectorAll('.tech-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.tech-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedTechnician = parseInt(this.dataset.techId);
        });
    });
}

// Populate spare parts
function populateParts() {
    const partsGrid = document.getElementById('partsGrid');
    const parts = serviceBay.getAllSpareParts();

    partsGrid.innerHTML = parts.map(part => {
        const inStock = part.quantity > 0;
        return `
            <div class="part-card ${inStock ? '' : 'disabled'}" data-part-id="${part.id}" ${!inStock ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                <input type="checkbox" class="part-checkbox" data-part-id="${part.id}" ${!inStock ? 'disabled' : ''}>
                <div class="part-name">${part.icon || '📦'} ${part.name}</div>
                <div class="part-price">UGX ${part.price.toLocaleString()}</div>
                <div class="part-stock">Stock: ${part.quantity} ${!inStock ? '(Out of Stock)' : ''}</div>
            </div>
        `;
    }).join('');

    // Add checkbox listeners
    document.querySelectorAll('.part-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const partId = parseInt(this.dataset.partId);
            const part = serviceBay.getSparePartById(partId);
            
            if (this.checked) {
                if (!selectedParts.find(p => p.id === partId)) {
                    selectedParts.push(part);
                }
                this.parentElement.classList.add('selected');
            } else {
                selectedParts = selectedParts.filter(p => p.id !== partId);
                this.parentElement.classList.remove('selected');
            }
        });

        // Also make the card clickable
        checkbox.parentElement.addEventListener('click', function(e) {
            if (e.target !== checkbox && !checkbox.disabled) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    });
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('inspectionForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        validateAndSubmitInspection();
    });
}

// Validate and submit inspection
function validateAndSubmitInspection() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const vehicleType = document.getElementById('vehicleType').value;
    const carModel = document.getElementById('carModel').value.trim();
    const licensePlate = document.getElementById('licensePlate').value.trim();
    const mileage = document.getElementById('mileage').value;
    const inspectionNotes = document.getElementById('inspectionNotes').value.trim();

    const messageEl = document.getElementById('message');

    // Validation
    if (!customerName) {
        showMessage('Customer name is required', 'error');
        return;
    }

    if (!customerPhone || !/^[0-9+\-\s()]{10,}$/.test(customerPhone)) {
        showMessage('Valid phone number is required', 'error');
        return;
    }

    if (!vehicleType) {
        showMessage('Vehicle type is required', 'error');
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

    if (!selectedTechnician) {
        showMessage('Please select a senior technician for inspection', 'error');
        return;
    }

    if (!inspectionNotes) {
        showMessage('Please provide inspection notes', 'error');
        return;
    }

    if (selectedParts.length === 0) {
        showMessage('Please select at least one part/oil required for service', 'error');
        return;
    }

    // All validations passed
    inspectionData = {
        customerName: customerName,
        customerPhone: customerPhone,
        vehicleType: vehicleType,
        carModel: carModel,
        licensePlate: licensePlate,
        mileage: mileage || 'N/A',
        inspectionNotes: inspectionNotes,
        inspectionTechnician: selectedTechnician,
        requiredParts: selectedParts.map(p => ({ id: p.id, name: p.name, price: p.price })),
        inspectionDate: new Date().toLocaleString()
    };

    // Calculate costs
    calculateAndDisplayEstimate();

    // Show message
    showMessage('✅ Inspection completed successfully!', 'success');

    // Hide form and show estimation
    document.getElementById('inspectionForm').style.display = 'none';
    document.getElementById('estimationSection').style.display = 'block';
}

// Calculate and display estimate
function calculateAndDisplayEstimate() {
    const partsCostEl = document.getElementById('partsCost');
    const totalEstimateEl = document.getElementById('totalEstimate');

    const partsCost = selectedParts.reduce((sum, part) => sum + part.price, 0);
    const totalCost = partsCost + LABOUR_CHARGE;

    partsCostEl.textContent = `UGX ${partsCost.toLocaleString()}`;
    totalEstimateEl.textContent = `UGX ${totalCost.toLocaleString()}`;

    // Store estimate
    inspectionData.partsCost = partsCost;
    inspectionData.labourCharge = LABOUR_CHARGE;
    inspectionData.totalEstimate = totalCost;
}

// Proceed to payment
function proceedToPayment() {
    if (!inspectionData) {
        showMessage('Error: No inspection data found', 'error');
        return;
    }

    // Create inspection record
    const inspections = JSON.parse(localStorage.getItem('oyeraBayInspections')) || [];
    const inspectionRecord = {
        id: Date.now(),
        ...inspectionData,
        status: 'completed',
        createdAt: new Date().toLocaleString()
    };

    inspections.push(inspectionRecord);
    localStorage.setItem('oyeraBayInspections', JSON.stringify(inspections));

    // Show confirmation
    const confirmation = `
INSPECTION COMPLETED ✅

Customer: ${inspectionData.customerName}
Vehicle: ${inspectionData.carModel} (${inspectionData.licensePlate})
Senior Tech: ${serviceBay.getTechnicianById(inspectionData.inspectionTechnician).name}

PARTS REQUIRED:
${inspectionData.requiredParts.map(p => `• ${p.name} - UGX ${p.price.toLocaleString()}`).join('\n')}

COST BREAKDOWN:
Parts Total: UGX ${inspectionData.partsCost.toLocaleString()}
Labour Charge (Fixed): UGX ${inspectionData.labourCharge.toLocaleString()}
-------------------------------------------
TOTAL: UGX ${inspectionData.totalEstimate.toLocaleString()}

Next Steps:
1. Customer purchases all listed parts
2. Car is taken to service bay
3. Service is completed
4. Labour charge of 20,000 UGX is paid
5. Car is handed over to customer

Reference #: ${inspectionRecord.id}
    `;

    alert(confirmation);

    // Store payment pending status
    const payment = {
        inspectionId: inspectionRecord.id,
        status: 'pending',
        amount: inspectionData.totalEstimate,
        partsAmount: inspectionData.partsCost,
        labourAmount: LABOUR_CHARGE,
        createdAt: new Date().toLocaleString()
    };

    const payments = JSON.parse(localStorage.getItem('oyeraBayPayments')) || [];
    payments.push(payment);
    localStorage.setItem('oyeraBayPayments', JSON.stringify(payments));

    // Redirect to dashboard
    setTimeout(function() {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Reset form
function resetForm() {
    document.getElementById('inspectionForm').style.display = 'block';
    document.getElementById('estimationSection').style.display = 'none';
    document.getElementById('inspectionForm').reset();
    
    selectedTechnician = null;
    selectedParts = [];
    inspectionData = null;

    document.querySelectorAll('.tech-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('.part-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('.part-checkbox').forEach(cb => cb.checked = false);

    showMessage('Form reset. Ready for new inspection.', 'success');
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
