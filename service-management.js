// Service Management System
// This handles all service operations, bookings, and inventory management

class ServiceBayManagementSystem {
    constructor() {
        this.services = [];
        this.spareParts = [];
        this.technicians = [];
        this.vehicles = [];
        this.activeServices = [];
        this.completedServices = [];
        this.loadData();
    }

    // Load data from JSON file
    async loadData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            this.services = data.services;
            this.spareParts = data.spareParts;
            this.technicians = data.technicians;
            this.vehicles = data.vehicles;
            this.initializeLocalStorage();
        } catch (error) {
            console.error('Error loading data:', error);
            // Use fallback data if file loading fails
            this.useFallbackData();
        }
    }

    // Initialize local storage with initial data
    initializeLocalStorage() {
        if (!localStorage.getItem('oyeraBayServices')) {
            localStorage.setItem('oyeraBayServices', JSON.stringify(this.services));
        }
        if (!localStorage.getItem('oyeraBaySpareParts')) {
            localStorage.setItem('oyeraBaySpareParts', JSON.stringify(this.spareParts));
        }
        if (!localStorage.getItem('oyeraBayTechnicians')) {
            localStorage.setItem('oyeraBayTechnicians', JSON.stringify(this.technicians));
        }
        if (!localStorage.getItem('oyeraBayActiveServices')) {
            localStorage.setItem('oyeraBayActiveServices', JSON.stringify([]));
        }
        if (!localStorage.getItem('oyeraBayCompletedServices')) {
            localStorage.setItem('oyeraBayCompletedServices', JSON.stringify([]));
        }
    }

    // Get all available services
    getAllServices() {
        return JSON.parse(localStorage.getItem('oyeraBayServices')) || this.services;
    }

    // Get services by vehicle type
    getServicesByVehicleType(vehicleType) {
        const services = this.getAllServices();
        return services.filter(service => service.applicableVehicles.includes(vehicleType));
    }

    // Get all spare parts
    getAllSpareParts() {
        return JSON.parse(localStorage.getItem('oyeraBaySpareParts')) || this.spareParts;
    }

    // Get low stock spare parts
    getLowStockParts() {
        const parts = this.getAllSpareParts();
        return parts.filter(part => part.quantity <= part.reorderLevel);
    }

    // Get all technicians
    getAllTechnicians() {
        return JSON.parse(localStorage.getItem('oyeraBayTechnicians')) || this.technicians;
    }

    // Get available technicians for a service
    getAvailableTechniciansForService(serviceName) {
        const technicians = this.getAllTechnicians();
        return technicians.filter(tech => 
            tech.specialties.includes(serviceName) && tech.status === 'available'
        );
    }

    // Create a new service booking
    createServiceBooking(booking) {
        const activeServices = JSON.parse(localStorage.getItem('oyeraBayActiveServices')) || [];
        
        const newBooking = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            vehicleType: booking.vehicleType,
            carModel: booking.carModel,
            licensePlate: booking.licensePlate,
            services: booking.services, // Array of service IDs
            technicians: booking.technicians, // Array of technician IDs
            spareParts: booking.spareParts || [], // Array of part IDs and quantities
            status: 'pending', // pending, in-progress, completed, cancelled
            estimatedCost: booking.estimatedCost,
            actualCost: 0,
            startTime: null,
            endTime: null,
            notes: booking.notes || '',
            createdAt: new Date().toLocaleString()
        };

        activeServices.push(newBooking);
        localStorage.setItem('oyeraBayActiveServices', JSON.stringify(activeServices));
        
        return newBooking;
    }

    // Get active services
    getActiveServices() {
        return JSON.parse(localStorage.getItem('oyeraBayActiveServices')) || [];
    }

    // Get completed services
    getCompletedServices() {
        return JSON.parse(localStorage.getItem('oyeraBayCompletedServices')) || [];
    }

    // Update service status
    updateServiceStatus(serviceId, newStatus) {
        const activeServices = this.getActiveServices();
        const service = activeServices.find(s => s.id === serviceId);
        
        if (service) {
            service.status = newStatus;
            
            if (newStatus === 'in-progress' && !service.startTime) {
                service.startTime = new Date().toLocaleString();
            }
            
            if (newStatus === 'completed' && !service.endTime) {
                service.endTime = new Date().toLocaleString();
                // Move to completed services
                const completedServices = this.getCompletedServices();
                completedServices.push(service);
                localStorage.setItem('oyeraBayCompletedServices', JSON.stringify(completedServices));
                
                // Remove from active services
                const filtered = activeServices.filter(s => s.id !== serviceId);
                localStorage.setItem('oyeraBayActiveServices', JSON.stringify(filtered));
            } else {
                localStorage.setItem('oyeraBayActiveServices', JSON.stringify(activeServices));
            }
            
            return service;
        }
        return null;
    }

    // Update spare part quantity
    updateSparePartQuantity(partId, quantityUsed) {
        const parts = this.getAllSpareParts();
        const part = parts.find(p => p.id === partId);
        
        if (part && part.quantity >= quantityUsed) {
            part.quantity -= quantityUsed;
            localStorage.setItem('oyeraBaySpareParts', JSON.stringify(parts));
            return true;
        }
        return false;
    }

    // Get service statistics
    getStatistics() {
        const activeServices = this.getActiveServices();
        const completedServices = this.getCompletedServices();
        const technicians = this.getAllTechnicians();
        const parts = this.getAllSpareParts();

        return {
            totalTechnicians: technicians.length,
            activeTechnicians: technicians.filter(t => t.status === 'available').length,
            activeServices: activeServices.length,
            completedServices: completedServices.length,
            lowStockParts: this.getLowStockParts().length,
            totalPartsCost: parts.reduce((sum, p) => sum + (p.price * p.quantity), 0)
        };
    }

    // Calculate estimated cost for services
    calculateEstimatedCost(serviceIds) {
        const services = this.getAllServices();
        return serviceIds.reduce((total, id) => {
            const service = services.find(s => s.id === id);
            return total + (service ? service.price : 0);
        }, 0);
    }

    // Fallback data in case JSON loading fails
    useFallbackData() {
        this.services = [
            {
                id: 1,
                name: "Engine Oil & Filter Change",
                category: "Maintenance",
                price: 45000,
                applicableVehicles: ["small", "commercial", "heavy"],
                icon: "⚙️"
            },
            {
                id: 2,
                name: "Brake Pads Change",
                category: "Safety",
                price: 65000,
                applicableVehicles: ["small", "commercial", "heavy"],
                icon: "🛑"
            }
        ];
        this.initializeLocalStorage();
    }

    // Get service by ID
    getServiceById(id) {
        const services = this.getAllServices();
        return services.find(s => s.id === id);
    }

    // Get technician by ID
    getTechnicianById(id) {
        const technicians = this.getAllTechnicians();
        return technicians.find(t => t.id === id);
    }

    // Get spare part by ID
    getSparePartById(id) {
        const parts = this.getAllSpareParts();
        return parts.find(p => p.id === id);
    }

    // Search services
    searchServices(query) {
        const services = this.getAllServices();
        return services.filter(service => 
            service.name.toLowerCase().includes(query.toLowerCase()) ||
            service.category.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Get services by category
    getServicesByCategory(category) {
        const services = this.getAllServices();
        return services.filter(service => service.category === category);
    }
}

// Initialize the system globally
const serviceBay = new ServiceBayManagementSystem();
