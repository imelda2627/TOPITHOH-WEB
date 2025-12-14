# TOHPITOH - Documentation Complète du Projet

## Table des Matières

1. [Contexte du Projet](#contexte-du-projet)
2. [Vue d'Ensemble](#vue-densemble)
3. [Architecture de la Base de Données](#architecture-de-la-base-de-données)
4. [Modèle de Données Détaillé](#modèle-de-données-détaillé)
5. [Workflows de l'Application](#workflows-de-lapplication)
6. [Fonctionnalités Principales](#fonctionnalités-principales)
7. [Gestion de la Sécurité](#gestion-de-la-sécurité)
8. [Cas d'Usage](#cas-dusage)
9. [API et Endpoints](#api-et-endpoints)
10. [Perspectives et Évolution](#perspectives-et-évolution)

---

## Contexte du Projet

### Problématique

Dans de nombreux pays, particulièrement en Afrique, le secteur de la santé fait face à plusieurs défis majeurs:

- **Fragmentation des données médicales**: Les dossiers médicaux sont dispersés entre différents établissements de santé
- **Manque de continuité des soins**: Les médecins n'ont pas accès à l'historique médical complet des patients
- **Gestion papier inefficace**: Les dossiers physiques peuvent être perdus, endommagés ou difficiles à retrouver
- **Situations d'urgence**: En cas d'urgence, le personnel médical manque d'informations critiques (allergies, groupe sanguin, traitements en cours)
- **Absence de contrôle patient**: Les patients n'ont pas de vue centralisée ni de contrôle sur leurs données médicales
- **Collaboration difficile**: Le partage d'informations entre professionnels de santé est complexe et peu sécurisé

### Solution: TOHPITOH

**TOHPITOH** est une plateforme de **Dossiers Médicaux Électroniques (DME)** qui vise à résoudre ces problématiques en offrant:

- ✅ **Centralisation**: Un seul endroit pour tous les dossiers médicaux d'un patient
- ✅ **Accessibilité contrôlée**: Les patients décident qui peut accéder à leurs données
- ✅ **Sécurité**: Système de permissions granulaires et traçabilité complète
- ✅ **Collaboration**: Facilite les échanges entre médecins, laboratoires et patients
- ✅ **Accès d'urgence**: Mécanisme spécial pour les situations critiques
- ✅ **Mobilité**: Accessible depuis n'importe où via mobile/web

### Vision

Devenir la référence en matière de gestion de dossiers médicaux électroniques en Afrique, en garantissant:
- La souveraineté des patients sur leurs données de santé
- L'amélioration de la qualité des soins par un meilleur partage d'information
- La digitalisation du secteur de la santé
- Le respect des standards internationaux de sécurité et de confidentialité

---

## Vue d'Ensemble

### Qu'est-ce que TOHPITOH?

TOHPITOH est une **application mobile et web de gestion de santé** qui permet à:

#### **Patients**
- De centraliser tous leurs dossiers médicaux en un seul endroit
- De contrôler qui peut accéder à leurs informations médicales
- De visualiser leur historique médical complet
- De gérer leurs prescriptions et analyses de laboratoire
- De fournir un accès d'urgence aux informations critiques

#### **Médecins**
- D'accéder aux dossiers des patients (avec leur autorisation)
- De créer et gérer des consultations, diagnostics et prescriptions
- D'ordonner des analyses de laboratoire
- De consulter l'historique médical pour de meilleurs diagnostics
- De partager des informations avec d'autres professionnels de santé

#### **Laboratoires**
- De recevoir et traiter les demandes d'analyses
- De publier les résultats de tests
- De collaborer avec les médecins prescripteurs

#### **Administrateurs**
- De valider l'identité et les licences des professionnels de santé
- De superviser la plateforme
- De gérer les approbations et la conformité

### Caractéristiques Clés

| Caractéristique | Description |
|----------------|-------------|
| **Plateforme** | Mobile (iOS/Android) + Web |
| **Architecture** | Client-Serveur avec API RESTful |
| **Sécurité** | Authentification, autorisation basée sur les rôles (RBAC), permissions granulaires |
| **Conformité** | Respect de la confidentialité médicale et protection des données personnelles |
| **Disponibilité** | Cloud (tohpitoh-api.onrender.com) |
| **Stockage** | Base de données relationnelle avec support de fichiers (attachments) |

---

## Architecture de la Base de Données

### Diagramme Entité-Relation

L'application repose sur un modèle de données relationnel avec les entités suivantes:

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────┐
│    User     │────────►│  AccessPermission    │◄────────│ Patient │
│  (Base)     │ grants  │  (Permissions)       │         │         │
└─────────────┘         └──────────────────────┘         └─────────┘
      │                           │                             │
      │ Extends                   │                             │
      ├───────────────────────────┼─────────────────────────────┤
      │                           │                             │
      ▼                           ▼                             ▼
┌─────────┐              ┌─────────────┐              ┌──────────────┐
│ Doctor  │─────────────►│MedicalRecord│◄─────────────│ Laboratory   │
└─────────┘   creates    └─────────────┘  processes   └──────────────┘
      │                         │                             │
      │                         │                             │
      ├─────────────────────────┼─────────────────────────────┤
      │                         │                             │
      ▼                         ▼                             ▼
┌──────────────┐         ┌─────────┐
│ Prescription │         │ LabTest │
└──────────────┘         └─────────┘
```

### Relations Principales

1. **User → Patient/Doctor/Laboratory**: Héritage (spécialisation)
2. **User → AccessPermission**: Un utilisateur accorde des permissions (grants_to)
3. **Patient → AccessPermission**: Un patient est le propriétaire des données
4. **Doctor/Laboratory → AccessPermission**: Reçoit des permissions d'accès
5. **Patient → MedicalRecord**: Contient les dossiers médicaux du patient
6. **Doctor → MedicalRecord**: Crée des dossiers médicaux
7. **Doctor → Prescription**: Prescrit des médicaments
8. **Doctor/Laboratory → LabTest**: Ordonne et traite des analyses

---

## Modèle de Données Détaillé

### 1. User (Utilisateur de Base)

Table centrale qui contient tous les utilisateurs de la plateforme.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique (clé primaire) |
| `first_name` | string | Prénom de l'utilisateur |
| `last_name` | string | Nom de famille |
| `email` | string | Email (unique, utilisé pour la connexion) |
| `password` | string | Mot de passe hashé |
| `phone` | integer | Numéro de téléphone |
| `role` | enum | `'user'`, `'patient'`, `'doctor'`, `'laboratory'`, `'admin'` |
| `is_active` | boolean | Compte actif ou désactivé |
| `is_verified` | boolean | Email vérifié |

**Règles métier**:
- L'email doit être unique dans le système
- Le mot de passe doit être hashé (bcrypt, argon2, etc.)
- Le rôle détermine les permissions de base
- Un utilisateur doit vérifier son email pour activer certaines fonctionnalités

---

### 2. Patient (Profil Patient)

Étend la table User avec des informations médicales spécifiques.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique du patient |
| `user_id` | integer | Référence vers User (FK) |
| `date_of_birth` | DATE | Date de naissance |
| `gender` | enum | `'male'`, `'female'`, `'other'` |
| `blood_group` | enum | `'A+'`, `'A-'`, `'B+'`, `'B-'`, `'AB+'`, `'AB-'`, `'O+'`, `'O-'` |
| `genotype` | enum | `'AA'`, `'AS'`, `'AC'`, `'SS'`, `'SC'`, `'CC'`, `'unknown'` |
| `known_allergies` | TEXT | Liste des allergies connues |
| `known_diseases` | TEXT | Liste des maladies chroniques |
| `emergency_accessed` | boolean | Indique si l'accès d'urgence a été utilisé |
| `emergency_accessed_code` | string | Code pour accès d'urgence |

**Informations critiques pour urgences**:
- `blood_group`: Vital pour transfusions
- `known_allergies`: Éviter réactions allergiques
- `known_diseases`: Contexte médical important
- `genotype`: Important pour certaines pathologies (ex: drépanocytose)

**Fonctionnalité d'urgence**:
- Le code d'urgence permet un accès sans permission préalable
- Traçabilité: `emergency_accessed` indique si cette fonction a été utilisée

---

### 3. Doctor (Profil Médecin)

Profil des professionnels de santé.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique du médecin |
| `user_id` | integer | Référence vers User (FK) |
| `specialization` | string | Spécialité médicale (ex: Cardiologie, Pédiatrie) |
| `license_number` | string | Numéro de licence/ordre des médecins |
| `hospital_affiliation` | string | Établissement de rattachement |
| `is_approved` | boolean | Approuvé par l'administrateur |
| `approved_by_admin_id` | integer | ID de l'admin qui a approuvé (FK vers User) |
| `approved_at` | integer | Timestamp d'approbation |

**Processus de validation**:
1. Le médecin s'inscrit avec ses credentials
2. `is_approved` = false par défaut
3. Un administrateur vérifie la licence
4. Approbation: `is_approved` = true, `approved_by_admin_id` et `approved_at` sont renseignés
5. Le médecin peut alors exercer sur la plateforme

**Utilité**:
- Garantit que seuls les vrais professionnels accèdent aux données médicales
- Traçabilité de qui a validé chaque professionnel
- Conformité réglementaire

---

### 4. Laboratory (Profil Laboratoire)

Profil des laboratoires d'analyse médicale.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique du laboratoire |
| `user_id` | integer | Référence vers User (FK) |
| `lab_name` | string | Nom du laboratoire |
| `license_number` | string | Numéro d'agrément du laboratoire |
| `address` | TEXT | Adresse physique |
| `is_approved` | boolean | Approuvé par l'administrateur |
| `approved_by_admin_id` | integer | ID de l'admin qui a approuvé (FK vers User) |
| `approved_at` | integer | Timestamp d'approbation |

**Même processus de validation que les médecins**:
- Vérification de l'agrément
- Validation administrative
- Traçabilité complète

---

### 5. AccessPermission (Gestion des Permissions)

**Table centrale** qui gère le contrôle d'accès aux données des patients.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique de la permission |
| `patient_id` | integer | ID du patient propriétaire des données (FK) |
| `granted_to_id` | integer | ID du médecin/laboratoire qui reçoit l'accès (FK vers User) |
| `granted_by_id` | integer | ID de qui a accordé la permission (FK vers User) |
| `access_type` | enum | `'view'` (lecture seule) ou `'edit'` (modification) |
| `expires_at` | DATE | Date d'expiration de la permission |
| `purpose` | TEXT | Justification/raison de l'accès |
| `is_active` | boolean | Permission active ou révoquée |

**Types d'accès**:

1. **VIEW (Lecture seule)**
   - Consulter les dossiers médicaux
   - Voir les prescriptions et analyses
   - Ne peut PAS modifier ni créer de nouveaux dossiers

2. **EDIT (Modification)**
   - Tous les droits de VIEW
   - Créer de nouveaux MedicalRecords
   - Ajouter des prescriptions
   - Ordonner des analyses de laboratoire

**Scénarios d'utilisation**:

```sql
-- Exemple 1: Patient accorde accès temporaire à un médecin pour consultation
INSERT INTO AccessPermission (
    patient_id = 123,
    granted_to_id = 456,  -- Doctor ID
    granted_by_id = 123,  -- Le patient lui-même
    access_type = 'edit',
    expires_at = '2025-12-13',  -- Expire demain
    purpose = 'Consultation pour douleurs abdominales',
    is_active = true
);

-- Exemple 2: Médecin accorde accès à un autre médecin (2e avis)
INSERT INTO AccessPermission (
    patient_id = 123,
    granted_to_id = 789,  -- Autre médecin
    granted_by_id = 456,  -- Premier médecin
    access_type = 'view',
    expires_at = '2025-12-19',  -- 7 jours
    purpose = 'Demande de second avis médical',
    is_active = true
);
```

**Fonctionnalités de sécurité**:
- Permissions temporaires (expires_at)
- Révocation possible (is_active = false)
- Traçabilité (granted_by_id)
- Justification obligatoire (purpose)

---

### 6. MedicalRecord (Dossier Médical)

Table principale pour stocker tous les documents médicaux.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique du dossier |
| `patient_id` | integer | ID du patient concerné (FK) |
| `doctor_id` | integer | ID du médecin créateur (FK) |
| `laboratory_id` | integer | ID du laboratoire (optionnel, FK) |
| `record_type` | enum | `'prescription'`, `'diagnosis'`, `'consultation'`, `'other'` |
| `title` | string | Titre du dossier |
| `description` | TEXT | Description détaillée |
| `date` | DATE | Date du document |
| `attachment_url` | string | URL vers fichier joint (PDF, image, etc.) |
| `is_shared` | boolean | Dossier partagé avec d'autres médecins |
| `shared_until` | DATE | Date de fin de partage |

**Types de dossiers**:

1. **PRESCRIPTION**
   - Ordonnances médicamenteuses
   - Lien vers table Prescription pour détails

2. **DIAGNOSIS**
   - Diagnostics médicaux
   - Résultats d'examens cliniques

3. **CONSULTATION**
   - Notes de consultation
   - Observations du médecin

4. **OTHER**
   - Certificats médicaux
   - Comptes-rendus opératoires
   - Documents divers

**Partage de dossiers**:
- `is_shared = true`: Visible par tous les médecins ayant une permission active
- `shared_until`: Date d'expiration du partage
- Utile pour les cas nécessitant plusieurs spécialistes

**Pièces jointes**:
- `attachment_url`: Stockage des PDFs, images, scans
- Formats supportés: PDF, JPEG, PNG, DICOM (imagerie médicale)

---

### 7. Prescription (Ordonnance)

Détails des prescriptions médicamenteuses.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique |
| `patient_id` | integer | ID du patient (FK) |
| `doctor_id` | integer | ID du médecin prescripteur (FK) |
| `medication_name` | string | Nom du médicament |
| `dosage` | string | Dosage (ex: "500mg", "2 comprimés") |
| `frequency` | string | Fréquence (ex: "3 fois/jour", "matin et soir") |
| `duration` | string | Durée du traitement (ex: "7 jours", "1 mois") |
| `prescribed_date` | DATE | Date de prescription |
| `end_date` | DATE | Date de fin du traitement |
| `instructions` | TEXT | Instructions spéciales |
| `is_active` | boolean | Traitement en cours |

**Exemple d'utilisation**:

```json
{
  "patient_id": 123,
  "doctor_id": 456,
  "medication_name": "Amoxicilline",
  "dosage": "500mg",
  "frequency": "3 fois par jour",
  "duration": "7 jours",
  "prescribed_date": "2025-12-12",
  "end_date": "2025-12-19",
  "instructions": "À prendre après les repas avec un grand verre d'eau",
  "is_active": true
}
```

**Fonctionnalités**:
- Historique complet des traitements
- Détection des interactions médicamenteuses possibles
- Rappels pour le patient (notifications mobiles)
- Renouvellement d'ordonnance facilité

---

### 8. LabTest (Analyse de Laboratoire)

Gestion des analyses et tests de laboratoire.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique |
| `patient_id` | integer | ID du patient (FK) |
| `doctor_id` | integer | ID du médecin prescripteur (FK) |
| `laboratory_id` | integer | ID du laboratoire exécutant (FK) |
| `test_name` | string | Nom de l'analyse (ex: "NFS", "Glycémie") |
| `status` | enum | `'pending'`, `'in_progress'`, `'completed'` |
| `results` | TEXT | Résultats textuels de l'analyse |
| `result_file_url` | string | URL vers PDF/image des résultats |
| `doctor_interpretation` | TEXT | Interprétation du médecin |
| `ordered_date` | DATE | Date de prescription |
| `completed_date` | DATE | Date de réalisation |

**Cycle de vie d'une analyse**:

```
1. ORDERED (pending)
   └─> Doctor crée LabTest
       - test_name = "Numération Formule Sanguine"
       - status = 'pending'
       - ordered_date = aujourd'hui

2. IN_PROGRESS
   └─> Laboratory commence l'analyse
       - status = 'in_progress'
       - Prélèvement et analyse

3. COMPLETED
   └─> Laboratory publie les résultats
       - results = "Hémoglobine: 14g/dL, Leucocytes: 7000/mm³, ..."
       - result_file_url = "https://storage.../nfs_patient123.pdf"
       - status = 'completed'
       - completed_date = aujourd'hui

4. INTERPRETED
   └─> Doctor analyse et interprète
       - doctor_interpretation = "Valeurs normales, pas d'anémie"
```

**Types d'analyses courantes**:
- NFS (Numération Formule Sanguine)
- Glycémie
- Bilan hépatique
- Bilan rénal
- Sérologies
- Analyses d'urine
- Imagerie (Radiographie, Scanner, IRM)

---

## Workflows de l'Application

### Workflow 1: Inscription et Authentification

#### A. Inscription Patient

```
┌─────────────────────────────────────────────────────────┐
│ 1. INSCRIPTION                                          │
│    POST /api/auth/register                              │
│    Body: {                                              │
│      "first_name": "Jean",                              │
│      "last_name": "Dupont",                             │
│      "email": "jean.dupont@email.com",                  │
│      "password": "SecureP@ss123",                       │
│      "phone": "+22500000000",                           │
│      "role": "patient"                                  │
│    }                                                    │
│                                                         │
│    Résultat:                                            │
│    - Création User (is_verified=false, is_active=true)  │
│    - Création Patient avec user_id                      │
│    - Envoi email de vérification                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. VÉRIFICATION EMAIL                                   │
│    GET /api/auth/verify-email?token=xyz123              │
│                                                         │
│    Résultat:                                            │
│    - is_verified = true                                 │
│    - Accès complet aux fonctionnalités                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. COMPLÉTER PROFIL MÉDICAL                             │
│    PUT /api/patients/profile                            │
│    Body: {                                              │
│      "date_of_birth": "1990-05-15",                     │
│      "gender": "male",                                  │
│      "blood_group": "A+",                               │
│      "genotype": "AA",                                  │
│      "known_allergies": "Pénicilline, Arachides",       │
│      "known_diseases": "Hypertension"                   │
│    }                                                    │
│                                                         │
│    Résultat:                                            │
│    - Profil patient complet                             │
│    - Génération emergency_accessed_code                 │
└─────────────────────────────────────────────────────────┘
```

#### B. Inscription Médecin/Laboratoire

```
┌─────────────────────────────────────────────────────────┐
│ 1. INSCRIPTION MÉDECIN                                  │
│    POST /api/auth/register                              │
│    Body: {                                              │
│      "first_name": "Dr. Marie",                         │
│      "last_name": "Martin",                             │
│      "email": "dr.martin@hospital.com",                 │
│      "password": "SecureP@ss123",                       │
│      "phone": "+22500000001",                           │
│      "role": "doctor",                                  │
│      "specialization": "Cardiologie",                   │
│      "license_number": "MED-2024-00123",                │
│      "hospital_affiliation": "CHU de Lomé"              │
│    }                                                    │
│                                                         │
│    Résultat:                                            │
│    - Création User                                      │
│    - Création Doctor (is_approved=false)                │
│    - Notification aux admins pour validation            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. VALIDATION ADMINISTRATEUR                            │
│    Admin vérifie:                                       │
│    - Authenticité de la licence médicale                │
│    - Identité du médecin                                │
│    - Affiliation hospitalière                           │
│                                                         │
│    PUT /api/admin/doctors/{id}/approve                  │
│    Body: {                                              │
│      "approved": true                                   │
│    }                                                    │
│                                                         │
│    Résultat:                                            │
│    - is_approved = true                                 │
│    - approved_by_admin_id = {admin_id}                  │
│    - approved_at = timestamp                            │
│    - Email de confirmation au médecin                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. MÉDECIN PEUT EXERCER                                 │
│    - Accès aux fonctionnalités médecin                  │
│    - Peut recevoir des permissions patient              │
│    - Peut créer des dossiers médicaux                   │
└─────────────────────────────────────────────────────────┘
```

#### C. Connexion

```
┌─────────────────────────────────────────────────────────┐
│ CONNEXION                                               │
│    POST /api/auth/login                                 │
│    Body: {                                              │
│      "email": "jean.dupont@email.com",                  │
│      "password": "SecureP@ss123"                        │
│    }                                                    │
│                                                         │
│    Résultat:                                            │
│    - Token JWT                                          │
│    - Informations utilisateur (role, nom, etc.)         │
│    - Redirection selon le rôle:                         │
│      * Patient → Dashboard patient                      │
│      * Doctor → Dashboard médecin                       │
│      * Laboratory → Dashboard laboratoire               │
│      * Admin → Dashboard admin                          │
└─────────────────────────────────────────────────────────┘
```

---

### Workflow 2: Gestion des Permissions

#### Scénario: Patient accorde accès à un médecin

```
┌─────────────────────────────────────────────────────────┐
│ 1. PATIENT RECHERCHE UN MÉDECIN                         │
│    GET /api/doctors/search?specialization=Cardiologie   │
│                                                         │
│    Résultat:                                            │
│    - Liste des cardiologues approuvés                   │
│    - Informations: nom, hôpital, note, disponibilité    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. PATIENT ACCORDE PERMISSION                           │
│    POST /api/permissions/grant                          │
│    Body: {                                              │
│      "granted_to_id": 456,  // Doctor ID                │
│      "access_type": "edit",                             │
│      "expires_at": "2025-12-13",                        │
│      "purpose": "Consultation cardiologique"            │
│    }                                                    │
│                                                         │
│    Vérifications:                                       │
│    - granted_to_id est bien un médecin approuvé         │
│    - expires_at est dans le futur                       │
│    - Patient est bien authentifié                       │
│                                                         │
│    Résultat:                                            │
│    - Création AccessPermission                          │
│    - patient_id = {current_user_id}                     │
│    - granted_by_id = {current_user_id}                  │
│    - is_active = true                                   │
│    - Notification au médecin                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. MÉDECIN ACCÈDE AUX DONNÉES                           │
│    GET /api/patients/{patient_id}/medical-records       │
│                                                         │
│    Vérifications automatiques:                          │
│    - AccessPermission existe pour ce médecin            │
│    - is_active = true                                   │
│    - expires_at > aujourd'hui                           │
│    - access_type >= 'view'                              │
│                                                         │
│    Si OK:                                               │
│    - Retourne tous les MedicalRecords du patient        │
│    - Historique des prescriptions                       │
│    - Résultats d'analyses                               │
│                                                         │
│    Si NON:                                              │
│    - Erreur 403 Forbidden                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. RÉVOCATION DE PERMISSION (optionnel)                 │
│    DELETE /api/permissions/{permission_id}              │
│                                                         │
│    Résultat:                                            │
│    - is_active = false                                  │
│    - Médecin perd immédiatement l'accès                 │
│    - Notification au médecin                            │
└─────────────────────────────────────────────────────────┘
```

#### Gestion des permissions temporaires

```
Système automatique de vérification:

┌─────────────────────────────────────────┐
│ Tâche CRON quotidienne (minuit)         │
│ Vérifie toutes les AccessPermission     │
│                                         │
│ Pour chaque permission:                 │
│   IF expires_at < aujourd'hui:          │
│     - is_active = false                 │
│     - Notification au patient           │
│     - Log de l'expiration               │
└─────────────────────────────────────────┘
```

---

### Workflow 3: Consultation Médicale Complète

```
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 1: PRÉPARATION                                    │
│                                                         │
│ Patient a déjà accordé permission "edit" au médecin     │
│ (voir Workflow 2)                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 2: CONSULTATION                                   │
│                                                         │
│ 2.1. Médecin consulte l'historique                      │
│      GET /api/patients/{id}/medical-records             │
│      - Antécédents médicaux                             │
│      - Traitements en cours                             │
│      - Allergies connues                                │
│                                                         │
│ 2.2. Examen clinique (dans le monde réel)               │
│      - Prise de constantes (tension, température, etc.) │
│      - Examen physique                                  │
│      - Interrogatoire du patient                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 3: CRÉATION DU DOSSIER DE CONSULTATION            │
│                                                         │
│ POST /api/medical-records                               │
│ Body: {                                                 │
│   "patient_id": 123,                                    │
│   "record_type": "consultation",                        │
│   "title": "Consultation - Douleurs thoraciques",       │
│   "description": "Patient se plaint de douleurs         │
│                   thoraciques depuis 3 jours.           │
│                   Examen: TA 140/90, FC 85 bpm.         │
│                   Auscultation cardiaque normale.       │
│                   ECG réalisé (voir pièce jointe).",    │
│   "date": "2025-12-12",                                 │
│   "attachment_url": "https://.../ecg_patient123.pdf"    │
│ }                                                       │
│                                                         │
│ Résultat:                                               │
│ - Création MedicalRecord                                │
│ - doctor_id automatiquement renseigné                   │
│ - Notification au patient                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 4: PRESCRIPTION (si nécessaire)                   │
│                                                         │
│ POST /api/prescriptions                                 │
│ Body: {                                                 │
│   "patient_id": 123,                                    │
│   "medications": [                                      │
│     {                                                   │
│       "medication_name": "Aspirine",                    │
│       "dosage": "100mg",                                │
│       "frequency": "1 fois par jour",                   │
│       "duration": "30 jours",                           │
│       "instructions": "À prendre le matin après repas"  │
│     },                                                  │
│     {                                                   │
│       "medication_name": "Atorvastatine",               │
│       "dosage": "20mg",                                 │
│       "frequency": "1 fois par jour",                   │
│       "duration": "90 jours",                           │
│       "instructions": "À prendre le soir"               │
│     }                                                   │
│   ]                                                     │
│ }                                                       │
│                                                         │
│ Résultat:                                               │
│ - Création de 2 Prescription                            │
│ - is_active = true                                      │
│ - Calcul automatique des end_date                       │
│ - Notification au patient avec détails ordonnance       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 5: ORDRE D'ANALYSE (si nécessaire)                │
│                                                         │
│ POST /api/lab-tests/order                               │
│ Body: {                                                 │
│   "patient_id": 123,                                    │
│   "laboratory_id": 789,                                 │
│   "tests": [                                            │
│     {                                                   │
│       "test_name": "Bilan lipidique complet",           │
│       "instructions": "Patient à jeun"                  │
│     },                                                  │
│     {                                                   │
│       "test_name": "Troponine",                         │
│       "instructions": "Urgent"                          │
│     }                                                   │
│   ]                                                     │
│ }                                                       │
│                                                         │
│ Résultat:                                               │
│ - Création de 2 LabTest (status='pending')              │
│ - Notification au patient                               │
│ - Notification au laboratoire                           │
│ - Patient doit accorder permission au laboratoire       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 6: FIN DE CONSULTATION                            │
│                                                         │
│ - Patient reçoit un résumé:                             │
│   * Compte-rendu de consultation                        │
│   * Ordonnance(s) détaillée(s)                          │
│   * Analyses prescrites                                 │
│                                                         │
│ - Patient peut:                                         │
│   * Télécharger l'ordonnance en PDF                     │
│   * Partager avec pharmacie                             │
│   * Accorder permission au laboratoire                  │
└─────────────────────────────────────────────────────────┘
```

---

### Workflow 4: Analyse de Laboratoire

```
┌─────────────────────────────────────────────────────────┐
│ PRÉREQUIS                                               │
│ - Doctor a créé un LabTest (voir Workflow 3)            │
│ - status = 'pending'                                    │
│ - laboratory_id = 789                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 1: PATIENT ACCORDE PERMISSION AU LABORATOIRE      │
│                                                         │
│ POST /api/permissions/grant                             │
│ Body: {                                                 │
│   "granted_to_id": 789,  // Laboratory ID               │
│   "access_type": "edit",                                │
│   "expires_at": "2025-12-19",  // 7 jours               │
│   "purpose": "Réalisation analyses sanguines"           │
│ }                                                       │
│                                                         │
│ Résultat:                                               │
│ - Laboratoire peut accéder aux infos du patient         │
│ - Laboratoire voit les LabTest en attente               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 2: LABORATOIRE CONSULTE LES DEMANDES              │
│                                                         │
│ GET /api/lab-tests/pending                              │
│                                                         │
│ Résultat:                                               │
│ - Liste de tous les LabTest avec status='pending'       │
│ - Pour chaque test:                                     │
│   * patient_id, nom du patient                          │
│   * doctor_id, médecin prescripteur                     │
│   * test_name, instructions                             │
│   * ordered_date                                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 3: PATIENT SE PRÉSENTE AU LABORATOIRE             │
│                                                         │
│ PUT /api/lab-tests/{id}/start                           │
│ Body: {                                                 │
│   "status": "in_progress"                               │
│ }                                                       │
│                                                         │
│ Résultat:                                               │
│ - status = 'in_progress'                                │
│ - Notification au patient et médecin                    │
│                                                         │
│ Dans le monde réel:                                     │
│ - Prélèvement sanguin                                   │
│ - Analyse en laboratoire                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 4: PUBLICATION DES RÉSULTATS                      │
│                                                         │
│ PUT /api/lab-tests/{id}/complete                        │
│ Body: {                                                 │
│   "results": "Cholestérol total: 2.1 g/L (Normal)       │
│               LDL: 1.3 g/L (Normal)                     │
│               HDL: 0.6 g/L (Normal)                     │
│               Triglycérides: 1.0 g/L (Normal)           │
│               Troponine: <0.01 ng/mL (Normal)",         │
│   "result_file_url": "https://.../bilan_lipidique.pdf", │
│   "status": "completed"                                 │
│ }                                                       │
│                                                         │
│ Résultat:                                               │
│ - status = 'completed'                                  │
│ - completed_date = aujourd'hui                          │
│ - Notification immédiate au patient                     │
│ - Notification au médecin prescripteur                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 5: INTERPRÉTATION MÉDICALE                        │
│                                                         │
│ Médecin consulte les résultats:                         │
│ GET /api/lab-tests/{id}                                 │
│                                                         │
│ Médecin ajoute son interprétation:                      │
│ PUT /api/lab-tests/{id}/interpret                       │
│ Body: {                                                 │
│   "doctor_interpretation": "Bilan lipidique normal.     │
│                             Pas de dyslipidémie.        │
│                             Troponine négative excluant │
│                             un infarctus du myocarde.   │
│                             Continuer traitement actuel"│
│ }                                                       │
│                                                         │
│ Résultat:                                               │
│ - doctor_interpretation enregistré                      │
│ - Notification au patient avec interprétation           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 6: PATIENT CONSULTE SES RÉSULTATS                 │
│                                                         │
│ GET /api/patients/me/lab-tests                          │
│                                                         │
│ Patient peut:                                           │
│ - Voir tous ses résultats d'analyses                    │
│ - Télécharger les PDFs                                  │
│ - Lire l'interprétation du médecin                      │
│ - Historique complet des analyses                       │
└─────────────────────────────────────────────────────────┘
```

---

### Workflow 5: Accès d'Urgence

```
┌─────────────────────────────────────────────────────────┐
│ SITUATION D'URGENCE                                     │
│                                                         │
│ Patient arrive inconscient aux urgences                 │
│ - Accident de la route                                  │
│ - Malaise cardiaque                                     │
│ - Coma diabétique                                       │
│ - Etc.                                                  │
│                                                         │
│ ❌ Patient ne peut PAS accorder de permission           │
│ ⚠️  Médecin DOIT accéder aux infos vitales              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 1: IDENTIFICATION DU PATIENT                      │
│                                                         │
│ Plusieurs méthodes possibles:                           │
│ - Carte d'identité dans les affaires                    │
│ - Carte TOHPITOH (avec emergency_code)                  │
│ - Reconnaissance faciale (si implémenté)                │
│ - Recherche par nom/téléphone                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 2: UTILISATION DU CODE D'URGENCE                  │
│                                                         │
│ POST /api/emergency/access                              │
│ Body: {                                                 │
│   "patient_identifier": "jean.dupont@email.com"         │
│                         OU "patient_id": 123,           │
│   "emergency_code": "EMG-123456-ABCD",                  │
│   "reason": "Patient inconscient - Accident voie        │
│              publique - Besoin groupe sanguin et        │
│              allergies pour transfusion urgente",       │
│   "doctor_id": 999  // Médecin urgentiste               │
│ }                                                       │
│                                                         │
│ Vérifications système:                                  │
│ - emergency_code correspond au patient                  │
│ - doctor_id est un médecin approuvé                     │
│ - Raison est fournie (traçabilité)                      │
│                                                         │
│ Résultat:                                               │
│ - emergency_accessed = true (dans table Patient)        │
│ - Log d'accès d'urgence créé                            │
│ - Notification envoyée (si contacts d'urgence définis)  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 3: ACCÈS AUX INFORMATIONS CRITIQUES               │
│                                                         │
│ GET /api/emergency/patient-info/{patient_id}            │
│                                                         │
│ Informations retournées IMMÉDIATEMENT:                  │
│                                                         │
│ {                                                       │
│   "patient": {                                          │
│     "id": 123,                                          │
│     "name": "Jean Dupont",                              │
│     "date_of_birth": "1990-05-15",                      │
│     "age": 35,                                          │
│     "gender": "male",                                   │
│     "blood_group": "A+",  ← CRITIQUE                    │
│     "genotype": "AA",                                   │
│     "known_allergies": "Pénicilline, Arachides", ← CRITIQUE│
│     "known_diseases": "Hypertension, Diabète type 2",← CRITIQUE│
│     "emergency_contact": "+22500000999"                 │
│   },                                                    │
│   "current_medications": [                              │
│     {                                                   │
│       "medication": "Metformine 1000mg",                │
│       "frequency": "2 fois/jour",                       │
│       "start_date": "2025-01-01"                        │
│     },                                                  │
│     {                                                   │
│       "medication": "Ramipril 5mg",                     │
│       "frequency": "1 fois/jour",                       │
│       "start_date": "2024-06-15"                        │
│     }                                                   │
│   ],                                                    │
│   "recent_medical_records": [                           │
│     {                                                   │
│       "date": "2025-11-20",                             │
│       "type": "consultation",                           │
│       "doctor": "Dr. Martin",                           │
│       "summary": "Suivi diabète - Glycémie équilibrée"  │
│     }                                                   │
│   ]                                                     │
│ }                                                       │
│                                                         │
│ ✅ Médecin peut prendre décisions éclairées             │
│    - Éviter allergies connues                           │
│    - Adapter traitement aux pathologies                 │
│    - Transfusion avec bon groupe sanguin                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 4: TRAITEMENT ET DOCUMENTATION                    │
│                                                         │
│ Médecin urgentiste soigne le patient                    │
│                                                         │
│ POST /api/medical-records                               │
│ Body: {                                                 │
│   "patient_id": 123,                                    │
│   "record_type": "consultation",                        │
│   "title": "Prise en charge urgence - AVP",             │
│   "description": "Patient victime AVP. Plaie frontale   │
│                   suturée (10 points). Radiographie     │
│                   thorax normale. Pas de traumatisme    │
│                   crânien. Antibioprophylaxie adaptée   │
│                   (évité pénicilline - allergie connue).│
│                   Patient stable, transféré en service  │
│                   d'observation.",                      │
│   "emergency_access": true                              │
│ }                                                       │
│                                                         │
│ Résultat:                                               │
│ - Dossier d'urgence créé et accessible au patient       │
│ - Marqué comme accès d'urgence                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 5: NOTIFICATION POST-URGENCE                      │
│                                                         │
│ Quand le patient reprend conscience:                    │
│ - Notification de l'accès d'urgence                     │
│ - Détails: qui, quand, pourquoi                         │
│ - Rapport médical disponible                            │
│                                                         │
│ Patient peut:                                           │
│ - Consulter le rapport d'urgence                        │
│ - Voir qui a accédé à ses données                       │
│ - Décider d'accorder permission permanente au médecin   │
│   urgentiste pour suivi                                 │
└─────────────────────────────────────────────────────────┘
```

**Sécurité de l'accès d'urgence**:
- ✅ Traçabilité complète (qui, quand, pourquoi)
- ✅ Justification obligatoire
- ✅ Notification au patient
- ✅ Log auditable par les autorités si nécessaire
- ✅ Limitation aux informations critiques
- ❌ Ne peut PAS être utilisé de façon abusive (logs vérifiables)

---

### Workflow 6: Partage de Dossiers entre Médecins

```
┌─────────────────────────────────────────────────────────┐
│ CONTEXTE                                                │
│                                                         │
│ Patient consulte Médecin A (Généraliste)                │
│ Médecin A veut l'avis du Médecin B (Cardiologue)        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 1: PARTAGE DU DOSSIER                             │
│                                                         │
│ Médecin A partage son dossier de consultation:          │
│                                                         │
│ PUT /api/medical-records/{record_id}/share              │
│ Body: {                                                 │
│   "is_shared": true,                                    │
│   "shared_until": "2025-12-19"  // 7 jours              │
│ }                                                       │
│                                                         │
│ Résultat:                                               │
│ - Ce MedicalRecord devient visible par tous médecins    │
│   ayant une permission active sur ce patient            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 2: PATIENT ACCORDE PERMISSION AU MÉDECIN B        │
│                                                         │
│ POST /api/permissions/grant                             │
│ Body: {                                                 │
│   "granted_to_id": 888,  // Médecin B (Cardiologue)     │
│   "access_type": "view",  ← Lecture seule               │
│   "expires_at": "2025-12-19",                           │
│   "purpose": "Demande d'avis cardiologique"             │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 3: MÉDECIN B CONSULTE                             │
│                                                         │
│ GET /api/patients/{patient_id}/medical-records          │
│                                                         │
│ Médecin B voit:                                         │
│ - Tous les dossiers partagés (is_shared=true)           │
│ - Historique médical complet                            │
│ - Analyses de laboratoire                               │
│ - Prescriptions en cours                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 4: MÉDECIN B DONNE SON AVIS                       │
│                                                         │
│ Option 1: Médecin B ajoute un commentaire               │
│ POST /api/medical-records/{record_id}/comments          │
│ Body: {                                                 │
│   "comment": "ECG montre des signes d'hypertrophie      │
│                ventriculaire gauche. Recommande         │
│                échocardiographie pour confirmer."       │
│ }                                                       │
│                                                         │
│ Option 2: Médecin B crée son propre dossier             │
│ (nécessite permission "edit" au lieu de "view")         │
│ POST /api/medical-records                               │
│ Body: {                                                 │
│   "patient_id": 123,                                    │
│   "record_type": "consultation",                        │
│   "title": "Avis cardiologique",                        │
│   "description": "Analyse de l'ECG et recommandations..." │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 5: MÉDECINS ET PATIENT ONT ACCÈS                  │
│                                                         │
│ - Médecin A voit l'avis de Médecin B                    │
│ - Patient voit tout l'échange                           │
│ - Continuité des soins assurée                          │
└─────────────────────────────────────────────────────────┘
```

---

## Fonctionnalités Principales

### 1. Pour les Patients

#### A. Tableau de Bord Patient

```
┌──────────────────────────────────────────────────────┐
│ TABLEAU DE BORD                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 👤 Jean Dupont | Groupe sanguin: A+ | Âge: 35 ans   │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 📊 RÉSUMÉ                                      │  │
│ │                                                │  │
│ │ • Consultations ce mois: 2                     │  │
│ │ • Prescriptions actives: 3                     │  │
│ │ • Analyses en attente: 1                       │  │
│ │ • Permissions actives: 4                       │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 🔔 NOTIFICATIONS                               │  │
│ │                                                │  │
│ │ • Résultats d'analyse disponibles (2h)         │  │
│ │ • Ordonnance expire dans 3 jours               │  │
│ │ • Rappel: Prise de médicament (8h00)           │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 📋 DOSSIERS RÉCENTS                            │  │
│ │                                                │  │
│ │ 12/12/25 - Consultation Dr. Martin             │  │
│ │            Cardiologie                         │  │
│ │                                                │  │
│ │ 10/12/25 - Analyse Laboratoire BioCare         │  │
│ │            Bilan lipidique - ✅ Normal         │  │
│ │                                                │  │
│ │ 05/12/25 - Prescription Dr. Martin             │  │
│ │            Metformine 1000mg                   │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ [Voir tous les dossiers] [Gérer les permissions]     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### B. Gestion des Permissions

Interface permettant au patient de:
- ✅ Voir toutes les permissions actives et expirées
- ✅ Accorder de nouvelles permissions
- ✅ Révoquer des permissions
- ✅ Modifier la durée d'une permission
- ✅ Voir l'historique d'accès (qui a consulté quoi et quand)

```
Exemple d'interface:

┌──────────────────────────────────────────────────────┐
│ MES PERMISSIONS D'ACCÈS                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🟢 ACTIVES (3)                                       │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ Dr. Marie Martin - Cardiologie                 │  │
│ │ Type: EDIT | Expire: 15/12/25                  │  │
│ │ Raison: Suivi cardiologique post-consultation  │  │
│ │ [Révoquer] [Prolonger]                         │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ Laboratoire BioCare                            │  │
│ │ Type: VIEW | Expire: 20/12/25                  │  │
│ │ Raison: Accès résultats analyses sanguines     │  │
│ │ [Révoquer] [Prolonger]                         │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ 🔴 EXPIRÉES (5)                                      │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ Dr. Jean Kouassi - Généraliste                 │  │
│ │ Type: EDIT | Expiré: 01/12/25                  │  │
│ │ [Renouveler]                                   │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ [+ Accorder nouvelle permission]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### C. Historique Médical

Chronologie complète de tous les événements médicaux:
- Consultations
- Diagnostics
- Prescriptions
- Analyses de laboratoire
- Hospitalisations
- Vaccinations

Avec filtres par:
- Date
- Type de document
- Médecin/Laboratoire
- Mots-clés

#### D. Rappels et Notifications

- 💊 Rappels de prise de médicaments
- 📅 Rappels de rendez-vous
- 📊 Notifications de résultats d'analyses
- ⏰ Alertes de renouvellement d'ordonnance
- 🔔 Notifications d'accès aux dossiers

---

### 2. Pour les Médecins

#### A. Tableau de Bord Médecin

```
┌──────────────────────────────────────────────────────┐
│ TABLEAU DE BORD - Dr. Marie Martin                   │
│ Cardiologie | CHU de Lomé                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 📊 ACTIVITÉ AUJOURD'HUI                        │  │
│ │                                                │  │
│ │ • Patients ayant accordé accès: 12             │  │
│ │ • Consultations créées: 8                      │  │
│ │ • Prescriptions émises: 15                     │  │
│ │ • Analyses prescrites: 6                       │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 🔔 NOTIFICATIONS                               │  │
│ │                                                │  │
│ │ • Nouveaux résultats d'analyses: 3             │  │
│ │ • Nouvelles permissions accordées: 2           │  │
│ │ • Demandes de second avis: 1                   │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 👥 MES PATIENTS (avec permissions actives)     │  │
│ │                                                │  │
│ │ Jean Dupont (35 ans, M)                        │  │
│ │ └─ Permission: EDIT | Expire: 15/12/25         │  │
│ │    [Consulter dossier]                         │  │
│ │                                                │  │
│ │ Ama Kofi (28 ans, F)                           │  │
│ │ └─ Permission: EDIT | Expire: 18/12/25         │  │
│ │    ⚠️  Résultats analyses disponibles          │  │
│ │    [Consulter dossier]                         │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ [Rechercher un patient] [Statistiques]               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### B. Consultation de Dossier Patient

Interface complète montrant:
- ℹ️ Informations démographiques
- 🩸 Informations médicales (groupe sanguin, allergies, maladies)
- 📋 Historique médical chronologique
- 💊 Prescriptions actives
- 📊 Résultats d'analyses
- 📎 Documents joints

#### C. Création de Dossier

Formulaire guidé pour créer:
- Consultation
- Diagnostic
- Prescription
- Ordre d'analyse

Avec:
- Templates pré-remplis
- Suggestions basées sur l'IA (optionnel)
- Validation des interactions médicamenteuses
- Upload de fichiers (PDF, images)

---

### 3. Pour les Laboratoires

#### A. Gestion des Demandes

```
┌──────────────────────────────────────────────────────┐
│ LABORATOIRE BIOCARE - DEMANDES D'ANALYSES            │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Filtres: [En attente] [En cours] [Terminées]        │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 🟡 EN ATTENTE (12)                             │  │
│ │                                                │  │
│ │ ┌──────────────────────────────────────────┐   │  │
│ │ │ Jean Dupont (35 ans)                     │   │  │
│ │ │ Prescrit par: Dr. Martin (Cardiologie)   │   │  │
│ │ │ Tests:                                   │   │  │
│ │ │   • Bilan lipidique complet              │   │  │
│ │ │   • Troponine (⚡ URGENT)                │   │  │
│ │ │ Date prescription: 12/12/25              │   │  │
│ │ │ [Démarrer analyse]                       │   │  │
│ │ └──────────────────────────────────────────┘   │  │
│ │                                                │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 🔵 EN COURS (5)                                │  │
│ │                                                │  │
│ │ Ama Kofi - NFS + Glycémie                      │  │
│ │ [Publier résultats]                            │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### B. Publication de Résultats

Formulaire pour:
- Saisir résultats textuels
- Uploader PDF/images de résultats
- Marquer comme urgent si nécessaire
- Ajouter notes techniques

---

### 4. Pour les Administrateurs

#### A. Validation des Professionnels

```
┌──────────────────────────────────────────────────────┐
│ DEMANDES D'APPROBATION EN ATTENTE                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🩺 MÉDECINS (8)                                      │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ Dr. Kwame Mensah                               │  │
│ │ Spécialité: Pédiatrie                          │  │
│ │ Licence: MED-2025-00789                        │  │
│ │ Hôpital: Hôpital Sylvanus Olympio              │  │
│ │ Email: k.mensah@hospital.tg                    │  │
│ │ Inscrit le: 11/12/25                           │  │
│ │                                                │  │
│ │ [Voir licence scannée] [Vérifier auprès ordre] │  │
│ │                                                │  │
│ │ [✅ Approuver] [❌ Rejeter] [📧 Demander infos]│  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ 🔬 LABORATOIRES (3)                                  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ MediLab Analyse                                │  │
│ │ Agrément: LAB-2025-00123                       │  │
│ │ Adresse: 123 Rue de la Santé, Lomé             │  │
│ │ [Voir documents] [Approuver] [Rejeter]         │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### B. Statistiques et Monitoring

- 📈 Nombre d'utilisateurs par type
- 📊 Activité quotidienne/mensuelle
- 🔍 Logs d'accès d'urgence (audit)
- ⚠️ Détection d'anomalies
- 🌍 Statistiques géographiques

---

## Gestion de la Sécurité

### 1. Authentification

```
┌─────────────────────────────────────────┐
│ MÉTHODES D'AUTHENTIFICATION             │
├─────────────────────────────────────────┤
│                                         │
│ 1. Email + Mot de passe                 │
│    - Mot de passe hashé (bcrypt/argon2) │
│    - Minimum 8 caractères               │
│    - Complexité requise                 │
│                                         │
│ 2. Authentification à 2 facteurs (2FA)  │
│    - SMS OTP                            │
│    - Application TOTP (Google Auth)     │
│    - Obligatoire pour médecins/labs     │
│                                         │
│ 3. Biométrie (mobile)                   │
│    - Empreinte digitale                 │
│    - Reconnaissance faciale             │
│                                         │
│ 4. Tokens JWT                           │
│    - Access token (30 minutes)          │
│    - Refresh token (7 jours)            │
│    - Rotation automatique               │
└─────────────────────────────────────────┘
```

### 2. Autorisation (RBAC - Role-Based Access Control)

```
┌─────────────────────────────────────────────────────┐
│ MATRICE DES PERMISSIONS                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ROLE: PATIENT                                       │
│ ✅ Lire ses propres dossiers                        │
│ ✅ Accorder/révoquer permissions                    │
│ ✅ Gérer son profil médical                         │
│ ❌ Accéder aux dossiers d'autres patients           │
│ ❌ Approuver des médecins                           │
│                                                     │
│ ROLE: DOCTOR                                        │
│ ✅ Lire dossiers patients (avec permission)         │
│ ✅ Créer dossiers médicaux (avec permission EDIT)   │
│ ✅ Prescrire médicaments                            │
│ ✅ Ordonner analyses                                │
│ ❌ Accéder sans permission                          │
│ ❌ Modifier profils patients                        │
│                                                     │
│ ROLE: LABORATORY                                    │
│ ✅ Voir demandes d'analyses (avec permission)       │
│ ✅ Publier résultats                                │
│ ❌ Créer prescriptions                              │
│ ❌ Créer consultations                              │
│                                                     │
│ ROLE: ADMIN                                         │
│ ✅ Approuver médecins/laboratoires                  │
│ ✅ Voir statistiques globales                       │
│ ✅ Accéder aux logs d'audit                         │
│ ❌ Accéder aux dossiers médicaux patients           │
│    (sauf audit/investigation légale)                │
└─────────────────────────────────────────────────────┘
```

### 3. Protection des Données

```
┌─────────────────────────────────────────┐
│ MESURES DE SÉCURITÉ                     │
├─────────────────────────────────────────┤
│                                         │
│ 🔒 CHIFFREMENT                          │
│ • En transit: HTTPS/TLS 1.3             │
│ • Au repos: AES-256                     │
│ • Base de données chiffrée              │
│                                         │
│ 🛡️ PROTECTION APPLICATIVE               │
│ • Rate limiting (anti-bruteforce)       │
│ • CSRF protection                       │
│ • XSS protection                        │
│ • SQL injection prevention (ORM)        │
│                                         │
│ 📝 AUDIT ET TRAÇABILITÉ                 │
│ • Logs de tous les accès                │
│ • Historique des modifications          │
│ • Accès d'urgence tracés                │
│ • Révocations enregistrées              │
│                                         │
│ ⏱️ GESTION DES SESSIONS                 │
│ • Timeout après inactivité (15 min)     │
│ • Déconnexion automatique               │
│ • Sessions limitées par appareil        │
│                                         │
│ 🔐 SECRETS ET CREDENTIALS               │
│ • Variables d'environnement             │
│ • Pas de secrets en dur dans le code    │
│ • Rotation régulière des clés API       │
└─────────────────────────────────────────┘
```

### 4. Conformité Réglementaire

```
┌─────────────────────────────────────────┐
│ CONFORMITÉ                              │
├─────────────────────────────────────────┤
│                                         │
│ ✅ RGPD (si applicable)                 │
│ • Consentement explicite                │
│ • Droit à l'oubli                       │
│ • Portabilité des données               │
│ • Notification de fuite                 │
│                                         │
│ ✅ HIPAA-like (confidentialité médicale)│
│ • Minimisation des données              │
│ • Accès basé sur le besoin              │
│ • Audit trail complet                   │
│ • Durée de rétention définie            │
│                                         │
│ ✅ Standards de santé                   │
│ • HL7 FHIR (interopérabilité)           │
│ • ICD-10 (codification maladies)        │
│ • SNOMED CT (terminologie médicale)     │
└─────────────────────────────────────────┘
```

---

## Cas d'Usage

### Cas d'Usage 1: Suivi de Patient Chronique

**Contexte**: Marie, 45 ans, diabétique type 2 avec hypertension

**Parcours**:

1. **Consultation mensuelle**
   - Permission accordée au médecin traitant (Dr. Kouassi)
   - Dr. Kouassi consulte l'historique: glycémies, tension, poids
   - Ajustement du traitement (Metformine 1000mg → 1500mg)
   - Prescription mise à jour dans l'app

2. **Analyses trimestrielles**
   - Dr. Kouassi ordonne: HbA1c, bilan rénal, bilan lipidique
   - Marie accorde permission au laboratoire
   - Laboratoire publie résultats
   - Dr. Kouassi interprète: HbA1c légèrement élevée (7.2%)

3. **Complication cardiaque**
   - Marie consulte cardiologue (Dr. Martin)
   - Permission temporaire accordée (7 jours)
   - Dr. Martin voit tout l'historique diabète/HTA
   - Diagnostic: début de cardiomyopathie diabétique
   - Ajout traitement cardiologique

4. **Coordination des soins**
   - Dr. Kouassi et Dr. Martin partagent dossiers
   - Suivi coordonné diabète + cœur
   - Marie a une vue complète de tous ses traitements
   - Rappels automatiques pour prises de médicaments

**Bénéfices**:
- ✅ Continuité des soins
- ✅ Pas de perte d'information
- ✅ Détection précoce de complications
- ✅ Coordination entre spécialistes

---

### Cas d'Usage 2: Urgence Vitale

**Contexte**: Accident de moto, patient inconscient

**Parcours**:

1. **Arrivée aux urgences**
   - Patient sans papiers, téléphone cassé
   - Reconnaissance faciale ou recherche par nom
   - Code d'urgence utilisé

2. **Accès informations critiques**
   - Groupe sanguin: O-
   - Allergie: Morphine
   - Traitement anticoagulant en cours
   - Maladie: Hémophilie

3. **Décisions médicales éclairées**
   - Transfusion avec bon groupe (O-)
   - Évitement morphine → utilisation tramadol
   - Attention particulière aux saignements (anticoagulant + hémophilie)
   - Contact famille via numéro d'urgence

4. **Documentation**
   - Dossier d'urgence créé
   - Traçabilité de l'accès d'urgence
   - Patient informé une fois conscient

**Bénéfices**:
- ✅ Sauvé la vie (bon groupe sanguin)
- ✅ Évité choc anaphylactique (allergie morphine)
- ✅ Prise en charge adaptée (hémophilie)

---

### Cas d'Usage 3: Second Avis Médical

**Contexte**: Diagnostic complexe nécessitant expertise

**Parcours**:

1. **Consultation initiale**
   - Patient consulte Dr. A (généraliste)
   - Symptômes: fatigue chronique, perte de poids
   - Dr. A fait analyses: TSH basse, T3/T4 élevées

2. **Demande de second avis**
   - Dr. A partage son dossier de consultation
   - Patient accorde permission à Dr. B (endocrinologue)
   - Permission VIEW (lecture seule) pendant 14 jours

3. **Analyse par spécialiste**
   - Dr. B consulte dossier complet
   - Voit analyses, notes de Dr. A
   - Diagnostic: Maladie de Basedow (hyperthyroïdie)
   - Recommandations spécialisées

4. **Retour au médecin traitant**
   - Dr. A reçoit l'avis de Dr. B
   - Mise en place du traitement recommandé
   - Suivi coordonné

**Bénéfices**:
- ✅ Diagnostic précis
- ✅ Pas de redondance d'examens
- ✅ Collaboration facilitée
- ✅ Patient informé et rassuré

---

## API et Endpoints

### Structure de l'API

```
Base URL: https://tohpitoh-api.onrender.com/api

┌─────────────────────────────────────────┐
│ ENDPOINTS PRINCIPAUX                    │
├─────────────────────────────────────────┤
│                                         │
│ /auth                                   │
│ ├─ POST /register                       │
│ ├─ POST /login                          │
│ ├─ POST /logout                         │
│ ├─ POST /refresh-token                  │
│ ├─ POST /forgot-password                │
│ ├─ POST /reset-password                 │
│ └─ GET  /verify-email                   │
│                                         │
│ /patients                               │
│ ├─ GET    /me                           │
│ ├─ PUT    /me/profile                   │
│ ├─ GET    /me/medical-records           │
│ ├─ GET    /me/prescriptions             │
│ ├─ GET    /me/lab-tests                 │
│ └─ GET    /me/permissions               │
│                                         │
│ /doctors                                │
│ ├─ GET    /search                       │
│ ├─ GET    /{id}                         │
│ ├─ GET    /me/patients                  │
│ └─ PUT    /me/profile                   │
│                                         │
│ /laboratories                           │
│ ├─ GET    /search                       │
│ ├─ GET    /{id}                         │
│ └─ GET    /me/pending-tests             │
│                                         │
│ /permissions                            │
│ ├─ POST   /grant                        │
│ ├─ DELETE /{id}                         │
│ ├─ PUT    /{id}/extend                  │
│ └─ GET    /patient/{patient_id}         │
│                                         │
│ /medical-records                        │
│ ├─ POST   /                             │
│ ├─ GET    /{id}                         │
│ ├─ PUT    /{id}                         │
│ ├─ DELETE /{id}                         │
│ ├─ PUT    /{id}/share                   │
│ └─ GET    /patient/{patient_id}         │
│                                         │
│ /prescriptions                          │
│ ├─ POST   /                             │
│ ├─ GET    /{id}                         │
│ ├─ PUT    /{id}/deactivate              │
│ └─ GET    /patient/{patient_id}/active  │
│                                         │
│ /lab-tests                              │
│ ├─ POST   /order                        │
│ ├─ GET    /{id}                         │
│ ├─ PUT    /{id}/start                   │
│ ├─ PUT    /{id}/complete                │
│ ├─ PUT    /{id}/interpret               │
│ └─ GET    /pending                      │
│                                         │
│ /emergency                              │
│ ├─ POST   /access                       │
│ └─ GET    /patient-info/{patient_id}    │
│                                         │
│ /admin                                  │
│ ├─ GET    /doctors/pending              │
│ ├─ PUT    /doctors/{id}/approve         │
│ ├─ GET    /laboratories/pending         │
│ ├─ PUT    /laboratories/{id}/approve    │
│ ├─ GET    /stats                        │
│ └─ GET    /audit-logs                   │
└─────────────────────────────────────────┘
```

### Exemples de Requêtes

#### 1. Inscription Patient

```http
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@email.com",
  "password": "SecureP@ss123",
  "phone": "+22500000000",
  "role": "patient",
  "date_of_birth": "1990-05-15",
  "gender": "male"
}

Response 201:
{
  "success": true,
  "message": "Utilisateur créé. Vérifiez votre email.",
  "user": {
    "id": 123,
    "email": "jean.dupont@email.com",
    "role": "patient",
    "is_verified": false
  }
}
```

#### 2. Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jean.dupont@email.com",
  "password": "SecureP@ss123"
}

Response 200:
{
  "success": true,
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 1800
  },
  "user": {
    "id": 123,
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@email.com",
    "role": "patient",
    "is_verified": true
  }
}
```

#### 3. Accorder Permission

```http
POST /api/permissions/grant
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "granted_to_id": 456,
  "access_type": "edit",
  "expires_at": "2025-12-19",
  "purpose": "Consultation cardiologique"
}

Response 201:
{
  "success": true,
  "permission": {
    "id": 789,
    "patient_id": 123,
    "granted_to": {
      "id": 456,
      "name": "Dr. Marie Martin",
      "specialization": "Cardiologie"
    },
    "access_type": "edit",
    "expires_at": "2025-12-19T23:59:59Z",
    "is_active": true
  }
}
```

#### 4. Créer Dossier Médical

```http
POST /api/medical-records
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "patient_id": 123,
  "record_type": "consultation",
  "title": "Consultation - Douleurs thoraciques",
  "description": "Patient se plaint de douleurs thoraciques...",
  "date": "2025-12-12",
  "attachment_url": "https://storage.tohpitoh.com/files/ecg_123.pdf"
}

Response 201:
{
  "success": true,
  "medical_record": {
    "id": 999,
    "patient_id": 123,
    "doctor_id": 456,
    "record_type": "consultation",
    "title": "Consultation - Douleurs thoraciques",
    "date": "2025-12-12",
    "created_at": "2025-12-12T10:30:00Z"
  }
}
```

#### 5. Publier Résultats d'Analyse

```http
PUT /api/lab-tests/555/complete
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "results": "Cholestérol total: 2.1 g/L (Normal)\nLDL: 1.3 g/L...",
  "result_file_url": "https://storage.tohpitoh.com/results/bilan_123.pdf",
  "status": "completed"
}

Response 200:
{
  "success": true,
  "lab_test": {
    "id": 555,
    "patient_id": 123,
    "test_name": "Bilan lipidique",
    "status": "completed",
    "completed_date": "2025-12-12T14:00:00Z",
    "result_file_url": "https://storage.tohpitoh.com/results/bilan_123.pdf"
  },
  "notifications_sent": true
}
```

---

## Perspectives et Évolution

### Fonctionnalités Futures

#### Phase 2

1. **Téléconsultation**
   - Visioconférence intégrée
   - Chat médecin-patient
   - Partage d'écran pour examens

2. **Intelligence Artificielle**
   - Aide au diagnostic (suggestions basées sur symptômes)
   - Détection d'interactions médicamenteuses
   - Prédiction de complications (ML)

3. **Wearables et IoT**
   - Intégration avec montres connectées
   - Import automatique de glycémie, tension, etc.
   - Alertes en temps réel

4. **Pharmacie**
   - Module de gestion de pharmacies
   - Vérification de disponibilité médicaments
   - Livraison à domicile

#### Phase 3

1. **Assurance**
   - Intégration avec compagnies d'assurance
   - Remboursements automatisés
   - Devis en ligne

2. **Imagerie Médicale**
   - Visualiseur DICOM intégré
   - Stockage et partage de radiographies, IRM, etc.
   - Annotations collaboratives

3. **Recherche Médicale**
   - Données anonymisées pour études
   - Contribution à la recherche (avec consentement)

4. **Expansion Géographique**
   - Multi-langues (Français, Anglais, Éwé, Twi, etc.)
   - Adaptation réglementaire par pays
   - Partenariats avec hôpitaux régionaux

---

## Technologies Recommandées

### Backend

```
┌─────────────────────────────────────────┐
│ STACK BACKEND                           │
├─────────────────────────────────────────┤
│                                         │
│ Runtime: Node.js / Python               │
│ Framework: Express / FastAPI            │
│ ORM: Prisma / SQLAlchemy                │
│ Database: PostgreSQL                    │
│ Cache: Redis                            │
│ Queue: Bull / Celery                    │
│ Storage: AWS S3 / MinIO                 │
│ Auth: JWT + Passport / OAuth2           │
└─────────────────────────────────────────┘
```

### Frontend Mobile

```
┌─────────────────────────────────────────┐
│ STACK MOBILE                            │
├─────────────────────────────────────────┤
│                                         │
│ Framework: React Native / Flutter       │
│ State: Redux / Zustand / Bloc           │
│ Navigation: React Navigation            │
│ UI: Native Base / Flutter Material      │
│ Push Notifications: FCM                 │
│ Offline: AsyncStorage / SQLite          │
└─────────────────────────────────────────┘
```

### Frontend Web

```
┌─────────────────────────────────────────┐
│ STACK WEB                               │
├─────────────────────────────────────────┤
│                                         │
│ Framework: Next.js / React              │
│ State: Redux / Zustand                  │
│ UI: Tailwind CSS / Material-UI          │
│ Charts: Recharts / Chart.js             │
└─────────────────────────────────────────┘
```

---

## Conclusion

**TOHPITOH** est une solution complète de **Dossiers Médicaux Électroniques** qui:

✅ **Centralise** les données médicales des patients
✅ **Sécurise** avec un système de permissions granulaires
✅ **Facilite** la collaboration entre professionnels de santé
✅ **Protège** la vie privée des patients
✅ **Améliore** la continuité et la qualité des soins
✅ **Digitalise** le secteur de la santé en Afrique

L'application met le **patient au centre**, lui donnant un contrôle total sur ses données médicales tout en garantissant un accès sécurisé aux professionnels de santé autorisés.

Avec son système d'**accès d'urgence**, TOHPITOH peut **sauver des vies** en fournissant des informations critiques lors de situations d'urgence.

---

**Document généré le:** 2025-12-12
**Version:** 1.0
**Projet:** TOHPITOH - Digital Health Platform
