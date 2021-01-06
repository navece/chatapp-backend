-- CreateTable
CREATE TABLE "users" (
"id" SERIAL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdat" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "imageurl" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "uuid" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "content" TEXT,
    "createdat" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users.username_unique" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users.email_unique" ON "users"("email");
