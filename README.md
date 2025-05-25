# digital-piano-be

# Data Migration Guide

## Fixing Product defaultImageId

The schema has been updated to change the `defaultImage` field in the `Product` model from a string URL to a relation with the `Image` model using `defaultImageId`. This requires a data migration to ensure all products have a valid `defaultImageId` value.

## Steps to Fix and Update Schema

1. **Fix defaultImageId values**:
   Run the following command to ensure all products have a valid defaultImageId by finding or creating images:

   ```bash
   npm run fix:default-images
   ```

   This script will:
   - Find products that have images but no defaultImageId and set the first image as default
   - Find products with no images but with a defaultImage string URL, create an image from that URL and set it as default
   - Ensure all products have a valid defaultImageId before schema migration

2. **Apply schema changes with db push**:
   After fixing the data, run the following command to apply schema changes:

   ```bash
   npx prisma db push
   ```

3. **All-in-one command**:
   Alternatively, you can run both steps with a single command:

   ```bash
   npm run db:push
   ```

## What the Fix Script Does

The `fix-default-image-ids.js` script handles two scenarios:

1. Products that have images in the Image table but don't have a defaultImageId set
   - These products will have their first available image set as the default

2. Products that have no images in the Image table but have a defaultImage URL string
   - For these products, a new image record will be created and set as the default

This ensures that no product will have a NULL defaultImageId after the schema migration.

## Verification

After running the scripts, verify that:
1. All products have a valid defaultImageId value
2. Image management functionality in the application works correctly
3. The application displays the correct default image for each product