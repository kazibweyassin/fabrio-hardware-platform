const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const constructionPPEProducts = [
  // Safety & PPE
  { name: "Professional Safety Helmet", category: "Safety & PPE", sku: "HELM-001", retailPrice: 1200, wholesalePrice: 800, quantity: 500, supplier: "SafeGuard Industries" },
  { name: "High-Visibility Safety Vest", category: "Safety & PPE", sku: "VEST-001", retailPrice: 2100, wholesalePrice: 1400, quantity: 800, supplier: "Protection Plus" },
  { name: "Safety Goggles - Clear Lens", category: "Safety & PPE", sku: "GOGG-001", retailPrice: 800, wholesalePrice: 500, quantity: 1200, supplier: "Vision Guard" },
  { name: "Dust Respirator Mask (Box/50)", category: "Safety & PPE", sku: "RESP-001", retailPrice: 3500, wholesalePrice: 2200, quantity: 300, supplier: "BreathEasy" },
  { name: "Safety Harness - Full Body", category: "Safety & PPE", sku: "HARN-001", retailPrice: 4800, wholesalePrice: 3200, quantity: 200, supplier: "HeightSafe" },
  { name: "Reflective Safety Tape Roll", category: "Safety & PPE", sku: "TAPE-001", retailPrice: 900, wholesalePrice: 600, quantity: 1000, supplier: "BrightMark" },
  { name: "First Aid Kit - Industrial", category: "Safety & PPE", sku: "FAK-001", retailPrice: 6200, wholesalePrice: 4000, quantity: 150, supplier: "MedAlert" },
  { name: "Safety Whistles (Pack/10)", category: "Safety & PPE", sku: "WHIS-001", retailPrice: 1500, wholesalePrice: 900, quantity: 600, supplier: "AlertGear" },

  // Hand Tools
  { name: "Claw Hammer - 16oz", category: "Hand Tools", sku: "HAMM-001", retailPrice: 2200, wholesalePrice: 1400, quantity: 400, supplier: "BuildRight" },
  { name: "Combination Wrench Set (12pc)", category: "Hand Tools", sku: "WREN-001", retailPrice: 5600, wholesalePrice: 3600, quantity: 250, supplier: "ToolMaster" },
  { name: "Screwdriver Set (20pc)", category: "Hand Tools", sku: "SCREW-001", retailPrice: 3200, wholesalePrice: 2000, quantity: 350, supplier: "DriveTools" },
  { name: "Tape Measure - 25m", category: "Hand Tools", sku: "TAPE-002", retailPrice: 1800, wholesalePrice: 1100, quantity: 600, supplier: "MeasureRight" },
  { name: "Spirit Level - 2ft", category: "Hand Tools", sku: "LEVEL-001", retailPrice: 2400, wholesalePrice: 1500, quantity: 300, supplier: "PrecisionTools" },
  { name: "Pry Bar Set (3pc)", category: "Hand Tools", sku: "PRY-001", retailPrice: 3600, wholesalePrice: 2300, quantity: 280, supplier: "LeverForce" },
  { name: "Adjustable Wrench Set (4pc)", category: "Hand Tools", sku: "ADJ-001", retailPrice: 4200, wholesalePrice: 2700, quantity: 320, supplier: "ToolMaster" },
  { name: "Pliers Combination Pack (6pc)", category: "Hand Tools", sku: "PLIE-001", retailPrice: 4800, wholesalePrice: 3000, quantity: 290, supplier: "GripMaster" },

  // Power Tools
  { name: "Cordless Drill - 20V", category: "Power Tools", sku: "DRILL-001", retailPrice: 12500, wholesalePrice: 8000, quantity: 180, supplier: "PowerDrill Co" },
  { name: "Circular Saw - 7.25in", category: "Power Tools", sku: "SAW-001", retailPrice: 8900, wholesalePrice: 5600, quantity: 140, supplier: "CutterMax" },
  { name: "Impact Driver - 18V", category: "Power Tools", sku: "IMPACT-001", retailPrice: 9800, wholesalePrice: 6200, quantity: 160, supplier: "PowerDrill Co" },
  { name: "Angle Grinder - 4.5in", category: "Power Tools", sku: "GRIND-001", retailPrice: 6500, wholesalePrice: 4100, quantity: 200, supplier: "GrindPower" },
  { name: "Jigsaw - Variable Speed", category: "Power Tools", sku: "JIG-001", retailPrice: 7200, wholesalePrice: 4600, quantity: 120, supplier: "CutterMax" },
  { name: "Orbital Sander", category: "Power Tools", sku: "SAND-001", retailPrice: 5900, wholesalePrice: 3700, quantity: 170, supplier: "SmoothFinish" },
  { name: "Reciprocating Saw", category: "Power Tools", sku: "RECIP-001", retailPrice: 6800, wholesalePrice: 4300, quantity: 150, supplier: "CutterMax" },
  { name: "Rotary Hammer - SDS", category: "Power Tools", sku: "HAMMER-001", retailPrice: 14200, wholesalePrice: 9000, quantity: 100, supplier: "PowerDrill Co" },

  // Protective Gear
  { name: "Steel Toe Work Boots", category: "Protective Gear", sku: "BOOT-001", retailPrice: 6800, wholesalePrice: 4400, quantity: 300, supplier: "SafeStep" },
  { name: "Work Gloves - Leather (Pair)", category: "Protective Gear", sku: "GLOVE-001", retailPrice: 1600, wholesalePrice: 1000, quantity: 800, supplier: "HandGuard" },
  { name: "Nitrile Gloves (Box/100)", category: "Protective Gear", sku: "GLOVE-002", retailPrice: 2200, wholesalePrice: 1400, quantity: 600, supplier: "SafeHands" },
  { name: "Knee Pads - Professional", category: "Protective Gear", sku: "KNEE-001", retailPrice: 3200, wholesalePrice: 2000, quantity: 250, supplier: "ComfortGuard" },
  { name: "Elbow Pads with Straps", category: "Protective Gear", sku: "ELBOW-001", retailPrice: 2800, wholesalePrice: 1800, quantity: 280, supplier: "ComfortGuard" },
  { name: "Safety Glasses - UV Protection", category: "Protective Gear", sku: "GLASS-001", retailPrice: 1200, wholesalePrice: 800, quantity: 1000, supplier: "VisionGuard" },
  { name: "Face Shield - Full Coverage", category: "Protective Gear", sku: "FACE-001", retailPrice: 2100, wholesalePrice: 1400, quantity: 400, supplier: "FaceShield Pro" },
  { name: "Ear Protection - Muffs", category: "Protective Gear", sku: "EAR-001", retailPrice: 1800, wholesalePrice: 1100, quantity: 500, supplier: "QuietGuard" },

  // Workwear
  { name: "Heavy Duty Work Shirt", category: "Workwear", sku: "SHIRT-001", retailPrice: 2400, wholesalePrice: 1500, quantity: 400, supplier: "DutyWear" },
  { name: "Work Pants - Cargo Style", category: "Workwear", sku: "PANTS-001", retailPrice: 3600, wholesalePrice: 2300, quantity: 350, supplier: "DutyWear" },
  { name: "Winter Work Jacket", category: "Workwear", sku: "JACKET-001", retailPrice: 7200, wholesalePrice: 4600, quantity: 200, supplier: "WeatherGuard" },
  { name: "Hi-Vis Orange Shirt", category: "Workwear", sku: "HISHIRT-001", retailPrice: 2800, wholesalePrice: 1800, quantity: 500, supplier: "VisibilityFirst" },
  { name: "Thermal Work Socks (3-pack)", category: "Workwear", sku: "SOCK-001", retailPrice: 1900, wholesalePrice: 1200, quantity: 600, supplier: "ComfortWear" },

  // Hard Hats & Helmets
  { name: "Yellow Hard Hat - Standard", category: "Hard Hats", sku: "HAT-001", retailPrice: 1100, wholesalePrice: 700, quantity: 1000, supplier: "SafeGuard" },
  { name: "White Hard Hat - Standard", category: "Hard Hats", sku: "HAT-002", retailPrice: 1100, wholesalePrice: 700, quantity: 800, supplier: "SafeGuard" },
  { name: "Orange Hard Hat - Standard", category: "Hard Hats", sku: "HAT-003", retailPrice: 1100, wholesalePrice: 700, quantity: 600, supplier: "SafeGuard" },
  { name: "Hard Hat with Chin Strap", category: "Hard Hats", sku: "HAT-004", retailPrice: 1600, wholesalePrice: 1000, quantity: 500, supplier: "SecureGuard" },
  { name: "Hard Hat with Headlamp", category: "Hard Hats", sku: "HAT-005", retailPrice: 3200, wholesalePrice: 2000, quantity: 300, supplier: "IlluminatedSafe" },
];

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing products
    await prisma.product.deleteMany({});
    console.log("Cleared existing products");

    // Insert products
    const createdProducts = await Promise.all(
      constructionPPEProducts.map((product) =>
        prisma.product.create({
          data: {
            name: product.name,
            description: `Professional-grade ${product.name.toLowerCase()} for construction and industrial use.`,
            sku: product.sku,
            retailPrice: product.retailPrice,
            wholesalePrice: product.wholesalePrice,
            basePrice: product.wholesalePrice,
            active: true,
          },
        })
      )
    );

    console.log(`Successfully created ${createdProducts.length} products`);
    
    // Show summary
    const categories = [...new Set(constructionPPEProducts.map(p => p.category))];
    console.log("\nProduct Summary:");
    console.log(`Total Products: ${createdProducts.length}`);
    console.log(`Categories: ${categories.join(", ")}`);
    
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
