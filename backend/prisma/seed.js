const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: "Wireless Noise-Canceling Headphones",
    description:
      "High-fidelity audio with active noise cancellation and 30-hour battery life.",
    price: 199.99,
    stock: 25,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
  },
  {
    name: "Mechanical Gaming Keyboard",
    description:
      "Customizable RGB backlighting with tactile mechanical switches and durable aluminum frame.",
    price: 89.5,
    stock: 40,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
  },
  {
    name: "Ergonomic Office Chair",
    description:
      "Breathable mesh chair with adjustable lumbar support and 3D armrests for all-day comfort.",
    price: 249.0,
    stock: 15,
    category: "Furniture",
    imageUrl:
      "https://images.unsplash.com/photo-1580481077195-c22ae2b30df7?w=600",
  },
  {
    name: "Stainless Steel Water Bottle",
    description:
      "Double-wall vacuum insulated flask that keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 24.99,
    stock: 100,
    category: "Accessories",
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
  },
  {
    name: "Minimalist Leather Wallet",
    description:
      "Slim bifold wallet made from genuine top-grain leather with RFID blocking protection.",
    price: 39.95,
    stock: 50,
    category: "Accessories",
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
  },
  {
    name: "Ultra-Wide 34-Inch Curved Monitor",
    description:
      "144Hz refresh rate, 1ms response time, and stunning WQHD resolution for work and gaming.",
    price: 499.99,
    stock: 10,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600",
  },
];

async function main() {
  console.log("Seeding products into database...");

  // Delete existing products to avoid duplicates when running multiple times
  await prisma.product.deleteMany();

  for (const product of sampleProducts) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`Successfully seeded ${sampleProducts.length} sample products!`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
