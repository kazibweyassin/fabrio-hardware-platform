/**
 * Import product catalogue without wiping users/orders.
 * Run: node scripts/seed-catalogue.js
 */
const { PrismaClient } = require("@prisma/client");
const { CATALOGUE_CATEGORIES, getCatalogueProducts } = require("../lib/catalogue");
const { computeProductPrices } = require("../lib/product-pricing");

const prisma = new PrismaClient();

async function main() {
  console.log("Importing product catalogue...");

  const categoriesByName = {};
  for (const category of CATALOGUE_CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { name: category.name } });
    categoriesByName[category.name] =
      existing ||
      (await prisma.category.create({
        data: { name: category.name, description: category.description },
      }));
  }

  const catalogueProducts = getCatalogueProducts();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of catalogueProducts) {
    const category = categoriesByName[item.category];
    if (!category) {
      skipped += 1;
      continue;
    }

    const data = {
      catalogId: item.catalogId,
      name: item.name,
      sku: item.sku,
      categoryId: category.id,
      subcategory: item.subcategory,
      description: `${item.name} — ${item.subcategory} (${item.category}).`,
      active: true,
    };

    const existing = await prisma.product.findFirst({
      where: { OR: [{ sku: item.sku }, { catalogId: item.catalogId }] },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          ...data,
          basePrice: existing.basePrice,
          retailPrice: existing.retailPrice,
          wholesalePrice: existing.wholesalePrice,
          image: existing.image,
        },
      });
      updated += 1;
    } else {
      const prices = computeProductPrices(item);
      await prisma.product.create({
        data: {
          ...data,
          ...prices,
          image: null,
        },
      });
      created += 1;
    }
  }

  console.log(`Catalogue import done: ${created} created, ${updated} updated, ${skipped} skipped.`);
  console.log(`Total in catalogue file: ${catalogueProducts.length}`);
}

main()
  .catch((error) => {
    console.error("Catalogue import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });