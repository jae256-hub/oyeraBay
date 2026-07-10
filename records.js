// Records Management System
let allInspections = [];
let allBookings = [];
let allPayments = [];
let allCompleted = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        loadAllRecords();
        displayInspections();
        displayBookings();
        displayPayments();
        displayCompleted();
        generateReports();
    }, 500);
});

// Load all records from localStorage
function loadAllRecords() {
    allInspections = JSON.parse(localStorage.getItem('oyeraBayInspections')) || [];
    allBookings = JSON.parse(localStorage.getItem('oyeraBayBookings')) || [];
    allPayments = JSON.parse(localStorage.getItem('oyeraBayPayments')) || [];
    allCompleted = JSON.parse(localStorage.getItem('oyeraBayCompleted')) || [];
}

// ============ INSPECTIONS ============
function displayInspections(records = allInspections) {
    const container = document.getElementById('inspectionsContainer');
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <div class="empty-text">No inspection records found</div>
                <p style="color: #999; margin-top: 10px;">Inspections will appear here after they are created</p>
            </div>
        `;
        updateInspectionStats(records);
        return;
    }

    container.innerHTML = records.map(inspection => `
        <div class="record-card">
            <div class="record-header">
                <div>
                    <div class="record-title">🚗 ${inspection.carModel} (${inspection.licensePlate})</div>
                    <span class="status-badge status-completed">Completed</span>
                </div>
                <div style="text-align: right;">
                    <button class="btn-custom btn-primary-custom" style="padding: 8px 12px; font-size: 0.9rem;" onclick="viewInspectionDetails(${inspection.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
            <div class="record-meta">
                <div class="meta-item">
                    <span class="meta-label">👤 Customer:</span>
                    <span>${inspection.customerName}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">📞 Phone:</span>
                    <span>${inspection.customerPhone}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">🚙 Type:</span>
                    <span>${inspection.vehicleType}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">🔧 Tech:</span>
                    <span>${serviceBay.getTechnicianById(inspection.inspectionTechnician).name}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">📅 Date:</span>
                    <span>${inspection.inspectionDate}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">💰 Estimate:</span>
                    <span>UGX ${inspection.totalEstimate.toLocaleString()}</span>
                </div>
            </div>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 12px;">
                <strong>Parts Required (${inspection.requiredParts.length}):</strong>
                <div style="margin-top: 8px;">
                    ${inspection.requiredParts.map(p => `<span style="display: inline-block; background: white; padding: 4px 10px; margin: 3px 3px 3px 0; border-radius: 5px; font-size: 0.9rem;">📦 ${p.name}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    updateInspectionStats(records);
}

function updateInspectionStats(records = allInspections) {
    document.getElementById('totalInspections').textContent = records.length;
    
    const uniqueCustomers = new Set(records.map(r => r.customerName)).size;
    document.getElementById('uniqueCustomers').textContent = uniqueCustomers;
    
    const vehicles = new Set(records.map(r => r.licensePlate)).size;
    document.getElementById('vehiclesInspected').textContent = vehicles;
    
    const totalValue = records.reduce((sum, r) => sum + (r.totalEstimate || 0), 0);
    document.getElementById('totalInspectionValue').textContent = `UGX ${totalValue.toLocaleString()}`;
}

function filterInspections() {
    const search = document.getElementById('inspectionSearch').value.toLowerCase();
    const dateFrom = document.getElementById('inspectionDateFrom').value;
    const dateTo = document.getElementById('inspectionDateTo').value;

    const filtered = allInspections.filter(inspection => {
        const matchSearch = !search || 
            inspection.licensePlate.toLowerCase().includes(search) ||
            inspection.customerName.toLowerCase().includes(search);
        
        const matchDateFrom = !dateFrom || inspection.inspectionDate >= dateFrom;
        const matchDateTo = !dateTo || inspection.inspectionDate <= dateTo;

        return matchSearch && matchDateFrom && matchDateTo;
    });

    displayInspections(filtered);
}

function clearInspectionFilters() {
    document.getElementById('inspectionSearch').value = '';
    document.getElementById('inspectionDateFrom').value = '';
    document.getElementById('inspectionDateTo').value = '';
    displayInspections();
}

function exportInspections() {
    const records = allInspections;
    const csv = [
        ['License Plate', 'Model', 'Customer', 'Phone', 'Type', 'Technician', 'Date', 'Estimate (UGX)', 'Parts Count'].join(','),
        ...records.map(r => [
            r.licensePlate,
            r.carModel,
            r.customerName,
            r.customerPhone,
            r.vehicleType,
            serviceBay.getTechnicianById(r.inspectionTechnician).name,
            r.inspectionDate,
            r.totalEstimate,
            r.requiredParts.length
        ].join(','))
    ].join('\n');

    downloadCSV(csv, 'inspections_' + new Date().getTime() + '.csv');
}

// ============ BOOKINGS ============
function displayBookings(records = allBookings) {
    const container = document.getElementById('bookingsContainer');
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <div class="empty-text">No booking records found</div>
                <p style="color: #999; margin-top: 10px;">Service bookings will appear here</p>
            </div>
        `;
        updateBookingStats(records);
        return;
    }

    container.innerHTML = records.map(booking => `
        <div class="record-card">
            <div class="record-header">
                <div>
                    <div class="record-title">📅 ${booking.customerName}</div>
                    <span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span>
                </div>
                <div style="text-align: right;">
                    <button class="btn-custom btn-primary-custom" style="padding: 8px 12px; font-size: 0.9rem;" onclick="viewBookingDetails(${booking.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
            <div class="record-meta">
                <div class="meta-item">
                    <span class="meta-label">🚗 Vehicle:</span>
                    <span>${booking.licensePlate}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">📞 Phone:</span>
                    <span>${booking.customerPhone}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">🔧 Services:</span>
                    <span>${booking.services ? booking.services.length : 0} service(s)</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">📅 Date:</span>
                    <span>${booking.bookingDate || 'N/A'}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">💰 Cost:</span>
                    <span>UGX ${(booking.totalCost || 0).toLocaleString()}</span>
                </div>
            </div>
        </div>
    `).join('');

    updateBookingStats(records);
}

function updateBookingStats(records = allBookings) {
    document.getElementById('totalBookings').textContent = records.length;
    document.getElementById('pendingBookings').textContent = records.filter(b => b.status === 'pending').length;
    document.getElementById('inProgressBookings').textContent = records.filter(b => b.status === 'in-progress').length;
    document.getElementById('completedBookings').textContent = records.filter(b => b.status === 'completed').length;
}

function filterBookings() {
    const search = document.getElementById('bookingSearch').value.toLowerCase();
    const status = document.getElementById('bookingStatus').value;
    const dateFrom = document.getElementById('bookingDateFrom').value;

    const filtered = allBookings.filter(booking => {
        const matchSearch = !search || 
            (booking.licensePlate && booking.licensePlate.toLowerCase().includes(search)) ||
            (booking.customerName && booking.customerName.toLowerCase().includes(search));
        
        const matchStatus = !status || booking.status === status;
        const matchDate = !dateFrom || booking.bookingDate >= dateFrom;

        return matchSearch && matchStatus && matchDate;
    });

    displayBookings(filtered);
}

function clearBookingFilters() {
    document.getElementById('bookingSearch').value = '';
    document.getElementById('bookingStatus').value = '';
    document.getElementById('bookingDateFrom').value = '';
    displayBookings();
}

function exportBookings() {
    const csv = [
        ['Customer', 'Phone', 'License Plate', 'Services', 'Status', 'Cost (UGX)', 'Booking Date'].join(','),
        ...allBookings.map(b => [
            b.customerName,
            b.customerPhone,
            b.licensePlate || 'N/A',
            b.services ? b.services.length : 0,
            b.status,
            b.totalCost || 0,
            b.bookingDate || 'N/A'
        ].join(','))
    ].join('\n');

    downloadCSV(csv, 'bookings_' + new Date().getTime() + '.csv');
}

// ============ PAYMENTS ============
function displayPayments(records = allPayments) {
    const container = document.getElementById('paymentsContainer');
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💳</div>
                <div class="empty-text">No payment records found</div>
            </div>
        `;
        updatePaymentStats(records);
        return;
    }

    container.innerHTML = records.map(payment => `
        <div class="record-card">
            <div class="record-header">
                <div>
                    <div class="record-title">💰 Payment #${payment.inspectionId}</div>
                    <span class="status-badge status-${payment.status}">${payment.status.toUpperCase()}</span>
                </div>
            </div>
            <div class="record-meta">
                <div class="meta-item">
                    <span class="meta-label">Parts Cost:</span>
                    <span>UGX ${(payment.partsAmount || 0).toLocaleString()}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Labour (Fixed):</span>
                    <span>UGX ${(payment.labourAmount || 0).toLocaleString()}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Total Amount:</span>
                    <span style="font-weight: bold; color: rgb(31, 60, 82);">UGX ${(payment.amount || 0).toLocaleString()}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">📅 Date:</span>
                    <span>${payment.createdAt}</span>
                </div>
            </div>
        </div>
    `).join('');

    updatePaymentStats(records);
}

function updatePaymentStats(records = allPayments) {
    const totalRevenue = records.reduce((sum, p) => sum + (p.amount || 0), 0);
    document.getElementById('totalRevenue').textContent = `UGX ${totalRevenue.toLocaleString()}`;
    
    const paidCount = records.filter(p => p.status === 'paid').length;
    document.getElementById('paidPayments').textContent = paidCount;
    
    const pendingCount = records.filter(p => p.status === 'pending').length;
    document.getElementById('pendingPayments').textContent = pendingCount;
    
    const outstanding = records
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    document.getElementById('outstandingBalance').textContent = `UGX ${outstanding.toLocaleString()}`;
}

function filterPayments() {
    const search = document.getElementById('paymentSearch').value.toLowerCase();
    const status = document.getElementById('paymentStatus').value;
    const dateFrom = document.getElementById('paymentDateFrom').value;

    const filtered = allPayments.filter(payment => {
        const matchSearch = !search || payment.inspectionId.toString().includes(search);
        const matchStatus = !status || payment.status === status;
        const matchDate = !dateFrom || payment.createdAt >= dateFrom;

        return matchSearch && matchStatus && matchDate;
    });

    displayPayments(filtered);
}

function clearPaymentFilters() {
    document.getElementById('paymentSearch').value = '';
    document.getElementById('paymentStatus').value = '';
    document.getElementById('paymentDateFrom').value = '';
    displayPayments();
}

function exportPayments() {
    const csv = [
        ['Inspection ID', 'Parts Cost (UGX)', 'Labour (UGX)', 'Total (UGX)', 'Status', 'Date'].join(','),
        ...allPayments.map(p => [
            p.inspectionId,
            p.partsAmount || 0,
            p.labourAmount || 0,
            p.amount || 0,
            p.status,
            p.createdAt
        ].join(','))
    ].join('\n');

    downloadCSV(csv, 'payments_' + new Date().getTime() + '.csv');
}

// ============ COMPLETED SERVICES ============
function displayCompleted(records = allCompleted) {
    const container = document.getElementById('completedContainer');
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <div class="empty-text">No completed service records found</div>
            </div>
        `;
        updateCompletedStats(records);
        return;
    }

    container.innerHTML = records.map(service => `
        <div class="record-card">
            <div class="record-header">
                <div>
                    <div class="record-title">✅ ${service.customerName}</div>
                </div>
            </div>
            <div class="record-meta">
                <div class="meta-item">
                    <span class="meta-label">🚗 Vehicle:</span>
                    <span>${service.carModel} (${service.licensePlate})</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">👨‍🔧 Technician:</span>
                    <span>${service.technicianName || 'N/A'}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">🔧 Service:</span>
                    <span>${service.serviceName || 'N/A'}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">📅 Completed:</span>
                    <span>${service.completionDate}</span>
                </div>
            </div>
        </div>
    `).join('');

    updateCompletedStats(records);
}

function updateCompletedStats(records = allCompleted) {
    document.getElementById('servicesCompleted').textContent = records.length;
    
    const technicians = new Set(records.map(r => r.technicianName)).size;
    document.getElementById('techniciansUsed').textContent = technicians;
    
    // Calculate average completion time (placeholder - would need real data)
    document.getElementById('avgCompletionTime').textContent = '1.5 hrs';
    document.getElementById('satisfactionRate').textContent = '98%';
}

function filterCompleted() {
    const search = document.getElementById('completedSearch').value.toLowerCase();
    const dateFrom = document.getElementById('completedDateFrom').value;
    const dateTo = document.getElementById('completedDateTo').value;

    const filtered = allCompleted.filter(service => {
        const matchSearch = !search || 
            (service.licensePlate && service.licensePlate.toLowerCase().includes(search)) ||
            (service.technicianName && service.technicianName.toLowerCase().includes(search));
        
        const matchDateFrom = !dateFrom || service.completionDate >= dateFrom;
        const matchDateTo = !dateTo || service.completionDate <= dateTo;

        return matchSearch && matchDateFrom && matchDateTo;
    });

    displayCompleted(filtered);
}

function clearCompletedFilters() {
    document.getElementById('completedSearch').value = '';
    document.getElementById('completedDateFrom').value = '';
    document.getElementById('completedDateTo').value = '';
    displayCompleted();
}

function exportCompleted() {
    const csv = [
        ['Customer', 'Vehicle Model', 'License Plate', 'Service', 'Technician', 'Completion Date'].join(','),
        ...allCompleted.map(s => [
            s.customerName,
            s.carModel,
            s.licensePlate,
            s.serviceName || 'N/A',
            s.technicianName || 'N/A',
            s.completionDate
        ].join(','))
    ].join('\n');

    downloadCSV(csv, 'completed_services_' + new Date().getTime() + '.csv');
}

// ============ REPORTS & ANALYTICS ============
function generateReports() {
    // Monthly Revenue
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const monthlyRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    document.getElementById('monthlyRevenue').textContent = `UGX ${monthlyRevenue.toLocaleString()}`;
    
    // Services this month
    document.getElementById('servicesThisMonth').textContent = allBookings.filter(b => {
        const bookingDate = new Date(b.bookingDate || new Date());
        const now = new Date();
        return bookingDate.getMonth() === now.getMonth();
    }).length;
    
    // New customers
    const uniqueCustomers = new Set(allInspections.map(i => i.customerName)).size;
    document.getElementById('newCustomers').textContent = uniqueCustomers;
    
    // Service breakdown
    displayServiceBreakdown();
}

function displayServiceBreakdown() {
    const breakdown = {};
    allBookings.forEach(booking => {
        if (booking.services) {
            booking.services.forEach(service => {
                const name = service.name || 'Unknown';
                breakdown[name] = (breakdown[name] || 0) + 1;
            });
        }
    });

    const container = document.getElementById('serviceBreakdownContainer');
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

    if (total === 0) {
        container.innerHTML = '<div class="empty-state"><p>No service data available</p></div>';
        return;
    }

    container.innerHTML = Object.entries(breakdown).map(([service, count]) => `
        <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong>${service}</strong>
                <span>${count} (${((count/total)*100).toFixed(1)}%)</span>
            </div>
            <div style="background: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, rgb(31, 60, 82), rgb(41, 80, 102)); height: 100%; width: ${(count/total)*100}%;"></div>
            </div>
        </div>
    `).join('');
}

function generateExpenseReport() {
    const container = document.getElementById('expenseReportContainer');
    const expenses = calculateExpenses();

    if (!expenses || Object.keys(expenses).length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No expense data available</p>';
        return;
    }

    let tableHTML = `<table class="expense-table">
        <thead>
            <tr>
                <th>Category</th>
                <th>Amount (UGX)</th>
                <th>Percentage</th>
            </tr>
        </thead>
        <tbody>`;

    const total = Object.values(expenses).reduce((a, b) => a + b, 0);

    Object.entries(expenses).forEach(([category, amount]) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        tableHTML += `
            <tr>
                <td><strong>${category}</strong></td>
                <td>UGX ${amount.toLocaleString()}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    });

    tableHTML += `
            <tr style="background: #f8f9fa; font-weight: bold; border-top: 2px solid rgb(31, 60, 82);">
                <td>TOTAL</td>
                <td>UGX ${total.toLocaleString()}</td>
                <td>100%</td>
            </tr>
        </tbody>
    </table>`;

    container.innerHTML = tableHTML;
}

function calculateExpenses() {
    const expenses = {
        'Parts & Materials': 0,
        'Labour & Salaries': 0,
        'Utilities': 0,
        'Maintenance': 0
    };

    // Calculate parts cost from completed services
    allCompleted.forEach(service => {
        expenses['Parts & Materials'] += 500000; // Placeholder
    });

    // Labour based on inspections and bookings
    expenses['Labour & Salaries'] = (allInspections.length + allBookings.length) * 50000;

    return expenses;
}

function exportExpenseReport() {
    const expenses = calculateExpenses();
    const total = Object.values(expenses).reduce((a, b) => a + b, 0);

    const csv = [
        ['Category', 'Amount (UGX)', 'Percentage'].join(','),
        ...Object.entries(expenses).map(([cat, amt]) => [
            cat,
            amt,
            ((amt / total) * 100).toFixed(1)
        ].join(','))
    ].join('\n');

    downloadCSV(csv, 'expense_report_' + new Date().getTime() + '.csv');
}

// Print Report Functions
function printDailyReport() {
    const today = new Date().toDateString();
    const w = window.open();
    w.document.write(generateReportHTML('Daily Report for ' + today));
    w.print();
}

function printWeeklyReport() {
    const w = window.open();
    w.document.write(generateReportHTML('Weekly Report'));
    w.print();
}

function printMonthlyReport() {
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const w = window.open();
    w.document.write(generateReportHTML('Monthly Report - ' + month));
    w.print();
}

function printYearlyReport() {
    const year = new Date().getFullYear();
    const w = window.open();
    w.document.write(generateReportHTML('Yearly Report - ' + year));
    w.print();
}

function generateReportHTML(title) {
    const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalServices = allBookings.length;
    const totalInspections = allInspections.length;

    return `
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: rgb(31, 60, 82); }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: rgb(31, 60, 82); color: white; }
                .summary { background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 8px; }
            </style>
        </head>
        <body>
            <h1>🏢 OYERA SERVICE BAY - ${title}</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            
            <div class="summary">
                <h3>Summary</h3>
                <p><strong>Total Revenue:</strong> UGX ${totalRevenue.toLocaleString()}</p>
                <p><strong>Services Completed:</strong> ${totalServices}</p>
                <p><strong>Inspections:</strong> ${totalInspections}</p>
                <p><strong>Unique Customers:</strong> ${new Set(allInspections.map(i => i.customerName)).size}</p>
            </div>

            <h2>Recent Services</h2>
            <table>
                <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Cost</th>
                </tr>
                ${allBookings.slice(0, 10).map(b => `
                    <tr>
                        <td>${b.customerName}</td>
                        <td>${b.services ? b.services[0]?.name : 'N/A'}</td>
                        <td>${b.status}</td>
                        <td>UGX ${(b.totalCost || 0).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </table>
        </body>
        </html>
    `;
}

// Utility Functions
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function viewInspectionDetails(id) {
    const inspection = allInspections.find(i => i.id === id);
    if (inspection) {
        alert(`
INSPECTION DETAILS
==================

Customer: ${inspection.customerName}
Phone: ${inspection.customerPhone}
Vehicle: ${inspection.carModel} (${inspection.licensePlate})
Type: ${inspection.vehicleType}
Mileage: ${inspection.mileage}

Parts Required:
${inspection.requiredParts.map(p => `• ${p.name} - UGX ${p.price.toLocaleString()}`).join('\n')}

Cost Breakdown:
Parts: UGX ${inspection.partsCost.toLocaleString()}
Labour (Fixed): UGX ${inspection.labourCharge.toLocaleString()}
Total: UGX ${inspection.totalEstimate.toLocaleString()}

Inspection Notes:
${inspection.inspectionNotes}

Date: ${inspection.inspectionDate}
        `);
    }
}

function viewBookingDetails(id) {
    const booking = allBookings.find(b => b.id === id);
    if (booking) {
        alert(`
BOOKING DETAILS
===============

Customer: ${booking.customerName}
Status: ${booking.status.toUpperCase()}
Cost: UGX ${(booking.totalCost || 0).toLocaleString()}
Date: ${booking.bookingDate || 'N/A'}
        `);
    }
}
