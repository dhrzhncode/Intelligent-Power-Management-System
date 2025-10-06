// Device management system
class PowerManagementSystem {
    constructor() {
        this.devices = this.loadDevices();
        this.schedules = this.loadSchedules();
        this.priorityOrder = this.loadPriorityOrder();
        this.gridStatus = 'stable';
        this.totalPowerUsage = 0;
        this.maxPowerLimit = 5000; // 5kW default limit
        this.deviceQueue = []; // Queue for devices to be turned on later
        
        this.init();
    }
    
    init() {
        this.renderDevices();
        this.renderPriorityList();
        this.renderScheduleList();
        this.updatePowerUsage();
        this.setupEventListeners();
        this.checkSchedules();
        this.updateQueueStatus();
        
        setInterval(() => {
            this.checkSchedules();
        }, 60000);
        
        setInterval(() => {
            this.processDeviceQueue();
        }, 30000);
    }
    
    loadDevices() {
        const savedDevices = localStorage.getItem('powerDevices');
        if (savedDevices) {
            return JSON.parse(savedDevices);
        } else {
            return [
                { id: 1, name: 'Refrigerator', watts: 150, priority: 'medium', status: 'on', category: 'appliance' },
                { id: 2, name: 'Washing Machine', watts: 500, priority: 'medium', status: 'off', category: 'appliance' },
                { id: 3, name: 'Grinder', watts: 750, priority: 'high', status: 'off', category: 'appliance' },
                { id: 4, name: 'Mixer', watts: 300, priority: 'high', status: 'off', category: 'appliance' },
                { id: 5, name: 'AC', watts: 1500, priority: 'medium', status: 'off', category: 'appliance' },
                { id: 6, name: 'Living Room Lights', watts: 100, priority: 'high', status: 'on', category: 'comfort' },
                { id: 7, name: 'TV', watts: 120, priority: 'medium', status: 'on', category: 'comfort' },
                { id: 8, name: 'Ceiling Fan', watts: 75, priority: 'high', status: 'on', category: 'comfort' }
            ];
        }
    }
    
    
    loadSchedules() {
        const savedSchedules = localStorage.getItem('powerSchedules');
        return savedSchedules ? JSON.parse(savedSchedules) : [];
    }
    
    
    loadPriorityOrder() {
        const savedOrder = localStorage.getItem('powerPriorityOrder');
        if (savedOrder) {
            return JSON.parse(savedOrder);
        } else {
            return this.devices.map(device => device.id);
        }
    }
    
    
    saveDevices() {
        localStorage.setItem('powerDevices', JSON.stringify(this.devices));
    }
    
    
    saveSchedules() {
        localStorage.setItem('powerSchedules', JSON.stringify(this.schedules));
    }
    
    
    savePriorityOrder() {
        localStorage.setItem('powerPriorityOrder', JSON.stringify(this.priorityOrder));
    }
    
    
    renderDevices() {
        const deviceList = document.getElementById('deviceList');
        deviceList.innerHTML = '';
        
        this.devices.forEach(device => {
            const deviceElement = document.createElement('div');
            deviceElement.className = 'device-item';
            deviceElement.innerHTML = `
                <div class="device-info">
                    <div class="device-name">${device.name}</div>
                    <div class="device-details">
                        ${device.watts}W • ${device.priority} priority • ${device.category}
                    </div>
                </div>
                <div class="device-controls-buttons">
                    <button class="btn-${device.status === 'on' ? 'danger' : 'primary'}"
                            data-id="${device.id}"
                            data-action="toggle">
                        ${device.status === 'on' ? 'Turn Off' : 'Turn On'}
                    </button>
                    <button class="btn-danger" data-id="${device.id}" data-action="delete">Delete</button>
                    <button class="btn-secondary" data-id="${device.id}" data-action="edit">Edit</button>
                </div>
            `;
            deviceList.appendChild(deviceElement);
        });
        
        this.updateScheduleDeviceDropdown();
    }
    
    updateScheduleDeviceDropdown() {
        const scheduleDevice = document.getElementById('scheduleDevice');
        scheduleDevice.innerHTML = '';
        
        this.devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.name;
            scheduleDevice.appendChild(option);
        });
    }
    
    // Render priority list
    renderPriorityList() {
        const priorityList = document.getElementById('priorityList');
        priorityList.innerHTML = '';
        
        // Sort devices based on priority order
        const sortedDevices = [...this.devices].sort((a, b) => {
            return this.priorityOrder.indexOf(a.id) - this.priorityOrder.indexOf(b.id);
        });
        
        sortedDevices.forEach(device => {
            const priorityItem = document.createElement('li');
            priorityItem.className = `priority-item ${device.priority}`;
            priorityItem.draggable = true;
            priorityItem.dataset.id = device.id;
            priorityItem.innerHTML = `
                <span>${device.name}</span>
                <span>${device.watts}W • ${device.priority}</span>
            `;
            priorityList.appendChild(priorityItem);
        });
        
        this.setupDragAndDrop();
    }
    
    // Setup drag and drop for priority list
    setupDragAndDrop() {
        const priorityList = document.getElementById('priorityList');
        let draggedItem = null;
        
        priorityList.querySelectorAll('.priority-item').forEach(item => {
            item.addEventListener('dragstart', function() {
                draggedItem = this;
                setTimeout(() => this.style.display = 'none', 0);
            });
            
            item.addEventListener('dragend', function() {
                setTimeout(() => {
                    this.style.display = 'flex';
                    draggedItem = null;
                }, 0);
            });
            
            item.addEventListener('dragover', function(e) {
                e.preventDefault();
            });
            
            item.addEventListener('dragenter', function(e) {
                e.preventDefault();
                this.style.backgroundColor = '#e9ecef';
            });
            
            item.addEventListener('dragleave', function() {
                this.style.backgroundColor = '';
            });
            
            item.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.backgroundColor = '';
                
                if (draggedItem !== this) {
                    const allItems = Array.from(priorityList.querySelectorAll('.priority-item'));
                    const draggedIndex = allItems.indexOf(draggedItem);
                    const targetIndex = allItems.indexOf(this);
                    
                    if (draggedIndex < targetIndex) {
                        this.parentNode.insertBefore(draggedItem, this.nextSibling);
                    } else {
                        this.parentNode.insertBefore(draggedItem, this);
                    }
                    
                    const newOrder = Array.from(priorityList.querySelectorAll('.priority-item'))
                        .map(item => parseInt(item.dataset.id));
                    this.priorityOrder = newOrder;
                    this.savePriorityOrder();
                    this.managePowerPriorities();
                }
            });
        });
    }
    
    renderScheduleList() {
        const scheduleList = document.getElementById('scheduleList');
        scheduleList.innerHTML = '';
        
        if (this.schedules.length === 0) {
            scheduleList.innerHTML = '<p>No schedules set up yet.</p>';
            return;
        }
        
        this.schedules.forEach((schedule, index) => {
            const device = this.devices.find(d => d.id === schedule.deviceId);
            if (!device) return;
            
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-list-item';
            scheduleItem.innerHTML = `
                <div>
                    <strong>${device.name}</strong> - ${schedule.time} - ${schedule.action === 'on' ? 'Turn On' : 'Turn Off'}
                </div>
                <button class="btn-danger" data-index="${index}" data-action="delete-schedule">Delete</button>
            `;
            scheduleList.appendChild(scheduleItem);
        });
    }
    
    setupEventListeners() {
        document.getElementById('addDeviceBtn').addEventListener('click', () => {
            this.openAddDeviceModal();
        });
        
        document.getElementById('deviceList').addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const deviceId = parseInt(e.target.dataset.id);
                const action = e.target.dataset.action;
                
                if (action === 'toggle') {
                    this.toggleDevice(deviceId);
                } else if (action === 'edit') {
                    this.editDevice(deviceId);
                } else if (action === 'delete') {
                    this.deleteDevice(deviceId);
                }
            }
        });
        
        // Schedule list actions
        document.getElementById('scheduleList').addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.dataset.action === 'delete-schedule') {
                const scheduleIndex = parseInt(e.target.dataset.index);
                this.deleteSchedule(scheduleIndex);
            }
        });
        
        // Add schedule button
        document.getElementById('addScheduleBtn').addEventListener('click', () => {
            this.addSchedule();
        });
        
        // Modal close button
        document.querySelector('.close').addEventListener('click', () => {
            this.closeAddDeviceModal();
        });
        
        // Device form submission
        document.getElementById('deviceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDevice();
        });
        
        // Get AI recommendations
        document.getElementById('getRecommendationsBtn').addEventListener('click', () => {
            this.getAIRecommendations();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('addDeviceModal');
            if (e.target === modal) {
                this.closeAddDeviceModal();
            }
        });
    }
    
    // Open add device modal
    openAddDeviceModal(deviceId = null) {
        const modal = document.getElementById('addDeviceModal');
        const form = document.getElementById('deviceForm');
        
        if (deviceId) {
            // Editing existing device
            const device = this.devices.find(d => d.id === deviceId);
            document.getElementById('deviceName').value = device.name;
            document.getElementById('deviceWatts').value = device.watts;
            document.getElementById('devicePriority').value = device.priority;
            document.getElementById('deviceCategory').value = device.category;
            form.dataset.editingId = deviceId;
        } else {
            // Adding new device
            form.reset();
            delete form.dataset.editingId;
        }
        
        modal.style.display = 'block';
    }
    
    // Close add device modal
    closeAddDeviceModal() {
        document.getElementById('addDeviceModal').style.display = 'none';
    }
    
    // Save device (add or edit)
    saveDevice() {
        const form = document.getElementById('deviceForm');
        const name = document.getElementById('deviceName').value;
        const watts = parseInt(document.getElementById('deviceWatts').value);
        const priority = document.getElementById('devicePriority').value;
        const category = document.getElementById('deviceCategory').value;
        
        if (form.dataset.editingId) {
            // Update existing device
            const deviceId = parseInt(form.dataset.editingId);
            const deviceIndex = this.devices.findIndex(d => d.id === deviceId);
            
            if (deviceIndex !== -1) {
                this.devices[deviceIndex].name = name;
                this.devices[deviceIndex].watts = watts;
                this.devices[deviceIndex].priority = priority;
                this.devices[deviceIndex].category = category;
            }
        } else {
            // Add new device
            const newId = this.devices.length > 0 ? Math.max(...this.devices.map(d => d.id)) + 1 : 1;
            this.devices.push({
                id: newId,
                name,
                watts,
                priority,
                status: 'off',
                category
            });
            
            // Add to priority order
            this.priorityOrder.push(newId);
            this.savePriorityOrder();
        }
        
        this.saveDevices();
        this.renderDevices();
        this.renderPriorityList();
        this.closeAddDeviceModal();
        this.updatePowerUsage();
        this.managePowerPriorities();
    }
    
    // Toggle device on/off
    toggleDevice(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
            const wasOn = device.status === 'on';
            device.status = device.status === 'on' ? 'off' : 'on';
            
            this.saveDevices();
            this.renderDevices();
            this.updatePowerUsage();
            
            // Check if high priority device was turned on
            if (device.status === 'on' && device.priority === 'high' && device.category === 'appliance') {
                this.handleHighPriorityDeviceOn(device);
            }
            
            // Check if high priority device was turned off
            if (wasOn && device.status === 'off' && device.priority === 'high' && device.category === 'appliance') {
                this.handleHighPriorityDeviceOff(device);
            }
            
            this.managePowerPriorities();
        }
    }
    
    handleHighPriorityDeviceOn(highPriorityDevice) {
        const mediumPriorityAppliances = this.devices.filter(d =>
            d.priority === 'medium' &&
            d.category === 'appliance' &&
            d.status === 'on' &&
            d.id !== highPriorityDevice.id
        );
        
        mediumPriorityAppliances.forEach(device => {
            device.status = 'off';
            if (!this.deviceQueue.find(q => q.deviceId === device.id)) {
                this.deviceQueue.push({
                    deviceId: device.id,
                    deviceName: device.name,
                    triggeredBy: highPriorityDevice.id,
                    triggeredByName: highPriorityDevice.name
                });
            }
            this.showNotification(`${device.name} has been turned off because ${highPriorityDevice.name} is running.`);
        });
        
        this.saveDevices();
        this.renderDevices();
        this.updatePowerUsage();
        this.updateQueueStatus();
    }
    
    handleHighPriorityDeviceOff(highPriorityDevice) {
        const otherHighPriorityRunning = this.devices.some(d =>
            d.priority === 'high' &&
            d.category === 'appliance' &&
            d.status === 'on' &&
            d.id !== highPriorityDevice.id
        );
        
        if (!otherHighPriorityRunning) {
            this.processDeviceQueue();
        }
    }
    
    processDeviceQueue() {
        if (this.deviceQueue.length === 0) return;
        
        const devicesToProcess = [...this.deviceQueue];
        
        this.deviceQueue = [];
        
        devicesToProcess.forEach(queueItem => {
            const device = this.devices.find(d => d.id === queueItem.deviceId);
            if (device && device.status === 'off') {
                const potentialUsage = this.totalPowerUsage + device.watts;
                if (potentialUsage <= this.maxPowerLimit * 0.8) {
                    device.status = 'on';
                    this.showNotification(`${device.name} has been turned back on.`);
                } else {
                    this.deviceQueue.push(queueItem);
                }
            }
        });
        
        this.saveDevices();
        this.renderDevices();
        this.updatePowerUsage();
        this.updateQueueStatus();
    }
    
    updateQueueStatus() {
        const queueStatus = document.getElementById('queueStatus');
        
        if (this.deviceQueue.length === 0) {
            queueStatus.innerHTML = 'No devices in queue';
        } else {
            let queueHTML = '<ul>';
            this.deviceQueue.forEach(item => {
                queueHTML += `<li>${item.deviceName} (will turn on after high priority devices are off)</li>`;
            });
            queueHTML += '</ul>';
            queueStatus.innerHTML = queueHTML;
        }
    }
    
    editDevice(deviceId) {
        this.openAddDeviceModal(deviceId);
    }
    
    deleteDevice(deviceId) {
        if (confirm('Are you sure you want to delete this device?')) {
            this.devices = this.devices.filter(d => d.id !== deviceId);
            this.priorityOrder = this.priorityOrder.filter(id => id !== deviceId);
            this.deviceQueue = this.deviceQueue.filter(q => q.deviceId !== deviceId);
            this.saveDevices();
            this.savePriorityOrder();
            this.renderDevices();
            this.renderPriorityList();
            this.updatePowerUsage();
            this.updateQueueStatus();
        }
    }
    
    addSchedule() {
        const deviceId = parseInt(document.getElementById('scheduleDevice').value);
        const time = document.getElementById('scheduleTime').value;
        const action = document.getElementById('scheduleAction').value;
        
        if (!time) {
            alert('Please select a time for the schedule.');
            return;
        }
        
        this.schedules.push({
            deviceId,
            time,
            action
        });
        
        this.saveSchedules();
        this.renderScheduleList();
        
        document.getElementById('scheduleTime').value = '';
    }
    
    deleteSchedule(scheduleIndex) {
        this.schedules.splice(scheduleIndex, 1);
        this.saveSchedules();
        this.renderScheduleList();
    }
    
    checkSchedules() {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        this.schedules.forEach(schedule => {
            if (schedule.time === currentTime) {
                const device = this.devices.find(d => d.id === schedule.deviceId);
                if (device) {
                    const wasOn = device.status === 'on';
                    device.status = schedule.action;
                    this.saveDevices();
                    this.renderDevices();
                    this.updatePowerUsage();
                    
                    // If a high priority device is scheduled to turn on
                    if (schedule.action === 'on' && device.priority === 'high' && device.category === 'appliance') {
                        this.handleHighPriorityDeviceOn(device);
                    }
                    
                    // If a high priority device is scheduled to turn off
                    if (wasOn && schedule.action === 'off' && device.priority === 'high' && device.category === 'appliance') {
                        this.handleHighPriorityDeviceOff(device);
                    }
                    
                    this.managePowerPriorities();
                    
                    this.showNotification(`${device.name} has been turned ${schedule.action === 'on' ? 'on' : 'off'} as scheduled.`);
                }
            }
        });
    }
    
    // Update power usage display
    updatePowerUsage() {
        this.totalPowerUsage = this.devices
            .filter(device => device.status === 'on')
            .reduce((total, device) => total + device.watts, 0);
        
        const usageValue = document.getElementById('usageValue');
        const usageFill = document.getElementById('usageFill');
        
        usageValue.textContent = `${this.totalPowerUsage} W`;
        
        const usagePercentage = (this.totalPowerUsage / this.maxPowerLimit) * 100;
        usageFill.style.width = `${Math.min(usagePercentage, 100)}%`;
        
        // Update grid status based on power usage
        if (usagePercentage > 90) {
            this.setGridStatus('critical');
        } else if (usagePercentage > 70) {
            this.setGridStatus('warning');
        } else {
            this.setGridStatus('stable');
        }
    }
    
    // Set grid status
    setGridStatus(status) {
        this.gridStatus = status;
        const statusDot = document.getElementById('gridStatusDot');
        const statusText = document.getElementById('gridStatusText');
        
        statusDot.className = 'status-dot ' + status;
        statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        
        if (status === 'critical') {
            this.managePowerPriorities();
        }
    }
    
    // Manage power priorities (turn off low priority devices when needed)
    managePowerPriorities() {
        if (this.gridStatus !== 'critical') return;
        
        const sortedDevices = [...this.devices].sort((a, b) => {
            return this.priorityOrder.indexOf(a.id) - this.priorityOrder.indexOf(b.id);
        });
        
        let currentUsage = this.totalPowerUsage;
        
        for (let i = sortedDevices.length - 1; i >= 0; i--) {
            const device = sortedDevices[i];
            
            if (device.category === 'comfort' || device.status === 'off') continue;
            
            if (currentUsage > this.maxPowerLimit * 0.8) {
                device.status = 'off';
                currentUsage -= device.watts;
                this.showNotification(`Automatically turned off ${device.name} to maintain grid stability.`);
            } else {
                break;
            }
        }
        
        this.saveDevices();
        this.renderDevices();
        this.updatePowerUsage();
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3c3e41ff;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);
    }
    
    
    async getAIRecommendations() {
        const button = document.getElementById('getRecommendationsBtn');
        const content = document.getElementById('recommendationContent');
        
        button.textContent = 'Analyzing...';
        button.disabled = true;
        
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const highUsageDevices = this.devices
            .filter(d => d.status === 'on' && d.watts > 200)
            .sort((a, b) => b.watts - a.watts);
        
        const recommendations = [];
        
        if (highUsageDevices.length > 2) {
            recommendations.push({
                type: 'warning',
                message: `You have ${highUsageDevices.length} high-power devices running simultaneously. Consider staggering their usage.`
            });
        }
        
        const lowPriorityOn = this.devices.filter(d =>
            d.status === 'on' &&
            d.priority === 'low' &&
            d.category !== 'comfort'
        );
        
        if (lowPriorityOn.length > 0) {
            recommendations.push({
                type: 'suggestion',
                message: `Turn off low-priority devices like ${lowPriorityOn.map(d => d.name).join(', ')} when not in use to save energy.`
            });
        }
        
        // Check for scheduling opportunities
        const frequentlyUsed = ['Washing Machine', 'Grinder', 'Mixer'];
        const unscheduled = this.devices.filter(d => 
            frequentlyUsed.includes(d.name) && 
            !this.schedules.some(s => s.deviceId === d.id)
        );
        
        if (unscheduled.length > 0) {
            recommendations.push({
                type: 'suggestion',
                message: `Set schedules for ${unscheduled.map(d => d.name).join(', ')} to run during off-peak hours.`
            });
        }
        
        // Display recommendations
        content.innerHTML = '';
        
        if (recommendations.length === 0) {
            content.innerHTML = '<p>Your power usage looks optimal! No recommendations at this time.</p>';
        } else {
            recommendations.forEach(rec => {
                const recElement = document.createElement('div');
                recElement.className = `recommendation ${rec.type}`;
                recElement.style.cssText = `
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 10px;
                    border-left: 4px solid ${rec.type === 'warning' ? '#ff442fff' : '#3498db'};
                    background: #343636ff;
                `;
                recElement.textContent = rec.message;
                content.appendChild(recElement);
            });
        }
        
        button.textContent = 'Get Recommendations';
        button.disabled = false;
    }
}

// Initialize the system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.powerSystem = new PowerManagementSystem();
});