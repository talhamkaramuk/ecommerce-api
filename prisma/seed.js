import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PRODUCT_COUNT = 240;
const PRODUCTS_PER_BATCH = 20;

// Deterministic pseudo-random generator.
// Running the seed repeatedly produces the same mock data.
function mulberry32(seed) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const random = mulberry32(20260822);

function randomItem(items) {
    return items[Math.floor(random() * items.length)];
}

function randomInt(min, max) {
    return Math.floor(random() * (max - min + 1)) + min;
}

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

const categoryTree = [
    {
        name: "Electronics",
        children: ["Smartphones", "Laptops", "TVs"],
    },
    {
        name: "Home & Living",
        children: ["Kitchen", "Furniture", "Lighting"],
    },
    {
        name: "Fashion",
        children: ["Men's Clothing", "Women's Clothing", "Footwear"],
    },
    {
        name: "Sports & Outdoors",
        children: ["Fitness", "Outdoor", "Team Sports"],
    },
    {
        name: "Beauty & Personal Care",
        children: ["Skincare", "Haircare", "Fragrances"],
    },
    {
        name: "Books",
        children: ["Fiction", "Non-Fiction", "Technology Books"],
    },
    {
        name: "Toys & Games",
        children: ["Educational Toys", "Action Figures", "Board Games"],
    },
    {
        name: "Office",
        children: ["Stationery", "Desks & Chairs", "Storage"],
    },
];

const productTypes = {
    Smartphones: ["Smartphone", "5G Phone", "Android Phone", "Compact Phone"],

    Laptops: ["Ultrabook", "Gaming Laptop", "Notebook", "Work Laptop"],

    TVs: ["OLED", "QD LED", "Smart TV", "Soundbar"],

    Kitchen: ["Cookware Set", "Coffee Maker", "Blender", "Electric Kettle"],

    Furniture: ["Side Table", "Bookshelf", "Lounge Chair", "Coffee Table"],

    Lighting: ["Desk Lamp", "Floor Lamp", "Pendant Light", "LED Light"],

    "Men's Clothing": ["T-Shirt", "Oxford Shirt", "Hoodie", "Jacket"],

    "Women's Clothing": ["Blouse", "Cardigan", "Dress", "Sweater"],

    Footwear: ["Sneakers", "Running Shoes", "Loafers", "Boots"],

    Fitness: ["Dumbbell Set", "Yoga Mat", "Resistance Bands", "Kettlebell"],

    Outdoor: ["Camping Chair", "Hiking Backpack", "Sleeping Bag", "Water Bottle"],

    "Team Sports": [
        "Training Ball",
        "Sports Jersey",
        "Goalkeeper Gloves",
        "Training Cones",
    ],

    Skincare: ["Face Cleanser", "Moisturizer", "Face Serum", "Sunscreen"],

    Haircare: ["Shampoo", "Conditioner", "Hair Mask", "Styling Cream"],

    Fragrances: ["Eau de Parfum", "Eau de Toilette", "Body Mist", "Cologne"],

    Fiction: [
        "Mystery Novel",
        "Fantasy Novel",
        "Science Fiction Novel",
        "Thriller Novel",
    ],

    "Non-Fiction": ["Biography", "Business Book", "History Book", "Science Book"],

    "Technology Books": [
        "JavaScript Book",
        "TypeScript Book",
        "Database Book",
        "System Design Book",
    ],

    "Educational Toys": [
        "Building Set",
        "Science Kit",
        "Learning Cards",
        "Puzzle Set",
    ],

    "Action Figures": [
        "Explorer Figure",
        "Robot Figure",
        "Hero Figure",
        "Dinosaur Figure",
    ],

    "Board Games": ["Strategy Game", "Family Game", "Card Game", "Party Game"],

    Stationery: ["Notebook", "Pen Set", "Desk Planner", "Marker Set"],

    "Desks & Chairs": [
        "Office Chair",
        "Standing Desk",
        "Writing Desk",
        "Desk Stool",
    ],

    Storage: [
        "Document Box",
        "Drawer Organizer",
        "Storage Cabinet",
        "Desk Organizer",
    ],
};

const brands = [
    "Apex",
    "Nova",
    "Orbit",
    "Summit",
    "Vertex",
    "Nimbus",
    "Lumen",
    "Terra",
    "Pulse",
    "Atlas",
    "Echo",
    "Vivid",
];

const descriptors = [
    "Essential",
    "Prime",
    "Studio",
    "Pro",
    "Classic",
    "Core",
    "Elite",
    "Urban",
    "Active",
    "Plus",
    "Select",
    "Modern",
];

const colors = [
    "Black",
    "White",
    "Blue",
    "Green",
    "Gray",
    "Beige",
    "Navy",
    "Red",
];

function buildDescription(name, categoryName) {
    return `${name} is a mock ${categoryName.toLowerCase()} product created for local development, API testing, pagination, filtering, searching, and sorting.`;
}

async function clearCatalog() {
    /*
     * Delete child records first.
     *
     * Your Prisma relations already use onDelete: Cascade,
     * but deleting explicitly makes the seed more robust if
     * your actual database migration is older than the schema.
     */
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
}

async function seedCategories() {
    const leafCategories = [];

    for (const parentData of categoryTree) {
        const parent = await prisma.category.create({
            data: {
                name: parentData.name,
                slug: slugify(parentData.name),
            },
        });

        for (const childName of parentData.children) {
            const child = await prisma.category.create({
                data: {
                    name: childName,
                    slug: slugify(childName),
                    parentCategoryId: parent.id,
                },
            });

            leafCategories.push(child);
        }
    }

    return leafCategories;
}

function createProductInput(index, category) {
    const type = randomItem(productTypes[category.name]);
    const brand = randomItem(brands);
    const descriptor = randomItem(descriptors);

    /*
     * Guarantees unique names/slugs even if the random
     * brand/type combination appears more than once.
     */
    const serial = String(index + 1).padStart(3, "0");

    const name = `${brand} ${descriptor} ${type} ${serial}`;
    const slug = slugify(name);

    const basePrice = randomInt(12, 900);
    const secondVariantPrice = basePrice + randomInt(5, 80);

    return {
        name,
        slug,

        description: buildDescription(name, category.name),

        // Around 8% of generated products are inactive.
        isActive: random() > 0.08,

        categoryId: category.id,

        images: {
            create: [
                {
                    url: `https://picsum.photos/seed/${slug}-1/900/900`,
                    alt: `${name} front view`,
                    position: 0,
                },
                {
                    url: `https://picsum.photos/seed/${slug}-2/900/900`,
                    alt: `${name} alternate view`,
                    position: 1,
                },
            ],
        },

        variants: {
            create: [
                {
                    name: `${randomItem(colors)} / Standard`,

                    sku: `SKU-${serial}-STD`,

                    price: basePrice.toFixed(2),

                    comparePrice:
                        random() > 0.35
                            ? (basePrice + randomInt(10, 100)).toFixed(2)
                            : null,

                    stock: randomInt(0, 150),
                },

                {
                    name: `${randomItem(colors)} / Premium`,

                    sku: `SKU-${serial}-PRM`,

                    price: secondVariantPrice.toFixed(2),

                    comparePrice:
                        random() > 0.35
                            ? (secondVariantPrice + randomInt(10, 120)).toFixed(2)
                            : null,

                    stock: randomInt(0, 100),
                },
            ],
        },
    };
}

async function seedProducts(categories) {
    /*
     * Insert products in small concurrent batches instead of
     * creating 240 database operations simultaneously.
     */
    for (let start = 0; start < PRODUCT_COUNT; start += PRODUCTS_PER_BATCH) {
        const end = Math.min(start + PRODUCTS_PER_BATCH, PRODUCT_COUNT);

        const jobs = [];

        for (let index = start; index < end; index++) {
            /*
             * Rotate across leaf categories so products are
             * reasonably evenly distributed.
             */
            const category = categories[index % categories.length];

            const data = createProductInput(index, category);

            jobs.push(
                prisma.product.create({
                    data,
                }),
            );
        }

        await Promise.all(jobs);

        console.log(`Seeded products ${start + 1}-${end}`);
    }
}

async function printSummary() {
    const [categories, products, images, variants] = await Promise.all([
        prisma.category.count(),
        prisma.product.count(),
        prisma.productImage.count(),
        prisma.productVariant.count(),
    ]);

    console.log("\nSeed complete:");
    console.log(`Categories: ${categories}`);
    console.log(`Products:   ${products}`);
    console.log(`Images:     ${images}`);
    console.log(`Variants:   ${variants}`);

    console.log(`Total:      ${categories + products + images + variants}`);
}

async function main() {
    console.log("Clearing existing catalog data...");

    await clearCatalog();

    console.log("Creating categories...");

    const leafCategories = await seedCategories();

    console.log(`Creating ${PRODUCT_COUNT} products...`);

    await seedProducts(leafCategories);

    await printSummary();
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);

        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
