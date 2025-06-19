-- CreateTable
CREATE TABLE "Operator" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "username" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorOTP" (
    "id" SERIAL NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OperatorOTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Operator_phone_key" ON "Operator"("phone");

-- AddForeignKey
ALTER TABLE "OperatorOTP" ADD CONSTRAINT "OperatorOTP_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
