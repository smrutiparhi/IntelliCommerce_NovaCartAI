# Catalogue data

NovaCart's bundled catalogue contains 200 authentic product listings selected from the
public Amazon India sales dataset maintained by `Rakshitk2223/Amazon-Sales-Analysis`.
The source repository is MIT licensed and contains product identifiers, listing names,
images, selling prices, MRPs, ratings, rating counts, descriptions, and listing links.

The import intentionally excludes customer names, reviews, user identifiers, and other
personal data. It also limits repetitive cable and remote-control listings, removes
duplicate product IDs, and maps marketplace categories into NovaCart categories.

## Price accuracy

The bundled values are real marketplace **snapshot prices**, not a promise of today's
Amazon or Flipkart price. Retail prices change frequently. NovaCart therefore treats
the product-service price as its own checkout price.

Continuously live third-party prices require an authorised retailer feed such as the
Amazon Creators API (formerly Product Advertising API) or another contracted commerce
provider. Scraping retailer pages is deliberately not part of this project.

## Refreshing the snapshot

Download an updated compatible CSV, then run:

```powershell
.\scripts\import-real-catalogue.ps1 -InputPath .\amazon.csv
```

Rebuild the Product and Inventory service images afterward so MongoDB and inventory
are reconciled with the new set of slugs.
