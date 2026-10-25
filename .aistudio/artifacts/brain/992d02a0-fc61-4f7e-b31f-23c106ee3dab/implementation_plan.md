# Implementation Plan - Direct File & PDF Uploads for Courses and Digital Products

Enable course creators and digital publishers to upload cover artwork and PDF documents directly from their device (with drag-and-drop and instant client preview) while maintaining the option to paste external URLs.

## User Decisions & Preferences
1. **Upload Flexibility**: Support both direct device file uploads (with drag-and-drop and live preview) and web link URLs.
2. **Course PDF Scope**: Enable PDF uploads for both course lesson materials and course overview downloadable guides.

---

## Proposed Changes

### 1. Reusable Upload & Media Component (`src/components/MediaUploadField.tsx`)
- Build a dedicated, reusable component handling both image artwork and PDF documents:
  - **Dual Mode Switcher**:
    - **"Upload from Device"**: Drag-and-drop dropzone or "Browse files" button supporting device camera/gallery/finder.
      - Automatically reads files via FileReader into DataURL / Object URL.
      - Extracts file name, calculates human-readable file size (e.g. `12.4 MB`), and detects file format.
    - **"Web Link URL"**: Direct URL input for Unsplash, CDN, or cloud links.
  - **Live Preview & Badge**:
    - Images: Live responsive thumbnail preview with replace and remove buttons.
    - PDFs: Clean document badge displaying file name, format tag (`PDF`), calculated size, and download/preview link.

### 2. Digital Products Modal (`src/components/PublishDigitalProductModal.tsx`)
- Replace the text inputs with `MediaUploadField`:
  - **Cover Artwork**: Upload image file directly or paste URL, with instant cover preview.
  - **PDF Document**: Upload PDF directly from device or paste URL, automatically filling the `file_size` and `file_format` attributes.

### 3. Course Creator (`src/components/CourseCreator.tsx`)
- **Course Thumbnail Artwork**: Replace text input with `MediaUploadField` for uploading course banner art directly from the creator's device.
- **Course Overview Downloads**: Add an overview PDF document upload field in the Course Overview section (for course syllabi, site analysis worksheets, or permaculture tool checklists).
- **Curriculum Lesson Materials**:
  - Replace the raw textarea in the lesson editor with a multi-file PDF uploader.
  - Creators can upload individual lesson PDFs, field checklists, and engineering schematics directly from their computer or phone with instant document badges.

### 4. Data Types (`src/types/index.ts`)
- Update `Course` and `CourseLesson` to support rich document metadata:
  ```ts
  export interface CoursePdfDocument {
    id: string;
    name: string;
    url: string;
    size?: string;
  }
  ```
- Add `overview_pdfs?: CoursePdfDocument[]` to `Course` and `pdf_documents?: CoursePdfDocument[]` to `CourseLesson`.

---

## Verification Plan

### Automated Checks
- Run `compile_applet` to ensure TypeScript compilation passes.
- Run `lint_applet` to guarantee zero ESLint warnings or errors.

### User Flow Walkthrough
1. **Digital Product Upload**:
   - In Learn Hub, switch to "Digital Library" and click "Publish Book / PDF".
   - Drag & drop an image file into the Cover Artwork dropzone and verify the live cover preview updates instantly.
   - Drag & drop a PDF into the PDF dropzone and verify the file name and size are auto-populated.
   - Submit and verify the product appears in the Digital Library with the uploaded image and PDF.
2. **Course Creator Upload**:
   - Navigate to `/learn/create`.
   - Upload a custom course thumbnail image from the device.
   - Upload a course overview PDF guide in the overview section.
   - In the lesson editor, upload a lesson schematic PDF and verify the document badge renders with file name and size.
   - Save or publish the course and verify materials are accessible.
