const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Team = require('./models/Team');
const Equipment = require('./models/Equipment');
const MaintenanceRequest = require('./models/MaintenanceRequest');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Team.deleteMany({});
    await Equipment.deleteMany({});
    await MaintenanceRequest.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminUser = new User({
      name: 'Mitchell Admin',
      email: 'admin@gearguard.com',
      password: 'Admin123!',
      role: 'admin'
    });

    const managerUser = new User({
      name: 'John Manager',
      email: 'manager@gearguard.com',
      password: 'Manager123!',
      role: 'manager'
    });

    const technicianUser = new User({
      name: 'Aka Foster',
      email: 'technician@gearguard.com',
      password: 'Tech123!',
      role: 'technician'
    });

    const regularUser = new User({
      name: 'Jane User',
      email: 'user@gearguard.com',
      password: 'User123!',
      role: 'user'
    });

    await Promise.all([adminUser.save(), managerUser.save(), technicianUser.save(), regularUser.save()]);
    console.log('Created users');

    // Create teams
    const maintenanceTeam = new Team({
      name: 'Internal Maintenance',
      description: 'Main maintenance team',
      members: [technicianUser._id, managerUser._id]
    });

    const emergencyTeam = new Team({
      name: 'Emergency Team',
      description: 'Emergency response team',
      members: [technicianUser._id]
    });

    await Promise.all([maintenanceTeam.save(), emergencyTeam.save()]);
    console.log('Created teams');

    // Update technician's team
    technicianUser.team = maintenanceTeam._id;
    await technicianUser.save();

    // Create equipment
    const equipment1 = new Equipment({
      name: 'Samsung Monitor 15"',
      code: 'MON-001',
      serialNumber: 'MT/25/2278',
      category: 'Monitors',
      department: 'Admin',
      assignedEmployee: 'Tejas Modi',
      defaultTeam: maintenanceTeam._id,
      status: 'active'
    });

    const equipment2 = new Equipment({
      name: 'Acer Laptop',
      code: 'LAP-001',
      serialNumber: 'MT/122/11112222',
      category: 'Computers',
      department: 'Technician',
      assignedEmployee: 'Marc Demo',
      defaultTeam: maintenanceTeam._id,
      status: 'active'
    });

    const equipment3 = new Equipment({
      name: 'HP Printer',
      code: 'PRT-001',
      serialNumber: 'HP/2024/001',
      category: 'Printers',
      department: 'Office',
      assignedEmployee: 'Sarah Wilson',
      defaultTeam: maintenanceTeam._id,
      status: 'active'
    });

    await Promise.all([equipment1.save(), equipment2.save(), equipment3.save()]);
    console.log('Created equipment');

    // Create maintenance requests
    const request1 = new MaintenanceRequest({
      subject: 'Test activity',
      type: 'corrective',
      equipment: equipment1._id,
      team: maintenanceTeam._id,
      assignedTechnician: technicianUser._id,
      status: 'new',
      description: 'Monitor flickering issue',
      createdBy: regularUser._id
    });

    const request2 = new MaintenanceRequest({
      subject: 'Laptop maintenance',
      type: 'preventive',
      equipment: equipment2._id,
      team: maintenanceTeam._id,
      status: 'in_progress',
      description: 'Regular maintenance check',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy: managerUser._id
    });

    await Promise.all([request1.save(), request2.save()]);
    console.log('Created maintenance requests');

    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@gearguard.com / Admin123!');
    console.log('Manager: manager@gearguard.com / Manager123!');
    console.log('Technician: technician@gearguard.com / Tech123!');
    console.log('User: user@gearguard.com / User123!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();