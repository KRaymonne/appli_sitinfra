-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'DIRECTOR', 'EMPLOYEE', 'HR', 'SECRETARY', 'TECHNICIAN', 'SENIOR_TECHNICIAN', 'ENGINEER', 'EXECUTIVE', 'INTERN', 'DRIVER') NOT NULL,
    `status` ENUM('ON_HOLIDAY', 'SUSPENDED', 'FIRED', 'ACTIVE') NOT NULL,
    `employeeNumber` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `placeOfBirth` VARCHAR(191) NOT NULL,
    `civilityDropdown` ENUM('MALE', 'FEMALE') NOT NULL,
    `maritalStatus` ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED') NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `identityType` ENUM('NATIONAL_ID_CARD', 'PASSPORT', 'DRIVER_LICENSE') NOT NULL,
    `identity` VARCHAR(191) NOT NULL,
    `workcountry` ENUM('IVORY_COAST', 'GHANA', 'BENIN', 'CAMEROON', 'TOGO', 'ROMANIE', 'ITALIE') NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `tel` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `emergencyName` VARCHAR(191) NOT NULL,
    `emergencyContact` VARCHAR(191) NOT NULL,
    `childrenCount` INTEGER NOT NULL DEFAULT 0,
    `department` VARCHAR(191) NOT NULL,
    `salary` DOUBLE NOT NULL,
    `hireDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_employeeNumber_key`(`employeeNumber`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountantProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `accountingDept` VARCHAR(191) NOT NULL,
    `additionalInfo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AccountantProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectorProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `departmentHead` VARCHAR(191) NOT NULL,
    `additionalInfo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DirectorProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `additionalInfo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmployeeProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SecretaryProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `office` VARCHAR(191) NOT NULL,
    `additionalInfo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SecretaryProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DriverProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `licenseNumber` VARCHAR(191) NOT NULL,
    `licenseExpiryDate` DATETIME(3) NOT NULL,
    `assignedVehicleId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DriverProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contracts` (
    `contractId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `contractType` ENUM('PERMANENT_CONTRACT_CDI', 'FIXED_TERM_CONTRACT_CDD', 'INTERNSHIP', 'CONSULTANT') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `post` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NULL,
    `grossSalary` DOUBLE NOT NULL,
    `netSalary` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `contractFile` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`contractId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `absences` (
    `absenceId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `absenceType` ENUM('ILLNESS', 'ANNUAL_LEAVE', 'AUTHORIZED_LEAVE', 'HALF_DAY', 'UNJUSTIFIED_LEAVE', 'MATERNITY_LEAVE') NOT NULL,
    `description` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `daysCount` INTEGER NOT NULL,
    `returnDate` DATETIME(3) NOT NULL,
    `supportingDocument` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`absenceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bonuses` (
    `bonusId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `bonusType` ENUM('PERFORMANCE', 'SENIORITY', 'SPECIAL') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `awardDate` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `paymentMethod` ENUM('CASH', 'BANK_TRANSFER') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    `supportingDocument` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`bonusId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sanctions` (
    `sanctionId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `sanctionType` ENUM('WARNING', 'SUSPENSION', 'DEMOTION') NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `sanctionDate` DATETIME(3) NOT NULL,
    `durationDays` INTEGER NULL,
    `decision` VARCHAR(191) NULL,
    `supportingDocument` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`sanctionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_records` (
    `medicalRecordsId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `visitDate` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NULL,
    `diagnosis` VARCHAR(191) NULL,
    `testsPerformed` VARCHAR(191) NULL,
    `testResults` VARCHAR(191) NULL,
    `prescribedAction` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `nextVisitDate` DATETIME(3) NULL,
    `medicalFile` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`medicalRecordsId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `affectations` (
    `affectationsId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `workLocation` VARCHAR(191) NOT NULL,
    `site` VARCHAR(191) NOT NULL,
    `affectationtype` ENUM('PERMANENT', 'TEMPORARY', 'TRANSFER', 'PROJECT_BASED', 'SPECIAL_ASSIGNMENT') NOT NULL,
    `description` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `attached_file` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`affectationsId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `vehicleId` INTEGER NOT NULL AUTO_INCREMENT,
    `licensePlate` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `type` ENUM('CAR', 'TRUCK', 'VAN', 'MOTORCYCLE') NOT NULL,
    `vehiclecountry` ENUM('IVORY_COAST', 'GHANA', 'BENIN', 'CAMEROON', 'TOGO', 'ROMANIE', 'ITALIE') NOT NULL,
    `year` INTEGER NOT NULL,
    `mileage` INTEGER NOT NULL,
    `civilRegistration` VARCHAR(191) NOT NULL,
    `administrativeRegistration` VARCHAR(191) NOT NULL,
    `acquisitionDate` DATETIME(3) NOT NULL,
    `usingEntity` VARCHAR(191) NOT NULL,
    `holder` VARCHAR(191) NOT NULL,
    `chassisNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE') NOT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `fuelType` ENUM('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID') NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `fuel` VARCHAR(191) NOT NULL,
    `vehicleType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicles_licensePlate_key`(`licensePlate`),
    UNIQUE INDEX `vehicles_chassisNumber_key`(`chassisNumber`),
    PRIMARY KEY (`vehicleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `state_vehicles` (
    `stateVehicleId` INTEGER NOT NULL AUTO_INCREMENT,
    `licensePlate` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `mileage` INTEGER NOT NULL,
    `ministry` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `budgetAllocation` VARCHAR(191) NOT NULL,
    `statePropertyNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `state_vehicles_licensePlate_key`(`licensePlate`),
    UNIQUE INDEX `state_vehicles_statePropertyNumber_key`(`statePropertyNumber`),
    PRIMARY KEY (`stateVehicleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `garages` (
    `garageId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `manager` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `type` ENUM('PUBLIC', 'PRIVATE', 'AUTHORIZED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`garageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_authorizations` (
    `authorizationId` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `authorizationNumber` VARCHAR(191) NOT NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `issuingAuthority` VARCHAR(191) NOT NULL,
    `autorisationtype` ENUM('CIRCULER', 'NON_CIRCULABLE') NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'REVOKED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicle_authorizations_authorizationNumber_key`(`authorizationNumber`),
    PRIMARY KEY (`authorizationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contentieux` (
    `contentieuxId` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `incidentDate` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `faultAttribution` ENUM('STATE', 'HOLDER', 'UNDETERMINED') NOT NULL,
    `conclusion` VARCHAR(191) NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL,
    `resolutionDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`contentieuxId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_interventions` (
    `interventionId` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `garageId` INTEGER NOT NULL,
    `interventionDate` DATETIME(3) NOT NULL,
    `type` ENUM('MAINTENANCE', 'REPAIR', 'INSPECTION') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `cost` DOUBLE NOT NULL,
    `technician` VARCHAR(191) NOT NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL,
    `nextInterventionDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`interventionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_pieces` (
    `pieceId` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `type` ENUM('INSURANCE', 'TECHNICAL_VISIT', 'REGISTRATION') NOT NULL,
    `typeLibre` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `montant` DOUBLE NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NOT NULL,
    `dateProchaine` DATETIME(3) NULL,
    `fichierJoint` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`pieceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_expenses` (
    `expenseId` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `nextDate` DATETIME(3) NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `distance` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `statut` ENUM('NON_PAYE', 'PAYE', 'REMBOURSE') NOT NULL,
    `fichierJoint` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`expenseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_reforms` (
    `reformId` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `reformDate` DATETIME(3) NOT NULL,
    `reformReason` VARCHAR(191) NOT NULL,
    `salePrice` DOUBLE NULL,
    `buyer` VARCHAR(191) NULL,
    `buyerNumber` VARCHAR(191) NULL,
    `buyerAddress` VARCHAR(191) NULL,
    `disposalMethod` ENUM('SALE', 'DESTRUCTION', 'DONATION') NOT NULL,
    `reformReport` VARCHAR(191) NULL,
    `reformCertificate` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicle_reforms_vehicleId_key`(`vehicleId`),
    PRIMARY KEY (`reformId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fuel_managements` (
    `fuelManagementId` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `typePaiement` ENUM('CARD', 'CASH', 'TRANSFER') NOT NULL,
    `distance` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,
    `prixLitre` DOUBLE NOT NULL,
    `station` VARCHAR(191) NOT NULL,
    `fichierJoint` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`fuelManagementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_cards` (
    `cardId` INTEGER NOT NULL AUTO_INCREMENT,
    `dateAchat` DATETIME(3) NOT NULL,
    `typeBadge` ENUM('TOTAL', 'SHELL', 'OTHER') NOT NULL,
    `typeBadgeLibre` VARCHAR(191) NULL,
    `numBadge` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `montant` DOUBLE NOT NULL,
    `dateMiseEnService` DATETIME(3) NOT NULL,
    `fichierJoint` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_cards_numBadge_key`(`numBadge`),
    PRIMARY KEY (`cardId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card_operations` (
    `operationId` INTEGER NOT NULL AUTO_INCREMENT,
    `cardId` INTEGER NOT NULL,
    `operationDate` DATETIME(3) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`operationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment` (
    `equipmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('TOPOGRAPHIC_MATERIALS', 'COMPUTER_MATERIALS', 'OTHERS') NOT NULL,
    `type` ENUM('TOTAL_STATION', 'GPS', 'LEVEL', 'TABLET', 'OTHERS') NOT NULL,
    `brand` ENUM('LEICA', 'TRIMBLE', 'OTHER_BRAND') NOT NULL,
    `model` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NOT NULL,
    `referenceCode` VARCHAR(191) NOT NULL,
    `supplier` ENUM('DELUXE_C', 'STIALA_C', 'DIGITOP', 'OTHER_SUPPLIER') NOT NULL,
    `purchaseAmount` DOUBLE NOT NULL,
    `purchaseDate` DATETIME(3) NOT NULL,
    `deliveryDate` DATETIME(3) NOT NULL,
    `warrantyExpiry` DATETIME(3) NULL,
    `status` ENUM('GOOD', 'BAD', 'BROKEN', 'DECOMMISSIONED', 'LOST') NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `observations` VARCHAR(191) NULL,
    `ownership` ENUM('PRIVATE', 'COMPANY', 'TENANT', 'OTHER') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `equipment_serialNumber_key`(`serialNumber`),
    UNIQUE INDEX `equipment_referenceCode_key`(`referenceCode`),
    PRIMARY KEY (`equipmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment_assignments` (
    `assignmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `equipmentId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `assignmentDate` DATETIME(3) NOT NULL,
    `returnDate` DATETIME(3) NULL,
    `purpose` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `status` ENUM('ASSIGNED', 'IN_TRANSIT', 'RETURNED', 'CANCELLED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`assignmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment_revisions` (
    `revisionId` INTEGER NOT NULL AUTO_INCREMENT,
    `equipmentId` INTEGER NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `validityDate` DATETIME(3) NULL,
    `amount` DOUBLE NOT NULL,
    `supplier` VARCHAR(191) NOT NULL,
    `referenceNumber` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL,
    `nextRevisionDate` DATETIME(3) NULL,
    `currency` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`revisionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment_calibrations` (
    `calibrationId` INTEGER NOT NULL AUTO_INCREMENT,
    `equipmentId` INTEGER NOT NULL,
    `calibrationDate` DATETIME(3) NOT NULL,
    `validityDate` DATETIME(3) NULL,
    `amount` DOUBLE NOT NULL,
    `supplier` VARCHAR(191) NOT NULL,
    `referenceNumber` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `nextCalibrationDate` DATETIME(3) NULL,
    `currency` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`calibrationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment_maintenance` (
    `maintenanceId` INTEGER NOT NULL AUTO_INCREMENT,
    `equipmentId` INTEGER NOT NULL,
    `maintenanceDate` DATETIME(3) NOT NULL,
    `maintenanceType` ENUM('PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE') NOT NULL,
    `description` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `supplier` VARCHAR(191) NOT NULL,
    `technician` VARCHAR(191) NULL,
    `downtimeHours` INTEGER NULL,
    `nextMaintenanceDate` DATETIME(3) NULL,
    `currency` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`maintenanceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment_repairs` (
    `repairId` INTEGER NOT NULL AUTO_INCREMENT,
    `equipmentId` INTEGER NOT NULL,
    `repairDate` DATETIME(3) NOT NULL,
    `repairType` ENUM('MECHANICAL', 'ELECTRONIC', 'SOFTWARE', 'BODYWORK', 'OTHER') NOT NULL,
    `description` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `supplier` VARCHAR(191) NOT NULL,
    `technician` VARCHAR(191) NULL,
    `partsReplaced` VARCHAR(191) NULL,
    `warrantyPeriod` INTEGER NULL,
    `currency` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`repairId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment_expenses` (
    `expenseId` INTEGER NOT NULL AUTO_INCREMENT,
    `equipmentId` INTEGER NOT NULL,
    `expenseDate` DATETIME(3) NOT NULL,
    `expenseType` ENUM('PURCHASE', 'MAINTENANCE', 'REPAIR', 'REVISION', 'CALIBRATION', 'OTHER') NOT NULL,
    `description` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `supplier` VARCHAR(191) NULL,
    `invoiceNumber` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`expenseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registers` (
    `registerId` INTEGER NOT NULL AUTO_INCREMENT,
    `registerName` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `responsibleUserId` VARCHAR(191) NOT NULL,
    `currentBalance` DOUBLE NOT NULL DEFAULT 0.0,
    `attachmentfile` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `registers_registerName_key`(`registerName`),
    PRIMARY KEY (`registerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `transactionId` INTEGER NOT NULL AUTO_INCREMENT,
    `registerId` INTEGER NOT NULL,
    `transactionType` ENUM('INCOME', 'EXPENSE', 'TRANSFER_OUT', 'TRANSFER_IN') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `expenseType` ENUM('MTN_PHONE', 'CUSTOMS', 'TRANSPORT', 'TENDER_DOCUMENTS', 'ADVERTISING', 'INSURANCE', 'MISCELLANEOUS') NULL,
    `referenceNumber` VARCHAR(191) NULL,
    `receiptNumber` VARCHAR(191) NULL,
    `transactionDate` DATETIME(3) NOT NULL,
    `serviceProvider` VARCHAR(191) NULL,
    `supplyType` ENUM('MAINTENANCE_PRODUCTS', 'WATER', 'ELECTRICITY', 'FUEL', 'SMALL_EQUIPMENT', 'NONE') NULL,
    `attachment` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`transactionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `businesses` (
    `businessId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('PROSPECT', 'NEGOTIATION', 'WON', 'LOST') NOT NULL,
    `client` VARCHAR(191) NOT NULL,
    `contact` INTEGER NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `estimatedCost` DOUBLE NOT NULL,
    `salePrice` DOUBLE NOT NULL,
    `comment` VARCHAR(191) NULL,
    `progress` INTEGER NOT NULL,
    `attachment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`businessId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `contactId` INTEGER NOT NULL AUTO_INCREMENT,
    `contactGroupe` ENUM('CLIENT', 'SUPPLIER', 'CONSULTANTS', 'PUBLIC_ADMINISTRATION', 'OTHERS') NOT NULL,
    `companyName` ENUM('SITINFRA_SARL', 'GEOTOP', 'SITALIA', 'OTHER_COMPANY') NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `contacts_email_key`(`email`),
    PRIMARY KEY (`contactId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `professional_services` (
    `professionalServiceId` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `serviceType` ENUM('ACCOUNTING_SOFTWARE_LICENSE_FEE', 'PROFESSIONAL_FEES', 'AIR_TICKET', 'BUILDING_RENTAL', 'INTERNET', 'BUSINESS_TRIP_ASSIGNMENT', 'MAINTENANCE_REPAIR_MOVABLE_PROPERTY', 'RECEPTIONS_HOSPITALITY', 'OTHER_SERVICE') NOT NULL,
    `supplier` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `paymentDate` DATETIME(3) NULL,
    `description` VARCHAR(191) NULL,
    `paymentMethod` ENUM('CASH', 'BANK_TRANSFER') NULL,
    `status` ENUM('PAID', 'PENDING', 'OVERDUE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `professional_services_invoiceNumber_key`(`invoiceNumber`),
    PRIMARY KEY (`professionalServiceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_expenses` (
    `companyExpenseId` INTEGER NOT NULL AUTO_INCREMENT,
    `chargeType` ENUM('APPOINTEMENTS_SALAIRES_ET_COMMISSIONS', 'CHARGES_SOCIALES_SUR_REMUNERATION_PERSONNEL_NATIONAL', 'PERSONNEL_DETACHE_OU_PRETE_A_L_ENTREPRISE_MANUTENTION', 'PRESTATAIRE', 'OTHER_CHARGE') NOT NULL,
    `userId` INTEGER NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('PAID', 'PENDING', 'OVERDUE') NOT NULL,
    `service` VARCHAR(191) NULL,
    `attachment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`companyExpenseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `other_invoices` (
    `otherInvoiceId` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `paymentDate` DATETIME(3) NULL,
    `supplier` VARCHAR(191) NOT NULL,
    `supplierContactId` INTEGER NULL,
    `status` ENUM('PAID', 'PENDING', 'OVERDUE') NOT NULL,
    `service` VARCHAR(191) NULL,
    `attachment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `other_invoices_invoiceNumber_key`(`invoiceNumber`),
    PRIMARY KEY (`otherInvoiceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_declarations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taxType` ENUM('VAT', 'INCOME_TAX', 'CORPORATE_TAX', 'SOCIAL_CONTRIBUTIONS', 'OTHER_TAX') NOT NULL,
    `taxAmount` DOUBLE NOT NULL,
    `penalties` DOUBLE NOT NULL DEFAULT 0.0,
    `declarationDate` DATETIME(3) NOT NULL,
    `paymentDate` DATETIME(3) NULL,
    `status` ENUM('TO_PAY', 'PAID', 'OVERDUE') NOT NULL,
    `referenceNumber` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tax_declarations_referenceNumber_key`(`referenceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alerts` (
    `alertId` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `priority` ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`alertId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banks` (
    `bankId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('CHECKING_ACCOUNT', 'SAVINGS_ACCOUNT', 'PROJECT_ACCOUNT') NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0.0,
    `currency` VARCHAR(191) NOT NULL,
    `attachment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`bankId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_transactions` (
    `transactionId` INTEGER NOT NULL AUTO_INCREMENT,
    `bankId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `accountType` ENUM('CHECKING_ACCOUNT', 'SAVINGS_ACCOUNT', 'PROJECT_ACCOUNT') NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `attachment` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`transactionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offre_devis` (
    `devisId` INTEGER NOT NULL AUTO_INCREMENT,
    `indexNumber` VARCHAR(191) NOT NULL,
    `clientId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `validityDate` DATETIME(3) NOT NULL,
    `status` ENUM('APPLICATION', 'UNDER_REVIEW', 'PENDING', 'SHORTLISTED', 'BID_SUBMITTED', 'NOT_PURSUED') NOT NULL,
    `description` VARCHAR(191) NULL,
    `attachment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `offre_devis_indexNumber_key`(`indexNumber`),
    PRIMARY KEY (`devisId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offre_daos` (
    `daoId` INTEGER NOT NULL AUTO_INCREMENT,
    `activityCode` VARCHAR(191) NULL,
    `transmissionDate` DATETIME(3) NOT NULL,
    `daoNumber` VARCHAR(191) NOT NULL,
    `clientId` INTEGER NOT NULL,
    `contactId` INTEGER NULL,
    `submissionDate` DATETIME(3) NULL,
    `submissionType` ENUM('ELECTRONIC', 'PHYSICAL', 'EMAIL') NOT NULL,
    `object` VARCHAR(191) NOT NULL,
    `status` ENUM('APPLICATION', 'UNDER_REVIEW', 'PENDING', 'SHORTLISTED', 'BID_SUBMITTED', 'NOT_PURSUED') NOT NULL,
    `attachment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `offre_daos_daoNumber_key`(`daoNumber`),
    PRIMARY KEY (`daoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccountantProfile` ADD CONSTRAINT `AccountantProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectorProfile` ADD CONSTRAINT `DirectorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeProfile` ADD CONSTRAINT `EmployeeProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SecretaryProfile` ADD CONSTRAINT `SecretaryProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DriverProfile` ADD CONSTRAINT `DriverProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absences` ADD CONSTRAINT `absences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bonuses` ADD CONSTRAINT `bonuses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sanctions` ADD CONSTRAINT `sanctions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_records` ADD CONSTRAINT `medical_records_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affectations` ADD CONSTRAINT `affectations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_authorizations` ADD CONSTRAINT `vehicle_authorizations_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`vehicleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contentieux` ADD CONSTRAINT `contentieux_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`vehicleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_interventions` ADD CONSTRAINT `vehicle_interventions_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`vehicleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_interventions` ADD CONSTRAINT `vehicle_interventions_garageId_fkey` FOREIGN KEY (`garageId`) REFERENCES `garages`(`garageId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_pieces` ADD CONSTRAINT `vehicle_pieces_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`vehicleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_expenses` ADD CONSTRAINT `vehicle_expenses_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`vehicleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_reforms` ADD CONSTRAINT `vehicle_reforms_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`vehicleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_managements` ADD CONSTRAINT `fuel_managements_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`vehicleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card_operations` ADD CONSTRAINT `card_operations_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `payment_cards`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_assignments` ADD CONSTRAINT `equipment_assignments_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`equipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_assignments` ADD CONSTRAINT `equipment_assignments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_revisions` ADD CONSTRAINT `equipment_revisions_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`equipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_calibrations` ADD CONSTRAINT `equipment_calibrations_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`equipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_maintenance` ADD CONSTRAINT `equipment_maintenance_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`equipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_repairs` ADD CONSTRAINT `equipment_repairs_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`equipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_expenses` ADD CONSTRAINT `equipment_expenses_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`equipmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_registerId_fkey` FOREIGN KEY (`registerId`) REFERENCES `registers`(`registerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_expenses` ADD CONSTRAINT `company_expenses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `other_invoices` ADD CONSTRAINT `other_invoices_supplierContactId_fkey` FOREIGN KEY (`supplierContactId`) REFERENCES `contacts`(`contactId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_transactions` ADD CONSTRAINT `bank_transactions_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `banks`(`bankId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offre_devis` ADD CONSTRAINT `offre_devis_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `contacts`(`contactId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offre_daos` ADD CONSTRAINT `offre_daos_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `contacts`(`contactId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offre_daos` ADD CONSTRAINT `offre_daos_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`contactId`) ON DELETE SET NULL ON UPDATE CASCADE;
