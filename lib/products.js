export const MOCK_PRODUCTS_BY_MERCHANT = {
  "john-lewis": [
    {
      id: "jl-1",
      merchant: "john-lewis",
      retailer: "John Lewis",
      name: "Silk Pillowcase",
      brand: "John Lewis",
      category: "Bedroom",
      description: "Soft silk pillowcase for an elevated bed setup.",
      price: "£45.00",
      imageUrl: "https://via.placeholder.com/600x750?text=Silk+Pillowcase",
      destinationUrl: "https://www.johnlewis.com/",
    },
    {
      id: "jl-2",
      merchant: "john-lewis",
      retailer: "John Lewis",
      name: "Cashmere Throw",
      brand: "John Lewis",
      category: "Home",
      description: "Warm cashmere throw for sofa or bedroom styling.",
      price: "£120.00",
      imageUrl: "https://via.placeholder.com/600x750?text=Cashmere+Throw",
      destinationUrl: "https://www.johnlewis.com/",
    },
    {
      id: "jl-3",
      merchant: "john-lewis",
      retailer: "John Lewis",
      name: "Ceramic Table Lamp",
      brand: "John Lewis",
      category: "Lighting",
      description: "Simple ceramic lamp for living rooms and bedrooms.",
      price: "£89.00",
      imageUrl: "https://via.placeholder.com/600x750?text=Table+Lamp",
      destinationUrl: "https://www.johnlewis.com/",
    },
  ],
};

export function getProducts({ merchant, query, category }) {
  const all = MOCK_PRODUCTS_BY_MERCHANT[String(merchant || "").trim()] || [];

  return all.filter((product) => {
    const matchesCategory =
      !category ||
      category === "all" ||
      String(product.category).toLowerCase() === String(category).toLowerCase();

    const haystack = [
      product.name,
      product.brand,
      product.category,
      product.description,
      product.retailer,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesQuery =
      !query || haystack.includes(String(query).trim().toLowerCase());

    return matchesCategory && matchesQuery;
  });
}
