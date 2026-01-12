# Entity Relationship Diagram (ERD) Design Guide

## Key Question: Can a Reference Table be an Entity?

**YES!** Each reference table is a separate entity in your ERD.

## Understanding Your System Structure

### What "Reference Tables" Actually Means

In your system, "Reference Tables" (from the navbar) is **NOT a single entity**. It's a **logical category/grouping** used for UI organization. In ERD terms, each reference table is its own separate entity:

1. **Action Required** (`action_required`) - Entity
2. **Action Officer** (`action_officer`) - Entity (also your User entity)
3. **Action Taken** (`action_taken`) - Entity
4. **Document Type** (`document_type`) - Entity
5. **Document Action Required Days** (`document_action_required_days`) - Entity (junction/relationship table)
6. **Office** (`office`) - Entity
7. **Region** (`region`) - Entity
8. **User Levels** - Entity (if you have a separate table, otherwise it's an attribute)

### Important Notes

1. **"Reference Tables" is NOT an entity** - It's just a UI grouping label
2. **Each reference table IS an entity** - Each table gets its own box in the ERD
3. **Users = Action Officer** - Your `action_officer` table appears to BE your user table (it has employee_code, password, user_level)

## How to Structure Your ERD

### Option 1: Standard ERD (Recommended)

Model each table as a separate entity:

```
┌─────────────────┐
│  Action Officer │ ◄─── This is your USER entity
│  (Users)        │
└────────┬────────┘
         │
         │ creates/manages
         │
┌────────▼──────────────────────────────────┐
│             Document                      │
│  (Main entity - your documents table)     │
└────────┬──────────────────────────────────┘
         │
         │ references
         │
    ┌────┴────┬────────────┬──────────────┬─────────┐
    │         │            │              │         │
┌───▼───┐ ┌───▼───┐ ┌─────▼────┐ ┌──────▼───┐ ┌───▼───┐
│Action │ │Action │ │Document  │ │  Office  │ │Region │
│Required│ │ Taken │ │  Type    │ │          │ │       │
└───────┘ └───────┘ └──────────┘ └──────────┘ └───────┘

┌─────────────────────────────────────────┐
│ Document Action Required Days           │
│ (Junction table connecting              │
│  Document Type + Action Required)       │
└─────────────────────────────────────────┘
```

### Option 2: Grouped by Category (For Documentation)

You can **visually group** reference tables with a dashed box labeled "Reference Tables" for documentation purposes, but each table inside is still its own entity:

```
┌─────────────────────────────────────────────────────┐
│            Reference Tables (Category)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Action   │ │ Document │ │  Office  │           │
│  │ Required │ │   Type   │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Action   │ │  Region  │ │   ...    │           │
│  │  Taken   │ │          │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────┘
         │
         │ (each connects to Documents)
         │
┌────────▼────────┐
│    Document     │
└─────────────────┘
```

**Important:** The dashed box is just visual grouping - NOT an entity itself!

## User Connection Pattern

### Users Connect to Reference Tables - How?

Users (Action Officers) don't connect to "Reference Tables" as a single entity. Instead:

1. **Users ARE in a reference table** - `action_officer` table contains users
2. **Users can manage/modify reference tables** - This is a permission/access relationship (not a database FK)
3. **Documents connect to users** - Documents are created by/managed by users (action_officer)

### Recommended Pattern:

```
┌──────────────────┐
│ Action Officer   │ ◄─── User/Employee entity
│ (Users)          │
└────────┬─────────┘
         │
         │ 1) creates/manages
         │
    ┌────┴─────────────────────┐
    │                          │
┌───▼────────┐          ┌──────▼────────┐
│  Document  │          │ Reference     │
│            │          │ Tables        │
│  - created │          │ (managed by)  │
│    by user │          │ users         │
└────────────┘          └───────────────┘
    │
    │ references (FK)
    │
    ├──► Action Required
    ├──► Document Type
    ├──► Office
    └──► ...
```

## Document Entity Relationships

Documents typically reference multiple reference tables via foreign keys:

- `document_type` → references `document_type` table
- `action_required` → references `action_required` table
- `office` → references `office` table
- `action_officer` → references `action_officer` table (user who created it)
- etc.

## Junction/Relationship Tables

Some reference tables connect other reference tables:

- **`document_action_required_days`** - Connects `document_type` + `action_required` with additional data (required_days)
- **`office`** - May reference `region`

These are still entities, just relationship/junction tables.

## Best Practices for Your ERD

1. ✅ **Each table = One entity** in the ERD
2. ✅ **Show actual foreign key relationships** between entities
3. ✅ **Use different shapes/colors** to distinguish:
   - Main entities (Document, Action Officer)
   - Reference/Lookup entities (Action Required, Document Type, etc.)
   - Junction/Relationship entities (Document Action Required Days)
4. ✅ **Label cardinality** (1:1, 1:many, many:many)
5. ❌ **Don't create a "Reference Tables" entity** - it's just a category
6. ❌ **Don't connect User to "Reference Tables"** - connect to specific entities

## Example ERD Cardinalities

```
Action Officer (User)
    │
    │ (1:many)
    │ creates
    ▼
Document
    │
    │ (many:1) references
    ├──► Document Type
    ├──► Action Required
    ├──► Office
    └──► Action Officer (created by)

Document Type ──┬── (many:many) ──► Action Required
                │
                │ via junction table:
                ▼
        Document Action Required Days
```

## Document Table Attributes

Based on the codebase analysis, here are all the attributes for the **Document** table entity:

### Primary Key
- **`id`** (BIGSERIAL) - Primary key, unique identifier

### Control Numbers
- **`documentControlNo`** (TEXT) - Document control number
- **`routeNo`** (TEXT) - Route number for document routing
- **`officeControlNo`** (TEXT) - Office control number

### Core Document Information
- **`subject`** (TEXT, NOT NULL) - Document subject/title (Required)
- **`documentType`** (TEXT) - Type of document (FK → `document_type` table)
- **`sourceType`** (TEXT) - Source type: "Internal" or "External"

### Originating Information (Conditional based on sourceType)
**For Internal Sources:**
- **`internalOriginatingOffice`** (TEXT, NOT NULL) - Internal originating office (Required if Internal)
- **`internalOriginatingEmployee`** (TEXT, NOT NULL) - Internal originating employee (Required if Internal)

**For External Sources:**
- **`externalOriginatingOffice`** (TEXT) - External originating office
- **`externalOriginatingEmployee`** (TEXT, NOT NULL) - External originating employee (Required if External)

### Document Details
- **`noOfPages`** (INTEGER/TEXT) - Number of pages in the document
- **`attachedDocumentFilename`** (TEXT) - Filename of attached document
- **`attachmentList`** (TEXT) - List of attachments (comma-separated or JSON)

### Reference Documents
- **`referenceDocumentControlNo1`** (TEXT) - Reference document control number 1
- **`referenceDocumentControlNo2`** (TEXT) - Reference document control number 2
- **`referenceDocumentControlNo3`** (TEXT) - Reference document control number 3
- **`referenceDocumentControlNo4`** (TEXT) - Reference document control number 4
- **`referenceDocumentControlNo5`** (TEXT) - Reference document control number 5

### User and Tracking
- **`userid`** (TEXT) - User ID who created/manages the document (FK → `action_officer` table)
- **`inSequence`** (TEXT) - Sequence number for document ordering
- **`remarks`** (TEXT, NOT NULL) - Remarks or additional notes (Required)

### Metadata (Typical Database Fields)
- **`created_at`** (TIMESTAMP WITH TIME ZONE) - Timestamp when document was created
- **`updated_at`** (TIMESTAMP WITH TIME ZONE) - Timestamp when document was last updated

### Potential Additional Fields (Based on System Requirements)
- **`status`** (TEXT) - Document status (e.g., "Pending", "Sent", "Received", "Completed")
- **`priority`** (TEXT) - Document priority (e.g., "High", "Medium", "Low")
- **`actionRequired`** (TEXT) - Action required (FK → `action_required` table)
- **`actionTaken`** (TEXT) - Action taken (FK → `action_taken` table)
- **`office`** (TEXT) - Office assignment (FK → `office` table)
- **`region`** (TEXT) - Region assignment (FK → `region` table)
- **`actionOfficer`** (TEXT) - Assigned action officer (FK → `action_officer` table)

### ERD Representation

```
┌─────────────────────────────────────────────┐
│              Document                       │
├─────────────────────────────────────────────┤
│ PK  id                                      │
│     documentControlNo                       │
│     routeNo                                 │
│     officeControlNo                         │
│     subject (NOT NULL)                      │
│     documentType (FK → document_type)      │
│     sourceType                              │
│     internalOriginatingOffice              │
│     internalOriginatingEmployee             │
│     externalOriginatingOffice              │
│     externalOriginatingEmployee            │
│     noOfPages                               │
│     attachedDocumentFilename                │
│     attachmentList                          │
│     referenceDocumentControlNo1             │
│     referenceDocumentControlNo2             │
│     referenceDocumentControlNo3             │
│     referenceDocumentControlNo4             │
│     referenceDocumentControlNo5             │
│     userid (FK → action_officer)            │
│     inSequence                              │
│     remarks (NOT NULL)                      │
│     created_at                              │
│     updated_at                              │
└─────────────────────────────────────────────┘
```

### Notes on Attributes

1. **Conditional Required Fields**: Some fields are required based on `sourceType`:
   - If `sourceType = "Internal"`: `internalOriginatingOffice` and `internalOriginatingEmployee` are required
   - If `sourceType = "External"`: `externalOriginatingEmployee` is required

2. **Reference Documents**: The system allows up to 5 reference documents stored as separate columns. This could be normalized into a separate junction table in a more normalized design.

3. **Foreign Key Relationships**: 
   - `documentType` → references `document_type` table
   - `userid` → references `action_officer` table (user who created it)
   - Potentially: `actionRequired`, `actionTaken`, `office`, `region`, `actionOfficer` → reference their respective tables

4. **File Attachments**: `attachedDocumentFilename` and `attachmentList` handle file storage references. The actual files are likely stored separately.

## Summary

**Q: Can a Reference Table be an Entity?**  
**A: YES! Each reference table IS an entity.**

**Q: Is "Reference Tables" (the navbar category) an Entity?**  
**A: NO! It's just a logical grouping/category, not a database entity.**

**Q: How do Users connect to Reference Tables?**  
**A: Users (action_officer) can:**
   - Manage/modify reference tables (permission-based, not FK)
   - Be referenced by documents (created_by user)
   - Don't connect to "Reference Tables" as a single entity - connect to specific tables

**Q: How to construct/sort the ERD?**  
**A:**
1. List all actual database tables
2. Each table = one entity box
3. Show relationships with foreign keys
4. Optionally group visually (but not as an entity)
5. Focus on actual database structure, not UI groupings

**Q: What are the attributes for a Document Table?**  
**A: See "Document Table Attributes" section above for complete list of all 25+ attributes.**
