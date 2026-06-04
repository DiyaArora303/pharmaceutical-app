-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: pharmaceutical_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `active_ingredient`
--

DROP TABLE IF EXISTS `active_ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `active_ingredient` (
  `Ingredient_ID` int NOT NULL AUTO_INCREMENT,
  `Ingredient_Name` varchar(200) NOT NULL,
  PRIMARY KEY (`Ingredient_ID`),
  UNIQUE KEY `Ingredient_Name` (`Ingredient_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `active_ingredient`
--

LOCK TABLES `active_ingredient` WRITE;
/*!40000 ALTER TABLE `active_ingredient` DISABLE KEYS */;
INSERT INTO `active_ingredient` VALUES (1,'Acetaminophen'),(3,'Amoxicillin Trihydrate'),(2,'Ibuprofen'),(5,'Lisinopril Dihydrate'),(4,'Metformin Hydrochloride');
/*!40000 ALTER TABLE `active_ingredient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compound`
--

DROP TABLE IF EXISTS `compound`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compound` (
  `Compound_ID` int NOT NULL AUTO_INCREMENT,
  `Compound_Name` varchar(200) NOT NULL,
  `Chemical_Formula` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Compound_ID`),
  UNIQUE KEY `Chemical_Formula` (`Chemical_Formula`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compound`
--

LOCK TABLES `compound` WRITE;
/*!40000 ALTER TABLE `compound` DISABLE KEYS */;
INSERT INTO `compound` VALUES (1,'Acetaminophen Base','C8H9NO2'),(2,'Ibuprofen Base','C13H18O2'),(3,'Amoxicillin','C16H19N3O5S'),(4,'Metformin','C4H11N5'),(5,'Lisinopril','C21H31N3O5'),(6,'Cetirizine Base','C21H25ClN2O3');
/*!40000 ALTER TABLE `compound` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contraindication`
--

DROP TABLE IF EXISTS `contraindication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contraindication` (
  `Contraindication_ID` int NOT NULL AUTO_INCREMENT,
  `Condition_Name` varchar(500) NOT NULL,
  PRIMARY KEY (`Contraindication_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contraindication`
--

LOCK TABLES `contraindication` WRITE;
/*!40000 ALTER TABLE `contraindication` DISABLE KEYS */;
INSERT INTO `contraindication` VALUES (1,'Liver Disease'),(2,'Kidney Disease'),(3,'Pregnancy'),(4,'Allergy to Penicillin'),(5,'Heart Failure'),(7,'Glaucoma');
/*!40000 ALTER TABLE `contraindication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dosage_form`
--

DROP TABLE IF EXISTS `dosage_form`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dosage_form` (
  `Dosage_Form_ID` int NOT NULL AUTO_INCREMENT,
  `Form_Name` varchar(50) NOT NULL,
  PRIMARY KEY (`Dosage_Form_ID`),
  UNIQUE KEY `Form_Name` (`Form_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dosage_form`
--

LOCK TABLES `dosage_form` WRITE;
/*!40000 ALTER TABLE `dosage_form` DISABLE KEYS */;
INSERT INTO `dosage_form` VALUES (2,'Capsule'),(4,'Injectable'),(3,'Liquid Suspension'),(1,'Tablet'),(5,'Topical Cream');
/*!40000 ALTER TABLE `dosage_form` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drug`
--

DROP TABLE IF EXISTS `drug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug` (
  `Drug_ID` int NOT NULL AUTO_INCREMENT,
  `Brand_Name` varchar(200) NOT NULL,
  `Generic_ID` int NOT NULL,
  `Therapeutic_Class_ID` int NOT NULL,
  `Dosage_Form_ID` int NOT NULL,
  `Regulatory_Status_ID` int NOT NULL,
  PRIMARY KEY (`Drug_ID`),
  KEY `Generic_ID` (`Generic_ID`),
  KEY `Therapeutic_Class_ID` (`Therapeutic_Class_ID`),
  KEY `Dosage_Form_ID` (`Dosage_Form_ID`),
  KEY `Regulatory_Status_ID` (`Regulatory_Status_ID`),
  CONSTRAINT `drug_ibfk_1` FOREIGN KEY (`Generic_ID`) REFERENCES `generic_drug` (`Generic_ID`),
  CONSTRAINT `drug_ibfk_2` FOREIGN KEY (`Therapeutic_Class_ID`) REFERENCES `therapeutic_class` (`Therapeutic_Class_ID`),
  CONSTRAINT `drug_ibfk_3` FOREIGN KEY (`Dosage_Form_ID`) REFERENCES `dosage_form` (`Dosage_Form_ID`),
  CONSTRAINT `drug_ibfk_4` FOREIGN KEY (`Regulatory_Status_ID`) REFERENCES `regulatory_status` (`Regulatory_Status_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug`
--

LOCK TABLES `drug` WRITE;
/*!40000 ALTER TABLE `drug` DISABLE KEYS */;
INSERT INTO `drug` VALUES (1,'Tylenol',1,1,1,1),(2,'Advil',2,5,1,1),(3,'Amoxil',3,2,2,1),(4,'Glucophage',4,3,1,1),(5,'Prinivil',5,4,1,1),(6,'TestDrug_Updated',1,1,1,1),(7,'Panadol',1,1,1,1),(8,'Aspirin',1,1,1,1),(10,'Zithromax',3,2,2,1);
/*!40000 ALTER TABLE `drug` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `After_Drug_Insert` AFTER INSERT ON `drug` FOR EACH ROW BEGIN
    INSERT INTO Drug_Audit_Log (Drug_ID, Brand_Name, Action, Action_Time)
    VALUES (NEW.Drug_ID, NEW.Brand_Name, 'INSERT', NOW());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `Before_Drug_Update` BEFORE UPDATE ON `drug` FOR EACH ROW BEGIN
    IF OLD.Brand_Name != NEW.Brand_Name THEN
        INSERT INTO Drug_Audit_Log (Drug_ID, Brand_Name, Action, Action_Time)
        VALUES (OLD.Drug_ID,
                CONCAT('Changed from: ', OLD.Brand_Name, ' to: ', NEW.Brand_Name),
                'UPDATE',
                NOW());
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `Before_Drug_Delete` BEFORE DELETE ON `drug` FOR EACH ROW BEGIN
    DECLARE v_status VARCHAR(50);
    SELECT Status_Name INTO v_status
    FROM Regulatory_Status
    WHERE Regulatory_Status_ID = OLD.Regulatory_Status_ID;
    IF v_status = 'Approved' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete an Approved drug from the database';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `drug_active_ingredient`
--

DROP TABLE IF EXISTS `drug_active_ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug_active_ingredient` (
  `Drug_ID` int NOT NULL,
  `Ingredient_ID` int NOT NULL,
  `Strength` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Drug_ID`,`Ingredient_ID`),
  KEY `Ingredient_ID` (`Ingredient_ID`),
  CONSTRAINT `drug_active_ingredient_ibfk_1` FOREIGN KEY (`Drug_ID`) REFERENCES `drug` (`Drug_ID`),
  CONSTRAINT `drug_active_ingredient_ibfk_2` FOREIGN KEY (`Ingredient_ID`) REFERENCES `active_ingredient` (`Ingredient_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug_active_ingredient`
--

LOCK TABLES `drug_active_ingredient` WRITE;
/*!40000 ALTER TABLE `drug_active_ingredient` DISABLE KEYS */;
INSERT INTO `drug_active_ingredient` VALUES (1,1,'500mg'),(2,2,'200mg'),(3,3,'500mg'),(4,4,'500mg'),(5,5,'10mg'),(7,1,'650mg'),(8,1,'325mg'),(10,3,'250mg');
/*!40000 ALTER TABLE `drug_active_ingredient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drug_audit_log`
--

DROP TABLE IF EXISTS `drug_audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug_audit_log` (
  `Log_ID` int NOT NULL AUTO_INCREMENT,
  `Drug_ID` int DEFAULT NULL,
  `Brand_Name` varchar(200) DEFAULT NULL,
  `Action` varchar(50) DEFAULT NULL,
  `Action_Time` datetime DEFAULT NULL,
  PRIMARY KEY (`Log_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug_audit_log`
--

LOCK TABLES `drug_audit_log` WRITE;
/*!40000 ALTER TABLE `drug_audit_log` DISABLE KEYS */;
INSERT INTO `drug_audit_log` VALUES (1,6,'TestDrug','INSERT','2026-04-13 10:34:26'),(2,6,'Changed from: TestDrug to: TestDrug_Updated','UPDATE','2026-04-13 10:35:15'),(3,7,'Panadol','INSERT','2026-04-13 10:37:36'),(4,8,'Aspirin','INSERT','2026-04-13 11:00:21'),(6,1,'Changed from: Tylenol to: Tylenol Extra','UPDATE','2026-04-13 11:03:46'),(7,1,'Changed from: Tylenol Extra to: Tylenol','UPDATE','2026-04-13 11:03:46'),(8,10,'Zithromax','INSERT','2026-04-13 11:10:21');
/*!40000 ALTER TABLE `drug_audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drug_compound`
--

DROP TABLE IF EXISTS `drug_compound`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug_compound` (
  `Drug_ID` int NOT NULL,
  `Compound_ID` int NOT NULL,
  PRIMARY KEY (`Drug_ID`,`Compound_ID`),
  KEY `Compound_ID` (`Compound_ID`),
  CONSTRAINT `drug_compound_ibfk_1` FOREIGN KEY (`Drug_ID`) REFERENCES `drug` (`Drug_ID`),
  CONSTRAINT `drug_compound_ibfk_2` FOREIGN KEY (`Compound_ID`) REFERENCES `compound` (`Compound_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug_compound`
--

LOCK TABLES `drug_compound` WRITE;
/*!40000 ALTER TABLE `drug_compound` DISABLE KEYS */;
INSERT INTO `drug_compound` VALUES (1,1),(2,2),(3,3),(4,4),(5,5);
/*!40000 ALTER TABLE `drug_compound` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drug_contraindication`
--

DROP TABLE IF EXISTS `drug_contraindication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug_contraindication` (
  `Drug_ID` int NOT NULL,
  `Contraindication_ID` int NOT NULL,
  PRIMARY KEY (`Drug_ID`,`Contraindication_ID`),
  KEY `Contraindication_ID` (`Contraindication_ID`),
  CONSTRAINT `drug_contraindication_ibfk_1` FOREIGN KEY (`Drug_ID`) REFERENCES `drug` (`Drug_ID`),
  CONSTRAINT `drug_contraindication_ibfk_2` FOREIGN KEY (`Contraindication_ID`) REFERENCES `contraindication` (`Contraindication_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug_contraindication`
--

LOCK TABLES `drug_contraindication` WRITE;
/*!40000 ALTER TABLE `drug_contraindication` DISABLE KEYS */;
INSERT INTO `drug_contraindication` VALUES (1,1),(2,2),(4,2),(3,4),(5,5);
/*!40000 ALTER TABLE `drug_contraindication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drug_inactive_ingredient`
--

DROP TABLE IF EXISTS `drug_inactive_ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug_inactive_ingredient` (
  `Drug_ID` int NOT NULL,
  `Excipient_ID` int NOT NULL,
  PRIMARY KEY (`Drug_ID`,`Excipient_ID`),
  KEY `Excipient_ID` (`Excipient_ID`),
  CONSTRAINT `drug_inactive_ingredient_ibfk_1` FOREIGN KEY (`Drug_ID`) REFERENCES `drug` (`Drug_ID`),
  CONSTRAINT `drug_inactive_ingredient_ibfk_2` FOREIGN KEY (`Excipient_ID`) REFERENCES `inactive_ingredient` (`Excipient_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug_inactive_ingredient`
--

LOCK TABLES `drug_inactive_ingredient` WRITE;
/*!40000 ALTER TABLE `drug_inactive_ingredient` DISABLE KEYS */;
INSERT INTO `drug_inactive_ingredient` VALUES (1,1),(3,1),(5,1),(2,2),(1,3),(2,4),(4,5);
/*!40000 ALTER TABLE `drug_inactive_ingredient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drug_interaction`
--

DROP TABLE IF EXISTS `drug_interaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug_interaction` (
  `Interaction_ID` int NOT NULL AUTO_INCREMENT,
  `Drug1_ID` int NOT NULL,
  `Drug2_ID` int NOT NULL,
  `Interaction_Description` varchar(1000) NOT NULL,
  PRIMARY KEY (`Interaction_ID`),
  KEY `Drug1_ID` (`Drug1_ID`),
  KEY `Drug2_ID` (`Drug2_ID`),
  CONSTRAINT `drug_interaction_ibfk_1` FOREIGN KEY (`Drug1_ID`) REFERENCES `drug` (`Drug_ID`),
  CONSTRAINT `drug_interaction_ibfk_2` FOREIGN KEY (`Drug2_ID`) REFERENCES `drug` (`Drug_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug_interaction`
--

LOCK TABLES `drug_interaction` WRITE;
/*!40000 ALTER TABLE `drug_interaction` DISABLE KEYS */;
INSERT INTO `drug_interaction` VALUES (1,1,2,'May increase risk of liver damage when taken together'),(2,2,4,'Ibuprofen may reduce effectiveness of Metformin'),(3,3,5,'No significant interaction reported'),(4,4,5,'May cause hypoglycemia when combined');
/*!40000 ALTER TABLE `drug_interaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `drug_interaction_view`
--

DROP TABLE IF EXISTS `drug_interaction_view`;
/*!50001 DROP VIEW IF EXISTS `drug_interaction_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `drug_interaction_view` AS SELECT 
 1 AS `Drug_One`,
 1 AS `Drug_Two`,
 1 AS `Interaction_Description`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `drug_safety_summary`
--

DROP TABLE IF EXISTS `drug_safety_summary`;
/*!50001 DROP VIEW IF EXISTS `drug_safety_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `drug_safety_summary` AS SELECT 
 1 AS `Brand_Name`,
 1 AS `Generic_Name`,
 1 AS `Side_Effect`,
 1 AS `Severity`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `drug_side_effect`
--

DROP TABLE IF EXISTS `drug_side_effect`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug_side_effect` (
  `Drug_ID` int NOT NULL,
  `SideEffect_ID` int NOT NULL,
  PRIMARY KEY (`Drug_ID`,`SideEffect_ID`),
  KEY `SideEffect_ID` (`SideEffect_ID`),
  CONSTRAINT `drug_side_effect_ibfk_1` FOREIGN KEY (`Drug_ID`) REFERENCES `drug` (`Drug_ID`),
  CONSTRAINT `drug_side_effect_ibfk_2` FOREIGN KEY (`SideEffect_ID`) REFERENCES `side_effect` (`SideEffect_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug_side_effect`
--

LOCK TABLES `drug_side_effect` WRITE;
/*!40000 ALTER TABLE `drug_side_effect` DISABLE KEYS */;
INSERT INTO `drug_side_effect` VALUES (1,1),(4,1),(1,2),(2,3),(5,3),(2,4),(3,5),(1,7);
/*!40000 ALTER TABLE `drug_side_effect` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `generic_drug`
--

DROP TABLE IF EXISTS `generic_drug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `generic_drug` (
  `Generic_ID` int NOT NULL AUTO_INCREMENT,
  `Generic_Name` varchar(200) NOT NULL,
  PRIMARY KEY (`Generic_ID`),
  UNIQUE KEY `Generic_Name` (`Generic_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `generic_drug`
--

LOCK TABLES `generic_drug` WRITE;
/*!40000 ALTER TABLE `generic_drug` DISABLE KEYS */;
INSERT INTO `generic_drug` VALUES (1,'Acetaminophen'),(3,'Amoxicillin'),(6,'Aspirin'),(7,'Cetirizine'),(2,'Ibuprofen'),(5,'Lisinopril'),(4,'Metformin');
/*!40000 ALTER TABLE `generic_drug` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inactive_ingredient`
--

DROP TABLE IF EXISTS `inactive_ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inactive_ingredient` (
  `Excipient_ID` int NOT NULL AUTO_INCREMENT,
  `Excipient_Name` varchar(200) NOT NULL,
  PRIMARY KEY (`Excipient_ID`),
  UNIQUE KEY `Excipient_Name` (`Excipient_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inactive_ingredient`
--

LOCK TABLES `inactive_ingredient` WRITE;
/*!40000 ALTER TABLE `inactive_ingredient` DISABLE KEYS */;
INSERT INTO `inactive_ingredient` VALUES (5,'Lactose Monohydrate'),(3,'Magnesium Stearate'),(1,'Microcrystalline Cellulose'),(4,'Silicon Dioxide'),(2,'Starch');
/*!40000 ALTER TABLE `inactive_ingredient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regulatory_status`
--

DROP TABLE IF EXISTS `regulatory_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regulatory_status` (
  `Regulatory_Status_ID` int NOT NULL AUTO_INCREMENT,
  `Status_Name` varchar(50) NOT NULL,
  PRIMARY KEY (`Regulatory_Status_ID`),
  UNIQUE KEY `Status_Name` (`Status_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regulatory_status`
--

LOCK TABLES `regulatory_status` WRITE;
/*!40000 ALTER TABLE `regulatory_status` DISABLE KEYS */;
INSERT INTO `regulatory_status` VALUES (1,'Approved'),(2,'Investigational'),(4,'Pending Review'),(3,'Withdrawn');
/*!40000 ALTER TABLE `regulatory_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `side_effect`
--

DROP TABLE IF EXISTS `side_effect`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `side_effect` (
  `SideEffect_ID` int NOT NULL AUTO_INCREMENT,
  `Description` varchar(500) NOT NULL,
  `Severity` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`SideEffect_ID`),
  CONSTRAINT `side_effect_chk_1` CHECK ((`Severity` in (_utf8mb4'Mild',_utf8mb4'Moderate',_utf8mb4'Severe')))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `side_effect`
--

LOCK TABLES `side_effect` WRITE;
/*!40000 ALTER TABLE `side_effect` DISABLE KEYS */;
INSERT INTO `side_effect` VALUES (1,'Nausea','Mild'),(2,'Headache','Mild'),(3,'Dizziness','Moderate'),(4,'Stomach Upset','Mild'),(5,'Allergic Reaction','Severe'),(6,'Drowsiness','Mild'),(7,'Dry Mouth','Mild');
/*!40000 ALTER TABLE `side_effect` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `therapeutic_class`
--

DROP TABLE IF EXISTS `therapeutic_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `therapeutic_class` (
  `Therapeutic_Class_ID` int NOT NULL AUTO_INCREMENT,
  `Class_Name` varchar(100) NOT NULL,
  PRIMARY KEY (`Therapeutic_Class_ID`),
  UNIQUE KEY `Class_Name` (`Class_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `therapeutic_class`
--

LOCK TABLES `therapeutic_class` WRITE;
/*!40000 ALTER TABLE `therapeutic_class` DISABLE KEYS */;
INSERT INTO `therapeutic_class` VALUES (1,'Analgesic'),(2,'Antibiotic'),(3,'Antidiabetic'),(6,'Antihistamine'),(4,'Antihypertensive'),(5,'NSAID');
/*!40000 ALTER TABLE `therapeutic_class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `drug_interaction_view`
--

/*!50001 DROP VIEW IF EXISTS `drug_interaction_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `drug_interaction_view` AS select `d1`.`Brand_Name` AS `Drug_One`,`d2`.`Brand_Name` AS `Drug_Two`,`di`.`Interaction_Description` AS `Interaction_Description` from ((`drug_interaction` `di` join `drug` `d1` on((`di`.`Drug1_ID` = `d1`.`Drug_ID`))) join `drug` `d2` on((`di`.`Drug2_ID` = `d2`.`Drug_ID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `drug_safety_summary`
--

/*!50001 DROP VIEW IF EXISTS `drug_safety_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `drug_safety_summary` AS select `d`.`Brand_Name` AS `Brand_Name`,`gd`.`Generic_Name` AS `Generic_Name`,`se`.`Description` AS `Side_Effect`,`se`.`Severity` AS `Severity` from (((`drug` `d` join `generic_drug` `gd` on((`d`.`Generic_ID` = `gd`.`Generic_ID`))) join `drug_side_effect` `dse` on((`d`.`Drug_ID` = `dse`.`Drug_ID`))) join `side_effect` `se` on((`dse`.`SideEffect_ID` = `se`.`SideEffect_ID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21 11:54:25
