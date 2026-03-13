import bcrypt from "bcryptjs";
import { db, usersTable, categoriesTable, mealsTable, ordersTable, reviewsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(reviewsTable);
  await db.delete(ordersTable);
  await db.delete(mealsTable);
  await db.delete(categoriesTable);
  await db.delete(usersTable);

  // Create users
  const passwordHash = await bcrypt.hash("password123", 10);
  const [admin, kitchen, customer1, customer2] = await db.insert(usersTable).values([
    { name: "Admin User", email: "admin@restaurant.com", passwordHash, role: "admin", phone: "+1234567890", addresses: ["123 Admin St"], isBlocked: false },
    { name: "Kitchen Staff", email: "kitchen@restaurant.com", passwordHash, role: "kitchen", phone: "+1234567891", addresses: [], isBlocked: false },
    { name: "John Customer", email: "john@example.com", passwordHash, role: "customer", phone: "+1234567892", addresses: ["456 Oak Ave", "789 Pine Rd"], isBlocked: false },
    { name: "Jane Doe", email: "jane@example.com", passwordHash, role: "customer", phone: "+1234567893", addresses: ["321 Elm St"], isBlocked: false },
  ]).returning();

  // Create categories
  const [burgers, pizza, sushi, desserts, drinks, pasta] = await db.insert(categoriesTable).values([
    { name: "Burgers", description: "Juicy handcrafted burgers", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { name: "Pizza", description: "Wood-fired artisan pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400" },
    { name: "Sushi", description: "Fresh Japanese cuisine", imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400" },
    { name: "Desserts", description: "Sweet indulgences", imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400" },
    { name: "Drinks", description: "Refreshing beverages", imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400" },
    { name: "Pasta", description: "Classic Italian pasta dishes", imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400" },
  ]).returning();

  // Create meals
  const [classisBurger, bbqBurger, margarita, pepperoni, salmonRoll, spicyTuna, tiramisu, chocolate, cola, lemonade, carbonara, bolognese] = await db.insert(mealsTable).values([
    { name: "Classic Burger", description: "Juicy beef patty with fresh veggies and our special sauce", categoryId: burgers.id, price: "12.99", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", available: true, ingredients: ["Beef patty", "Lettuce", "Tomato", "Cheese", "Special sauce", "Brioche bun"], preparationTime: 15 },
    { name: "BBQ Bacon Burger", description: "Smoky BBQ burger with crispy bacon and caramelized onions", categoryId: burgers.id, price: "15.99", imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400", available: true, ingredients: ["Beef patty", "Bacon", "BBQ sauce", "Caramelized onions", "Cheddar"], preparationTime: 18 },
    { name: "Margherita Pizza", description: "Classic tomato, mozzarella, and fresh basil on wood-fired crust", categoryId: pizza.id, price: "14.99", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", available: true, ingredients: ["Tomato sauce", "Mozzarella", "Fresh basil", "Olive oil"], preparationTime: 20 },
    { name: "Pepperoni Feast", description: "Loaded with premium pepperoni and mozzarella cheese", categoryId: pizza.id, price: "16.99", imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400", available: true, ingredients: ["Pepperoni", "Mozzarella", "Tomato sauce", "Oregano"], preparationTime: 20 },
    { name: "Salmon Roll (8pcs)", description: "Fresh Atlantic salmon with cucumber and avocado", categoryId: sushi.id, price: "18.99", imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400", available: true, ingredients: ["Atlantic salmon", "Sushi rice", "Cucumber", "Avocado", "Nori", "Sesame seeds"], preparationTime: 12 },
    { name: "Spicy Tuna Roll (8pcs)", description: "Spicy tuna with sriracha mayo and cucumber", categoryId: sushi.id, price: "17.99", imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400", available: true, ingredients: ["Yellowfin tuna", "Sushi rice", "Sriracha mayo", "Cucumber", "Nori"], preparationTime: 12 },
    { name: "Tiramisu", description: "Classic Italian dessert with espresso and mascarpone", categoryId: desserts.id, price: "8.99", imageUrl: "https://images.unsplash.com/photo-1517878655670-0cf4d3e2f062?w=400", available: true, ingredients: ["Mascarpone", "Espresso", "Ladyfingers", "Cocoa powder"], preparationTime: 5 },
    { name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center and vanilla ice cream", categoryId: desserts.id, price: "9.99", imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400", available: true, ingredients: ["Dark chocolate", "Butter", "Eggs", "Flour", "Vanilla ice cream"], preparationTime: 15 },
    { name: "Classic Cola", description: "Ice cold Coca-Cola", categoryId: drinks.id, price: "3.99", imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", available: true, ingredients: ["Coca-Cola", "Ice"], preparationTime: 1 },
    { name: "Fresh Lemonade", description: "Freshly squeezed lemonade with mint", categoryId: drinks.id, price: "5.99", imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400", available: true, ingredients: ["Fresh lemons", "Sugar", "Water", "Mint"], preparationTime: 3 },
    { name: "Spaghetti Carbonara", description: "Classic Roman pasta with pancetta, egg, and pecorino romano", categoryId: pasta.id, price: "16.99", imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400", available: true, ingredients: ["Spaghetti", "Pancetta", "Egg", "Pecorino Romano", "Black pepper"], preparationTime: 20 },
    { name: "Bolognese Pappardelle", description: "Slow-cooked meat sauce with wide pappardelle pasta", categoryId: pasta.id, price: "18.99", imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400", available: true, ingredients: ["Ground beef", "Pappardelle", "Tomato", "Carrot", "Onion", "Red wine"], preparationTime: 25 },
  ]).returning();

  // Create some sample orders
  const now = new Date();
  const orders = await db.insert(ordersTable).values([
    {
      userId: customer1.id,
      items: [{ mealId: classisBurger.id, mealName: classisBurger.name, quantity: 2, price: 12.99, imageUrl: classisBurger.imageUrl }],
      totalPrice: "25.98",
      status: "delivered",
      orderType: "delivery",
      deliveryAddress: "456 Oak Ave",
      paymentMethod: "card",
    },
    {
      userId: customer1.id,
      items: [
        { mealId: margarita.id, mealName: margarita.name, quantity: 1, price: 14.99, imageUrl: margarita.imageUrl },
        { mealId: cola.id, mealName: cola.name, quantity: 2, price: 3.99, imageUrl: cola.imageUrl },
      ],
      totalPrice: "22.97",
      status: "preparing",
      orderType: "pickup",
      deliveryAddress: null,
      paymentMethod: "cash",
    },
    {
      userId: customer2.id,
      items: [
        { mealId: salmonRoll.id, mealName: salmonRoll.name, quantity: 1, price: 18.99, imageUrl: salmonRoll.imageUrl },
        { mealId: tiramisu.id, mealName: tiramisu.name, quantity: 1, price: 8.99, imageUrl: tiramisu.imageUrl },
      ],
      totalPrice: "27.98",
      status: "pending",
      orderType: "delivery",
      deliveryAddress: "321 Elm St",
      paymentMethod: "online",
    },
    {
      userId: customer2.id,
      items: [{ mealId: carbonara.id, mealName: carbonara.name, quantity: 1, price: 16.99, imageUrl: carbonara.imageUrl }],
      totalPrice: "16.99",
      status: "ready",
      orderType: "pickup",
      deliveryAddress: null,
      paymentMethod: "card",
    },
  ]).returning();

  // Create reviews
  await db.insert(reviewsTable).values([
    { userId: customer1.id, mealId: classisBurger.id, rating: 5, comment: "Best burger in town! Absolutely delicious." },
    { userId: customer2.id, mealId: classisBurger.id, rating: 4, comment: "Really good, will order again!" },
    { userId: customer1.id, mealId: margarita.id, rating: 5, comment: "Perfect pizza, crispy crust!" },
    { userId: customer2.id, mealId: salmonRoll.id, rating: 5, comment: "Super fresh sushi. Love it!" },
    { userId: customer1.id, mealId: carbonara.id, rating: 4, comment: "Authentic Italian taste." },
  ]);

  console.log("Database seeded successfully!");
  console.log("Demo accounts:");
  console.log("  Admin: admin@restaurant.com / password123");
  console.log("  Kitchen: kitchen@restaurant.com / password123");
  console.log("  Customer: john@example.com / password123");
}
