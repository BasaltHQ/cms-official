import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { globalLocationData } from "./data/global_locations";

const locationData: any[] = globalLocationData;


async function retry<T>(fn: () => Promise<T>, retries = 5, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error.code === 'P2034' || error.message?.includes('WriteConflict') || error.code === 'P2002')) {
            console.log(`Retrying transaction... (${retries} attempts left) - ${error.message}`);
            await new Promise((res) => setTimeout(res, delay));
            return retry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

export async function seedLocations() {
    console.log("Seeding Locations...");

    for (const countryData of locationData) {
        console.log(`Processing Country: ${countryData.name}`);
        // Upsert Country
        const country = await retry(() => prisma.country.upsert({
            where: { code: countryData.code },
            update: { name: countryData.name, slug: countryData.slug },
            create: {
                name: countryData.name,
                code: countryData.code,
                slug: countryData.slug,
            },
        }));

        if (!countryData.regions) continue;

        for (const regionData of countryData.regions) {
            console.log(`  Processing Region: ${regionData.name}`);

            // Upsert Region
            let region = await retry(async () => {
                const existing = await prisma.region.findUnique({
                    where: {
                        country_code_slug: {
                            country_code: country.code,
                            slug: regionData.slug
                        }
                    }
                });

                if (!existing) {
                    return prisma.region.create({
                        data: {
                            name: regionData.name,
                            slug: regionData.slug,
                            country_code: country.code
                        }
                    });
                } else {
                    return prisma.region.update({
                        where: { id: existing.id },
                        data: { name: regionData.name }
                    });
                }
            });

            if (!regionData.cities) continue;

            for (const cityData of regionData.cities) {
                // console.log(`    Processing City: ${cityData.name}`);
                await retry(() => prisma.city.upsert({
                    where: { slug: cityData.slug },
                    update: {
                        name: cityData.name,
                        native_name: (cityData as any).native_name,
                        population: cityData.population,
                        country_code: country.code,
                        region_id: region.id,
                    },
                    create: {
                        name: cityData.name,
                        native_name: (cityData as any).native_name,
                        slug: cityData.slug,
                        population: cityData.population,
                        country_code: country.code,
                        region_id: region.id,
                    },
                }));
            }
        }
    }

    // Double check count
    const countriesCount = await prisma.country.count();
    const regionsCount = await prisma.region.count();
    const citiesCount = await prisma.city.count();
    console.log(`Seeded ${countriesCount} countries, ${regionsCount} regions, ${citiesCount} cities.`);
}
