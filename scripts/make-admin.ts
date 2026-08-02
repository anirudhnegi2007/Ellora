import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const arg = process.argv[2];

  if (!arg) {
    // List all users and their roles
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });

    console.log("\nRegistered Users:");
    if (users.length === 0) {
      console.log("No users found in database yet. Sign up first on http://localhost:3000/register");
    } else {
      users.forEach((u) => {
        console.log(`- ${u.name} (${u.email}) => Role: ${u.role}`);
      });
    }
    console.log("\nUsage to grant Admin role:");
    console.log("  npx tsx scripts/make-admin.ts <user-email>");
    console.log("  npx tsx scripts/make-admin.ts --all\n");
    return;
  }

  if (arg === "--all") {
    const updated = await prisma.user.updateMany({
      data: { role: "ADMIN" },
    });
    console.log(`✅ Successfully upgraded all ${updated.count} user(s) to ADMIN role!`);
  } else {
    const email = arg.trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.error(`❌ User with email '${email}' not found.`);
      console.log("Please check the email spelling or register first.");
      process.exit(1);
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Successfully upgraded user '${updated.name}' (${updated.email}) to ADMIN role!`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
