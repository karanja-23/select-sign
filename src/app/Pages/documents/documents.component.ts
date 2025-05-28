// Updated documents.component.ts with debugging
import { Component, computed, OnInit, signal, Inject, PLATFORM_ID} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OpacityService } from '../../Services/opacity.service';
import { DocumentsService } from '../../Services/documents.service';

import { PdfViewerComponent, SignatureArea } from '../../Components/pdf-viewer/pdf-viewer.component';
interface documentList {
  id: number;
  name: string;
  document: string;
  type: string;
  date_created: string;
  description: string;
}

@Component({
  selector: 'app-documents',
  imports: [CommonModule, PdfViewerComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit {
  documentsList = signal <documentList[]>([]);
  filteredDocs = signal<documentList[]>([]);
  paginatedDocuments = signal<documentList[]>([]);
  
  dataInitialized = signal(false);
  rows = 4;
  currentPage = 1;
  totalPages = 1;

  hoveredRow: any = null;
  isBrowser = false;
  
  // PDF Viewer properties
  selectedDocument: any = null;
  showPdfViewer = false;
  selectedSignatureAreas: SignatureArea[] = [];
  
  opacity = computed(() => this.opacityService.opacity());

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public opacityService: OpacityService,
    private documentService: DocumentsService,
   
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadDocuments();
    }
  }

  async loadDocuments() {
    await this.documentService.getDocuments();
    this.documentsList.set(this.documentService.documents());
    this.filteredDocs.set(this.documentsList());
    this.paginatedDocuments.set(this.filteredDocs());
    this.updatePagination();
    this.dataInitialized.set(true);
  }


  viewDocument(doc: any) {
        
    if (!this.isBrowser) {
      console.log('Not in browser, cannot open PDF viewer');
      return;
    }

    if (doc.document && typeof doc.document === 'string') {
      try {
        // Convert base64 to blob URL
        const base64Data = doc.document;
        const binaryString = atob(base64Data)// decode base64 string to binary string
        const bytes = new Uint8Array(binaryString.length);//Creates a Uint8Array (typed array of 8-bit unsigned integers)
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        
        // Add the blob URL to the document object
        doc.pdfBlobUrl = pdfUrl;
        
      } catch (error) {
        console.error('Error converting base64 to blob:', error);
        return;
      }
    } else if (!doc.file_url && !doc.url && !doc.path && !doc.pdfBlobUrl) {
      console.warn('Document has no PDF data or URL:', doc);
      return;
    }

    this.selectedDocument = doc;
    this.showPdfViewer = true;
    this.selectedSignatureAreas = [];
    
  }


    onSignatureAreaSelected(areas: SignatureArea[]) {
      
      areas.forEach ((area) =>{
        this.selectedSignatureAreas.push(area);
      
      })
      console.log('Signature areas selected:', this.selectedSignatureAreas);
    }



  closePdfViewer() {
    console.log('Closing PDF viewer');
    this.showPdfViewer = false;
    this.selectedDocument = null;
    this.selectedSignatureAreas = [];
  }

  // Existing methods
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      const query = input.value;
      const documents = this.documentsList();
      const filtered = documents.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase())
      );
      this.filteredDocs.set(filtered);
      this.currentPage = 1;
      this.updatePagination();
    }
  }

  updatePagination() {
    const filtered = this.filteredDocs();
    const start = (this.currentPage - 1) * this.rows;
    const end = start + this.rows;
    this.totalPages = Math.ceil(filtered.length / this.rows);
    this.paginatedDocuments.set(filtered.slice(start, end));
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
}