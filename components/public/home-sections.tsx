import { createServiceClient } from "@/lib/supabase/service";
import { DealSection } from "./deal-section";
import { DealCard } from "./deal-card";

type DealProduct = {
  name: string;
  brand: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  status: string;
};

type SectionItemRow = {
  position: number;
  // Supabase-js infers embedded to-one relations as arrays without
  // generated DB types — both of these are actually always a single
  // object (or null): landing_page_id and product_id are required, plain
  // foreign keys.
  landing_page: {
    slug: string;
    name: string;
    status: string;
    product: DealProduct | null;
  } | null;
};

type SectionRow = {
  id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  items: SectionItemRow[];
};

type Card = {
  slug: string;
  title: string;
  brand: string | null;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
};

function isLive(item: SectionItemRow) {
  return item.landing_page?.status === "live" && item.landing_page.product?.status === "live";
}

function toCard(lp: NonNullable<SectionItemRow["landing_page"]>): Card {
  const product = lp.product!;
  return {
    slug: lp.slug,
    title: product.name ?? lp.name,
    brand: product.brand,
    imageUrl: product.image_url,
    price: product.price,
    currency: product.currency,
  };
}

type CategoryDealRow = {
  slug: string;
  name: string;
  product: DealProduct | null;
};

// Every Live landing page whose product is Live and in `category` —
// what a section's "Category" field auto-fills the shelf with.
async function getCategoryCards(
  supabase: ReturnType<typeof createServiceClient>,
  category: string,
): Promise<Card[]> {
  const { data } = await supabase
    .from("landing_pages")
    .select("slug, name, product:products!inner(name, brand, price, currency, image_url, status, category)")
    .eq("status", "live")
    .eq("product.status", "live")
    .eq("product.category", category)
    .order("created_at", { ascending: false });
  const rows = data as unknown as CategoryDealRow[] | null;

  return (rows ?? []).map((row) => ({
    slug: row.slug,
    title: row.product?.name ?? row.name,
    brand: row.product?.brand ?? null,
    imageUrl: row.product?.image_url ?? null,
    price: row.product?.price ?? null,
    currency: row.product?.currency ?? null,
  }));
}

// The homepage's admin-curated shelves — see app/admin/sections. Each Live
// section renders as a horizontally-scrollable deal-card row (Template 3,
// from dealsjunction-template3-toolkit), in Position order. A section can
// be filled two ways, combinable: a Category (auto-pulls every Live
// product in it) and/or hand-picked landing pages, hand-picked ones shown
// first and deduped against the category pull. Sections left with nothing
// publicly visible after that are skipped. If no section has been set up
// at all, falls back to one "All Deals" shelf of every Live landing page —
// the site's original behavior — so the homepage never just goes blank
// while sections are still being curated.
export async function HomeSections() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("home_sections")
    .select(
      "id, title, subtitle, category, items:home_section_items(position, landing_page:landing_pages(slug, name, status, product:products(name, brand, price, currency, image_url, status)))",
    )
    .eq("status", "live")
    .order("position", { ascending: true });

  const sections = (data as unknown as SectionRow[] | null) ?? [];

  const resolved = await Promise.all(
    sections.map(async (section) => {
      const handPicked = section.items
        .filter(isLive)
        .sort((a, b) => a.position - b.position)
        .map((item) => toCard(item.landing_page!));

      let categoryCards: Card[] = [];
      if (section.category) {
        const pickedSlugs = new Set(handPicked.map((c) => c.slug));
        categoryCards = (await getCategoryCards(supabase, section.category)).filter(
          (c) => !pickedSlugs.has(c.slug),
        );
      }

      return {
        id: section.id,
        title: section.title,
        subtitle: section.subtitle,
        items: [...handPicked, ...categoryCards],
      };
    }),
  );

  const liveSections = resolved.filter((section) => section.items.length > 0);

  if (liveSections.length === 0) {
    return <FallbackAllDeals />;
  }

  return (
    <div className="flex flex-col gap-10">
      {liveSections.map((section) => (
        <DealSection key={section.id} title={section.title} subtitle={section.subtitle}>
          {section.items.map((item) => (
            <DealCard
              key={item.slug}
              href={`/${item.slug}`}
              title={item.title}
              brand={item.brand}
              imageUrl={item.imageUrl}
              price={item.price}
              currency={item.currency}
            />
          ))}
        </DealSection>
      ))}
    </div>
  );
}

type FallbackEntry = {
  slug: string;
  name: string;
  product: DealProduct | null;
};

async function FallbackAllDeals() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("landing_pages")
    .select("slug, name, product:products!inner(name, brand, price, currency, image_url, status)")
    .eq("status", "live")
    .eq("product.status", "live")
    .order("created_at", { ascending: false });
  const pages = data as unknown as FallbackEntry[] | null;

  if (!pages?.length) {
    return (
      <p className="text-muted-foreground">
        Nothing published yet — check back soon.
      </p>
    );
  }

  return (
    <DealSection title="Today's Verified Hot Deals" subtitle="Curated daily with maximum savings">
      {pages.map((page) => (
        <DealCard
          key={page.slug}
          href={`/${page.slug}`}
          title={page.product?.name ?? page.name}
          brand={page.product?.brand}
          imageUrl={page.product?.image_url}
          price={page.product?.price}
          currency={page.product?.currency}
        />
      ))}
    </DealSection>
  );
}
