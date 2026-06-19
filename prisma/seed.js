const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("better-auth/crypto");
const { CATALOGUE_CATEGORIES, getCatalogueProducts } = require("../lib/catalogue");

const prisma = new PrismaClient();

async function createUserWithPassword({ email, name, password, role, businessName, phone, taxId }) {
  const user = await prisma.user.create({
    data: {
      email,
      name,
      emailVerified: true,
      role,
    },
  });

  const hashedPassword = await hashPassword(password);

  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  if (role === "customer") {
    await prisma.customer.create({
      data: {
        userId: user.id,
        businessName,
        phone,
        taxId,
        creditLimit: 50_000_000,
      },
    });
  }

  return user;
}

async function seedCatalogueProducts(categoriesByName) {
  const catalogueProducts = getCatalogueProducts();
  let created = 0;

  for (const item of catalogueProducts) {
    const category = categoriesByName[item.category];
    if (!category) {
      console.warn(`Skipping ${item.catalogId}: unknown category "${item.category}"`);
      continue;
    }

    await prisma.product.create({
      data: {
        catalogId: item.catalogId,
        name: item.name,
        sku: item.sku,
        categoryId: category.id,
        subcategory: item.subcategory,
        description: `${item.name} — ${item.subcategory} (${item.category}).`,
        basePrice: 0,
        retailPrice: 0,
        wholesalePrice: null,
        image: null,
        active: true,
      },
    });
    created += 1;
  }

  return created;
}

async function main() {
  console.log("Starting seed...");

  await prisma.wishlist.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  await createUserWithPassword({
    email: "admin@fabrio.com",
    name: "Admin User",
    password: "admin123",
    role: "admin",
  });

  const customerAccounts = [
    ["john@company.com", "John Smith", "customer", "Smith Construction Co", "+1-555-0101", "12-3456789"],
    ["jane@builders.com", "Jane Doe", "customer", "Premium Builders LLC", "+1-555-0102", "98-7654321"],
    ["safety@enterprise.com", "Bob Wilson", "customer", "Enterprise Safety Solutions", "+1-555-0103", "55-6789012"],
  ];

  for (const [email, name, password, business, phone, taxId] of customerAccounts) {
    await createUserWithPassword({ email, name, password, role: "customer", businessName: business, phone, taxId });
  }

  const categoriesByName = {};
  for (const category of CATALOGUE_CATEGORIES) {
    const created = await prisma.category.create({
      data: { name: category.name, description: category.description },
    });
    categoriesByName[category.name] = created;
  }

  const suppliers = [];
  const supplierData = [
    ["SafeTech Industries", "sales@safetech.com", "+1-555-1000", "Mike Johnson", "Net 30", 7, 4.8],
    ["Builder's Supply Corp", "info@builderssupply.com", "+1-555-2000", "Sarah Chen", "Net 45", 10, 4.7],
    ["PPE Direct Manufacturing", "orders@ppedirect.com", "+1-555-3000", "David Martinez", "Net 30", 5, 4.9],
  ];

  for (const [name, email, phone, contact, terms, leadTime, rating] of supplierData) {
    const sup = await prisma.supplier.create({
      data: { name, email, phone, contactPerson: contact, paymentTerms: terms, leadTime, rating },
    });
    suppliers.push(sup);
  }

  const warehouses = [];
  const warehouseData = [
    ["Main Distribution Center", "Los Angeles, CA", "1000 Industrial Way, LA, CA 90001", "+1-555-9001", "Tom Richards"],
    ["Northeast Hub", "New Jersey", "500 Construction Blvd, NJ 07001", "+1-555-9002", "Maria Garcia"],
    ["Central Distribution", "Chicago, IL", "200 Hardware Ave, Chicago, IL 60601", "+1-555-9003", "James Wilson"],
  ];

  for (const [name, location, address, phone, manager] of warehouseData) {
    const wh = await prisma.warehouse.create({ data: { name, location, address, phone, manager } });
    warehouses.push(wh);
  }

  const productCount = await seedCatalogueProducts(categoriesByName);
  console.log(`Seeded ${productCount} catalogue products.`);

  const sampleProducts = await prisma.product.findMany({ take: 8, orderBy: { name: "asc" } });
  for (const product of sampleProducts) {
    for (const warehouse of warehouses) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: 100,
          reorderLevel: 10,
        },
      });
    }
  }

  console.log("Seed completed successfully.");
  console.log("Admin: admin@fabrio.com / admin123");
  console.log("Customer: john@company.com / customer");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });