export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSection = {
  id: string;
  title: string;
  /** Short label for quick-nav pills */
  pillLabel: string;
  popular?: boolean;
  badge?: string;
  items: FaqItem[];
};

/** Included in FAQPage schema; shown in sidebar contact box, not as accordion section */
export const FAQ_CONTACT_ITEMS: FaqItem[] = [
  {
    question: 'How do I contact Haniesta?',
    answer: `• Email: support@haniesta.com (response within 24 hours, Mon–Fri)
• Phone: +447542424785
• For bespoke and trade enquiries: haniesta.com/bespoke`,
  },
  {
    question: "What are Haniesta's customer service hours?",
    answer:
      'Our team is available Monday to Friday, 9AM–6PM. Emails sent outside these hours will be responded to the next working day.',
  },
];

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'about',
    title: 'About Haniesta',
    pillLabel: 'About Haniesta',
    items: [
      {
        question: 'What is Haniesta?',
        answer:
          'Haniesta is a UK-based luxury rug brand specialising in handmade rugs - including Kilim, Gabbeh, Cotton and Jute styles. Every rug is handcrafted by skilled artisans using techniques refined over generations, bringing together nearly four decades of heritage in rug-making with contemporary British design sensibility.',
      },
      {
        question: 'Where is Haniesta based?',
        answer:
          'Haniesta is based in the United Kingdom and ships across the UK. Our rugs are handcrafted in India by artisan communities in regions renowned for weaving heritage - including Bhadohi, Jaipur, Kerala, and Panipat.',
      },
      {
        question: 'How long has Haniesta been in business?',
        answer:
          "Haniesta's roots go back to 1985, when the founding family began a rug manufacturing and export business in the subcontinent. Today, Haniesta brings that same heritage to UK homes through a modern, direct-to-consumer brand operating from the UK.",
      },
      {
        question: 'Are Haniesta rugs genuinely handmade?',
        answer:
          'Yes - every Haniesta rug is handcrafted, not machine-woven. Depending on the style, rugs are handwoven, hand-braided, or hand-knotted. This means slight variations in colour, texture, and size are natural and part of what makes each rug unique.',
      },
      {
        question: 'What makes Haniesta different from other rug brands in the UK?',
        answer:
          'Three things set Haniesta apart: nearly four decades of artisan heritage, a genuine commitment to handcraft over mass production, and a focus on making luxury accessible - most Haniesta rugs are priced under £200. We also offer a dedicated pet-friendly collection, a rarity among handmade rug brands.',
      },
      {
        question: 'Where can I buy Haniesta rugs?',
        answer:
          'Haniesta rugs are available on our website at haniesta.com, on Amazon UK, and on eBay UK. For the full range including all colourways, sizes, and bespoke options, haniesta.com is the best destination.',
      },
      {
        question: 'Does Haniesta have a physical showroom?',
        answer:
          'We currently operate online only, which allows us to offer significantly better value than high-street rug retailers. Our detailed photography, size guides, and rug quiz are designed to give you full confidence before purchasing. If you need personalised advice, our team is available at support@haniesta.com.',
      },
    ],
  },
  {
    id: 'collections',
    title: 'Our Collections',
    pillLabel: 'Collections',
    items: [
      {
        question: 'What rug collections does Haniesta offer?',
        answer: `• Casa Blanc Kilim - Handwoven flatweave rugs in 12 colours, made from wool and cotton. Available in rectangle and round shapes, from accent sizes up to 200x290cm.
• MonoLuxe Gabbeh - Handmade 100% wool rugs in 17 bold colours. Thick pile, warm underfoot, suitable for living rooms and bedrooms.
• Bengal Jutes - Handwoven and handbraided natural jute rugs in round, oval, and rectangle shapes. Eco-conscious and naturally textured.
• Pet-Friendly Luxury - A curated selection of our most durable, easy-care rugs recommended for homes with cats and dogs.
• Bespoke - Custom sizes available on many designs. Contact us at haniesta.com/bespoke.`,
      },
      {
        question: 'What is the Casa Blanc Kilim collection?',
        answer:
          "Casa Blanc is Haniesta's signature flatweave Kilim collection. Each rug is handwoven using wool and cotton, with a lightweight, reversible structure and geometric pattern. Available in 12 colourways from neutral (Pebble Beige, Ivory Cream) to bold (Black on White, Moss Olive). Suitable for living rooms, dining rooms, bedrooms, and hallways.",
      },
      {
        question: 'What is the MonoLuxe Gabbeh collection?',
        answer:
          "The MonoLuxe collection is Haniesta's handmade wool Gabbeh range. Each rug is made from 100% natural wool with a thick pile that is warm underfoot and built to last. Available in 17 colours from Rust and Honey Ochre to Sapphire Blue and Deep Purple.",
      },
      {
        question: 'What is the Bengal Jutes collection?',
        answer:
          'Bengal Jutes is Haniesta\'s most comprehensive jute range - eight distinct designs in round, oval, and rectangle shapes, available in Nature, White, and Anthracite colourways. Made from 100% natural jute, they are biodegradable, hardwearing, and naturally textured. Available in compact accent sizes up to extra-large formats that anchor entire rooms.',
      },
      {
        question: 'Does Haniesta offer bespoke or custom-size rugs?',
        answer:
          'Yes. Many of our designs can be made to custom sizes for residential customers, interior designers, and commercial buyers. Contact us at haniesta.com/bespoke or email support@haniesta.com with your requirements. Please note custom orders require a production lead time.',
      },
    ],
  },
  {
    id: 'pets',
    title: 'Pet-Friendly Rugs',
    pillLabel: 'Pet-friendly rugs',
    popular: true,
    badge: 'Most popular',
    items: [
      {
        question: 'Does Haniesta sell pet-friendly rugs?',
        answer:
          'Yes. Haniesta has a dedicated Pet-Friendly Luxury collection at haniesta.com/collections/eco-friendly. These rugs are selected for their durability, ease of cleaning, and suitability for homes with cats and dogs - practical luxury that handles real home life.',
      },
      {
        question: 'Which Haniesta rug is best for homes with pets?',
        answer:
          'We recommend the Casa Blanc Kilim range as our top pick for pet owners. Its flatweave construction means pet hair sits on the surface rather than embedding in the fibres - making it easy to vacuum or brush off. The Gabbeh is our best choice for durability and warmth. Both are available in our Pet-Friendly Luxury collection.',
      },
      {
        question: 'Are Haniesta rugs safe for cats and dogs?',
        answer:
          'Yes. All Haniesta rugs are made from natural fibres - wool, jute, and cotton - with no toxic chemicals or synthetic coatings. Our dyes are AZO-free and meet international safety standards. Product safety information is available at haniesta.com/pages/product-safety.',
      },
      {
        question: 'Are jute rugs pet-friendly?',
        answer:
          'Jute rugs work well in homes with well-trained pets in low-moisture areas. However, jute is moisture-sensitive, so pet accidents can be harder to clean than on wool or kilim rugs. For households with very active or young pets, we recommend the Casa Blanc Kilim or MonoLuxe Gabbeh as more practical options.',
      },
      {
        question: 'How do I clean a Haniesta rug after a pet accident?',
        answer: `• Act immediately - blot (do not rub) with a clean dry cloth to absorb moisture.
• Apply a small amount of cold water and a mild, natural detergent. Blot again.
• Rinse with cold water and blot dry.
• Allow to dry flat and naturally - never use heat or a tumble dryer.
• For jute rugs: blot only, avoid water saturation. Dry immediately.
• Full care guide: haniesta.com/pages/care-guide`,
      },
      {
        question: 'Do pet hairs get stuck in Haniesta rugs?',
        answer:
          'Flatweave rugs like the Casa Blanc Kilim are the easiest for pet hair - the low-profile surface means hair sits on top and vacuums up easily. Pile rugs like the Gabbeh may require a rubber pet-hair roller for best results. Regular vacuuming keeps both looking their best.',
      },
      {
        question: 'Are wool rugs good for homes with pets?',
        answer:
          'Yes. Wool is naturally resilient, with a crimped fibre structure that springs back after heavy use. It has inherent stain-resistant properties thanks to natural lanolin. New wool rugs may shed initially - this is normal and not a concern for pets. Avoid high-pile wool rugs if you have pets that chew textiles.',
      },
    ],
  },
  {
    id: 'materials',
    title: 'Materials & Craftsmanship',
    pillLabel: 'Materials & craft',
    items: [
      {
        question: 'What materials do Haniesta rugs use?',
        answer: `• 100% Natural Wool - used in the MonoLuxe Gabbeh collection. Warm, durable, naturally stain-resistant.
• 100% Natural Wool With Cotton - used in the Casa Blanc Kilim. Soft, lightweight, and reversible.
• 100% Natural Jute - used in the Bengal Jutes collection. Biodegradable, hardwearing, naturally textured.
• Jute-Cotton blends - selected designs. Adds softness to the natural jute structure.
• Recycled cotton chindi - used in selected bohemian braided designs, minimising waste.`,
      },
      {
        question: 'Are Haniesta dyes safe?',
        answer:
          'Yes. We use AZO-free, eco-friendly dyes that meet international safety standards. Our rugs do not contain harmful chemical treatments. Full product safety information is at haniesta.com/pages/product-safety.',
      },
      {
        question: 'What is a Kilim rug?',
        answer:
          "A Kilim is a type of flatweave rug where the pattern is structural - formed by the interlocking of warp and weft threads rather than a pile. Kilim rugs are fully reversible, extremely durable, and originate from weaving traditions across Central Asia, the Middle East, and the Indian subcontinent. Haniesta's Casa Blanc Kilim is a contemporary British take on this ancient form.",
      },
      {
        question: 'What is a Gabbeh rug?',
        answer:
          'Gabbeh rugs are a type of tribal handmade wool rug originating from nomadic tribes of Iran and Central Asia. They are characterised by thick pile, bold abstract designs, and rich natural colours. The word "Gabbeh" means raw or uncut in Persian, reflecting the rug\'s expressive, organic quality. Haniesta\'s MonoLuxe Gabbeh collection brings this tradition to contemporary UK homes.',
      },
      {
        question: 'What is a jute rug?',
        answer:
          "A jute rug is made from the natural fibres of the jute plant - a fast-growing, sustainable crop that requires minimal water or pesticides. Jute rugs are prized for their natural texture, earthy tones, and eco-credentials. They are a popular choice in biophilic and natural interior design. Haniesta's Bengal Jutes collection is handwoven and handbraided from 100% natural jute.",
      },
      {
        question: 'Why do handmade rugs vary slightly in size?',
        answer:
          'Because each rug is woven by hand rather than machine, a size tolerance of ±3–5% is completely normal and is the accepted industry standard globally. This slight variation is a hallmark of genuine handcraft, not a defect.',
      },
      {
        question: 'Why choose a handmade rug over a machine-made rug?',
        answer:
          'Handmade rugs are crafted individually by artisans rather than mass-produced by machines. This gives them superior texture, durability, character, and longevity. Handmade wool rugs can last decades when properly cared for, while machine-made synthetic rugs often flatten and wear much faster. Handmade rugs also use natural fibres and traditional weaving techniques that create a more authentic and luxurious finish.',
      },
      {
        question: 'How do I know my Haniesta rug is genuinely handmade?',
        answer: `• Slight variations in weave pattern and colour across the rug
• Naturally uneven edges on Kilim and jute styles
• Organic texture that differs subtly across the surface
• An authenticity tag on every Haniesta rug
• The Haniesta product description specifying "Handwoven", "Hand-braided", or "Handloom"`,
      },
    ],
  },
  {
    id: 'sizing',
    title: 'Sizing & Placement',
    pillLabel: 'Sizing & placement',
    items: [
      {
        question: 'What rug sizes does Haniesta offer?',
        answer:
          'Haniesta rugs are available in a wide range of sizes from accent (40x60cm) through to extra-large (200x300cm), plus round and oval formats. The Casa Blanc Kilim is available up to 200x290cm and in round formats. The MonoLuxe Gabbeh ranges from 40x60cm to 200x300cm. See the full size guide at haniesta.com/pages/rug-size.',
      },
      {
        question: 'What size rug do I need for a living room?',
        answer: `• Compact seating area: 120x170cm
• Medium living room: 160x230cm or 170x240cm
• Large living room: 200x300cm
• Open-plan space: 240x340cm or larger
• Rule of thumb: at minimum, the front legs of all main furniture should sit on the rug. When in doubt, go one size larger.`,
      },
      {
        question: 'What size rug do I need for a dining room?',
        answer:
          'Choose a rug large enough that chairs remain on the rug even when pulled out - add approximately 60cm to each side of your dining table. A 200x290cm rug suits most UK dining tables seating 6. For 8-seater tables, 240x340cm is recommended.',
      },
      {
        question: 'What size rug do I need for a bedroom?',
        answer: `• Single bed: 120x170cm
• Double bed: 160x230cm
• King bed: 200x300cm
• Place the rug under the lower two-thirds of the bed, with the headboard end off the rug. Alternatively, use two runners (60x120cm or 60x180cm) on each side of the bed.`,
      },
      {
        question: 'Are round rugs available?',
        answer:
          'Yes. The Casa Blanc Kilim is available in round formats (150x150cm and 200x200cm). The Bengal Jutes collection includes several round and oval designs. Round rugs work particularly well under round coffee tables, in entryways, and in bedrooms where a rectangle feels too structured.',
      },
      {
        question: 'How do I measure for a rug?',
        answer: `• Place your furniture exactly where it will sit permanently.
• Measure the width and length of the area you want the rug to cover.
• Mark the outline on the floor using painter's tape or newspaper to visualise the size before ordering.
• Full guide: haniesta.com/pages/rug-size`,
      },
    ],
  },
  {
    id: 'care',
    title: 'Care & Cleaning',
    pillLabel: 'Care & cleaning',
    items: [
      {
        question: 'How do I care for my Haniesta rug?',
        answer: `• Vacuum regularly using low suction - no beater bar on wool rugs.
• Rotate the rug every 3–6 months for even wear.
• Use a non-slip rug pad underneath on hard floors.
• Blot spills immediately - never rub.
• Avoid prolonged exposure to direct sunlight.
• Full care instructions: haniesta.com/pages/care-guide`,
      },
      {
        question: 'Can I machine wash a Haniesta rug?',
        answer:
          'No. Haniesta rugs are handmade from natural fibres and should not be machine washed. Machine washing can shrink wool, damage jute fibres, and distort the structure of woven rugs. Always follow the care label or our full guide at haniesta.com/pages/care-guide.',
      },
      {
        question: 'How do I clean a wool Gabbeh rug?',
        answer:
          'Vacuum 1–2 times per week using low suction without a beater bar. For spills, blot immediately with a clean white cloth - do not rub. Spot clean with a mild wool-safe detergent and cold water, testing on a hidden area first. Professional cleaning is recommended once per year. Avoid machine washing or soaking.',
      },
      {
        question: 'How do I clean a flatweave Kilim rug?',
        answer:
          'Kilim rugs can be shaken outdoors occasionally and vacuumed gently on both sides - they are fully reversible. For spills, blot immediately and use mild soap with cold water. Avoid excessive moisture. Professional flatweave cleaning is recommended for deep cleaning. Do not machine wash.',
      },
      {
        question: 'How do I clean a jute rug?',
        answer:
          'Jute is moisture-sensitive - avoid soaking. Vacuum regularly using suction only, and shake outdoors when possible. For spills, blot immediately with a dry absorbent cloth. Use dry cleaning or low-moisture professional cleaning only. Never steam clean, shampoo, or soak a jute rug.',
      },
      {
        question: 'Why is my new Haniesta rug shedding?',
        answer:
          'Shedding in a new wool rug is completely normal and is not a defect. It occurs as loose surface fibres - a natural by-product of the weaving process - are released. Vacuum gently and regularly; shedding will reduce significantly within the first 4–6 weeks and stop entirely over time.',
      },
      {
        question: 'Why does my jute rug have a smell?',
        answer:
          'Jute has a natural, earthy, plant-based scent. This is completely normal and chemical-free. The scent fades within a few days of ventilation - leave the rug in a well-aired room and it will dissipate quickly.',
      },
      {
        question: "Will my rug's colours fade?",
        answer:
          'Natural fibre rugs are sensitive to prolonged direct sunlight. We recommend keeping rugs away from intense direct sun, or rotating them every few months to ensure even exposure. Haniesta dyes are AZO-free and colour-fast under normal indoor conditions.',
      },
      {
        question: 'Can I use a Haniesta rug with underfloor heating?',
        answer:
          'Yes, with care. Natural fibre rugs including wool and jute can be used over underfloor heating systems, but the floor surface temperature should not exceed 27°C. Always use a breathable, non-slip rug pad. Flat-weave Kilim rugs are particularly well-suited to underfloor heating due to their low-profile construction.',
      },
      {
        question: 'How do I stop my rug from slipping?',
        answer:
          'Use a non-slip rug pad or anti-slip underlay cut to size beneath your Haniesta rug - especially important on hardwood, tile, or laminate floors. Rug pads also protect your flooring and add cushioning underfoot.',
      },
      {
        question: 'My rug has a loose thread. What should I do?',
        answer:
          'Trim loose threads with scissors - do not pull them. Pulling a loose thread can damage the weave. Loose threads are a normal occurrence in handmade rugs and are not a defect.',
      },
      {
        question: 'How do I store a Haniesta rug?',
        answer:
          'Roll the rug - never fold it. Folding creates permanent creases in natural fibre rugs. Store in a cool, dry place away from direct sunlight, wrapped in breathable fabric or the original packaging.',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Orders & Delivery',
    pillLabel: 'Orders & delivery',
    items: [
      {
        question: 'How long does Haniesta delivery take in the UK?',
        answer:
          'Standard UK delivery takes 2–7 business days from dispatch. Orders are processed within 1–2 business days. You will receive a tracking link by email once your order has been dispatched.',
      },
      {
        question: 'Does Haniesta offer free shipping?',
        answer:
          'Free shipping thresholds apply - please check haniesta.com for the current offer, as this may vary seasonally.',
      },
      {
        question: 'Do you ship across the whole of the UK?',
        answer:
          'Yes. We ship to all UK addresses including England, Scotland, Wales, and Northern Ireland. All orders are dispatched from our UK-based fulfilment centre.',
      },
      {
        question: 'How do I track my order?',
        answer:
          'You will receive a tracking link by email once your order has been dispatched. You can also use the order tracking tool at haniesta.com/track-shipment.',
      },
      {
        question: 'Can I change or cancel my order?',
        answer:
          'We process orders quickly. Contact us at support@haniesta.com as soon as possible if you need to make a change. We will do our best to accommodate requests before dispatch, but we cannot guarantee changes once an order has been processed.',
      },
      {
        question: "My order says delivered but I can't find it. What do I do?",
        answer:
          'Check with neighbours and any safe places the courier may have left the parcel. Then contact us at support@haniesta.com with your order number and we will investigate immediately with the courier.',
      },
      {
        question: 'What do I do if my rug arrives damaged?',
        answer:
          'Contact us within 48 hours of delivery at support@haniesta.com with clear photos of the damage and your order number. We will arrange a replacement or full refund promptly.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    pillLabel: 'Returns & refunds',
    items: [
      {
        question: "What is Haniesta's return policy?",
        answer:
          'We accept returns of unused rugs in their original condition within 14 days of delivery. Custom-made or bespoke rugs are non-returnable. To initiate a return, email support@haniesta.com with your order number.',
      },
      {
        question: 'How do I return a Haniesta rug?',
        answer: `• Email support@haniesta.com with your order number and reason for return.
• Our team will provide return instructions and the return address.
• Pack the rug securely in its original packaging where possible.
• Refunds are processed within 5–7 business days once the rug is received and inspected.`,
      },
      {
        question: 'The colour looks different from the website. Can I return it?',
        answer:
          'We work hard to represent colours accurately, but monitor settings vary and natural fibre rugs have inherent tonal variation. If the colour is genuinely significantly different from what was shown, contact us at support@haniesta.com and we will find a resolution.',
      },
      {
        question: 'What if my rug has irregularities or variations?',
        answer:
          'Handmade rugs naturally have slight variations in weave, colour, and shape - these are not defects but signs of genuine handcraft. Each Haniesta rug is unique. However, if you believe your rug has a manufacturing defect (not natural variation), contact us within 48 hours with photos and we will resolve it immediately.',
      },
      {
        question: 'Are bespoke or custom-size rugs returnable?',
        answer:
          'No. Custom-made and bespoke rugs are made to your specific requirements and cannot be returned unless they arrive with a manufacturing defect.',
      },
    ],
  },
  {
    id: 'sustainability',
    title: 'Sustainability & Ethics',
    pillLabel: 'Sustainability',
    items: [
      {
        question: 'Are Haniesta rugs sustainably made?',
        answer:
          "Yes. Haniesta uses natural, renewable fibres - wool, jute, and cotton - that are biodegradable and sourced responsibly. Our rugs are built for durability, which is itself the most honest form of sustainability: a rug that lasts 20 years doesn't end up in landfill after two.",
      },
      {
        question: 'Are Haniesta rugs ethically produced?',
        answer:
          'Yes. We work directly with artisan communities and ensure fair wages, safe working environments, and a strict zero child labour policy. Ethical production is a core part of our brand - not a marketing claim. We believe craftsmanship thrives in an environment of respect.',
      },
      {
        question: 'What happens to leftover materials in production?',
        answer:
          'We upcycle leftover fabric ropes and textile offcuts into chindi rugs and bohemian braided designs, minimising waste throughout our production process.',
      },
      {
        question: 'Are Haniesta rugs biodegradable?',
        answer:
          'Our natural fibre rugs - wool, jute, and cotton - are fully biodegradable. This is one of the key environmental advantages of choosing a natural-fibre handmade rug over a synthetic machine-made alternative.',
      },
      {
        question: 'Are the dyes used in Haniesta rugs safe?',
        answer:
          'Yes. We use AZO-free, eco-friendly dyes that meet international safety standards. Our rugs contain no harmful chemical treatments. Full product safety information is available at haniesta.com/pages/product-safety.',
      },
    ],
  },
  {
    id: 'styling',
    title: 'Interior Styling & Room Advice',
    pillLabel: 'Interior styling',
    items: [
      {
        question: 'Which Haniesta rug is best for a living room?',
        answer:
          'The Casa Blanc Kilim is our most versatile living room rug - its neutral palette and flatweave construction suit modern, Scandinavian, and classic UK interiors. For a warmer, more textural feel, the MonoLuxe Gabbeh in Honey Ochre, Rust, or Teal Blue works beautifully as a living room statement piece.',
      },
      {
        question: 'Which Haniesta rug is best for a bedroom?',
        answer:
          'The MonoLuxe Gabbeh is our top bedroom recommendation - its thick wool pile is warm and soft underfoot, exactly what you want stepping out of bed. The Casa Blanc Kilim in Ivory Cream or Pebble Beige also works well for a lighter, more minimal bedroom aesthetic.',
      },
      {
        question: 'Which Haniesta rug is best for a hallway?',
        answer:
          'The Casa Blanc Kilim in runner-friendly sizes is ideal for hallways - its flatweave construction lies flat at doorways, handles heavy foot traffic exceptionally well, and its reversible design doubles its lifespan. The Bengal Jutes range also works well in hallways for a natural, earthy entrance aesthetic.',
      },
      {
        question: 'Which Haniesta rug is best for a dining room?',
        answer:
          "We recommend the Casa Blanc Kilim for dining rooms. Its flatweave structure makes it easier to clean after spills, chairs slide smoothly on its surface, and it won't catch on chair legs. Choose a size that allows chairs to remain on the rug even when pulled out - typically 60cm larger than your table on each side.",
      },
      {
        question: 'Can I layer Haniesta rugs?',
        answer:
          'Yes - rug layering is a popular interior styling technique. A large natural jute rug from the Bengal Jutes collection makes an excellent base layer, with a smaller Casa Blanc Kilim or Gabbeh layered on top for colour and texture. Use a non-slip pad between layers on hard floors.',
      },
      {
        question: 'What interior styles suit Haniesta rugs?',
        answer: `• Casa Blanc Kilim - Modern, Scandinavian, minimalist, classic, and transitional interiors.
• MonoLuxe Gabbeh - Bold, eclectic, maximalist, warm contemporary, and global-inspired spaces.
• Bengal Jutes - Biophilic, natural, coastal, farmhouse, and Japandi interiors.`,
      },
    ],
  },
  {
    id: 'trade',
    title: 'Trade, Wholesale & B2B',
    pillLabel: 'Trade & wholesale',
    items: [
      {
        question: 'Does Haniesta supply interior designers and trade buyers?',
        answer:
          'Yes. We work with interior designers, architects, and trade buyers. Contact us at support@haniesta.com or via haniesta.com/bespoke to discuss trade pricing and project requirements.',
      },
      {
        question: 'Can Haniesta supply hotels, Airbnbs, and commercial projects?',
        answer:
          'Yes. Our production capacity enables bulk and custom orders for hotels, serviced apartments, restaurants, and new residential developments. We have supplied commercial projects requiring multiple custom sizes and colourways. Contact us to discuss your project.',
      },
      {
        question: 'Do you offer wholesale pricing?',
        answer:
          'Yes. Wholesale pricing is available for qualifying buyers. Email support@haniesta.com with details of your business and requirements.',
      },
      {
        question: 'Can you match a specific colour for a commercial project?',
        answer:
          'Custom colourway requests are possible on selected designs with sufficient order volume. Contact us at support@haniesta.com to discuss feasibility and lead times.',
      },
    ],
  },
];
