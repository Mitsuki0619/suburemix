-- CreateTable
CREATE TABLE "CategoriesOnBlogs" (
    "blogId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "CategoriesOnBlogs_pkey" PRIMARY KEY ("blogId","categoryId")
);

-- AddForeignKey
ALTER TABLE "CategoriesOnBlogs" ADD CONSTRAINT "CategoriesOnBlogs_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnBlogs" ADD CONSTRAINT "CategoriesOnBlogs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
