package com.novacart.product.infrastructure;

import com.novacart.product.domain.Category;
import com.novacart.product.domain.Product;
import java.time.Instant;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class CatalogSeedConfig {
    @Bean @Profile("!test")
    CommandLineRunner seed(CategoryRepository categories, ProductRepository products) {
        return args -> {
            List<Category> categorySeed = List.of(
                new Category("technology", "Technology", "Thoughtful tools for work and life.", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"),
                new Category("audio", "Audio", "Personal sound and room-filling listening.", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"),
                new Category("fashion", "Fashion", "Considered everyday style.", "https://images.unsplash.com/photo-1445205170230-053b83016050"),
                new Category("home", "Home", "Objects that make spaces calmer.", "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6"),
                new Category("appliances", "Appliances", "Useful upgrades for everyday routines.", "https://images.unsplash.com/photo-1556911220-bff31c812dba"),
                new Category("beauty", "Beauty", "Daily care with clear purpose.", "https://images.unsplash.com/photo-1596462502278-27bfdc403348"),
                new Category("sports", "Sports", "Movement, training, and recovery.", "https://images.unsplash.com/photo-1461896836934-ffe607ba8211"),
                new Category("books", "Books", "Ideas worth keeping close.", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"),
                new Category("grocery", "Grocery", "Better staples for the pantry.", "https://images.unsplash.com/photo-1542838132-92c53300491e"),
                new Category("toys", "Toys", "Creative play and discovery.", "https://images.unsplash.com/photo-1594787318286-3d835c1d207f"),
                new Category("accessories", "Accessories", "The finishing pieces.", "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561")
            );
            for (Category category : categorySeed) if (!categories.existsBySlug(category.slug)) categories.save(category);
            List<Seed> catalogue = catalogue();
            Set<String> desired = new HashSet<>(catalogue.stream().map(Seed::slug).toList());
            products.findAll().stream()
                .filter(product -> "novacart-seed".equals(product.sellerId) && !desired.contains(product.slug))
                .forEach(products::delete);
            for (Seed item : catalogue) {
                Product product = products.findBySlug(item.slug()).orElseGet(Product::new);
                if (product.id == null || "novacart-seed".equals(product.sellerId)) {
                    applySeed(product, item);
                    products.save(product);
                }
            }
        };
    }

    private Product sample(Seed item) {
        Product p = new Product();
        applySeed(p, item);
        return p;
    }

    private void applySeed(Product p, Seed item) {
        Instant now = Instant.now();
        p.slug = item.slug(); p.sellerId = "novacart-seed"; p.title = item.title(); p.brand = item.brand();
        p.categorySlug = item.category(); p.priceInPaise = item.price() * 100; p.originalPriceInPaise = item.original() == null ? null : item.original() * 100; p.description = item.description();
        p.images = List.of(item.photo().startsWith("http")
            ? item.photo()
            : "https://images.unsplash.com/" + item.photo() + "?auto=format&fit=crop&w=1200&q=85");
        p.tags = item.tags(); p.badge = item.badge(); p.delivery = "Free delivery in 2 days"; p.rating = item.rating();
        p.reviewCount = 0; p.active = true; p.createdAt = p.createdAt == null ? now : p.createdAt; p.updatedAt = now;
    }

    private List<Seed> catalogue() {
        List<Seed> real = realCatalogue();
        if (!real.isEmpty()) return real;
        List<Seed> base = List.of(
            new Seed("nova-orbit-x1", "Orbit X1 5G Smartphone", "Nova Labs", "technology", 28999L, 34999L, "A fast, refined 5G phone with a vivid edge-to-edge display and all-day battery.", "photo-1511707171634-5f897ff02aa9", List.of("phone", "mobile", "5g"), "Bestseller", 4.6),
            new Seed("nova-book-air-14", "Book Air 14 Performance Laptop", "Nova Labs", "technology", 64990L, 74990L, "A lightweight performance laptop with a crisp display and dependable battery life.", "photo-1496181133206-80ce9b88a853", List.of("laptop", "computer", "student"), "Nova choice", 4.7),
            new Seed("luma-view-27", "View 27 QHD Creator Monitor", "Luma", "technology", 24999L, 29999L, "A colour-accurate QHD monitor with a minimal bezel and USB-C connectivity.", "photo-1593640408182-31c70c8268f5", List.of("monitor", "display", "creator"), null, 4.5),
            new Seed("keyframe-k75", "K75 Wireless Mechanical Keyboard", "Keyframe", "technology", 5499L, 6999L, "A compact wireless mechanical keyboard with tactile switches and multi-device pairing.", "photo-1587829741301-dc798b83add3", List.of("keyboard", "gaming", "wireless"), "Trending", 4.6),
            new Seed("auralis-studio-one", "Studio One Wireless Headphones", "Auralis", "audio", 12999L, 15999L, "Immersive headphones with adaptive noise cancellation and spatial audio.", "photo-1505740420928-5e560c06d30e", List.of("headphones", "wireless", "music"), "Top rated", 4.8),
            new Seed("pulse-air-mini", "Air Mini True Wireless Earbuds", "Pulse", "audio", 3999L, 5999L, "Pocket-ready earbuds with clear calls, punchy sound, and a fast-charging case.", "photo-1590658268037-6bf12165a8df", List.of("earbuds", "tws", "wireless"), "Great value", 4.4),
            new Seed("resonance-room-speaker", "Room 360 Smart Speaker", "Resonance", "audio", 7499L, 8999L, "A room-filling wireless speaker with balanced 360-degree sound.", "photo-1608043152269-423dbba4e7e1", List.of("speaker", "bluetooth", "music"), null, 4.5),
            new Seed("waypoint-denim-jacket", "Everyday Selvedge Denim Jacket", "Waypoint", "fashion", 3299L, 4499L, "A structured denim jacket with durable hardware and a comfortable finish.", "photo-1576995853123-5a10305d93c0", List.of("denim", "jacket", "casual"), "Bestseller", 4.5),
            new Seed("atelier-oxford-shirt", "Relaxed Oxford Cotton Shirt", "Atelier North", "fashion", 1799L, 2499L, "A breathable cotton Oxford with a softly structured collar.", "photo-1603252109303-2751441dd157", List.of("shirt", "cotton", "casual"), null, 4.3),
            new Seed("drift-court-sneaker", "Court Everyday Sneakers", "Drift", "fashion", 2899L, 3999L, "Clean low-profile sneakers with a cushioned footbed and flexible sole.", "photo-1549298916-b41d501d3772", List.of("shoes", "sneakers", "footwear"), "Trending", 4.6),
            new Seed("haven-lounge-chair", "Contour Lounge Chair", "Haven", "home", 18999L, 22999L, "A sculptural lounge chair with a supportive curved back and warm timber frame.", "photo-1592078615290-033ee584e267", List.of("chair", "furniture", "decor"), "Designer pick", 4.7),
            new Seed("arc-glow-lamp", "Glow Adjustable Table Lamp", "Arc Living", "home", 2699L, 3499L, "A dimmable lamp with warm-to-cool lighting and an adjustable arm.", "photo-1507473885765-e6ed057f782c", List.of("lamp", "lighting", "desk"), null, 4.5),
            new Seed("loom-textured-throw", "Textured Cotton Sofa Throw", "Loom & Form", "home", 1499L, 1999L, "A soft breathable cotton throw with a tactile woven finish.", "photo-1615874694520-474822394e73", List.of("throw", "textile", "decor"), null, 4.4),
            new Seed("brewline-espresso", "Compact Espresso Coffee Maker", "Brewline", "appliances", 8999L, 11999L, "A compact espresso machine with precise temperature control and steam wand.", "photo-1517668808822-9ebb02f2a0e6", List.of("coffee", "kitchen", "espresso"), "Morning favourite", 4.6),
            new Seed("aero-crisp-airfryer", "Crisp 5L Digital Air Fryer", "Aero Home", "appliances", 6499L, 8499L, "A family-size air fryer with rapid circulation and eight presets.", "photo-1585515320310-259814833e62", List.of("air fryer", "kitchen", "cooking"), "Popular", 4.5),
            new Seed("pureflow-air", "Air S2 HEPA Purifier", "PureFlow", "appliances", 10999L, 13999L, "Quiet HEPA filtration with live air-quality sensing.", "photo-1585771724684-38269d6639fd", List.of("air purifier", "hepa", "home"), null, 4.7),
            new Seed("dewdrop-barrier-serum", "Barrier Repair Face Serum", "Dewdrop", "beauty", 899L, 1199L, "A lightweight daily serum with ceramides and niacinamide.", "photo-1620916566398-39f1143ab7be", List.of("serum", "skincare", "beauty"), "Beauty favourite", 4.6),
            new Seed("velvet-cloud-lip", "Cloud Matte Lip Colour", "Velvet", "beauty", 699L, 899L, "A soft-focus matte lip colour with comfortable wear and buildable pigment.", "photo-1586495777744-4413f21062fa", List.of("lipstick", "makeup", "beauty"), "New shades", 4.4),
            new Seed("terra-no7-fragrance", "No. 07 Eau de Parfum", "Terra", "beauty", 2499L, 2999L, "A modern woody fragrance layered with bergamot and cedar.", "photo-1541643600914-78b084683601", List.of("perfume", "fragrance", "beauty"), null, 4.5),
            new Seed("motion-pro-mat", "Pro Grip Yoga Mat", "Motion", "sports", 2199L, 2999L, "A dense supportive yoga mat with dependable grip and alignment markings.", "photo-1601925260368-ae2f83cf8b7f", List.of("yoga", "fitness", "mat"), "Studio pick", 4.7),
            new Seed("stride-flow-runner", "Flow Road Running Shoes", "Stride", "sports", 4299L, 5499L, "Responsive daily running shoes with breathable mesh and stable cushioning.", "photo-1542291026-7eec264c27ff", List.of("running", "shoes", "fitness"), "Runner favourite", 4.6),
            new Seed("forge-adjustable-dumbbell", "Adjustable Strength Dumbbell", "Forge", "sports", 7999L, 9999L, "A space-saving adjustable dumbbell with quick weight selection.", "photo-1517836357463-d25dfeac3438", List.of("dumbbell", "gym", "strength"), null, 4.5),
            new Seed("folio-intentional-day", "The Intentional Day", "Folio Press", "books", 499L, 699L, "A practical guide to calmer routines, protected attention, and meaningful work.", "photo-1544947950-fa07a98d237f", List.of("book", "productivity", "reading"), "Editor pick", 4.7),
            new Seed("folio-systems-scale", "Systems That Scale", "Folio Press", "books", 649L, 799L, "An accessible field guide to designing reliable products and teams.", "photo-1524995997946-a1c2e315a42f", List.of("book", "business", "technology"), null, 4.6),
            new Seed("highland-coffee", "Highland Medium Roast Coffee", "Field Notes", "grocery", 549L, 649L, "Freshly roasted whole beans with chocolate and toasted almond notes.", "photo-1447933601403-0c6688de566e", List.of("coffee", "beverage", "grocery"), "Fresh roast", 4.8),
            new Seed("goodgrain-granola", "Almond & Berry Breakfast Granola", "Goodgrain", "grocery", 399L, 475L, "Oven-toasted wholegrain clusters with almonds, berries, and seeds.", "photo-1517093157656-b9eccef91cb1", List.of("granola", "breakfast", "grocery"), null, 4.5),
            new Seed("playform-blocks", "Creative Wooden Building Blocks", "Playform", "toys", 1299L, 1699L, "Responsibly finished wooden blocks for open-ended imaginative play.", "photo-1598880940080-ff9a29891b85", List.of("toys", "blocks", "learning"), "Parent pick", 4.7),
            new Seed("brightbot-starter-kit", "BrightBot Coding Starter Kit", "BrightBot", "toys", 3499L, 4499L, "A beginner-friendly build-and-code robot kit with guided projects.", "photo-1535378917042-10a22c95931a", List.of("robot", "coding", "stem"), null, 4.6),
            new Seed("arc-time-steel", "Time Steel Minimal Watch", "Arc", "accessories", 4999L, 6499L, "A clean everyday watch with a brushed steel case.", "photo-1523170335258-f5ed11844a49", List.of("watch", "accessories", "style"), "Timeless", 4.6),
            new Seed("metro-daypack-20", "Metro 20L Everyday Backpack", "Waypoint", "accessories", 2799L, 3499L, "A weather-resistant backpack with a padded laptop sleeve.", "photo-1553062407-98eeb64c6a62", List.of("backpack", "bag", "travel"), null, 4.5),
            new Seed("halo-frame-sunglasses", "Frame Polarised Sunglasses", "Halo", "accessories", 1899L, 2499L, "Lightweight polarised sunglasses with glare-cutting lenses.", "photo-1511499767150-a48a237f0083", List.of("sunglasses", "eyewear", "style"), null, 4.4)
        );
        List<Seed> expanded = new ArrayList<>(base);
        String[] editions = {"Essential", "Plus", "Studio", "Classic", "Pro", "Air", "Select", "Signature", "Everyday", "Prime"};
        for (int number = 1; expanded.size() < 200; number++) {
            Seed source = base.get((number - 1) % base.size());
            String edition = editions[(number - 1) % editions.length];
            long price = Math.max(199L, source.price() + (((number % 7) - 3) * Math.max(50L, source.price() / 25)));
            long original = Math.max(price + 100L, Math.round(price * 1.22));
            expanded.add(new Seed(
                source.slug() + "-edition-" + number,
                source.title() + " " + edition + " " + String.format("%02d", number),
                source.brand(), source.category(), price, original,
                source.description() + " This " + edition.toLowerCase() + " edition adds a fresh finish and updated everyday details.",
                source.photo(), source.tags(), number % 11 == 0 ? "New arrival" : null,
                Math.min(4.9, Math.max(4.1, source.rating() + ((number % 3) - 1) * 0.1))
            ));
        }
        return expanded;
    }

    private List<Seed> realCatalogue() {
        List<Seed> items = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
            getClass().getResourceAsStream("/real-products.tsv"), StandardCharsets.UTF_8))) {
            reader.lines().skip(1).forEach(line -> {
                String[] value = line.split("\\t", 9);
                if (value.length == 9) items.add(new Seed(value[0], value[1], value[2], value[3],
                    Long.parseLong(value[4]), Long.parseLong(value[5]), value[6], value[7],
                    List.of(value[3], value[2].toLowerCase()), null, Double.parseDouble(value[8])));
            });
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to load the real product catalogue", exception);
        }
        return items;
    }

    private record Seed(String slug, String title, String brand, String category, long price, Long original,
                        String description, String photo, List<String> tags, String badge, double rating) {}
}
