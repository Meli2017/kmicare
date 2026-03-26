import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin
  const existingAdmin = await prisma.admin.findFirst();
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('kmihomecarcarepassword', 10);
    await prisma.admin.create({
      data: {
        username: 'kmihomecarcareusername',
        passwordHash,
      },
    });
    console.log('Default admin created');
  }

  // Create default availability slots (Monday to Saturday, 8am to 6pm)
  const defaultSlots = [
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }, // Monday
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' }, // Thursday
    { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' }, // Friday
    { dayOfWeek: 6, startTime: '09:00', endTime: '16:00' }, // Saturday
  ];

  for (const slot of defaultSlots) {
    const existing = await prisma.availabilitySlot.findFirst({
      where: {
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
    });

    if (!existing) {
      await prisma.availabilitySlot.create({
        data: {
          ...slot,
          isActive: true,
        },
      });
      console.log(`Created slot for day ${slot.dayOfWeek}`);
    }
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
