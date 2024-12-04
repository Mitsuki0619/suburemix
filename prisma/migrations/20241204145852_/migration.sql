/*
  Warnings:

  - You are about to drop the `CategoriesOnBlogs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoriesOnBlogs" DROP CONSTRAINT "CategoriesOnBlogs_blogId_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesOnBlogs" DROP CONSTRAINT "CategoriesOnBlogs_categoryId_fkey";

-- DropTable
DROP TABLE "CategoriesOnBlogs";
